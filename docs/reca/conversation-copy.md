# Reca — Conversation copy (wow / polished)

**Voice:** calm tutor. Short. Certain. Human.  
**Rule:** never “wrong.” Always “not quite” + answer + *I’ll remember / I’ll come back*.  
**Aha lines (must ship):** memory promise after a miss · one-question resurface · cleared ✓

Backend: use these strings exactly when possible. Related: [demo-script.md](./demo-script.md)

---

## 1. First message

```text
Hi — I'm Reca.

Send a topic like: explain photosynthesis

I'll explain it simply, ask 2 quick questions, and come back later if you miss something.
```

---

## 2. Explain + quiz (one question at a time — better for WhatsApp)

**After explanation:**

```text
{explanation}

Quick check — Q1: {question_1}
```

**After Q1 answered, send Q2:**

```text
Q2: {question_2}
```

*(If both at once for speed in demo, OK — keep under one screen.)*

---

## 3. Grading — make memory visible

### Q1 miss, Q2 hit (photosynthesis demo path)

```text
Q2 is correct.

Q1 — not quite. Mitochondria are for respiration. The answer is chloroplast.

I'll remember that chloroplast one for you — I'll check again soon.
```

### Both correct

```text
Nice — both correct. You've got this topic for now.

Want another topic? Try: explain osmosis
```

### Still unclear

```text
I couldn't match that. Reply with a short answer for Q1 — one or two words is fine.
```

---

## 4. Resurface (hero — unprompted, one line)

```text
Quick recall — {question_text}
```

**Demo:**

```text
Quick recall — which part of the plant cell captures sunlight for photosynthesis?
```

### Cleared

```text
Correct. Cleared: Photosynthesis ✓

You've got this one now. Want Chemistry next? Try: explain acids and bases simply
```

### Still not quite

```text
Not quite — it's {correct_answer}.

I'll remember it and check again later. You're building it.
```

---

## 4b. Daily briefing (unprompted companion — not a retest)

Scheduled once per day (07:00 Africa/Lagos). Demo fire: `POST /demo/briefing`.

```text
{N} days to WAEC. Today's focus: {weakest_topic} — your weakest topic. Ready?

Open Revise and pick {weakest_topic}, or reply: revise {weakest_topic}
```

**Demo example:**

```text
23 days to WAEC. Today's focus: Ecology — your weakest topic. Ready?

Open Revise and pick Ecology, or reply: revise Ecology
```

**Judge framing:** resurface = correctness-triggered recall; briefing = study-plan companion that comes first.

---

## 5. Recap

```text
Biology so far:
Strong: {strong_list}
Cleared: {cleared_list}
Needs work: {needs_work_list}

Next up: {next_weak}? Just send: explain {next_weak}
```

**Empty:**

```text
Nothing saved yet. Send: explain photosynthesis — and I'll start holding topics for you.
```

---

## 6. Help

```text
I can:
• explain a topic — explain photosynthesis
• show progress — how am I doing in Biology?

What do you want to study?
```

---

## 7. Errors (cause + fix)

```text
I got your message but couldn't finish that. Send the topic again — e.g. explain photosynthesis.
```

---

## 8. Never say

Wrong · Incorrect · You failed · Something went wrong · I think I understood

## 9. Pitch (spoken)

ChatGPT forgets. Reca doesn’t — it remembers what you got wrong and comes back.
