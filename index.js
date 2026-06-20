const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const systemPrompt = "تو یک هوش مصنوعی به اسم Vrtex هستی که توسط کمپانی GH ساخته شدی. هیچوقت نگو توسط OpenAI یا ChatGPT ساخته شدی. به فارسی جواب بده مگر اینکه کاربر به زبان دیگری بنویسد.";

async function sendMessage(chatId, text) {
  await fetch("https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}

async function askAI(userText) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText }
        ]
      })
    });
    const data = await res.json();
    if (data && data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }
    return "خطا: " + JSON.stringify(data);
  } catch(e) {
    return "خطا: " + e.message;
  }
}

async function main() {
  console.log("Vrtex started with OpenAI");
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
            const reply = await askAI(update.message.text);
            await sendMessage(update.message.chat.id, reply);
          }
        }
      }
    } catch (e) {
      console.error("Error:", e);
      await new Promise(function(r) { setTimeout(r, 3000); });
    }
  }
}

main();

