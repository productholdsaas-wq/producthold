import { GoogleGenAI } from "@google/genai";
import NextError from "next/error";

// Type definitions for Gemini API responses
interface GeminiUsageMetadata {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
}

interface GeminiResponse {
    text?: string | (() => string);
    response?: {
        text?: string | (() => string);
        usageMetadata?: GeminiUsageMetadata;
    };
    usageMetadata?: GeminiUsageMetadata;
}

type GeminiResult = GeminiResponse;

// Type for errors that may include status and errorDetails
interface ErrorWithStatus {
    status?: number | string;
    errorDetails?: string;
    response?: {
        text?: () => string;
    };
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
});

const MODEL_NAME = "gemini-2.5-flash";
const systemInstruction =`
You are an ELITE VIRAL VIDEO DIRECTOR and Short-Form Script Generator that outputs ONLY a single paragraph of text. Your scripts are designed for maximum retention on platforms like Reels and TikTok. Your sole task is to output ONLY a strictly valid paragraph of text.`;


const generationConfig = {
    temperature: 1,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
};

export async function createChatSession(initialPrompt: string | null = null) {
    try {
        const makeRequest = async (retryCount = 0): Promise<GeminiResult> => {
            try {
                const contents =
                    initialPrompt && initialPrompt.length > 0
                        ? [{ role: "user", parts: [{ text: initialPrompt }] }]
                        : [];

                const result = await ai.models.generateContent({
                    model: MODEL_NAME,
                    config: {
                        ...generationConfig,
                        systemInstruction: systemInstruction,
                    },
                    // The contents property is now guaranteed to be present (as [] or [Content])
                    contents: contents,
                });

                return result;
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const errorWithStatus = error as ErrorWithStatus;
                const errorStatus = errorWithStatus?.status;
                const errorDetails = errorWithStatus?.errorDetails || errorWithStatus?.response?.text?.();
                
                console.error(`Gemini API Error (attempt ${retryCount + 1}):`, {
                    message: errorMessage,
                    status: errorStatus,
                    details: errorDetails,
                });

                if (retryCount < 2) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
                    );
                    return makeRequest(retryCount + 1);
                }
                throw error;
            }
        };

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Gemini request timeout")), 60000)
        );

        const responsePromise = makeRequest();
        const result = (await Promise.race([responsePromise, timeoutPromise])) as GeminiResult;

        const hasText =
            typeof result?.text === "function" ||
            typeof result?.text === "string" ||
            typeof result?.response?.text === "function" ||
            typeof result?.response?.text === "string";

        if (!result || !hasText) {
            throw new Error("Empty Gemini response");
        }

        return result;
    } catch (error: unknown) {
        let errorMessage: string;
        const message = error instanceof Error ? error.message : String(error);
        
        if (message.includes("timeout")) {
            errorMessage = "Request took too long to complete. Please try again.";
        } else if (message.includes("429")) {
            errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (message.includes("500")) {
            errorMessage = "Gemini service error. Please try again later.";
        } else {
            errorMessage = `Error: ${message}`;
        }

        console.error("Gemini Error:", errorMessage);
        throw new Error(errorMessage);
    }
}

/**
 * Send message helper for incremental prompts
 */
export async function sendMessage(prompt: string) {
    const session = await createChatSession(prompt);

    // Logic to reliably pull the text response from the session object
    const textResponse =
        typeof session?.text === "function"
            ? session.text()
            : typeof session?.response?.text === "function"
                ? session.response.text()
                : session?.text ?? "";

    // Logic to pull usage metadata from various locations (session or session.response)
    // The Gemini SDK structure usually places this under usageMetadata, but checking both is safest.
    const usageMetadata = session?.usageMetadata || session?.response?.usageMetadata || {
        promptTokenCount: 0,
        candidatesTokenCount: 0,
        totalTokenCount: 0,
    };

    return {
        response: {
            text: () => textResponse,
            usageMetadata: usageMetadata
        }
    };
}