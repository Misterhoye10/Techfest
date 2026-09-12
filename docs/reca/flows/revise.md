# Reca — Revise flow (locked)

**Job:** Practise WAEC- or JAMB-style questions until it sticks.  
**Surface:** Web Revise tab (`chat.html` hub today; `/revise` in rebuild shell)  
**Last updated:** 2026-09-12  
**Depends on:** [ia.md](../ia.md), [states.md](../states.md), [curriculum.md](../curriculum.md)

---

## Principles

- One primary action on the hub: start the recommended set (#2).  
- Board before content: **WAEC | JAMB** (#12).  
- Student chooses **subject** or **topic** (or Recommended).  
- Session length respects fatigue: default **8**, continue **+5** — not a full mock dump.  
- Same attempt store as WhatsApp / Progress.  
- Exam-style stems; never claim official scanned papers without a licensed bank.

---

## Hub flow

```text
Open Revise
  → Board segment: WAEC | JAMB  (sticky: reca_exam_body)
  → Scope:
       Recommended (default CTA) — due / weak / seed topic
       Subject chips — mixed exam-style set for that subject
       Topic rows / Browse — one topic session
  → Snap a past question (secondary)
```

| Scope | Behaviour |
|-------|-----------|
| **Recommended** | Weak / due topic if known; else seed (e.g. Photosynthesis). Starts session immediately. |
| **Subject** | Mixed questions across topics in that subject. Label: `{Subject} mix`. |
| **Topic** | Questions for that topic only. |
| **Snap** | Photo → explain (Learn) → practise (Revise handoff). |

---

## Session loop

```text
Start (limit 8 default; Learn quick-check still uses 2)
  → Qn one-at-a-time
  → Grade inline
       hit  → next
       miss → fix + memory line → schedule resurface
  → End of set
       Keep going (+5)  ·  See Progress  ·  Quiz again / Done
```

| Constant | Value |
|----------|-------|
| Default session | **8** |
| Keep going | **+5** |
| Learn “Try 2” | **2** (unchanged) |
| End anytime | Always available |

---

## Entries from elsewhere

| From | Opens |
|------|--------|
| Learn **Practise this** | Topic session, same board preference |
| Progress weak row | Topic session for that weak topic |
| WhatsApp cleared | Optional “Want another?” → Revise recommended |

---

## Copy (voice)

- Hub hint: `WAEC or JAMB · pick a subject or topic · 8 questions · keep going if you want.`  
- Miss: cause + fix + “I’ll check again soon.”  
- Summary with misses: `{n} misses saved to Progress. Reca can bring them back later.`  
- Empty: `Nothing to revise yet. Learn a topic — or pick a subject below.`

---

## Non-goals

- Fourth tab for past questions  
- Forced 20–40 question mocks as default  
- Email as auth for Revise  
- Claiming “official WAEC paper” without licence  
