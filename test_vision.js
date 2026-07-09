const Groq = require('groq-sdk');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const key = env.split('\n').find(l => l.startsWith('GROQ_API_KEY')).split('=')[1].trim();

const groq = new Groq({ apiKey: key });

async function test() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What is in this image? Reply in one sentence.",
            },
            {
              type: "image_url",
              image_url: {
                url: "https://www.w3schools.com/css/img_5terre.jpg",
              },
            },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.2,
      max_tokens: 256,
    });
    console.log("SUCCESS:", completion.choices[0].message.content);
  } catch (e) {
    console.error("ERROR:", e.message);
    console.error("STATUS:", e.status);
  }
}
test();
