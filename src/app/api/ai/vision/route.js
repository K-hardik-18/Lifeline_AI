import { NextResponse } from "next/server";
import { getVisionResponse } from "@/lib/gemini-vision";

// Allow larger request bodies for image uploads
export const maxDuration = 30; // seconds

const TASK_VISION_PROMPT = `You are a productivity assistant. Analyze this image carefully. It may contain handwritten notes, a whiteboard, a printed list, a screenshot, or a to-do list.

Extract ALL actionable tasks, items, or to-dos from the image.

For each task, return a JSON object with these fields:
- title (string): A clear, concise title for the task
- description (string): Any additional details or context from the image
- category (string): One of 'work', 'study', 'personal', 'finance', 'health' — pick the best fit
- priority (string): One of 'critical', 'high', 'medium', 'low' — infer from any urgency cues in the image
- estimatedMinutes (number): Your best estimate for how long this task would take

Return your response as a JSON object with a single key "tasks" containing an array of task objects.

Example:
{
  "tasks": [
    {
      "title": "Buy groceries",
      "description": "Milk, eggs, bread from the store",
      "category": "personal",
      "priority": "medium",
      "estimatedMinutes": 45
    }
  ]
}

If you cannot find any actionable tasks in the image, return: {"tasks": [], "message": "No actionable tasks found in this image."}

Return ONLY valid JSON, no markdown fences, no extra text.`;

const ROUTINE_VISION_PROMPT = `You are a productivity assistant. Analyze this image carefully. It may contain handwritten notes, a whiteboard, a printed list, or a screenshot of daily routines or routines.

Extract ALL actionable routines, routines, or repeating items from the image.

For each routine, return a JSON object with these fields:
- title (string): A clear, concise title for the routine
- reason (string): Any additional details, motivation, or context from the image
- category (string): One of 'work', 'study', 'personal', 'finance', 'health' — pick the best fit
- priority (string): One of 'critical', 'high', 'medium', 'low' — infer from any urgency cues in the image

Return your response as a JSON object with a single key "suggestions" containing an array of routine objects.

Example:
{
  "suggestions": [
    {
      "title": "Morning Yoga",
      "reason": "For flexibility and mindfulness",
      "category": "health",
      "priority": "high"
    }
  ]
}

If you cannot find any actionable routines in the image, return: {"suggestions": [], "message": "No actionable routines found in this image."}

Return ONLY valid JSON, no markdown fences, no extra text.`;

/**
 * Strip markdown code block fences if present.
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
    const { image, mimeType, type = 'task' } = body;

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "An image (base64) and mimeType are required." },
        { status: 400 }
      );
    }

    const prompt = type === 'routine' ? ROUTINE_VISION_PROMPT : TASK_VISION_PROMPT;

    // Strip the data URL prefix if present (e.g. "data:image/png;base64,")
    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    const rawResponse = await getVisionResponse(base64Data, mimeType, prompt);
    const cleaned = cleanJsonResponse(rawResponse);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Failed to parse Vision AI JSON response:", cleaned);
      return NextResponse.json(
        {
          error: "AI could not extract structured tasks from this image.",
          rawResponse: cleaned,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Vision AI error:", error);

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process image", details: error.message },
      { status: 500 }
    );
  }
}
