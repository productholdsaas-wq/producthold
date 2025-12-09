import Stripe from "stripe";
import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // fetch user using email (not id)
  const userResult = await db
    .select()
    .from(Users)
    .where(eq(Users.email, email));

  const user = userResult[0];

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer ID" },
      { status: 400 }
    );
  }

  // Create Stripe billing portal session
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return NextResponse.json({ url: portal.url });
}
