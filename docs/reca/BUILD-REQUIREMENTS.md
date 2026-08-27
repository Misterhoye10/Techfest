# Reca — Build Requirements (Hackathon MVP)

**Track:** AI BuildFest 2026 · Track 3 · Case Study 2 — AI Study Companion  
**Product:** Reca only (not Nexus)  
**Platform:** WhatsApp  
**Budget:** **Free tools / free tiers only** — no paid APIs or paid hosting for the MVP  
**One-liner for judges:** ChatGPT forgets. Reca doesn’t — it remembers what you got wrong and comes back.

This is the build checklist. Full product detail lives in [product-prd.md](./product-prd.md). Full tech detail lives in [technical-prd.md](./technical-prd.md). Free stack detail: [FREE-STACK.md](./FREE-STACK.md).

---

## 1. What we must demo live

One full loop in under ~90 seconds:

1. Student sends a topic (`explain photosynthesis`)
2. Reca explains simply (WAEC/JAMB level)
3. Reca asks 2 practice questions
4. Student gets one wrong
5. Reca grades and says it will check again later
6. **Unprompted resurface** — Reca messages first with the weak question
7. Student answers correctly
8. Optional: `how am I doing in Biology?` recap

If step 6 fails live, we look like every other study chatbot.

---

## 2. Must build (in order)

| # | Requirement | Done when |
|---|-------------|-----------|
| 1 | WhatsApp in/out (Twilio sandbox or Meta test number) | Send a message → get a reply on a real phone |
| 2 | Explain + quiz via Claude | Topic in → short explanation + 2 questions out |
| 3 | Grade + store | Answer graded; wrong answers saved in Supabase with `next_review_date` |
| 4 | Resurface (hero) | Cron or manual trigger sends weak question unprompted (1–2 min compressed timer for demo) |
| 5 | Recap | `how am I doing in Biology?` returns strong / needs work from DB |

### MVP feature list (product)

- Topic submission by text (`explain X`)
- Plain-language explanation, WAEC/JAMB level
- Auto-generated 2–3 practice questions per topic
- Instant grading with correction feedback
- Spaced-repetition logging (fixed interval; compressed for demo)
- Scheduled, unprompted resurfacing message
- `How am I doing?` progress recap on request
- Coverage for demo: **Biology + Chemistry**, 8–10 curated topics

---

## 3. Do not build (out of scope for this fest)

- Photo-of-notes / OCR / PDF upload **during the live demo window**
- Companion web dashboard (unless Day 2 has spare time after loop is solid)
- Full syllabus across all subjects
- True SM-2 adaptive spaced repetition
- Yoruba / Igbo / Hausa
- Parent or teacher progress dashboard
- Nexus / Case Study 3 features
- Fancy marketing UI / Nomi-style shopping carousels
- Fine-tuned “trained on my past questions” models

**Locked next slice (after resurface is green):** one photo of a past question/notes → explain + 2 quiz questions → misses still resurface. See [decisions/0001-capture-and-visual-answers.md](./decisions/0001-capture-and-visual-answers.md).

Stretch only if Day 1 loop is green and Day 2 morning resurface works:

- Photo-of-notes input (that next slice)
- Teaching diagrams in answers when they clarify the concept
- Difficulty scaling

---

## 4. Tech stack (locked — free only)

**Rule:** If it requires a credit card charge to ship the demo, we don’t use it. Prefer sandbox / free tier / existing credits only. See [FREE-STACK.md](./FREE-STACK.md).

| Layer | Tool | Cost |
|-------|------|------|
| Messaging | Meta WhatsApp Cloud API **or** Twilio Sandbox | Free / sandbox |
| Backend | Node.js + Express | Free |
| AI | Claude API (existing credits) **or** free-tier LLM if credits run out | Existing credits / free tier |
| Database | Supabase Postgres (free tier) | Free |
| Scheduler | node-cron in-process (+ **manual demo trigger backup**) | Free |
| Hosting | Render **or** Railway free web service | Free |
| Repo / IDE | GitHub + Cursor | Free / already owned |
| Tunnel (local webhook test) | ngrok free **or** Cloudflare Tunnel | Free |

**Do not add:** paid WhatsApp BSP, paid vector DBs, paid analytics, paid auth, paid hosting upgrades, paid SMS.

### Data model (minimum)

- **students** — id, phone_number, name (optional), created_at
- **topics** — id, subject (Biology / Chemistry), topic_name, syllabus_level
- **attempts** — id, student_id, topic_id, question_text, student_answer, is_correct, attempted_at, next_review_date, review_count
- **conversations** (optional) — demo transcript logging

### Core prompts

1. **Explain + questions** → JSON `{ explanation, questions: [{ id, text }] }`
2. **Grade** → JSON `{ is_correct, feedback }`
3. **Recap** → mostly from DB; optional Claude polish sentence

### Scheduling (MVP)

- Wrong answer → set `next_review_date` (fixed interval; **compress to 1–2 minutes for live demo**)
- Correct retry → mark cleared / stop scheduling that item
- Cron finds due attempts → send resurface via WhatsApp
- Always keep a **manual “fire resurface now”** path for the demo

---

## 5. Case Study 2 coverage (must map cleanly)

| Case study need | Reca response |
|-----------------|---------------|
| Accept topics / notes / objectives | WhatsApp topic text (photo = stretch) |
| Summarise / explain simply | Explain step |
| Practice questions | 2–3 questions per topic |
| Feedback on answers | Instant grading |
| Identify weak topics | Stored incorrect attempts |
| Personalised plan | Spaced resurfacing from weak topics |
| Track progress | Recap command |
| Adjust difficulty | Stretch only |

---

## 6. Day plan

### Day 1 — finish line tonight

Capture → explain → quiz → grade → stored in DB  
(**no scheduler required yet**)

1. WhatsApp round-trip working
2. Claude explain + questions tested on 8 sample topics
3. Grading tested on right / wrong / partial answers
4. Supabase schema live; attempts writing correctly

### Day 2

1. Morning: resurface cron + manual backup trigger
2. Midday: recap command
3. Afternoon: full demo rehearsal ×2, bugfix, deck
4. Evening: submit

---

## 7. Roles

| Role | Owns |
|------|------|
| Backend | Webhook, Claude prompts, Supabase, cron, deploy |
| Design / copy | Conversation tone, onboarding first message, 90s demo script |
| BA / content | 8–10 Bio/Chem topics, sample answers, privacy narrative, test runs |

---

## 8. Risks (and required mitigations)

| Risk | Mitigation |
|------|------------|
| WhatsApp API / sandbox flaky in front of judges | Prove round-trip early; keep manual resurface trigger |
| Cron too slow for live demo | 1–2 min interval + manual fire |
| LLM grading too strict on phrasing | Lenient matching |
| Rate limits mid-demo | Pre-seed 1–2 student profiles as backup |
| Scope creep | This file is the contract — no new features without cutting something else |

---

## 9. Success criteria

**Demo:** one full loop live — capture → explain → test → grade → **resurface** → recap  

**Pitch line:** We don’t just teach — we remember what you got wrong and come back.

**Competitive rule:** If we only ship explain + quiz, we do not stand out among ~5,000 teams. Resurface is non-negotiable.

---

## 10. Related docs (same folder)

| File | Purpose |
|------|---------|
| [product-prd.md](./product-prd.md) | Full product PRD |
| [technical-prd.md](./technical-prd.md) | Architecture & prompts |
| [investor-brief.md](./investor-brief.md) | Pitch / why us |
| [decision-brief-reca-vs-nexus.md](./decision-brief-reca-vs-nexus.md) | Why Reca only |
| [../archive/](../archive/) | Older generic Study Companion PRD (do not build) |
