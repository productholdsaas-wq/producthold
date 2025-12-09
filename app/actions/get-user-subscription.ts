"use server";

import { db } from "@/lib/db";
import { Users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getUserSubscription() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }
  
  // Need to find user by Clerk ID since schema has userId but user table might use email/id differently?
  // Schema says: Users table has 'email', 'name'. TopviewVideo has 'userId' (Clerk ID).
  // Wait, let's check schema for Users table again.
  // Users table: id (serial), email, name.
  // TopviewVideo: userId (varchar) -> Clerk ID.
  
  // User sync (upsert-user) likely maps Clerk user to DB user.
  // But wait, the Users table doesn't have a 'clerk_id' field shown in Step 17 view?
  // Let's re-read schema.ts from Step 17.
  // Users table: id, name, email, image_url... created_at... stripe_customer_id...
  // It does NOT have a clerk_id.
  
  // So we must fetch by email from Clerk.
  const { clerkClient } = await import('@clerk/nextjs/server');
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  
  if (!email) return null;
  
  const [dbUser] = await db
    .select()
    .from(Users)
    .where(eq(Users.email, email))
    .limit(1);
    
  return dbUser || null;
}
