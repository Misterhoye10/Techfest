# Reca — Pilot metrics & expansion gate

**Product:** Reca rebuild  
**Market:** Nigeria (WAEC + JAMB) first  
**Last updated:** 2026-09-10  
**Depends on:** [vision.md](./vision.md), [discovery.md](./discovery.md)

---

## Pilot goal

Prove the **memory loop** with real students: they practise on web, Reca comes back on WhatsApp, weak topics clear over time — without claiming score guarantees.

---

## Who / where

| Cohort | Profile | Size (target) |
|--------|---------|----------------|
| A | SS3 WASSCE candidates | 1–2 schools or tutorial centres, Lagos/Ogun |
| B | JAMB candidates / retakers | 1 tutorial centre or open cohort |
| **Total** | | ~40–80 active students over one prep window (2–4 weeks min) |

Recruit via teachers/centres; consent for WhatsApp messages; no malpractice framing.

---

## North-star metric

**Weak-topic clear rate** — of topics that entered `needs_work`, % that reach `cleared` within 14 days of first miss.

If this doesn’t move, Reca is a chatbot, not a memory product.

---

## Primary metrics (weekly)

| Metric | Definition | Healthy signal (hypothesis) |
|--------|------------|-----------------------------|
| **Resurface reply rate** | % of unprompted WhatsApp recalls with an answer within 24h | ≥ 40% early; climb with copy/timing |
| **Weak-topic clear rate** | See north-star | Directionally up week over week |
| **WAU** | Students with ≥ 1 Learn or Revise session in 7 days | Stable or up during pilot |
| **Link rate** | % of signed-up web users who complete WhatsApp link | ≥ 70% of active students |
| **Loop completion** | Sessions that finish explain→≥1 graded answer | Majority of Learn starts |

---

## Secondary / guardrails

| Metric | Why |
|--------|-----|
| Time-to-first-practise | Onboarding friction |
| Opt-out / unlink rate | Trust / annoyance |
| Error rate on grade/webhook | Reliability craft bar |
| Support tickets: “wrong diagram / wrong answer” | Curriculum honesty |
| Data complaints | Privacy |

**Do not** use predicted UTME/WAEC scores as a pilot KPI.

---

## Qualitative checks (principle #10)

Week 2 and end of pilot — 5–8 short interviews:

1. How did you study before Reca?  
2. Did a WhatsApp recall ever feel useful vs annoying?  
3. Where did you get stuck in the app?  
4. Do you trust the explanations / diagrams?  
5. Would you pay / recommend to a classmate?  

Separate **observations** from **interpretations** in notes.

---

## Expansion gate — when we may leave “Nigeria-only depth”

Expand to other WAEC countries or other exam boards **only when all are true**:

1. North-star clear rate improves vs pilot baseline (team-agreed threshold, e.g. +15% relative or ≥ 35% absolute — lock number after week-1 baseline).  
2. Resurface reply rate ≥ agreed floor for two consecutive weeks.  
3. Core five subjects have pack coverage for a 2-week daily path without chronic empty states.  
4. Shared identity web↔WhatsApp works in production without weekly firefighting.  
5. Written curriculum **template** exists (IDs, review workflow) so a new board isn’t a fork of the whole app.  

Until then: **deeper Nigeria packs &gt; wider geography.**

---

## What “global” means after the gate

- Reuse product loop + craft bars  
- Swap/add curriculum packs and exam-body labels  
- Localise voice only where needed (English first; Yoruba/Igbo/Hausa later — separate decision)  

Not: rewrite Reca into a generic global tutor that forgets WAEC/JAMB.

---

## Pilot exit report (deliverable)

One short doc: metrics table, top 3 product changes, go / no-go on expansion, open research questions.
