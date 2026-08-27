# Decision 0001 — Capture uploads & visual answers

**Date:** 2026-08-27  
**Status:** Locked  
**Product:** Reca (AI BuildFest)

## Context

Team asked whether students should upload pictures/docs/WAEC past questions, get “trained” on them, and see image-rich learn/quiz results (Nomi-style cards).

## Decision

### Fest MVP (necessary now) — no change to hero loop

Ship and demo only:

1. Topic text → explain → 2 questions → grade  
2. Remember misses → unprompted resurface  
3. WhatsApp number identity · web ↔ WhatsApp sync  

**Do not build for the live demo:** upload UI, PDF ingest, custom model training, shopping-style image carousels.

### Next slice (necessary after loop is green) — Option A

**Photo of one past question / notes page → Reca explains + 2 quiz questions → misses still resurface.**

- Capture = camera or single image (WhatsApp image or web `+`)  
- Explain stays short (WAEC/JAMB level)  
- Visual in the answer: **only if it teaches** (diagram / labelled figure) — not lifestyle or product cards  
- “Trained” language = *Reca uses this upload for this session and remembers what you miss* — **not** fine-tuned private models  

### Explicitly deferred

| Idea | When |
|------|------|
| Multi-page PDF past-question banks | Post-fest |
| Auto diagram generation for every topic | Post-fest / if vision+assets stable |
| Nomi-style Explore / Library / price cards | Never — wrong JTBD |
| Fine-tune on student uploads | Not without research + infra |

## Why

- Moat is **memory over time** (#8 JTBD), not multimodal chat.  
- Case Study 2 upload requirement is satisfied by the **next slice**, not by blocking the demo.  
- Rich visuals support #1 / #11 only when they clarify the concept.  
- “Training” as marketing without evidence breaks #10.

## Consequence / watch

- If resurface fails on stage, do not start uploads.  
- If Gemini vision is flaky, fall back to text explain + quiz from the photo OCR/description only.  
- Backend hosts one Render service; upload endpoints land there when this slice starts.

## References

- [BUILD-REQUIREMENTS.md](../BUILD-REQUIREMENTS.md) — live demo loop  
- [product-prd.md](../product-prd.md) — photo-of-notes as stretch  
- Principles #1, #2, #3, #8, #10  
