import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    // Get authenticated Clerk user
    const user = await currentUser();

    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.primaryEmailAddress.emailAddress;

    // Fetch user database record by email
    const [dbUser] = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Construct response matching what the UI likely expects
    // Based on previous code: tier, status, renewal, credits stats
    const data = {
        tier: dbUser.plan_tier,
        status: dbUser.subscription_status,
        cancel_at: null, // Schema doesn't have cancel_at?
        renewal: dbUser.current_period_end,
        credits_allowed: dbUser.credits_allowed,
        credits_used: dbUser.credits_used,
        // Legacy fields for compatibility if needed
        faceless_allowed: dbUser.credits_allowed, 
        faceless_used: dbUser.credits_used,
        ugc_allowed: dbUser.credits_allowed, 
        ugc_used: dbUser.credits_used,
    };

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("❌ /api/user/plan ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load user plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
