# Decision 0002 — WhatsApp is a required habit channel (v1)

**Date:** 2026-09-10  
**Status:** Locked  
**Product:** Reca (rebuild)

## Context

Rebuild chooses **1A** (Nigeria first) and **2B** (web/app as primary study surface + WhatsApp as a channel). Risk: WhatsApp becomes optional push chrome and Reca loses the “messages you first” differentiator that beat generic chatbots.

## Decision

For v1, **linking WhatsApp is required to complete Reca’s full loop** (unprompted resurface).

- Web may be used for Learn / Revise / Progress without WhatsApp, but Progress must show that **recall pings need WhatsApp** and CTAs to link.  
- Resurface delivery in v1 ships on **WhatsApp**, not email/SMS/web-only push.  
- Web and WhatsApp share one identity and one attempt/weak-topic store.  

## Conflict

- Pulls against “zero friction / no signup” purity of the fest WhatsApp-only MVP.  
- Aligns with principle #2 (one primary job: retention) and #8 (JTBD over “we’ll add notifications later”).

## Consequence

- Onboarding must sell the memory promise before asking for the phone link.  
- Do not ship “web-only resurface” as a substitute in v1 without a new decision.  
- Parent/teacher channels stay out of scope until the student↔WhatsApp loop is proven.
