# Reca - durable notes

## First-run onboarding (2026-09-11)

- Conversational ChatGPT-style first-run: Exam → Subjects → WhatsApp → Aha. Docs: `docs/reca/onboarding.md`. UI: `/onboarding.html`.
- Signup/guest routes through onboarding until `reca_onboarding_done=1`.

## Hero walkthrough (2026-09-11)

- Marketing hero uses an auto-playing product walkthrough (explain → miss → Day 3 resurface → clear), not a still. `prefers-reduced-motion` shows final frame. Pause on hover.

## Button radius (2026-09-10)

- Marketing = full pill (`999px`). Product = `12px`. Decision `docs/reca/decisions/0003-button-radius-by-surface.md`.

## Marketing site (2026-09-10)

- Marketing: Claude-style **dark** theme (user preference). Pricing board: Students (Free/Plus/Pro) + Schools (Centre/Campus).
- Bugfix: `.pricing-board[hidden] { display: none !important }` — grid was leaking both panels.
- Files: `backend/public/index.html`, `marketing.css`, `marketing.js`. Signup brand → `/`.

## Rebuild thesis (2026-09-10)

- **1A** Nigeria first (WAEC + JAMB deep); global = craft bar, not day-one worldwide curriculum.
- **2B** Web primary (Learn / Revise / Progress) + WhatsApp **required** for unprompted resurface — one memory, never two products.
- Docs: `docs/reca/discovery.md`, `vision.md`, `voice.md`, `ia.md`, `states.md`, `curriculum.md`, `rebuild-tech.md`, `pilot.md`, `REBUILD-ROADMAP.md`.
- Decision: `docs/reca/decisions/0002-whatsapp-required-habit-channel.md`.

## Revise flow (2026-09-12)

- Locked: [docs/reca/flows/revise.md](docs/reca/flows/revise.md).
- Board first (WAEC \| JAMB), then Recommended / **subject** / **topic**.
- Session default **8**; summary **Keep going (+5)**; Learn quick-check stays **2**.
- Subject start → mixed questions across that subject (`subject` on `/api/quiz/start`).

## Exam-style practice (2026-09-05)

- Past questions live **inside Revise**, not a fourth nav item (#2, Hick’s).
- Revise empty title: **Past questions**. Segment: WAEC | JAMB.
- Primary: topic row with exam meta. Secondary: full-width **Snap a past question** (photo → explain → practise).
- Preference: `localStorage.reca_exam_body` → `/api/quiz/start` `examBody`.
- Do **not** claim official scanned papers without a licensed bank. Next: curated packs / partner content.

## Labelled diagrams (2026-09-05)

- Curated packs only - **never** LLM-invented labels (Accuracy / AI fest).
- Registry: `src/data/diagram-packs.js`. Assets: `public/assets/diagrams/labelled/`.
- v1 packs: plant-leaf, human-body, pie-chart, right-triangle.
- Learn intent (“label a leaf”, etc.) serves diagram + numbered key + Try 2 label checks.
- Missing pack → honest copy; expand library subject by subject.
