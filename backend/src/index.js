require("dotenv").config();
const path = require("path");
const pkg = require("../package.json");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cron = require("node-cron");
const { handleIncoming, prepareResurface, answerResurface, prepareDailyBriefing, prepareUniAdminUpdate } = require("./engine");
const { startQuiz, answerQuiz, currentQuiz, endQuiz } = require("./quiz");
const { sendWhatsApp, parseInbound, isConfigured, displayNumber, verifyToken } = require("./whatsapp");
const store = require("./store");
const { copy } = require("./copy");
const llm = require("./llm");
const otp = require("./otp");
const db = require("./db");
const alerts = require("./alerts");
const { getDiagram } = require("./diagrams");
const security = require("./security");
const { UNIVERSITIES } = require("./data/uni-updates");
const uniFeed = require("./uni-feed");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS || 1));

app.use(
  helmet({
    contentSecurityPolicy: false, // static HTML + inline boot theme script
    crossOriginEmbedderPolicy: false,
  })
);

const corsOrigin = String(process.env.CORS_ORIGIN || "").trim();
app.use(
  cors({
    origin: corsOrigin
      ? corsOrigin.split(",").map((s) => s.trim()).filter(Boolean)
      : false, // same-origin only by default
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.urlencoded({ extended: false, limit: "32kb" }));
app.use(
  express.json({
    limit: process.env.JSON_BODY_LIMIT || "2mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(security.globalLimiter);
app.use(express.static(path.join(__dirname, "..", "public"), {
  dotfiles: "deny",
  index: false,
}));

app.get("/health", async (_req, res) => {
  const detail =
    String(process.env.HEALTH_DETAIL || "").toLowerCase() === "true" || !security.isProd();
  if (!detail) {
    return res.json({ ok: true, service: "reca" });
  }
  const dbPing = await db.ping().catch((e) => ({ ok: false, error: e.message }));
  res.json({
    ok: true,
    service: "reca",
    mode: llm.isEnabled() ? "llm+preset" : "preset",
    llm: llm.providerLabel(),
    whatsapp: isConfigured() ? "meta" : "off",
    database: dbPing,
    chat: "/chat.html",
    signup: "/signup.html",
    otp: true,
  });
});

/** Public config for the web UI (no secrets). */
app.get("/api/config", (_req, res) => {
  res.json({
    ok: true,
    version: pkg.version || "1.0.0",
    whatsappNumber: alerts.whatsappBusinessDigits(),
    continueExample: alerts.continueOnWhatsAppUrl("photosynthesis"),
  });
});

app.get("/", (_req, res) => {
  res.redirect("/signup.html");
});

function whatsappFromNumber() {
  return displayNumber() || `+${alerts.whatsappBusinessDigits()}`;
}

function shouldEchoOtp() {
  return security.otpEchoAllowed();
}

async function handleRequestOtp(req, res) {
  try {
    const phone = store.normalizePhoneE164(req.body.phone);
    if (!phone) {
      return res.status(400).json({
        error: "Enter a valid WhatsApp number, e.g. +2348012345678",
      });
    }

    const purpose = req.body.purpose === "signin" ? "signin" : "signup";
    const name = String(req.body.name || "").trim().slice(0, 40);

    if (purpose === "signup" && !name) {
      return res.status(400).json({ error: "Tell Reca what to call you." });
    }

    if (purpose === "signin") {
      const existing = store.getAccountByPhone(phone);
      if (!existing && String(process.env.AUTH_REQUIRE_EXISTING).toLowerCase() === "true") {
        // Same message as signup path — avoid account enumeration
        return res.status(400).json({
          error: "Couldn’t start sign-in for this number. Try New student, or check the number.",
        });
      }
    }

    const issued = otp.createOtp({ phone, name, purpose });
    const message = `Your Reca code is ${issued.code}. It expires in ${Math.round(
      issued.expiresInSec / 60
    )} minutes. Don’t share it.`;

    let delivered = false;
    let deliverNote = null;
    try {
      await sendWhatsApp(phone, message);
      delivered = true;
    } catch (err) {
      deliverNote = err.message || "WhatsApp send failed";
      console.error("OTP Meta WhatsApp send failed:", deliverNote);
    }

    console.log(`[otp] ${phone} purpose=${purpose} delivered=${delivered}`);

    const payload = {
      ok: true,
      phone,
      purpose,
      expiresInSec: issued.expiresInSec,
      delivered,
      provider: "meta",
      whatsappFrom: whatsappFromNumber() || null,
      message: delivered
        ? `Code sent to WhatsApp on ${phone}.`
        : "Couldn’t reach WhatsApp yet. Allow-list this number in Meta, then Resend.",
    };

    if (shouldEchoOtp()) payload.devCode = issued.code;
    if (!delivered && deliverNote && !security.isProd()) payload.deliverError = deliverNote;

    res.json(payload);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || "Couldn’t send code" });
  }
}

app.post("/api/auth/request-otp", security.authLimiter, handleRequestOtp);
app.post("/api/auth/signup", security.authLimiter, (req, res) => {
  req.body.purpose = "signup";
  return handleRequestOtp(req, res);
});
app.post("/api/auth/login", security.authLimiter, (req, res) => {
  req.body.purpose = "signin";
  return handleRequestOtp(req, res);
});

/**
 * Step 2 — verify code → create/open account.
 * Body: { phone, code, name? }
 */
app.post("/api/auth/verify-otp", security.authLimiter, async (req, res) => {
  try {
    const phone = store.normalizePhoneE164(req.body.phone);
    if (!phone) {
      return res.status(400).json({
        error: "Enter a valid WhatsApp number, e.g. +2348012345678",
      });
    }

    const verified = otp.verifyOtp({ phone, code: req.body.code });
    const account = store.upsertAccount({
      phone,
      name: req.body.name || verified.name || "Student",
    });

    // Shared Supabase — phone is the cross-channel student ID
    let dbSync = null;
    try {
      dbSync = await db.upsertStudent({
        phone: account.phone,
        name: account.name,
      });
    } catch (err) {
      console.error("Supabase upsert failed:", err.message);
      dbSync = { ok: false, error: security.isProd() ? "sync deferred" : err.message };
    }

    res.json({
      ok: true,
      verified: true,
      phone: account.phone,
      name: account.name,
      purpose: verified.purpose,
      whatsappFrom: whatsappFromNumber() || alerts.whatsappBusinessDigits(),
      continueOnWhatsApp: alerts.continueOnWhatsAppUrl("photosynthesis"),
      database: dbSync,
      progress: store.progressFor(account.phone),
      next:
        verified.purpose === "signup"
          ? "You’re in. Message Reca on WhatsApp anytime. Progress stays in sync."
          : "Welcome back. Your Progress is ready.",
    });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || "Couldn’t verify code" });
  }
});

/**
 * Proxy to live Render WhatsApp alerts — gated (was open spam vector).
 * Body: { phone, message } — phone may include + or not.
 */
app.post("/api/send-alert", security.requireDemoAccess, security.authLimiter, async (req, res) => {
  try {
    const result = await alerts.sendAlert({
      phone: req.body.phone,
      message: String(req.body.message || "").slice(0, 1000),
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 502).json({ error: security.publicError(err, "Alert failed") });
  }
});

/** Student id: E.164 or guest_* - never a shared fallback phone. */
function normalizePhone(raw) {
  return security.resolveStudentId(raw);
}

function capitalizeTopic(topicId) {
  return String(topicId || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

/** Strip fancy dashes so UI and WhatsApp stay ASCII-clean. */
function cleanText(s) {
  return String(s || "")
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u2015/g, "-")
    .replace(/\u2212/g, "-");
}

async function deliver(phone, text, { whatsapp = true } = {}) {
  const body = cleanText(text);
  store.pushOutbox(phone, body, "bot");
  if (!whatsapp) return;
  const dry = String(process.env.DRY_RUN).toLowerCase() === "true";
  if (dry) return;
  try {
    await sendWhatsApp(phone, body);
  } catch (err) {
    console.error("WhatsApp deliver skipped/failed:", err.message);
  }
}

function enrichReplies(rawReplies, student) {
  const list = Array.isArray(rawReplies) ? rawReplies : [];
  const topicId = student?.learnFocusId || student?.pending?.topicId || null;
  const subject = student?.pending?.subject || null;
  const diagram = topicId ? getDiagram(topicId, subject) : null;

  return list.map((item, i) => {
    if (item && typeof item === "object" && item.text != null) {
      const image = item.image || (i === 0 ? diagram : null);
      return {
        text: cleanText(item.text),
        image: image
          ? {
              ...image,
              caption: image.caption ? cleanText(image.caption) : image.caption,
              alt: image.alt ? cleanText(image.alt) : image.alt,
            }
          : null,
      };
    }
    return {
      text: cleanText(item || ""),
      image: i === 0 ? diagram : null,
    };
  });
}

function studentFromReq(req, res) {
  const phone = normalizePhone(req.body?.phone ?? req.query?.phone);
  if (!phone) {
    res.status(400).json({
      error: "Valid session required. Refresh the page or sign in with WhatsApp.",
    });
    return null;
  }
  return phone;
}

/** Web chat API — primary demo path when Meta/Twilio blocked */
app.post("/api/chat", security.chatLimiter, async (req, res) => {
  const phone = studentFromReq(req, res);
  if (!phone) return;
  const checked = security.validateChatBody(req.body.body);
  if (!checked.ok) return res.status(400).json({ error: checked.error });

  store.getStudent(phone);
  const mode = req.body.mode === "learn" ? "learn" : "chat";
  const topicId = req.body.topicId ? String(req.body.topicId).slice(0, 80) : undefined;
  const fresh = Boolean(req.body.fresh);
  const replies = await handleIncoming(phone, checked.body, { mode, topicId, fresh });
  const student = store.getStudent(phone);
  const { findTopicById, topicLabel } = require("./topics");
  const { findPackById, packToTopic } = require("./data/diagram-packs");
  const focus =
    (student.learnFocusId && findTopicById(student.learnFocusId)) ||
    (student.learnFocusId && findPackById(student.learnFocusId)
      ? packToTopic(findPackById(student.learnFocusId))
      : null);
  res.json({
    ok: true,
    phone,
    replies: enrichReplies(replies, student),
    revise: reviseSnapshot(student),
    learnFocusId: student.learnFocusId || null,
    learnFocusLabel: focus ? topicLabel(focus) : null,
    learnFocusSubject: focus?.subject || null,
    diagram: student.learnFocusId
      ? getDiagram(student.learnFocusId, focus?.subject || student.pending?.subject)
      : null,
    llm: llm.providerLabel(),
  });
});

/**
 * Upload past question / notes photo → explain + set pending 2-question quiz.
 * Body: { phone, imageBase64, mimeType?, note? }
 */
app.post("/api/learn/upload", security.uploadLimiter, async (req, res) => {
  try {
    const phone = studentFromReq(req, res);
    if (!phone) return;
    const upload = security.validateUploadPayload({
      imageBase64: req.body.imageBase64,
      mimeType: req.body.mimeType,
      note: req.body.note,
    });
    if (!upload.ok) {
      return res.status(upload.status || 400).json({ error: upload.error });
    }
    if (!llm.isEnabled()) {
      return res.status(503).json({
        error: "Vision needs GEMINI_API_KEY on the server.",
      });
    }

    const parsed = await llm.explainFromImage({
      imageBase64: upload.imageBase64,
      mimeType: upload.mimeType,
      note: upload.note,
    });
    if (!parsed) {
      return res.status(422).json({
        error: "Couldn’t read that image. Try a clearer photo of one question.",
      });
    }

    const student = store.getStudent(phone);
    const topicId = `upload-${Date.now().toString(36)}`;
    const topic = {
      id: topicId,
      title: parsed.topicTitle,
      subject: parsed.subject,
      explanation: parsed.explanation,
      questions: parsed.questions,
    };

    student.learnFocusId = topicId;
    student.learnDepth = 0;
    student.pending = {
      topicId,
      subject: parsed.subject,
      step: "q1",
      topic,
      q1Correct: null,
      q2Correct: null,
    };
    student.awaitingResurface = null;

    const diagram = getDiagram(parsed.topicTitle, parsed.subject);
    const replies = enrichReplies(
      [
        `${parsed.explanation}\n\nQuick check. Q1: ${parsed.questions[0].text}`,
      ],
      { learnFocusId: topicId, pending: { subject: parsed.subject, topicId } }
    );
    if (diagram && replies[0]) replies[0].image = diagram;

    res.json({
      ok: true,
      phone,
      topic: {
        id: topicId,
        label: parsed.topicTitle,
        subject: parsed.subject,
      },
      replies,
      revise: reviseSnapshot(student),
      learnFocusId: topicId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: security.publicError(err, "Upload failed") });
  }
});

app.post("/api/quiz/start", security.chatLimiter, (req, res) => {
  const phone = studentFromReq(req, res);
  if (!phone) return;
  const limit = req.body.limit != null ? Number(req.body.limit) : undefined;
  const topicId = req.body.topicId ? String(req.body.topicId).slice(0, 80) : undefined;
  const examBody = req.body.examBody ? String(req.body.examBody).slice(0, 12) : undefined;
  const result = startQuiz(phone, topicId, { limit, examBody });
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.post("/api/quiz/answer", security.chatLimiter, (req, res) => {
  const phone = studentFromReq(req, res);
  if (!phone) return;
  const answer = String(req.body.answer || "").trim().slice(0, 500);
  if (!answer) return res.status(400).json({ error: "answer required" });
  const result = answerQuiz(phone, answer);
  if (result.error) return res.status(400).json(result);
  if (result.feedback?.text) result.feedback.text = cleanText(result.feedback.text);
  if (result.summary?.message) result.summary.message = cleanText(result.summary.message);
  if (result.question?.text) result.question.text = cleanText(result.question.text);
  res.json(result);
});

app.post("/api/quiz/end", security.chatLimiter, (req, res) => {
  const phone = studentFromReq(req, res);
  if (!phone) return;
  res.json(endQuiz(phone));
});

/** Quick Recall (nudge toast) — grade a miss without treating it as free chat */
app.post("/api/recall/answer", security.chatLimiter, async (req, res) => {
  const phone = studentFromReq(req, res);
  if (!phone) return;
  const checked = security.validateChatBody(req.body.answer || req.body.body);
  if (!checked.ok) return res.status(400).json({ error: checked.error });
  try {
    const result = await answerResurface(phone, checked.body, {
      topicId: req.body.topicId ? String(req.body.topicId).slice(0, 80) : null,
      topicLabel: req.body.topicLabel
        ? String(req.body.topicLabel).slice(0, 120)
        : null,
      questionText: req.body.questionText
        ? String(req.body.questionText).slice(0, 500)
        : null,
      correctAnswer: req.body.correctAnswer
        ? String(req.body.correctAnswer).slice(0, 200)
        : null,
      accept: Array.isArray(req.body.accept)
        ? req.body.accept.map((a) => String(a).slice(0, 120)).slice(0, 12)
        : null,
    });
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.json(result);
  } catch (err) {
    console.error("recall answer failed", err);
    res.status(500).json({
      error: security.publicError(err, "Couldn’t check that answer. Try again."),
    });
  }
});

app.get("/api/quiz/current", (req, res) => {
  const phone = studentFromReq(req, res);
  if (!phone) return;
  res.json(currentQuiz(phone));
});

app.get("/api/progress", (req, res) => {
  const phone = studentFromReq(req, res);
  if (!phone) return;
  const subject = String(req.query.subject || "").trim().slice(0, 40) || null;
  const progress = store.progressFor(phone, subject);
  res.json({ ok: true, phone, progress });
});

app.get("/api/whatsapp/status", (_req, res) => {
  const from = displayNumber();
  const configured =
    isConfigured() && String(process.env.DRY_RUN).toLowerCase() !== "true";
  res.json({
    ok: true,
    provider: "meta",
    configured,
    from: from || null,
    webhookPath: "/webhook",
  });
});

/** Link web session to a real WhatsApp number (E.164). */
app.post("/api/whatsapp/link", security.authLimiter, (req, res) => {
  const phone = store.normalizePhoneE164(req.body.phone);
  if (!phone || !/^\+\d{10,15}$/.test(phone)) {
    return res.status(400).json({
      error: "Use full international format, e.g. +2348012345678",
    });
  }
  const student = store.getStudent(phone);
  const from = displayNumber();
  res.json({
    ok: true,
    phone,
    progress: store.progressFor(phone),
    joinHint: from
      ? `On WhatsApp, message ${from} (allow-listed on Meta). Then send: explain photosynthesis`
      : "Message Reca’s Meta test number from an allow-listed phone, then send: explain photosynthesis",
    revise: reviseSnapshot(student),
  });
});

function reviseSnapshot(student) {
  if (student.awaitingResurface) {
    return {
      phase: "recall",
      topicId: null,
      topicLabel: student.awaitingResurface.topicLabel || "Recall",
      subject: null,
      step: "recall",
      prompt: "Type your answer to the recall question",
    };
  }
  if (student.pending) {
    const topic = student.pending.topic;
    const label = (topic?.id || student.pending.topicId || "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const phase = student.pending.step === "q2" ? "q2" : "q1";
    return {
      phase,
      topicId: student.pending.topicId,
      topicLabel: label,
      subject: student.pending.subject || topic?.subject || null,
      step: student.pending.step,
      prompt: phase === "q1" ? "Type your answer for Q1" : "Type your answer for Q2",
    };
  }
  return {
    phase: "idle",
    topicId: null,
    topicLabel: null,
    subject: null,
    step: null,
    prompt: "",
  };
}

app.get("/api/topics", (req, res) => {
  const { topics, stats } = require("./topics");
  const { allPackTopics } = require("./data/diagram-packs");
  const q = String(req.query.q || "").trim().toLowerCase();
  const subject = String(req.query.subject || "").trim();
  const includeSets = String(req.query.sets || "") === "1";
  let list = [...allPackTopics(), ...topics];
  // Hub/picker: skip “· set 2” clones so every subject fits and titles stay clean
  if (!includeSets) {
    list = list.filter((t) => !/·\s*set\s*\d+/i.test(t.title || ""));
  }
  if (subject && subject !== "All") {
    list = list.filter((t) => t.subject.toLowerCase() === subject.toLowerCase());
  }
  if (q) {
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.id.includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.aliases || []).some((a) => String(a).includes(q))
    );
  }
  const limit = Math.min(Number(req.query.limit) || 800, 2000);
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const slice = list.slice(offset, offset + limit);
  const subjects = [...new Set(list.map((t) => t.subject))].sort();
  res.json({
    stats: stats(),
    total: list.length,
    offset,
    limit,
    subjects,
    topics: slice.map((t) => ({
      id: t.id,
      subject: t.subject,
      label: t.title,
      send: `explain ${t.aliases?.[0] || t.title}`,
      icon: t.icon || "book-01",
      questionCount: t.questions?.length || 0,
      aliases: t.aliases,
      diagram: getDiagram(t.id, t.subject),
    })),
  });
});

app.get("/api/revise", (req, res) => {
  const phone = studentFromReq(req, res);
  if (!phone) return;
  const student = store.getStudent(phone);
  res.json({ ok: true, phone, revise: reviseSnapshot(student) });
});

/** Poll for unprompted messages (resurface aha) */
app.get("/api/events", (req, res) => {
  const phone = studentFromReq(req, res);
  if (!phone) return;
  const after = String(req.query.after || "").slice(0, 64);
  const messages = store.drainOutbox(phone, after);
  res.json({ phone, messages });
});

app.post("/api/session", (req, res) => {
  // Mint unique guest_* if no valid phone — never share one bucket across users
  let phone = security.resolveStudentId(req.body.phone);
  if (!phone) phone = security.mintGuestId();
  const student = store.getStudent(phone);
  if (req.body.name) store.setDisplayName(phone, String(req.body.name).slice(0, 40));
  if (req.body.examDate) {
    try {
      store.setExamDate(phone, req.body.examDate);
    } catch (_) {
      /* keep default */
    }
  }
  if (req.body.targetUniversity !== undefined) {
    store.setTargetUniversity(phone, req.body.targetUniversity || null);
  }
  if (req.body.uniUpdatesEnabled !== undefined) {
    store.setUniUpdatesEnabled(phone, req.body.uniUpdatesEnabled !== false);
  }
  res.json({
    ok: true,
    phone,
    guest: security.GUEST_RE.test(phone),
    welcome: copy.welcome,
    revise: reviseSnapshot(student),
    examDate: student.examDate,
    examLabel: student.examLabel,
    daysToExam: store.daysUntilExam(student.examDate),
    displayName: student.displayName,
    targetUniversity: student.targetUniversity || null,
    uniUpdatesEnabled: student.uniUpdatesEnabled !== false,
  });
});

app.get("/api/universities", (_req, res) => {
  res.json({
    ok: true,
    universities: UNIVERSITIES.filter((u) => u.id !== "general-jamb"),
  });
});

app.post("/api/profile", (req, res) => {
  try {
    const phone = studentFromReq(req, res);
    if (!phone) return;
    const student = store.getStudent(phone);
    if (req.body.name != null) store.setDisplayName(phone, String(req.body.name).slice(0, 40));
    if (req.body.examDate !== undefined) {
      if (req.body.examDate) store.setExamDate(phone, req.body.examDate);
      else {
        student.examDate = null;
      }
    }
    if (req.body.examLabel) {
      student.examLabel = String(req.body.examLabel).trim().slice(0, 24) || student.examLabel;
    }
    if (req.body.targetUniversity !== undefined) {
      store.setTargetUniversity(phone, req.body.targetUniversity || null);
    }
    if (req.body.uniUpdatesEnabled !== undefined) {
      store.setUniUpdatesEnabled(phone, req.body.uniUpdatesEnabled !== false);
    }
    res.json({
      ok: true,
      phone,
      displayName: student.displayName,
      examDate: student.examDate,
      examLabel: student.examLabel,
      daysToExam: store.daysUntilExam(student.examDate),
      targetUniversity: student.targetUniversity || null,
      uniUpdatesEnabled: student.uniUpdatesEnabled !== false,
    });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || "Profile update failed" });
  }
});

/**
 * Meta WhatsApp Cloud API webhook
 * GET  /webhook — verify challenge (same as origin/main ai-study-companion-backend)
 * POST /webhook — inbound messages
 * Also mounted at /webhook/whatsapp for older docs.
 */
async function handleMetaWebhookGet(req, res) {
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];
  const mode = req.query["hub.mode"];

  if ((mode === "subscribe" || challenge) && token === verifyToken()) {
    console.log("Meta webhook verified");
    return res.status(200).type("text/plain").send(String(challenge || ""));
  }
  console.warn("Meta webhook verification failed");
  return res.sendStatus(403);
}

async function handleMetaWebhookPost(req, res) {
  if (!security.verifyMetaWebhookSignature(req)) {
    console.warn("Meta webhook signature rejected");
    return res.sendStatus(403);
  }

  // Ack immediately (Meta retries if slow)
  res.sendStatus(200);

  try {
    const inbound = parseInbound(req.body);
    if (!inbound.length) return;

    for (const msg of inbound) {
      const text = String(msg.text || "").trim().slice(0, security.MAX_CHAT_CHARS);
      if (!text) continue;
      console.log(`← Meta ${msg.phone}: ${text.slice(0, 80)}`);
      const replies = await handleIncoming(msg.phone, text);
      for (const reply of replies) {
        await deliver(msg.phone, reply, { whatsapp: true });
      }
    }
  } catch (err) {
    console.error("Meta webhook handler error:", err.message || err);
  }
}

app.get("/webhook", security.webhookLimiter, handleMetaWebhookGet);
app.post("/webhook", security.webhookLimiter, handleMetaWebhookPost);
app.get("/webhook/whatsapp", security.webhookLimiter, handleMetaWebhookGet);
app.post("/webhook/whatsapp", security.webhookLimiter, handleMetaWebhookPost);

/**
 * In-app test nudge for the open session (web toast via /api/events).
 * Same payloads as /demo/* — guest_* and E.164 both work. Dev/demo only.
 */
app.post("/api/nudge/test", security.chatLimiter, async (req, res) => {
  if (!security.demoEnabled()) {
    return res.status(404).json({ error: "Not found" });
  }
  const phone = normalizePhone(req.body.phone || req.query.phone);
  if (!phone) {
    return res.status(400).json({ error: "Open Reca first so we know which session to nudge." });
  }

  const kindWanted = String(req.body.kind || "auto").toLowerCase();
  const student = store.getStudent(phone);
  const order =
    kindWanted === "resurface" || kindWanted === "briefing" || kindWanted === "uni-update"
      ? [kindWanted]
      : ["resurface", "briefing", "uni-update"];

  const attempts = [];

  for (const kind of order) {
    if (kind === "resurface") {
      const idx = student.attempts.findIndex((a) => !a.isCorrect && !a.cleared);
      if (idx < 0) {
        attempts.push({ kind, ok: false, error: "No weak attempts yet. Miss a quiz question first." });
        continue;
      }
      const attempt = student.attempts[idx];
      const message = prepareResurface(phone, attempt, idx);
      store.pushOutbox(phone, message, "bot", {
        type: "resurface",
        title: "Quick recall",
        topicId: attempt.topicId,
        topicLabel: capitalizeTopic(attempt.topicId),
        questionText: attempt.questionText,
        correctAnswer: attempt.correctAnswer,
        accept: attempt.accept,
      });
      let whatsapp = null;
      try {
        await sendWhatsApp(phone, message);
        whatsapp = "sent";
      } catch (err) {
        whatsapp = `skipped: ${err.message}`;
      }
      return res.json({
        ok: true,
        kind: "resurface",
        message,
        channel: { web: true, whatsapp },
        attempts,
      });
    }

    if (kind === "briefing") {
      if (!student.attempts.length) {
        attempts.push({
          kind,
          ok: false,
          error: "No quiz attempts yet. Revise a topic first.",
        });
        continue;
      }
      student.lastBriefingDay = null;
      const progress = store.progressFor(phone);
      const focus = progress.nextWeakTopic || progress.dueForRecall?.[0] || null;
      const message = prepareDailyBriefing(phone);
      store.pushOutbox(phone, message, "bot", {
        type: "briefing",
        title: "Today's focus",
        topicId: focus?.topicId || null,
        topicLabel: focus?.label || progress.nextWeak || null,
      });
      let whatsapp = null;
      try {
        await sendWhatsApp(phone, message);
        whatsapp = "sent";
      } catch (err) {
        whatsapp = `skipped: ${err.message}`;
      }
      return res.json({
        ok: true,
        kind: "briefing",
        message,
        channel: { web: true, whatsapp },
        attempts,
      });
    }

    if (kind === "uni-update") {
      student.lastUniUpdateDay = null;
      const refreshTarget = student.targetUniversity || "general-jamb";
      await uniFeed.refreshForUniversity(refreshTarget);
      await uniFeed.refreshForUniversity("general-jamb");
      const prepared = prepareUniAdminUpdate(phone);
      if (!prepared) {
        attempts.push({
          kind,
          ok: false,
          error: "No university update available. Turn updates on under Exam & university.",
        });
        continue;
      }
      const { message, update, universityName } = prepared;
      store.pushOutbox(phone, message, "bot", {
        type: "uni-update",
        title: update.headline,
        updateId: update.id,
        universityName,
        category: update.category,
        sourceUrl: update.sourceUrl || null,
        source: update.source || null,
      });
      let whatsapp = null;
      try {
        await sendWhatsApp(phone, message);
        whatsapp = "sent";
      } catch (err) {
        whatsapp = `skipped: ${err.message}`;
      }
      return res.json({
        ok: true,
        kind: "uni-update",
        message,
        channel: { web: true, whatsapp },
        attempts,
      });
    }
  }

  return res.status(404).json({
    ok: false,
    error:
      attempts.map((a) => a.error).filter(Boolean).join(" ") ||
      "Couldn’t build a test nudge. Miss a quiz question, then try again.",
    attempts,
  });
});

/**
 * Manual hero trigger for live demo.
 * Always queues to web outbox; WhatsApp send is best-effort.
 * Requires DEMO_SECRET (header x-demo-secret) when set.
 */
app.post("/demo/resurface", security.requireDemoAccess, async (req, res) => {
  const phone = normalizePhone(req.body.phone || req.query.phone);
  if (!phone) {
    return res.status(400).json({ error: "Valid phone required" });
  }
  const student = store.getStudent(phone);

  let target = null;
  const idx = student.attempts.findIndex((a) => !a.isCorrect && !a.cleared);
  if (idx >= 0) target = { phone, attempt: student.attempts[idx], index: idx };

  if (!target) {
    return res.status(404).json({
      error: "No weak attempts to resurface. Answer a question wrong first (e.g. mitochondria)",
    });
  }

  const message = prepareResurface(target.phone, target.attempt, target.index);
  store.pushOutbox(target.phone, message, "bot", {
    type: "resurface",
    title: "Quick recall",
    topicId: target.attempt.topicId,
    topicLabel: capitalizeTopic(target.attempt.topicId),
    questionText: target.attempt.questionText,
    correctAnswer: target.attempt.correctAnswer,
    accept: target.attempt.accept,
  });

  let whatsapp = null;
  try {
    await sendWhatsApp(target.phone, message);
    whatsapp = "sent";
  } catch (err) {
    whatsapp = `skipped: ${err.message}`;
  }

  res.json({ ok: true, message, channel: { web: true, whatsapp } });
});

/**
 * Manual daily briefing for live demo / judges.
 * Uses weakest topic + days-to-exam (default WAEC_EXAM_DATE).
 */
app.post("/demo/briefing", security.requireDemoAccess, async (req, res) => {
  const phone = normalizePhone(req.body.phone || req.query.phone);
  if (!phone) {
    return res.status(400).json({ error: "Valid phone required" });
  }
  const student = store.getStudent(phone);
  if (!student.attempts.length) {
    return res.status(404).json({
      error: "No attempts yet. Revise a topic first so Reca knows a weak focus.",
    });
  }
  // Allow re-fire on stage even if already briefed today
  student.lastBriefingDay = null;
  const progress = store.progressFor(phone);
  const focus = progress.nextWeakTopic || progress.dueForRecall?.[0] || null;
  const message = prepareDailyBriefing(phone);
  store.pushOutbox(phone, message, "bot", {
    type: "briefing",
    title: "Today's focus",
    topicId: focus?.topicId || null,
    topicLabel: focus?.label || progress.nextWeak || null,
  });

  let whatsapp = null;
  try {
    await sendWhatsApp(phone, message);
    whatsapp = "sent";
  } catch (err) {
    whatsapp = `skipped: ${err.message}`;
  }

  res.json({
    ok: true,
    message,
    daysToExam: store.daysUntilExam(student.examDate),
    channel: { web: true, whatsapp },
  });
});

/**
 * Manual university admin update for live demo / judges.
 * Drops a curated POST-UTME / CAPS / admission reminder to web (+ WhatsApp if linked).
 */
app.post("/demo/uni-update", security.requireDemoAccess, async (req, res) => {
  const phone = normalizePhone(req.body.phone || req.query.phone);
  if (!phone) {
    return res.status(400).json({ error: "Valid phone required" });
  }
  const student = store.getStudent(phone);
  // Allow re-fire on stage even if already dropped today
  student.lastUniUpdateDay = null;

  // Refresh AI feed for student's target uni (or JAMB) before dropping
  const refreshTarget = student.targetUniversity || "general-jamb";
  const refreshResult = await uniFeed.refreshForUniversity(refreshTarget);
  await uniFeed.refreshForUniversity("general-jamb");

  const prepared = prepareUniAdminUpdate(phone);
  if (!prepared) {
    return res.status(404).json({
      error: "No university updates available. Pick a primary university in Settings → Exam & university.",
      feed: refreshResult,
    });
  }

  const { message, update, universityName } = prepared;
  store.pushOutbox(phone, message, "bot", {
    type: "uni-update",
    title: update.headline,
    updateId: update.id,
    universityName,
    category: update.category,
    sourceUrl: update.sourceUrl || null,
    source: update.source || null,
  });

  let whatsapp = null;
  try {
    await sendWhatsApp(phone, message);
    whatsapp = "sent";
  } catch (err) {
    whatsapp = `skipped: ${err.message}`;
  }

  res.json({
    ok: true,
    message,
    update: {
      id: update.id,
      headline: update.headline,
      universityName,
      source: update.source || "curated",
      sourceUrl: update.sourceUrl || null,
    },
    feed: refreshResult,
    channel: { web: true, whatsapp },
  });
});

/**
 * Refresh AI university feed from official sources (demo / admin).
 */
app.post("/demo/uni-feed-refresh", security.requireDemoAccess, async (req, res) => {
  const universityId = String(req.body.universityId || req.query.universityId || "").trim();
  const results = universityId
    ? [await uniFeed.refreshForUniversity(universityId)]
    : await uniFeed.refreshAllSources();
  res.json({ ok: true, results, status: uniFeed.feedStatus() });
});

app.get("/demo/uni-feed-status", security.requireDemoAccess, (_req, res) => {
  res.json({ ok: true, status: uniFeed.feedStatus() });
});

app.post("/debug/chat", security.requireDemoAccess, async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (!phone) return res.status(400).json({ error: "Valid phone required" });
  const body = String(req.body.body || "").slice(0, security.MAX_CHAT_CHARS);
  const replies = await handleIncoming(phone, body);
  res.json({ replies, student: store.getStudent(phone), llm: llm.providerLabel() });
});

app.get("/debug/due", security.requireDemoAccess, (_req, res) => {
  res.json({ due: store.listDue() });
});

cron.schedule("* * * * *", async () => {
  const due = store.listDue();
  for (const item of due) {
    try {
      const message = prepareResurface(item.phone, item.attempt, item.index);
      store.pushOutbox(item.phone, message, "bot", {
        type: "resurface",
        title: "Quick recall",
        topicId: item.attempt.topicId,
        topicLabel: capitalizeTopic(item.attempt.topicId),
        questionText: item.attempt.questionText,
        correctAnswer: item.attempt.correctAnswer,
        accept: item.attempt.accept,
      });
      try {
        await sendWhatsApp(item.phone, message);
      } catch (_) {
        /* web still gets it */
      }
      console.log(`↻ resurfaced → ${item.phone}`);
    } catch (err) {
      console.error("cron resurface failed", err.message);
    }
  }
});

/** Daily proactive briefing — companion study plan (Africa/Lagos morning). */
const briefingCron = process.env.BRIEFING_CRON || "0 7 * * *";
cron.schedule(
  briefingCron,
  async () => {
    const candidates = store.listBriefingCandidates();
    for (const student of candidates) {
      try {
        const progress = store.progressFor(student.phone);
        const focus = progress.nextWeakTopic || progress.dueForRecall?.[0] || null;
        const message = prepareDailyBriefing(student.phone);
        store.pushOutbox(student.phone, message, "bot", {
          type: "briefing",
          title: "Today's focus",
          topicId: focus?.topicId || null,
          topicLabel: focus?.label || progress.nextWeak || null,
        });
        try {
          await sendWhatsApp(student.phone, message);
        } catch (_) {
          /* web still gets it */
        }
        console.log(`☀ briefing → ${student.phone}`);
      } catch (err) {
        console.error("cron briefing failed", err.message);
      }
    }
  },
  { timezone: process.env.BRIEFING_TZ || "Africa/Lagos" }
);

/** Weekday university admin updates — POST-UTME, CAPS, admission (Africa/Lagos morning). */
const uniUpdateCron = process.env.UNI_UPDATE_CRON || "0 8 * * 1-5";
cron.schedule(
  uniUpdateCron,
  async () => {
    const candidates = store.listUniUpdateCandidates();
    for (const student of candidates) {
      try {
        const prepared = prepareUniAdminUpdate(student.phone);
        if (!prepared) continue;
        const { message, update, universityName } = prepared;
        store.pushOutbox(student.phone, message, "bot", {
          type: "uni-update",
          title: update.headline,
          updateId: update.id,
          universityName,
          category: update.category,
          sourceUrl: update.sourceUrl || null,
          source: update.source || null,
        });
        try {
          await sendWhatsApp(student.phone, message);
        } catch (_) {
          /* web still gets it */
        }
        console.log(`🎓 uni update → ${student.phone} (${universityName})`);
      } catch (err) {
        console.error("cron uni-update failed", err.message);
      }
    }
  },
  { timezone: process.env.UNI_UPDATE_TZ || process.env.BRIEFING_TZ || "Africa/Lagos" }
);

/** Fetch official admission pages + AI summarize (before weekday student drops). */
const uniFeedCron = process.env.UNI_FEED_CRON || "0 6 * * *";
cron.schedule(
  uniFeedCron,
  async () => {
    try {
      const results = await uniFeed.refreshAllSources();
      const fresh = results.filter((r) => r.hasUpdate).length;
      const changed = results.filter((r) => r.changed).length;
      console.log(`📡 uni feed refresh — ${changed} changed, ${fresh} new AI updates`);
    } catch (err) {
      console.error("cron uni-feed failed", err.message);
    }
  },
  { timezone: process.env.UNI_FEED_TZ || process.env.BRIEFING_TZ || "Africa/Lagos" }
);

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Reca listening on :${port}`);
    console.log(`Web chat:  http://localhost:${port}/chat.html`);
    console.log(`Signup:    http://localhost:${port}/signup.html`);
    console.log(`Demo fire: POST /demo/resurface | POST /demo/briefing | POST /demo/uni-update | POST /demo/uni-feed-refresh (header x-demo-secret)`);
    console.log(`Briefing cron: ${briefingCron} (${process.env.BRIEFING_TZ || "Africa/Lagos"})`);
    console.log(`Uni feed cron: ${uniFeedCron} (${process.env.UNI_FEED_TZ || process.env.BRIEFING_TZ || "Africa/Lagos"})`);
    console.log(`Uni updates cron: ${uniUpdateCron} (${process.env.UNI_UPDATE_TZ || process.env.BRIEFING_TZ || "Africa/Lagos"})`);
    if (uniFeed.isEnabled() && llm.isEnabled()) {
      uniFeed.refreshAllSources().catch((err) => {
        console.warn("Startup uni feed refresh skipped:", err.message);
      });
    }
  });
}

module.exports = app;
