import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/gemini";

const SYSTEM_INSTRUCTION = `Draft a professional but friendly message based on the user's request. Return the message ready to copy-paste.

CRITICAL RULE: You are STRICTLY a productivity, task, and routine assistant. If the user asks you to draft content about general knowledge, trivia, sports (e.g., F1), or anything irrelevant to productivity, academics, or professional work, you MUST politely refuse to write the draft and guide them back to their tasks.`;

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
