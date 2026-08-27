/**
 * Short-lived WhatsApp OTP codes for Reca auth.
 * In-memory — fine for BuildFest; move to Redis/Supabase later.
 */

const crypto = require("crypto");

const codes = new Map(); // phone → { code, name, purpose, expiresAt, attempts, lastSentAt }

const TTL_MS = Number(process.env.OTP_TTL_MS || 10 * 60 * 1000);
const RESEND_MS = Number(process.env.OTP_RESEND_MS || 45 * 1000);
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const CODE_DIGITS = Number(process.env.OTP_DIGITS || 6);

function generateCode() {
  const digits = CODE_DIGITS === 4 ? 4 : 6;
  if (digits === 4) {
    return String(crypto.randomInt(1000, 10000));
  }
  return String(crypto.randomInt(100000, 1000000));
}

function timingSafeCodeEqual(a, b) {
  const left = Buffer.from(String(a || "").trim());
  const right = Buffer.from(String(b || "").trim());
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
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
  if (!timingSafeCodeEqual(code, record.code)) {
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
