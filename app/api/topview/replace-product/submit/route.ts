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
      avatarId,
      templateImageFileId,
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
    console.log("🔍 Received avatarId from frontend:", avatarId);
    console.log("🔍 Received templateImageFileId:", templateImageFileId);

    // Validate environment variables
    console.log("🔧 Environment check:");
    console.log("  - TOPVIEW_UID exists:", !!TOPVIEW_UID);
    console.log("  - TOPVIEW_UID length:", TOPVIEW_UID?.length || 0);
    console.log("  - TOPVIEW_API_KEY exists:", !!TOPVIEW_API_KEY);
    console.log("  - TOPVIEW_API_KEY length:", TOPVIEW_API_KEY?.length || 0);
    console.log("  - BASE_URL:", BASE_URL);

    if (!TOPVIEW_API_KEY || !TOPVIEW_UID) {
      return NextResponse.json(
        { error: "Missing Topview API credentials." },
        { status: 500 }
      );
    }

    // Prepare request for TopView
    console.log("🔍 Task record bgRemovedImageFileId:", taskRecord.bgRemovedImageFileId);
    
    if (!taskRecord.bgRemovedImageFileId) {
      return NextResponse.json(
        { error: "Background removed image file ID is missing. Please complete Step 1 first." },
        { status: 400 }
      );
    }
    
    const replaceRequest: {
      generateImageMode: "auto" | "manual";
      productImageWithoutBackgroundFileId: string;
      avatarId?: string;
      templateImageFileId?: string;
      imageEditPrompt?: string;
      location?: number[][];
    } = {
      generateImageMode,
      productImageWithoutBackgroundFileId: taskRecord.bgRemovedImageFileId,
    };

    console.log("✅ Product image file ID:", taskRecord.bgRemovedImageFileId);

    // Add avatarId to request if provided
    if (avatarId) {
      replaceRequest.avatarId = avatarId;
      console.log("✅ Added avatarId to TopView request:", avatarId);
    } else {
      console.log("⚠️ No avatarId provided!");
    }

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
    console.log("📤 Sending to TopView API:", replaceRequest);
    console.log("🔑 Using TOPVIEW_UID:", TOPVIEW_UID?.substring(0, 8) + "...");
    console.log("🔑 API Key present:", !!TOPVIEW_API_KEY);
    console.log("🌐 API URL:", `${BASE_URL}/v3/product_avatar/task/image_replace/submit`);
    
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

    console.log("📦 Request headers:", {
      accept: options.headers.accept,
      "Topview-Uid": options.headers["Topview-Uid"]?.substring(0, 8) + "...",
      "Authorization": "Bearer " + TOPVIEW_API_KEY?.substring(0, 10) + "...",
    });

    let response, data;
    try {
      response = await axios.request(options);
      data = response.data;
      console.log("📥 TopView API Response:", data);
    } catch (axiosError: unknown) {
      const err = axiosError as AxiosError;
      console.error("❌ Axios request failed:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message,
      });
      
      // Check if it's an authorization error
      if (err.response?.status === 401 || err.response?.status === 403) {
        return NextResponse.json(
          { 
            error: "Authorization failed", 
            details: "Check TOPVIEW_API_KEY and TOPVIEW_UID in environment variables",
            response: err.response?.data 
          },
          { status: 500 }
        );
      }
      
      throw err; // Re-throw to be caught by outer catch
    }

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
        avatarId: avatarId,
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
