const twilio = require("twilio");

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
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
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!client || !from) {
    console.warn("Twilio not configured — printing message instead:");
    console.log(`→ ${to}: ${body}`);
    return { sid: "no-twilio" };
  }

  const toAddr = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  return client.messages.create({ from, to: toAddr, body });
}

module.exports = { sendWhatsApp };
