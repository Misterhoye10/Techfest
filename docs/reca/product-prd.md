# Reca Product PRD

RECA
AI Study Companion for WAEC & JAMB Candidates
Product Requirements Document
AI BuildFest 2026, Track 3 — Case Study 2 — 2-Day MVP Build
1. Explain Like You're 15
What is Reca, really?
You send a topic to a WhatsApp number — say ‘explain photosynthesis.’ It explains it in simple words, then quizzes you with two quick questions. If you get one wrong, it doesn't just move on and forget about it. A few days later, without you asking, it messages you again with the exact same question to check if you remember now. That's the whole idea: a study friend that never forgets what you're weak at, and keeps quietly testing you until you've actually learned it.
2. Problem Statement
1,950,726 candidates sat the 2026 WASSCE across Nigeria, Benin Republic, Côte d'Ivoire and Equatorial Guinea, with only 61.54% obtaining credits in five subjects including English and Maths — a decline from the prior year. Separately, JAMB registered 2,243,816 candidates for the 2026 UTME, up over 10% from 2025. Millions of students are self-studying every year with no reliable way to know what they've actually forgotten.
Most students study by rereading notes, not by testing themselves. Generic AI chatbots can explain a topic once, but none of them persistently remember that a specific student got a specific question wrong three days ago and bring it back at the right moment. That memory-over-time layer is what's missing.
3. Who This Is For — User Personas
Chiamaka  —  SS3 student, WASSCE candidate, 17
Context: Public secondary school in Lagos, preparing for WASSCE in a few months. Studies from photocopied notes and a shared textbook.
Goal: Pass with credits in 5 subjects including English and Maths so she can proceed to university.
Frustration: Rereads her notes for hours but has no way to tell which topics she's actually retaining versus just recognising.
“I read it and it makes sense, but when I try to answer past questions I freeze. I don't know what I don't know.”

Tobi  —  JAMB repeat candidate, 19
Context: Finished secondary school last year, working part-time while preparing to retake JAMB to improve his score for a better course placement.
Goal: Raise his UTME score enough to qualify for Computer Science at his target university.
Frustration: Studies alone with no teacher to ask, and loses track of which subjects need more attention as the exam date approaches.
“By the time I get back to a topic I studied last month, I've forgotten half of it and have to start over.”
4. Why This Fits “AI for Everyday Life” — Case Study 2
Case Study 2 Requirement
Reca Feature
Accept uploaded notes, topics, or learning objectives
Student sends a topic or photo of notes via WhatsApp
Summarise learning materials accurately
AI explanation step, grounded in the submitted material
Explain difficult concepts in simpler language
Core /explain function, plain-language by default
Generate flashcards, quizzes, practice questions
2–3 auto-generated practice questions per topic
Provide feedback on submitted answers
Immediate grading + correction in the same chat thread
Identify topics needing improvement
Weak-topic flag stored per student per topic
Create a personalised study plan
Spaced-repetition schedule generated from weak topics
Track progress across subjects/topics
“How am I doing?” progress recap command
Adjust difficulty based on performance
Question difficulty scales with correctness history

5. Core Product Loop
The habit Reca builds: think of a topic → message Reca → get explained and tested → get reminded later. No app to open, no dashboard to navigate.
1. Capture — student sends a topic, a question, or a photo of their notes.
2. Explain — AI returns a plain-language explanation at WAEC/JAMB syllabus level.
3. Test — AI immediately follows with 2–3 practice questions on that topic.
4. Grade — student answers in the same thread; AI grades and corrects instantly.
5. Remember — AI logs topic, correctness, and a next-review date.
6. Resurface — the system proactively re-sends the weak topic days later, unprompted.
7. Recap — student can ask “how am I doing in Biology?” for a subject-level summary any time.
6. Full Feature List
MVP — must work for the demo
Topic submission by text (“explain X”)
Plain-language explanation, WAEC/JAMB level
Auto-generated 2–3 practice questions per topic
Instant grading with correction feedback
Spaced-repetition logging (fixed 3-day interval)
Scheduled, unprompted resurfacing message
“How am I doing?” progress recap on request
Coverage: 2 demo subjects — Biology and Chemistry
Stretch — only if time remains on Day 2
Photo-of-notes input (student sends a picture instead of typing a topic)
Difficulty scaling based on correctness streak
Simple companion web view showing all logged topics at a glance
Post-hackathon roadmap — do not build now
Full syllabus coverage across all WAEC/JAMB subjects
True adaptive spaced-repetition algorithm (SM-2 style, increasing intervals)
Yoruba / Igbo / Hausa language support
Parent or teacher progress dashboard
7. Simulated Workflow — Full Conversation
Day 1, 4:12 PM
Chiamaka: “Explain photosynthesis simply”
Reca: “Photosynthesis is how plants make their own food using sunlight, water, and carbon dioxide. Chlorophyll in the leaves captures sunlight, powering a reaction that turns CO₂ and water into glucose and oxygen.”
Reca: “Quick check — Q1: Which part of the plant cell captures sunlight? Q2: What are the two main products of photosynthesis?”
Chiamaka: “Q1 mitochondria, Q2 glucose and oxygen”
Reca: “Q2 is correct ✅. Q1 — not quite, mitochondria is for respiration. The correct answer is chloroplast. I'll check this one again in a few days.”

Day 4, 9:00 AM — unprompted
Reca: “Quick recall — which part of the plant cell captures sunlight for photosynthesis?”
Chiamaka: “chloroplast”
Reca: “Correct ✅ You've got this one now. Want another Biology topic, or should we look at Chemistry?”

On request, any time
Chiamaka: “how am I doing in Biology?”
Reca: “You've covered 6 topics. Strong: Cell structure, Respiration, Genetics. Cleared: Photosynthesis ✅. Needs work: Ecology, Reproduction. Want to tackle Ecology next?”
8. MVP Scope for the 2-Day Build
Channel decision: WhatsApp
WhatsApp is chosen because studying happens in idle moments — between classes, on transport, at night — and a channel students already have open beats a new app they have to remember to launch. The resurfacing message is the entire value proposition, and it only works if it lands somewhere the student already checks.
In scope
WhatsApp-based topic capture (text)
Explanation + question generation + grading via Claude API
Fixed-interval spaced repetition and scheduled resurfacing
Progress recap on request
2 demo subjects, 8–10 pre-curated topics
Out of scope for MVP
Full subject/syllabus breadth
Adaptive difficulty algorithms
Any language beyond English
9. Success Metrics
Demo: one full loop completed live — capture → explain → test → grade → resurface → recap
Post-MVP: % of resurfaced topics answered correctly on retry — proof the memory system works
Post-MVP: weekly active students, message-to-response engagement rate
10. Privacy & Responsible-Use Notes
Only topic text, question attempts, and correctness are stored — no sensitive personal data beyond a phone number identifier.
Reca supports understanding, not assignment completion — it will not simply hand over exam answers without an explanation step.
Students can request a recap, skip a topic, or opt out of scheduled resurfacing at any time.
11. Brand & Design Direction
Restrained, focused, encouraging — this is a study tool, not a game. It should feel calm and trustworthy, like a good tutor, never gimmicky.
Colour palette
Role
Colour
Hex
Primary / text
Deep navy
#14213D
Background
Warm off-white
#FAF7F2
Accent — progress, correct answers
Amber gold
#E8A33D
Success state
Muted green
#3C8859
Gentle correction (never harsh red)
Soft terracotta
#C1553B

Typography
Headings: Sora (Google Font, free) — confident, geometric, easy to implement fast.
Body / chat text: Inter (Google Font, free) — highly readable at small sizes for a chat interface.
Tone of voice
Encouraging, never scolding — wrong answers are framed as “not quite, here's the correct one,” never “wrong.”
Short sentences, plain language, no exam jargon unless the student used it first.
Celebrate cleared topics visibly (✅) — small wins matter for a long exam-prep season.
