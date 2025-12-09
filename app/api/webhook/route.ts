// app/api/webhook/route.ts
import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { planLimits } from "@/dataUtils/planLimits";
import {
    initializeCreditReset,
    calculateCarryover,
    resetMonthlyCredits,
    shouldResetCredits
} from "@/utils/creditHelpers";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20" as any,
});

// map priceId -> plan tier (use your real price IDs)
function getPlanTier(priceId: string) {
    if (
        priceId === "price_1SXZ4TBEStw3HK5gLIRBc7mU" ||
        priceId === "price_1SXZ5hBEStw3HK5gaahNKeNA"
    ) return "starter";

    if (
        priceId === "price_1SXZ4oBEStw3HK5g47Tp0opH" ||
        priceId === "price_1SXZ8UBEStw3HK5g9aWHhgjT"
    ) return "professional";

    if (
        priceId === "price_1SXZ55BEStw3HK5gciuiffxs" ||
        priceId === "price_1SXZ96BEStw3HK5gDvYT9yPE"
    ) return "business";

    if (
        priceId === "price_1SXZ5IBEStw3HK5gl5n56R3M" ||
        priceId === "price_1SXZ9hBEStw3HK5grxCvv0Qj"
    ) return "scale";

    return "free";
}

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = (await headers()).get("stripe-signature");

        if (!signature) {
            return new Response("Missing Stripe signature", { status: 400 });
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            console.error("❌ Invalid signature:", err.message);
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }

        console.log("🔔 Stripe Event:", event.type);

        // 1) checkout.session.completed -> new subscription created OR plan change
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as any;

            // 🔍 DEBUG: Log the entire session to see what we're receiving
            console.log("📦 Full Session Object:", JSON.stringify(session, null, 2));
            console.log("📦 Session Metadata:", session.metadata);
            console.log("📦 Session Customer:", session.customer);
            console.log("📦 Session Subscription:", session.subscription);

            const userEmail = session.metadata?.email; // Get email from metadata
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            console.log("🔍 Extracted userEmail:", userEmail);
            console.log("🔍 Extracted customerId:", customerId);
            console.log("🔍 Extracted subscriptionId:", subscriptionId);

            if (!userEmail || !subscriptionId) {
                console.error("❌ Missing userEmail or subscriptionId");
                console.error("❌ userEmail:", userEmail);
                console.error("❌ subscriptionId:", subscriptionId);
                return NextResponse.json({ received: true });
            }

            // Fetch current user data to check if this is a plan change or new subscription
            const [currentUser] = await db
                .select({
                    id: Users.id,
                    plan_tier: Users.plan_tier,
                    stripe_subscription_id: Users.stripe_subscription_id,
                    ugc_credits_allowed: Users.ugc_credits_allowed,
                    ugc_credits_used: Users.ugc_credits_used,
                    faceless_credits_allowed: Users.faceless_credits_allowed,
                    faceless_credits_used: Users.faceless_credits_used,
                    next_credit_reset: Users.next_credit_reset,
                    credit_reset_day: Users.credit_reset_day,
                    carryover_ugc: Users.carryover_ugc,
                    carryover_faceless: Users.carryover_faceless,
                    carryover_expiry: Users.carryover_expiry,
                })
                .from(Users)
                .where(eq(Users.email, userEmail));

            // get full subscription
            const subscription = (await stripe.subscriptions.retrieve(
                subscriptionId
            )) as any;

            const priceId = subscription.items.data[0].price.id;
            const planTier = getPlanTier(priceId);
            const limits = planLimits[planTier] ?? { faceless: 0, ugc: 0 };

            const periodStart = subscription.current_period_start
                ? new Date(subscription.current_period_start * 1000)
                : null;
            const periodEnd = subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : null;

            // Check if this is a plan change (upgrade/downgrade) or new subscription
            const isPlanChange = currentUser && currentUser.stripe_subscription_id && currentUser.plan_tier !== planTier;

            let carryoverData: any = {};
            let resetInfo: any = {};

            if (isPlanChange && currentUser.next_credit_reset) {
                // Plan change: Calculate carryover to preserve unused credits
                console.log(`🔄 Plan change detected: ${currentUser.plan_tier} → ${planTier}`);

                const { carryoverAmount: carryUgc, carryoverExpiry: carryUgcExpiry } = calculateCarryover(
                    currentUser.ugc_credits_allowed || 0,
                    currentUser.ugc_credits_used || 0,
                    currentUser.next_credit_reset,
                    currentUser.carryover_ugc || 0,
                    currentUser.carryover_expiry
                );

                const { carryoverAmount: carryFaceless, carryoverExpiry: carryFacelessExpiry } = calculateCarryover(
                    currentUser.faceless_credits_allowed || 0,
                    currentUser.faceless_credits_used || 0,
                    currentUser.next_credit_reset,
                    currentUser.carryover_faceless || 0,
                    currentUser.carryover_expiry
                );

                carryoverData = {
                    carryover_ugc: carryUgc,
                    carryover_faceless: carryFaceless,
                    carryover_expiry: carryUgcExpiry || carryFacelessExpiry || null,
                };

                console.log(`📦 Plan Change Carryover (STACKED): UGC=${carryUgc}, Faceless=${carryFaceless}, Expires=${carryoverData.carryover_expiry?.toISOString()}`);

                // Preserve existing reset day for plan changes
                resetInfo = {
                    credit_reset_day: currentUser.credit_reset_day,
                    next_credit_reset: currentUser.next_credit_reset,
                };
            } else {
                // New subscription: Initialize credit reset tracking
                resetInfo = periodStart ? initializeCreditReset(periodStart) : {
                    credit_reset_day: new Date().getDate(),
                    next_credit_reset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                };

                // New subscription: Clear any existing carryover
                carryoverData = {
                    carryover_ugc: 0,
                    carryover_faceless: 0,
                    carryover_expiry: null,
                };

                console.log("✨ New subscription created");
            }

            const updateData = {
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                stripe_price_id: priceId,
                subscription_status: subscription.status ?? "active",
                subscription_active: subscription.status === "active",
                plan_tier: planTier,

                // Update NEW plan's MONTHLY credit allowance
                ugc_credits_allowed: limits.ugc,
                faceless_credits_allowed: limits.faceless,

                // For new subscriptions, reset used credits to 0
                // For plan changes, preserve current usage
                ...(isPlanChange ? {} : {
                    ugc_credits_used: 0,
                    faceless_credits_used: 0
                }),

                // credit reset tracking
                credit_reset_day: resetInfo.credit_reset_day,
                next_credit_reset: resetInfo.next_credit_reset,

                // carryover data (stacked for plan changes, cleared for new subscriptions)
                carryover_ugc: carryoverData.carryover_ugc ?? 0,
                carryover_faceless: carryoverData.carryover_faceless ?? 0,
                carryover_expiry: carryoverData.carryover_expiry ?? null,

                current_period_start: periodStart,
                current_period_end: periodEnd,
                updated_at: new Date(),
            };

            console.log("📝 PRE-DB UPDATE DATA:", JSON.stringify({
                ...updateData,
                carryover_expiry: updateData.carryover_expiry,
                current_period_start: updateData.current_period_start,
                current_period_end: updateData.current_period_end
            }, null, 2));

            await db
                .update(Users)
                .set(updateData)
                .where(eq(Users.email, userEmail));

            if (isPlanChange) {
                console.log(`✅ Plan changed: ${userEmail} → ${planTier} (reset cycle preserved, day=${currentUser.credit_reset_day})`);
            } else {
                console.log("✅ Subscription created for user with email:", userEmail);
            }
        }

        if (event.type === "customer.subscription.created") {
            const subscription = event.data.object as any;
            const subscriptionId = subscription.id;
            const customerId = subscription.customer as string;
            const priceId = subscription.items.data[0]?.price?.id;

            const planTier = getPlanTier(priceId);
            const limits = planLimits[planTier] ?? { ugc: 0, faceless: 0 };

            // period
            const periodStart = subscription.current_period_start
                ? new Date(subscription.current_period_start * 1000)
                : null;
            const periodEnd = subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : null;

            // find user via customerDetails
            const customer = await stripe.customers.retrieve(customerId);
            const email =
                (customer as any)?.email ??
                (customer as any)?.metadata?.email ??
                null;

            if (!email) {
                console.warn("customer.subscription.created: No email found.");
            } else {
                // initialize reset schedule
                const resetInfo = periodStart
                    ? initializeCreditReset(periodStart)
                    : {
                        credit_reset_day: new Date().getDate(),
                        next_credit_reset: new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000
                        ),
                    };

                await db
                    .update(Users)
                    .set({
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        stripe_price_id: priceId,
                        subscription_status: subscription.status,
                        subscription_active: subscription.status === "active",
                        plan_tier: planTier,

                        ugc_credits_allowed: limits.ugc,
                        ugc_credits_used: 0,
                        faceless_credits_allowed: limits.faceless,
                        faceless_credits_used: 0,

                        credit_reset_day: resetInfo.credit_reset_day,
                        next_credit_reset: resetInfo.next_credit_reset,

                        carryover_ugc: 0,
                        carryover_faceless: 0,
                        carryover_expiry: null,

                        current_period_start: periodStart,
                        current_period_end: periodEnd,
                        updated_at: new Date(),
                    })
                    .where(eq(Users.email, email));

                console.log("✅ customer.subscription.created processed for:", email);
            }
        }


        // 3) invoice.payment_succeeded -> renewal (reset used credits)
        if (event.type === "invoice.payment_succeeded") {
            const invoice = event.data.object as any;
            const subscriptionId = invoice.subscription as string;

            if (subscriptionId) {
                // Fetch current user data to check if reset is needed
                const [currentUser] = await db
                    .select({
                        id: Users.id,
                        ugc_credits_allowed: Users.ugc_credits_allowed,
                        ugc_credits_used: Users.ugc_credits_used,
                        faceless_credits_allowed: Users.faceless_credits_allowed,
                        faceless_credits_used: Users.faceless_credits_used,
                        next_credit_reset: Users.next_credit_reset,
                        credit_reset_day: Users.credit_reset_day,
                        carryover_ugc: Users.carryover_ugc,
                        carryover_faceless: Users.carryover_faceless,
                        carryover_expiry: Users.carryover_expiry,
                    })
                    .from(Users)
                    .where(eq(Users.stripe_subscription_id, subscriptionId));

                const subscription = (await stripe.subscriptions.retrieve(
                    subscriptionId
                )) as any;

                const priceId = subscription.items.data[0].price.id;
                const planTier = getPlanTier(priceId);
                const limits = planLimits[planTier] ?? { faceless: 0, ugc: 0 };

                const periodStart = subscription.current_period_start
                    ? new Date(subscription.current_period_start * 1000)
                    : null;
                const periodEnd = subscription.current_period_end
                    ? new Date(subscription.current_period_end * 1000)
                    : null;

                // Check if we need to reset credits
                const now = new Date();
                let resetData: any = {};

                if (currentUser && shouldResetCredits(currentUser as any, now)) {
                    const reset = resetMonthlyCredits(currentUser as any);
                    resetData = {
                        ugc_credits_used: reset.ugc_credits_used,
                        faceless_credits_used: reset.faceless_credits_used,
                        carryover_ugc: reset.carryover_ugc,
                        carryover_faceless: reset.carryover_faceless,
                        next_credit_reset: reset.next_credit_reset,
                    };
                    console.log("🔄 Monthly credits reset for subscription:", subscriptionId);
                }

                await db
                    .update(Users)
                    .set({
                        subscription_status: "active",
                        subscription_active: true,

                        // apply reset data if needed
                        ...resetData,

                        // ensure allowed credits reflect current plan
                        ugc_credits_allowed: limits.ugc,
                        faceless_credits_allowed: limits.faceless,

                        current_period_start: periodStart,
                        current_period_end: periodEnd,
                        updated_at: new Date(),
                    })
                    .where(eq(Users.stripe_subscription_id, subscriptionId));

                console.log("🎉 Subscription renewed:", subscriptionId);
            }
        }

        // 4) subscription deleted -> canceled
        if (event.type === "customer.subscription.deleted") {
            const subscription = event.data.object as any;

            await db
                .update(Users)
                .set({
                    subscription_active: false,
                    subscription_status: "canceled",
                    plan_tier: "none",

                    // zero out allowed credits
                    ugc_credits_allowed: 0,
                    faceless_credits_allowed: 0,

                    // clear carryover
                    carryover_ugc: 0,
                    carryover_faceless: 0,
                    carryover_expiry: null,

                    updated_at: new Date(),
                })
                .where(eq(Users.stripe_subscription_id, subscription.id));

            console.log("❌ Subscription canceled:", subscription.id);
        }

        // 5) invoice.payment_failed -> mark past_due
        if (event.type === "invoice.payment_failed") {
            const invoice = event.data.object as any;
            const subscriptionId = invoice.subscription as string;

            if (subscriptionId) {
                await db
                    .update(Users)
                    .set({
                        subscription_status: "past_due",
                        subscription_active: false,
                        updated_at: new Date(),
                    })
                    .where(eq(Users.stripe_subscription_id, subscriptionId));

                console.log("⚠️ Payment failed:", subscriptionId);
            }
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("❌ Webhook Handler Error:", err);
        return new Response("Webhook handler failed", { status: 500 });
    }
}
