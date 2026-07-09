import { NextResponse } from 'next/server';
import { getGeminiResponse } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { routines } = await request.json();

    const systemInstruction = `
      You are LifeLine AI, an expert productivity and routine tracking coach.
      The user will provide their current daily routines and their historical logs (which days they completed them).
      Analyze their consistency, focus areas, and priorities. 
      
      Return a JSON object with:
      1. "analysis": A comprehensive, actionable paragraph (3-4 sentences) acting as a proper guide. Do not just say "you missed gym", but give them a step-by-step psychological or practical strategy to achieve it (e.g., "Start with just 5 minutes of stretching to build momentum").
      2. "suggestions": An array of 1 to 3 new routine suggestions (objects with {title, category, priority, reason}) that would balance their life. Categories must be one of: 'work', 'study', 'personal', 'finance', 'health'. Priorities must be: 'critical', 'high', 'medium', 'low'.
      
      Return ONLY valid JSON. No markdown formatting.
    `;

    const prompt = `Here are my current routines and logs: ${JSON.stringify(routines, null, 2)}`;
    
    let rawText = await getGeminiResponse(prompt, systemInstruction);
    
    // Strip markdown formatting if present
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const result = JSON.parse(rawText);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Routine Suggest API Error:', error);
    
    // Fallback if AI fails or rate limits
    return NextResponse.json({
      analysis: "You're building great foundational routines! Keep tracking your progress daily to see long-term trends.",
      suggestions: [
        {
          title: "Drink 2L Water",
          category: "health",
          priority: "medium",
          reason: "Essential for maintaining energy and focus."
        }
      ]
    });
  }
}
