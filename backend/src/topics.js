/**
 * Preset curriculum — primary path (no paid API required).
 * Keep in sync with docs/reca/demo-topics.md
 */
const topics = [
  {
    id: "photosynthesis",
    subject: "Biology",
    aliases: ["photosynthesis", "photosyntesis"],
    explanation:
      "Photosynthesis is how plants make their own food using sunlight, water, and carbon dioxide. Chlorophyll in the chloroplast captures sunlight, powering a reaction that turns CO₂ and water into glucose and oxygen.",
    questions: [
      {
        id: "q1",
        text: "Which part of the plant cell captures sunlight for photosynthesis?",
        accept: ["chloroplast", "chloroplasts", "chlorophyll in chloroplast"],
        correction: "Mitochondria are for respiration. The answer is chloroplast.",
        correctAnswer: "chloroplast",
      },
      {
        id: "q2",
        text: "What are the two main products of photosynthesis?",
        accept: ["glucose and oxygen", "oxygen and glucose", "glucose & oxygen"],
        correction: "The two main products are glucose and oxygen.",
        correctAnswer: "glucose and oxygen",
      },
    ],
  },
  {
    id: "osmosis",
    subject: "Biology",
    aliases: ["osmosis"],
    explanation:
      "Osmosis is the movement of water across a selectively permeable membrane. Water moves from a dilute solution (more water) to a concentrated solution (less water) until balance is reached.",
    questions: [
      {
        id: "q1",
        text: "In osmosis, what substance moves across the membrane?",
        accept: ["water"],
        correction: "It's water that moves — not the dissolved salt or sugar.",
        correctAnswer: "water",
      },
      {
        id: "q2",
        text: "Does water move from a dilute solution to a concentrated solution, or the other way?",
        accept: [
          "dilute to concentrated",
          "from dilute to concentrated",
          "high water potential to low",
          "dilute → concentrated",
        ],
        correction: "Water moves from dilute to concentrated solution.",
        correctAnswer: "from dilute to concentrated",
      },
    ],
  },
  {
    id: "aerobic-respiration",
    subject: "Biology",
    aliases: ["aerobic respiration", "respiration"],
    explanation:
      "Aerobic respiration is how cells release energy from glucose using oxygen. It mainly happens in the mitochondria and produces carbon dioxide and water as waste, plus energy (ATP).",
    questions: [
      {
        id: "q1",
        text: "Which organelle is the main site of aerobic respiration in cells?",
        accept: ["mitochondrion", "mitochondria"],
        correction: "Chloroplasts are for photosynthesis. Respiration is in the mitochondria.",
        correctAnswer: "mitochondria",
      },
      {
        id: "q2",
        text: "Name two waste products of aerobic respiration.",
        accept: [
          "carbon dioxide and water",
          "water and carbon dioxide",
          "co2 and water",
          "co₂ and water",
        ],
        correction: "The waste products are carbon dioxide and water.",
        correctAnswer: "carbon dioxide and water",
      },
    ],
  },
  {
    id: "acids-bases",
    subject: "Chemistry",
    aliases: ["acids and bases", "acids", "bases", "acid and base"],
    explanation:
      "Acids taste sour and turn blue litmus red. Bases taste bitter and turn red litmus blue. When an acid reacts with a base, they form a salt and water.",
    questions: [
      {
        id: "q1",
        text: "What colour does blue litmus paper turn in an acid?",
        accept: ["red"],
        correction: "Blue litmus turns red in an acid.",
        correctAnswer: "red",
      },
      {
        id: "q2",
        text: "What type of substance is formed when an acid reacts with a base?",
        accept: ["salt", "a salt", "salt and water", "salt & water"],
        correction: "An acid plus a base forms a salt (and water).",
        correctAnswer: "salt (and water)",
      },
    ],
  },
];

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s&→\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findTopic(message) {
  const m = normalize(message);
  if (!m.includes("explain") && !topics.some((t) => t.aliases.some((a) => m === normalize(a)))) {
    // still allow bare topic names
  }
  for (const topic of topics) {
    for (const alias of topic.aliases) {
      if (m.includes(normalize(alias))) return topic;
    }
  }
  return null;
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
  return question.accept.some((accepted) => {
    const n = normalize(accepted);
    return a === n || a.includes(n) || n.includes(a);
  });
}

module.exports = {
  topics,
  findTopic,
  isRecap,
  isHelp,
  gradeAnswer,
  normalize,
};
