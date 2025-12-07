export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";

const TOPVIEW_API_KEY = process.env.TOPVIEW_API_KEY!;
const TOPVIEW_UID = process.env.TOPVIEW_UID!;
const BASE_URL = process.env.TOPVIEW_BASE_URL!;

// TypeScript interfaces for TopView Avatar API response
interface AvatarEthnicity {
  ethnicityId: string;
  ethnicityName: string;
}

interface AvatarCategory {
  categoryId: string;
  categoryName: string;
}

interface Avatar {
  avatarId: string;
  avatarImagePath: string;
  voiceoverId: string;
  gender: string;
  avatarCategoryList: AvatarCategory[];
  objectMaskImageInfo: string;
  avatarEthnicityList: AvatarEthnicity[];
  minSubsType: string;
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🎭 Fetching TopView Avatar List with filters...");

    if (!TOPVIEW_API_KEY || !TOPVIEW_UID) {
      return NextResponse.json(
        { error: "Missing Topview API credentials." },
        { status: 500 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const genderFilter = searchParams.get("gender");
    const ethnicityFilter = searchParams.get("ethnicity");
    const categoryFilter = searchParams.get("category");

    console.log("🔍 Filters requested:", { genderFilter, ethnicityFilter, categoryFilter });

    // Fetch avatars from TopView API (using large page size to get all  avatars for filtering)
    const response = await fetch(
      `${BASE_URL}/v1/product_avatar/public_avatar/query?pageNum=1&pageSize=500`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOPVIEW_API_KEY}`,
          "Topview-Uid": TOPVIEW_UID,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!["200", 200, "0", 0].includes(data.code)) {
      console.error("❌ Avatar List Fetch Error:", data);
      return NextResponse.json(
        { error: "Failed to fetch avatar list", details: data },
        { status: 500 }
      );
    }

    // Extract avatars array from response
    let avatars = data.result || [];

    // Detect nested data structures if needed
    if (!Array.isArray(avatars)) {
      if (data.result?.list && Array.isArray(data.result.list)) {
        avatars = data.result.list;
      } else if (data.result?.data?.records && Array.isArray(data.result.data.records)) {
        avatars = data.result.data.records;
      } else if (data.result?.data && Array.isArray(data.result.data)) {
        avatars = data.result.data;
      } else {
        avatars = [];
      }
    }

    // Extract unique gender, ethnicity, and category filters
    const genderSet = new Set<string>();
    const ethnicitySet = new Set<string>();
    const categorySet = new Set<string>();

    avatars.forEach((avatar: Avatar) => {
      // Extract gender
      if (avatar.gender) {
        genderSet.add(avatar.gender);
      }

      // Extract ethnicities
      if (Array.isArray(avatar.avatarEthnicityList)) {
        avatar.avatarEthnicityList.forEach((e: AvatarEthnicity) => {
          if (e.ethnicityName) {
            ethnicitySet.add(e.ethnicityName);
          }
        });
      }

      // Extract categories
      if (Array.isArray(avatar.avatarCategoryList)) {
        avatar.avatarCategoryList.forEach((c: AvatarCategory) => {
          if (c.categoryName) {
            categorySet.add(c.categoryName);
          }
        });
      }
    });

    const genderList = Array.from(genderSet);
    const ethnicityList = Array.from(ethnicitySet);
    const categoryList = Array.from(categorySet).sort();

    // Apply filters if provided
    let filteredAvatars = avatars;

    if (genderFilter && genderFilter !== "all") {
      filteredAvatars = filteredAvatars.filter((avatar: Avatar) => {
        return avatar.gender?.toLowerCase() === genderFilter.toLowerCase();
      });
      console.log(`🔍 Filtered by gender "${genderFilter}": ${filteredAvatars.length} avatars`);
    }

    if (ethnicityFilter && ethnicityFilter !== "all") {
      filteredAvatars = filteredAvatars.filter((avatar: Avatar) => {
        if (!Array.isArray(avatar.avatarEthnicityList)) return false;
        return avatar.avatarEthnicityList.some(
          (e: AvatarEthnicity) => e.ethnicityName === ethnicityFilter
        );
      });
      console.log(`🔍 Filtered by ethnicity "${ethnicityFilter}": ${filteredAvatars.length} avatars`);
    }

    if (categoryFilter && categoryFilter !== "all") {
      filteredAvatars = filteredAvatars.filter((avatar: Avatar) => {
        if (!Array.isArray(avatar.avatarCategoryList)) return false;
        return avatar.avatarCategoryList.some(
          (c: AvatarCategory) => c.categoryName === categoryFilter
        );
      });
      console.log(`🔍 Filtered by category "${categoryFilter}": ${filteredAvatars.length} avatars`);
    }

    console.log("✅ Avatar list loaded:", {
      totalAvatars: avatars.length,
      filteredAvatars: filteredAvatars.length,
      genderCount: genderList.length,
      ethnicityCount: ethnicityList.length,
      categoryCount: categoryList.length,
    });

    return NextResponse.json({
      success: true,
      filters: {
        gender: genderList,
        ethnicity: ethnicityList,
        category: categoryList,
      },
      avatars: filteredAvatars,
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
