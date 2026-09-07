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
  {
    id: "animal-cell",
    subjects: ["Biology"],
    triggers: [
      "label an animal cell",
      "label animal cell",
      "animal cell diagram",
      "cell diagram",
      "parts of an animal cell",
      "draw and label an animal cell",
      "labelled animal cell",
      "labeled animal cell",
      "animal cell structure",
    ],
    src: "/assets/diagrams/labelled/animal-cell.svg",
    title: "Animal Cell - labelled parts",
    alt: "Numbered animal cell diagram for WAEC labelling",
    teach:
      "Animal cells have no cell wall or chloroplasts. Remember the key organelles: Cell membrane controls what enters/leaves; Cytoplasm is the site for chemical reactions; Nucleus holds genetic material and controls the cell; Mitochondria are the powerhouses where aerobic respiration releases ATP energy; Ribosomes synthesize proteins.",
    labels: [
      { n: 1, name: "Cell membrane", accept: ["cell membrane", "plasma membrane"] },
      { n: 2, name: "Cytoplasm", accept: ["cytoplasm"] },
      { n: 3, name: "Nucleus", accept: ["nucleus", "nuclear membrane"] },
      { n: 4, name: "Mitochondrion", accept: ["mitochondrion", "mitochondria"] },
      { n: 5, name: "Ribosome", accept: ["ribosome", "ribosomes"] },
    ],
  },
  {
    id: "human-eye",
    subjects: ["Biology", "Physics"],
    triggers: [
      "label the eye",
      "label human eye",
      "eye diagram",
      "parts of the eye",
      "draw and label the eye",
      "human eye diagram",
      "labelled eye",
      "labeled eye",
      "eye anatomy",
    ],
    src: "/assets/diagrams/labelled/human-eye.svg",
    title: "Human Eye - labelled parts",
    alt: "Numbered human eye diagram showing cornea, lens, retina",
    teach:
      "The eye focuses light to form real, inverted images on the retina. Cornea refracts light entering the eye; Iris controls the amount of light by adjusting the pupil size; Lens fine-tunes light focus; Retina converts light into electrical impulses; Optic nerve transmits sensory signals to the brain.",
    labels: [
      { n: 1, name: "Cornea", accept: ["cornea"] },
      { n: 2, name: "Iris", accept: ["iris"] },
      { n: 3, name: "Pupil", accept: ["pupil"] },
      { n: 4, name: "Lens", accept: ["lens", "crystalline lens"] },
      { n: 5, name: "Retina", accept: ["retina"] },
      { n: 6, name: "Optic nerve", accept: ["optic nerve", "nerve"] },
    ],
  },
  {
    id: "human-heart",
    subjects: ["Biology"],
    triggers: [
      "label the heart",
      "label human heart",
      "heart diagram",
      "parts of the heart",
      "draw and label the heart",
      "mammalian heart diagram",
      "labelled heart",
      "labeled heart",
      "heart anatomy",
      "cardiac cycle diagram",
    ],
    src: "/assets/diagrams/labelled/human-heart.svg",
    title: "Mammalian Heart - labelled parts",
    alt: "Numbered mammalian heart diagram showing chambers and major blood vessels",
    teach:
      "The mammalian heart is a double pump. Right side handles deoxygenated blood; Left side handles oxygenated blood. Vena Cava returns deoxygenated blood to the right atrium; Right ventricle pumps blood to lungs via the Pulmonary Artery; Left ventricle has the thickest muscular wall to pump oxygenated blood under high pressure through the Aorta to the entire body.",
    labels: [
      { n: 1, name: "Vena Cava", accept: ["vena cava", "superior vena cava"] },
      { n: 2, name: "Right Ventricle", accept: ["right ventricle", "ventricle"] },
      { n: 3, name: "Left Ventricle", accept: ["left ventricle", "thick ventricle"] },
      { n: 4, name: "Aorta", accept: ["aorta", "main artery"] },
      { n: 5, name: "Pulmonary Artery", accept: ["pulmonary artery"] },
    ],
  },
  {
    id: "flower-anatomy",
    subjects: ["Biology", "Agriculture"],
    triggers: [
      "label a flower",
      "label flower",
      "flower diagram",
      "parts of a flower",
      "draw and label a flower",
      "flower anatomy",
      "labelled flower",
      "labeled flower",
      "reproductive parts of a flower",
    ],
    src: "/assets/diagrams/labelled/flower-anatomy.svg",
    title: "Flower Anatomy - labelled parts",
    alt: "Numbered diagram of flower reproductive organs and petals",
    teach:
      "Flowers are the reproductive organs of angiosperms. Petals attract pollinating insects; Sepals protect the flower bud; Stamen (male) consists of Anther (makes pollen) and filament; Carpel/Pistil (female) consists of Stigma (sticky pollen receiver), style, and Ovary (contains ovules which become seeds after fertilization).",
    labels: [
      { n: 1, name: "Petal (Corolla)", accept: ["petal", "petals", "corolla"] },
      { n: 2, name: "Sepal (Calyx)", accept: ["sepal", "sepals", "calyx"] },
      { n: 3, name: "Anther", accept: ["anther", "stamen"] },
      { n: 4, name: "Stigma", accept: ["stigma", "pistil", "carpel"] },
      { n: 5, name: "Ovary", accept: ["ovary", "ovule"] },
    ],
  },
  {
    id: "electric-circuit",
    subjects: ["Physics"],
    triggers: [
      "label a circuit",
      "label electric circuit",
      "circuit diagram",
      "electric circuit diagram",
      "parts of a circuit",
      "draw a circuit",
      "labelled circuit",
      "labeled circuit",
      "simple circuit",
    ],
    src: "/assets/diagrams/labelled/electric-circuit.svg",
    title: "Electric Circuit - labelled components",
    alt: "Numbered simple series electric circuit with battery, switch, resistor, and ammeter",
    teach:
      "In an electric circuit, charge flows when there is a closed conducting loop. The Battery/Cell supplies electromotive force (EMF / voltage); The Switch opens or closes the path; The Resistor opposes current flow; The Ammeter must be connected in series to measure current in Amperes (A).",
    labels: [
      { n: 1, name: "Battery / Cell", accept: ["battery", "cell", "electric cell", "power source"] },
      { n: 2, name: "Switch / Key", accept: ["switch", "key"] },
      { n: 3, name: "Resistor", accept: ["resistor", "load"] },
      { n: 4, name: "Ammeter", accept: ["ammeter", "current meter"] },
    ],
  },
  {
    id: "light-refraction",
    subjects: ["Physics"],
    triggers: [
      "label refraction",
      "refraction diagram",
      "light refraction diagram",
      "parts of refraction",
      "draw refraction",
      "labelled refraction",
      "labeled refraction",
      "snell's law diagram",
      "refraction of light",
    ],
    src: "/assets/diagrams/labelled/light-refraction.svg",
    title: "Refraction of Light - labelled parts",
    alt: "Numbered light refraction diagram showing boundary, incident ray, normal, and refracted ray",
    teach:
      "Refraction is the bending of light as it passes from one optical medium into another of different density. As light travels from air into denser glass, it slows down and bends towards the normal line. Key definitions: Incident ray (incoming light), Normal (perpendicular line at point of incidence), Refracted ray (bent light ray), Angle of incidence 'i' (between incident ray and normal).",
    labels: [
      { n: 1, name: "Incident ray", accept: ["incident ray", "incident"] },
      { n: 2, name: "Normal line", accept: ["normal", "normal line"] },
      { n: 3, name: "Refracted ray", accept: ["refracted ray", "refracted"] },
      { n: 4, name: "Angle of incidence", accept: ["angle of incidence", "i", "incidence angle"] },
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
    /\b(pie chart|animal cell|human eye|human heart|flower|electric circuit|refraction)\b/.test(q) ||
    /\b(human body|hypotenuse|stomata|palisade|cornea|retina|ventricle|aorta|anther|stigma|resistor|ammeter)\b/.test(q)
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
  return "I don't have a labelled diagram for that yet. Try: \"label an animal cell\", \"label a leaf\", \"eye diagram\", \"heart diagram\", \"flower diagram\", \"circuit diagram\", \"refraction diagram\", \"pie chart\", or \"label a right-angled triangle\". I'm expanding the pack library subject by subject. I won't invent labels.";
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
