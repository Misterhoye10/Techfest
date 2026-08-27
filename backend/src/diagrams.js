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
  acid: {
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
  "acids-and-bases": {
    src: "/assets/diagrams/acids-bases.svg",
    caption: "Acids, bases, and the pH scale",
    alt: "Simple pH scale from acid to base",
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
};

function getDiagram(topicId, subject) {
  const id = String(topicId || "")
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (!id) return null;

  if (BY_KEY[id]) return { ...BY_KEY[id], topicId: id };

  const hit = Object.keys(BY_KEY).find((key) => id.includes(key) || key.includes(id));
  if (hit) return { ...BY_KEY[hit], topicId: id };

  const sub = String(subject || "").toLowerCase();
  if (sub.includes("biology")) {
    return {
      src: "/assets/diagrams/cell.svg",
      caption: "Animal cell — key parts",
      alt: "Simple animal cell diagram",
      topicId: id,
    };
  }
  return null;
}

module.exports = { getDiagram, BY_KEY };
