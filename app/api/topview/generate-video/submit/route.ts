export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { TopviewTasks, TopviewVideo, Users } from "@/configs/schema";
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
    console.log("📥 Video generation request received:", {
      userId,
      taskRecordId: body.taskRecordId,
      selectedImageId: body.selectedImageId,
      hasScript: !!body.script,
      scriptLength: body.script?.length || 0,
      voiceId: body.voiceId,
      mode: body.mode,
      captionStyleId: body.captionStyleId,
    });

    const {
      taskRecordId,
      selectedImageId,
      script,
      voiceId,
      captionStyleId,
      mode = "pro",
    } = body;

    if (!taskRecordId || !selectedImageId || !voiceId) {
      console.error("❌ Missing required parameters");
      return NextResponse.json(
        {
          error: "taskRecordId, selectedImageId, and voiceId are required",
        },
        { status: 400 }
      );
    }

    // Use default script if not provided (for testing)
    const ttsText = script && script.trim()
      ? script.trim()
      : "Check out this amazing product! It's perfect for your needs and offers great value.";

    console.log("📝 Script details:", {
      useDefault: !script || !script.trim(),
      textLength: ttsText.length,
      preview: ttsText.substring(0, 50) + "...",
    });

    // Get task record
    const [taskRecord] = await db
      .select()
      .from(TopviewTasks)
      .where(eq(TopviewTasks.id, taskRecordId))
      .limit(1);

    if (!taskRecord) {
      console.error("❌ Task not found:", taskRecordId);
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    console.log("✅ Task record found:", {
      taskId: taskRecord.id,
      userId: taskRecord.userId,
      currentStep: taskRecord.currentStep,
      hasReplaceProductResults: !!taskRecord.replaceProductResults,
      replaceProductResultsCount: Array.isArray(taskRecord.replaceProductResults) 
        ? taskRecord.replaceProductResults.length 
        : 0,
    });

    if (taskRecord.userId !== userId) {
      console.error("❌ Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!taskRecord.replaceProductResults) {
      console.warn("⚠️ Image replacement not completed - continuing anyway for testing");
      // Note: In production, you might want to enforce this
      // return NextResponse.json(
      //   { error: "Image replacement not completed yet" },
      //   { status: 400 }
      // );
    }

    // Check if user has enough credits
    // First, get user email from Clerk
    const { clerkClient } = await import('@clerk/nextjs/server');
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const userEmail = clerkUser.emailAddresses.find((e: { id: string; emailAddress: string; }) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
    
    console.log("👤 User lookup:", {
      clerkUserId: userId,
      userEmail,
    });

    if (!userEmail) {
      console.error("❌ No email found for user");
      return NextResponse.json({ error: "User email not found" }, { status: 404 });
    }

    const [user] = await db
      .select()
      .from(Users)
      .where(eq(Users.email, userEmail))
      .limit(1);

    if (!user) {
      console.warn("⚠️ User not found in database - continuing for testing");
      console.log("User email:", userEmail);
      // For testing, we'll allow this to continue
      // In production, you might want to enforce this or auto-create users
      // return NextResponse.json({ error: "User not found" }, { status: 404 });
    } else {
      const creditsAvailable = (user.credits_allowed || 0) - (user.credits_used || 0);
      console.log("💰 Credit check:", {
        allowed: user.credits_allowed,
        used: user.credits_used,
        available: creditsAvailable,
      });

      if (creditsAvailable < 1) {
        console.error("❌ Insufficient credits");
        return NextResponse.json(
          { error: "Insufficient credits. Please upgrade your plan." },
          { status: 402 }
        );
      }
    }

    console.log("🔄 Submitting video generation task to TopView...");

    if (!TOPVIEW_API_KEY || !TOPVIEW_UID) {
      console.error("❌ Missing TopView API credentials");
      return NextResponse.json(
        { error: "Missing Topview API credentials." },
        { status: 500 }
      );
    }

    // Submit to TopView using axios
    const options = {
      method: "POST",
      url: `${BASE_URL}/v2/product_avatar/task/image2Video/submit`,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${TOPVIEW_API_KEY}`,
        "Topview-Uid": TOPVIEW_UID,
        "content-type": "application/json",
      },
      data: {
        replaceProductTaskImageId: selectedImageId,
        mode,
        scriptMode: "text",
        ttsText: ttsText,
        voiceId,
        captionId: captionStyleId,
      },
    };

    console.log("📤 TopView API request:", {
      url: options.url,
      replaceProductTaskImageId: selectedImageId,
      mode,
      voiceId,
      captionId: captionStyleId,
      ttsTextLength: ttsText.length,
    });

    const response = await axios.request(options);
    const data = response.data;

    console.log("📨 TopView API response:", {
      code: data.code,
      hasResult: !!data.result,
    });

    if (!["200", 200, "0", 0].includes(data.code)) {
      console.error("❌ Video generation submission error:", data);
      return NextResponse.json(
        { error: "Failed to submit video generation task", details: data },
        { status: 500 }
      );
    }

    const result = data.result as {
      taskId: string;
      status: string;
      errorMsg: string | null;
    };

    console.log("✅ Video generation task submitted successfully:", {
      taskId: result.taskId,
      status: result.status,
    });

    console.log("💾 Updating database records...");

    // Update task record
    await db
      .update(TopviewTasks)
      .set({
        selectedImageId,
        videoTaskId: result.taskId,
        script: ttsText,
        voiceId,
        captionStyleId,
        mode,
        currentStep: 3,
        updatedAt: new Date(),
      })
      .where(eq(TopviewTasks.id, taskRecordId));

    console.log("✅ Task record updated");

    // Create video record (credits not deducted yet)
    const [videoRecord] = await db
      .insert(TopviewVideo)
      .values({
        userId,
        taskTableId: taskRecordId,
        script: ttsText,
        voiceId,
        captionStyleId,
        taskId: result.taskId,
        status: "processing",
        createdBy: userId,
        creditsDeducted: false,
      })
      .returning();

    console.log("✅ Video record created:", {
      videoRecordId: videoRecord.id,
      taskId: result.taskId,
      creditsDeducted: false,
    });

    console.log("🎉 Video generation submitted successfully!");

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      videoRecordId: videoRecord.id,
      status: result.status,
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("❌ Video generation route error:", {
      message: axiosError.response?.data || axiosError.message,
    });
    return NextResponse.json(
      {
        error: "Failed to submit video generation task",
        message: axiosError.response?.data || axiosError.message,
      },
      { status: 500 }
    );
  }
}
