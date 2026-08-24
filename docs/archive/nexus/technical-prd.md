NEXUS
Your External Executive Function
Technical Product Requirements Document
AI BuildFest 2026, Track 3 — Build Spec for the 2-Day MVP
1. System Architecture
User (Web browser — desktop or mobile)
|
v
Frontend: React (Vite), hosted on Vercel free tier
| chat-style input + ‘holding for you’ view
v
Backend API: Node.js / Express, hosted on Render or Railway
|--> Claude API (extraction / classification / replan)
|--> Supabase Postgres (users, items, conversation log)
|--> node-cron scheduler (checks due resurfacing on an interval)
|
v
Item appears in the ‘Today’ view in real time (polling or lightweight websocket)

Notification approach: rather than depending on mobile push notifications, which are unreliable to demo live on a projector, resurfacing is shown directly inside the web app's ‘Today’ view the moment it becomes due. This is more reliable for a live judged demo and is the simplest robust mechanism to build in two days. Push notifications and email digests remain a natural post-hackathon extension.
2. Tech Stack (Free Tier Only)
Layer
Tool
Cost
Frontend
React + Vite, hosted on Vercel
Free tier
Backend runtime
Node.js + Express, built in Cursor Pro
Free (tool already owned)
AI reasoning
Claude API
Existing credits
Database
Supabase (Postgres, free tier)
Free
Scheduler
node-cron (in-process)
Free
Backend hosting
Render or Railway free web service
Free

3. Data Model
users
id, display_name, created_at
items
id, user_id (FK), raw_text (the original message this came from), item_type (task / event / deadline / reminder), title, due_date, remind_at, priority, life_area, status (pending / done / rescheduled), review_count, created_at
conversation_log
id, user_id (FK), direction (in/out), message_text, timestamp
4. Core Prompt Design
4.1 Extraction + classification
Intent: given one free-form message that may contain multiple distinct responsibilities, extract each as a separate item. For each item, infer: item_type (task / event / deadline / reminder), a short title, a due_date if stated or clearly implied, and a life_area (e.g. work, business, family, personal). If genuinely ambiguous, ask one clarifying question rather than guessing silently. Return structured JSON: { items: [ {title, item_type, due_date, life_area} ], clarification_needed: string or null }.
4.2 Resurfacing timing (rule-based, not a fresh LLM call per item)
Item with a stated deadline: first reminder set at a sensible interval before the deadline based on how far out it is (e.g. a same-week deadline reminds the day before; a month-out deadline reminds roughly a week before).
Item with no clear deadline: a single gentle check-in after a few days, then archived if not acted on.
4.3 Replan
Intent: given a user's follow-up message referencing an existing item (e.g. ‘push it to next week’) and the list of that user's currently open items, identify which item is being referenced and compute the updated due_date. Return JSON: { item_id, new_due_date, confirmation_text }. For the MVP demo, this flow is scripted against one specific, tested example rather than built as fully general reference-resolution.
4.4 Recap
Generated primarily from stored item data — query all open items for the user, grouped by life_area or urgency — then passed through Claude once for a short natural-language summary.
5. Sequence Flow (Capture → Resurface → Replan)
1. User submits a free-form message via the web input.
2. Backend calls the extraction prompt → receives one or more structured items.
3. Each item is stored with a computed remind_at.
4. Backend returns a plain-language confirmation → shown immediately in the UI.
5. Background: node-cron checks for items where remind_at has passed and status is still pending → marks them ‘surfaced’ → frontend shows them in the Today view.
6. If the user replies referencing an existing item, the replan prompt matches it and updates due_date and remind_at.
7. Recap requests query current item state directly and return a summary.
6. Who Builds What
Role
Owns
Backend developer
Extraction/classification API, database schema, replan logic, node-cron scheduler, deployment
Frontend developer
React chat-style capture UI, ‘Today / Upcoming / Everything’ view, real-time surfacing of due items
Product designer
Conversation and confirmation copy, visual design applying the brand direction, the single scripted replan interaction
Business analyst
Test scenarios across all three personas, expected-value narrative, privacy copy, demo script timing
7. Build Plan — Starting Tonight (Sunday) Through Tuesday
Sunday night
Team decision locked in; roles assigned; repo, Vercel, and Render/Railway accounts created.
Supabase project created; initial schema pushed.
Monday — Day 1
Morning: extraction/classification prompt built and tested against 8–10 realistic messy inputs across all three personas.
Midday: backend API endpoints wired — capture, list items, mark done.
Afternoon: frontend capture UI + basic item list view connected to the live API.
Evening: full capture → confirmation → stored-item loop working end to end, no scheduler yet.
Tuesday — Day 2
Morning: node-cron scheduler wired — items surface in the Today view automatically when due.
Midday: the one scripted replan flow built and tested; recap command built.
Early afternoon: full run-through of the demo script across personas, bug fixes, buffer time.
Late afternoon: visual polish against the brand direction, deck finalised.
Evening: submission.
8. Known Risks & Mitigations
Risk
Mitigation
Extraction misses or misclassifies an item in a messy sentence
Curate and test against a fixed set of demo inputs in advance; don't rely on fully improvised live input for the core demo
Replan flow tries to generalise and breaks
Explicitly scope replan to one tested reference pattern for the demo — do not build general reference resolution
Scheduler timing too slow to show live
Compress the interval to 1–2 minutes and/or trigger manually during the demo run
Frontend polish eats into backend time
Timebox visual polish to Day 2 afternoon only, after the core loop already works
