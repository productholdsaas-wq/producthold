export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";

const TOPVIEW_API_KEY = process.env.TOPVIEW_API_KEY!;
const TOPVIEW_UID = process.env.TOPVIEW_UID!;
const BASE_URL = process.env.TOPVIEW_BASE_URL!;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("💬 Fetching TopView Avatar List...");

    if (!TOPVIEW_API_KEY || !TOPVIEW_UID) {
      return NextResponse.json(
        { error: "Missing Topview API credentials." },
        { status: 500 }
      );
    }

    const options = {
      method: "GET",
      url: `${BASE_URL}/v1/photo_avatar/template/list`,
      params: {
        categories: "4ac8d232aa1945efaedf67b56ddf371d,b8e64f37db1c48a2aea904f3a2ae4522",
        isCustom: "false",
        pageNo: "1",
        pageSize: "20",
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
      console.error("❌ Avatar List Fetch Error:", data);
      return NextResponse.json(
        { error: "Failed to fetch avatar list", details: data },
        { status: 500 }
      );
    }

    console.log("✅ Avatar list loaded:", {
      total: data.result?.total || 0,
      page: data.result?.pageNo || 1,
      pageSize: data.result?.pageSize || 20,
      avatarsCount: data.result?.data?.length || 0,
    });

    return NextResponse.json({
      success: true,
      total: data.result?.total || 0,
      pageNo: data.result?.pageNo || 1,
      pageSize: data.result?.pageSize || 20,
      avatars: data.result?.data || [],
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("❌ Avatar List Route Error:", {
      message: axiosError.response?.data || axiosError.message,
    });

    return NextResponse.json(
      {
        error: "Avatar list fetch failed",
        message: axiosError.response?.data || axiosError.message,
      },
      { status: 500 }
    );
  }
}
