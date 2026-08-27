# Reca — Live demo script (~90 seconds)

**Pitch line (say first):** Claude and ChatGPT remember when you come back. Reca comes to you first.

**If a judge cites Claude Memory, say:**  
> Claude and ChatGPT remember what you tell them when you come back and ask. Reca doesn’t wait for you to come back — it decides on its own when you’re due to forget something, and comes to you first.

**Persona on stage:** Chiamaka (SS3, WAEC Biology) — studying on her own phone after school  
**Channel:** WhatsApp via **Meta Cloud API** (demo phone must be on the Meta allow-list) · web chat backup at `/chat.html`  
**Hero moment:** Step 5 — Reca messages **first** (unprompted)

Related: [demo-topics.md](./demo-topics.md) · [conversation-copy.md](./conversation-copy.md) · [WHATSAPP-SETUP.md](./WHATSAPP-SETUP.md) · [security.md](./security.md)

---

## Before you go on stage (checklist)

- [ ] Demo phone on Meta WhatsApp **allow-list**
- [ ] Backup phone on allow-list
- [ ] Render warmed (`GET /health` 5–10 min before)
- [ ] Render env: `ENABLE_DEMO=true`, `DEMO_SECRET`, `META_*`, `DRY_RUN=false`, `NODE_ENV=production`
- [ ] Manual resurface ready on laptop:  
  `RECA_URL=https://…onrender.com DEMO_SECRET=… npm run resurface -- +234…`  
  (or curl with header `x-demo-secret`)
- [ ] Optional briefing: `POST /demo/briefing` with same secret
- [ ] Quiz path rehearsed (preset bank **or** live Gemini — answer whatever Q1 actually asks)
- [ ] This script rehearsed twice

---

## Spoken intro (15 sec)

> Millions of WAEC and JAMB students reread notes and still forget. Every chatbot can explain photosynthesis once. Their memory is passive — you have to come back and ask. Reca decides when you’re due to forget, and messages you first. Watch.

---

## Live WhatsApp flow (60–70 sec)

### Step 1 — Capture (you type)

```text
Explain photosynthesis simply
```

**Expect:** Short plain-language explanation (3–5 sentences).

### Step 2 — Quiz (Reca sends)

Reca asks **Q1** then **Q2** (one at a time).

**Preset-bank wording (if Gemini is off):**
- Q1: Which organelle captures sunlight for photosynthesis?
- Q2: What are the two main products of photosynthesis?

*(If Gemini is on, read the live question — still answer Q1 wrong on purpose.)*

### Step 3 — Wrong answer on purpose (you type)

```text
mitochondria
```

Then for Q2 (when asked):

```text
glucose and oxygen
```

**Expect:** Q1 not quite — chloroplast is correct; Reca says it will check again later. Q2 correct.

### Step 4 — Narrate for judges (5 sec)

> She got one wrong. A normal chatbot stops here. Reca stores that weak spot — and schedules the follow-up. She doesn’t have to come back and ask.

### Step 5 — HERO: unprompted resurface

**Trigger:** compressed cron (1–2 min) **or** teammate fires:

```bash
npm run resurface -- +234XXXXXXXXXX
```

(with `RECA_URL` + `DEMO_SECRET` set). There is **no** “Resurface now” button in the student UI.

**Do not type anything.** Wait for Reca to message first:

```text
Quick recall — which organelle captures sunlight for photosynthesis?
```

**You answer:**

```text
chloroplast
```

**Expect:** Correct / cleared. Offer next topic or Chemistry.

### Step 6 — Recap (you type)

```text
how am I doing in Biology?
```

**Expect:** Short summary — strong topics / needs work / photosynthesis cleared.

---

## Spoken close (10 sec)

> That’s the product: not another explainer — an active memory companion on WhatsApp, where students already study after school. Built on a free stack. Claude waits for you. Reca comes first.

---

## Backup if WhatsApp flakes

1. Show web chat on the **same** session — outbox nudge appears within ~4s after fire  
2. Fire manual resurface on a backup **allow-listed** phone  
3. Fire `/demo/briefing` to show the daily companion line  
4. If AI is down: unset Gemini / use preset — same photosynthesis script  

**Never improvise a new topic on stage.** Stick to photosynthesis (primary) or osmosis (backup) from [demo-topics.md](./demo-topics.md).

---

## Timing card (print / pin)

| Time | Action |
|------|--------|
| 0:00 | Pitch line |
| 0:15 | Send explain |
| 0:30 | Wrong answer |
| 0:40 | Narrate active memory |
| 0:45 | Resurface lands |
| 1:05 | Correct + recap |
| 1:20 | Close |
