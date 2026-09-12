# Reca — Vision

**Product:** Reca  
**Wedge:** 1A — Nigeria first (WAEC + JAMB deep)  
**Surface:** 2B — Web/app primary study workspace + WhatsApp as required memory channel  
**Last updated:** 2026-09-10

---

## One-line thesis

Reca is the **memory layer for Nigerian exam prep**: Learn and Revise in the app; Reca messages first on WhatsApp when you’re about to forget.

---

## Global craft, not global launch

“Global standard” means **craft and reliability**, not shipping every curriculum on day one.

### Five craft bars

1. **One primary job** — know what you forgot; practise until it sticks (principle #2)  
2. **Defaults finished** — empty, loading, error, zero-data on every core screen (#3)  
3. **Exam honesty** — WAEC/JAMB framing; curated diagrams/past-Q packs; no fake official papers; no LLM-invented labels  
4. **Retention engine** — unprompted WhatsApp resurface + Progress on web that shows the same weak topics  
5. **Access** — low-data web, short WhatsApp messages, 44px targets, real copy (#6 / #7)

---

## Dual-surface rule (non-negotiable)

> **Web is where you study. WhatsApp is where Reca comes back.**  
> Same memory. Same weak topics. Same identity. Never two products.

| Surface | Owns | Does not own |
|---------|------|--------------|
| **Web app** | Learn, Revise (incl. past questions), Progress, deep study (diagrams, calculations) | Replacing WhatsApp as the only resurface path in v1 |
| **WhatsApp** | Unprompted resurface, quick answer/grade, light topic ask when web isn’t open | Full syllabus browser, diagram studio, long dashboards |

If WhatsApp becomes “optional notifications,” Reca collapses into a generic study chatbot.  
If web stays a thin companion, we waste Learn / Revise / diagram work already started.

See decision: [decisions/0002-whatsapp-required-habit-channel.md](./decisions/0002-whatsapp-required-habit-channel.md).

---

## Shared product loop

1. **Capture** — topic, question, or (next slice) photo of notes / past question  
2. **Explain** — plain language, WAEC/JAMB level  
3. **Test** — 2–3 practice questions (web can batch; WhatsApp prefers one-at-a-time)  
4. **Grade** — immediate correction; never shame  
5. **Remember** — store topic, correctness, `nextReviewAt`  
6. **Resurface** — Reca messages first on WhatsApp; Progress mirrors status on web  
7. **Recap** — “How am I doing in Biology?” / Progress subject view  

```text
Learn / Revise (web) → attempts → weak topics → schedule
                                         ↓
                              WhatsApp resurface → answer → attempts
                                         ↓
                                   Progress (web)
```

---

## Information architecture (web)

Primary destinations (tab bar):

| Tab | Job |
|-----|-----|
| **Learn** | Understand a topic (explain, diagrams, calculations) |
| **Revise** | Practise — topic quizzes + past-question style (WAEC \| JAMB segment) |
| **Progress** | See strong / needs work / cleared; next review |

Plus **Profile**: link WhatsApp (required for full Reca), exam body preference, subjects.

Past questions live **inside Revise**, not a fourth nav item (Hick’s / #2). Locked in `_memory.md`.

Full IA: [ia.md](./ia.md).

---

## Market sequence

1. **Now:** Nigeria — WAEC + JAMB, core subjects  
2. **Next:** Deeper packs + pilot schools/tutorials  
3. **Later:** Other WAEC countries / other boards — **template the curriculum layer**; don’t hardcode forever  

Expansion gate: [pilot.md](./pilot.md).

---

## Non-goals (v1)

- Global curriculum marketplace on day one  
- Parent/teacher dashboards before the student loop is undeniable  
- Anti-cheat theatre aimed at miracle centres  
- Guaranteed credits / UTME scores  
- Fine-tuning private models on student uploads  

---

## Relationship to hackathon PRDs

Fest docs ([product-prd.md](./product-prd.md), [BUILD-REQUIREMENTS.md](./BUILD-REQUIREMENTS.md)) remain the **BuildFest historical contract**. This vision **supersedes** them for the rebuild. Archive story stays; do not delete.
