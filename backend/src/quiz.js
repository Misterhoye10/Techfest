const {
  topics,
  findTopicById,
  topicLabel,
  gradeAnswer,
  shuffle,
} = require("./topics");
const store = require("./store");
const { getDiagram } = require("./diagrams");
const { findPackById, packToTopic, questionsFromPack } = require("./data/diagram-packs");

const resurfaceMinutes = Number(process.env.RESURFACE_MINUTES || 2);
const DEFAULT_SESSION_LIMIT = 8;

function resolveQuizTopic(topicId) {
  if (!topicId) return topics[0];
  const fromBank = findTopicById(topicId);
  if (fromBank) return fromBank;
  const pack = findPackById(topicId);
  if (pack) {
    const topic = packToTopic(pack);
    topic.questions = questionsFromPack(pack, Math.min(5, pack.labels.length));
    return topic;
  }
  return null;
}

function normalizeExamBody(value) {
  const s = String(value || "")
    .trim()
    .toUpperCase();
  return s === "JAMB" ? "JAMB" : "WAEC";
}

function publicQuestion(topic, question, index, total, examBody = "WAEC") {
  const body = normalizeExamBody(examBody);
  const subject = question.sourceSubject || topic.subject;
  const label = question.sourceTopicLabel || topicLabel(topic);
  return {
    topicId: question.sourceTopicId || topic.id,
    topicLabel: label,
    subject,
    questionId: question.id,
    index,
    total,
    text: question.text,
    options: shuffle(question.options || [question.correctAnswer]),
    diagram: getDiagram(question.sourceTopicId || topic.id, subject),
    examBody: body,
  };
}

function sessionOrder(quiz, topic) {
  if (quiz.order?.length) return quiz.order;
  const qs = quiz.questions || topic.questions;
  return qs.map((_, i) => i);
}

function topicQuestions(quiz, topic) {
  return quiz.questions || topic.questions || [];
}

function sessionTopic(student) {
  if (!student.quiz) return null;
  if (student.quiz.topicSnapshot) return student.quiz.topicSnapshot;
  return resolveQuizTopic(student.quiz.topicId);
}

function buildSubjectTopic(subject) {
  const name = String(subject || "").trim();
  if (!name) return null;
  const pool = topics.filter(
    (t) => t.subject === name && Array.isArray(t.questions) && t.questions.length
  );
  if (!pool.length) return null;

  const stamped = [];
  for (const t of pool) {
    const label = topicLabel(t);
    for (const q of t.questions) {
      stamped.push({
        ...q,
        id: `${t.id}__${q.id}`,
        sourceTopicId: t.id,
        sourceTopicLabel: label,
        sourceSubject: t.subject,
      });
    }
  }
  if (!stamped.length) return null;

  return {
    id: `subject:${name}`,
    title: `${name} mix`,
    subject: name,
    questions: stamped,
    isSubjectMix: true,
  };
}

function resolveSessionLimit(opts) {
  const requested = Number(opts.limit);
  if (Number.isFinite(requested) && requested > 0) return Math.floor(requested);
  return DEFAULT_SESSION_LIMIT;
}

/** Start a revise quiz. Default 8; Learn quick-check uses 2; subject = mixed set. */
function startQuiz(phone, topicId, opts = {}) {
  const student = store.getStudent(phone);
  const subject = opts.subject ? String(opts.subject).trim() : "";
  const topic = subject && !topicId ? buildSubjectTopic(subject) : resolveQuizTopic(topicId);
  if (!topic) return { error: subject ? "No questions for that subject" : "Topic not found" };
  if (!topic.questions?.length) return { error: "No questions for this topic" };

  student.pending = null;
  student.awaitingResurface = null;

  const order = topic.questions.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const limit = resolveSessionLimit(opts);
  const session = order.slice(0, Math.min(limit, order.length));
  const examBody = normalizeExamBody(opts.examBody);

  student.quiz = {
    topicId: topic.id,
    qIndex: 0,
    order: session,
    results: [],
    examBody,
    questions: topic.questions,
    topicSnapshot: topic,
    subject: topic.subject,
  };

  const q = topic.questions[session[0]];
  return {
    ok: true,
    question: publicQuestion(topic, q, 1, session.length, examBody),
  };
}

function currentQuiz(phone) {
  const student = store.getStudent(phone);
  if (!student.quiz) return { ok: true, active: false };
  const topic = sessionTopic(student);
  if (!topic) return { ok: true, active: false };
  const qs = topicQuestions(student.quiz, topic);
  const order = sessionOrder(student.quiz, topic);
  const qi = student.quiz.qIndex;
  if (qi >= order.length) return { ok: true, active: false, done: true };
  const q = qs[order[qi]];
  if (!q) return { ok: true, active: false, done: true };
  return {
    ok: true,
    active: true,
    question: publicQuestion(
      { ...topic, questions: qs },
      q,
      qi + 1,
      order.length,
      student.quiz.examBody
    ),
  };
}

function answerQuiz(phone, answer) {
  const student = store.getStudent(phone);
  if (!student.quiz) return { error: "No active revise session. Start a topic first." };

  const topic = sessionTopic(student);
  if (!topic) return { error: "Topic missing" };

  const qs = topicQuestions(student.quiz, topic);
  const order = sessionOrder(student.quiz, topic);
  const qi = student.quiz.qIndex;
  const question = qs[order[qi]];
  if (!question) return { error: "No question" };

  const correct = gradeAnswer(question, answer);
  const nextReviewAt = Date.now() + resurfaceMinutes * 60 * 1000;
  const attemptTopicId = question.sourceTopicId || topic.id;

  student.attempts.push({
    topicId: attemptTopicId,
    subject: question.sourceSubject || topic.subject,
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
  store.scheduleSave();

  const feedback = {
    correct,
    correctAnswer: question.correctAnswer,
    correction: correct ? null : question.correction,
    message: correct
      ? "Correct. Well done."
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
    const summaryTopicId = topic.id;
    const summaryLabel = topicLabel(topic);
    const summarySubject = topic.subject;
    student.quiz = null;
    return {
      ok: true,
      feedback,
      done: true,
      summary: {
        topicLabel: summaryLabel,
        topicId: summaryTopicId,
        subject: summarySubject,
        score,
        total,
        message:
          score === total
            ? `Perfect. ${score}/${total}. You've got this for now.`
            : `${score}/${total} correct. Missed ones are saved in Progress.`,
      },
      question: null,
    };
  }

  student.quiz.qIndex = nextIndex;
  const nextQ = qs[order[nextIndex]];
  return {
    ok: true,
    feedback,
    done: false,
    question: publicQuestion(
      { ...topic, questions: qs },
      nextQ,
      nextIndex + 1,
      order.length,
      student.quiz.examBody
    ),
  };
}

/** End revise early - keep attempts already logged for Progress / resurface. */
function endQuiz(phone) {
  const student = store.getStudent(phone);
  if (!student.quiz) return { ok: true, ended: false };
  const topic = sessionTopic(student);
  const score = student.quiz.results.filter((r) => r.correct).length;
  const total = student.quiz.results.length;
  const topicId = student.quiz.topicId;
  const label = topic ? topicLabel(topic) : topicId;
  const subject = topic?.subject || student.quiz.subject;
  student.quiz = null;
  const missed = student.attempts.filter(
    (a) =>
      (a.topicId === topicId || (subject && a.subject === subject)) &&
      !a.isCorrect &&
      !a.cleared
  ).length;
  return {
    ok: true,
    ended: true,
    summary: {
      topicLabel: label,
      topicId,
      subject,
      score,
      total,
      message:
        total === 0
          ? "Session ended. Pick a topic when you're ready."
          : missed > 0
            ? `Paused at ${score}/${total}. I'll remember what you missed.`
            : `Paused at ${score}/${total}. Solid work. Come back anytime.`,
    },
  };
}

module.exports = {
  startQuiz,
  answerQuiz,
  currentQuiz,
  endQuiz,
  DEFAULT_SESSION_LIMIT,
};
