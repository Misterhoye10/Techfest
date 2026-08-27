# Reca Technical PRD

RECA
AI Study Companion for WAEC & JAMB Candidates
Technical Product Requirements Document
AI BuildFest 2026, Track 3 — Build Spec for the 2-Day MVP
1. System Architecture
Student (WhatsApp)
      |
      v
WhatsApp Cloud API / Twilio Sandbox  (webhook)
      |
      v
Backend Service (Node.js / Express, hosted on Render or Railway)
   |--> Claude API (explain / generate questions / grade)
   |--> Supabase Postgres (students, topics, attempts)
   |--> node-cron scheduler (checks due reviews on an interval)
      |
      v
Outbound WhatsApp message (explanation, question, or resurfaced review)

2. Tech Stack (Free Tier Only)
Layer
Tool
Cost
Messaging channel
Meta WhatsApp Cloud API (or Twilio Sandbox for demo)
Free tier / sandbox
AI reasoning
Claude API
Existing credits
Backend runtime
Node.js + Express, built in Cursor Pro
Free (tool already owned)
Database
Supabase (Postgres, free tier)
Free
Scheduler
node-cron (in-process)
Free
Hosting
Render or Railway free web service
Free

3. Data Model
students
id, phone_number, name (optional), created_at
topics
id, subject (Biology / Chemistry), topic_name, syllabus_level
attempts
id, student_id (FK), topic_id (FK), question_text, student_answer, is_correct, attempted_at, next_review_date, review_count
conversations (optional — for demo transcript logging)
id, student_id (FK), direction (in/out), message_text, timestamp
4. Core Prompt Design
4.1 Explain + generate questions
Intent: given a topic, explain it in plain language suitable for an SS2/SS3 Nigerian student, 3–5 sentences max. Then generate exactly 2 short-answer practice questions testing the core concept, at WAEC syllabus difficulty. Return structured JSON: { explanation, questions: [ {id, text} ] }.
4.2 Grade answer
Intent: given a question, the correct concept, and the student's answer, decide if the answer is substantively correct, allowing for phrasing variation. Return JSON: { is_correct: boolean, feedback: short plain-language correction if wrong }.
4.3 Progress recap
Generated from stored attempt data, not a fresh LLM call for every request — query topics grouped by subject, flag any topic whose most recent attempt was incorrect as ‘needs work,’ else ‘strong.’ Optionally pass the summary through Claude once for a friendlier wrap-up sentence.
5. Scheduling Logic (Spaced Repetition, MVP Version)
On incorrect answer: set next_review_date = attempted_at + 3 days, review_count = 0.
On correct retry: mark topic mastered, no further scheduling.
node-cron job runs on an interval (compressed to 1–2 minutes for the live demo): finds attempts where next_review_date has passed and is_correct is false, sends a resurfacing message via the WhatsApp API, updates review_count.
Roadmap: replace the fixed 3-day interval with a proper increasing-interval algorithm (SM-2 style).
6. Sequence Flow (Capture → Resurface)
1. Inbound WhatsApp message hits the webhook endpoint.
2. Backend classifies intent: new topic / answer to a pending question / recap request.
3. New topic → explain+question prompt → store topic and questions → send explanation + Q1.
4. Answer → grade prompt → store attempt and next_review_date → send feedback.
5. Recap request → query database → build summary → send.
6. Background: cron checks due reviews → sends resurfacing question → loops back into step 2 on the student's next reply.
7. Who Builds What
Role
Owns
Backend developer
WhatsApp webhook, Claude prompt integration, database schema, node-cron scheduler, deployment
Frontend / Product designer
Conversation copy and tone, onboarding first-message flow, optional simple companion web view if time allows
Business analyst
Curate 8–10 test topics/questions for Biology and Chemistry, own the privacy and expected-value narrative, run the test scenarios before demo
8. Build Plan — Starting Tonight (Sunday) Through Tuesday
Sunday night
Team decision locked in; roles assigned; repo and hosting accounts created.
WhatsApp Sandbox (Twilio) or Meta test number set up — confirm a message can round-trip before anyone sleeps.
Monday — Day 1
Morning: Claude prompt chain built for explain + generate questions; tested against 8 sample topics.
Midday: Grading endpoint built and tested against right/wrong/partially-right sample answers.
Afternoon: Supabase schema created and connected; topics and attempts flowing correctly end to end.
Evening: Full capture → explain → test → grade loop working manually, no scheduler yet.
Tuesday — Day 2
Morning: node-cron scheduler wired — fires resurfacing messages on due attempts.
Midday: Recap command built and tested.
Early afternoon: Full run-through of the demo script, bug fixes, buffer time.
Late afternoon: Deck finalised, live demo rehearsed at least twice.
Evening: Submission.
9. Known Risks & Mitigations
Risk
Mitigation
WhatsApp Business API approval delay
Use Twilio Sandbox or a Meta test number for the demo — no approval needed
Cron interval too slow to show live in demo
Compress the interval to 1–2 minutes and/or trigger it manually during the demo run
LLM grading false negatives on phrasing
Allow lenient matching; keep a human-reviewable fallback on the roadmap
Free-tier rate limits during the demo
Pre-seed 1–2 student profiles ahead of time as a backup if a live call fails
