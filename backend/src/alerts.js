/**
 * Forward study alerts to the live Meta WhatsApp backend on Render.
 * Web never talks to Meta directly — backend engineer owns that stack.
 */

function alertUrl() {
  return (
    String(process.env.RECA_ALERT_URL || "").trim() ||
    "https://reca-study-companion.onrender.com/api/send-alert"
  );
}

function whatsappBusinessDigits() {
  return String(process.env.RECA_WHATSAPP_NUMBER || "15556777893").replace(/\D/g, "");
}

/** Click-to-chat: https://wa.me/<business>?text=explain%20topic */
function continueOnWhatsAppUrl(topicLabel) {
  const biz = whatsappBusinessDigits();
  const topic = String(topicLabel || "photosynthesis")
    .trim()
    .replace(/^explain\s+/i, "");
  const text = encodeURIComponent(`explain ${topic}`);
  return `https://wa.me/${biz}?text=${text}`;
}

/**
 * @param {{ phone: string, message: string }} opts
 */
async function sendAlert({ phone, message }) {
  const digits = String(phone || "").replace(/\D/g, "");
  const body = String(message || "").trim();
  if (!digits || !body) {
    const err = new Error("phone and message required");
    err.status = 400;
    throw err;
  }

  const url = alertUrl();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: digits, message: body }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || data.message || `Alert failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return { ok: true, ...data };
}

module.exports = {
  sendAlert,
  continueOnWhatsAppUrl,
  whatsappBusinessDigits,
  alertUrl,
};
