import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/gemini";

const SYSTEM_INSTRUCTION = `Generate a motivating daily briefing for the user based on their tasks. Include: what to focus on today, any urgent deadlines, a suggested schedule for the day, and an encouraging message. Format as markdown. Be specific about their actual tasks.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { tasks, currentTime } = body;

    const now = currentTime || new Date().toISOString();

    let prompt = `Current date/time: ${now}\n\n`;

    if (tasks && tasks.length > 0) {
      prompt += `User's tasks:\n${JSON.stringify(tasks, null, 2)}`;
    } else {
      prompt += `The user has no tasks yet. Generate a brief welcome message encouraging them to add their first tasks and explaining how you can help them stay productive.`;
    }

    const briefing = await getGeminiResponse(prompt, SYSTEM_INSTRUCTION);

    return NextResponse.json({ briefing });
  } catch (error) {
    console.error("AI Daily Brief error:", error);
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate daily briefing", details: error.message },
      { status: 500 }
    );
  }
}
