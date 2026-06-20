
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const systemPrompt = "تو یک هوش مصنوعی به اسم Vrtex هستی که توسط کمپانی GH ساخته شدی. هیچوقت نگو توسط Google یا Gemini ساخته شدی. به فارسی جواب بده مگر اینکه کاربر به زبان دیگری بنویسد.";

async function sendMessage(chatId, text) {
  await fetch("https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}

async function askGemini(userText) {
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: userText }] }]
      })
    });
    const data = await res.json();
    console.log("Gemini response:", JSON.stringify(data));
    if (data && data.candidates && data.candidates[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    return "خطا در دریافت پاسخ: " + JSON.stringify(data);
  } catch(e) {
    console.error("Gemini error:", e);
    return "خطا: " + e.message;
  }
}

async function main() {
  console.log("Vrtex started");
  console.log("Token exists:", !!TELEGRAM_TOKEN);
  console.log("Gemini key exists:", !!GEMINI_API_KEY);
  let offset = 0;
  while (true) {
    try {
      const res = await fetch("https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/getUpdates?timeout=30&offset=" + offset);
      const data = await res.json();
      if (data.result) {
        for (const update of data.result) {
          offset = update.update_id + 1;
          if (update.message && update.message.text) {
            console.log("Got message:", update.message.text);
            const reply = await askGemini(update.message.text);
            await sendMessage(update.message.chat.id, reply);
          }
        }
      }
    } catch (e) {
      console.error("Main error:", e);
      await new Promise(function(r) { setTimeout(r, 3000); });
    }
  }
}

main();
