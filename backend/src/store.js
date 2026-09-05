/**
 * In-memory store for hackathon MVP.
 * Swap for Supabase later — same shape.
 *
 * Identity = WhatsApp number (E.164). Web + WhatsApp share the same student key.
 */
const students = new Map();
/** phone (E.164) → { phone, name, email?, createdAt } */
const accounts = new Map();
/** legacy email index (optional) */
const accountsByEmail = new Map();
/** Outbound messages for web chat clients: phone → [{ id, text, at, kind }] */
const outbox = new Map();

function normalizeEmail(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase();
}

/** Turn NG local / messy input into E.164 (+234…). */
function normalizePhoneE164(raw, defaultCountry = "NG") {
  let s = String(raw || "").trim();
  if (!s) return null;
  s = s.replace(/^whatsapp:/i, "").replace(/[\s\-().]/g, "");
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  if (/^\+?\d{10,15}$/.test(s)) {
    if (!s.startsWith("+")) {
      if (defaultCountry === "NG") {
        if (s.startsWith("0") && s.length === 11) s = `+234${s.slice(1)}`;
        else if (s.startsWith("234") && s.length === 13) s = `+${s}`;
        else if (s.length === 10) s = `+234${s}`;
        else s = `+${s}`;
      } else {
        s = `+${s}`;
      }
    }
    if (/^\+\d{10,15}$/.test(s)) return s;
  }
  return null;
}

function upsertAccount({ phone, name, email }) {
  const key = normalizePhoneE164(phone);
  if (!key) {
    const err = new Error(
      "Enter your WhatsApp number in international format — e.g. +2348012345678"
    );
    err.status = 400;
    throw err;
  }
  const displayName = String(name || "").trim().slice(0, 40);
  const emailKey = email ? normalizeEmail(email) : null;
  const existing = accounts.get(key);
  const account = {
    phone: key,
    name: displayName || existing?.name || "Student",
    email: emailKey || existing?.email || null,
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  accounts.set(key, account);
  if (account.email) accountsByEmail.set(account.email, key);

  const student = getStudent(key);
  if (account.name) student.displayName = account.name;

  return account;
}

function getAccount(phoneOrEmail) {
  const asPhone = normalizePhoneE164(phoneOrEmail);
  if (asPhone && accounts.has(asPhone)) return accounts.get(asPhone);
  const emailKey = normalizeEmail(phoneOrEmail);
  if (emailKey && accountsByEmail.has(emailKey)) {
    return accounts.get(accountsByEmail.get(emailKey)) || null;
  }
  return null;
}

function getAccountByPhone(phone) {
  const key = normalizePhoneE164(phone);
  return key ? accounts.get(key) || null : null;
}

function getStudent(phone) {
  if (!students.has(phone)) {
    students.set(phone, {
      phone,
      pending: null,
      attempts: [],
      awaitingResurface: null,
      examDate: defaultExamDate(),
      examLabel: process.env.EXAM_LABEL || "WAEC",
      displayName: null,
      lastBriefingDay: null,
      targetUniversity: null,
      uniUpdatesEnabled: true,
      deliveredUniUpdateIds: [],
      lastUniUpdateDay: null,
    });
  }
  const s = students.get(phone);
  if (!s.examDate) s.examDate = defaultExamDate();
  if (!s.examLabel) s.examLabel = process.env.EXAM_LABEL || "WAEC";
  return s;
}

function defaultExamDate() {
  return process.env.WAEC_EXAM_DATE || "2027-05-17";
}

function daysUntilExam(examDateIso) {
  const raw = String(examDateIso || defaultExamDate()).slice(0, 10);
  const end = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(end.getTime())) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endDay - start) / 86400000);
}

function todayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function setExamDate(phone, isoDate) {
  const s = getStudent(phone);
  const raw = String(isoDate || "").trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const err = new Error("Use exam date as YYYY-MM-DD.");
    err.status = 400;
    throw err;
  }
  s.examDate = raw;
  return s;
}

function setDisplayName(phone, name) {
  const s = getStudent(phone);
  const v = String(name || "").trim().slice(0, 40);
  s.displayName = v || null;
  return s;
}

/** Students with enough signal for a daily plan nudge */
function listBriefingCandidates(now = new Date()) {
  const day = todayKey(now);
  const out = [];
  for (const student of students.values()) {
    if (!student.attempts?.length) continue;
    if (student.lastBriefingDay === day) continue;
    out.push(student);
  }
  return out;
}

function markBriefed(phone, now = new Date()) {
  const s = getStudent(phone);
  s.lastBriefingDay = todayKey(now);
  return s;
}

function setTargetUniversity(phone, universityId) {
  const s = getStudent(phone);
  const raw = String(universityId || "").trim();
  if (!raw) {
    s.targetUniversity = null;
    return s;
  }
  s.targetUniversity = raw.slice(0, 32);
  return s;
}

function setUniUpdatesEnabled(phone, enabled) {
  const s = getStudent(phone);
  s.uniUpdatesEnabled = enabled !== false;
  return s;
}

/** Students eligible for a weekday admin update drop */
function listUniUpdateCandidates(now = new Date()) {
  const day = todayKey(now);
  const out = [];
  for (const student of students.values()) {
    if (student.uniUpdatesEnabled === false) continue;
    if (student.lastUniUpdateDay === day) continue;
    out.push(student);
  }
  return out;
}

function markUniUpdateDelivered(phone, updateId, now = new Date()) {
  const s = getStudent(phone);
  if (!Array.isArray(s.deliveredUniUpdateIds)) s.deliveredUniUpdateIds = [];
  if (updateId && !s.deliveredUniUpdateIds.includes(updateId)) {
    s.deliveredUniUpdateIds.push(updateId);
  }
  s.lastUniUpdateDay = todayKey(now);
  return s;
}

function resetUniUpdateCycle(phone) {
  const s = getStudent(phone);
  s.deliveredUniUpdateIds = [];
  return s;
}

function pushOutbox(phone, text, kind = "bot", meta = {}) {
  if (!outbox.has(phone)) outbox.set(phone, []);
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    kind,
    at: Date.now(),
    type: meta.type || kind || "bot",
    topicId: meta.topicId || null,
    topicLabel: meta.topicLabel || null,
    title: meta.title || null,
    questionText: meta.questionText || null,
    correctAnswer: meta.correctAnswer || null,
    accept: Array.isArray(meta.accept) ? meta.accept.slice(0, 12) : null,
    updateId: meta.updateId || null,
    universityName: meta.universityName || null,
    category: meta.category || null,
    sourceUrl: meta.sourceUrl || null,
    source: meta.source || null,
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

  const dueForRecall = [];
  const seenQ = new Set();
  for (const a of s.attempts) {
    if (subjectFilter && a.subject.toLowerCase() !== subjectFilter.toLowerCase()) continue;
    if (a.isCorrect || a.cleared) continue;
    const key = `${a.topicId}:${a.questionId}`;
    if (seenQ.has(key)) continue;
    seenQ.add(key);
    dueForRecall.push({
      topicId: a.topicId,
      label: capitalize(a.topicId.replace(/-/g, " ")),
      subject: a.subject,
      questionText: a.questionText,
      dueAt: a.nextReviewAt || null,
      isDue: Boolean(a.nextReviewAt && a.nextReviewAt <= Date.now()),
    });
  }
  dueForRecall.sort((a, b) => {
    if (a.isDue !== b.isDue) return a.isDue ? -1 : 1;
    return (a.dueAt || 0) - (b.dueAt || 0);
  });

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
    dueForRecall: dueForRecall.slice(0, 8),
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
  upsertAccount,
  getAccount,
  getAccountByPhone,
  normalizeEmail,
  normalizePhoneE164,
  daysUntilExam,
  setExamDate,
  setDisplayName,
  listBriefingCandidates,
  markBriefed,
  setTargetUniversity,
  setUniUpdatesEnabled,
  listUniUpdateCandidates,
  markUniUpdateDelivered,
  resetUniUpdateCycle,
  defaultExamDate,
  _students: students,
  _accounts: accounts,
};
