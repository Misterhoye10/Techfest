const {
  topics,
  findTopicById,
  topicLabel,
  gradeAnswer,
  shuffle,
} = require("./topics");
const store = require("./store");
const { getDiagram } = require("./diagrams");

const resurfaceMinutes = Number(process.env.RESURFACE_MINUTES || 2);

function publicQuestion(topic, question, index, total) {
  return {
    topicId: topic.id,
    topicLabel: topicLabel(topic),
    subject: topic.subject,
    questionId: question.id,
    index,
    total,
    text: question.text,
    options: shuffle(question.options || [question.correctAnswer]),
    diagram: getDiagram(topic.id, topic.subject),
  };
}

function sessionOrder(quiz, topic) {
  if (quiz.order?.length) return quiz.order;
  return topic.questions.map((_, i) => i);
}

/** Start a revise quiz — AI asks, student picks or types. No explanation.
 *  @param {string} phone
 *  @param {string} topicId
 *  @param {{ limit?: number }} [opts] — default 5; Learn quick-check uses 2
 */
function startQuiz(phone, topicId, opts = {}) {
  const student = store.getStudent(phone);
  const topic = topicId ? findTopicById(topicId) : topics[0];
  if (!topic) return { error: "Topic not found" };
  if (!topic.questions?.length) return { error: "No questions for this topic" };

  student.pending = null;
  student.awaitingResurface = null;

  const order = topic.questions.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const requested = Number(opts.limit);
  const limit = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : 5;
  const session = order.slice(0, Math.min(limit, order.length));

  student.quiz = {
    topicId: topic.id,
    qIndex: 0,
    order: session,
    results: [],
  };

  const q = topic.questions[session[0]];
  return {
    ok: true,
    question: publicQuestion(topic, q, 1, session.length),
  };
}

function currentQuiz(phone) {
  const student = store.getStudent(phone);
  if (!student.quiz) return { ok: true, active: false };
  const topic = findTopicById(student.quiz.topicId);
  if (!topic) return { ok: true, active: false };
  const order = sessionOrder(student.quiz, topic);
  const qi = student.quiz.qIndex;
  if (qi >= order.length) return { ok: true, active: false, done: true };
  const q = topic.questions[order[qi]];
  if (!q) return { ok: true, active: false, done: true };
  return {
    ok: true,
    active: true,
    question: publicQuestion(topic, q, qi + 1, order.length),
  };
}

function answerQuiz(phone, answer) {
  const student = store.getStudent(phone);
  if (!student.quiz) return { error: "No active revise session. Start a topic first." };

  const topic = findTopicById(student.quiz.topicId);
  if (!topic) return { error: "Topic missing" };

  const order = sessionOrder(student.quiz, topic);
  const qi = student.quiz.qIndex;
  const question = topic.questions[order[qi]];
  if (!question) return { error: "No question" };

  const correct = gradeAnswer(question, answer);
  const nextReviewAt = Date.now() + resurfaceMinutes * 60 * 1000;

  student.attempts.push({
    topicId: topic.id,
    subject: topic.subject,
    questionId: question.id,
    questionText: question.text,
    correctAnswer: question.correctAnswer,
    accept: question.accept,
    isCorrect: correct,
    nextReviewAt: correct ? null : nextReviewAt,
    cleared: false,
    surfaced: false,
  });

  student.quiz.results.push({ questionId: question.id, correct });

  const feedback = {
    correct,
    correctAnswer: question.correctAnswer,
    correction: correct ? null : question.correction,
    message: correct
      ? "Correct — well done."
      : question.correction ||
        `Not quite. The answer is ${question.correctAnswer}. Remember that for next time.`,
    memoryPromise: correct
      ? null
      : "Saved to Progress. Reca will bring this back later.",
  };

  const nextIndex = qi + 1;
  if (nextIndex >= order.length) {
    const score = student.quiz.results.filter((r) => r.correct).length;
    const total = student.quiz.results.length;
    const missed = total - score;
    student.quiz = null;
    return {
      ok: true,
      feedback,
      done: true,
      summary: {
        topicLabel: topicLabel(topic),
        topicId: topic.id,
        score,
        total,
        message:
          score === total
            ? `Perfect — ${score}/${total}. You’ve got this topic for now.`
            : `${score}/${total} correct. Missed ones are saved in Progress.`,
      },
      question: null,
    };
  }

  student.quiz.qIndex = nextIndex;
  const nextQ = topic.questions[order[nextIndex]];
  return {
    ok: true,
    feedback,
    done: false,
    question: publicQuestion(topic, nextQ, nextIndex + 1, order.length),
  };
}

/** End revise early — keep attempts already logged for Progress / resurface. */
function endQuiz(phone) {
  const student = store.getStudent(phone);
  if (!student.quiz) return { ok: true, ended: false };
  const topic = findTopicById(student.quiz.topicId);
  const score = student.quiz.results.filter((r) => r.correct).length;
  const total = student.quiz.results.length;
  const topicId = student.quiz.topicId;
  const label = topic ? topicLabel(topic) : topicId;
  student.quiz = null;
  const missed = student.attempts.filter(
    (a) => a.topicId === topicId && !a.isCorrect && !a.cleared
  ).length;
  return {
    ok: true,
    ended: true,
    summary: {
      topicLabel: label,
      topicId,
      score,
      total,
      message:
        total === 0
          ? "Session ended. Pick a topic when you're ready."
          : missed > 0
            ? `Paused at ${score}/${total}. I'll remember what you missed.`
            : `Paused at ${score}/${total}. Solid work — come back anytime.`,
    },
  };
}

module.exports = { startQuiz, answerQuiz, currentQuiz, endQuiz };
