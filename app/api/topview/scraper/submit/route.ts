export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";

const TOPVIEW_API_KEY = process.env.TOPVIEW_API_KEY!;
const TOPVIEW_UID = process.env.TOPVIEW_UID!;
const BASE_URL = process.env.TOPVIEW_BASE_URL!;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productLink } = await request.json();

    if (!productLink) {
      return NextResponse.json(
        { error: "Product link is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Submitting scraper task for:", productLink);

    const response = await axios.post(
      `${BASE_URL}/v1/scraper/task/submit`,
      { productLink },
      {
        headers: {
          Authorization: `Bearer ${TOPVIEW_API_KEY}`,
          "Topview-Uid": TOPVIEW_UID,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.code !== "200") {
      console.error("❌ Scraper submit error:", response.data);
      return NextResponse.json(
        { error: "Failed to submit scraper task", details: response.data },
        { status: 500 }
      );
    }

    console.log("✅ Scraper task submitted:", response.data.result);

    return NextResponse.json({
      success: true,
      taskId: response.data.result.taskId,
      status: response.data.result.status,
    });
  } catch (error) {
    console.error("❌ Scraper submit error:", error);
    return NextResponse.json(
      {
        error: "Failed to submit scraper task",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
