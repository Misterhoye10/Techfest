require("dotenv").config();
const path = require("path");
const express = require("express");
const cron = require("node-cron");
const { handleIncoming, prepareResurface } = require("./engine");
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
  const replies = handleIncoming(phone, body);
  // Return only — outbox is for unprompted resurface (avoid duplicate bubbles)
  res.json({ ok: true, phone, replies });
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
  store.getStudent(phone);
  res.json({ ok: true, phone, welcome: copy.welcome });
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
