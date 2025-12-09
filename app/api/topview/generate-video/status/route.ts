export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { TopviewTasks, TopviewVideo, Users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import axios, { AxiosError } from "axios";

const TOPVIEW_API_KEY = process.env.TOPVIEW_API_KEY!;
const TOPVIEW_UID = process.env.TOPVIEW_UID!;
const BASE_URL = process.env.TOPVIEW_BASE_URL!;

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskRecordId = searchParams.get("taskRecordId");
    const videoRecordId = searchParams.get("videoRecordId");
    const taskId = searchParams.get("taskId"); // TopView task ID

    if (!taskRecordId && !videoRecordId && !taskId) {
      return NextResponse.json(
        { error: "taskRecordId, videoRecordId, or taskId is required" },
        { status: 400 }
      );
    }

    // Get task record
    let taskRecord;
    let videoRecord;

    if (taskId) {
      // Query by TopView task ID (videoTaskId)
      [taskRecord] = await db
        .select()
        .from(TopviewTasks)
        .where(eq(TopviewTasks.videoTaskId, taskId))
        .limit(1);

      if (taskRecord) {
        [videoRecord] = await db
          .select()
          .from(TopviewVideo)
          .where(eq(TopviewVideo.taskTableId, taskRecord.id))
          .limit(1);
      }
    } else if (videoRecordId) {
      [videoRecord] = await db
        .select()
        .from(TopviewVideo)
        .where(eq(TopviewVideo.id, videoRecordId))
        .limit(1);

      if (videoRecord && videoRecord.taskTableId) {
        [taskRecord] = await db
          .select()
          .from(TopviewTasks)
          .where(eq(TopviewTasks.id, videoRecord.taskTableId))
          .limit(1);
      }
    } else if (taskRecordId) {
      [taskRecord] = await db
        .select()
        .from(TopviewTasks)
        .where(eq(TopviewTasks.id, taskRecordId))
        .limit(1);

      [videoRecord] = await db
        .select()
        .from(TopviewVideo)
        .where(eq(TopviewVideo.taskTableId, taskRecordId))
        .limit(1);
    }

    if (taskRecord && taskRecord.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const targetVideoTaskId = taskRecord?.videoTaskId || taskId;

    if (!targetVideoTaskId) {
      return NextResponse.json(
        { error: "Video generation not started or Task ID missing" },
        { status: 400 }
      );
    }

    console.log("🔍 Querying video generation status for:", targetVideoTaskId);

    if (!TOPVIEW_API_KEY || !TOPVIEW_UID) {
      return NextResponse.json(
        { error: "Missing Topview API credentials." },
        { status: 500 }
      );
    }

    // Query TopView for status using axios
    const options = {
      method: "GET",
      url: `${BASE_URL}/v2/product_avatar/task/image2Video/query`,
      params: {
        taskId: targetVideoTaskId,
        needCloudFrontUrl: "true",
      },
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TOPVIEW_API_KEY}`,
        "Topview-Uid": TOPVIEW_UID,
      },
    };

    const response = await axios.request(options);
    const data = response.data;

    if (!["200", 200, "0", 0].includes(data.code)) {
      console.error("❌ Video generation status error:", data);
      return NextResponse.json(
        { error: "Failed to query video generation status", details: data },
        { status: 500 }
      );
    }

    const result = data.result as {
      taskId: string;
      status: string;
      finishedVideoUrl?: string;
      aiAvatar?: {
        aiavatarId: string;
        aiavatarName: string;
        gender: string | null;
        coverUrl: string;
        ethnicities: string | null;
        voiceoverIdDefault: string;
      };
    };

    console.log("✅ Video generation status:", result.status);

    // If completed successfully, update database and deduct credits
    if (result.status === "success" && result.finishedVideoUrl) {
      // NOTE: creditsDeducted column removed. Assuming status check is sufficient or credits logic handled elsewhere.
      
      // Get user by Clerk ID from email (or better, add clerk_id to Users table)
      const [user] = await db
        .select()
        .from(Users)
        .where(eq(Users.email, userId))
        .limit(1);

      if (user) {
        // Deduct 1 credit
        // Only deduct if we can ensure we haven't already (limited by lack of creditsDeducted flag)
        // For now, deducting if status was not already 'completed' in DB
        const alreadyCompleted = videoRecord?.status === "completed";
        
        if (!alreadyCompleted) {
           await db
            .update(Users)
            .set({
              credits_used: sql`${Users.credits_used} + 1`,
              updated_at: sql`NOW()`,
            })
            .where(eq(Users.id, user.id));
        }
      }

      // Update video record
      if (videoRecord) {
        await db
          .update(TopviewVideo)
          .set({
            status: "completed",
            videoUrl: result.finishedVideoUrl,
            updatedAt: new Date(),
            aiavatarId: result.aiAvatar?.aiavatarId,
            aiavatarName: result.aiAvatar?.aiavatarName,
            gender: result.aiAvatar?.gender,
            coverUrl: result.aiAvatar?.coverUrl,
            ethnicities: result.aiAvatar?.ethnicities,
            voiceoverIdDefault: result.aiAvatar?.voiceoverIdDefault,
          })
          .where(eq(TopviewVideo.id, videoRecord.id));
      }

      // Update task record
      if (taskRecord) {
        await db
          .update(TopviewTasks)
          .set({
            finishedVideoUrl: result.finishedVideoUrl,
            status: "completed",
            updatedAt: new Date(),
          })
          .where(eq(TopviewTasks.id, taskRecord.id));
      }
    }

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      finishedVideoUrl: result.finishedVideoUrl,
      aiAvatar: result.aiAvatar,
      creditsDeducted: false, 
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("❌ Video generation status route error:", {
      message: axiosError.response?.data || axiosError.message,
    });
    return NextResponse.json(
      {
        error: "Failed to query video generation status",
        message: axiosError.response?.data || axiosError.message,
      },
      { status: 500 }
    );
  }
}
