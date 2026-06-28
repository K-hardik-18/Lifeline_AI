import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/gemini";

const SYSTEM_INSTRUCTION = `You are LifeLine AI, a brilliant productivity assistant. You have access to the user's tasks and help them manage time, prioritize, and take action. Be proactive, helpful, and encouraging. When the user asks what to focus on, analyze their tasks by urgency and importance. Give specific, actionable advice. Keep responses concise but helpful.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, tasks, context, currentTime } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const now = currentTime || new Date().toISOString();

    let prompt = `Current date/time: ${now}\n\n`;

    if (tasks && tasks.length > 0) {
      prompt += `User's current tasks:\n${JSON.stringify(tasks, null, 2)}\n\n`;
    }

    if (context) {
      prompt += `Additional context: ${context}\n\n`;
    }

    prompt += `User message: ${message}`;

    const response = await getGeminiResponse(prompt, SYSTEM_INSTRUCTION);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI Chat error:", error);
    
    if (error?.status === 429) {
      return NextResponse.json({ 
        response: "I'm receiving a lot of requests right now and need a short breather! Please try asking me again in about 30 seconds." 
      });
    }

    return NextResponse.json(
      { error: "Failed to generate AI response", details: error.message },
      { status: 500 }
    );
  }
}
