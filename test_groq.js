const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.split('\n').find(line => line.startsWith('GROQ_API_KEY')).split('=')[1].trim();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: key });

async function test() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Analyze these tasks and return a JSON object with a single key "prioritizedTasks" containing an array of objects with: {id, priority: "critical"|"high"|"medium"|"low", reason: string, suggestedAction: string}. Consider due dates, importance, and dependencies. Return ONLY valid JSON.' },
        { role: 'user', content: '[{"id": "1", "title": "test task", "priority": "medium"}]' },
      ],
      model: 'llama-3.1-8b-instant',
      response_format: { type: 'json_object' }
    });
    console.log(completion.choices[0].message.content);
  } catch(e) {
    console.error(e);
  }
}
test();
