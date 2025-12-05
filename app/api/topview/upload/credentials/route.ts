import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "png";

  const API_KEY = process.env.TOPVIEW_API_KEY!;
  const UID = process.env.TOPVIEW_UID!;
  const BASE_URL = process.env.TOPVIEW_BASE_URL || "https://api.topview.ai";

  console.log("🔑 Requesting upload credentials...");

  try {
    const options = {
      method: "GET",
      url: `${BASE_URL}/v1/upload/credential`,
      params: { format },
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
        "Topview-Uid": UID,
      },
    };

    const response = await axios.request(options);

    console.log("✅ Upload credentials received");

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("❌ Credential error:", axiosError.response?.data || axiosError.message);

    return NextResponse.json(
      {
        error: "Failed to get upload credential",
        details: axiosError.response?.data || axiosError.message,
      },
      { status: 500 }
    );
  }
}
