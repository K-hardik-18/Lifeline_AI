import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Send an image (as base64) to Groq Vision and get a text response.
 * @param {string} base64Data - The raw base64-encoded image data (no data: prefix).
 * @param {string} mimeType - The image MIME type (e.g. "image/png", "image/jpeg").
 * @param {string} prompt - The text prompt to send alongside the image.
 * @returns {Promise<string>} The generated text response.
 */
export async function getVisionResponse(base64Data, mimeType, prompt) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          },
        ],
      },
    ],
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.2,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || "";
}
