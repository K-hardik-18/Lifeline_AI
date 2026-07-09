import { NextResponse } from "next/server";
import { getGeminiResponse } from "@/lib/gemini";

const SYSTEM_INSTRUCTION = `You are LifeLine AI, a brilliant productivity assistant. You have access to both the user's Tasks and Daily Routines. Help them manage time, prioritize, and take action. Be proactive, helpful, and encouraging. When the user asks what to focus on, cross-reference their tasks and routines. 

CRITICAL RULE: You are STRICTLY a productivity, task, and routine assistant. If the user asks general knowledge questions, trivia, coding help unrelated to their tasks, sports facts, or anything irrelevant, politely refuse to answer.

You MUST always return a valid JSON object with the following structure:
{
  "response": "Your conversational text response to the user formatted in markdown",
  "actions": [
    { "type": "add_task", "payload": { "title": "...", "description": "...", "category": "work", "priority": "medium", "estimatedMinutes": 30 } },
    { "type": "add_routine", "payload": { "title": "...", "category": "health", "days": [1,2,3,4,5], "priority": "high" } }
  ]
}
If there are no actions to take, return an empty array for "actions". Return ONLY valid JSON, no markdown code block fences.`;

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
      prompt += `User's daily routines/routines:\n${JSON.stringify(routines, null, 2)}\n\n`;
    }

    if (context) {
      prompt += `Additional context: ${context}\n\n`;
    }

    prompt += `User message: ${message}`;

    const rawResponse = await getGeminiResponse(prompt, SYSTEM_INSTRUCTION, true);
    const cleaned = cleanJsonResponse(rawResponse);
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse JSON from AI chat", e);
      // Fallback if the AI messes up the JSON formatting
      parsedResponse = {
        response: cleaned,
        actions: []
      };
    }

    return NextResponse.json({ 
      response: parsedResponse.response,
      actions: parsedResponse.actions || [] 
    });
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
