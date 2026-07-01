import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/gemini";

const SYSTEM_INSTRUCTION = `Break down this task into actionable subtasks. Return a JSON array of: {title: string, estimatedMinutes: number, description: string}. Be practical and specific. Return ONLY valid JSON, no markdown.`;

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
    const { task } = body;

    if (!task || !task.title) {
      return NextResponse.json(
        { error: "A task object with at least a title is required" },
        { status: 400 }
      );
    }

    const prompt = `Task to break down:\nTitle: ${task.title}${task.description ? `\nDescription: ${task.description}` : ""}`;

    const rawResponse = await getGeminiResponse(prompt, SYSTEM_INSTRUCTION, true);
    const cleaned = cleanJsonResponse(rawResponse);

    let subtasks;
    try {
      subtasks = JSON.parse(cleaned);
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

    return NextResponse.json({ subtasks });
  } catch (error) {
    console.error("AI Breakdown error:", error);
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to break down task", details: error.message },
      { status: 500 }
    );
  }
}
