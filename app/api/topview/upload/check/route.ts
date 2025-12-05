import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
  }

  const API_KEY = process.env.TOPVIEW_API_KEY!;
  const BASE_URL = process.env.TOPVIEW_BASE_URL || "https://api.topview.ai";

  console.log("🔍 Checking upload status for fileId:", fileId);

  try {
    const options = {
      method: "GET",
      url: `${BASE_URL}/v1/upload/check`,
      params: { file_id: fileId },
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    };

    const response = await axios.request(options);

    console.log("✅ Upload status checked");

    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("❌ Error checking upload status:", axiosError.response?.data || axiosError.message);
    return NextResponse.json(
      { 
        error: "Failed to check upload status",
        details: axiosError.response?.data || axiosError.message
      },
      { status: 500 }
    );
  }
}
