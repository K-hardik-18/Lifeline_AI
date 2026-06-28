import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/gemini";

const SYSTEM_INSTRUCTION = `Draft a professional but friendly message based on the user's request. Return the message ready to copy-paste.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt, context } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "A non-empty prompt string is required" },
        { status: 400 }
      );
    }

    let fullPrompt = `User's request: ${prompt}`;

    if (context) {
      fullPrompt += `\n\nAdditional context: ${context}`;
    }

    const draft = await getGeminiResponse(fullPrompt, SYSTEM_INSTRUCTION);

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("AI Draft error:", error);
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate draft", details: error.message },
      { status: 500 }
    );
  }
}
