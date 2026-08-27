/**
 * Teaching diagrams for Learn / Revise — only when they clarify the concept.
 * Served from /assets/diagrams (local = reliable on demo Wi‑Fi).
 */

const BY_KEY = {
  photosynthesis: {
    src: "/assets/diagrams/photosynthesis.svg",
    caption: "Photosynthesis — light energy → glucose + oxygen",
    alt: "Simple diagram of photosynthesis in a leaf",
  },
  osmosis: {
    src: "/assets/diagrams/osmosis.svg",
    caption: "Osmosis — water moves across a membrane",
    alt: "Simple diagram of osmosis across a selectively permeable membrane",
  },
  "aerobic-respiration": {
    src: "/assets/diagrams/respiration.svg",
    caption: "Aerobic respiration — glucose + oxygen → energy",
    alt: "Simple diagram of aerobic respiration",
  },
  "anaerobic-respiration": {
    src: "/assets/diagrams/respiration.svg",
    caption: "Respiration — releasing energy from food",
    alt: "Simple diagram of respiration",
  },
  respiration: {
    src: "/assets/diagrams/respiration.svg",
    caption: "Respiration — releasing energy from food",
    alt: "Simple diagram of respiration",
  },
  "acids-bases": {
    src: "/assets/diagrams/acids-bases.svg",
    caption: "Acids, bases, and the pH scale",
    alt: "Simple pH scale from acid to base",
  },
  "acids-and-bases": {
    src: "/assets/diagrams/acids-bases.svg",
    caption: "Acids, bases, and the pH scale",
    alt: "Simple pH scale from acid to base",
  },
  acid: {
    src: "/assets/diagrams/acids-bases.svg",
    caption: "Acids, bases, and the pH scale",
    alt: "Simple pH scale from acid to base",
  },
  alkali: {
    src: "/assets/diagrams/acids-bases.svg",
    caption: "Acids, bases, and the pH scale",
    alt: "Simple pH scale from acid to base",
  },
  ph: {
    src: "/assets/diagrams/acids-bases.svg",
    caption: "Acids, bases, and the pH scale",
    alt: "Simple pH scale from acid to base",
  },
  enzyme: {
    src: "/assets/diagrams/enzyme.svg",
    caption: "Enzyme — lock and key with substrate",
    alt: "Simple lock-and-key enzyme diagram",
  },
  enzymes: {
    src: "/assets/diagrams/enzyme.svg",
    caption: "Enzyme — lock and key with substrate",
    alt: "Simple lock-and-key enzyme diagram",
  },
  diffusion: {
    src: "/assets/diagrams/diffusion.svg",
    caption: "Diffusion — particles spread from high to low concentration",
    alt: "Simple diagram of diffusion",
  },
  "cell-structure": {
    src: "/assets/diagrams/cell.svg",
    caption: "Animal cell — key parts",
    alt: "Simple animal cell diagram",
  },
  cell: {
    src: "/assets/diagrams/cell.svg",
    caption: "Animal cell — key parts",
    alt: "Simple animal cell diagram",
  },
  genetics: {
    src: "/assets/diagrams/cell.svg",
    caption: "Cell — where genetic material lives",
    alt: "Simple animal cell diagram",
  },
  chromosome: {
    src: "/assets/diagrams/cell.svg",
    caption: "Cell — where genetic material lives",
    alt: "Simple animal cell diagram",
  },
};

/** Subject fallbacks — only when a real diagram exists for that subject family */
const BY_SUBJECT = {
  biology: {
    src: "/assets/diagrams/cell.svg",
    caption: "Animal cell — key parts",
    alt: "Simple animal cell diagram",
  },
  chemistry: {
    src: "/assets/diagrams/acids-bases.svg",
    caption: "Acids, bases, and the pH scale",
    alt: "Simple pH scale from acid to base",
  },
};

function getDiagram(topicId, subject) {
  const id = String(topicId || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (!id) return null;

  if (BY_KEY[id]) return { ...BY_KEY[id], topicId: id };

  // Prefer longer keys first so "acids-and-bases" wins over "acid"
  const keys = Object.keys(BY_KEY).sort((a, b) => b.length - a.length);
  const hit = keys.find((key) => id.includes(key) || key.includes(id));
  if (hit) return { ...BY_KEY[hit], topicId: id };

  const sub = String(subject || "").toLowerCase();
  if (sub.includes("biology")) return { ...BY_SUBJECT.biology, topicId: id };
  if (sub.includes("chemistry")) return { ...BY_SUBJECT.chemistry, topicId: id };

  return null;
}

module.exports = { getDiagram, BY_KEY };
