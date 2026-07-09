import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/gemini";

const SYSTEM_INSTRUCTION = `Parse this natural language input into a structured task. Return JSON: {title: string, description: string, dueDate: ISO string or null, category: 'work'|'study'|'personal'|'finance'|'health', estimatedMinutes: number, priority: 'critical'|'high'|'medium'|'low'}. Return ONLY valid JSON, no markdown.`;

/**
 * Strip markdown code block fences from Gemini output if present.
 */
function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { input, localTime, timezone } = body;

    if (!input || typeof input !== "string" || input.trim().length === 0) {
      return NextResponse.json(
        { error: "A non-empty input string is required" },
        { status: 400 }
      );
    }

    const prompt = `Context:
- User's local date and time: ${localTime || new Date().toISOString()}
- User's timezone: ${timezone || 'UTC'}

Natural language input: "${input}"

CRITICAL: Return the dueDate as a valid ISO 8601 string that accurately incorporates the user's timezone offset (e.g., if timezone is Asia/Kolkata, output something like 2026-07-09T21:00:00+05:30 for 9 PM local time). If no time is explicitly stated, assume end of day. If no date is stated at all, return null for dueDate.`;

    const rawResponse = await getGeminiResponse(prompt, SYSTEM_INSTRUCTION, true);
    const cleaned = cleanJsonResponse(rawResponse);

    let task;
    try {
      task = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON response:", cleaned);
      return NextResponse.json(
        {
          error: "Failed to parse AI response as JSON",
          rawResponse: cleaned,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("AI Parse Task error:", error);
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to parse task input", details: error.message },
      { status: 500 }
    );
  }
}
