const { copy } = require("./copy");
const {
  findTopic,
  findTopicById,
  resolveLearnQuery,
  topicLabel,
  isRecap,
  isHelp,
  gradeAnswer,
  normalize,
} = require("./topics");
const store = require("./store");
const llm = require("./llm");

const resurfaceMinutes = Number(process.env.RESURFACE_MINUTES || 2);

function teachBite(topic, depth) {
  const qs = topic.questions || [];
  if (!qs.length) return null;
  const q = qs[depth % qs.length];
  const point = q.correctAnswer || (q.accept && q.accept[0]) || "";
  if (!point) return null;
  return `Another angle: ${point}`;
}

function spellingPreface(corrections) {
  if (!corrections?.length) return "";
  const bits = corrections
    .slice(0, 4)
    .map((c) => `you wrote “${c.typed}” — it’s spelled “${c.correct}”`);
  return `Spelling check: ${bits.join("; ")}.`;
}

function withSpelling(corrections, body) {
  const preface = spellingPreface(corrections);
  if (!preface) return body;
  return `${preface}\n\n${body}`;
}

async function gradeWithFallback(question, text) {
  if (llm.isEnabled()) {
    const result = await llm.gradeAnswerLlm({
      questionText: question.text,
      correctAnswer: question.correctAnswer,
      accept: question.accept || [question.correctAnswer],
      studentAnswer: text,
    });
    if (result) {
      return {
        ok: result.is_correct,
        feedback: result.feedback || null,
      };
    }
  }
  return { ok: gradeAnswer(question, text), feedback: null };
}

/** Learn follow-up while staying on the focused topic. */
async function learnFollowUp(student, topic, text, corrections) {
  const label = topicLabel(topic);

  if (llm.isEnabled()) {
    const ai = await llm.learnReply({
      topicTitle: label,
      subject: topic.subject,
      explanation: topic.explanation,
      studentAsk: text,
    });
    if (ai?.reply) {
      student.learnDepth = (student.learnDepth || 0) + 1;
      return [withSpelling(corrections, ai.reply)];
    }
  }

  const depth = student.learnDepth || 0;
  student.learnDepth = depth + 1;
  const bite = teachBite(topic, depth);
  const parts = [
    `Still on ${label} — here’s more on what you asked.`,
    "",
    topic.explanation,
  ];
  if (bite) {
    parts.push("", bite);
  }
  parts.push(
    "",
    "Keep asking about this or any other topic — or let Reca’s AI quiz you when you’re ready."
  );
  return [withSpelling(corrections, parts.join("\n"))];
}

async function handleIncoming(phone, body, opts = {}) {
  const text = String(body || "").trim();
  const student = store.getStudent(phone);

  try {
    // Learn asks always win — never grade a question as a recall answer
    if (opts.mode === "learn") {
      student.pending = null;
      student.awaitingResurface = null;

      const resolved = resolveLearnQuery(
        text,
        opts.topicId || student.learnFocusId
      );
      let topic = resolved.topic;
      const corrections = resolved.corrections || [];

      if (!topic && opts.topicId) topic = findTopicById(opts.topicId);
      if (!topic && student.learnFocusId) {
        topic = findTopicById(student.learnFocusId);
      }

      if (!topic) {
        return [
          withSpelling(
            corrections,
            "I couldn’t lock onto a syllabus topic yet. Ask again with the topic name — even if the spelling’s off (e.g. “what is osmosiss?” or “photosyntesis”). Reca will correct it and explain."
          ),
        ];
      }

      const switching = Boolean(topic.id !== student.learnFocusId);
      const fresh = Boolean(opts.fresh) || switching || !student.learnFocusId;

      student.learnFocusId = topic.id;
      if (fresh) {
        student.learnDepth = 0;
        let explanation = topic.explanation;

        if (llm.isEnabled()) {
          const ai = await llm.learnReply({
            topicTitle: topicLabel(topic),
            subject: topic.subject,
            explanation: topic.explanation,
            studentAsk: text,
          });
          if (ai?.reply) explanation = ai.reply;
        }

        const bodyText = [
          explanation,
          "",
          `You’re on ${topicLabel(topic)} (${topic.subject}). Ask another question anytime — any topic — and Reca will answer.`,
        ].join("\n");
        return [withSpelling(corrections, bodyText)];
      }

      return learnFollowUp(student, topic, text, corrections);
    }

    if (student.awaitingResurface) {
      // Don't treat a clear question as a yes/no recall answer
      const q = normalize(text);
      const looksLikeQuestion =
        /\?$/.test(text.trim()) ||
        /^(what|why|how|when|where|who|explain|define|tell|describe|is|are|can|does|do)\b/.test(
          q
        );
      if (looksLikeQuestion) {
        student.awaitingResurface = null;
      } else {
        return handleResurfaceAnswer(student, text);
      }
    }

    if (student.pending) {
      return handlePendingAnswer(student, text);
    }

    if (isHelp(text)) return [copy.welcome];

    if (isRecap(text)) {
      const lower = text.toLowerCase();
      const subject = lower.includes("chemistry")
        ? "Chemistry"
        : lower.includes("biology")
          ? "Biology"
          : lower.includes("physics")
            ? "Physics"
            : lower.includes("math")
              ? "Mathematics"
              : null;
      const prog = store.progressFor(phone, subject);
      if (!prog.answered) {
        return [copy.emptyRecap];
      }
      return [copy.recap(prog)];
    }

    const topic = findTopic(text);
    if (!topic) return [copy.help];

    let explanation = topic.explanation;
    let questions = topic.questions;

    if (llm.isEnabled()) {
      const ai = await llm.explainAndQuiz({
        topicTitle: topicLabel(topic),
        subject: topic.subject,
        studentAsk: text,
      });
      if (ai) {
        explanation = ai.explanation;
        questions = ai.questions;
      }
    }

    student.pending = {
      topicId: topic.id,
      subject: topic.subject,
      step: "q1",
      topic: {
        ...topic,
        explanation,
        questions,
      },
      q1Correct: null,
      q2Correct: null,
    };

    return [copy.explainAndQ1(explanation, questions[0].text)];
  } catch (err) {
    console.error(err);
    return [copy.error];
  }
}

async function handlePendingAnswer(student, text) {
  const { topic, step } = student.pending;
  const q1 = topic.questions[0];
  const q2 = topic.questions[1];

  if (step === "q1") {
    const { ok } = await gradeWithFallback(q1, text);
    student.pending.q1Correct = ok;
    student.pending.step = "q2";
    student.pending.q1Answer = text;
    return [copy.q2(q2.text)];
  }

  if (step === "q2") {
    const { ok } = await gradeWithFallback(q2, text);
    student.pending.q2Correct = ok;
    student.pending.q2Answer = text;

    const q1Correct = student.pending.q1Correct;
    const q2Correct = ok;

    // Store attempts for memory / resurface
    const nextReviewAt = Date.now() + resurfaceMinutes * 60 * 1000;

    if (!q1Correct) {
      student.attempts.push({
        topicId: topic.id,
        subject: topic.subject,
        questionId: q1.id,
        questionText: q1.text,
        correctAnswer: q1.correctAnswer,
        accept: q1.accept,
        isCorrect: false,
        nextReviewAt,
        cleared: false,
        surfaced: false,
      });
    } else {
      student.attempts.push({
        topicId: topic.id,
        subject: topic.subject,
        questionId: q1.id,
        questionText: q1.text,
        correctAnswer: q1.correctAnswer,
        accept: q1.accept,
        isCorrect: true,
        nextReviewAt: null,
        cleared: false,
        surfaced: false,
      });
    }

    if (!q2Correct) {
      student.attempts.push({
        topicId: topic.id,
        subject: topic.subject,
        questionId: q2.id,
        questionText: q2.text,
        correctAnswer: q2.correctAnswer,
        accept: q2.accept,
        isCorrect: false,
        nextReviewAt,
        cleared: false,
        surfaced: false,
      });
    } else {
      student.attempts.push({
        topicId: topic.id,
        subject: topic.subject,
        questionId: q2.id,
        questionText: q2.text,
        correctAnswer: q2.correctAnswer,
        accept: q2.accept,
        isCorrect: true,
        nextReviewAt: null,
        cleared: false,
        surfaced: false,
      });
    }

    const reply =
      q1Correct && q2Correct
        ? copy.bothCorrect(
            topic.id === "photosynthesis" ? "explain osmosis" : "explain photosynthesis"
          )
        : copy.mixedGrade({
            q1Correct,
            q2Correct,
            q1: q1Correct ? null : q1,
            q2: q2Correct ? null : q2,
          });

    student.pending = null;
    return [reply];
  }

  student.pending = null;
  return [copy.help];
}

async function handleResurfaceAnswer(student, text) {
  const pending = student.awaitingResurface;

  if (llm.isEnabled()) {
    const result = await llm.gradeAnswerLlm({
      questionText: pending.questionText,
      correctAnswer: pending.correctAnswer,
      accept: pending.accept,
      studentAnswer: text,
    });
    if (result) {
      if (result.is_correct) {
        if (student.attempts[pending.attemptIndex]) {
          student.attempts[pending.attemptIndex].cleared = true;
          student.attempts[pending.attemptIndex].isCorrect = true;
        }
        student.awaitingResurface = null;
        return [copy.resurfaceCleared(pending.topicLabel)];
      }
      student.awaitingResurface = null;
      if (student.attempts[pending.attemptIndex]) {
        student.attempts[pending.attemptIndex].surfaced = false;
        student.attempts[pending.attemptIndex].nextReviewAt =
          Date.now() + resurfaceMinutes * 60 * 1000;
      }
      return [copy.resurfaceMiss(pending.correctAnswer)];
    }
  }

  const ok = pending.accept.some((a) => {
    const n = normalize(a);
    const ans = normalize(text);
    return ans === n || ans.includes(n) || n.includes(ans);
  });

  if (ok) {
    if (student.attempts[pending.attemptIndex]) {
      student.attempts[pending.attemptIndex].cleared = true;
      student.attempts[pending.attemptIndex].isCorrect = true;
    }
    student.awaitingResurface = null;
    return [copy.resurfaceCleared(pending.topicLabel)];
  }

  student.awaitingResurface = null;
  if (student.attempts[pending.attemptIndex]) {
    student.attempts[pending.attemptIndex].surfaced = false;
    student.attempts[pending.attemptIndex].nextReviewAt =
      Date.now() + resurfaceMinutes * 60 * 1000;
  }
  return [copy.resurfaceMiss(pending.correctAnswer)];
}

/** Build resurface payload for a due attempt */
function prepareResurface(phone, attempt, index) {
  const student = store.getStudent(phone);
  const topicLabelText = attempt.topicId
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  student.awaitingResurface = {
    attemptIndex: index,
    questionText: attempt.questionText,
    correctAnswer: attempt.correctAnswer,
    accept: attempt.accept,
    topicLabel: topicLabelText,
  };
  store.markSurfaced(phone, index);
  return copy.resurface(attempt.questionText);
}

/** Unprompted daily study plan — weakest topic + days to exam */
function prepareDailyBriefing(phone) {
  const student = store.getStudent(phone);
  const progress = store.progressFor(phone);
  const dueLabel = progress.dueForRecall?.[0]?.label;
  const focusTopic =
    progress.nextWeak ||
    dueLabel ||
    progress.needsWork?.[0] ||
    "Photosynthesis";
  const daysLeft = store.daysUntilExam(student.examDate);
  const message = copy.dailyBriefing({
    daysLeft,
    focusTopic,
    examLabel: student.examLabel || "WAEC",
    name: student.displayName || null,
  });
  store.markBriefed(phone);
  return message;
}

module.exports = {
  handleIncoming,
  prepareResurface,
  prepareDailyBriefing,
};
