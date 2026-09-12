# Reca — Discovery

**Product:** Reca  
**Market wedge:** Nigeria first (WAEC + JAMB)  
**Status:** Rebuild thesis lock (post–AI BuildFest)  
**Last updated:** 2026-09-10

---

## JTBD (one line)

When I’m preparing for WAEC or JAMB alone, help me **know what I’ve forgotten and force me to practise it again** — without downloading another dead app or hiring a tutor I can’t afford.

---

## Who this is for

### Primary — SS3 / WASSCE candidate (e.g. Chiamaka)

- Public or mid-tier private secondary school in Nigeria  
- Studies from photocopied notes, shared textbooks, occasional lesson teacher  
- Goal: credits in five subjects including English and Maths → tertiary path  
- Frustration: rereading feels like learning; past questions expose the freeze  

### Primary — JAMB / UTME candidate or retaker (e.g. Tobi)

- Finished SS or repeating for a better score / course  
- Often self-studying while working or waiting  
- Goal: raise UTME score for target course/university  
- Frustration: no teacher, no map of weak topics, forgetting between sessions  

### Secondary (v1 aware, not primary UI)

- Parents who pay for data / want proof of effort  
- Tutorial centres / school teachers who want cohort progress later  

---

## Problem map — WAEC & JAMB in Nigeria

### A. Learning & prep (Reca owns this)

| Challenge | What it looks like | Product implication |
|-----------|--------------------|---------------------|
| Illusion of mastery | Rereading / watching once feels like knowing | Explain → **test** every topic |
| No feedback loop | Crowded classes, little 1:1 | Instant grade + correction in-product |
| Forgetting curve | Gone by next week | Unprompted resurface (hero) |
| Wrong methods | Highlighting, passive notes | Active recall by default |
| Exam-format gap | Knows content, fails how the board asks | WAEC/JAMB-framed practice inside Revise |
| English + Maths gate | Credits block progression | Core subject priority includes both |
| Lonely retake | JAMB retakers study alone | Low-friction daily habit + memory |

### B. Access & infrastructure (shapes design)

| Challenge | Product implication |
|-----------|---------------------|
| Data / shared phones | Low-data web; short WhatsApp messages |
| CBT readiness (JAMB; WAEC moving CBT) | Practice that feels exam-like; don’t assume desktop fluency |
| Uneven teaching quality | Plain-language explanations as default |
| Power / network drops | Graceful errors; retry; don’t lose attempt history |

### C. System & integrity (context — not Reca’s product)

- Organised malpractice / “miracle centres”  
- Tech-enabled fraud and registration abuse  
- Board glitches and result distrust  
- High stakes → shortcut culture  

**Implication:** Reca is a **understanding + retention** product, never an answer-key or malpractice aid. Ethical line is also trust.

### D. Emotional & social pressure

- Family pride and one-sitting life outcomes  
- Fear of “stupid” questions in class  
- Panic cramming near exam dates  

**Implication:** Voice = calm tutor (#9), not another scolding adult.

---

## What Reca owns vs does not

| Owns | Does not own |
|------|----------------|
| Retention & weak-topic memory | Exam-board integrity / CBT centres |
| Plain-language explain + practise | Replacing school instruction |
| Habit across web + WhatsApp | Guaranteeing credits or UTME scores |
| Progress clarity (“what I don’t know”) | Power, NIN, registration fraud |
| Exam-*style* practice over time | Licensed official paper banks (unless secured) |

---

## Insights vs hypotheses

### Observed / well-established (public context)

- Millions sit WASSCE / UTME annually; English + Maths credits remain a hard gate.  
- JAMB is CBT; WAEC is moving toward CBT — digital practice literacy matters.  
- WhatsApp is the default messaging habit for Nigerian students.  
- Passive study and forgetting are universal exam-prep failures (spaced retrieval is evidence-backed).  

### Hypotheses (validate in pilot — principle #10)

- Students will reply to unprompted WhatsApp resurfaces if questions are short (one Q, not a quiz dump).  
- Web Learn/Revise will stick if Progress makes weak topics visible and “clearable.”  
- Curated packs beat unconstrained LLM for diagrams and calculation steps.  
- Linking WhatsApp at onboarding is acceptable if the memory promise is clear.  

**Research ask (next):** 5–8 SS3 / JAMB candidates — how they study today, where they freeze, whether they’d answer a 9am recall ping.

---

## Competitive / reference landscape

Internal Replicate Lab references for this problem space are thin — do not invent. External comps for **transferable patterns only** (not copy):

| Comp | Transferable | Not transferable |
|------|--------------|------------------|
| Duolingo | Streaks, short sessions, come-back nudges | Gamification noise over exam syllabus |
| Anki | Spaced repetition as the product | Power-user UX; no WAEC framing |
| uLesson / Pass.ng / local CBT apps | Local exam awareness, subject packs | App download friction; weak “memory over time” story |

---

## Dual-surface implication (locked)

Discovery supports **web as study workspace** and **WhatsApp as memory delivery** — same attempt history. See [vision.md](./vision.md).

---

## Success for discovery lock

- JTBD is one sentence and undisputed by the team.  
- Own / don’t-own table is cited when scoping features.  
- Pilot research questions are listed before inventing new surfaces.
