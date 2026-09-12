# Reca — First-run onboarding (teens)

**Audience:** SS3 / JAMB candidates (teenagers)  
**Aha:** Miss a question → Reca says it will come back → student gets the product  
**Status:** Locked flow · implemented in `backend/public/onboarding.html`  
**Last updated:** 2026-09-11

---

## Principles

- Shortest path to aha (#9). Max **4** steps.  
- One job per screen (#2).  
- Exam before goal. Goal deferred.  
- Sell memory **before** WhatsApp link (decision 0002).  
- Skip allowed on WhatsApp with honest consequence.  
- Calm tutor voice — not IDE setup, not hype coach.

---

## UI pattern

**ChatGPT-style conversational setup** (not a form wizard):

- Reca messages left-aligned  
- User answers as right-side pills  
- Choice grids under the latest question  
- Skip → confirm modal → Go to Reca  
- Progress ticks at the bottom  

---

## Flow

```text
Signup / guest Start studying
  → 1 Exam: WAEC | JAMB | Both
  → 2 Subjects: pick 3–5 (Maths, English, Biology, Chemistry, Physics)
  → 3 WhatsApp: why-line → link (or Skip for now)
  → 4 Aha: one topic → quiz → miss → “I will check again”
  → Learn / chat with prefs saved
```

If `localStorage.reca_onboarding_done === "1"`, skip to chat.

---

## Screens

### 1. Exam
- Title: What are you prepping for?
- Choices: WAEC · JAMB · Both (single select cards)
- Primary: Continue (disabled until choice)
- Stores: `reca_exam_body` = `WAEC` | `JAMB` | `BOTH`

### 2. Subjects
- Title: Which subjects first?
- Multi-select chips, min 3, max 5
- Defaults: none selected (force choice) OR soft-suggest Maths + English for WAEC
- Primary: Continue
- Stores: `reca_subjects` = JSON string array

### 3. WhatsApp
- Title: So Reca can text you back
- Body: When you miss a topic, Reca messages you on WhatsApp days later. Link your number so that works.
- If phone already on session: show linked state + Continue
- Else: phone field + send code path **or** deep-link to signup link flow; MVP: capture number + Continue, OTP can reuse signup later
- Secondary: Skip for now (sets `reca_whatsapp_skipped=1`; Progress must still prompt)
- Stores: `reca_phone` when linked

### 4. Aha (first topic)
- Title: Try one topic now
- Seed: photosynthesis (Biology) or algebra if Maths-only
- Flow: explain → Q1 → student picks wrong option or types miss → Not quite + memory line
- Primary: Start studying → `/chat.html` with topic seed
- Sets: `reca_onboarding_done=1`

---

## Empty / error

- Continue disabled with helper: “Pick an exam” / “Pick at least 3 subjects”
- WhatsApp skip: “You can still study on the web. Recall texts need WhatsApp.”

---

## Non-goals (v1)

- Theme picker  
- Goal / career ambition  
- Parent email  
- 6–7 step wizards  
- Vim / IDE metaphors  
