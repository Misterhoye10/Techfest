# Reca — Conversation copy pack

**Voice:** encouraging tutor, never scolding. Short sentences. Plain English.  
**Brand:** calm, focused, trustworthy — study tool, not a game.  
**Rule:** wrong answers → “not quite” + correct answer + promise to return. Never “wrong.” Never guilt.

Use these strings in the backend / WhatsApp replies. Related: [demo-script.md](./demo-script.md) · product brand in [product-prd.md](./product-prd.md)

---

## 1. First message / onboarding

**When student messages anything the first time (or `hi` / `start`):**

```text
Hi — I'm Reca, your study companion for WAEC & JAMB.

Send a topic like: explain photosynthesis

I'll explain it simply, ask 2 quick questions, and remember what you miss so we can practise again later.
```

---

## 2. After explain + questions

**Pattern:**

```text
{explanation}

Quick check —
Q1: {question_1}
Q2: {question_2}

Reply with your answers (e.g. Q1 … Q2 …).
```

**If one question at a time:**

```text
{explanation}

Quick check — Q1: {question_1}
```

Then after Q1:

```text
Q2: {question_2}
```

---

## 3. Grading

### Both correct

```text
Nice — both correct. You've got this topic for now. Want another Biology topic, or Chemistry?
```

### One correct, one not

```text
Q2 is correct.
Q1 — not quite. {short_correction} The answer is {correct_answer}. I'll check this one again soon.
```

### Both not quite

```text
Not quite on these yet.
Q1: {correction_1}
Q2: {correction_2}
I'll bring them back later so they stick. Want to try another topic meanwhile?
```

### Partial / unclear answer

```text
I couldn't quite match that to the answer. Try a short reply — for Q1, what's your best guess?
```

---

## 4. Resurface (hero — unprompted)

**Keep to one question. No wall of text.**

```text
Quick recall — {question_text}
```

**Photosynthesis demo:**

```text
Quick recall — which part of the plant cell captures sunlight for photosynthesis?
```

### After resurface — correct

```text
Correct. You've got this one now. Want another Biology topic, or should we look at Chemistry?
```

### After resurface — still not quite

```text
Not quite — it's {correct_answer}. I'll check again later. You're building it — keep going.
```

---

## 5. Recap

**Student says:** `how am I doing?` / `how am I doing in Biology?` / `how am I doing in Chemistry?`

**Template:**

```text
You've covered {n} topics in {subject}.
Strong: {list}
Cleared: {list}
Needs work: {list}

Want to tackle {next_weak_topic} next?
```

**Demo example:**

```text
You've covered 6 topics in Biology.
Strong: Cell structure, Respiration, Genetics.
Cleared: Photosynthesis.
Needs work: Ecology, Reproduction.

Want to tackle Ecology next?
```

**If empty / new user:**

```text
No topics logged yet. Send something like: explain photosynthesis — and we'll start.
```

---

## 6. Help / unknown intent

```text
I can:
• explain a topic — e.g. explain osmosis
• check how you're doing — how am I doing in Biology?

What do you want to study?
```

---

## 7. Errors (cause + fix — never “something went wrong”)

**AI timeout / overload:**

```text
I couldn't finish that explanation just now. Send the topic again in a moment — e.g. explain photosynthesis.
```

**Webhook / processing fail:**

```text
I got your message but couldn't process it. Please send it again.
```

**Not joined sandbox (support copy for humans, not bot):**

> Send `join <code>` to the Twilio number first — Reca only works on joined phones during the demo.

---

## 8. Words we never use

| Don’t say | Say instead |
|-----------|-------------|
| Wrong. | Not quite. |
| Incorrect. | Not quite — here’s the right one. |
| You failed. | I’ll check this again soon. |
| Stupid mistake / obvious | (never) |
| I think I understood… | Got it — … / Here’s a simple take — … |

---

## 9. Pitch crumbs (for slides / spoken)

- ChatGPT forgets. Reca doesn’t.
- Explain once is easy. Remembering what you missed is the product.
- Lives in WhatsApp — no new app to abandon.
- Built on a free stack for BuildFest — real to ship.
