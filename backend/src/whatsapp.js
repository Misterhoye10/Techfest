/**
 * Meta WhatsApp Cloud API — ported from ai-study-companion-backend/app.js (origin/main).
 * Not Twilio.
 */

function clean(value) {
  return String(value || "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function apiVersion() {
  return clean(process.env.META_API_VERSION) || "v18.0";
}

function phoneNumberId() {
  return clean(process.env.META_PHONE_NUMBER_ID);
}

function accessToken() {
  return clean(process.env.META_ACCESS_TOKEN);
}

function verifyToken() {
  return clean(process.env.META_VERIFY_TOKEN) || "reca_webhook_token";
}

/** Display number for UI (E.164 if set). */
function displayNumber() {
  const n = clean(process.env.META_DISPLAY_PHONE_NUMBER);
  if (n) return n.startsWith("+") ? n : `+${n.replace(/\D/g, "")}`;
  return null;
}

function isConfigured() {
  return Boolean(phoneNumberId() && accessToken());
}

/** Meta `to` / webhook `from` → digits only (no +). */
function toMetaRecipient(phone) {
  return String(phone || "")
    .replace(/^whatsapp:/i, "")
    .replace(/\D/g, "");
}

/**
 * Send a text message via Meta WhatsApp Cloud API.
 * @param {string} to E.164 or digits (with or without whatsapp:)
 * @param {string} body message text
 */
async function sendWhatsApp(to, body) {
  const dry = String(process.env.DRY_RUN).toLowerCase() === "true";
  if (dry) {
    console.log(`[DRY_RUN] → ${to}: ${body}`);
    return { messages: [{ id: "dry-run" }] };
  }

  const id = phoneNumberId();
  const token = accessToken();
  if (!id || !token) {
    console.warn("Meta WhatsApp not configured — printing message instead:");
    console.log(`→ ${to}: ${body}`);
    return { messages: [{ id: "no-meta" }] };
  }

  const recipient = toMetaRecipient(to);
  const url = `https://graph.facebook.com/${apiVersion()}/${id}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: { body: String(body || "") },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      data?.error?.message ||
      data?.error?.error_user_msg ||
      JSON.stringify(data).slice(0, 300);
    console.error("Meta WhatsApp send failed:", detail);
    const err = new Error(detail || `Meta send failed (${res.status})`);
    err.status = res.status;
    err.meta = data;
    throw err;
  }

  console.log("Meta WhatsApp sent:", data?.messages?.[0]?.id || "ok");
  return data;
}

/**
 * Pull inbound text messages from a Meta webhook body.
 * Returns [{ phone, text, messageId }]
 */
function parseInbound(body) {
  const value = body?.entry?.[0]?.changes?.[0]?.value;
  const messages = value?.messages;
  if (!Array.isArray(messages) || !messages.length) return [];

  return messages
    .map((msg) => {
      const text = msg.text?.body?.trim();
      if (!text) return null;
      const digits = String(msg.from || "").replace(/\D/g, "");
      const phone = digits ? `+${digits}` : null;
      if (!phone) return null;
      return {
        phone,
        text,
        messageId: msg.id || null,
      };
    })
    .filter(Boolean);
}

module.exports = {
  sendWhatsApp,
  parseInbound,
  isConfigured,
  displayNumber,
  verifyToken,
  toMetaRecipient,
};
