import Groq from "groq-sdk";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

const MODEL_NAME = "llama-3.3-70b-versatile";

const delay = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * Execute a function with exponential backoff retry for rate limits (429).
 */
export async function executeWithRetry(fn, maxRetries = 3) {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (error?.status === 429 && retries < maxRetries) {
        retries++;
        const waitTime = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        console.log(`[Groq API] Rate limit hit (429). Retrying in ${Math.round(waitTime/1000)}s... (Attempt ${retries}/${maxRetries})`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Send a single prompt to Groq and get a text response with automatic retries.
 * @param {string} prompt - The user prompt to send.
 * @param {string} [systemInstruction] - Optional system instruction for the model.
 * @returns {Promise<string>} The generated text response.
 */
export async function getGeminiResponse(prompt, systemInstruction) {
  const messages = [];
  
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  
  messages.push({ role: "user", content: prompt });

  const result = await executeWithRetry(() => 
    groq.chat.completions.create({
      messages: messages,
      model: MODEL_NAME,
      temperature: 0.5,
    })
  );
  
  return result.choices[0]?.message?.content || "";
}
