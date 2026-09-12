# Reca — States (web + WhatsApp)

**Product:** Reca rebuild  
**Principle:** Defaults are the design (#3)  
**Last updated:** 2026-09-10  
**Voice:** [voice.md](./voice.md)

Every core surface ships empty + loading + error (+ success where an action completes). Empty states **teach the next action** — they don’t apologise.

---

## Web — Learn

| State | UI | Copy / behaviour |
|-------|-----|------------------|
| **Empty** (no subjects yet) | Subject picker with core five | “Pick a subject to start — Biology is a good first.” |
| **Empty** (subject, no topics loaded) | Honest empty | “Topics for {subject} are coming. Try Chemistry or Maths meanwhile.” |
| **Loading** | Skeleton topic rows &lt; 800ms intent | No spinner theatre for long waits — show retry if slow |
| **Error** (pack/API) | Inline | “Couldn’t load topics. Check your connection and try again.” |
| **Success** (topic explained) | Explanation + primary **Practise this** | Secondary: “Save for later” only if it doesn’t compete |

---

## Web — Revise

| State | UI | Copy / behaviour |
|-------|-----|------------------|
| **Empty** (nothing practised) | Board + subject chips + Learn CTA | “Nothing to revise yet. Learn a topic — or pick a subject below.” |
| **Empty** (past questions, no packs) | Segment WAEC \| JAMB + snap CTA | Title **Past questions**. “Snap a past question to practise.” No fake paper list. |
| **Loading** | Question skeleton | Keep previous answer disabled until ready |
| **Error** (grade failed) | Inline under answer | “Couldn’t grade that just now. Try again — your answer is still here.” |
| **Success** (session complete) | Brief summary | “{score}/{total} correct…” Primary actions: **Keep going (+5)** · See Progress · Quiz again |
| **Miss** | Inline correction | “Not quite. {fix}. I’ll remember this — I’ll check again soon.” |

---

## Web — Progress

| State | UI | Copy / behaviour |
|-------|-----|------------------|
| **Empty** (zero attempts) | Illustration optional / none if generic | “Study a topic in Learn, then practise in Revise — your weak spots show up here.” Primary: Learn |
| **Loading** | Skeleton subject cards | |
| **Error** | Inline | “Couldn’t load progress. Pull to refresh / try again.” |
| **WhatsApp missing** | Banner (not full-screen modal) | “Link WhatsApp so Reca can message you first when a topic needs recall.” Primary: Link WhatsApp |
| **Success** (topic cleared) | Badge in list | “Cleared ✓” — calm, not confetti spam |

---

## Web — Profile / WhatsApp link

| State | UI | Copy / behaviour |
|-------|-----|------------------|
| **Empty** (unlinked) | Phone input + OTP | Why-line first: memory promise, then number |
| **Loading** | Disable submit | “Sending code…” |
| **Error** (OTP / invalid) | Cause + fix | “That code didn’t match. Request a new one.” |
| **Success** | Linked number + test ping option | “WhatsApp linked. Reca can message you first now.” |
| **Unlink confirm** | Sheet / modal OK (destructive-ish) | “Stop recall messages? Weak topics stay in Progress, but Reca won’t ping WhatsApp.” |

---

## Web — Auth / session

| State | Copy / behaviour |
|-------|------------------|
| **Empty** | Sign in to keep memory across devices |
| **Error** | “Couldn’t sign in. Check your connection and try again.” |
| **Success** | Land on Learn or deep link |

---

## WhatsApp

| State | Message behaviour |
|-------|-------------------|
| **First-run empty** | Onboarding blurb ([conversation-copy.md](./conversation-copy.md)) |
| **Loading / typing** | Prefer fast preset; if model delay, one short “One moment…” only if &gt; ~2s |
| **Error** (parse / grade) | “I couldn’t match that. Reply with a short answer — one or two words is fine.” |
| **Error** (system) | “Couldn’t reach Reca just now. Try again in a minute.” |
| **Miss** | Not quite + answer + memory promise |
| **Hit** | Correct + optional next |
| **Resurface** | Single question only — no guilt preamble |
| **Resurface success** | “Correct. You’ve got this one now.” |
| **Opt-out** | Confirm; stop cron for that user |

---

## Global rules

1. Skeletons beat spinners for content surfaces; if wait &gt; ~800ms repeatedly, treat as backend problem (#3).  
2. Disabled primary buttons explain what’s missing (e.g. “Enter the 6-digit code”) — never grey mystery meat (#11 / anti-pattern).  
3. Toasts confirm minor saves; they never carry blocking errors (anti-pattern).  
4. Web and WhatsApp use the same Progress vocabulary: strong / needs work / cleared.
