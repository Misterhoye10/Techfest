# Reca — Curriculum quality bar (Nigeria)

**Product:** Reca rebuild  
**Wedge:** WAEC + JAMB (Nigeria first)  
**Last updated:** 2026-09-10  
**Related:** [_memory.md](../../_memory.md), diagram/calculation packs in backend

---

## Honesty rules (non-negotiable)

1. **Curated packs &gt; unconstrained LLM** for labelled diagrams, multi-step calculations, and exam-style stems that must stay accurate.  
2. **Never LLM-invented diagram labels** — missing pack → honest empty copy; expand library subject by subject.  
3. **Do not claim official WAEC/JAMB scanned papers** without a licensed bank. Use “exam-style” / “past-question style” / curated packs / partner content.  
4. **Explain before answers** — Reca is not expo. Malpractice requests get a short refuse + learn path ([voice.md](./voice.md)).  
5. **Syllabus-aligned framing** — topics named the way students meet them in WAEC/JAMB prep, not generic global MOOC titles.  
6. **Mark generation confidence** in admin/content tooling (human review for packs that ship as “preset”).

---

## Core subjects (v1 priority order)

Ship depth in this order (English + Maths gate + science demo strength):

| Priority | Subject | Why first |
|----------|---------|-----------|
| 1 | **Mathematics** | Credit gate; calculation engine already in stack |
| 2 | **English Language** | Credit gate; comprehension + exam-style practice |
| 3 | **Biology** | Fest demo strength; labelled diagrams |
| 4 | **Chemistry** | Fest demo strength; calculations + diagrams |
| 5 | **Physics** | Calculations + labelled diagrams |

**Next wave (after core loop proven):** Further Maths, Geography, Economics, Government, Literature, Civic Education — only with pack owners.

Exam body toggle: **WAEC | JAMB** affects stem style and Revise segment default — not a separate product.

---

## Pack types

### 1. Topic packs (Learn)

Per subject:

- `topicId`, display name, exam tags (`WAEC`, `JAMB`, both)  
- Short explanation seed (plain language)  
- Practice question bank for Revise (session default **8**, continue **+5**; Learn quick-check **2**)  
- Optional links: `diagramPackId`, `calculationPackId`  

### 2. Labelled diagram packs

- Registry pattern (existing): curated assets + numbered key + 2 label-check questions  
- Learn intent examples: “label a leaf”, “label the heart”  
- v1 examples already noted: plant-leaf, human-body, pie-chart, right-triangle — extend Bio/Physics deliberately  

### 3. Calculation packs

- Step engines for Maths / Physics / Chemistry numeric items  
- Show steps on miss; don’t only emit final numbers  
- Tabular/numeric clarity in UI where relevant (#14)

### 4. Past-question style packs

- Live **inside Revise**, segment WAEC | JAMB  
- Metadata: subject, topic, exam body, difficulty band  
- Capture path: **Snap a past question** → explain → practise (decision 0001)  
- Licensing: partner or original stems until official bank exists  

---

## Content workflow

```text
Draft (curriculum owner)
  → Accuracy pass (subject literate reviewer)
  → Pack JSON / assets in repo or CMS
  → Preset fallback in app (demo + offline resilience)
  → LLM only for paraphrase / tutoring around locked facts
```

**LLM role:** teach and rephrase around **locked** topic facts and pack keys.  
**LLM must not:** invent diagram labels, invent “2023 WAEC Q4” citations, invent marking schemes.

---

## Coverage targets (rebuild phases)

| Phase | Target |
|-------|--------|
| Rebuild MVP | Core five subjects: ≥ 8–12 topics each with practise items; diagram + calc packs expanded from fest set |
| Pilot | Enough packs that a Bio + Maths student can study daily for 2 weeks without empty walls |
| Post-pilot | Full syllabus maps per core subject; second-wave subjects |

Empty curriculum is a **product bug** — use [states.md](./states.md) honest empties, never fake lists.

---

## Anti-patterns

- Generating a full “past paper” PDF and calling it WAEC  
- Auto-drawing labelled diagrams without a reviewed key  
- Mixing JAMB CBT multi-choice norms with WAEC theory expectations without labelling the mode  
- Blocking practise behind “complete all Learn videos” walls  

---

## Owner checklist for every pack

- [ ] Subject + topic IDs stable  
- [ ] Exam tags set  
- [ ] Explanation readable by SS3 student  
- [ ] ≥ 2 practise questions with answers + short remediation  
- [ ] Diagram/calc linked or explicitly N/A  
- [ ] Reviewer named + date in pack meta  
- [ ] User-facing copy does not claim official board ownership
