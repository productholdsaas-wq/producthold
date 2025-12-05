export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { TopviewTasks } from "@/configs/schema";
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
      templateImageFileId,
      avatarId,
      generateImageMode = "auto",
      imageEditPrompt,
      location,
    } = body;

    if (!taskRecordId) {
      return NextResponse.json(
        { error: "taskRecordId is required" },
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

    if (!taskRecord.bgRemovedImageFileId) {
      return NextResponse.json(
        { error: "Background removal not completed yet" },
        { status: 400 }
      );
    }

    console.log("🔄 Submitting image replacement task...");

    if (!TOPVIEW_API_KEY || !TOPVIEW_UID) {
      return NextResponse.json(
        { error: "Missing Topview API credentials." },
        { status: 500 }
      );
    }

    // Prepare request for TopView
    const replaceRequest: {
      generateImageMode: "auto" | "manual";
      productImageWithoutBackgroundFileId: string;
      templateImageFileId?: string;
      imageEditPrompt?: string;
      location?: number[][];
    } = {
      generateImageMode,
      productImageWithoutBackgroundFileId: taskRecord.bgRemovedImageFileId!,
    };

    if (templateImageFileId) {
      replaceRequest.templateImageFileId = templateImageFileId;
    }

    if (generateImageMode === "auto" && imageEditPrompt) {
      replaceRequest.imageEditPrompt = imageEditPrompt;
    }

    if (generateImageMode === "manual" && location) {
      replaceRequest.location = location;
    }

    // Submit to TopView using axios
    const options = {
      method: "POST",
      url: `${BASE_URL}/v3/product_avatar/task/image_replace/submit`,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TOPVIEW_API_KEY}`,
        "Topview-Uid": TOPVIEW_UID,
        "content-type": "application/json",
      },
      data: replaceRequest,
    };

    const response = await axios.request(options);
    const data = response.data;

    if (!["200", 200, "0", 0].includes(data.code)) {
      console.error("❌ Image replacement submission error:", data);
      return NextResponse.json(
        { error: "Failed to submit image replacement task", details: data },
        { status: 500 }
      );
    }

    const result = data.result as {
      taskId: string;
      status: string;
      errorMsg: string | null;
    };

    console.log("✅ Image replacement task submitted:", result.taskId);

    // Update task record
    await db
      .update(TopviewTasks)
      .set({
        templateImageFileId,
        avatarId,
        replaceProductTaskId: result.taskId,
        generateImageMode,
        imageEditPrompt,
        location: location ? JSON.parse(JSON.stringify(location)) : null,
        currentStep: 2,
        updatedAt: new Date(),
      })
      .where(eq(TopviewTasks.id, taskRecordId));

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("❌ Image replacement route error:", {
      message: axiosError.response?.data || axiosError.message,
    });
    return NextResponse.json(
      {
        error: "Failed to submit image replacement task",
        message: axiosError.response?.data || axiosError.message,
      },
      { status: 500 }
    );
  }
}
