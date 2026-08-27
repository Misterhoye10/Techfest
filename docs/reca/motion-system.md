# Reca motion & interaction system

**Product:** Reca (AI BuildFest)  
**Principles:** #5 Motion is a sentence · #19 Micro-interactions confirm / anticipate / reward · #3 Defaults · #1 Content before chrome  
**Status:** Active for web UI (`backend/public/`)

## Purpose

Motion answers: *what is the system doing, and what should I do next?*  
It does not decorate, compete with exam content, or imitate power-AI chat chrome.

## Tokens

Implemented as CSS variables on `:root` in `chat.css` (mirrored on signup where needed).

| Token | Value | Use |
|---|---|---|
| `--motion-instant` | `80ms` | Press, toggle |
| `--motion-fast` | `120ms` | Hover, focus, option select, thinking exit |
| `--motion-normal` | `240ms` | Bubble in, panel swap, diagram fade |
| `--motion-slow` | `360ms` | Rare: first Learn empty → first reply |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exits |
| `--ease` | alias of `--ease-out` | Legacy / default |

Legacy `--ease` stays for compatibility; new work prefers `--ease-out` / `--ease-in`.

## Generating phases (system-state copy)

| Intent | Primary label | After ~1.2s (optional secondary) |
|---|---|---|
| Learn explain (fresh topic) | `Reca is explaining…` | `Still working — exam Wi‑Fi is fine` |
| Learn follow-up | `Reca is answering…` | same |
| Photo / upload | `Reading your photo…` | same |
| Quiz after explain | `Building 2 quick questions…` | same |
| Generic chat | `Reca’s AI is thinking…` | same |

Visual: soft pulse on avatar + status turn (not a forever spinner). On complete: status fades (`--motion-fast`), reply uses `turn-in` (`--motion-normal`), diagram follows 0–240ms after text.

## P0 interaction map

| Moment | Category | Behaviour |
|---|---|---|
| AI generating | System-state | Phased label + pulse; reduced-motion → static label |
| Explain + diagram | Continuity | Text first; `.msg__media` fade + 8px rise |
| Quiz diagram | Continuity | Same media entrance on `.quiz__diagram` |
| Quiz option press | Feedback | `--motion-instant` / `--motion-fast` border/bg |
| Correct / wrong | Feedback | Inline panel enter `--motion-normal`; no confetti |
| Feature swap Learn/Revise/Progress | Context | Opacity + slight translateY `--motion-normal` |
| Composer attach / upload | Feedback | Press scale; busy + `Reading your photo…` |
| Soft WhatsApp nudge | Feedback | Existing `nudgeIn`; once per session for wrong-answer link |

## Reduced motion

When `prefers-reduced-motion: reduce`:

- Kill loops (dots, spin, pulse)
- Entrances → opacity only or instant
- No translate / scale choreography
- Generating status shows static text only

## Explicitly out of scope (fest)

- Collapsible “Thought” panels, citation chips, model switcher  
- Fake token streaming (request/response API — dishonest to fake)  
- Confetti / bounce on every correct answer  
- Sidebar list animation on every filter keystroke  
- WhatsApp client motion (Meta owns that UI)

## Related

- `docs/reca/decisions/0001-capture-and-visual-answers.md` — diagrams only when they teach  
- Implementation: `backend/public/chat.css`, `chat.js`, `chat.html`
