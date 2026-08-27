NEXUS
Your External Executive Function
Product Requirements Document
AI BuildFest 2026, Track 3 — Case Study 3 — 2-Day MVP Build
1. Explain Like You're 15
What is Nexus, really?
You're busy — a trader, a student, anybody with too much going on. Random things pop into your head all day: ‘pay Chidi back Friday,’ ‘meeting Wednesday at 2,’ ‘register my brother for WAEC.’ Normally you'd forget half of them, or write them somewhere and never look again. With Nexus, you just say it — type it or talk to it, all in one messy sentence — and it quietly holds every single thing for you. Then it brings each one back to you exactly when it matters, not before, not after. If your plans change, you just tell it, and it adjusts without you having to redo anything. It's an outside brain for your responsibilities.
2. Problem Statement
Students, employees, entrepreneurs and caregivers manage several responsibilities at once, scattered across notebooks, calendars, chat threads and memory. Important activities get forgotten, deadlines get missed, and people spend real time and stress just deciding what to do next — before they've even started doing it.
Traditional productivity apps require a person to already be organised to use them: open the app, create a project, create a task, set a priority, choose a date, set a reminder. That workflow assumes the hard part — knowing what to log and how to structure it — is already solved. It isn't. The real pain happens earlier: in the moment someone thinks of something and has nowhere frictionless to put it.
3. Who This Is For — User Personas
Ada — Small business owner, fashion trader, 27
Context: Runs an ankara/fashion business from Lagos while managing supplier relationships, customer orders, and personal finances, largely over chat.
Goal: Never miss a supplier meeting, a payment deadline, or a customer follow-up, without having to manually manage a task list.
Frustration: Important things live across WhatsApp threads, her memory, and scraps of paper — nothing is in one place, so things fall through.
“I don't have time to open an app and fill in a form every time I remember something. I just need to say it and trust it's handled.”

Emeka — 300-level university student, side hustle, 21
Context: Balances coursework, assignment deadlines, and a small side business selling phone accessories to classmates.
Goal: Keep both his academic responsibilities and his hustle running without constantly feeling behind on one or the other.
Frustration: Deadlines and commitments live in three different places — lecture WhatsApp groups, his notes app, and his head — and nothing talks to the others.
“I remember things at the worst possible time — usually right when I can't do anything about them.”

Mrs. Bello — Working mother, office administrator, 38
Context: Full-time office job plus running the household — school runs, bills, family appointments, and her own work deadlines.
Goal: Stop carrying the mental load of remembering everything for everyone, and trust that important things will resurface on their own.
Frustration: Plans change constantly — a school pickup shifts, a meeting moves — and re-organising everything by hand is exhausting.
“It's not that I forget things on purpose. It's that there's simply too much to hold in my head at once, every single day.”
4. Why This Fits “AI for Everyday Life” — Case Study 3
Case Study 3 Requirement
Nexus Feature
Accept tasks, deadlines, appointments, personal priorities
Single free-form capture — text or voice, any mix of items in one message
Categorise by urgency, importance, or area of life
AI classifies each extracted item by type and life area
Recommend which tasks should be completed first
Priority ordering shown in the ‘holding for you’ view
Create a realistic daily or weekly schedule
Generated view of what's due today/this week
Estimate time required for activities
AI attaches a rough time estimate per task where inferable
Break large goals into smaller, manageable tasks
Optional breakdown prompt for multi-step items
Reschedule unfinished work when plans change
Natural-language replan — “push it to next week” updates the item directly
Provide reminders or progress updates
Scheduled, unprompted resurfacing at the right time
Allow users to ask questions about schedule or workload
“What's on my plate this week?” recap on request

5. Core Product Loop
1. Capture — user tells Nexus something naturally, in one message, mixing multiple items.
2. Understand — AI extracts each discrete responsibility from the messy input.
3. Decide — AI classifies each item: does it need action, does it have a deadline, should it be scheduled, is more information needed.
4. Hold — AI takes responsibility for it and confirms back in plain language.
5. Resurface — the right item comes back to the user exactly when it matters, unprompted.
6. Replan — when life changes, the user says so once, and Nexus adjusts without re-entry.
7. Recap — user can ask what's outstanding, at any time, in plain language.
6. Full Feature List
MVP — must work for the demo
Free-form capture of a multi-item message (text input)
AI extraction into discrete items: task / deadline / event / reminder
Plain-language confirmation of everything captured
Rule-based ‘when to resurface’ timing per item
Scheduled, unprompted resurfacing in the same interface
One scripted replan flow — “I can't make it anymore” updates the item live
“What's on my plate?” recap view
Stretch — only if time remains on Day 2
Voice note capture (speech-to-text before extraction)
Task breakdown for multi-step goals
Simple priority ordering by urgency/importance in the recap view
Post-hackathon roadmap — do not build now
General conflict-detection engine across all items
Calendar sync / two-way integration
Realistic multi-day scheduling optimisation
Multi-user shared responsibilities (e.g. family or team accounts)
7. Simulated Workflow — Full Walkthrough
7:40 AM — Ada sends one message
Ada: “Remind me to pay Chidi back before Friday, I have a supplier meeting Wednesday 2pm, need to register my brother for WAEC before month end, and follow up with that customer who wants the ankara dress.”
Nexus: “Got it — I'm holding 4 things for you: pay Chidi back (due Fri), supplier meeting Wed 2pm, WAEC registration (due end of month), follow up on the ankara dress order. I'll bring these back to you at the right time.”

Tuesday, 6 PM — unprompted
Nexus: “Reminder: supplier meeting tomorrow at 2pm.”

Thursday, 9 AM — unprompted, then a replan
Nexus: “Chidi payment is due tomorrow — still on track?”
Ada: “push it to next week”
Nexus: “Done — moved to next Thursday. I'll remind you again closer to the date.”

Friday, midday — unprompted
Nexus: “WAEC registration deadline is in 5 days — want me to remind you again in 2 days?”

On request, any time
Ada: “what's on my plate this week?”
Nexus: “This week: WAEC registration due Friday, ankara dress follow-up still open, Chidi payment moved to next Thursday. Nothing else outstanding.”
8. MVP Scope for the 2-Day Build
Channel decision: web app, not WhatsApp
Unlike Reca, Nexus is built as a lightweight web app with a single chat-style input and a ‘what I'm holding for you’ view, rather than on WhatsApp. Two reasons: first, Nexus needs to demo reliably live in front of judges, and a WhatsApp sandbox introduces external dependency risk outside the team's control. Second, this concept doesn't depend on being inside an existing chat habit the way Reca's proactive nudges do — a clean, fast, in-browser experience is easier to build well in two days and easier to control end to end during a live demo. A WhatsApp version remains a natural post-hackathon extension.
In scope
Web-based free-text capture (voice note as stretch goal only)
Extraction + classification via Claude API
Simple ‘Today / Upcoming / Everything’ view
Scheduled resurfacing shown live in-app (polling or simple real-time update)
One working replan flow scripted for the demo
Out of scope for MVP
General conflict detection across all items
Calendar or third-party integrations
Mobile push notifications
9. Success Metrics
Demo: one full loop completed live — messy capture → structured confirmation → resurfacing → replan → recap.
Post-MVP: % of captured items resurfaced on time without the user having to check manually.
Post-MVP: daily active users, average items captured per session.
10. Privacy & Responsible-Use Notes
Only the text of what the user chooses to share is stored — no access to external accounts, contacts, or messages without explicit connection.
Users can delete any captured item at any time; nothing is retained after account deletion.
Nexus supports decision-making, it does not make commitments or send messages to third parties on the user's behalf without explicit confirmation.
11. Brand & Design Direction
Calm, capable, quietly confident — this should feel like a competent assistant, not a busy dashboard. The interface should have very little visual noise; the intelligence should be felt in what it remembers, not in decoration.
Colour palette
Role
Colour
Hex
Primary / text
Near-black charcoal
#121214
Background
Soft off-white
#F7F6F4
Accent — confirmations, primary actions
Signal blue
#2F5BEA
Secondary text / metadata (due dates, etc.)
Slate grey
#6B7280
Gentle alert (approaching deadline)
Muted amber
#C98A2E

Typography
Headings: Manrope (Google Font, free) — modern, clean, slightly technical, fits an ‘operator’ feel.
Body / chat text: Inter (Google Font, free) — highly readable, fast to implement.
Tone of voice
Brief and certain — “Got it, I'm holding 4 things for you,” never “I think I understood, let me know if this is right.”
Confirms without over-explaining — trust is built by being reliably right, not by narrating every step.
Never guilt-trips about missed or rescheduled items — always neutral, forward-looking language.
