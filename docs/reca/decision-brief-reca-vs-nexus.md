# Decision Brief: Reca vs Nexus

RECA vs NEXUS
Team Decision Brief — pick one, build it in two days
AI BuildFest 2026, Track 3: AI for Everyday Life
Prepared Sunday night so the team can decide together before the build starts
Why This Document Exists
We have two strong ideas and 48 hours. This document lays both out side by side, in plain language first and then in full detail, so the team can look at the same picture and decide together tonight. Full PRDs for each idea follow this brief as separate documents.
Explain Like You're 15 — What Are We Actually Choosing Between?
RECA — an AI study companion that lives on WhatsApp
Imagine you're revising for WAEC. You send a topic to a WhatsApp number — say, ‘explain photosynthesis.’ It explains it simply, then asks you two quick questions. If you get one wrong, it doesn't just move on. Three days later, out of nowhere, it messages you again and asks the same thing — to see if you actually remember now. That's Reca. It's like a study friend who never forgets what you're weak at, and keeps bringing it back until you've got it.

NEXUS — an AI that remembers your responsibilities for you
Imagine you're busy — a trader, a student, anybody with too much going on. Random things pop into your head all day: ‘pay Chidi back Friday,’ ‘meeting Wednesday,’ ‘register my brother for WAEC.’ Normally you'd forget half of them, or write them somewhere and never check again. With Nexus, you say it once — type it or talk to it — and it quietly holds every single thing for you, then brings each one back exactly when it matters. If your plans change, you just tell it, and it adjusts. It's an outside brain for your responsibilities.
Side-by-Side Comparison

Reca
Nexus
Case study covered
Case Study 2 — AI Study Companion
Case Study 3 — AI Productivity Planner
Who it's for
WAEC/JAMB students, exam season only
Anyone with daily responsibilities — students, traders, employees, parents
Addressable users (Nigeria, per cycle)
~1.95M WASSCE + ~2.24M UTME candidates yearly
Effectively every working adult and student — tens of millions
Core pain
Studying passively, not knowing what's forgotten
Mentally carrying scattered commitments, forgetting them
Is it used every single day?
Mainly during exam prep season
Yes — daily, all year, for everyone
Hard for a raw LLM to replace?
Yes — spaced-repetition memory is the moat
Yes, even more so — zero-friction capture + reliable proactive resurfacing
Direct existing competitor
Auritrack (AI expense tool, different niche) — no direct WAEC-specific WhatsApp competitor found
ChatGPT Scheduled Tasks (capped, paid-only, manual setup)
Build complexity in 2 days
Medium — needs curated subject content (Biology/Chemistry topics)
Medium-low — one extraction engine, no subject content to curate
Live demo risk
WhatsApp API sandbox can be flaky in front of judges
Lower — a web app demo is fully in our control
“Wow factor” for judges
Strong — unprompted resurfacing message is a great live moment
Strong — messy voice dump → clean structured plan is a great live moment
Build Risk in 48 Hours
Reca risks
Needs real WAEC-aligned question content for at least 2 subjects — someone must curate this tonight.
WhatsApp Business API / sandbox setup can introduce delays outside our control.
Scheduler needs to visibly fire during a short demo window — requires a compressed/faked clock.
Nexus risks
Extraction quality depends on prompt design — needs testing against messy, realistic voice-note-style input.
‘Replan when plans change’ must be scripted tightly for the demo — do not attempt general conflict-detection logic.
Needs a clean, simple frontend built fast — no time for a polished full UI, so scope the design tightly.
Recommendation
If the team wants the safer, more universal bet with a cleaner LLM-can't-do-this story and lower demo risk: Nexus. If the team wants a sharper, more emotionally resonant story tied to a real national exam moment happening right now: Reca. Both pass the “AI for Everyday Life” bar and both map cleanly onto their case study with zero disqualification risk. This is a genuine choice — not a forced one — and the full PRDs that follow give enough detail for the team to weigh in properly.
How the Team Should Decide Tonight
Read both full Product PRDs (attached separately) — 15 minutes each, max.
Each person answers: which one could I personally build my part of, well, in 2 days?
Vote as a team. Majority wins — don't relitigate after 9pm tonight.
Whoever built the design/backend/frontend plan for the idea NOT chosen keeps that PRD — it's a ready-made next venture, not wasted work.
