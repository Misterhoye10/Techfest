/**
 * Generate Reca pitch deck PPTX (10 slides).
 * Run: node docs/reca/pitch/generate-pptx.js
 */
const path = require("path");
const PptxGenJS = require("pptxgenjs");

const OUT = path.join(__dirname, "Reca-Pitch-Deck.pptx");

const COLORS = {
  bg: "07090F",
  ink: "F4F6FB",
  muted: "9AA3B5",
  primary: "225AEB",
  accent: "FB735B",
  panel: "0E121B",
  wa: "25D366",
};

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pptx.layout = "WIDE";
pptx.author = "Reca";
pptx.title = "Reca — AI BuildFest 2026 Pitch Deck";

function addBg(slide) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: "100%",
    h: "100%",
    fill: { color: COLORS.bg },
  });
}

function footer(slide, left, num) {
  slide.addText(left, {
    x: 0.7,
    y: 7.05,
    w: 8,
    h: 0.3,
    fontSize: 11,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  slide.addText(`${num} / 12`, {
    x: 11.2,
    y: 7.05,
    w: 1.4,
    h: 0.3,
    fontSize: 11,
    color: COLORS.muted,
    fontFace: "Calibri",
    align: "right",
  });
}

function eyebrow(slide, text) {
  slide.addText(text.toUpperCase(), {
    x: 0.7,
    y: 0.55,
    w: 12,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLORS.accent,
    fontFace: "Calibri",
    charSpacing: 3,
  });
}

// 1 Title
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.7,
    y: 0.55,
    w: 0.42,
    h: 0.42,
    fill: { color: COLORS.accent },
    rectRadius: 0.08,
  });
  s.addText("R", {
    x: 0.7,
    y: 0.55,
    w: 0.42,
    h: 0.42,
    fontSize: 16,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
    fontFace: "Georgia",
  });
  s.addText("Reca", {
    x: 1.25,
    y: 0.58,
    w: 3,
    h: 0.4,
    fontSize: 20,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addText("AI BUILDFEST 2026  ·  TRACK 3  ·  CASE STUDY 2", {
    x: 0.7,
    y: 3.2,
    w: 12,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLORS.accent,
    fontFace: "Calibri",
  });
  s.addText("ChatGPT waits for you.\nReca comes first.", {
    x: 0.7,
    y: 3.6,
    w: 11.5,
    h: 1.8,
    fontSize: 40,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addText("The active memory companion for WAEC & JAMB students — on WhatsApp.", {
    x: 0.7,
    y: 5.5,
    w: 11,
    h: 0.45,
    fontSize: 16,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  s.addText("Live · https://reca-study-companion.vercel.app", {
    x: 0.7,
    y: 6.1,
    w: 11,
    h: 0.35,
    fontSize: 13,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  footer(s, "Reca", 1);
}

// 2 Problem
{
  const s = pptx.addSlide();
  addBg(s);
  eyebrow(s, "The problem");
  s.addText("Students study hard. Then they forget what mattered.", {
    x: 0.7,
    y: 1.1,
    w: 11.5,
    h: 1.3,
    fontSize: 32,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addText(
    "Millions of Nigerian candidates prepare alone after school. They reread notes — but they don’t know what they’ve actually lost.",
    {
      x: 0.7,
      y: 2.5,
      w: 11.5,
      h: 0.9,
      fontSize: 16,
      color: COLORS.muted,
      fontFace: "Calibri",
    }
  );
  const stats = [
    ["~1.95M", "WASSCE candidates (2026 cycle)"],
    ["~2.24M", "JAMB UTME registrations"],
    ["61.5%", "credit pass incl. Eng + Maths — pressure, not certainty"],
  ];
  stats.forEach((row, i) => {
    const x = 0.7 + i * 4;
    s.addShape(pptx.shapes.RECTANGLE, {
      x,
      y: 3.7,
      w: 0.06,
      h: 1.6,
      fill: { color: COLORS.primary },
    });
    s.addText(row[0], {
      x: x + 0.25,
      y: 3.7,
      w: 3.4,
      h: 0.7,
      fontSize: 28,
      color: COLORS.ink,
      fontFace: "Georgia",
    });
    s.addText(row[1], {
      x: x + 0.25,
      y: 4.45,
      w: 3.4,
      h: 0.8,
      fontSize: 13,
      color: COLORS.muted,
      fontFace: "Calibri",
    });
  });
  footer(s, "Impact starts with retention", 2);
}

// 3 Gap
{
  const s = pptx.addSlide();
  addBg(s);
  eyebrow(s, "Why not “just use ChatGPT”?");
  s.addText("Passive memory is not enough.", {
    x: 0.7,
    y: 1.1,
    w: 11.5,
    h: 0.8,
    fontSize: 32,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.7,
    y: 2.2,
    w: 5.7,
    h: 4,
    fill: { color: COLORS.panel },
    rectRadius: 0.12,
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.9,
    y: 2.2,
    w: 5.7,
    h: 4,
    fill: { color: "1A1210" },
    rectRadius: 0.12,
  });
  s.addText("CLAUDE / CHATGPT", {
    x: 1,
    y: 2.45,
    w: 5,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  s.addText("RECA", {
    x: 7.2,
    y: 2.45,
    w: 5,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLORS.accent,
    fontFace: "Calibri",
  });
  s.addText(
    [
      { text: "Explain when you ask\n", options: { breakLine: false } },
      { text: "Remember when you return\n", options: { breakLine: false } },
      { text: "You open another app\n", options: { breakLine: false } },
      { text: "No exam-triggered follow-up", options: { breakLine: false } },
    ],
    { x: 1, y: 3, w: 5, h: 2.8, fontSize: 16, color: COLORS.ink, fontFace: "Calibri", paraSpaceAfter: 10 }
  );
  s.addText(
    "Explain → quiz → grade\nRemembers what you got wrong\nMessages you first on WhatsApp\nWAEC/JAMB-framed practice",
    { x: 7.2, y: 3, w: 5, h: 2.8, fontSize: 16, color: COLORS.ink, fontFace: "Calibri", paraSpaceAfter: 10 }
  );
  footer(s, "Active vs passive memory", 3);
}

// 4 Solution
{
  const s = pptx.addSlide();
  addBg(s);
  eyebrow(s, "The solution");
  s.addText("Reca — study companion that returns on its own.", {
    x: 0.7,
    y: 1.2,
    w: 11.5,
    h: 1.4,
    fontSize: 32,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addText(
    "A student sends a topic (or a past-question photo). Reca explains in plain exam language, asks two quick questions, grades instantly — then resurfaces weak spots unprompted.",
    {
      x: 0.7,
      y: 2.9,
      w: 11.5,
      h: 1.3,
      fontSize: 17,
      color: COLORS.muted,
      fontFace: "Calibri",
    }
  );
  s.addText("No new app. No dashboard homework. WhatsApp is already the habit.", {
    x: 0.7,
    y: 4.5,
    w: 11.5,
    h: 0.6,
    fontSize: 18,
    color: COLORS.accent,
    fontFace: "Calibri",
  });
  footer(s, "WhatsApp-native · free stack", 4);
}

// 5 Loop
{
  const s = pptx.addSlide();
  addBg(s);
  eyebrow(s, "Functionality & execution");
  s.addText("One loop. Built end-to-end.", {
    x: 0.7,
    y: 1.1,
    w: 11.5,
    h: 0.8,
    fontSize: 32,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  const steps = [
    ["01", "Capture"],
    ["02", "Explain"],
    ["03", "Quiz + grade"],
    ["HERO", "Unprompted\nresurface"],
    ["05", "Recap /\nbriefing"],
  ];
  steps.forEach((st, i) => {
    const x = 0.55 + i * 2.5;
    const hero = i === 3;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 2.3,
      w: 2.3,
      h: 2.2,
      fill: { color: COLORS.panel },
      line: hero ? { color: COLORS.accent, width: 1.5 } : { color: "222833", width: 1 },
      rectRadius: 0.1,
    });
    s.addText(st[0], {
      x,
      y: 2.55,
      w: 2.3,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: COLORS.accent,
      align: "center",
      fontFace: "Calibri",
    });
    s.addText(st[1], {
      x: x + 0.1,
      y: 3.1,
      w: 2.1,
      h: 1,
      fontSize: 15,
      bold: true,
      color: COLORS.ink,
      align: "center",
      fontFace: "Calibri",
    });
  });
  s.addText(
    "Web + WhatsApp sync · Learn / Revise / Progress · 10 subjects · photo past-question · Meta Cloud API + Gemini with preset fallback.",
    {
      x: 0.7,
      y: 4.9,
      w: 12,
      h: 0.9,
      fontSize: 14,
      color: COLORS.muted,
      fontFace: "Calibri",
    }
  );
  footer(s, "Working product, not a mock", 5);
}

// 6 AI
{
  const s = pptx.addSlide();
  addBg(s);
  eyebrow(s, "Use of AI");
  s.addText("AI that teaches — then remembers.", {
    x: 0.7,
    y: 1.1,
    w: 11.5,
    h: 0.8,
    fontSize: 32,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.7,
    y: 2.2,
    w: 5.7,
    h: 2.8,
    fill: { color: COLORS.panel },
    rectRadius: 0.12,
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.9,
    y: 2.2,
    w: 5.7,
    h: 2.8,
    fill: { color: COLORS.panel },
    rectRadius: 0.12,
  });
  s.addText("GENERATION", {
    x: 1,
    y: 2.45,
    w: 5,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  s.addText(
    "Gemini explains WAEC/JAMB topics in plain language, builds 2 practice questions, grades answers, and can read a past-question photo.",
    { x: 1, y: 3, w: 5.1, h: 1.6, fontSize: 15, color: COLORS.ink, fontFace: "Calibri" }
  );
  s.addText("MEMORY DECISION", {
    x: 7.2,
    y: 2.45,
    w: 5,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  s.addText(
    "Wrong answers schedule a follow-up. Reca decides when to return — the student doesn’t open the chat to dig it up.",
    { x: 7.2, y: 3, w: 5.1, h: 1.6, fontSize: 15, color: COLORS.ink, fontFace: "Calibri" }
  );
  s.addText(
    "Preset curriculum bank keeps the demo reliable if the model is offline. AI is the teacher; spaced recall is the product.",
    {
      x: 0.7,
      y: 5.3,
      w: 12,
      h: 0.7,
      fontSize: 14,
      color: COLORS.muted,
      fontFace: "Calibri",
    }
  );
  footer(s, "LLM + correctness-triggered memory", 6);
}

// 7 Impact
{
  const s = pptx.addSlide();
  addBg(s);
  eyebrow(s, "Impact & usefulness");
  s.addText("Built for how Nigerian students already study.", {
    x: 0.7,
    y: 1.1,
    w: 11.5,
    h: 1.1,
    fontSize: 32,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  const bullets = [
    "After-school phone habit — not an in-school laptop fantasy",
    "Zero download friction on the channel they already use",
    "Turns “I read it” into “I still know it”",
    "Free-tier stack so a pilot doesn’t require paid infra day one",
  ];
  bullets.forEach((b, i) => {
    s.addText("✓", {
      x: 0.7,
      y: 2.5 + i * 0.75,
      w: 0.45,
      h: 0.5,
      fontSize: 18,
      color: COLORS.wa,
      fontFace: "Calibri",
    });
    s.addText(b, {
      x: 1.25,
      y: 2.5 + i * 0.75,
      w: 11,
      h: 0.5,
      fontSize: 17,
      color: COLORS.ink,
      fontFace: "Calibri",
    });
  });
  footer(s, "Everyday life · exam calendar demand", 7);
}

// 8 Business
{
  const s = pptx.addSlide();
  addBg(s);
  eyebrow(s, "Business model");
  s.addText("Free for students first. Paid where schools need visibility.", {
    x: 0.7,
    y: 1.1,
    w: 12,
    h: 1.1,
    fontSize: 28,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  const biz = [
    ["FREEMIUM", "Individual students stay free — low marginal AI cost per interaction."],
    ["B2B2C", "Private schools & tutorial centres — per-student / cohort plans + teacher progress view."],
    ["SPONSORED", "Exam-prep sponsors, NGOs, or telcos subsidise public-school students."],
  ];
  biz.forEach((b, i) => {
    const x = 0.7 + i * 4.1;
    s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 2.5,
      w: 3.9,
      h: 2.6,
      fill: { color: COLORS.panel },
      rectRadius: 0.12,
    });
    s.addText(b[0], {
      x: x + 0.25,
      y: 2.75,
      w: 3.4,
      h: 0.35,
      fontSize: 12,
      bold: true,
      color: COLORS.muted,
      fontFace: "Calibri",
    });
    s.addText(b[1], {
      x: x + 0.25,
      y: 3.3,
      w: 3.4,
      h: 1.5,
      fontSize: 14,
      color: COLORS.ink,
      fontFace: "Calibri",
    });
  });
  s.addText(
    "Moat: attempt history + WhatsApp distribution + WAEC/JAMB curriculum.",
    {
      x: 0.7,
      y: 5.5,
      w: 12,
      h: 0.5,
      fontSize: 14,
      color: COLORS.muted,
      fontFace: "Calibri",
    }
  );
  footer(s, "Post-fest roadmap", 8);
}

// 9 Live
{
  const s = pptx.addSlide();
  addBg(s);
  eyebrow(s, "Live link & demo");
  s.addText("Try the product. Watch the aha.", {
    x: 0.7,
    y: 1.1,
    w: 11.5,
    h: 0.9,
    fontSize: 32,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addText(
    "Web companion (same memory loop): open Learn → ask a topic → miss one question → Reca comes back. WhatsApp is the stage hero — Reca messages first.",
    {
      x: 0.7,
      y: 2.2,
      w: 11.5,
      h: 1.1,
      fontSize: 16,
      color: COLORS.muted,
      fontFace: "Calibri",
    }
  );
  s.addText("https://reca-study-companion.vercel.app/signup.html", {
    x: 0.7,
    y: 3.6,
    w: 12,
    h: 0.5,
    fontSize: 18,
    bold: true,
    color: COLORS.primary,
    fontFace: "Calibri",
  });
  s.addText(
    "Demo script: explain photosynthesis → wrong Q1 (mitochondria) → unprompted resurface → chloroplast",
    {
      x: 0.7,
      y: 4.5,
      w: 12,
      h: 0.7,
      fontSize: 14,
      color: COLORS.muted,
      fontFace: "Calibri",
    }
  );
  footer(s, "Guest mode available", 9);
}

// 10 Team
{
  const s = pptx.addSlide();
  addBg(s);
  eyebrow(s, "The team");
  s.addText("Who built Reca.", {
    x: 0.7,
    y: 1.1,
    w: 11.5,
    h: 0.8,
    fontSize: 32,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.7,
    y: 2.2,
    w: 5.7,
    h: 2.8,
    fill: { color: COLORS.panel },
    rectRadius: 0.12,
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.9,
    y: 2.2,
    w: 5.7,
    h: 2.8,
    fill: { color: COLORS.panel },
    rectRadius: 0.12,
  });
  s.addText("PRODUCT DESIGN & UX", {
    x: 1,
    y: 2.45,
    w: 5,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  s.addText("Talodabioluwa Paul", {
    x: 1,
    y: 2.9,
    w: 5,
    h: 0.5,
    fontSize: 22,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addText("Experience, copy, flows, and the student-facing product system.", {
    x: 1,
    y: 3.55,
    w: 5.1,
    h: 1,
    fontSize: 14,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  s.addText("ENGINEERING & WHATSAPP", {
    x: 7.2,
    y: 2.45,
    w: 5,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  s.addText("Folarin Oyewole", {
    x: 7.2,
    y: 2.9,
    w: 5,
    h: 0.5,
    fontSize: 22,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addText("Backend, Meta Cloud API, memory loop, and deploy.", {
    x: 7.2,
    y: 3.55,
    w: 5.1,
    h: 1,
    fontSize: 14,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  s.addText("AI BuildFest 2026 · Track 3 · Case Study 2 · Participant ID BF-0933", {
    x: 0.7,
    y: 5.4,
    w: 12,
    h: 0.4,
    fontSize: 13,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  footer(s, "Built in two days on a free stack", 10);
}

// 11 Roadmap
{
  const s = pptx.addSlide();
  addBg(s);
  eyebrow(s, "What’s next");
  s.addText("Pilot with real students. Expand the syllabus. Keep coming first.", {
    x: 0.7,
    y: 1.1,
    w: 11.5,
    h: 1.2,
    fontSize: 28,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.7,
    y: 2.6,
    w: 5.7,
    h: 1.8,
    fill: { color: COLORS.panel },
    rectRadius: 0.12,
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.9,
    y: 2.6,
    w: 5.7,
    h: 1.8,
    fill: { color: COLORS.panel },
    rectRadius: 0.12,
  });
  s.addText("NOW", {
    x: 1,
    y: 2.85,
    w: 5,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  s.addText("Working loop on WhatsApp + web. Live link ready for judges.", {
    x: 1,
    y: 3.3,
    w: 5.1,
    h: 0.8,
    fontSize: 15,
    color: COLORS.ink,
    fontFace: "Calibri",
  });
  s.addText("NEXT 90 DAYS", {
    x: 7.2,
    y: 2.85,
    w: 5,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  s.addText("2–3 school / tutorial pilots · teacher progress view · broader WAEC coverage.", {
    x: 7.2,
    y: 3.3,
    w: 5.1,
    h: 0.8,
    fontSize: 15,
    color: COLORS.ink,
    fontFace: "Calibri",
  });
  s.addText(
    "The ask: recognition and support to pilot Reca with real students for the next WAEC/JAMB cycle.",
    {
      x: 0.7,
      y: 4.8,
      w: 12,
      h: 0.7,
      fontSize: 16,
      color: COLORS.ink,
      fontFace: "Calibri",
    }
  );
  footer(s, "Case Study 2 · AI for Everyday Life", 11);
}

// 12 Thank you
{
  const s = pptx.addSlide();
  addBg(s);
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.7,
    y: 0.55,
    w: 0.42,
    h: 0.42,
    fill: { color: COLORS.accent },
    rectRadius: 0.08,
  });
  s.addText("R", {
    x: 0.7,
    y: 0.55,
    w: 0.42,
    h: 0.42,
    fontSize: 16,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
    fontFace: "Georgia",
  });
  s.addText("Reca", {
    x: 1.25,
    y: 0.58,
    w: 3,
    h: 0.4,
    fontSize: 20,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addText("THANK YOU", {
    x: 0.7,
    y: 2.8,
    w: 12,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLORS.accent,
    fontFace: "Calibri",
  });
  s.addText("Claude waits for you.\nReca comes first.", {
    x: 0.7,
    y: 3.25,
    w: 11.5,
    h: 1.6,
    fontSize: 36,
    color: COLORS.ink,
    fontFace: "Georgia",
  });
  s.addText("https://reca-study-companion.vercel.app/signup.html", {
    x: 0.7,
    y: 5.15,
    w: 12,
    h: 0.4,
    fontSize: 16,
    color: COLORS.primary,
    fontFace: "Calibri",
  });
  s.addText("Talodabioluwa Paul · Folarin Oyewole · BF-0933", {
    x: 0.7,
    y: 5.7,
    w: 12,
    h: 0.35,
    fontSize: 13,
    color: COLORS.muted,
    fontFace: "Calibri",
  });
  footer(s, "AI BuildFest 2026", 12);
}

pptx.writeFile({ fileName: OUT }).then(() => {
  console.log("Wrote", OUT);
});
