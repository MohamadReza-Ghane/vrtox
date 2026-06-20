export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  const body = req.body;
  const message = body?.message;

  if (!message || !message.text) {
    return res.status(200).json({ ok: true });
  }

  const chatId = message.chat.id;
  const userText = message.text;

  try {
    // درخواست به Gemini
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userText }] }],
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const aiReply =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "متأسفم، جوابی پیدا نکردم.";

    // ارسال جواب به تلگرام
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: aiReply,
      }),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(200).json({ ok: true });
  }
}
