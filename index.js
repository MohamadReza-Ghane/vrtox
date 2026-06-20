const https = require("https");

const TELEGRAM_TOKEN = 8887728364:AAHrYUc2tPzu3FAnKJLpZRAmFSTRJD8TCAE;
const GEMINI_API_KEY = AQ.Ab8RN6Jrq4QvngGSdimzeKjYR2fnD2H0K9zIXKOWGC8DIxmHrQ;

const systemPrompt = `تو یک هوش مصنوعی به اسم "Vrtex" هستی که توسط کمپانی GH ساخته شدی.
هیچوقت نگو توسط Google یا Gemini ساخته شدی.
همیشه بگو من Vrtex هستم، ساخته شده توسط کمپانی GH.
به فارسی جواب بده مگر اینکه کاربر به زبان دیگه‌ای بنویسه.`;

async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function askGemini(userText) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userText }] }],
      }),
    }
  );
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "متأسفم، مشکلی پیش آمد.";
}

async function getUpdates(offset) {
  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates?timeout=30&offset=${offset}`
  );
  const data = await res.json();
  return data.result || [];
}

async function main() {
  console.log("Vrtex bot started...");
  let offset = 0;
  while (true) {
    try {
      const updates = await getUpdates(offset);
      for (const update of updates) {
        offset = update.update_id + 1;
        const msg = update.message;
        if (msg && msg.text) {
          const reply = await askGemini(msg.text);
          await sendMessage(msg.chat.id, reply);
        }
      }
    } catch (e) {
      console.error(e);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

main();
