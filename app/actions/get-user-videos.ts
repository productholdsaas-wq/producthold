"use server";

import { db } from "@/lib/db";
import { TopviewVideo } from "@/configs/schema";
import { desc, eq } from "drizzle-orm";

export async function getUserVideos(userId: string) {
  try {
    const videos = await db
      .select()
      .from(TopviewVideo)
      .where(eq(TopviewVideo.userId, userId))
      .orderBy(desc(TopviewVideo.createdAt));
    return videos;
  } catch (error) {
    console.error("Error fetching user videos:", error);
    return [];
  }
}
