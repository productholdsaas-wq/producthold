export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { TopviewTasks, TopviewVideo, Users } from "@/configs/schema";
import { eq } from "drizzle-orm";
import axios, { AxiosError } from "axios";

const TOPVIEW_API_KEY = process.env.TOPVIEW_API_KEY!;
const TOPVIEW_UID = process.env.TOPVIEW_UID!;
const BASE_URL = process.env.TOPVIEW_BASE_URL!;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      taskRecordId,
      selectedImageId,
      script,
      voiceId,
      captionStyleId,
      mode = "pro",
    } = body;

    if (!taskRecordId || !selectedImageId || !script || !voiceId) {
      return NextResponse.json(
        {
          error: "taskRecordId, selectedImageId, script, and voiceId are required",
        },
        { status: 400 }
      );
    }

    // Get task record
    const [taskRecord] = await db
      .select()
      .from(TopviewTasks)
      .where(eq(TopviewTasks.id, taskRecordId))
      .limit(1);

    if (!taskRecord) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (taskRecord.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!taskRecord.replaceProductResults) {
      return NextResponse.json(
        { error: "Image replacement not completed yet" },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    const [user]= await db
      .select()
      .from(Users)
      .where(eq(Users.email, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const creditsAvailable = (user.credits_allowed || 0) - (user.credits_used || 0);
    if (creditsAvailable < 1) {
      return NextResponse.json(
        { error: "Insufficient credits. Please upgrade your plan." },
        { status: 402 }
      );
    }

    console.log("🔄 Submitting video generation task...");

    if (!TOPVIEW_API_KEY || !TOPVIEW_UID) {
      return NextResponse.json(
        { error: "Missing Topview API credentials." },
        { status: 500 }
      );
    }

    // Submit to TopView using axios
    const options = {
      method: "POST",
      url: `${BASE_URL}/v2/product_avatar/task/image2Video/submit`,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TOPVIEW_API_KEY}`,
        "Topview-Uid": TOPVIEW_UID,
        "content-type": "application/json",
      },
      data: {
        replaceProductTaskImageId: selectedImageId,
        mode,
        scriptMode: "text",
        ttsText: script,
        voiceId,
        captionId: captionStyleId,
      },
    };

    const response = await axios.request(options);
    const data = response.data;

    if (!["200", 200, "0", 0].includes(data.code)) {
      console.error("❌ Video generation submission error:", data);
      return NextResponse.json(
        { error: "Failed to submit video generation task", details: data },
        { status: 500 }
      );
    }

    const result = data.result as {
      taskId: string;
      status: string;
      errorMsg: string | null;
    };

    console.log("✅ Video generation task submitted:", result.taskId);

    // Update task record
    await db
      .update(TopviewTasks)
      .set({
        selectedImageId,
        videoTaskId: result.taskId,
        script,
        voiceId,
        captionStyleId,
        mode,
        currentStep: 3,
        updatedAt: new Date(),
      })
      .where(eq(TopviewTasks.id, taskRecordId));

    // Create video record (credits not deducted yet)
    const [videoRecord] = await db
      .insert(TopviewVideo)
      .values({
        userId,
        taskTableId: taskRecordId,
        script,
        voiceId,
        captionStyleId,
        taskId: result.taskId,
        status: "processing",
        createdBy: userId,
        creditsDeducted: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      videoRecordId: videoRecord.id,
      status: result.status,
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("❌ Video generation route error:", {
      message: axiosError.response?.data || axiosError.message,
    });
    return NextResponse.json(
      {
        error: "Failed to submit video generation task",
        message: axiosError.response?.data || axiosError.message,
      },
      { status: 500 }
    );
  }
}
