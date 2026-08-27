# Reca — Live demo script (~90 seconds)

**Pitch line (say first):** Claude and ChatGPT remember when you come back. Reca comes to you first.

**If a judge cites Claude Memory, say:**  
> Claude and ChatGPT remember what you tell them when you come back and ask. Reca doesn’t wait for you to come back — it decides on its own when you’re due to forget something, and comes to you first.

**Persona on stage:** Chiamaka (SS3, WAEC Biology) — studying on her own phone after school  
**Channel:** WhatsApp (Twilio sandbox — demo phone must be joined) · web chat backup at `/chat.html`  
**Hero moment:** Step 5 — Reca messages **first** (unprompted)

Related: [demo-topics.md](./demo-topics.md) · [conversation-copy.md](./conversation-copy.md) · [BUILD-REQUIREMENTS.md](./BUILD-REQUIREMENTS.md)

---

## Before you go on stage (checklist)

- [ ] Demo phone joined to sandbox
- [ ] Backup phone joined
- [ ] Hosting warmed (open health URL 5–10 min before)
- [ ] Manual resurface trigger ready: `POST /demo/resurface`
- [ ] Optional briefing trigger: `POST /demo/briefing` (“23 days to WAEC…”)
- [ ] Pre-seeded student profile optional (if live AI fails)
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

Reca asks **Q1** and **Q2** (or Q1 first — answer one at a time if that’s how backend works).

**For the demo, use the known pair from topics doc:**
- Q1: Which part of the plant cell captures sunlight for photosynthesis?
- Q2: What are the two main products of photosynthesis?

### Step 3 — Wrong answer on purpose (you type)

```text
Q1 mitochondria, Q2 glucose and oxygen
```

*(Or answer Q1 only as `mitochondria` if one-at-a-time.)*

**Expect:** Q2 correct / Q1 not quite — chloroplast is correct; Reca says it will check again later.

### Step 4 — Narrate for judges (5 sec)

> She got one wrong. A normal chatbot stops here. Reca stores that weak spot — and schedules the follow-up. She doesn’t have to come back and ask.

### Step 5 — HERO: unprompted resurface

**Trigger:** compressed cron (1–2 min) **or** teammate hits manual `/demo/resurface` / admin fire.

**Do not type anything.** Wait for Reca to message first:

```text
Quick recall — which part of the plant cell captures sunlight for photosynthesis?
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

1. Show Twilio/Meta logs + DB row: attempt stored with `next_review_date`  
2. Fire manual resurface on a backup joined phone  
3. Fire `/demo/briefing` to show the daily companion line  
4. If AI is down: use pre-seeded photosynthesis session (same scripted messages)

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
