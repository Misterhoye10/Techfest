/**
 * Reca perimeter defenses for public / competition traffic.
 * Frontend is untrusted — every route re-validates here.
 */
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");

const GUEST_RE = /^guest_[a-zA-Z0-9_-]{8,64}$/;
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
const MAX_CHAT_CHARS = Number(process.env.MAX_CHAT_CHARS || 2000);
const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 1_500_000); // ~1.5MB decoded
const MAX_NOTE_CHARS = Number(process.env.MAX_NOTE_CHARS || 400);

function isProd() {
  return String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

function demoSecret() {
  return String(process.env.DEMO_SECRET || process.env.ADMIN_KEY || "").trim();
}

function demoEnabled() {
  const flag = String(process.env.ENABLE_DEMO || "").toLowerCase();
  if (flag === "false" || flag === "0") return false;
  if (flag === "true" || flag === "1") return true;
  // Local/dev: allow if secret set OR not production
  return !isProd();
}

function extractDemoSecret(req) {
  const header =
    req.get("x-demo-secret") ||
    req.get("x-admin-key") ||
    (String(req.get("authorization") || "").match(/^Bearer\s+(.+)$/i) || [])[1] ||
    "";
  return String(header || req.query?.secret || req.body?.secret || "").trim();
}

function secretsMatch(provided, expected) {
  if (!provided || !expected) return false;
  const a = Buffer.from(String(provided));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Gate /demo/*, /debug/*, /api/send-alert */
function requireDemoAccess(req, res, next) {
  if (!demoEnabled() && isProd()) {
    return res.status(404).json({ error: "Not found" });
  }
  const expected = demoSecret();
  if (!expected) {
    if (isProd()) {
      return res.status(404).json({ error: "Not found" });
    }
    // Local without secret — allow but warn once per process
    if (!requireDemoAccess._warned) {
      console.warn("[security] DEMO_SECRET unset — demo/debug routes are open on this host");
      requireDemoAccess._warned = true;
    }
    return next();
  }
  if (!secretsMatch(extractDemoSecret(req), expected)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return next();
}

function mintGuestId() {
  return `guest_${crypto.randomUUID().replace(/-/g, "")}`;
}

/**
 * Resolve student key: real E.164 or guest_* only.
 * Never fall back to a shared phone (IDOR magnet).
 */
function resolveStudentId(raw, { mintGuest = false } = {}) {
  const { normalizePhoneE164 } = require("./store");
  const e164 = normalizePhoneE164(raw);
  if (e164) return e164;
  const s = String(raw || "").trim();
  if (GUEST_RE.test(s)) return s;
  if (mintGuest) return mintGuestId();
  return null;
}

function requireStudentId(getter = (req) => req.body?.phone || req.query?.phone) {
  return (req, res, next) => {
    const id = resolveStudentId(getter(req));
    if (!id) {
      return res.status(400).json({
        error: "Valid session required. Refresh the page or sign in with WhatsApp.",
      });
    }
    req.studentId = id;
    next();
  };
}

function validateChatBody(text) {
  const body = String(text || "").trim();
  if (!body) return { ok: false, error: "body required" };
  if (body.length > MAX_CHAT_CHARS) {
    return { ok: false, error: `Keep questions under ${MAX_CHAT_CHARS} characters.` };
  }
  return { ok: true, body };
}

function validateUploadPayload({ imageBase64, mimeType, note }) {
  const raw = String(imageBase64 || "").trim();
  if (!raw) return { ok: false, status: 400, error: "imageBase64 required" };

  const cleaned = raw.replace(/^data:[^;]+;base64,/, "");
  // Approximate decoded size from base64 length
  const approxBytes = Math.floor((cleaned.length * 3) / 4);
  if (approxBytes > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `Photo too large — max about ${Math.round(MAX_UPLOAD_BYTES / 1000)}KB.`,
    };
  }
  if (cleaned.length < 32) {
    return { ok: false, status: 400, error: "Image data looks empty." };
  }

  const mime = String(mimeType || "image/jpeg").toLowerCase().split(";")[0].trim();
  if (!ALLOWED_IMAGE_MIME.has(mime)) {
    return { ok: false, status: 415, error: "Use JPEG, PNG, WebP, or GIF." };
  }

  const noteText = String(note || "").trim().slice(0, MAX_NOTE_CHARS);
  return { ok: true, imageBase64: cleaned, mimeType: mime === "image/jpg" ? "image/jpeg" : mime, note: noteText };
}

/**
 * Meta X-Hub-Signature-256 — requires raw body buffer on req.rawBody.
 */
function verifyMetaWebhookSignature(req) {
  const secret = String(process.env.META_APP_SECRET || "").trim();
  if (!secret) {
    if (isProd()) {
      console.error("[security] META_APP_SECRET missing — rejecting webhook POST in production");
      return false;
    }
    if (!verifyMetaWebhookSignature._warned) {
      console.warn("[security] META_APP_SECRET unset — webhook POSTs accept any body (local only)");
      verifyMetaWebhookSignature._warned = true;
    }
    return true;
  }
  const header = String(req.get("x-hub-signature-256") || "");
  const expected = header.startsWith("sha256=") ? header.slice(7) : "";
  if (!expected || !req.rawBody) return false;
  const digest = crypto.createHmac("sha256", secret).update(req.rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

function publicError(err, fallback = "Something went wrong. Try again.") {
  if (!isProd() && err?.message) return String(err.message).slice(0, 200);
  return fallback;
}

function otpEchoAllowed() {
  if (isProd()) return false;
  const dry = String(process.env.DRY_RUN).toLowerCase() === "true";
  return dry || String(process.env.OTP_ECHO).toLowerCase() === "true";
}

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_GLOBAL || 180),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — slow down a moment." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH || 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth tries. Wait a few minutes." },
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_CHAT || 40),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Reca is busy — wait a few seconds, then ask again." },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_UPLOAD || 25),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Photo limit reached for now. Try again later." },
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_WEBHOOK || 120),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "rate limited" },
});

module.exports = {
  isProd,
  demoSecret,
  demoEnabled,
  requireDemoAccess,
  mintGuestId,
  resolveStudentId,
  requireStudentId,
  validateChatBody,
  validateUploadPayload,
  verifyMetaWebhookSignature,
  publicError,
  otpEchoAllowed,
  globalLimiter,
  authLimiter,
  chatLimiter,
  uploadLimiter,
  webhookLimiter,
  MAX_CHAT_CHARS,
  ALLOWED_IMAGE_MIME,
  GUEST_RE,
};
