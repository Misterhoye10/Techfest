const { copy } = require("./copy");
const {
  findTopic,
  isRecap,
  isHelp,
  gradeAnswer,
  normalize,
} = require("./topics");
const store = require("./store");

const resurfaceMinutes = Number(process.env.RESURFACE_MINUTES || 2);

function handleIncoming(phone, body) {
  const text = String(body || "").trim();
  const student = store.getStudent(phone);

  try {
    if (student.awaitingResurface) {
      return handleResurfaceAnswer(student, text);
    }

    if (student.pending) {
      return handlePendingAnswer(student, text);
    }

    if (isHelp(text)) return [copy.welcome];

    if (isRecap(text)) {
      const subject = text.toLowerCase().includes("chemistry")
        ? "Chemistry"
        : text.toLowerCase().includes("biology")
          ? "Biology"
          : null;
      const prog = store.progressFor(phone, subject);
      if (!prog.strong.length && !prog.cleared.length && !prog.needsWork.length) {
        return [copy.emptyRecap];
      }
      return [copy.recap(prog)];
    }

    const topic = findTopic(text);
    if (!topic) return [copy.help];

    student.pending = {
      topicId: topic.id,
      subject: topic.subject,
      step: "q1",
      topic,
      q1Correct: null,
      q2Correct: null,
    };

    return [copy.explainAndQ1(topic.explanation, topic.questions[0].text)];
  } catch (err) {
    console.error(err);
    return [copy.error];
  }
}

function handlePendingAnswer(student, text) {
  const { topic, step } = student.pending;
  const q1 = topic.questions[0];
  const q2 = topic.questions[1];

  if (step === "q1") {
    const ok = gradeAnswer(q1, text);
    student.pending.q1Correct = ok;
    student.pending.step = "q2";
    student.pending.q1Answer = text;
    return [copy.q2(q2.text)];
  }

  if (step === "q2") {
    const ok = gradeAnswer(q2, text);
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

function handleResurfaceAnswer(student, text) {
  const pending = student.awaitingResurface;
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
  const topicLabel = attempt.topicId
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  student.awaitingResurface = {
    attemptIndex: index,
    questionText: attempt.questionText,
    correctAnswer: attempt.correctAnswer,
    accept: attempt.accept,
    topicLabel,
  };
  store.markSurfaced(phone, index);
  return copy.resurface(attempt.questionText);
}

module.exports = {
  handleIncoming,
  prepareResurface,
};
