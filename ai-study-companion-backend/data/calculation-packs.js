/**
 * Step-by-step Calculation & Formula Packs for WAEC/JAMB.
 * Covers Mathematics, Physics, and Chemistry calculations with worked examples and formula sheets.
 */

const CALC_PACKS = [
  {
    id: "motion-equations",
    subject: "Physics",
    title: "Equations of Linear Motion",
    triggers: [
      "calculate velocity",
      "formula for velocity",
      "equations of motion",
      "motion formula",
      "linear motion",
      "acceleration formula",
      "calculate acceleration",
      "calculate displacement",
      "v u at",
      "motion calculations",
    ],
    formulas: [
      "1. v = u + at",
      "2. s = ut + ½at²",
      "3. v² = u² + 2as",
      "4. s = ½(u + v)t",
    ],
    variables: [
      "u = Initial velocity (m/s)",
      "v = Final velocity (m/s)",
      "a = Acceleration (m/s²)",
      "t = Time taken (s)",
      "s = Distance / Displacement (m)",
    ],
    workedExample: {
      question: "A car starts from rest (u = 0) and accelerates uniformly at 3 m/s² for 5 seconds. Calculate its final velocity and total distance covered.",
      given: "u = 0 m/s, a = 3 m/s², t = 5 s",
      step1: "Find final velocity (v):\nv = u + at\nv = 0 + (3 × 5) = 15 m/s",
      step2: "Find distance covered (s):\ns = ut + ½at²\ns = (0 × 5) + ½(3)(5²)\ns = 0 + ½(3)(25) = 37.5 m",
      finalAnswer: "Final velocity = 15 m/s; Distance = 37.5 m",
    },
    practice: {
      id: "motion-q1",
      question: "A bus accelerates from rest at 2 m/s² for 6 seconds. What is its final velocity in m/s?",
      correctAnswer: "12",
      accept: ["12", "12 m/s", "12m/s"],
      options: ["12 m/s", "8 m/s", "16 m/s", "24 m/s"],
      correction: "Using v = u + at: v = 0 + (2 × 6) = 12 m/s.",
    },
  },
  {
    id: "ohms-law",
    subject: "Physics",
    title: "Ohm's Law & Electric Power",
    triggers: [
      "ohm's law",
      "ohms law",
      "calculate resistance",
      "calculate voltage",
      "calculate current",
      "electric power formula",
      "v ir",
      "p iv",
      "circuit calculations",
      "potential difference formula",
    ],
    formulas: [
      "1. V = I × R   (Ohm's Law)",
      "2. P = I × V   (Electric Power)",
      "3. P = I² × R",
      "4. P = V² / R",
      "5. Series: R_total = R₁ + R₂ | Parallel: 1/R_total = 1/R₁ + 1/R₂",
    ],
    variables: [
      "V = Potential difference / Voltage in Volts (V)",
      "I = Electric current in Amperes (A)",
      "R = Resistance in Ohms (Ω)",
      "P = Electrical power in Watts (W)",
    ],
    workedExample: {
      question: "An electric iron of resistance 40 Ω is connected to a 240 V mains supply. Calculate the current flowing through it and the power consumed.",
      given: "R = 40 Ω, V = 240 V",
      step1: "Calculate Current (I):\nFrom V = IR  =>  I = V / R\nI = 240 / 40 = 6 A",
      step2: "Calculate Power (P):\nP = I × V = 6 × 240 = 1,440 W (or 1.44 kW)",
      finalAnswer: "Current = 6 A; Power = 1,440 W",
    },
    practice: {
      id: "ohms-q1",
      question: "A 10 Ω resistor has a current of 3 A passing through it. What is the potential difference (voltage) across it in Volts?",
      correctAnswer: "30",
      accept: ["30", "30 V", "30v", "30 volts"],
      options: ["30 V", "13 V", "3.3 V", "300 V"],
      correction: "Using V = I × R: V = 3 × 10 = 30 Volts.",
    },
  },
  {
    id: "quadratic-formula",
    subject: "Mathematics",
    title: "The Quadratic Formula",
    triggers: [
      "quadratic formula",
      "solve quadratic",
      "quadratic equation",
      "quadratic calculation",
      "minus b formula",
      "roots of quadratic",
      "discriminant formula",
      "b2 4ac",
    ],
    formulas: [
      "General Form: ax² + bx + c = 0",
      "Quadratic Formula: x = [-b ± √(b² - 4ac)] / (2a)",
      "Discriminant (D) = b² - 4ac",
      "If D > 0: Two real, distinct roots",
      "If D = 0: Two equal real roots (repeated root)",
      "If D < 0: No real roots (complex roots)",
    ],
    variables: [
      "a = Coefficient of x² (a ≠ 0)",
      "b = Coefficient of x",
      "c = Constant term",
      "x = Roots or solutions of the equation",
    ],
    workedExample: {
      question: "Solve the quadratic equation: 2x² - 7x + 3 = 0 using the quadratic formula.",
      given: "a = 2, b = -7, c = 3",
      step1: "Calculate Discriminant (b² - 4ac):\n(-7)² - 4(2)(3) = 49 - 24 = 25",
      step2: "Substitute into formula:\nx = [-(-7) ± √25] / (2 × 2)\nx = (7 ± 5) / 4",
      step3: "Solve both roots:\nx₁ = (7 + 5) / 4 = 12 / 4 = 3\nx₂ = (7 - 5) / 4 = 2 / 4 = 0.5",
      finalAnswer: "x = 3 or x = 0.5 (½)",
    },
    practice: {
      id: "quad-q1",
      question: "For the quadratic equation x² - 5x + 6 = 0, what is the value of the discriminant (b² - 4ac)?",
      correctAnswer: "1",
      accept: ["1", "+1"],
      options: ["1", "49", "25", "0"],
      correction: "b² - 4ac = (-5)² - 4(1)(6) = 25 - 24 = 1.",
    },
  },
  {
    id: "simple-interest",
    subject: "Mathematics",
    title: "Simple & Compound Interest",
    triggers: [
      "calculate simple interest",
      "simple interest formula",
      "interest formula",
      "calculate interest",
      "simple interest",
      "i prt 100",
      "principal rate time",
      "compound interest formula",
    ],
    formulas: [
      "1. Simple Interest: I = (P × R × T) / 100",
      "2. Total Amount: A = P + I",
      "3. Rate: R = (100 × I) / (P × T)",
      "4. Time: T = (100 × I) / (P × R)",
      "5. Compound Amount: A = P(1 + R/100)ⁿ",
    ],
    variables: [
      "I = Simple Interest accrued (₦)",
      "P = Principal sum invested or borrowed (₦)",
      "R = Annual Rate of interest (%)",
      "T = Time in years",
      "A = Total accumulated amount (Principal + Interest)",
    ],
    workedExample: {
      question: "Calculate the simple interest on ₦50,000 invested at 8% per annum for 3 years, and find the total amount.",
      given: "P = ₦50,000, R = 8%, T = 3 years",
      step1: "Calculate Interest (I):\nI = (P × R × T) / 100\nI = (50,000 × 8 × 3) / 100 = ₦12,000",
      step2: "Calculate Total Amount (A):\nA = P + I = 50,000 + 12,000 = ₦62,000",
      finalAnswer: "Simple Interest = ₦12,000; Total Amount = ₦62,000",
    },
    practice: {
      id: "si-q1",
      question: "What is the simple interest on ₦20,000 at 5% per annum for 2 years in Naira?",
      correctAnswer: "2000",
      accept: ["2000", "₦2000", "2,000", "₦2,000"],
      options: ["₦2,000", "₦1,000", "₦4,000", "₦22,000"],
      correction: "I = (P × R × T) / 100 = (20,000 × 5 × 2) / 100 = ₦2,000.",
    },
  },
  {
    id: "work-energy-power",
    subject: "Physics",
    title: "Work, Energy & Power",
    triggers: [
      "calculate work",
      "work energy power",
      "kinetic energy formula",
      "potential energy formula",
      "calculate kinetic energy",
      "calculate potential energy",
      "work done formula",
      "calculate power physics",
      "ke 1/2 mv2",
      "pe mgh",
    ],
    formulas: [
      "1. Work Done: W = Force (F) × Distance (d) = F × d × cos(θ)",
      "2. Kinetic Energy: KE = ½mv²",
      "3. Gravitational Potential Energy: PE = mgh",
      "4. Power: P = Work Done (W) / Time (t) = Force × Velocity",
    ],
    variables: [
      "W = Work done in Joules (J)",
      "m = Mass in kilograms (kg)",
      "v = Velocity in meters per second (m/s)",
      "g = Acceleration due to gravity (~9.8 or 10 m/s²)",
      "h = Height in meters (m)",
      "P = Power in Watts (W)",
    ],
    workedExample: {
      question: "A stone of mass 2 kg is dropped from the top of a 20 m high tower. Calculate its gravitational potential energy at the top (take g = 10 m/s²).",
      given: "m = 2 kg, h = 20 m, g = 10 m/s²",
      step1: "Apply Potential Energy formula:\nPE = m × g × h\nPE = 2 × 10 × 20 = 400 Joules",
      step2: "By Conservation of Energy:\nJust before hitting the ground, all 400 J converts into Kinetic Energy (KE = ½mv² = 400 J).",
      finalAnswer: "Potential Energy at the top = 400 Joules",
    },
    practice: {
      id: "wep-q1",
      question: "Calculate the kinetic energy in Joules of a 4 kg object moving at a velocity of 3 m/s.",
      correctAnswer: "18",
      accept: ["18", "18 J", "18j", "18 joules"],
      options: ["18 J", "36 J", "12 J", "6 J"],
      correction: "KE = ½mv² = ½(4)(3²) = 2 × 9 = 18 Joules.",
    },
  },
  {
    id: "mole-concept",
    subject: "Chemistry",
    title: "The Mole Concept & Molar Mass",
    triggers: [
      "calculate moles",
      "mole concept",
      "molar mass formula",
      "calculate molar mass",
      "number of moles",
      "moles formula",
      "molar volume",
      "avogadro's number",
      "stoichiometry calculation",
    ],
    formulas: [
      "1. Number of Moles (n) = Mass (m) / Molar Mass (M)",
      "2. Number of Particles = Moles (n) × 6.02 × 10²³ (Avogadro's number)",
      "3. Volume of Gas at s.t.p. = Moles (n) × 22.4 dm³ (or litres)",
      "4. Molarity / Concentration (C) = Moles (n) / Volume in dm³ (V)",
    ],
    variables: [
      "n = Number of moles (mol)",
      "m = Reacting mass in grams (g)",
      "M = Molar mass in grams per mole (g/mol)",
      "Avogadro's constant = 6.022 × 10²³ particles/mol",
      "Molar gas volume at s.t.p. = 22.4 dm³/mol",
    ],
    workedExample: {
      question: "Calculate the number of moles in 44 grams of Carbon Dioxide (CO₂). (Relative atomic masses: C = 12, O = 16).",
      given: "Mass = 44 g, C = 12, O = 16",
      step1: "Calculate Molar Mass of CO₂:\nMolar mass = 12 + (16 × 2) = 12 + 32 = 44 g/mol",
      step2: "Calculate Moles:\nNumber of moles = Mass / Molar mass\nMoles = 44 / 44 = 1.0 mol",
      finalAnswer: "Number of moles = 1.0 mol",
    },
    practice: {
      id: "mole-q1",
      question: "What is the molar mass of Water (H₂O) in g/mol? (Atomic masses: H = 1, O = 16).",
      correctAnswer: "18",
      accept: ["18", "18 g/mol", "18g/mol"],
      options: ["18 g/mol", "17 g/mol", "20 g/mol", "34 g/mol"],
      correction: "Molar mass of H₂O = (1 × 2) + 16 = 2 + 16 = 18 g/mol.",
    },
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

function resolveCalculationPack(text, subjectHint) {
  const q = normalizeQuery(text);
  if (!q) return null;

  let best = null;
  let bestScore = 0;

  for (const pack of CALC_PACKS) {
    let score = 0;
    for (const trigger of pack.triggers) {
      const t = normalizeQuery(trigger);
      if (q === t) score += 40;
      else if (q.includes(t)) score += 25;
      else if (t.includes(q) && q.length >= 8) score += 15;
      else {
        const words = t.split(" ").filter((w) => w.length > 2);
        const hits = words.filter((w) => q.includes(w)).length;
        if (hits >= 2) score += hits * 10;
      }
    }
    if (subjectHint && pack.subject.toLowerCase().includes(String(subjectHint).toLowerCase())) {
      score += 8;
    }
    if (score > bestScore) {
      bestScore = score;
      best = pack;
    }
  }

  return bestScore >= 15 ? best : null;
}

function formatCalculationReply(pack) {
  const formulaLines = pack.formulas.join("\n");
  const variableLines = pack.variables.map((v) => `• ${v}`).join("\n");
  const ex = pack.workedExample;

  return `📐 *${pack.title}* (${pack.subject})\n\n` +
    `*Key Formulas:*\n${formulaLines}\n\n` +
    `*Variables & Units:*\n${variableLines}\n\n` +
    `📝 *WAEC Worked Example:*\n${ex.question}\n\n` +
    `*Given:* ${ex.given}\n\n` +
    `*Step-by-Step Solution:*\n${ex.step1}\n\n${ex.step2}${ex.step3 ? `\n\n${ex.step3}` : ""}\n\n` +
    `✅ *Result:* ${ex.finalAnswer}\n\n` +
    `❓ *Practice Check:*\n${pack.practice.question}\n\n` +
    `(Reply with your calculated answer!)`;
}

module.exports = {
  CALC_PACKS,
  resolveCalculationPack,
  formatCalculationReply,
};
