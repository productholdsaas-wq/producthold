"use server";

import { db } from "@/lib/db";
import { TopviewVideo, Users } from "@/configs/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function getDashboardStats(email: string) {
  try {
    let creditsUsed = 0;
    let creditsAllowed = 0;

    // 1. Get User Credits by Email
    if (email) {
      const [userRecord] = await db
        .select()
        .from(Users)
        .where(eq(Users.email, email))
        .limit(1);
      
      if (userRecord) {
        creditsAllowed = userRecord.credits_allowed || 0;
        creditsUsed = userRecord.credits_used || 0;
      }
    }

    // 2. Get Video Stats (Total, Processing)
    // Use email for createdBy
    
    // Total Videos
    const [totalVideosResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(TopviewVideo)
      .where(eq(TopviewVideo.createdBy, email));
    
    const totalVideos = Number(totalVideosResult?.count || 0);

    // Processing Videos
    // where createdBy = email AND status IN ('processing', 'pending')
    const [processingCountResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(TopviewVideo)
        .where(
            sql`${TopviewVideo.createdBy} = ${email} AND ${TopviewVideo.status} IN ('processing', 'pending')`
        );
        
    const processingVideos = Number(processingCountResult?.count || 0);


    // 3. Get Recent Videos
    const recentVideos = await db
      .select()
      .from(TopviewVideo)
      .where(eq(TopviewVideo.createdBy, email))
      .orderBy(desc(TopviewVideo.createdAt))
      .limit(3);

    return {
      totalVideos,
      processingVideos,
      credits: {
        used: creditsUsed,
        allowed: creditsAllowed,
      },
      recentVideos,
    };

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalVideos: 0,
      processingVideos: 0,
      credits: { used: 0, allowed: 0 },
      recentVideos: [],
    };
  }
}
