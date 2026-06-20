// این فایل رو یه بار اجرا کن تا webhook ست بشه
// node set-webhook.js

const TELEGRAM_TOKEN = "توکن_تلگرام_خودت_رو_اینجا_بذار";
const VERCEL_URL = "آدرس_vercel_خودت_رو_اینجا_بذار"; // مثال: https://my-bot.vercel.app

async function setWebhook() {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${VERCEL_URL}/api/webhook`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data);
}

setWebhook();
