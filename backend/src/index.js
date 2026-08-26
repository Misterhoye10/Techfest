require("dotenv").config();
const path = require("path");
const express = require("express");
const cron = require("node-cron");
const { handleIncoming, prepareResurface } = require("./engine");
const { startQuiz, answerQuiz, currentQuiz } = require("./quiz");
const { sendWhatsApp } = require("./twilio");
const store = require("./store");
const { copy } = require("./copy");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "reca",
    mode: process.env.ANTHROPIC_API_KEY ? "llm+preset" : "preset",
    chat: "/chat.html",
  });
});

app.get("/", (_req, res) => {
  res.redirect("/chat.html");
});

function normalizePhone(raw) {
  const p = String(raw || "").replace(/^whatsapp:/, "").trim();
  return p || "+2348000000001";
}

async function deliver(phone, text, { whatsapp = true } = {}) {
  store.pushOutbox(phone, text, "bot");
  if (!whatsapp) return;
  const dry = String(process.env.DRY_RUN).toLowerCase() === "true";
  if (dry) return;
  try {
    await sendWhatsApp(`whatsapp:${phone}`, text);
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
  const replies = handleIncoming(phone, body, { mode });
  const student = store.getStudent(phone);
  // Return only — outbox is for unprompted resurface (avoid duplicate bubbles)
  res.json({ ok: true, phone, replies, revise: reviseSnapshot(student) });
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
  const from = String(process.env.TWILIO_WHATSAPP_FROM || "").trim();
  const configured = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      from &&
      String(process.env.DRY_RUN).toLowerCase() !== "true"
  );
  res.json({
    ok: true,
    configured,
    from: from || null,
    webhookPath: "/webhook/whatsapp",
    tip: configured
      ? "Point Twilio Sandbox ‘when a message comes in’ at https://<public-host>/webhook/whatsapp"
      : "Add TWILIO_* to backend/.env (or set DRY_RUN=false)",
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
  const from = String(process.env.TWILIO_WHATSAPP_FROM || "").replace(/^whatsapp:/, "");
  res.json({
    ok: true,
    phone,
    progress: store.progressFor(phone),
    joinHint: from
      ? `On WhatsApp, open ${from} and send the Twilio join code (join …) if you haven’t already. Then message: explain photosynthesis`
      : "Join the Twilio WhatsApp sandbox, then message Reca.",
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
  const limit = Math.min(Number(req.query.limit) || 60, 200);
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
  res.json({ ok: true, phone, welcome: copy.welcome, revise: reviseSnapshot(student) });
});

/** Twilio WhatsApp webhook (optional) */
app.post("/webhook/whatsapp", async (req, res) => {
  const from = req.body.From || req.body.from;
  const body = req.body.Body || req.body.body || "";
  console.log(`← ${from}: ${body}`);
  res.status(200).type("text/xml").send("<Response></Response>");
  if (!from) return;

  const phone = from.replace(/^whatsapp:/, "");
  const replies = handleIncoming(phone, body);
  for (const msg of replies) {
    await deliver(phone, msg, { whatsapp: true });
  }
});

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
  store.pushOutbox(target.phone, message, "bot");

  let whatsapp = null;
  try {
    await sendWhatsApp(`whatsapp:${target.phone}`, message);
    whatsapp = "sent";
  } catch (err) {
    whatsapp = `skipped: ${err.message}`;
  }

  res.json({ ok: true, message, channel: { web: true, whatsapp } });
});

app.post("/debug/chat", (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const body = req.body.body || "";
  const replies = handleIncoming(phone, body);
  res.json({ replies, student: store.getStudent(phone) });
});

app.get("/debug/due", (_req, res) => {
  res.json({ due: store.listDue() });
});

cron.schedule("* * * * *", async () => {
  const due = store.listDue();
  for (const item of due) {
    try {
      const message = prepareResurface(item.phone, item.attempt, item.index);
      store.pushOutbox(item.phone, message, "bot");
      try {
        await sendWhatsApp(`whatsapp:${item.phone}`, message);
      } catch (_) {
        /* web still gets it */
      }
      console.log(`↻ resurfaced → ${item.phone}`);
    } catch (err) {
      console.error("cron resurface failed", err.message);
    }
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Reca listening on :${port}`);
  console.log(`Web chat:  http://localhost:${port}/chat.html`);
  console.log(`Demo fire: POST /demo/resurface { "phone": "..." }`);
});
