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

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskRecordId = searchParams.get("taskRecordId");
    const topviewTaskId = searchParams.get("taskId");

    if (!taskRecordId && !topviewTaskId) {
      return NextResponse.json(
        { error: "taskRecordId or taskId is required" },
        { status: 400 }
      );
    }

    // Get task record from database
    let taskRecord;
    if (taskRecordId) {
      [taskRecord] = await db
        .select()
        .from(TopviewTasks)
        .where(eq(TopviewTasks.id, taskRecordId))
        .limit(1);
    } else if (topviewTaskId) {
      [taskRecord] = await db
        .select()
        .from(TopviewTasks)
        .where(eq(TopviewTasks.bgRemovalTaskId, topviewTaskId))
        .limit(1);
    }

    if (!taskRecord) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify ownership
    if (taskRecord.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("🔍 Querying background removal status...");

    if (!TOPVIEW_API_KEY || !TOPVIEW_UID) {
      return NextResponse.json(
        { error: "Missing Topview API credentials." },
        { status: 500 }
      );
    }

    // Query TopView for status using axios
    const options = {
      method: "GET",
      url: `${BASE_URL}/v1/common_task/remove_background/query`,
      params: {
        taskId: taskRecord.bgRemovalTaskId!,
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
      console.error("❌ Background removal status error:", data);
      return NextResponse.json(
        { error: "Failed to query background removal status", details: data },
        { status: 500 }
      );
    }

    const result = data.result as {
      taskId: string;
      status: string;
      bgRemovedImageFileId?: string;
      bgRemovedImagePath?: string;
      bgRemovedImageWidth?: number;
      bgRemovedImageHeight?: number;
      maskImageFileId?: string;
      maskImagePath?: string;
      maskImageWidth?: number;
      maskImageHeight?: number;
    };

    console.log("✅ Background removal status:", result.status);

    // Update database if completed
    if (result.status === "success" && result.bgRemovedImageFileId) {
      await db
        .update(TopviewTasks)
        .set({
          bgRemovedImageFileId: result.bgRemovedImageFileId,
          bgRemovedImageUrl: result.bgRemovedImagePath,
          updatedAt: new Date(),
        })
        .where(eq(TopviewTasks.id, taskRecord.id));
    }

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      bgRemovedImageFileId: result.bgRemovedImageFileId,
      bgRemovedImageUrl: result.bgRemovedImagePath,
      imageWidth: result.bgRemovedImageWidth,
      imageHeight: result.bgRemovedImageHeight,
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("❌ Background removal status route error:", {
      message: axiosError.response?.data || axiosError.message,
    });
    return NextResponse.json(
      {
        error: "Failed to query background removal status",
        message: axiosError.response?.data || axiosError.message,
      },
      { status: 500 }
    );
  }
}
