import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

export async function POST(req: Request) {
  try {
    // Read file from multipart request
    const form = await req.formData();
    const file = form.get("file") as File;
    const uploadUrl = form.get("uploadUrl") as string;
    const fileId = form.get("fileId") as string;

    if (!file || !uploadUrl || !fileId) {
      return NextResponse.json(
        { error: "Missing file or uploadUrl or fileId" },
        { status: 400 }
      );
    }

    console.log("⬆️  Uploading file to S3...", { fileId, fileName: file.name });

    // Upload file to S3 via PUT using axios
    const buffer = Buffer.from(await file.arrayBuffer());

    const options = {
      method: "PUT",
      url: uploadUrl,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      data: buffer,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    };

    await axios.request(options);

    console.log("✅ File uploaded to S3 successfully");

    // Return the fileId (needed for TopView usage)
    return NextResponse.json({
      success: true,
      fileId,
      message: "File uploaded to S3 successfully",
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("❌ Upload error:", axiosError.response?.data || axiosError.message);
    return NextResponse.json(
      { 
        error: "Upload failed", 
        details: axiosError.response?.data || axiosError.message 
      },
      { status: 500 }
    );
  }
}
