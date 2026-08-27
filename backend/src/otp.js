/**
 * Short-lived WhatsApp OTP codes for Reca auth.
 * In-memory — fine for BuildFest; move to Redis/Supabase later.
 */

const codes = new Map(); // phone → { code, name, purpose, expiresAt, attempts, lastSentAt }

const TTL_MS = Number(process.env.OTP_TTL_MS || 10 * 60 * 1000);
const RESEND_MS = Number(process.env.OTP_RESEND_MS || 45 * 1000);
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

function generateCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function createOtp({ phone, name, purpose }) {
  const existing = codes.get(phone);
  const now = Date.now();
  if (existing && now - existing.lastSentAt < RESEND_MS) {
    const wait = Math.ceil((RESEND_MS - (now - existing.lastSentAt)) / 1000);
    const err = new Error(`Wait ${wait}s before requesting another code.`);
    err.status = 429;
    throw err;
  }

  const code = generateCode();
  const record = {
    code,
    name: String(name || existing?.name || "").trim().slice(0, 40) || null,
    purpose: purpose === "signin" ? "signin" : "signup",
    expiresAt: now + TTL_MS,
    attempts: 0,
    lastSentAt: now,
  };
  codes.set(phone, record);
  return { code, expiresInSec: Math.round(TTL_MS / 1000), purpose: record.purpose };
}

function verifyOtp({ phone, code }) {
  const record = codes.get(phone);
  if (!record) {
    const err = new Error("No code pending for this number. Request a new one.");
    err.status = 400;
    throw err;
  }
  if (Date.now() > record.expiresAt) {
    codes.delete(phone);
    const err = new Error("That code expired. Request a new one.");
    err.status = 400;
    throw err;
  }
  record.attempts += 1;
  if (record.attempts > MAX_ATTEMPTS) {
    codes.delete(phone);
    const err = new Error("Too many tries. Request a new code.");
    err.status = 429;
    throw err;
  }
  if (String(code || "").trim() !== record.code) {
    const left = MAX_ATTEMPTS - record.attempts;
    const err = new Error(
      left > 0
        ? `Not quite — ${left} try${left === 1 ? "" : "s"} left.`
        : "Too many tries. Request a new code."
    );
    err.status = 400;
    throw err;
  }

  const payload = {
    phone,
    name: record.name,
    purpose: record.purpose,
  };
  codes.delete(phone);
  return payload;
}

function peek(phone) {
  return codes.get(phone) || null;
}

module.exports = {
  createOtp,
  verifyOtp,
  peek,
  TTL_MS,
  RESEND_MS,
};
