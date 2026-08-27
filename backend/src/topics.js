/**
 * Preset curriculum — loads the generated bank (50 topics/subject × 50 Q&As).
 * Regenerate: node scripts/generate-curriculum.js
 */
const bank = require("./data/curriculum-bank");

const topics = bank.topics;

const STOP = new Set([
  "what",
  "whats",
  "which",
  "when",
  "where",
  "why",
  "how",
  "does",
  "do",
  "did",
  "is",
  "are",
  "was",
  "were",
  "the",
  "a",
  "an",
  "of",
  "in",
  "on",
  "to",
  "for",
  "and",
  "or",
  "with",
  "about",
  "explain",
  "define",
  "tell",
  "me",
  "please",
  "simply",
  "simple",
  "mean",
  "means",
  "can",
  "you",
  "your",
  "my",
  "i",
  "it",
  "its",
  "this",
  "that",
  "from",
  "into",
  "than",
  "then",
  "also",
  "just",
  "like",
  "more",
  "some",
  "any",
  "give",
  "show",
  "help",
  "question",
  "answer",
  "topic",
  "subject",
  "study",
  "learn",
  "waec",
  "jamb",
]);

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s&→\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function topicLabel(topic) {
  if (!topic) return "";
  return (
    topic.title ||
    topic.id
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}

function editDistance(a, b) {
  const s = String(a || "");
  const t = String(b || "");
  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const cols = t.length + 1;
  const prev = new Array(cols);
  const cur = new Array(cols);
  for (let j = 0; j < cols; j++) prev[j] = j;
  for (let i = 1; i <= s.length; i++) {
    cur[0] = i;
    for (let j = 1; j < cols; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j < cols; j++) prev[j] = cur[j];
  }
  return prev[cols - 1];
}

function maxEditsFor(word) {
  const n = String(word || "").length;
  if (n <= 3) return 0;
  if (n <= 5) return 1;
  if (n <= 9) return 2;
  return 3;
}

function topicTerms(topic) {
  const terms = new Set();
  const add = (raw) => {
    const n = normalize(raw);
    if (!n) return;
    terms.add(n);
    n.split(" ").forEach((w) => {
      if (w.length > 2) terms.add(w);
    });
  };
  add(topic.title);
  add(topic.id.replace(/-/g, " "));
  (topic.aliases || []).forEach(add);
  (topic.questions || []).slice(0, 25).forEach((q) => {
    add(q.correctAnswer);
    (q.accept || []).forEach(add);
    (q.options || []).forEach(add);
  });
  return [...terms];
}

let globalLexicon = null;
function getGlobalLexicon() {
  if (globalLexicon) return globalLexicon;
  const map = new Map();
  const add = (raw) => {
    const display = String(raw || "").trim();
    const n = normalize(display);
    if (!n || n.length < 3 || STOP.has(n)) return;
    if (!map.has(n)) map.set(n, display);
    n.split(" ").forEach((w) => {
      if (w.length >= 3 && !STOP.has(w) && !map.has(w)) map.set(w, w);
    });
  };
  topics.forEach((topic) => {
    add(topic.title);
    add(topic.id.replace(/-/g, " "));
    (topic.aliases || []).forEach(add);
  });
  ["Biology", "Chemistry", "Physics", "Mathematics", "Maths", "Math"].forEach(add);
  globalLexicon = map;
  return map;
}

function closestLexeme(word, lexicon) {
  const w = normalize(word);
  if (!w || STOP.has(w)) return null;
  if (lexicon.has(w)) return { typed: word, correct: lexicon.get(w), distance: 0 };

  const allowed = maxEditsFor(w);
  if (!allowed) return null;

  let best = null;
  let bestDist = Infinity;
  for (const [term, display] of lexicon) {
    if (Math.abs(term.length - w.length) > allowed) continue;
    const d = editDistance(w, term);
    if (d > 0 && d <= allowed && d < bestDist) {
      bestDist = d;
      best = { typed: word, correct: display, distance: d };
      if (d === 1) break;
    }
  }
  return best;
}

/** Spell-check student text against syllabus lexicon (+ optional topic terms). */
function spellcheckMessage(message, topic = null) {
  const lexicon = new Map(getGlobalLexicon());
  if (topic) {
    topicTerms(topic).forEach((term) => {
      if (!lexicon.has(term)) lexicon.set(term, term);
    });
  }

  const rawWords = String(message || "").match(/[A-Za-z][A-Za-z'-]*/g) || [];
  const corrections = [];
  const seen = new Set();

  rawWords.forEach((raw) => {
    const hit = closestLexeme(raw, lexicon);
    if (!hit || hit.distance === 0) return;
    const key = `${normalize(hit.typed)}→${normalize(hit.correct)}`;
    if (seen.has(key)) return;
    seen.add(key);
    corrections.push({ typed: hit.typed, correct: hit.correct });
  });

  return corrections;
}

function applyCorrections(message, corrections) {
  let out = String(message || "");
  corrections.forEach(({ typed, correct }) => {
    const re = new RegExp(`\\b${typed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "ig");
    out = out.replace(re, correct);
  });
  return out;
}

function findTopicExact(message) {
  const m = normalize(message);
  if (!m) return null;

  for (const topic of topics) {
    for (const alias of topic.aliases || []) {
      if (m.includes(normalize(alias))) return topic;
    }
    if (m.includes(normalize(topic.title || ""))) return topic;
    if (m.includes(normalize(topic.id.replace(/-/g, " ")))) return topic;
  }

  const words = m.split(" ").filter((w) => w.length > 3 && !STOP.has(w));
  if (!words.length) return null;

  let best = null;
  let bestScore = 0;
  for (const topic of topics) {
    const hay = normalize(
      [topic.title || "", topic.id.replace(/-/g, " "), ...(topic.aliases || [])].join(" ")
    );
    const hits = words.filter((w) => hay.includes(w)).length;
    if (hits > bestScore) {
      bestScore = hits;
      best = topic;
    }
  }
  return bestScore > 0 ? best : null;
}

function findTopicFuzzy(message) {
  const m = normalize(message);
  const words = m.split(" ").filter((w) => w.length > 3 && !STOP.has(w));
  if (!words.length) return null;

  let best = null;
  let bestScore = 0;
  let bestFixes = [];

  for (const topic of topics) {
    const terms = topicTerms(topic).filter((t) => t.length > 3);
    let score = 0;
    const localFixes = [];
    words.forEach((w) => {
      if (terms.some((t) => t === w || t.includes(w) || w.includes(t))) {
        score += 3;
        return;
      }
      let closest = null;
      let closestD = Infinity;
      terms.forEach((t) => {
        if (Math.abs(t.length - w.length) > maxEditsFor(w)) return;
        const d = editDistance(w, t);
        if (d > 0 && d <= maxEditsFor(w) && d < closestD) {
          closestD = d;
          closest = t;
        }
      });
      if (closest) {
        score += Math.max(1, 3 - closestD);
        localFixes.push({ typed: w, correct: closest });
      }
    });

    const title = normalize(topic.title || topic.id.replace(/-/g, " "));
    words.forEach((w) => {
      const d = editDistance(w, title);
      if (d > 0 && d <= maxEditsFor(title) && title.length >= 5) {
        score += 4;
        localFixes.push({ typed: w, correct: topic.title || title });
      }
    });

    if (score > bestScore) {
      bestScore = score;
      best = topic;
      bestFixes = localFixes;
    }
  }

  if (bestScore < 2) return null;
  return { topic: best, corrections: bestFixes };
}

/** Resolve a Learn question: fuzzy topic + spelling corrections. */
function resolveLearnQuery(message, focusTopicId = null) {
  const focused = focusTopicId ? findTopicById(focusTopicId) : null;
  let corrections = spellcheckMessage(message, focused);
  const corrected = applyCorrections(message, corrections);

  let topic = findTopicExact(corrected) || findTopicExact(message) || null;

  if (!topic) {
    const fuzzy = findTopicFuzzy(corrected) || findTopicFuzzy(message);
    if (fuzzy) {
      topic = fuzzy.topic;
      fuzzy.corrections.forEach((c) => {
        const key = `${normalize(c.typed)}→${normalize(c.correct)}`;
        if (!corrections.some((x) => `${normalize(x.typed)}→${normalize(x.correct)}` === key)) {
          corrections.push(c);
        }
      });
    }
  }

  if (!topic && focused) topic = focused;

  if (topic) {
    spellcheckMessage(message, topic).forEach((c) => {
      const key = `${normalize(c.typed)}→${normalize(c.correct)}`;
      if (!corrections.some((x) => `${normalize(x.typed)}→${normalize(x.correct)}` === key)) {
        corrections.push(c);
      }
    });
  }

  corrections = corrections.filter((c) => normalize(c.typed) !== normalize(c.correct));

  return { topic, corrections, correctedText: corrected };
}

function findTopic(message) {
  return resolveLearnQuery(message).topic || findTopicExact(message);
}

function findTopicById(id) {
  return topics.find((t) => t.id === id) || null;
}

function isRecap(message) {
  const m = normalize(message);
  return m.includes("how am i doing") || m === "progress" || m === "recap";
}

function isHelp(message) {
  const m = normalize(message);
  return ["hi", "hello", "hey", "start", "help", "menu"].includes(m);
}

function gradeAnswer(question, answer) {
  const a = normalize(answer);
  if (!a) return false;
  return (question.accept || [question.correctAnswer]).some((accepted) => {
    const n = normalize(accepted);
    return a === n || a.includes(n) || n.includes(a);
  });
}

function shuffle(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function stats() {
  return {
    topics: topics.length,
    questions: topics.reduce((n, t) => n + (t.questions?.length || 0), 0),
    subjects: [...new Set(topics.map((t) => t.subject))],
  };
}

module.exports = {
  topics,
  findTopic,
  findTopicById,
  findTopicExact,
  resolveLearnQuery,
  spellcheckMessage,
  topicLabel,
  isRecap,
  isHelp,
  gradeAnswer,
  normalize,
  shuffle,
  stats,
};
