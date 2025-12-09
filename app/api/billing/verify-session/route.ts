import Stripe from "stripe";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    // Logged-in user
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate body
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // Fetch checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Extract email from all valid locations
    const sessionEmail =
      session.metadata?.email ||
      session.customer_details?.email ||
      session.customer_email ||
      null;

    if (!sessionEmail) {
      return NextResponse.json(
        { error: "Session email not found" },
        { status: 400 }
      );
    }

    // Security check: ensure session belongs to this logged-in user
    if (sessionEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Session does not belong to this user" },
        { status: 403 }
      );
    }

    // Successful verification
    return NextResponse.json({
      status: session.payment_status,
      subscriptionId: session.subscription,
      customerId: session.customer,
      emailVerified: true,
    });
  } catch (error: any) {
    console.error("❌ Session verification failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
