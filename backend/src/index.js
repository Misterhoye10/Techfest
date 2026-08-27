require("dotenv").config();
const path = require("path");
const express = require("express");
const cron = require("node-cron");
const { handleIncoming, prepareResurface, prepareDailyBriefing } = require("./engine");
const { startQuiz, answerQuiz, currentQuiz, endQuiz } = require("./quiz");
const { sendWhatsApp, parseInbound, isConfigured, displayNumber, verifyToken } = require("./whatsapp");
const store = require("./store");
const { copy } = require("./copy");
const llm = require("./llm");
const otp = require("./otp");
const db = require("./db");
const alerts = require("./alerts");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", async (_req, res) => {
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
    whatsappNumber: alerts.whatsappBusinessDigits(),
    continueExample: alerts.continueOnWhatsAppUrl("photosynthesis"),
    alertProxy: "/api/send-alert",
  });
});

app.get("/", (_req, res) => {
  res.redirect("/signup.html");
});

function whatsappFromNumber() {
  return displayNumber() || `+${alerts.whatsappBusinessDigits()}`;
}

function shouldEchoOtp() {
  const dry = String(process.env.DRY_RUN).toLowerCase() === "true";
  return dry || String(process.env.OTP_ECHO).toLowerCase() === "true";
}

async function handleRequestOtp(req, res) {
  try {
    const phone = store.normalizePhoneE164(req.body.phone);
    if (!phone) {
      return res.status(400).json({
        error: "Enter a valid WhatsApp number — e.g. +2348012345678",
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
        return res.status(404).json({
          error: "No Reca account on this number yet — switch to New student.",
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

    console.log(`[otp] ${phone} → ${issued.code} (${purpose}) delivered=${delivered}`);

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
        : "Couldn’t reach WhatsApp yet — allow-list this number in Meta, then Resend. Local demo: OTP_ECHO=true.",
    };

    if (shouldEchoOtp()) payload.devCode = issued.code;
    if (!delivered && deliverNote) payload.deliverError = deliverNote;

    res.json(payload);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || "Couldn’t send code" });
  }
}

app.post("/api/auth/request-otp", handleRequestOtp);
app.post("/api/auth/signup", (req, res) => {
  req.body.purpose = "signup";
  return handleRequestOtp(req, res);
});
app.post("/api/auth/login", (req, res) => {
  req.body.purpose = "signin";
  return handleRequestOtp(req, res);
});

/**
 * Step 2 — verify code → create/open account.
 * Body: { phone, code, name? }
 */
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const phone = store.normalizePhoneE164(req.body.phone);
    if (!phone) {
      return res.status(400).json({
        error: "Enter a valid WhatsApp number — e.g. +2348012345678",
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
      dbSync = { ok: false, error: err.message };
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
          ? "You’re in. Message Reca on WhatsApp anytime — Progress stays in sync."
          : "Welcome back. Your Progress is ready.",
    });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message || "Couldn’t verify code" });
  }
});

/**
 * Proxy to live Render WhatsApp alerts (Meta lives on that server).
 * Body: { phone, message } — phone may include + or not.
 */
app.post("/api/send-alert", async (req, res) => {
  try {
    const result = await alerts.sendAlert({
      phone: req.body.phone,
      message: req.body.message,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message || "Alert failed" });
  }
});

function normalizePhone(raw) {
  return store.normalizePhoneE164(raw) || "+2348000000001";
}

function capitalizeTopic(topicId) {
  return String(topicId || "")
    .split("-")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

async function deliver(phone, text, { whatsapp = true } = {}) {
  store.pushOutbox(phone, text, "bot");
  if (!whatsapp) return;
  const dry = String(process.env.DRY_RUN).toLowerCase() === "true";
  if (dry) return;
  try {
    await sendWhatsApp(phone, text);
  } catch (err) {
    console.error("WhatsApp deliver skipped/failed:", err.message);
  }
}

/** Web chat API — primary demo path when Meta/Twilio blocked */
app.post("/api/chat", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const body = String(req.body.body || "").trim();
  if (!body) return res.status(400).json({ error: "body required" });

  store.getStudent(phone);
  const mode = req.body.mode === "learn" ? "learn" : "chat";
  const topicId = req.body.topicId ? String(req.body.topicId) : undefined;
  const fresh = Boolean(req.body.fresh);
  const replies = await handleIncoming(phone, body, { mode, topicId, fresh });
  const student = store.getStudent(phone);
  // Return only — outbox is for unprompted resurface (avoid duplicate bubbles)
  res.json({
    ok: true,
    phone,
    replies,
    revise: reviseSnapshot(student),
    learnFocusId: student.learnFocusId || null,
    llm: llm.providerLabel(),
  });
});

app.post("/api/quiz/start", (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const result = startQuiz(phone, req.body.topicId);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.post("/api/quiz/answer", (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const answer = String(req.body.answer || "").trim();
  if (!answer) return res.status(400).json({ error: "answer required" });
  const result = answerQuiz(phone, answer);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.post("/api/quiz/end", (req, res) => {
  const phone = normalizePhone(req.body.phone);
  res.json(endQuiz(phone));
});

app.get("/api/quiz/current", (req, res) => {
  const phone = normalizePhone(req.query.phone);
  res.json(currentQuiz(phone));
});

app.get("/api/progress", (req, res) => {
  const phone = normalizePhone(req.query.phone);
  const subject = String(req.query.subject || "").trim() || null;
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
    phoneNumberId: process.env.META_PHONE_NUMBER_ID ? "set" : null,
    webhookPath: "/webhook",
    tip: configured
      ? "Point Meta WhatsApp webhook to https://<public-host>/webhook (GET verify + POST messages)"
      : "Add META_PHONE_NUMBER_ID + META_ACCESS_TOKEN to backend/.env",
  });
});

/** Link web session to a real WhatsApp number (E.164). */
app.post("/api/whatsapp/link", (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (!/^\+\d{10,15}$/.test(phone)) {
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
  const q = String(req.query.q || "").trim().toLowerCase();
  const subject = String(req.query.subject || "").trim();
  let list = topics;
  if (subject && subject !== "All") {
    list = list.filter((t) => t.subject.toLowerCase() === subject.toLowerCase());
  }
  if (q) {
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.id.includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.aliases || []).some((a) => a.includes(q))
    );
  }
  const limit = Math.min(Number(req.query.limit) || 200, 400);
  const offset = Number(req.query.offset) || 0;
  const slice = list.slice(offset, offset + limit);
  res.json({
    stats: stats(),
    total: list.length,
    offset,
    limit,
    topics: slice.map((t) => ({
      id: t.id,
      subject: t.subject,
      label: t.title,
      send: `explain ${t.aliases?.[0] || t.title}`,
      icon: t.icon || "book-01",
      questionCount: t.questions?.length || 0,
      aliases: t.aliases,
    })),
  });
});

app.get("/api/revise", (req, res) => {
  const phone = normalizePhone(req.query.phone);
  const student = store.getStudent(phone);
  res.json({ ok: true, phone, revise: reviseSnapshot(student) });
});

/** Poll for unprompted messages (resurface aha) */
app.get("/api/events", (req, res) => {
  const phone = normalizePhone(req.query.phone);
  const after = req.query.after || "";
  const messages = store.drainOutbox(phone, after);
  res.json({ phone, messages });
});

app.post("/api/session", (req, res) => {
  const phone = normalizePhone(req.body.phone || `+2348${Date.now().toString().slice(-9)}`);
  const student = store.getStudent(phone);
  if (req.body.name) store.setDisplayName(phone, req.body.name);
  if (req.body.examDate) {
    try {
      store.setExamDate(phone, req.body.examDate);
    } catch (_) {
      /* keep default */
    }
  }
  res.json({
    ok: true,
    phone,
    welcome: copy.welcome,
    revise: reviseSnapshot(student),
    examDate: student.examDate,
    examLabel: student.examLabel,
    daysToExam: store.daysUntilExam(student.examDate),
    displayName: student.displayName,
  });
});

app.post("/api/profile", (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const student = store.getStudent(phone);
    if (req.body.name != null) store.setDisplayName(phone, req.body.name);
    if (req.body.examDate) store.setExamDate(phone, req.body.examDate);
    if (req.body.examLabel) {
      student.examLabel = String(req.body.examLabel).trim().slice(0, 24) || student.examLabel;
    }
    res.json({
      ok: true,
      phone,
      displayName: student.displayName,
      examDate: student.examDate,
      examLabel: student.examLabel,
      daysToExam: store.daysUntilExam(student.examDate),
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
  // Ack immediately (Meta retries if slow)
  res.sendStatus(200);

  try {
    const inbound = parseInbound(req.body);
    if (!inbound.length) return;

    for (const msg of inbound) {
      console.log(`← Meta ${msg.phone}: ${msg.text}`);
      const replies = await handleIncoming(msg.phone, msg.text);
      for (const text of replies) {
        await deliver(msg.phone, text, { whatsapp: true });
      }
    }
  } catch (err) {
    console.error("Meta webhook handler error:", err.message || err);
  }
}

app.get("/webhook", handleMetaWebhookGet);
app.post("/webhook", handleMetaWebhookPost);
app.get("/webhook/whatsapp", handleMetaWebhookGet);
app.post("/webhook/whatsapp", handleMetaWebhookPost);

/**
 * Manual hero trigger for live demo.
 * Always queues to web outbox; WhatsApp send is best-effort.
 */
app.post("/demo/resurface", async (req, res) => {
  const phone = normalizePhone(req.body.phone || req.query.phone);
  const student = store.getStudent(phone);

  let target = null;
  const idx = student.attempts.findIndex((a) => !a.isCorrect && !a.cleared);
  if (idx >= 0) target = { phone, attempt: student.attempts[idx], index: idx };

  if (!target) {
    return res.status(404).json({
      error: "No weak attempts to resurface — answer a question wrong first (e.g. mitochondria)",
    });
  }

  const message = prepareResurface(target.phone, target.attempt, target.index);
  store.pushOutbox(target.phone, message, "bot", {
    type: "resurface",
    title: "Quick recall",
    topicId: target.attempt.topicId,
    topicLabel: capitalizeTopic(target.attempt.topicId),
    questionText: target.attempt.questionText,
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
app.post("/demo/briefing", async (req, res) => {
  const phone = normalizePhone(req.body.phone || req.query.phone);
  const student = store.getStudent(phone);
  if (!student.attempts.length) {
    return res.status(404).json({
      error: "No attempts yet — revise a topic first so Reca knows a weak focus.",
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

app.post("/debug/chat", async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const body = req.body.body || "";
  const replies = await handleIncoming(phone, body);
  res.json({ replies, student: store.getStudent(phone), llm: llm.providerLabel() });
});

app.get("/debug/due", (_req, res) => {
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

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Reca listening on :${port}`);
    console.log(`Web chat:  http://localhost:${port}/chat.html`);
    console.log(`Signup:    http://localhost:${port}/signup.html`);
    console.log(`Demo fire: POST /demo/resurface | POST /demo/briefing`);
    console.log(`Briefing cron: ${briefingCron} (${process.env.BRIEFING_TZ || "Africa/Lagos"})`);
  });
}

module.exports = app;
