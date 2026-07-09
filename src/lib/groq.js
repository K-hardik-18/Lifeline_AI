import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function getGroqResponse(prompt, systemInstruction) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemInstruction,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.1-8b-instant", // Fast model for JSON responses
    response_format: { type: "json_object" }
  });

  return completion.choices[0]?.message?.content || "";
}
