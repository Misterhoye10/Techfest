/** Polished WhatsApp copy. Keep in sync with docs/reca/conversation-copy.md */

const copy = {
  welcome: `Hi. I'm Reca.

Send a topic like: explain photosynthesis

I'll explain it simply, ask 2 quick questions, and come back later if you miss something.`,

  help: `I can:
• explain a topic (e.g. explain photosynthesis)
• show progress (e.g. how am I doing in Biology?)

What do you want to study?`,

  emptyRecap: `Nothing saved yet. Open Revise, pick a topic, and answer a few questions. Progress will fill in here.`,

  unclear: `I couldn't match that. Reply with a short answer for Q1. One or two words is fine.`,

  error: `I got your message but couldn't finish that. Send the topic again, e.g. explain photosynthesis.`,

  explainAndQ1(explanation, q1) {
    return `${explanation}

Quick check. Q1: ${q1}`;
  },

  q2(text) {
    return `Q2: ${text}`;
  },

  bothCorrect(nextHint = "explain osmosis") {
    return `Nice. Both correct. You've got this topic for now.

Want another topic? Try: ${nextHint}`;
  },

  mixedGrade({ q1Correct, q2Correct, q1, q2 }) {
    const lines = [];
    if (q2Correct) lines.push("Q2 is correct.");
    else if (q2)
      lines.push(`Q2: not quite. ${q2.correction}`);

    if (q1Correct) lines.push("Q1 is correct.");
    else if (q1) {
      lines.push(`Q1: not quite. ${q1.correction}`);
      lines.push(
        `I'll remember that ${q1.correctAnswer} one for you. I'll check again soon.`
      );
    }
    return lines.join("\n\n");
  },

  resurface(questionText) {
    return `Quick recall: ${questionText}`;
  },

  resurfaceCleared(topicLabel = "Photosynthesis") {
    return `Correct. Cleared: ${topicLabel}.

You've got this one now. Want another topic? Try: explain osmosis`;
  },

  resurfaceMiss(correctAnswer) {
    return `Not quite. The answer is ${correctAnswer}.

I'll remember it and check again later.`;
  },

  /**
   * Unprompted daily companion: study-plan nudge (not a retest).
   */
  dailyBriefing({ daysLeft, focusTopic, examLabel = "WAEC", name }) {
    const who = name ? `${name}. ` : "";
    const focus = focusTopic || "your next topic";
    if (typeof daysLeft === "number" && daysLeft >= 0) {
      return `${who}${daysLeft} day${daysLeft === 1 ? "" : "s"} to ${examLabel}. Today's focus: ${focus}, your weakest topic. Ready?

Open Revise and pick ${focus}, or reply: revise ${focus}`;
    }
    if (typeof daysLeft === "number" && daysLeft < 0) {
      return `${who}${examLabel} window is here. Today's focus: ${focus}. Keep clearing weak spots.

Open Revise and pick ${focus}.`;
    }
    return `${who}Today's focus: ${focus}, your weakest topic. Ready?

Open Revise and pick ${focus}.`;
  },

  /**
   * Proactive Nigerian university admin update: admission, POST-UTME, CAPS.
   */
  uniAdminUpdate({ update, name, universityName }) {
    const who = name ? `${name}. ` : "";
    const school = universityName || update?.universityName || "your school";
    const headline = update?.headline || "University admin update";
    const detail = update?.detail || "";
    const hint = update?.actionHint || "Verify on the official portal before you pay.";
    const sourceLine = update?.sourceUrl
      ? `\n\nSource: ${update.sourceUrl}`
      : "";
    const aiTag = update?.source === "ai-feed" ? " (AI summary from official page)" : "";
    return `${who}${headline} (${school})${aiTag}

${detail}

${hint}${sourceLine}

Always confirm on the school's official site. Reca reminds; it doesn't replace the portal.`;
  },

  recap({ subject, strong, cleared, needsWork, nextWeak, answered, correct, accuracy }) {
    const line = (label, list) =>
      list.length ? `${label}: ${list.join(", ")}` : null;
    const headline =
      answered > 0
        ? `${subject} so far: ${correct}/${answered} correct (${accuracy}%).`
        : `${subject} so far:`;
    const body = [
      headline,
      line("Strong", strong),
      line("Cleared", cleared),
      line("Needs work", needsWork),
    ]
      .filter(Boolean)
      .join("\n");

    if (nextWeak) {
      return `${body}

Next up: revise ${nextWeak}. Open Revise and pick that topic.`;
    }
    return body || copy.emptyRecap;
  },
};

module.exports = { copy };
