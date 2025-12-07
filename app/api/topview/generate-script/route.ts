import { createChatSession } from "@/configs/AiModel";

export async function POST(req: Request) {
  try {
    const { prompt, duration = "30-60s", language } = await req.json();

    if (!prompt?.trim()) {
      return new Response("Prompt is required", { status: 400 });
    }

    const selectedLanguage = language || "English";

    let wordCountRange = "";
    let targetSeconds = "";

    switch (duration) {
      case "0-15s":
        wordCountRange = "20-40 words";
        targetSeconds = "0-15 seconds";
        break;
      case "15-30s":
        wordCountRange = "40-75 words";
        targetSeconds = "15-30 seconds";
        break;
      case "30-60s":
        wordCountRange = "75-150 words";
        targetSeconds = "30-60 seconds";
        break;
      case "60-90s":
        wordCountRange = "150-225 words";
        targetSeconds = "60-90 seconds";
        break;
      default:
        wordCountRange = "75-150 words";
        targetSeconds = "30-60 seconds";
    }

    // ✅ HARD-LOCKED PROMPT (NO JSON POSSIBLE)
    const aiPrompt = `
You are a professional scriptwriter who writes scripts for videos only in paragraph format.

STRICT OUTPUT RULE:
- Output ONLY ONE single paragraph of spoken voiceover.
- NO JSON.
- NO arrays.
- NO objects.
- NO scene numbers.
- NO descriptions.
- NO formatting.
- NO quotation marks.
- NO labels.
- ONLY raw spoken text.

LANGUAGE: ${selectedLanguage}
DURATION: ${targetSeconds}
WORD COUNT: ${wordCountRange}

STYLE:
- Human UGC voice
- Conversational
- Natural, smooth
- No sales pitch
- No "In this video"

USER PROMPT:
"${prompt}"

FINAL WARNING:
If you return anything except a SINGLE RAW PARAGRAPH OF SPOKEN TEXT, the output is INVALID.
`;

    const response = await createChatSession(aiPrompt);

    const rawText =
      typeof response?.text === "function"
        ? response.text()
        : typeof response?.response?.text === "function"
        ? response.response.text()
        : response?.text ?? "";

    let cleanScript = rawText.trim();

    // ✅ HARD JSON STRIP SHIELD (CRITICAL)
    if (cleanScript.startsWith("[") || cleanScript.startsWith("{")) {
      try {
        const parsed = JSON.parse(cleanScript) as { dialogue?: string; voiceover?: string; text?: string; script?: string } | Array<{ dialogue?: string; voiceover?: string; text?: string; script?: string }>;

        if (Array.isArray(parsed)) {
          const first = parsed[0];
          cleanScript =
            first?.dialogue ||
            first?.voiceover ||
            first?.text ||
            first?.script ||
            "";
        } else {
          cleanScript =
            parsed?.dialogue ||
            parsed?.voiceover ||
            parsed?.text ||
            parsed?.script ||
            "";
        }
      } catch {
        cleanScript = cleanScript.replace(/[\[\]\{\}"]/g, "").trim();
      }
    }

    if (!cleanScript || cleanScript.length < 10) {
      return new Response("Failed to generate valid script", { status: 500 });
    }

    // ✅ ✅ FINAL: RETURN ONLY RAW TEXT (NO JSON)
    return new Response(cleanScript, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("❌ Script generation error:", error);
    return new Response("Script generation failed", { status: 500 });
  }
}
