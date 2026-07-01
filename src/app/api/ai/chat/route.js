import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/gemini";

const SYSTEM_INSTRUCTION = `You are LifeLine AI, a brilliant productivity assistant. You have access to both the user's Tasks and Daily Routines. Help them manage time, prioritize, and take action. Be proactive, helpful, and encouraging. When the user asks what to focus on, cross-reference their tasks and routines. For example, if a routine is low priority but there are critical tasks, advise them to do the tasks first. Give specific, actionable advice. Keep responses concise but helpful.

CRITICAL RULE: You are STRICTLY a productivity, task, and habit assistant. If the user asks general knowledge questions, trivia, coding help unrelated to their tasks, sports facts (e.g., "tell me about F1"), or anything irrelevant to their productivity schedule, you MUST politely refuse to answer. Redirect them back to their tasks or ask how you can help them be productive today. Never break character.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, tasks, routines, context, currentTime } = body;

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

    if (routines && routines.length > 0) {
      prompt += `User's daily routines/habits:\n${JSON.stringify(routines, null, 2)}\n\n`;
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
