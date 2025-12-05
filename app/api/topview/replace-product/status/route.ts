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

    if (!taskRecord.replaceProductTaskId) {
      return NextResponse.json(
        { error: "Image replacement not started" },
        { status: 400 }
      );
    }

    console.log("🔍 Querying image replacement status...");

    if (!TOPVIEW_API_KEY || !TOPVIEW_UID) {
      return NextResponse.json(
        { error: "Missing Topview API credentials." },
        { status: 500 }
      );
    }

    // Query TopView for status using axios
    const options = {
      method: "GET",
      url: `${BASE_URL}/v3/product_avatar/task/image_replace/query`,
      params: {
        taskId: taskRecord.replaceProductTaskId,
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
      console.error("❌ Image replacement status error:", data);
      return NextResponse.json(
        { error: "Failed to query image replacement status", details: data },
        { status: 500 }
      );
    }

    const result = data.result as {
      taskId: string;
      status: string;
      replaceProductResult?: Array<{
        imageId: string;
        faceExistence: boolean;
        url: string;
      }>;
    };

    console.log("✅ Image replacement status:", result.status);

    // Update database if completed
    if (result.status === "success" && result.replaceProductResult) {
      await db
        .update(TopviewTasks)
        .set({
          replaceProductResults: result.replaceProductResult,
          updatedAt: new Date(),
        })
        .where(eq(TopviewTasks.id, taskRecord.id));
    }

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      replaceProductResult: result.replaceProductResult,
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("❌ Image replacement status route error:", {
      message: axiosError.response?.data || axiosError.message,
    });
    return NextResponse.json(
      {
        error: "Failed to query image replacement status",
        message: axiosError.response?.data || axiosError.message,
      },
      { status: 500 }
    );
  }
}
