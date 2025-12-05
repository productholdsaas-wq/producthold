export const runtime = "nodejs";

import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { sql } from 'drizzle-orm';
import { db } from "@/lib/db";
import { Users } from '@/configs/schema';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { name?: string; email?: string; imageUrl?: string } = {};
    try {
      body = await req.json();
    } catch { }

    const clerk = await currentUser();

    if (!clerk) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const name = clerk.fullName || body.name || '';
    const email = clerk.primaryEmailAddress?.emailAddress || body.email || '';
    const imageUrl = clerk.imageUrl || body.imageUrl || '';

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    await db
      .insert(Users)
      .values({
        name: name || '',
        email,
        image_url: imageUrl || '',
      })
      .onConflictDoUpdate({
        target: Users.email,
        set: {
          name: name || '',
          image_url: imageUrl || '',
          updated_at: sql`NOW()`,
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Upsert user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
