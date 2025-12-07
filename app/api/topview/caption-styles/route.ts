import { NextResponse } from "next/server";
import axios from "axios";

const TOPVIEW_API_KEY = process.env.TOPVIEW_API_KEY!;
const TOPVIEW_UID = process.env.TOPVIEW_UID!;
const BASE_URL = process.env.TOPVIEW_BASE_URL || "https://api.topview.ai/v1";

export async function GET() {
  try {
    console.log("💬 Fetching Topview Caption Styles...");

    if (!TOPVIEW_API_KEY || !TOPVIEW_UID) {
      return NextResponse.json(
        { error: "Missing Topview API credentials." },
        { status: 500 }
      );
    }

    const response = await axios.get(`${BASE_URL}/caption/list`, {
      headers: {
        Authorization: `Bearer ${TOPVIEW_API_KEY}`,
        "Topview-Uid": TOPVIEW_UID,
        "Content-Type": "application/json",
      },
    });

    const data = response.data;

    if (!["200", 200, "0", 0].includes(data.code)) {
      console.error("❌ Caption Styles Fetch Error:", data);
      return NextResponse.json(
        { error: "Failed to fetch caption styles", details: data },
        { status: 500 }
      );
    }

    console.log("✅ Caption styles loaded:", {
      count: data.result?.length || 0,
    });

    return NextResponse.json({
      success: true,
      captionStyles: data.result || [],
    });
  } catch (error) {
    console.error("❌ Caption Style Route Error:", {
      message: (error as Error).message,
    });

    return NextResponse.json(
      {
        error: "Caption style fetch failed",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
