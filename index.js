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
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userText }] }]
    })
  });
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

async function main() {
  console.log("Vrtex started");
  let offset = 0;
  while (true) {
    try {
      const res = await fetch("https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/getUpdates?timeout=30&offset=" + offset);
      const data = await res.json();
      for (const update of data.result) {
        offset = update.update_id + 1;
        if (update.message && update.message.text) {
          const reply = await askGemini(update.message.text);
          await sendMessage(update.message.chat.id, reply);
        }
      }
    } catch (e) {
      console.error(e);
      await new Promise(function(r) { setTimeout(r, 3000); });
    }
  }
}

main();
