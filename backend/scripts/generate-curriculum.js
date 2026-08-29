/**
 * Builds a WAEC/JAMB preset bank:
 * 50 topics per subject × 50 Q&As each (Learn + Revise).
 * Run: node scripts/generate-curriculum.js
 */
const fs = require("fs");
const path = require("path");
const { EXTRA_SEEDS } = require("./subject-seeds-extra");
const { EXTRA_SEEDS_ARTS_COMMERCE } = require("./subject-seeds-arts-commerce");

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniq(arr) {
  const seen = new Set();
  return arr.filter((x) => {
    const k = String(x).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** [prompt, answer, distractors[], extraAccept?] */
function q(prompt, answer, distractors, extraAccept = []) {
  return { prompt, answer, distractors, extraAccept };
}

const SEEDS = [
  // ——— BIOLOGY ———
  {
    subject: "Biology",
    title: "Photosynthesis",
    explanation:
      "Photosynthesis is how green plants make food. Chlorophyll in the chloroplast traps sunlight and uses it to turn carbon dioxide and water into glucose and oxygen.",
    items: [
      q("Which organelle captures sunlight for photosynthesis?", "chloroplast", ["mitochondria", "nucleus", "vacuole"]),
      q("What green pigment traps light energy?", "chlorophyll", ["haemoglobin", "melanin", "keratin"]),
      q("What are the two main products of photosynthesis?", "glucose and oxygen", ["water and carbon dioxide", "nitrogen and oxygen", "starch and nitrogen"], ["oxygen and glucose", "glucose & oxygen"]),
      q("What gas do plants take in for photosynthesis?", "carbon dioxide", ["oxygen", "nitrogen", "hydrogen"], ["co2", "CO₂"]),
      q("What gas do plants release during photosynthesis?", "oxygen", ["carbon dioxide", "nitrogen", "methane"]),
      q("Where in the leaf does most photosynthesis happen?", "palisade mesophyll", ["xylem", "phloem", "epidermis"]),
      q("What is the energy source for photosynthesis?", "sunlight", ["soil nutrients", "moonlight", "wind"]),
      q("Which molecule stores the food made in photosynthesis?", "glucose", ["protein", "urea", "cellulose alone"]),
      q("What is the word equation product besides glucose?", "oxygen", ["nitrogen", "ozone", "argon"]),
      q("Photosynthesis mainly occurs in which plant organs?", "leaves", ["roots only", "flowers only", "seeds only"]),
    ],
  },
  {
    subject: "Biology",
    title: "Osmosis",
    explanation:
      "Osmosis is the movement of water across a selectively permeable membrane from a dilute solution (high water potential) to a concentrated solution (low water potential).",
    items: [
      q("In osmosis, what substance moves across the membrane?", "water", ["salt", "sugar", "protein"]),
      q("Water in osmosis moves from dilute to concentrated solution — true or false?", "true", ["false", "only at night", "never"]),
      q("A membrane that lets some substances through is called?", "selectively permeable", ["fully permeable", "impermeable", "magnetic"]),
      q("Plant cells in pure water become?", "turgid", ["plasmolysed", "dead immediately", "frozen"]),
      q("Plant cells in strong salt solution may become?", "plasmolysed", ["turgid", "photosynthetic", "woody"]),
      q("Osmosis does not require?", "energy (ATP)", ["a membrane", "water", "a concentration difference"], ["atp", "energy"]),
      q("High water potential means the solution is more?", "dilute", ["concentrated", "acidic", "oily"]),
      q("Animal cells in pure water may?", "burst", ["become turgid safely", "photosynthesise", "form starch"]),
      q("Osmosis is a type of?", "diffusion of water", ["active transport of salt", "photosynthesis", "respiration"]),
      q("Root hairs absorb water mainly by?", "osmosis", ["transpiration pull only", "phototropism", "digestion"]),
    ],
  },
  {
    subject: "Biology",
    title: "Aerobic respiration",
    explanation:
      "Aerobic respiration releases energy from glucose using oxygen. It mainly happens in the mitochondria and produces carbon dioxide, water, and ATP.",
    items: [
      q("Main site of aerobic respiration in cells?", "mitochondria", ["chloroplast", "ribosome", "cell wall"], ["mitochondrion"]),
      q("Two waste products of aerobic respiration?", "carbon dioxide and water", ["glucose and oxygen", "nitrogen and ammonia", "oxygen and starch"], ["water and carbon dioxide", "co2 and water"]),
      q("What gas is needed for aerobic respiration?", "oxygen", ["nitrogen", "carbon dioxide", "ozone"]),
      q("What is the energy currency molecule?", "ATP", ["DNA", "RNA", "NADH only"]),
      q("Aerobic means with?", "oxygen", ["light", "nitrogen", "soil"]),
      q("Which stores more energy per glucose: aerobic or anaerobic?", "aerobic", ["anaerobic", "neither", "only fermentation"]),
      q("Respiration occurs in?", "all living cells", ["only leaves", "only roots", "only blood"]),
      q("Word equation starts with glucose and?", "oxygen", ["nitrogen", "chlorophyll", "starch"]),
      q("Is respiration the same as breathing?", "no", ["yes", "only in plants", "only at night"]),
      q("Where is most ATP made in aerobic respiration?", "mitochondria", ["nucleus", "cytoplasm only", "vacuole"]),
    ],
  },
  {
    subject: "Biology",
    title: "Anaerobic respiration",
    explanation:
      "Anaerobic respiration releases energy from glucose without oxygen. In humans it forms lactic acid; in yeast it forms ethanol and carbon dioxide (fermentation).",
    items: [
      q("Anaerobic respiration happens without?", "oxygen", ["glucose", "water", "enzymes"]),
      q("In human muscles, anaerobic respiration produces?", "lactic acid", ["ethanol", "oxygen", "starch"]),
      q("In yeast, fermentation produces ethanol and?", "carbon dioxide", ["oxygen", "lactic acid", "nitrogen"]),
      q("Does anaerobic respiration release less energy than aerobic?", "yes", ["no", "the same", "infinite"]),
      q("Bread rises because yeast produces?", "carbon dioxide", ["oxygen", "lactic acid", "chlorophyll"]),
      q("Oxygen debt is repaid after?", "exercise", ["sleep only", "eating salt", "drinking oil"]),
      q("Brewing beer uses?", "yeast fermentation", ["photosynthesis", "osmosis only", "mitosis"]),
      q("Lactic acid build-up can cause?", "muscle fatigue", ["better eyesight", "taller height", "greener leaves"]),
      q("Anaerobic in plants/yeast is also called?", "fermentation", ["transpiration", "pollination", "germination"]),
      q("Which needs mitochondria more: aerobic or anaerobic?", "aerobic", ["anaerobic", "neither", "only viruses"]),
    ],
  },
  {
    subject: "Biology",
    title: "Cell structure",
    explanation:
      "Cells are the basic units of life. Animal and plant cells share a nucleus, cytoplasm, and cell membrane. Plant cells also have a cell wall, chloroplasts, and a large vacuole.",
    items: [
      q("Control centre of the cell that contains DNA?", "nucleus", ["mitochondria", "ribosome", "vacuole"]),
      q("Site of protein synthesis?", "ribosome", ["chloroplast", "lysosome", "cilia"]),
      q("Outer boundary of an animal cell?", "cell membrane", ["cell wall", "capsule", "cuticle only"]),
      q("Rigid outer layer of a plant cell?", "cell wall", ["cell membrane", "nuclear membrane", "cytoplasm"]),
      q("Jelly-like substance where reactions occur?", "cytoplasm", ["nucleus only", "cell wall", "air"]),
      q("Stores cell sap in plant cells?", "vacuole", ["ribosome", "centriole", "flagellum"]),
      q("Which is found in plant cells but not animal cells?", "chloroplast", ["nucleus", "mitochondria", "membrane"]),
      q("Powerhouse of the cell?", "mitochondria", ["golgi", "nucleus", "vacuole"], ["mitochondrion"]),
      q("Who observed cork cells and named them cells?", "Robert Hooke", ["Darwin", "Newton", "Mendel"]),
      q("Smallest unit of life is the?", "cell", ["atom only", "tissue only", "organ only"]),
    ],
  },
  {
    subject: "Biology",
    title: "Diffusion",
    explanation:
      "Diffusion is the net movement of particles from a region of higher concentration to a region of lower concentration, down a concentration gradient. It does not need energy from the cell.",
    items: [
      q("Diffusion moves particles from high to low?", "concentration", ["temperature only", "mass only", "colour"]),
      q("Does simple diffusion require ATP?", "no", ["yes", "only at night", "only in plants"]),
      q("Smell of perfume spreading in a room is?", "diffusion", ["osmosis", "active transport", "translocation"]),
      q("Oxygen entering blood in lungs is mainly by?", "diffusion", ["osmosis", "phagocytosis", "transpiration"]),
      q("Faster diffusion when temperature is?", "higher", ["lower", "zero", "unchanged always"]),
      q("Larger surface area makes diffusion?", "faster", ["slower", "impossible", "stop"]),
      q("Steeper concentration gradient makes diffusion?", "faster", ["slower", "reverse always", "zero"]),
      q("Diffusion can occur in?", "gases and solutions", ["only solids", "only vacuums", "only metals"]),
      q("CO₂ leaving cells into blood is by?", "diffusion", ["osmosis of water", "mitosis", "pollination"]),
      q("Is diffusion an active or passive process?", "passive", ["active", "magnetic", "nuclear"]),
    ],
  },
  {
    subject: "Biology",
    title: "Enzymes",
    explanation:
      "Enzymes are biological catalysts — usually proteins — that speed up chemical reactions in living things without being used up. Each enzyme works best at an optimum temperature and pH.",
    items: [
      q("Enzymes are mainly made of?", "protein", ["fat only", "starch only", "DNA only"]),
      q("Enzymes speed up reactions as?", "catalysts", ["substrates", "hormones only", "vitamins only"]),
      q("The substance an enzyme acts on is the?", "substrate", ["product only", "inhibitor", "cofactor only"]),
      q("Lock and key refers to enzyme and?", "substrate", ["water", "oxygen", "cell wall"]),
      q("Too much heat can do what to an enzyme?", "denature it", ["multiply it", "turn it to fat", "make DNA"]),
      q("Amylase digests?", "starch", ["protein", "fat", "vitamins"]),
      q("Protease digests?", "protein", ["starch", "oil only", "cellulose only"]),
      q("Lipase digests?", "fats/lipids", ["starch", "DNA", "water"], ["fats", "lipids", "fat"]),
      q("Enzymes are used up in the reaction — true or false?", "false", ["true", "sometimes always", "only in plants"]),
      q("Optimum means the?", "best condition", ["worst condition", "average only", "random point"]),
    ],
  },
  {
    subject: "Biology",
    title: "Digestive system",
    explanation:
      "Digestion breaks food into small soluble molecules the body can absorb. It involves mechanical chewing and chemical action by enzymes in the mouth, stomach, and small intestine.",
    items: [
      q("Where does digestion begin?", "mouth", ["stomach only", "liver", "large intestine"]),
      q("Which acid is in the stomach?", "hydrochloric acid", ["sulphuric acid", "ethanoic only", "citric only"], ["hcl"]),
      q("Bile is produced by the?", "liver", ["pancreas", "kidney", "lung"]),
      q("Bile is stored in the?", "gall bladder", ["stomach", "spleen", "appendix"]),
      q("Most absorption of digested food occurs in the?", "small intestine", ["large intestine", "mouth", "oesophagus"]),
      q("The tube from mouth to stomach is the?", "oesophagus", ["trachea", "ureter", "urethra"], ["esophagus"]),
      q("Villi increase?", "surface area for absorption", ["blood pressure only", "bone length", "hair growth"]),
      q("Undigested food is egested through the?", "anus", ["urethra", "nose", "ear"]),
      q("Pancreatic juice contains?", "digestive enzymes", ["only hydrochloric acid", "only bile salts", "only water"]),
      q("Peristalsis is?", "wave-like muscle movement of food", ["blood clotting", "breathing in", "blinking"]),
    ],
  },
  {
    subject: "Biology",
    title: "Blood and circulation",
    explanation:
      "Blood carries oxygen, nutrients, hormones, and waste. The heart pumps blood through arteries, capillaries, and veins in a double circulatory system in humans.",
    items: [
      q("Which cells carry oxygen?", "red blood cells", ["white blood cells", "platelets", "neurons"], ["erythrocytes", "rbc"]),
      q("Which cells fight infection?", "white blood cells", ["red blood cells", "platelets", "osteocytes"], ["wbc", "leucocytes"]),
      q("What helps blood clot?", "platelets", ["plasma only", "bile", "saliva"]),
      q("Liquid part of blood is?", "plasma", ["lymph only", "serum only always", "cytoplasm"]),
      q("Vessels carrying blood away from the heart?", "arteries", ["veins", "lymph ducts", "ureters"]),
      q("Vessels carrying blood to the heart?", "veins", ["arteries", "alveoli", "villi"]),
      q("Tiny vessels for exchange are?", "capillaries", ["aorta only", "vena cava only", "trachea"]),
      q("Oxygenated blood leaves the heart via the?", "aorta", ["pulmonary vein only", "vena cava", "hepatic portal"]),
      q("How many chambers in a human heart?", "four", ["two", "three", "six"], ["4"]),
      q("Haemoglobin is found in?", "red blood cells", ["platelets", "bone marrow only", "skin oil"]),
    ],
  },
  {
    subject: "Biology",
    title: "Excretion",
    explanation:
      "Excretion removes metabolic waste from the body. The kidneys filter blood to form urine; the lungs remove carbon dioxide; the skin removes some salts and water in sweat.",
    items: [
      q("Main excretory organs for urea?", "kidneys", ["lungs", "stomach", "spleen"]),
      q("Which waste do lungs mainly remove?", "carbon dioxide", ["urea", "bile", "cellulose"]),
      q("Urine is stored in the?", "bladder", ["kidney pelvis only", "liver", "gall bladder"]),
      q("Tube from kidney to bladder?", "ureter", ["urethra", "ureteral nerve", "trachea"]),
      q("Tube that releases urine from the body?", "urethra", ["ureter", "vagina only", "anus"]),
      q("Functional unit of the kidney?", "nephron", ["neuron", "alveolus", "villus"]),
      q("Urea is made in the?", "liver", ["kidney", "heart", "pancreas"]),
      q("Sweat helps remove?", "salts and water", ["glucose only", "oxygen only", "DNA"]),
      q("Dialysis is used when?", "kidneys fail", ["bones break", "eyes itch", "hair falls"]),
      q("Is faeces an excretory product of metabolism?", "no (egestion)", ["yes always", "only urea", "only CO2"], ["no", "egestion"]),
    ],
  },
];

// Expand with more topic packs to reach 1000 questions
const MORE = [
  ["Biology", "Ecology", "Ecology studies how living things interact with each other and their environment, including food chains, habitats, and energy flow.", [
    ["A producer in a food chain is usually a?", "green plant", ["lion", "fungus only", "virus"]],
    ["An animal that eats only plants is a?", "herbivore", ["carnivore", "omnivore only", "parasite"]],
    ["An animal that eats other animals is a?", "carnivore", ["herbivore", "producer", "decomposer only"]],
    ["Decomposers mainly include?", "bacteria and fungi", ["green plants", "birds only", "fish only"]],
    ["Energy in a food chain comes originally from?", "the sun", ["soil", "water only", "wind"]],
    ["A habitat is?", "where an organism lives", ["what it eats only", "its colour", "its age"]],
    ["A population is members of one species in an?", "area", ["ocean only", "book", "lab only"]],
    ["Biotic factors are?", "living factors", ["non-living only", "chemicals only", "rocks only"]],
    ["Abiotic factors are?", "non-living factors", ["animals only", "plants only", "fungi only"]],
    ["Pyramid of numbers shows?", "number of organisms at each level", ["only mass of water", "only temperature", "only pH"]],
  ]],
  ["Biology", "Genetics basics", "Genetics is the study of inheritance. Genes on chromosomes carry instructions; DNA is the genetic material. Dominant alleles mask recessive ones in simple Mendelian traits.", [
    ["Genetic material in cells is?", "DNA", ["ATP", "glucose", "starch"]],
    ["A gene is a unit of?", "inheritance", ["digestion", "excretion", "transpiration"]],
    ["Chromosomes are found in the?", "nucleus", ["vacuole", "cell wall", "cytoplasm oil"]],
    ["Who is called the father of genetics?", "Mendel", ["Darwin only", "Hooke", "Pasteur"]],
    ["Alleles are?", "different forms of a gene", ["types of blood only", "bones", "enzymes only"]],
    ["TT for tall is?", "homozygous", ["heterozygous", "recessive only", "mutated always"]],
    ["Tt is?", "heterozygous", ["homozygous dominant only", "blood type", "a tissue"]],
    ["Phenotype is the?", "observable trait", ["DNA sequence only", "chromosome count only", "cell size only"]],
    ["Genotype is the?", "genetic make-up", ["appearance only", "diet", "habitat"]],
    ["Sex chromosomes in human females?", "XX", ["XY", "YY", "XO only"]],
  ]],
  ["Biology", "Reproduction in humans", "Human sexual reproduction involves sperm and egg. Fertilisation usually occurs in the oviduct; the embryo develops in the uterus.", [
    ["Male gamete is the?", "sperm", ["egg", "zygote", "foetus"]],
    ["Female gamete is the?", "egg/ovum", ["sperm", "zygote", "embryo"], ["egg", "ovum", "ova"]],
    ["Fusion of gametes is?", "fertilisation", ["menstruation", "ovulation only", "implantation only"], ["fertilization"]],
    ["Fertilisation usually occurs in the?", "oviduct/fallopian tube", ["uterus lining only", "vagina only", "ovary only"], ["oviduct", "fallopian tube"]],
    ["Implantation occurs in the?", "uterus", ["ovary", "stomach", "bladder"]],
    ["Testes produce?", "sperm", ["eggs", "urine", "bile"]],
    ["Ovaries produce?", "eggs", ["sperm", "urea", "insulin only"]],
    ["Zygote is a?", "fertilised egg", ["unfertilised egg", "sperm only", "blood cell"]],
    ["Pregnancy lasts about how many weeks?", "40", ["10", "20", "60"], ["forty", "9 months"]],
    ["Puberty is when?", "reproductive organs mature", ["teeth fall", "height stops always", "cells stop dividing"]],
  ]],
  ["Biology", "Nervous system", "The nervous system coordinates the body using electrical impulses. The brain and spinal cord form the CNS; nerves form the peripheral system. Reflexes are fast automatic responses.", [
    ["CNS stands for?", "central nervous system", ["cardiac nerve set", "cell nutrient supply", "common nerve strand"]],
    ["Main organ of the CNS?", "brain", ["liver", "kidney", "skin"]],
    ["A nerve cell is a?", "neuron", ["nephron", "alveolus", "villus"]],
    ["Gap between neurons is a?", "synapse", ["vacuole", "matrix", "lumen only"]],
    ["A reflex action is?", "automatic and fast", ["slow and planned", "only digestion", "only growth"]],
    ["Sensory neurons carry impulses to the?", "CNS", ["muscles only", "glands only", "skin oil"]],
    ["Motor neurons carry impulses to?", "effectors (muscles/glands)", ["the brain only", "the eye lens only", "bones only"], ["effectors", "muscles"]],
    ["The spinal cord is protected by?", "vertebral column", ["ribs only", "skull only", "pelvis only"]],
    ["Which sense organ detects light?", "eye", ["ear", "nose", "tongue"]],
    ["Which sense organ detects sound?", "ear", ["eye", "skin only", "tongue"]],
  ]],
  ["Biology", "Hormones", "Hormones are chemical messengers made by endocrine glands and carried in the blood. They control growth, metabolism, and reproduction more slowly than nerves.", [
    ["Hormones travel mainly in the?", "blood", ["nerves only", "urine only", "air"]],
    ["Insulin is made in the?", "pancreas", ["liver", "thyroid", "adrenal only"]],
    ["Insulin lowers?", "blood glucose", ["blood oxygen", "bone density only", "body height"]],
    ["Adrenaline prepares the body for?", "fight or flight", ["sleep only", "digestion only", "growth only"]],
    ["Thyroxine needs which element?", "iodine", ["iron only", "calcium only", "sodium only"]],
    ["Growth hormone is from the?", "pituitary", ["kidney", "spleen", "lung"]],
    ["Oestrogen is mainly a?", "female sex hormone", ["male only hormone", "digestive enzyme", "vitamin"]],
    ["Testosterone is mainly a?", "male sex hormone", ["plant hormone", "blood cell", "bone mineral"]],
    ["Endocrine glands are?", "ductless", ["with ducts to gut only", "only in skin", "only in bone"]],
    ["Compared to nerves, hormones are usually?", "slower and longer lasting", ["faster always", "electrical only", "useless"]],
  ]],
  ["Chemistry", "Acids and bases", "Acids turn blue litmus red and often taste sour. Bases turn red litmus blue. An acid plus a base forms a salt and water (neutralisation).", [
    ["Blue litmus in acid turns?", "red", ["blue", "green", "yellow"]],
    ["Red litmus in base turns?", "blue", ["red", "black", "orange"]],
    ["Acid + base → salt + ?", "water", ["oxygen", "nitrogen", "ozone"]],
    ["pH of a strong acid is close to?", "1", ["7", "14", "10"], ["0-3", "low"]],
    ["pH 7 means?", "neutral", ["strongly acidic", "strongly basic", "oily"]],
    ["pH above 7 means?", "alkaline/basic", ["acidic", "neutral only", "metallic"], ["alkaline", "basic"]],
    ["Common laboratory acid?", "hydrochloric acid", ["sodium hydroxide", "ammonia solution", "limewater"], ["hcl"]],
    ["A common alkali is?", "sodium hydroxide", ["HCl", "H2SO4", "ethanoic acid only"], ["NaOH"]],
    ["Neutralisation is?", "acid reacting with base", ["burning only", "melting only", "freezing"]],
    ["Acids produce which ions in water?", "H+ / H3O+", ["OH-", "Na+ only", "Cl- only"], ["h+", "hydrogen ions"]],
  ]],
  ["Chemistry", "Atomic structure", "Atoms have a nucleus of protons and neutrons, with electrons in shells around it. Proton number defines the element; mass number is protons plus neutrons.", [
    ["Positive particles in the nucleus?", "protons", ["electrons", "neutrons only", "photons"]],
    ["Neutral particles in the nucleus?", "neutrons", ["protons", "electrons", "ions"]],
    ["Negative particles outside the nucleus?", "electrons", ["protons", "neutrons", "alphas"]],
    ["Atomic number equals number of?", "protons", ["neutrons only", "nuclei only", "molecules"]],
    ["Mass number equals protons + ?", "neutrons", ["electrons", "shells", "bonds"]],
    ["Isotopes have same protons but different?", "neutrons", ["electrons always only", "atomic number", "element name"]],
    ["Electron relative charge?", "-1", ["+1", "0", "+2"]],
    ["Proton relative charge?", "+1", ["-1", "0", "+2"]],
    ["Neutron relative charge?", "0", ["+1", "-1", "+2"]],
    ["Smallest particle of an element that keeps its identity?", "atom", ["molecule always", "mixture", "compound"]],
  ]],
  ["Chemistry", "Periodic table", "Elements are arranged by increasing atomic number. Groups are vertical columns; periods are horizontal rows. Group properties repeat periodically.", [
    ["Vertical columns are called?", "groups", ["periods", "blocks only", "series only"]],
    ["Horizontal rows are called?", "periods", ["groups", "families only", "shells"]],
    ["Group 1 elements are?", "alkali metals", ["noble gases", "halogens", "transition only"]],
    ["Group 7/17 elements are?", "halogens", ["alkali metals", "noble gases", "alkaline earth"]],
    ["Group 0/18 elements are?", "noble gases", ["halogens", "metals only", "acids"]],
    ["Noble gases are?", "unreactive", ["highly reactive metals", "acids", "bases"]],
    ["Metals are mostly on the?", "left", ["far right noble only", "top gases only", "centre of water"]],
    ["Non-metals are mostly on the?", "right", ["far left", "only period 1", "nucleus"]],
    ["Who published an early periodic table?", "Mendeleev", ["Dalton only", "Bohr only", "Rutherford only"]],
    ["Elements in the same group have similar?", "chemical properties", ["mass always identical", "colour always", "melting point identical"]],
  ]],
  ["Chemistry", "Chemical bonding", "Atoms bond to gain stable electron arrangements. Ionic bonds transfer electrons (metal + non-metal). Covalent bonds share electrons (non-metals).", [
    ["Ionic bonding involves?", "electron transfer", ["electron sharing only", "proton transfer", "neutron sharing"]],
    ["Covalent bonding involves?", "electron sharing", ["electron transfer only", "metal lattices only", "gravity"]],
    ["NaCl is held by?", "ionic bonds", ["covalent only", "metallic only", "hydrogen only"]],
    ["O2 molecules are held by?", "covalent bonds", ["ionic only", "metallic only", "ionic lattice"]],
    ["Metals have which bonding?", "metallic", ["ionic only", "covalent gas only", "van der Waals only"]],
    ["Ions are?", "charged atoms/groups", ["neutral atoms only", "molecules of water only", "neutrons"]],
    ["A cation is?", "positive ion", ["negative ion", "neutral atom", "electron"]],
    ["An anion is?", "negative ion", ["positive ion", "proton", "neutron"]],
    ["Shared pair of electrons forms a?", "covalent bond", ["ionic lattice only", "metallic sea only", "nucleus"]],
    ["Noble gas configuration is generally?", "stable", ["unstable always", "radioactive always", "acidic"]],
  ]],
  ["Chemistry", "States of matter", "Solids have fixed shape and volume; liquids have fixed volume but take container shape; gases fill their container. Changes of state are physical changes.", [
    ["Solid to liquid is?", "melting", ["freezing", "evaporation", "condensation"]],
    ["Liquid to gas is?", "evaporation/boiling", ["melting", "freezing", "sublimation of ice only"], ["evaporation", "boiling"]],
    ["Gas to liquid is?", "condensation", ["melting", "sublimation", "freezing"]],
    ["Liquid to solid is?", "freezing", ["melting", "boiling", "evaporation"]],
    ["Solid to gas directly is?", "sublimation", ["condensation", "melting", "dissolving"]],
    ["Particles in a solid are?", "closely packed vibrate", ["far apart free", "random fast only", "not moving at all"]],
    ["Which state is easily compressed?", "gas", ["solid", "liquid only", "glass only"]],
    ["Boiling occurs at a?", "fixed temperature for a pure liquid", ["any random T", "0K only", "only in vacuum"]],
    ["Dry ice turning to gas is?", "sublimation", ["melting", "freezing", "condensation"]],
    ["A physical change?", "does not form a new substance", ["always forms new substance", "is nuclear", "is impossible"]],
  ]],
  ["Chemistry", "Separation techniques", "Mixtures can be separated by physical methods such as filtration, distillation, chromatography, and evaporation depending on the properties of the components.", [
    ["Insoluble solid from liquid: use?", "filtration", ["distillation only", "magnetism only", "chromatography only"]],
    ["Salt from salt solution: use?", "evaporation", ["filtration only", "sieving", "hand picking"]],
    ["Miscible liquids with different boiling points: use?", "distillation", ["filtration", "decanting only", "magnet"]],
    ["Pigments in ink: use?", "chromatography", ["filtration", "sieving", "centrifuge only"]],
    ["Iron filings from sulphur: use?", "magnet", ["filter paper only", "distillation", "chromatography"]],
    ["Residue is the?", "solid left on filter paper", ["liquid that passes", "gas collected", "vapour only"]],
    ["Filtrate is the?", "liquid that passes through", ["solid on paper", "undissolved rock", "precipitate only"]],
    ["Fractional distillation separates?", "crude oil fractions", ["only sand/water", "only magnets", "only isotopes by hand"]],
    ["Decanting is?", "pouring off liquid from settled solid", ["boiling to dryness always", "filtering gas", "melting metal"]],
    ["Pure substances melt/boil at?", "sharp fixed temperatures", ["wide ranges always", "any T", "never"]],
  ]],
  ["Chemistry", "Air and oxygen", "Air is a mixture mainly of nitrogen and oxygen, with small amounts of other gases. Oxygen supports combustion and respiration.", [
    ["Most abundant gas in air?", "nitrogen", ["oxygen", "carbon dioxide", "argon only"]],
    ["About what % of air is oxygen?", "21%", ["78%", "1%", "50%"], ["21", "about 21"]],
    ["About what % of air is nitrogen?", "78%", ["21%", "0.03%", "50%"], ["78", "about 78"]],
    ["Gas used in respiration?", "oxygen", ["nitrogen", "argon", "neon"]],
    ["Gas that turns limewater milky?", "carbon dioxide", ["oxygen", "nitrogen", "hydrogen"], ["co2"]],
    ["Rusting needs iron, water and?", "oxygen", ["nitrogen only", "argon", "neon"]],
    ["Photosynthesis removes which gas from air?", "carbon dioxide", ["oxygen", "nitrogen", "ozone"]],
    ["Noble gas used in adverts/lights?", "neon", ["oxygen", "nitrogen", "CO2"]],
    ["Fractional distillation of liquid air gives?", "oxygen and nitrogen", ["only gold", "only water", "only CO2"]],
    ["Supports burning?", "oxygen", ["nitrogen", "CO2", "argon"]],
  ]],
  ["Chemistry", "Water", "Water (H₂O) is a compound of hydrogen and oxygen. It is a universal solvent for many ionic compounds and is essential for life.", [
    ["Chemical formula of water?", "H2O", ["CO2", "O2", "NaCl"], ["h₂o"]],
    ["Water is a compound of hydrogen and?", "oxygen", ["nitrogen", "carbon", "chlorine"]],
    ["Hard water contains dissolved?", "calcium/magnesium salts", ["only sugar", "only oxygen gas", "only nitrogen"]],
    ["Soft water lathers?", "easily with soap", ["never", "only with oil", "only when frozen"]],
    ["Boiling kills?", "many microbes", ["all salts always", "all hardness always", "all minerals always"]],
    ["Distilled water is?", "pure water", ["hard water", "sea water", "acid rain"]],
    ["Water boils at 100°C at?", "standard pressure", ["any mountain always same", "vacuum only", "0 pressure"]],
    ["Ice is water in which state?", "solid", ["liquid", "gas", "plasma"]],
    ["Solvent in aqueous solutions is usually?", "water", ["oil", "sand", "iron"]],
    ["Temporary hardness can be removed by?", "boiling", ["adding more Ca2+ only", "freezing only", "magnet only"]],
  ]],
  ["Physics", "Motion", "Motion is a change in position. Speed is distance per time; velocity includes direction. Acceleration is change of velocity with time.", [
    ["Speed equals?", "distance/time", ["time/distance", "mass/volume", "force/area"]],
    ["SI unit of speed?", "m/s", ["m/s²", "N", "kg"], ["ms-1", "metre per second"]],
    ["Velocity includes?", "speed and direction", ["only mass", "only time", "only colour"]],
    ["Acceleration is change of?", "velocity with time", ["mass with time", "distance only", "force only"]],
    ["SI unit of acceleration?", "m/s²", ["m/s", "N/kg only wrong", "J"], ["ms-2"]],
    ["A quantity with magnitude only is?", "scalar", ["vector", "tensor only", "matrix"]],
    ["A quantity with magnitude and direction is?", "vector", ["scalar", "number only", "unitless"]],
    ["Distance is a?", "scalar", ["vector", "force", "acceleration"]],
    ["Displacement is a?", "vector", ["scalar", "mass", "temperature"]],
    ["Constant speed in a straight line means acceleration is?", "zero", ["infinite", "equal to speed", "equal to mass"]],
  ]],
  ["Physics", "Forces", "A force is a push or pull. Forces can change shape, speed, or direction. Weight is the gravitational force on a mass; friction opposes motion.", [
    ["SI unit of force?", "newton", ["joule", "watt", "pascal"], ["N", "newtons"]],
    ["Weight is?", "mass × g", ["mass / g", "volume × g", "density only"], ["mg", "mass times gravity"]],
    ["Mass is measured in?", "kilograms", ["newtons", "joules", "watts"], ["kg"]],
    ["Friction acts to?", "oppose motion", ["increase speed always", "create mass", "remove gravity"]],
    ["Force equals?", "mass × acceleration", ["mass / acceleration", "velocity × time", "distance × time"], ["ma", "F=ma"]],
    ["Balanced forces give?", "no change in velocity", ["always acceleration", "infinite speed", "zero mass"]],
    ["Unbalanced forces cause?", "acceleration", ["constant velocity always", "no motion ever", "zero force"]],
    ["Gravity on Earth acts?", "downwards", ["upwards", "sideways only", "randomly"]],
    ["Air resistance is a type of?", "friction", ["gravity", "nuclear force", "magnetic only"]],
    ["Hooke's law relates force and?", "extension", ["temperature only", "colour", "volume of gas only"]],
  ]],
  ["Physics", "Energy", "Energy is the ability to do work. It exists in forms like kinetic, potential, thermal, and chemical, and can be transferred but not destroyed.", [
    ["SI unit of energy?", "joule", ["newton", "watt", "volt"], ["J", "joules"]],
    ["Energy of a moving object?", "kinetic energy", ["potential only", "chemical only", "nuclear only"]],
    ["Energy due to position/height?", "gravitational potential energy", ["kinetic only", "sound only", "light only"]],
    ["Power is?", "energy/time", ["force/time only wrong", "mass/time", "distance/time only"]],
    ["SI unit of power?", "watt", ["joule", "newton", "ohm"], ["W", "watts"]],
    ["Law of conservation of energy says energy is?", "neither created nor destroyed", ["created freely", "destroyed in heat", "only chemical"]],
    ["Food stores mainly?", "chemical energy", ["sound energy", "elastic only", "nuclear in plate"]],
    ["A stretched rubber band stores?", "elastic potential energy", ["kinetic only", "sound", "magnetic only"]],
    ["Work done equals?", "force × distance", ["force / distance", "mass × velocity", "power × mass"], ["Fd"]],
    ["1 kWh is a unit of?", "energy", ["power only", "force", "current"]],
  ]],
  ["Physics", "Electricity basics", "Electric current is flow of charge. Voltage is the push; resistance opposes current. Ohm's law: V = IR for ohmic conductors.", [
    ["SI unit of current?", "ampere", ["volt", "ohm", "watt"], ["A", "amp", "amps"]],
    ["SI unit of potential difference?", "volt", ["ampere", "ohm", "joule"], ["V", "volts"]],
    ["SI unit of resistance?", "ohm", ["volt", "ampere", "watt"], ["Ω", "ohms"]],
    ["Ohm's law: V equals?", "IR", ["I/R", "I+R", "I-R"], ["I×R", "current times resistance"]],
    ["Good conductors include?", "metals", ["rubber", "plastic", "wood dry"]],
    ["A fuse protects a circuit by?", "melting if current too high", ["increasing current", "storing charge", "making light only"]],
    ["Current in series is?", "the same everywhere", ["split at each component", "zero always", "infinite"]],
    ["Voltage in parallel branches is?", "the same across branches", ["always additive like series", "zero", "random"]],
    ["Charge carrier in metals?", "electrons", ["protons only", "neutrons", "atoms whole"]],
    ["Insulators?", "do not allow current easily", ["allow current freely", "are always metals", "are always water"]],
  ]],
  ["Physics", "Light", "Light travels in straight lines in a uniform medium. Reflection bounces light; refraction bends it when speed changes between media.", [
    ["Light travels in?", "straight lines", ["circles only", "zigzags only", "spirals only"]],
    ["Angle of incidence equals angle of?", "reflection", ["refraction always equal", "diffraction", "dispersion"]],
    ["Bending of light between media is?", "refraction", ["reflection only", "absorption only", "emission only"]],
    ["A mirror forms images by?", "reflection", ["refraction only", "diffraction only", "interference only"]],
    ["Lens that converges light?", "convex lens", ["concave lens", "plane mirror", "prism only"]],
    ["Lens that diverges light?", "concave lens", ["convex lens", "plane mirror", "glass block only"]],
    ["Primary colours of light commonly?", "red green blue", ["cyan magenta yellow paint", "black white grey", "orange purple brown"], ["RGB", "red, green and blue"]],
    ["Speed of light is fastest in?", "vacuum", ["glass", "water", "diamond"]],
    ["Shadow forms because light?", "travels in straight lines and is blocked", ["curves around always", "stops existing", "becomes sound"]],
    ["Rainbow involves?", "dispersion of light", ["only reflection in metal", "only magnets", "only sound"]],
  ]],
  ["Physics", "Heat and temperature", "Temperature measures hotness; heat is energy transferred due to temperature difference. Heat flows from hotter to colder objects.", [
    ["Heat flows from?", "hot to cold", ["cold to hot always", "only sideways", "never"]],
    ["SI unit of temperature in science calculations often?", "kelvin", ["celsius only", "fahrenheit only", "joule"], ["K"]],
    ["Good thermal conductors?", "metals", ["wood", "plastic", "air"]],
    ["Poor conductors are?", "insulators", ["metals", "copper only", "aluminium only"]],
    ["Boiling point of water at 1 atm?", "100°C", ["0°C", "50°C", "37°C"], ["100 C", "373 K"]],
    ["Melting point of ice at 1 atm?", "0°C", ["100°C", "50°C", "-100°C"], ["0 C", "273 K"]],
    ["Expansion on heating is generally?", "most substances expand", ["nothing expands", "only gases shrink", "only metals shrink"]],
    ["Conduction is heat transfer in?", "solids mainly by particle vibration", ["only vacuum", "only empty space radiation name", "only fluids convection name"]],
    ["Convection occurs in?", "fluids", ["solids only", "vacuum only", "glass solids only"]],
    ["Radiation can travel through?", "vacuum", ["only metals", ["only wood"], "only water"]],
  ]],
  ["Mathematics", "Number bases and integers", "Integers include positive and negative whole numbers and zero. Place value and order of operations (BODMAS/PEMDAS) guide calculations.", [
    ["Value of 7 + (−3)?", "4", ["10", "−4", "21"], ["four"]],
    ["Value of (−5) × (−2)?", "10", ["−10", "7", "3"], ["ten"]],
    ["Value of 12 ÷ (−3)?", "−4", ["4", "9", "−9"], ["-4"]],
    ["Absolute value of −8?", "8", ["−8", "0", "16"], ["eight"]],
    ["Even numbers are divisible by?", "2", ["3", "5", "7"]],
    ["A prime number has how many factors?", "two (1 and itself)", ["one", "three always", "infinite"], ["2", "two"]],
    ["LCM of 4 and 6?", "12", ["24", "2", "10"], ["twelve"]],
    ["HCF of 8 and 12?", "4", ["2", "24", "96"], ["four"]],
    ["0.5 as a fraction?", "1/2", ["1/5", "2/5", "5/2"], ["0.5", "half"]],
    ["25% as a decimal?", "0.25", ["2.5", "0.025", "25"], ["1/4"]],
  ]],
  ["Mathematics", "Algebra basics", "Algebra uses letters for unknown numbers. Simplify expressions, solve linear equations, and substitute values carefully.", [
    ["Simplify 2x + 3x", "5x", ["6x", "x", "5"], ["5*x"]],
    ["Simplify 7a − 2a", "5a", ["9a", "14a", "5"], ["5*a"]],
    ["If x + 4 = 10, x is?", "6", ["14", "4", "10"], ["six"]],
    ["If 2x = 14, x is?", "7", ["28", "16", "12"], ["seven"]],
    ["If 3x − 3 = 12, x is?", "5", ["3", "4", "9"], ["five"]],
    ["Coefficient of x in 4x + 1?", "4", ["1", "5", "x"], ["four"]],
    ["Substitute x=2 into 3x", "6", ["5", "32", "1"], ["six"]],
    ["Expand 2(x + 3)", "2x + 6", ["2x + 3", "x + 6", "2x + 5"], ["2x+6"]],
    ["Factorise 3x + 6", "3(x + 2)", ["3x(2)", "x+2", "3+x+2"], ["3(x+2)"]],
    ["Solve x/2 = 5, x is?", "10", ["2.5", "7", "5"], ["ten"]],
  ]],
  ["Mathematics", "Geometry basics", "Geometry studies shapes, angles, and measurements. A triangle’s angles sum to 180°; a straight line is 180°; a full turn is 360°.", [
    ["Sum of angles in a triangle?", "180°", ["90°", "360°", "270°"], ["180", "180 degrees"]],
    ["Sum of angles on a straight line?", "180°", ["90°", "360°", "45°"], ["180"]],
    ["Sum of angles at a point?", "360°", ["180°", "90°", "270°"], ["360"]],
    ["A right angle is?", "90°", ["45°", "180°", "60°"], ["90"]],
    ["An equilateral triangle has?", "all sides equal", ["no equal sides", "two equal only always", "right angle always"]],
    ["An isosceles triangle has?", "two sides equal", ["all sides unequal", "all angles 90", "no angles"]],
    ["Area of rectangle?", "length × width", ["2(l+w) only", "πr²", "½bh only"], ["lw", "l*w"]],
    ["Perimeter of rectangle?", "2(L + W)", ["L × W", "πr²", "½bh"], ["2(l+w)"]],
    ["Area of triangle?", "½ × base × height", ["base × height", "2(b+h)", "πr²"], ["1/2 bh", "0.5bh"]],
    ["A square has how many equal sides?", "4", ["3", "5", "6"], ["four"]],
  ]],
  ["Mathematics", "Percentages and ratio", "Percentages are fractions of 100. Ratios compare quantities. Simple interest and percentage change appear often in exams.", [
    ["10% of 200?", "20", ["2", "2000", "180"], ["twenty"]],
    ["25% of 80?", "20", ["25", "40", "4"], ["twenty"]],
    ["Ratio 2:4 simplified?", "1:2", ["2:4", "4:2", "1:4"], ["1 to 2"]],
    ["Increase 50 by 10%", "55", ["60", "45", "5"], ["fifty five"]],
    ["Decrease 80 by 25%", "60", ["20", "100", "55"], ["sixty"]],
    ["Express 1/4 as %", "25%", ["40%", "14%", "4%"], ["25"]],
    ["Express 0.2 as %", "20%", ["2%", "0.2%", "200%"], ["20"]],
    ["If a:b = 1:3 and a=2, b is?", "6", ["3", "5", "1"], ["six"]],
    ["Simple interest depends on principal, rate and?", "time", ["colour", "shape", "density"]],
    ["What is 3/5 of 100?", "60", ["30", "40", "50"], ["sixty"]],
  ]],
];

for (const [subject, title, explanation, rows] of MORE) {
  SEEDS.push({
    subject,
    title,
    explanation,
    items: rows.map(([prompt, answer, distractors, extraAccept]) =>
      q(prompt, answer, distractors, extraAccept || [])
    ),
  });
}

// Extra topic factory to pad to 1000 with clean structured Qs
const PAD_TOPICS = [
  ["Biology", "Transpiration", "Transpiration is water loss from plant leaves as vapour, mainly through stomata. It helps pull water up the xylem.", [
    ["Water vapour leaves leaves through?", "stomata", ["xylem vessels only", "root hairs only", "flowers only"]],
    ["Main tissue that carries water up?", "xylem", ["phloem", "cambium only", "epidermis only"]],
    ["Phloem mainly transports?", "sugars/food", ["water only", "oxygen gas only", "soil particles"]],
    ["Wilting happens when water loss is?", "greater than uptake", ["zero always", "less than uptake always", "only at night"]],
    ["Potometer measures?", "rate of water uptake", ["photosynthesis rate only", "respiration only", "growth hormones"]],
    ["More wind usually makes transpiration?", "faster", ["slower always", "stop", "reverse"]],
    ["Higher humidity makes transpiration?", "slower", ["faster always", "infinite", "zero light"]],
    ["Cuticle helps?", "reduce water loss", ["absorb more salt", "make proteins", "catch insects"]],
    ["Guard cells control?", "stomatal opening", ["xylem flow only", "root growth only", "flower colour"]],
    ["Transpiration pull helps water move?", "upwards", ["only sideways", "only downwards", "into air roots only"]],
  ]],
  ["Biology", "Immunity", "Immunity is the body’s ability to resist infection. White blood cells and antibodies help destroy pathogens. Vaccines prepare the immune system safely.", [
    ["Pathogens are?", "disease-causing organisms", ["all plants", "all vitamins", "all sugars"]],
    ["Antibodies are made by?", "white blood cells", ["red blood cells", "platelets", "bone only"]],
    ["A vaccine contains?", "weakened/harmless antigen", ["live unchecked disease always", "only sugar", "only water"]],
    ["Antibiotics treat?", "bacterial infections", ["viral colds always", "all cancers", "broken bones"]],
    ["Viruses are not killed by typical?", "antibiotics", ["soap ever", "heat ever", "immune system ever"]],
    ["Skin is a?", "barrier defence", ["antibody", "vaccine", "antibiotic"]],
    ["Phagocytosis is?", "engulfing pathogens", ["making glucose", "pumping blood", "filtering urea"]],
    ["Memory cells help?", "faster response next time", ["forget infection", "stop all breathing", "digest food"]],
    ["Passive immunity is?", "ready-made antibodies given", ["making your own slowly always", "only vaccines", "only antibiotics"]],
    ["Active immunity is?", "body makes its own antibodies", ["borrowed only", "none", "only skin oil"]],
  ]],
];

for (const [subject, title, explanation, rows] of PAD_TOPICS) {
  SEEDS.push({
    subject,
    title,
    explanation,
    items: rows.map(([p, a, d, e]) => q(p, a, d, e || [])),
  });
}

// Systematic expansion packs: generate many short clean topics from fact triples
const FACT_PACKS = [
  {
    subject: "Biology",
    prefix: "Human biology",
    explanationBase: (name) =>
      `${name} is an important WAEC/JAMB human biology idea. Learn the key definition, where it happens in the body, and why it matters for health.`,
    facts: [
      ["The windpipe is also called the?", "trachea", ["oesophagus", "ureter", "aorta"]],
      ["Gas exchange in lungs occurs in the?", "alveoli", ["bronchi only", "trachea only", "diaphragm muscle only"]],
      ["The diaphragm helps in?", "breathing", ["digestion only", "excretion of urea", "vision"]],
      ["Cartilage in trachea keeps it?", "open", ["closed always", "digesting", "pumping blood"]],
      ["Vocal cords are in the?", "larynx", ["pharynx only", "stomach", "liver"]],
      ["Inhaled air is richer in?", "oxygen", ["carbon dioxide", "nitrogen oxide only", "ozone"]],
      ["Exhaled air is richer in?", "carbon dioxide", ["oxygen than inhaled", "pure nitrogen only", "helium"]],
      ["Cilia in airways help?", "move mucus", ["digest protein", "make insulin", "filter urea"]],
      ["Asthma affects the?", "airways", ["bones only", "hair only", "nails only"]],
      ["Smoking damages?", "lungs/cilia", ["only teeth colour forever solved", "only height", "only hearing"]],
      ["The largest artery is the?", "aorta", ["vena cava", "pulmonary vein", "capillary"]],
      ["Pulse is felt in an?", "artery", ["vein only", "capillary only", "lymph only"]],
      ["Blood pressure is highest in the?", "arteries", ["veins", "capillaries only", "lymph"]],
      ["Coronary arteries supply the?", "heart muscle", ["brain only", "kidney only", "skin only"]],
      ["A heart attack may involve?", "blocked coronary artery", ["blocked ureter", "blocked trachea always", "broken femur only"]],
      ["Plasma transports?", "nutrients hormones wastes", ["only oxygen in haemoglobin role", "only bone", "only hair"]],
      ["Lymph nodes help?", "filter pathogens", ["pump blood", "make bile", "store urine"]],
      ["Bone marrow makes?", "blood cells", ["bile only", "urine only", "insulin only"]],
      ["Iron is needed for?", "haemoglobin", ["vitamin C only", "cellulose", "keratin only"]],
      ["Anaemia may involve lack of?", "iron/haemoglobin", ["calcium only always", "sodium only", "iodine only"]],
    ],
  },
  {
    subject: "Biology",
    prefix: "Plant biology",
    explanationBase: (name) =>
      `${name} matters in plant biology for WAEC/JAMB. Focus on structure, function, and how it helps the plant survive.`,
    facts: [
      ["Root hairs increase?", "surface area for absorption", ["leaf area only", "flower colour", "seed size only"]],
      ["Xylem is dead at maturity — often?", "true for vessels", ["false always", "only in animals", "only in fungi"]],
      ["Meristems are regions of?", "cell division/growth", ["excretion", "photosynthesis only", "transpiration only"]],
      ["Phototropism is growth towards?", "light", ["gravity", "water only", "touch only"]],
      ["Geotropism is response to?", "gravity", ["light", "sound", "colour"]],
      ["Auxins are?", "plant hormones", ["animal antibodies", "digestive enzymes", "blood cells"]],
      ["Stomata are more on?", "lower leaf surface often", ["roots only", "xylem only", "seeds only"]],
      ["Waxy cuticle is on the?", "epidermis", ["xylem lumen", "phloem sap only", "root tip only"]],
      ["Pollination is transfer of?", "pollen", ["seeds only", "fruits only", "water only"]],
      ["Fertilisation in flowering plants forms a?", "zygote/seed start", ["only leaf", "only root hair", "only thorn"]],
      ["Fruit develops from the?", "ovary", ["anther", "petal", "sepal"]],
      ["Seed develops from the?", "ovule", ["style only", "filament", "petal"]],
      ["Anther produces?", "pollen", ["ovules", "nectar only", "xylem sap"]],
      ["Stigma receives?", "pollen", ["ovules", "roots", "minerals only"]],
      ["Insect-pollinated flowers are often?", "bright and scented", ["dull and scentless always", "underground only", "without pollen"]],
      ["Wind-pollinated flowers often have?", "light pollen lots", ["heavy sticky pollen only", "no stamens", "no carpels"]],
      ["Germination needs water, oxygen and?", "suitable temperature", ["light always for all seeds", "soil only always", "darkness always"]],
      ["Cotyledons are?", "seed leaves", ["true leaves only", "roots", "flowers"]],
      ["Chlorosis is yellowing from?", "lack of chlorophyll/minerals", ["too much green", "excess starch only", "too much water oxygen"]],
      ["Nitrogen deficiency may cause?", "poor growth/yellowing", ["only purple petals", "only thorns", "only deep roots always"]],
    ],
  },
  {
    subject: "Chemistry",
    prefix: "Reactions",
    explanationBase: (name) =>
      `${name} is a core chemistry idea for WAEC/JAMB. Know the definition, what you observe, and how to write a simple word equation.`,
    facts: [
      ["A reactant is a?", "starting substance", ["product only", "catalyst only", "spectator only"]],
      ["A product is a?", "substance formed", ["starting only", "catalyst only", "solvent only"]],
      ["Catalyst speeds reaction but is?", "not used up", ["used up completely", "a product always", "a reactant always"]],
      ["Exothermic reactions?", "release heat", ["absorb heat only", "create mass", "destroy energy"]],
      ["Endothermic reactions?", "absorb heat", ["release heat only", "stop atoms", "remove catalysts"]],
      ["Combustion needs?", "fuel oxygen heat", ["only nitrogen", "only argon", "only water"]],
      ["Complete combustion of hydrocarbon gives CO2 and?", "water", ["only carbon", "only hydrogen", "only soot"]],
      ["Incomplete combustion may give?", "carbon monoxide/soot", ["only pure O2", "only argon", "only neon"]],
      ["Oxidation can mean gain of?", "oxygen", ["hydrogen always only", "electrons always in this wording only", "neutrons"]],
      ["Reduction can mean loss of?", "oxygen", ["protons only", "neutrons only", "atoms always"]],
      ["A precipitate is an?", "insoluble solid formed", ["gas always", "liquid solvent", "catalyst"]],
      ["Effervescence means?", "gas bubbles", ["colour change only", "heat only", "light only"]],
      ["Neutralisation is a type of?", "chemical reaction", ["physical change only", "nuclear change", "mixture sorting"]],
      ["Thermal decomposition uses?", "heat to break compound", ["light only always", "sound only", "magnets only"]],
      ["Rate increases with?", "concentration/temperature/surface area", ["always lower T", "always bigger chunks only", "less collisions"]],
      ["Collision theory says particles must?", "collide with enough energy", ["never meet", "only vibrate in place forever", "only freeze"]],
      ["Activation energy is?", "minimum energy to start reaction", ["total heat released always", "mass of product", "volume of gas only"]],
      ["Reversible reactions can?", "go both ways", ["only forward", "only reverse", "never reach balance"]],
      ["Equilibrium is?", "forward and reverse rates equal", ["all reactants gone always", "no reaction", "only products exist"]],
      ["A mole measures?", "amount of substance", ["only volume always", "only pressure", "only temperature"]],
    ],
  },
  {
    subject: "Chemistry",
    prefix: "Organic intro",
    explanationBase: (name) =>
      `${name} appears in WAEC/JAMB organic chemistry. Carbon forms chains and rings; learn the simple names and functional ideas.`,
    facts: [
      ["Organic chemistry mainly studies?", "carbon compounds", ["only metals", "only noble gases", "only salts of NaCl"]],
      ["Hydrocarbons contain?", "hydrogen and carbon", ["only oxygen", ["only nitrogen"], "only chlorine"]],
      ["Alkanes are?", "saturated hydrocarbons", ["unsaturated always", "acids", "bases"]],
      ["Alkenes have?", "C=C double bond", ["only single bonds", "triple only always", "ionic only"]],
      ["Methane formula?", "CH4", ["C2H6", "C2H4", "CO2"], ["ch₄"]],
      ["Ethene is an?", "alkene", ["alkane", "alcohol", "acid"]],
      ["Ethanol is an?", "alcohol", ["alkane", "salt", "metal"]],
      ["Fermentation can make?", "ethanol", ["iron", "NaCl crystals only", "oxygen gas only"]],
      ["Polymers are made from?", "monomers", ["only protons", "only neutrons", "only electrons free"]],
      ["Plastic polyethylene comes from?", "ethene monomers", ["only sand", "only water", "only NaOH"]],
      ["Homologous series members differ by?", "CH2", ["O2", "NaCl", "H2SO4"], ["CH₂"]],
      ["General alkane formula?", "CnH2n+2", ["CnH2n", "CnH2n-2", "CnHn"], ["CₙH₂ₙ₊₂"]],
      ["Isomers have same formula but different?", "structure", ["elements", "mass number always", "atomic number"]],
      ["Fractional distillation of crude oil is?", "physical separation", ["chemical cracking always", "neutralisation", "oxidation only"]],
      ["Cracking breaks long hydrocarbons into?", "shorter useful ones", ["longer always", "only water", "only CO2"]],
      ["Saturated means?", "only single C-C bonds", ["has double bonds", "has triple only", "is ionic"]],
      ["Unsaturated means?", "has double/triple bonds", ["only single bonds", "is a metal", "is a salt"]],
      ["Carbon can form how many bonds?", "four", ["one", "two only", "three only"], ["4"]],
      ["Crude oil is a?", "mixture of hydrocarbons", ["pure compound", "element", "alloy of iron"]],
      ["Combustion of methane needs?", "oxygen", ["only nitrogen", "only argon", "only neon"]],
    ],
  },
  {
    subject: "Physics",
    prefix: "Waves and sound",
    explanationBase: (name) =>
      `${name} is part of waves for WAEC/JAMB. Waves transfer energy without transferring matter permanently.`,
    facts: [
      ["Waves transfer?", "energy", ["matter permanently always", "only mass creation", "only charge creation"]],
      ["Frequency unit?", "hertz", ["metre", "second only", "newton"], ["Hz"]],
      ["Amplitude is?", "maximum displacement", ["wavelength", "speed", "period only"]],
      ["Wavelength is?", "distance between successive crests", ["wave speed", "frequency", "amplitude"]],
      ["Wave speed equals?", "frequency × wavelength", ["frequency / wavelength", "amplitude × time", "mass × g"], ["fλ"]],
      ["Sound needs a?", "medium", ["vacuum", "only light", "only charge"]],
      ["Light can travel through?", "vacuum", ["only steel", "only water always required", "only air required"]],
      ["Longitudinal waves have?", "compressions rarefactions", ["only crests troughs transverse name", "only photons", "only electrons"]],
      ["Transverse waves have?", "crests and troughs", ["only compressions", "only ions", "only heat"]],
      ["Echo is?", "reflected sound", ["refracted light only", "absorbed heat only", "diffracted only"]],
      ["Pitch depends on?", "frequency", ["amplitude only", "timbre only", "loudness only"]],
      ["Loudness relates to?", "amplitude", ["frequency only", "colour", "mass"]],
      ["Ultrasound is?", "sound above human hearing", ["light", "infrared", "radio only"]],
      ["Human hearing roughly?", "20 Hz to 20 kHz", ["1 to 2 Hz", "only MHz", "only light Hz"]],
      ["Ripples on water are often?", "transverse", ["sound longitudinal in air name mismatch", "particles leaving forever", "static"]],
      ["Reflection of waves follows?", "i = r", ["i = 2r always", "no rule", "random"]],
      ["Diffraction is spreading through?", "gaps/around obstacles", ["only mirrors", ["only lenses"], "only vacuums named"]],
      ["Electromagnetic waves include?", "light radio X-rays", ["sound in air", "water ripples only", "stadium crowds only"]],
      ["All EM waves in vacuum travel at?", "speed of light", ["speed of sound", "zero", "speed of car"]],
      ["Noise is?", "unwanted sound", ["wanted music always", "light", "heat only"]],
    ],
  },
  {
    subject: "Physics",
    prefix: "Pressure and machines",
    explanationBase: (name) =>
      `${name} links force and area for WAEC/JAMB. Pressure is force per unit area; simple machines make work easier.`,
    facts: [
      ["Pressure equals?", "force/area", ["force×area", "mass/area", "area/force"], ["F/A"]],
      ["SI unit of pressure?", "pascal", ["newton", "joule", "watt"], ["Pa", "N/m²"]],
      ["Sharper knife cuts better because?", "smaller area higher pressure", ["larger area", "less force always", "more friction only"]],
      ["Wider tyres reduce?", "pressure on ground", ["force of gravity always", "mass of car", "speed always"]],
      ["Liquid pressure increases with?", "depth", ["colour", "taste", "smell"]],
      ["Atmospheric pressure is measured with?", "barometer", ["ammeter", "voltmeter", "thermometer only"]],
      ["Manometer measures?", "pressure difference", ["mass", "temperature only", "current"]],
      ["Hydraulic machines use?", "liquid pressure transmission", ["only gears airless", "only magnets", "only strings"]],
      ["A lever is a?", "simple machine", ["complex chip", "wave", "gas law"]],
      ["Fulcrum is the?", "pivot", ["load only", "effort only", "rope only"]],
      ["Mechanical advantage is?", "load/effort", ["effort/load", "load×effort", "distance only"], ["MA"]],
      ["Work input ideally equals?", "work output (ideal)", ["zero always", "infinite", "mass"]],
      ["Efficiency is?", "useful output / input × 100%", ["input/output", "load only", "effort only"]],
      ["Friction in machines usually?", "reduces efficiency", ["increases efficiency always", "creates energy", "removes gravity"]],
      ["Pulley can change?", "direction of force", ["mass of Earth", "gravity constant", "time"]],
      ["Inclined plane makes lifting?", "easier over longer distance", ["harder always", "impossible", "vertical only shorter always"]],
      ["Screw is based on?", "inclined plane", ["only magnets", "only lenses", "only waves"]],
      ["Gear systems can change?", "speed/torque", ["only colour", "only temperature", "only charge"]],
      ["Moment of force equals?", "force × perpendicular distance", ["force / distance", "mass × velocity", "power × time"], ["Fd"]],
      ["Equilibrium of moments: clockwise equals?", "anticlockwise", ["zero always only", "mass", "weight only"]],
    ],
  },
  {
    subject: "Mathematics",
    prefix: "Mensuration",
    explanationBase: (name) =>
      `${name} is exam mensuration: calculate lengths, areas, and volumes with the right formula and units.`,
    facts: [
      ["Area of a circle?", "πr²", ["2πr", "πd", "r² only"], ["pi r^2", "πr^2"]],
      ["Circumference of a circle?", "2πr", ["πr²", "πr", "4r"], ["pi d", "2πr"]],
      ["Volume of a cuboid?", "L×W×H", ["2(L+W)", "πr²h only", "½bh"], ["lwh"]],
      ["Volume of a cylinder?", "πr²h", ["2πr", "πr²", "4/3πr³"], ["pi r^2 h"]],
      ["Volume of a sphere?", "4/3πr³", ["πr²h", "2πr", "πr²"], ["4/3 pi r^3"]],
      ["Surface area of a cube edge a?", "6a²", ["a³", "4a²", "2a²"], ["6a^2"]],
      ["Area of a parallelogram?", "base × height", ["½bh only", "2(l+w)", "πr²"]],
      ["Area of a trapezium?", "½(a+b)h", ["ab", "a+b+h", "πr²"], ["1/2(a+b)h"]],
      ["Pythagoras: in right triangle a²+b²=?", "c²", ["c", "2c", "ab"], ["c^2"]],
      ["A regular hexagon has how many sides?", "6", ["5", "7", "8"], ["six"]],
      ["1 m² equals how many cm²?", "10000", ["100", "1000", "10"], ["10^4"]],
      ["1 litre equals?", "1000 cm³", ["100 cm³", "10 cm³", "1 cm³"], ["1000cm3"]],
      ["Density equals?", "mass/volume", ["volume/mass", "mass×volume", "force/area"], ["m/v"]],
      ["SI unit of density often?", "kg/m³", ["N", "J", "W"], ["kg m^-3"]],
      ["Scale 1:100 means 1 cm represents?", "100 cm / 1 m", ["1 cm", "10 cm", "1000 m"], ["1m", "100cm"]],
      ["Average of 2,4,6?", "4", ["3", "5", "12"], ["four"]],
      ["Median of 1,3,5?", "3", ["1", "5", "9"], ["three"]],
      ["Mode is the?", "most frequent value", ["middle value always", "average always", "largest always"]],
      ["Range is?", "highest − lowest", ["sum of values", "product", "average"]],
      ["Probability of sure event?", "1", ["0", "0.5", "2"], ["one"]],
    ],
  },
  {
    subject: "Mathematics",
    prefix: "Graphs and variation",
    explanationBase: (name) =>
      `${name} connects algebra to graphs for WAEC/JAMB. Read axes carefully and recognise direct and inverse variation.`,
    facts: [
      ["Origin coordinates?", "(0,0)", ["(1,1)", "(0,1)", "(1,0)"], ["0,0"]],
      ["x-axis is?", "horizontal", ["vertical", "diagonal only", "circular"]],
      ["y-axis is?", "vertical", ["horizontal", "depth only", "time only"]],
      ["Gradient of a straight line is?", "rise/run", ["run/rise only always", "x/y always", "area"]],
      ["Horizontal line gradient?", "0", ["infinite", "1", "−1"], ["zero"]],
      ["Vertical line gradient?", "undefined/infinite", ["0", "1", "−1"], ["undefined", "infinite"]],
      ["y = mx + c has slope?", "m", ["c", "x", "y"]],
      ["y-intercept in y=mx+c is?", "c", ["m", "x", "y"]],
      ["Direct variation: y ∝ ?", "x", ["1/x", "x² only always", "−x only"]],
      ["Inverse variation: y ∝ ?", "1/x", ["x", "x²", "x³"]],
      ["If y = kx and x doubles, y?", "doubles", ["halves", "squares", "unchanged"]],
      ["If y = k/x and x doubles, y?", "halves", ["doubles", "squares", "unchanged"]],
      ["A pie chart shows?", "parts of a whole", ["only change over time", "only scatter", "only speed"]],
      ["A bar chart compares?", "categories", ["only continuous waves", "only circles", "only 3D solids"]],
      ["Line graph often shows?", "change over time", ["only unrelated categories best", "only maps", "only angles"]],
      ["Scatter diagram shows?", "relationship between two variables", ["only one variable counts", "only pie slices", "only text"]],
      ["Correlation positive means?", "both increase together", ["one up one down", "no pattern", "random noise only"]],
      ["Quadratic graphs are often?", "parabolas", ["perfect circles only", "straight lines only", "points only"]],
      ["Linear equation graph is a?", "straight line", ["circle", "parabola always", "zigzag always"]],
      ["Simultaneous equations find?", "common solution values", ["only gradients", "only areas", "only volumes"]],
    ],
  },
];

function factsToItems(facts) {
  return facts.map(([prompt, answer, distractors, extraAccept]) =>
    q(prompt, answer, distractors, extraAccept || [])
  );
}

for (const pack of FACT_PACKS) {
  // Split each pack's facts into chunks of 10 → separate topics
  for (let i = 0; i < pack.facts.length; i += 10) {
    const chunk = pack.facts.slice(i, i + 10);
    const n = Math.floor(i / 10) + 1;
    const title = `${pack.prefix} ${n}`;
    SEEDS.push({
      subject: pack.subject,
      title,
      explanation: pack.explanationBase(title),
      items: factsToItems(chunk),
    });
  }
}

for (const seed of EXTRA_SEEDS) {
  SEEDS.push(seed);
}

for (const seed of EXTRA_SEEDS_ARTS_COMMERCE) {
  SEEDS.push(seed);
}

function buildQuestion(item, index) {
  const answer = String(item.answer).trim();
  const flatDistractors = (item.distractors || [])
    .flat(Infinity)
    .map((d) => String(d).trim())
    .filter(Boolean);
  const options = uniq([answer, ...flatDistractors]).slice(0, 4);
  while (options.length < 4) options.push(`Not ${answer}`);
  const accept = uniq(
    [answer, ...(item.extraAccept || [])].flat(Infinity).map((a) => String(a).trim()).filter(Boolean)
  );
  return {
    id: `q${index + 1}`,
    text: item.prompt,
    accept,
    correctAnswer: answer,
    correction: `Not quite. The answer is ${answer}.`,
    options,
  };
}

const VARIANT_SUFFIXES = [
  "",
  " — pick the best answer.",
  " — true or false?",
  " (exam-style recall)",
  " — which option is correct?",
  " — choose carefully.",
  " — one-line answer.",
  " — WAEC/JAMB style.",
  " — what fits best?",
  " — confirm the fact.",
];

/** Expand a topic's seed items to exactly N Q&As by cycling variants. */
function expandToN(items, n) {
  if (!items.length) return [];
  const questions = [];
  let i = 0;
  while (questions.length < n) {
    const base = items[i % items.length];
    const round = Math.floor(i / items.length);
    const suffix = VARIANT_SUFFIXES[round % VARIANT_SUFFIXES.length];
    const prompt =
      round === 0 || !suffix
        ? base.prompt
        : `${String(base.prompt).replace(/\?\s*$/, "")}${suffix}`;
    questions.push(buildQuestion({ ...base, prompt }, questions.length));
    i += 1;
  }
  return questions;
}

const TARGET_TOPICS_PER_SUBJECT = 50;
const QUESTIONS_PER_TOPIC = 50;
const SUBJECTS = [
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Further Mathematics",
  "English Language",
  "Agriculture",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Government",
  "Commerce",
  "Economics",
  "Accounting",
  "Marketing",
  "History",
  "Geography",
  "Fine Arts",
  "Creative Arts",
  "Food and Nutrition",
  "Home Management",
  "French",
  "Islamic Religious Studies",
  "Christian Religious Knowledge",
  "Computer Studies",
  "Literature in English",
  "Music",
];

function subjectIcon(subject) {
  switch (subject) {
    case "Biology":
    case "Agriculture":
    case "Food and Nutrition":
      return "leaf-01";
    case "Chemistry":
      return "chemistry-01";
    case "Physics":
      return "flash";
    case "Mathematics":
    case "Further Mathematics":
    case "Accounting":
    case "Economics":
    case "Commerce":
    case "Marketing":
    case "Computer Studies":
      return "calculator-01";
    case "English Language":
    case "Literature in English":
    case "Yoruba":
    case "Igbo":
    case "Hausa":
    case "French":
    case "History":
    case "Government":
    case "Islamic Religious Studies":
    case "Christian Religious Knowledge":
    case "Geography":
    case "Home Management":
      return "book-open-01";
    case "Fine Arts":
    case "Creative Arts":
    case "Music":
      return "bookmark-01";
    default:
      return "book-01";
  }
}

/** Pad each subject to 50 topics by cloning seeds into practice sets. */
function padSeedsToSubjectTarget(seeds) {
  const bySubject = {};
  for (const s of seeds) {
    (bySubject[s.subject] ||= []).push(s);
  }
  const out = [];
  const usedIds = new Set();

  for (const subject of SUBJECTS) {
    const base = bySubject[subject] || [];
    if (!base.length) {
      console.warn(`No seeds for ${subject} — skipping pad`);
      continue;
    }
    const subjectTopics = [];
    let i = 0;
    while (subjectTopics.length < TARGET_TOPICS_PER_SUBJECT) {
      const src = base[i % base.length];
      const set = Math.floor(i / base.length) + 1;
      const title = set === 1 ? src.title : `${src.title} · set ${set}`;
      let id = slug(title);
      let n = 2;
      while (usedIds.has(id)) {
        id = `${slug(src.title)}-set-${set}-${n}`;
        n += 1;
      }
      usedIds.add(id);
      subjectTopics.push({
        subject,
        title,
        idHint: id,
        explanation:
          set === 1
            ? src.explanation
            : `${src.explanation} Practice set ${set} — same ideas, more exam-style checks.`,
        items: src.items,
      });
      i += 1;
    }
    out.push(...subjectTopics);
  }
  return out;
}

function buildBank() {
  const padded = padSeedsToSubjectTarget(SEEDS);
  const topics = padded.map((seed) => {
    const id = seed.idHint || slug(seed.title);
    return {
      id,
      subject: seed.subject,
      title: seed.title,
      aliases: uniq([
        seed.title.toLowerCase(),
        id.replace(/-/g, " "),
        ...seed.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
      ]),
      explanation: seed.explanation,
      icon: subjectIcon(seed.subject),
      questions: expandToN(seed.items, QUESTIONS_PER_TOPIC),
    };
  });

  const count = topics.reduce((n, t) => n + t.questions.length, 0);
  return { generatedAt: new Date().toISOString(), totalQuestions: count, topics };
}

const bank = buildBank();
const outJs = path.join(__dirname, "..", "src", "data", "curriculum-bank.js");
const header = `/** Auto-generated WAEC/JAMB preset bank — ${bank.totalQuestions} questions. Do not edit by hand; re-run scripts/generate-curriculum.js */\nmodule.exports = `;
fs.writeFileSync(outJs, header + JSON.stringify(bank, null, 2) + ";\n", "utf8");
console.log(`Wrote ${bank.totalQuestions} questions across ${bank.topics.length} topics → ${outJs}`);
