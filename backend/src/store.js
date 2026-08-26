/**
 * In-memory store for hackathon MVP.
 * Swap for Supabase later — same shape.
 */
const students = new Map();
/** Outbound messages for web chat clients: phone → [{ id, text, at, kind }] */
const outbox = new Map();

function getStudent(phone) {
  if (!students.has(phone)) {
    students.set(phone, {
      phone,
      pending: null,
      attempts: [],
      awaitingResurface: null,
    });
  }
  return students.get(phone);
}

function pushOutbox(phone, text, kind = "bot") {
  if (!outbox.has(phone)) outbox.set(phone, []);
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    kind,
    at: Date.now(),
  };
  outbox.get(phone).push(item);
  return item;
}

function drainOutbox(phone, afterId) {
  const list = outbox.get(phone) || [];
  if (!afterId) return list.slice();
  const idx = list.findIndex((m) => m.id === afterId);
  return idx === -1 ? list.slice() : list.slice(idx + 1);
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
      answered: 0,
      correct: 0,
      wrongOpen: 0,
      cleared: 0,
    };
    cur.answered += 1;
    if (a.isCorrect || a.cleared) cur.correct += 1;
    if (!a.isCorrect && !a.cleared) cur.wrongOpen += 1;
    if (a.cleared) cur.cleared += 1;
    byTopic.set(a.topicId, cur);
  }

  const topics = [];
  const strong = [];
  const cleared = [];
  const needsWork = [];
  let answered = 0;
  let correct = 0;
  const bySubject = new Map();

  for (const t of byTopic.values()) {
    answered += t.answered;
    correct += t.correct;
    const label = capitalize(t.topicId.replace(/-/g, " "));
    const accuracy = t.answered ? Math.round((t.correct / t.answered) * 100) : 0;
    let status = "strong";
    if (t.wrongOpen > 0) status = "needsWork";
    else if (t.cleared > 0 && t.wrongOpen === 0) status = "cleared";

    const row = {
      topicId: t.topicId,
      label,
      subject: t.subject,
      answered: t.answered,
      correct: t.correct,
      wrongOpen: t.wrongOpen,
      accuracy,
      status,
    };
    topics.push(row);

    if (status === "needsWork") needsWork.push(label);
    else if (status === "cleared") cleared.push(label);
    else strong.push(label);

    const sub = bySubject.get(t.subject) || {
      subject: t.subject,
      answered: 0,
      correct: 0,
      needsWork: 0,
    };
    sub.answered += t.answered;
    sub.correct += t.correct;
    if (status === "needsWork") sub.needsWork += 1;
    bySubject.set(t.subject, sub);
  }

  topics.sort((a, b) => {
    if (a.status === "needsWork" && b.status !== "needsWork") return -1;
    if (b.status === "needsWork" && a.status !== "needsWork") return 1;
    return b.answered - a.answered;
  });

  const subjects = [...bySubject.values()].map((sub) => ({
    ...sub,
    accuracy: sub.answered ? Math.round((sub.correct / sub.answered) * 100) : 0,
  }));

  const nextWeakTopic = topics.find((t) => t.status === "needsWork") || null;

  return {
    subject: subjectFilter || "All subjects",
    answered,
    correct,
    accuracy: answered ? Math.round((correct / answered) * 100) : 0,
    strong,
    cleared,
    needsWork,
    topics,
    subjects,
    nextWeak: nextWeakTopic ? nextWeakTopic.label : null,
    nextWeakTopic,
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
  pushOutbox,
  drainOutbox,
  _students: students,
};
