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
  pushOutbox,
  drainOutbox,
  _students: students,
};
