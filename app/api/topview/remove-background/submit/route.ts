export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { TopviewTasks } from "@/configs/schema";
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
    const { productImageFileId } = body;

    if (!productImageFileId) {
      return NextResponse.json(
        { error: "productImageFileId is required" },
        { status: 400 }
      );
    }

    console.log("🔄 Submitting background removal task...");

    if (!TOPVIEW_API_KEY || !TOPVIEW_UID) {
      return NextResponse.json(
        { error: "Missing Topview API credentials." },
        { status: 500 }
      );
    }

    // Submit background removal task to TopView using axios
    const options = {
      method: "POST",
      url: `${BASE_URL}/v1/common_task/remove_background/submit`,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TOPVIEW_API_KEY}`,
        "Topview-Uid": TOPVIEW_UID,
        "content-type": "application/json",
      },
      data: { productImageFileId },
    };

    const response = await axios.request(options);
    const data = response.data;

    if (!["200", 200, "0", 0].includes(data.code)) {
      console.error("❌ Background removal submission error:", data);
      return NextResponse.json(
        { error: "Failed to submit background removal task", details: data },
        { status: 500 }
      );
    }

    const result = data.result as {
      taskId: string;
      status: string;
      errorMsg: string | null;
    };

    console.log("✅ Background removal task submitted:", result.taskId);

    // Create task tracking record in database
    const [taskRecord] = await db
      .insert(TopviewTasks)
      .values({
        userId,
        productImageFileId,
        bgRemovalTaskId: result.taskId,
        currentStep: 1,
        status: "in_progress",
      })
      .returning();

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      taskRecordId: taskRecord.id,
      status: result.status,
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("❌ Background removal route error:", {
      message: axiosError.response?.data || axiosError.message,
    });
    return NextResponse.json(
      {
        error: "Failed to submit background removal task",
        message: axiosError.response?.data || axiosError.message,
      },
      { status: 500 }
    );
  }
}
