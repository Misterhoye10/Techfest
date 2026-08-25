/**
 * In-memory store for hackathon MVP.
 * Swap for Supabase later — same shape.
 */
const students = new Map();

function getStudent(phone) {
  if (!students.has(phone)) {
    students.set(phone, {
      phone,
      // pending: { topicId, step: 'q1'|'q2'|'done', answers: {} }
      pending: null,
      // attempts: [{ topicId, subject, questionId, questionText, correctAnswer, isCorrect, nextReviewAt, cleared }]
      attempts: [],
      awaitingResurface: null, // { attemptIndex, questionText, correctAnswer, accept, topicLabel }
    });
  }
  return students.get(phone);
}

function listDue(now = Date.now()) {
  const due = [];
  for (const student of students.values()) {
    student.attempts.forEach((attempt, index) => {
      if (
        !attempt.isCorrect &&
        !attempt.cleared &&
        attempt.nextReviewAt &&
        attempt.nextReviewAt <= now &&
        !attempt.surfaced
      ) {
        due.push({ phone: student.phone, attempt, index });
      }
    });
  }
  return due;
}

function markSurfaced(phone, index) {
  const s = getStudent(phone);
  if (s.attempts[index]) s.attempts[index].surfaced = true;
}

function progressFor(phone, subjectFilter) {
  const s = getStudent(phone);
  const byTopic = new Map();
  for (const a of s.attempts) {
    if (subjectFilter && a.subject.toLowerCase() !== subjectFilter.toLowerCase()) continue;
    const cur = byTopic.get(a.topicId) || {
      topicId: a.topicId,
      subject: a.subject,
      anyWrong: false,
      anyCleared: false,
      anyCorrect: false,
    };
    if (a.isCorrect) cur.anyCorrect = true;
    if (!a.isCorrect && !a.cleared) cur.anyWrong = true;
    if (a.cleared) cur.anyCleared = true;
    byTopic.set(a.topicId, cur);
  }

  const strong = [];
  const cleared = [];
  const needsWork = [];
  for (const t of byTopic.values()) {
    const label = t.topicId.replace(/-/g, " ");
    if (t.anyCleared) cleared.push(capitalize(label));
    else if (t.anyWrong) needsWork.push(capitalize(label));
    else if (t.anyCorrect) strong.push(capitalize(label));
  }
  return {
    subject: subjectFilter || "All subjects",
    strong,
    cleared,
    needsWork,
    nextWeak: needsWork[0] || null,
  };
}

function capitalize(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

module.exports = {
  getStudent,
  listDue,
  markSurfaced,
  progressFor,
  _students: students,
};
