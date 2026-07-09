import { NextResponse } from "next/server";
import { getGroqResponse } from "@/lib/groq";

const SYSTEM_INSTRUCTION = `Analyze these tasks and return a JSON object with a single key "prioritizedTasks" containing an array of objects with: {id, priority: 'critical'|'high'|'medium'|'low', reason: string, suggestedAction: string}. Consider due dates, importance, and dependencies. Return ONLY valid JSON.`;

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
    const { tasks } = body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: "A non-empty tasks array is required" },
        { status: 400 }
      );
    }

    const currentTime = new Date().toISOString();

    const prompt = `Current date/time: ${currentTime}\n\nTasks to prioritize:\n${JSON.stringify(tasks, null, 2)}`;

    const rawResponse = await getGroqResponse(prompt, SYSTEM_INSTRUCTION);
    const cleaned = cleanJsonResponse(rawResponse);

    let prioritizedTasks;
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        prioritizedTasks = parsed;
      } else if (parsed.prioritizedTasks && Array.isArray(parsed.prioritizedTasks)) {
        prioritizedTasks = parsed.prioritizedTasks;
      } else if (parsed.tasks && Array.isArray(parsed.tasks)) {
        prioritizedTasks = parsed.tasks;
      } else {
        throw new Error("Invalid structure returned by AI");
      }
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

    return NextResponse.json({ prioritizedTasks });
  } catch (error) {
    console.error("AI Prioritize error:", error);
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to prioritize tasks", details: error.message },
      { status: 500 }
    );
  }
}
