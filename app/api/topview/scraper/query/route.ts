export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";

const TOPVIEW_API_KEY = process.env.TOPVIEW_API_KEY!;
const TOPVIEW_UID = process.env.TOPVIEW_UID!;
const BASE_URL = process.env.TOPVIEW_BASE_URL!;

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Querying scraper task:", taskId);

    const response = await axios.get(
      `${BASE_URL}/v1/scraper/task/query`,
      {
        params: {
          taskId,
          needCloudFrontUrl: "true",
        },
        headers: {
          Authorization: `Bearer ${TOPVIEW_API_KEY}`,
          "Topview-Uid": TOPVIEW_UID,
        },
      }
    );

    if (response.data.code !== "200") {
      console.error("❌ Scraper query error:", response.data);
      return NextResponse.json(
        { error: "Failed to query scraper task", details: response.data },
        { status: 500 }
      );
    }

    const result = response.data.result;

    console.log("✅ Scraper task result:", {
      taskId: result.taskId,
      status: result.status,
      productName: result.productName,
      imageCount: result.productImages?.length || 0,
    });

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      errorMsg: result.errorMsg,
      productLink: result.productLink,
      productName: result.productName,
      productDescription: result.productDescription,
      productImages: result.productImages || [],
      productVideos: result.productVideos || [],
    });
  } catch (error) {
    console.error("❌ Scraper query error:", error);
    return NextResponse.json(
      {
        error: "Failed to query scraper task",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
