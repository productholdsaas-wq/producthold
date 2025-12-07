import { NextResponse } from "next/server";
import axios from "axios";

const TOPVIEW_API_KEY = process.env.TOPVIEW_API_KEY!;
const TOPVIEW_UID = process.env.TOPVIEW_UID!;
const BASE_URL = "https://api.topview.ai/v1";

interface Voice {
    voiceId: string;
    voiceName: string;
    bestSupportLanguage?: string;
    accent?: string;
    gender?: string;
    style?: string;
}

export async function GET() {
    try {
        console.log("🎤 Fetching voices from TopView...");

        const response = await axios.get(
            `${BASE_URL}/voice/query?pageNum=1&pageSize=500`,
            {
                headers: {
                    Authorization: `Bearer ${TOPVIEW_API_KEY}`,
                    "Topview-Uid": TOPVIEW_UID,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = response.data;

        // Validate success response
        if (!["200", 200, "0", 0].includes(data.code)) {
            console.error("❌ TopView Voice API Error:", data);
            return NextResponse.json(
                { error: "TopView voice fetch failed", details: data },
                { status: 500 }
            );
        }

        let voices = data.result;

        // Normalize result
        if (!Array.isArray(voices)) {
            voices =
                data.result?.data?.records ??
                data.result?.data ??
                data.result?.list ??
                data.result?.records ??
                [];
        }

        if (!Array.isArray(voices)) {
            console.error("❌ Invalid Voices Structure:", voices);
            return NextResponse.json(
                { error: "Invalid voices structure", details: data.result },
                { status: 500 }
            );
        }

        console.log(`🎤 Total Voices Received: ${voices.length}`);

        // ---------- FILTER EXTRACTION ----------
        const languages = [
            ...new Set(
                (voices as Voice[])
                    .map((v) => v.bestSupportLanguage)
                    .filter(Boolean)
            ),
        ];

        const accents = [
            ...new Set((voices as Voice[]).map((v) => v.accent).filter(Boolean)),
        ];

        const genders = [
            ...new Set((voices as Voice[]).map((v) => v.gender).filter(Boolean)),
        ];

        const styles = [
            ...new Set((voices as Voice[]).map((v) => v.style).filter(Boolean)),
        ];

        console.log("🎛 Filters Extracted:", {
            languages: languages.length,
            accents: accents.length,
            genders: genders.length,
            styles: styles.length,
        });

        return NextResponse.json({
            success: true,
            filters: {
                language: languages,
                accent: accents,
                gender: genders,
                style: styles,
            },
            voices,
        });
    } catch (error) {
        console.error("❌ Voice Route Error:", error);

        return NextResponse.json(
            {
                error: "Server error",
                message: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
