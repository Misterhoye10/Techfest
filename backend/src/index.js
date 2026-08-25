require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const { handleIncoming, prepareResurface } = require("./engine");
const { sendWhatsApp } = require("./twilio");
const store = require("./store");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "reca", mode: process.env.ANTHROPIC_API_KEY ? "llm+preset" : "preset" });
});

/** Twilio WhatsApp webhook */
app.post("/webhook/whatsapp", async (req, res) => {
  const from = req.body.From || req.body.from;
  const body = req.body.Body || req.body.body || "";
  console.log(`← ${from}: ${body}`);

  // Respond to Twilio quickly
  res.status(200).type("text/xml").send("<Response></Response>");

  if (!from) return;

  const phone = from.replace(/^whatsapp:/, "");
  const replies = handleIncoming(phone, body);
  for (const msg of replies) {
    try {
      await sendWhatsApp(from, msg);
    } catch (err) {
      console.error("send failed", err.message);
    }
  }
});

/** Manual hero trigger for live demo — judges wow moment */
app.post("/demo/resurface", async (req, res) => {
  const phone = (req.body.phone || req.query.phone || "").replace(/^whatsapp:/, "");
  if (!phone) {
    return res.status(400).json({ error: "Pass phone like +234..." });
  }

  const due = store.listDue(Date.now() + 365 * 24 * 3600 * 1000); // include all pending wrongs
  const mine = due.filter((d) => d.phone === phone || d.phone.endsWith(phone.replace(/^\+/, "")));
  const pick =
    mine[0] ||
    store.listDue(Date.now() + 365 * 24 * 3600 * 1000).find((d) => d.phone.includes(phone.slice(-10)));

  // Prefer any uncleared wrong for this phone even if not "due" yet (demo override)
  const student = store.getStudent(phone);
  let target = pick;
  if (!target) {
    const idx = student.attempts.findIndex((a) => !a.isCorrect && !a.cleared);
    if (idx >= 0) target = { phone, attempt: student.attempts[idx], index: idx };
  }

  if (!target) {
    return res.status(404).json({ error: "No weak attempts to resurface for this phone" });
  }

  const message = prepareResurface(target.phone, target.attempt, target.index);
  await sendWhatsApp(`whatsapp:${target.phone}`, message);
  res.json({ ok: true, message });
});

/** Local simulate without Twilio */
app.post("/debug/chat", (req, res) => {
  const phone = req.body.phone || "+10000000000";
  const body = req.body.body || "";
  const replies = handleIncoming(phone, body);
  res.json({ replies, student: store.getStudent(phone) });
});

app.get("/debug/due", (_req, res) => {
  res.json({ due: store.listDue() });
});

// Auto resurface every minute — uses RESURFACE_MINUTES on each attempt
cron.schedule("* * * * *", async () => {
  const due = store.listDue();
  for (const item of due) {
    try {
      const message = prepareResurface(item.phone, item.attempt, item.index);
      await sendWhatsApp(`whatsapp:${item.phone}`, message);
      console.log(`↻ resurfaced → ${item.phone}`);
    } catch (err) {
      console.error("cron resurface failed", err.message);
    }
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Reca listening on :${port}`);
  console.log(`Webhook: POST /webhook/whatsapp`);
  console.log(`Demo fire: POST /demo/resurface  { "phone": "+234..." }`);
  console.log(`Local test: POST /debug/chat { "phone": "+234...", "body": "explain photosynthesis" }`);
});
