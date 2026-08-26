/**
 * Preset curriculum — loads the 1000-question bank.
 * Regenerate: node scripts/generate-curriculum.js
 */
const bank = require("./data/curriculum-bank");

const topics = bank.topics;

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s&→\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function topicLabel(topic) {
  if (!topic) return "";
  return topic.title || topic.id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function findTopic(message) {
  const m = normalize(message);
  for (const topic of topics) {
    for (const alias of topic.aliases || []) {
      if (m.includes(normalize(alias))) return topic;
    }
    if (m.includes(normalize(topic.title || ""))) return topic;
    if (m.includes(normalize(topic.id.replace(/-/g, " ")))) return topic;
  }
  return null;
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
  topicLabel,
  isRecap,
  isHelp,
  gradeAnswer,
  normalize,
  shuffle,
  stats,
};
