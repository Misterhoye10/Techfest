/** Polished WhatsApp copy — keep in sync with docs/reca/conversation-copy.md */

const copy = {
  welcome: `Hi — I'm Reca.

Send a topic like: explain photosynthesis

I'll explain it simply, ask 2 quick questions, and come back later if you miss something.`,

  help: `I can:
• explain a topic — explain photosynthesis
• show progress — how am I doing in Biology?

What do you want to study?`,

  emptyRecap: `Nothing saved yet. Send: explain photosynthesis — and I'll start holding topics for you.`,

  unclear: `I couldn't match that. Reply with a short answer for Q1 — one or two words is fine.`,

  error: `I got your message but couldn't finish that. Send the topic again — e.g. explain photosynthesis.`,

  explainAndQ1(explanation, q1) {
    return `${explanation}

Quick check — Q1: ${q1}`;
  },

  q2(text) {
    return `Q2: ${text}`;
  },

  bothCorrect(nextHint = "explain osmosis") {
    return `Nice — both correct. You've got this topic for now.

Want another topic? Try: ${nextHint}`;
  },

  mixedGrade({ q1Correct, q2Correct, q1, q2 }) {
    const lines = [];
    if (q2Correct) lines.push("Q2 is correct.");
    else if (q2)
      lines.push(`Q2 — not quite. ${q2.correction}`);

    if (q1Correct) lines.push("Q1 is correct.");
    else if (q1) {
      lines.push(`Q1 — not quite. ${q1.correction}`);
      lines.push(
        `I'll remember that ${q1.correctAnswer} one for you — I'll check again soon.`
      );
    }
    return lines.join("\n\n");
  },

  resurface(questionText) {
    return `Quick recall — ${questionText}`;
  },

  resurfaceCleared(topicLabel = "Photosynthesis") {
    return `Correct. Cleared: ${topicLabel} ✓

You've got this one now. Want another topic? Try: explain osmosis`;
  },

  resurfaceMiss(correctAnswer) {
    return `Not quite — it's ${correctAnswer}.

I'll remember it and check again later. You're building it.`;
  },

  recap({ subject, strong, cleared, needsWork, nextWeak }) {
    const line = (label, list) =>
      list.length ? `${label}: ${list.join(", ")}` : null;
    const body = [
      `${subject} so far:`,
      line("Strong", strong),
      line("Cleared", cleared),
      line("Needs work", needsWork),
    ]
      .filter(Boolean)
      .join("\n");

    if (nextWeak) {
      return `${body}

Next up: ${nextWeak}? Just send: explain ${nextWeak}`;
    }
    return body || copy.emptyRecap;
  },
};

module.exports = { copy };
