/**
 * Curated labelled-diagram packs (WAEC/JAMB style).
 * Labels are authored - never invented by the LLM.
 */

const PACKS = [
  {
    id: "plant-leaf",
    subjects: ["Biology"],
    triggers: [
      "label a plant",
      "label the plant",
      "label a leaf",
      "label the leaf",
      "label leaf",
      "leaf diagram",
      "parts of a leaf",
      "draw and label a leaf",
      "labelled leaf",
      "labeled leaf",
      "plant diagram",
      "label plant",
    ],
    src: "/assets/diagrams/labelled/plant-leaf.svg",
    title: "Leaf - labelled parts",
    alt: "Numbered cross-section of a leaf for WAEC labelling",
    teach:
      "WAEC loves leaf diagrams. Learn the numbers: the cuticle is the thin waterproof skin on top; palisade cells do most photosynthesis; spongy mesophyll has air spaces; stomata (with guard cells) let gases in and out on the underside. Say the name and the job. That scores.",
    labels: [
      { n: 1, name: "Cuticle", accept: ["cuticle", "waxy cuticle"] },
      { n: 2, name: "Upper epidermis", accept: ["upper epidermis", "epidermis"] },
      { n: 3, name: "Palisade mesophyll", accept: ["palisade", "palisade mesophyll", "palisade layer"] },
      { n: 4, name: "Spongy mesophyll", accept: ["spongy mesophyll", "spongy layer"] },
      { n: 5, name: "Vein (xylem & phloem)", accept: ["vein", "vascular bundle", "xylem", "phloem"] },
      { n: 6, name: "Stoma / guard cells", accept: ["stoma", "stomata", "guard cell", "guard cells"] },
    ],
  },
  {
    id: "human-body",
    subjects: ["Biology"],
    triggers: [
      "label the human body",
      "label human body",
      "label the body",
      "human body diagram",
      "parts of the human body",
      "draw and label the human body",
      "label organs",
      "body organs diagram",
      "labelled human body",
      "labeled human body",
    ],
    src: "/assets/diagrams/labelled/human-body.svg",
    title: "Human body - major organs",
    alt: "Numbered outline of major human organs for exam labelling",
    teach:
      "For body diagrams, name the organ and one job. Brain (control), heart (pump blood), lungs (gas exchange), liver (process nutrients / detox), stomach (digest food), kidneys (filter blood / make urine). Keep answers short and exact.",
    labels: [
      { n: 1, name: "Brain", accept: ["brain"] },
      { n: 2, name: "Lungs", accept: ["lung", "lungs"] },
      { n: 3, name: "Heart", accept: ["heart"] },
      { n: 4, name: "Liver", accept: ["liver"] },
      { n: 5, name: "Stomach", accept: ["stomach"] },
      { n: 6, name: "Kidneys", accept: ["kidney", "kidneys"] },
    ],
  },
  {
    id: "pie-chart",
    subjects: ["Mathematics", "Further Mathematics"],
    triggers: [
      "label a pie chart",
      "pie chart diagram",
      "parts of a pie chart",
      "draw a pie chart",
      "labelled pie chart",
      "labeled pie chart",
      "explain pie chart",
      "pie chart",
    ],
    src: "/assets/diagrams/labelled/pie-chart.svg",
    title: "Pie chart - labelled parts",
    alt: "Numbered pie chart showing sectors, radius, and centre",
    teach:
      "A pie chart shows parts of a whole as sectors of a circle. The full circle is 360 degrees. Sector angle = (category frequency / total) x 360. Read the key: centre, radius, sector, and the legend that names each slice.",
    labels: [
      { n: 1, name: "Centre (O)", accept: ["centre", "center", "o", "centre o"] },
      { n: 2, name: "Radius", accept: ["radius"] },
      { n: 3, name: "Sector A", accept: ["sector a", "sector", "slice a"] },
      { n: 4, name: "Sector B", accept: ["sector b", "slice b"] },
      { n: 5, name: "Legend / key", accept: ["legend", "key", "key legend"] },
    ],
  },
  {
    id: "right-triangle",
    subjects: ["Mathematics", "Further Mathematics"],
    triggers: [
      "label a triangle",
      "label right triangle",
      "right angled triangle",
      "right-angled triangle",
      "parts of a triangle",
      "hypotenuse diagram",
      "label hypotenuse",
      "pythagoras diagram",
      "labelled triangle",
      "labeled triangle",
    ],
    src: "/assets/diagrams/labelled/right-triangle.svg",
    title: "Right-angled triangle - labelled parts",
    alt: "Numbered right-angled triangle with hypotenuse and legs",
    teach:
      "In a right-angled triangle the right angle is 90 degrees. The side opposite the right angle is the hypotenuse (longest side). The other two sides are the legs (adjacent / opposite depending on the angle you pick). Pythagoras: a^2 + b^2 = c^2 where c is the hypotenuse.",
    labels: [
      { n: 1, name: "Right angle (90 degrees)", accept: ["right angle", "90", "90 degrees", "90°"] },
      { n: 2, name: "Hypotenuse", accept: ["hypotenuse", "c"] },
      { n: 3, name: "Leg a (adjacent/opposite)", accept: ["leg a", "side a", "a", "adjacent", "opposite"] },
      { n: 4, name: "Leg b", accept: ["leg b", "side b", "b"] },
    ],
  },
];

function normalizeQuery(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLabelIntent(text) {
  const q = normalizeQuery(text);
  if (!q) return false;
  return (
    /\b(label|labelled|labeled|diagram|draw and label|parts of)\b/.test(q) ||
    /\bpie chart\b/.test(q) ||
    /\b(human body|hypotenuse|stomata|palisade)\b/.test(q)
  );
}

function scorePack(pack, q) {
  let score = 0;
  const weak = new Set(["label", "labelled", "labeled", "diagram", "draw", "parts", "the", "and", "a", "an"]);
  for (const trigger of pack.triggers) {
    const t = normalizeQuery(trigger);
    if (!t) continue;
    if (q === t) score += 40;
    else if (q.includes(t)) score += 28;
    else if (t.includes(q) && q.length >= 10) score += 12;
    else {
      const words = t.split(" ").filter((w) => w.length > 2 && !weak.has(w));
      const hits = words.filter((w) => q.includes(w)).length;
      if (words.length && hits >= 1) {
        score += hits * 10;
      }
    }
  }
  return score;
}

/**
 * @returns {{ pack: object|null, wantedButMissing: boolean }}
 */
function resolveDiagramPack(text, subjectHint) {
  const q = normalizeQuery(text);
  if (!q) return { pack: null, wantedButMissing: false };

  const labelish = isLabelIntent(text);
  let best = null;
  let bestScore = 0;

  for (const pack of PACKS) {
    let s = scorePack(pack, q);
    if (subjectHint) {
      const sub = String(subjectHint).toLowerCase();
      if (pack.subjects.some((x) => x.toLowerCase() === sub || sub.includes(x.toLowerCase()))) {
        s += 6;
      }
    }
    if (s > bestScore) {
      bestScore = s;
      best = pack;
    }
  }

  if (best && bestScore >= 12) return { pack: best, wantedButMissing: false };
  if (labelish) return { pack: null, wantedButMissing: true };
  return { pack: null, wantedButMissing: false };
}

function findPackById(id) {
  const key = String(id || "").toLowerCase();
  return PACKS.find((p) => p.id === key) || null;
}

function questionsFromPack(pack, limit = 2) {
  const labels = [...(pack.labels || [])];
  for (let i = labels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [labels[i], labels[j]] = [labels[j], labels[i]];
  }
  return labels.slice(0, Math.min(limit, labels.length)).map((lab, i) => {
    const name = lab.name;
    const accept = Array.isArray(lab.accept) ? lab.accept.map(String) : [name];
    if (!accept.includes(name)) accept.unshift(name);
    return {
      id: `${pack.id}-q${i + 1}`,
      text: `On the diagram, what is label ${lab.n}?`,
      correctAnswer: name,
      accept,
      correction: `Label ${lab.n} is ${name}.`,
      options: buildOptions(pack, lab),
    };
  });
}

function buildOptions(pack, correctLab) {
  const names = (pack.labels || []).map((l) => l.name);
  const opts = [correctLab.name];
  for (const n of names) {
    if (opts.length >= 4) break;
    if (!opts.includes(n)) opts.push(n);
  }
  return opts;
}

function formatPackReply(pack) {
  const key = (pack.labels || [])
    .map((l) => `${l.n} - ${l.name}`)
    .join("\n");
  return `${pack.title}\n\n${pack.teach}\n\nKey:\n${key}`;
}

function packToTopic(pack) {
  return {
    id: pack.id,
    title: pack.title,
    subject: pack.subjects[0],
    explanation: pack.teach,
    questions: questionsFromPack(pack, Math.min(5, pack.labels.length)),
    aliases: pack.triggers.slice(0, 8).map((t) => normalizeQuery(t)),
    icon:
      pack.subjects[0] === "Biology"
        ? "leaf-01"
        : pack.id === "pie-chart"
          ? "analytics-01"
          : pack.id === "right-triangle"
            ? "quiz-03"
            : "book-01",
    isDiagramPack: true,
  };
}

function allPackTopics() {
  return PACKS.map(packToTopic);
}

function missingPackCopy() {
  return "I don't have a labelled diagram for that yet. Try: \"label a leaf\", \"label the human body\", \"pie chart\", or \"label a right-angled triangle\". I'm expanding the pack library subject by subject. I won't invent labels.";
}

module.exports = {
  PACKS,
  isLabelIntent,
  resolveDiagramPack,
  findPackById,
  questionsFromPack,
  formatPackReply,
  packToTopic,
  allPackTopics,
  missingPackCopy,
};
