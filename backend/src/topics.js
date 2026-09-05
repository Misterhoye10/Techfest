/**
 * Preset curriculum — loads the generated bank (50 topics/subject × 50 Q&As).
 * Regenerate: node scripts/generate-curriculum.js
 */
const bank = require("./data/curriculum-bank");

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

/** Drop toxic aliases like "what" that steal every “what is …?” ask. */
function sanitizeAliases(aliases) {
  return (aliases || []).filter((raw) => {
    const n = normalize(raw);
    if (!n || n.length < 3) return false;
    if (STOP.has(n)) return false;
    if (!n.includes(" ") && ["what", "which", "when", "where", "mean", "means"].includes(n)) {
      return false;
    }
    return true;
  });
}

const topics = bank.topics.map((t) => ({
  ...t,
  aliases: sanitizeAliases(t.aliases),
}));

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
    if (!n || STOP.has(n)) return;
    terms.add(n);
    n.split(" ").forEach((w) => {
      if (w.length > 2 && !STOP.has(w)) terms.add(w);
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
    (topic.questions || []).slice(0, 40).forEach((q) => {
      add(q.correctAnswer);
      (q.accept || []).forEach(add);
    });
  });
  ["Biology", "Chemistry", "Physics", "Mathematics", "Maths", "Math", "Further Mathematics", "English Language", "English", "Agriculture", "Agric", "Farming", "Yoruba", "Igbo", "Hausa", "Government", "Commerce", "Economics", "Accounting", "Accounts", "Marketing", "History", "Geography", "Fine Arts", "Creative Arts", "Food and Nutrition", "Nutrition", "Home Management", "French", "Islamic Religious Studies", "IRS", "Christian Religious Knowledge", "CRK", "CRS", "Computer Studies", "Computer Science", "Computing", "Science", "ICT", "Literature in English", "Literature", "Music"].forEach(add);
  [
    "computer science",
    "comp science",
    "info tech",
    "information technology",
    "photosynthesis",
    "respiration",
    "osmosis",
    "diffusion",
    "agriculture",
    "biology",
    "chemistry",
    "physics",
    "chloroplast",
    "chlorophyll",
    "mitochondria",
    "mitochondrion",
    "nucleus",
    "cytoplasm",
    "ribosome",
  ].forEach(add);
  globalLexicon = map;
  return globalLexicon;
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

  let best = null;
  let bestScore = 0;

  for (const topic of topics) {
    if (/·\s*set\s*\d+/i.test(topic.title || "")) continue;

    let score = 0;
    const title = normalize(topic.title || "");
    const idWords = normalize(topic.id.replace(/-/g, " "));
    const isIntro = /^what is\b/i.test(topic.title || "");

    if (title && m === title) score = Math.max(score, 100);
    if (title && m.includes(title) && title.length > 3) score = Math.max(score, 80 + Math.min(title.length, 20));
    if (idWords && m.includes(idWords) && idWords.length > 3) score = Math.max(score, 70);

    for (const alias of topic.aliases || []) {
      const a = normalize(alias);
      if (!a || a.length < 3 || STOP.has(a)) continue;
      if (m === a) score = Math.max(score, 90);
      else if (m.includes(a)) score = Math.max(score, 40 + Math.min(a.length, 30));
    }

    // Only boost intros when the student asked about that subject card itself
    if (isIntro && score > 0) {
      const subject = normalize(topic.subject || "");
      if (subject && (m === subject || m === title || m.endsWith(` ${subject}`) && /^(what|define|explain)/.test(m))) {
        score += 15;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  if (bestScore >= 40) return best;

  const words = m.split(" ").filter((w) => w.length > 3 && !STOP.has(w));
  if (!words.length) return null;

  best = null;
  bestScore = 0;
  for (const topic of topics) {
    if (/·\s*set\s*\d+/i.test(topic.title || "")) continue;
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

function extractAskObject(message) {
  const m = normalize(message);
  if (!m) return null;
  const patterns = [
    /^(?:what(?:\s+is|\s+are)|whats|define|explain|describe|meaning of)\s+(.+)$/,
    /^(?:tell me about|teach me)\s+(.+)$/,
  ];
  for (const re of patterns) {
    const hit = m.match(re);
    if (!hit) continue;
    let obj = hit[1].replace(/\?+$/, "").trim();
    obj = obj.replace(/\s+in\s+[a-z][a-z\s]*$/, "").trim();
    obj = obj.replace(/^(?:a|an|the)\s+/, "").trim();
    if (obj && !STOP.has(obj)) return obj;
  }
  return null;
}

function askIsAboutSubject(message, subject) {
  const m = normalize(message);
  const s = normalize(subject);
  if (!m || !s) return false;
  if (m === s || m === `about ${s}`) return true;
  const esc = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^(?:what(?:\\s+is|\\s+are)|whats|define|explain|describe|meaning of)\\s+${esc}\\s*$`
  ).test(m);
}

/** Match “what is chloroplast” to the topic that teaches that concept (answers/explanation). */
function findTopicByConcept(message) {
  const obj = extractAskObject(message);
  const terms = [];
  if (obj) {
    terms.push(obj);
    obj.split(" ").forEach((w) => {
      if (w.length > 3 && !STOP.has(w)) terms.push(w);
    });
  } else {
    normalize(message)
      .split(" ")
      .filter((w) => w.length > 3 && !STOP.has(w))
      .forEach((w) => terms.push(w));
  }
  if (!terms.length) return null;

  let best = null;
  let bestScore = 0;

  for (const topic of topics) {
    if (/·\s*set\s*\d+/i.test(topic.title || "")) continue;
    let score = 0;
    const title = normalize(topic.title || "");
    const isIntro = /^what is\b/i.test(topic.title || "");
    const expl = normalize(topic.explanation || "");

    for (const term of terms) {
      if (term.length < 4) continue;
      if (title === term) score += 100;
      else if (title.includes(term)) score += 45;
      for (const alias of topic.aliases || []) {
        const a = normalize(alias);
        if (a === term) score += 80;
        else if (a.includes(term) && term.length >= 5) score += 25;
      }
      if (expl.includes(term)) score += 12;
      for (const q of topic.questions || []) {
        if (normalize(q.correctAnswer) === term) score += 28;
        for (const acc of q.accept || []) {
          if (normalize(acc) === term) score += 22;
        }
        const qText = normalize(q.text || q.prompt || "");
        if (qText.includes(term) && term.length >= 5) score += 6;
      }
    }

    // Subject intros must not win concept asks like “what is chloroplast”
    if (isIntro) score = Math.floor(score * 0.15);

    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  return bestScore >= 12 ? best : null;
}

/** Short lead when the student named a concept that appears as an answer. */
function conceptExplanation(topic, message) {
  if (!topic) return "";
  const obj = extractAskObject(message);
  if (!obj || obj.length < 4) return topic.explanation || "";

  const term = normalize(obj);
  const display = obj.charAt(0).toUpperCase() + obj.slice(1);
  const hit = (topic.questions || []).find(
    (q) =>
      normalize(q.correctAnswer) === term ||
      (q.accept || []).some((a) => normalize(a) === term)
  );

  if (hit) {
    const prompt = String(hit.text || hit.prompt || "").replace(/\?+$/, "").trim();
    if (prompt) {
      let lead;
      if (/^which\b/i.test(prompt)) {
        const rest = prompt.replace(/^which\s+/i, "").trim();
        const restThat = rest.replace(/^(\S+)\s+/, "$1 that ");
        lead = `A ${display.toLowerCase()} is the ${restThat}.`;
      } else if (/^what\b/i.test(prompt)) {
        lead = `${display}: ${prompt.replace(/^what\s+/i, "").trim()}.`;
      } else {
        lead = `${display}: ${prompt}.`;
      }
      return `${lead}\n\n${topic.explanation || ""}`.trim();
    }
  }

  return topic.explanation || "";
}

function findSubjectMention(message) {
  const m = normalize(message);
  if (!m) return null;
  const catalog = [
    ["further mathematics", "Further Mathematics"],
    ["further maths", "Further Mathematics"],
    ["english language", "English Language"],
    ["literature in english", "Literature in English"],
    ["christian religious knowledge", "Christian Religious Knowledge"],
    ["islamic religious studies", "Islamic Religious Studies"],
    ["food and nutrition", "Food and Nutrition"],
    ["home management", "Home Management"],
    ["computer studies", "Computer Studies"],
    ["fine arts", "Fine Arts"],
    ["creative arts", "Creative Arts"],
    ["computer studies", "Computer Studies"],
    ["computer science", "Computer Studies"],
    ["comp science", "Computer Studies"],
    ["computing", "Computer Studies"],
    ["information technology", "Computer Studies"],
    ["agriculture", "Agriculture"],
    ["agric", "Agriculture"],
    ["farming", "Agriculture"],
    ["biology", "Biology"],
    ["chemistry", "Chemistry"],
    ["physics", "Physics"],
    ["mathematics", "Mathematics"],
    ["maths", "Mathematics"],
    ["yoruba", "Yoruba"],
    ["igbo", "Igbo"],
    ["hausa", "Hausa"],
    ["government", "Government"],
    ["commerce", "Commerce"],
    ["economics", "Economics"],
    ["accounting", "Accounting"],
    ["accounts", "Accounting"],
    ["marketing", "Marketing"],
    ["history", "History"],
    ["geography", "Geography"],
    ["french", "French"],
    ["literature", "Literature in English"],
    ["music", "Music"],
    ["english", "English Language"],
    ["crk", "Christian Religious Knowledge"],
    ["crs", "Christian Religious Knowledge"],
    ["irs", "Islamic Religious Studies"],
    ["ict", "Computer Studies"],
    ["computer", "Computer Studies"],
  ];
  for (const [alias, subject] of catalog) {
    if (m.includes(alias)) return subject;
  }
  return null;
}

function findSubjectIntroTopic(subject) {
  const list = topics.filter(
    (t) => t.subject === subject && !/·\s*set\s*\d+/i.test(t.title || "")
  );
  return (
    list.find((t) => /^what is\b/i.test(t.title || "")) ||
    list[0] ||
    null
  );
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

  // Concept asks (“what is chloroplast”) beat subject intros and fuzzy noise
  let topic =
    findTopicByConcept(corrected) ||
    findTopicByConcept(message) ||
    findTopicExact(corrected) ||
    findTopicExact(message) ||
    null;

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

  const mentioned = findSubjectMention(corrected) || findSubjectMention(message);
  // Only swap to subject intro when they asked about the subject itself
  if (mentioned && askIsAboutSubject(corrected, mentioned)) {
    const intro = findSubjectIntroTopic(mentioned);
    if (intro) topic = intro;
  }

  // Keep focus only if they didn't name a different concept/subject
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

function isSubjectIntroTopic(topic) {
  return /^what is\b/i.test(String(topic?.title || ""));
}

/** Turn Q&A bank into short teaching lines for teens (Learn, not Revise spoilers as quiz UI). */
function teachingPoints(topic, offset = 0, count = 3) {
  const qs = topic?.questions || [];
  const out = [];
  if (!qs.length) return out;
  for (let i = 0; i < qs.length && out.length < count; i++) {
    const q = qs[(offset + i) % qs.length];
    const ans = String(q.correctAnswer || (q.accept && q.accept[0]) || "").trim();
    if (!ans || ans.length < 3) continue;
    const line = ans.charAt(0).toUpperCase() + ans.slice(1);
    if (out.some((x) => x.toLowerCase() === line.toLowerCase())) continue;
    out.push(line.endsWith(".") ? line : `${line}.`);
  }
  return out;
}

/**
 * Teen-friendly Learn copy: definition + exam lock-ins.
 * Follow-up modes: further | example | exam
 */
function teachExplanation(topic, opts = {}) {
  const mode = opts.mode || "fresh";
  const depth = Number(opts.depth) || 0;
  const label = topicLabel(topic);
  const subject = String(topic.subject || "").trim();
  const base = String(topic.explanation || "").trim();
  const shortName = label.replace(/^what is\s+/i, "").trim() || subject || label;

  if (mode === "example") {
    const points = teachingPoints(topic, depth * 2, 2);
    const bits = [
      `Here’s a simple picture for ${shortName}.`,
      "",
      `Imagine you’re explaining it to a friend in SS2: ${points[0] || base.split(/\. /)[0] + "."}`,
      "",
    ];
    if (points[1]) {
      bits.push(`Another angle: ${points[1]}`);
      bits.push("");
    }
    bits.push(
      "If that clicks, ask “key exam points” or try 2 quick questions. If not, ask “explain further”."
    );
    return bits.join("\n");
  }

  if (mode === "exam") {
    const points = teachingPoints(topic, depth * 3, 5);
    const bits = [
      `For WAEC/JAMB on ${shortName}, lock these in:`,
      "",
      ...(points.length ? points.map((p) => `• ${p}`) : [base]),
      "",
      "Examiners love clear definitions and one clean example. Ask “give an example” if you want that next.",
    ];
    return bits.join("\n");
  }

  if (mode === "further") {
    const points = teachingPoints(topic, depth * 3 + 1, 4);
    const sentences = base
      .split(/(?<=\.)\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const bits = [`Let’s go slower on ${shortName}.`, ""];
    if (sentences.length) {
      sentences.forEach((s) => bits.push(s, ""));
    } else {
      bits.push(base, "");
    }
    if (points.length) {
      bits.push("Also remember:");
      points.forEach((p) => bits.push(`• ${p}`));
      bits.push("");
    }
    bits.push("Still unclear? Ask for an example. Ready to check yourself? Try 2 quick questions.");
    return bits.join("\n").replace(/\n{3,}/g, "\n\n");
  }

  // fresh — all preset topics get teen framing + exam lock-ins
  const points = teachingPoints(topic, 0, isSubjectIntroTopic(topic) ? 5 : 4);
  const bits = [];
  if (isSubjectIntroTopic(topic)) {
    bits.push(
      `${shortName} is one of your exam subjects. Here’s the idea in plain language for SS students.`
    );
    bits.push("");
  } else {
    bits.push(`Here’s ${shortName} in plain language.`);
    bits.push("");
  }
  bits.push(base);
  if (points.length) {
    bits.push("");
    bits.push("Lock these in:");
    points.forEach((p) => bits.push(`• ${p}`));
  }
  bits.push("");
  if (opts.channel === "wa") {
    bits.push("Ask me to explain further, give an example, or say quiz me for 2 quick questions.");
  } else {
    bits.push(
      "Tap Explain further or Give an example if any line is fuzzy. When you’re ready, try 2 quick questions."
    );
  }
  return bits.join("\n");
}

function followUpIntent(text) {
  const t = String(text || "").toLowerCase();
  if (/\b(example|for instance|real life|everyday)\b/.test(t)) return "example";
  if (/\b(exam|waec|jamb|key point|remember|revise point)\b/.test(t)) return "exam";
  if (
    /\b(further|simpler|simple|don'?t understand|confused|break( it)? down|more detail|go deeper|again|explain more)\b/.test(
      t
    )
  ) {
    return "further";
  }
  return "further";
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
  findTopicByConcept,
  resolveLearnQuery,
  spellcheckMessage,
  conceptExplanation,
  teachExplanation,
  followUpIntent,
  teachingPoints,
  isSubjectIntroTopic,
  extractAskObject,
  topicLabel,
  isRecap,
  isHelp,
  gradeAnswer,
  normalize,
  shuffle,
  stats,
};
