const twilio = require("twilio");

function clean(value) {
  return String(value || "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function getClient() {
  const sid = clean(process.env.TWILIO_ACCOUNT_SID);
  const token = clean(process.env.TWILIO_AUTH_TOKEN);
  if (!sid || !token) return null;
  return twilio(sid, token);
}

async function sendWhatsApp(to, body) {
  const dry = String(process.env.DRY_RUN).toLowerCase() === "true";
  if (dry) {
    console.log(`[DRY_RUN] → ${to}: ${body}`);
    return { sid: "dry-run" };
  }

  const client = getClient();
  const from = clean(process.env.TWILIO_WHATSAPP_FROM);
  if (!client || !from) {
    console.warn("Twilio not configured — printing message instead:");
    console.log(`→ ${to}: ${body}`);
    return { sid: "no-twilio" };
  }

  const toAddr = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  try {
    return await client.messages.create({ from, to: toAddr, body });
  } catch (err) {
    console.error("Twilio send failed:", err.message || err);
    throw err;
  }
}

module.exports = { sendWhatsApp };
