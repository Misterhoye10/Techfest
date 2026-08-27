/**
 * Reca pitch deck — PPTX export (15 slides)
 * Run: node docs/reca/pitch/generate-pptx.js
 */
const path = require("path");
const PptxGenJS = require("pptxgenjs");

const OUT = path.join(__dirname, "Reca-Pitch-Deck.pptx");
const TOTAL = 15;

const C = {
  bg: "07090F",
  ink: "F6F4F1",
  muted: "8E96A8",
  primary: "225AEB",
  accent: "FB735B",
  panel: "0F131C",
  wa: "25D366",
  line: "1E2433",
};

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "WIDE", width: 13.333, height: 7.5 });
pptx.layout = "WIDE";
pptx.author = "Reca";
pptx.title = "Reca — AI BuildFest 2026";

function bg(slide) {
  slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: C.bg } });
}

function chrome(slide, badge) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.65,
    y: 0.45,
    w: 0.38,
    h: 0.38,
    fill: { color: C.accent },
    rectRadius: 0.08,
  });
  slide.addText("R", {
    x: 0.65,
    y: 0.45,
    w: 0.38,
    h: 0.38,
    fontSize: 14,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
    fontFace: "Georgia",
  });
  slide.addText("Reca", {
    x: 1.12,
    y: 0.48,
    w: 2,
    h: 0.35,
    fontSize: 18,
    color: C.ink,
    fontFace: "Georgia",
  });
  slide.addText(badge, {
    x: 8.5,
    y: 0.5,
    w: 4.15,
    h: 0.3,
    fontSize: 9,
    bold: true,
    color: C.muted,
    fontFace: "Calibri",
    align: "right",
  });
}

function foot(slide, left, num) {
  slide.addShape(pptx.shapes.LINE, {
    x: 0.65,
    y: 6.85,
    w: 12,
    h: 0,
    line: { color: C.line, width: 0.75 },
  });
  slide.addText(left.toUpperCase(), {
    x: 0.65,
    y: 6.95,
    w: 8,
    h: 0.28,
    fontSize: 8,
    bold: true,
    color: C.muted,
    fontFace: "Calibri",
    charSpacing: 1,
  });
  slide.addText(`${String(num).padStart(2, "0")} / ${TOTAL}`, {
    x: 11.4,
    y: 6.95,
    w: 1.3,
    h: 0.28,
    fontSize: 8,
    bold: true,
    color: C.muted,
    fontFace: "Calibri",
    align: "right",
  });
}

function eyebrow(slide, text, y = 1.05) {
  slide.addText(text.toUpperCase(), {
    x: 0.65,
    y,
    w: 12,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.accent,
    fontFace: "Calibri",
    charSpacing: 2,
  });
}

function headline(slide, text, y = 1.4, size = 30) {
  slide.addText(text, {
    x: 0.65,
    y,
    w: 11.8,
    h: 1.35,
    fontSize: size,
    color: C.ink,
    fontFace: "Georgia",
  });
}

function body(slide, text, y, w = 11.8, size = 14) {
  slide.addText(text, {
    x: 0.65,
    y,
    w,
    h: 1.4,
    fontSize: size,
    color: C.muted,
    fontFace: "Calibri",
    lineSpacingMultiple: 1.15,
  });
}

function panel(slide, x, y, w, h, accent = false) {
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: accent ? "1A1210" : C.panel },
    line: accent ? { color: C.accent, width: 1.25 } : { color: C.line, width: 0.75 },
    rectRadius: 0.12,
  });
}

// 1 Cover
{
  const s = pptx.addSlide();
  bg(s);
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.15,
    y: 1.55,
    w: 1.05,
    h: 1.05,
    fill: { color: C.accent },
    rectRadius: 0.2,
  });
  s.addText("R", {
    x: 6.15,
    y: 1.55,
    w: 1.05,
    h: 1.05,
    fontSize: 36,
    color: "FFFFFF",
    align: "center",
    valign: "middle",
    fontFace: "Georgia",
  });
  s.addText("Reca", {
    x: 0.65,
    y: 2.85,
    w: 12,
    h: 0.9,
    fontSize: 52,
    color: C.ink,
    fontFace: "Georgia",
    align: "center",
  });
  s.addText(
    "An AI-powered WAEC/JAMB study companion — active AI memory, not another chatbot that waits.",
    {
      x: 1.5,
      y: 3.85,
      w: 10.3,
      h: 1.1,
      fontSize: 18,
      color: C.muted,
      fontFace: "Calibri",
      align: "center",
      lineSpacingMultiple: 1.2,
    }
  );
  s.addText("Track 3 · AI for Everyday Life · Case Study 2", {
    x: 0.65,
    y: 5.2,
    w: 12,
    h: 0.35,
    fontSize: 12,
    color: C.muted,
    fontFace: "Calibri",
    align: "center",
  });
  s.addText("Talodabioluwa Paul · Folarin Oyewole · BF-0933", {
    x: 0.65,
    y: 5.6,
    w: 12,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: C.ink,
    fontFace: "Calibri",
    align: "center",
  });
  s.addText("reca-study-companion.vercel.app", {
    x: 0.65,
    y: 6.0,
    w: 12,
    h: 0.35,
    fontSize: 11,
    color: C.primary,
    fontFace: "Calibri",
    align: "center",
  });
  foot(s, "Submission deck", 1);
}

// 2 Hook
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "PITCH HOOK");
  eyebrow(s, "The difference in one line", 2.85);
  headline(s, "ChatGPT waits.\nReca comes first.", 3.25, 38);
  body(s, "WhatsApp-native · explain → quiz → grade → unprompted resurface · live product", 5.05, 10, 14);
  foot(s, "Reca · Study companions", 2);
}

// 3 Persona
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "USER PERSONA");
  eyebrow(s, "Who we built for");
  headline(s, "After-school study on\ntheir own phone.", 1.35, 28);
  panel(s, 0.65, 2.55, 5.95, 3.85, true);
  panel(s, 6.75, 2.55, 5.95, 3.85);
  s.addText("PRIMARY · DEMO PERSONA", {
    x: 0.95,
    y: 2.8,
    w: 5,
    h: 0.3,
    fontSize: 9,
    bold: true,
    color: C.accent,
    fontFace: "Calibri",
  });
  s.addText("Chiamaka", {
    x: 0.95,
    y: 3.15,
    w: 5,
    h: 0.45,
    fontSize: 22,
    color: C.ink,
    fontFace: "Georgia",
  });
  s.addText("SS3 · 17 · WASSCE · Lagos", {
    x: 0.95,
    y: 3.65,
    w: 5.2,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: C.primary,
    fontFace: "Calibri",
  });
  s.addText(
    "Public school. Studies after school on WhatsApp.\nGoal: 5 credits incl. English & Maths.\nFrustration: can't tell what's actually sticking.",
    { x: 0.95, y: 4.05, w: 5.2, h: 1.2, fontSize: 11, color: C.muted, fontFace: "Calibri", paraSpaceAfter: 6 }
  );
  s.addText(
    "\"I read it and it makes sense — but past questions, I freeze.\"",
    { x: 0.95, y: 5.35, w: 5.2, h: 0.7, fontSize: 11, italic: true, color: C.ink, fontFace: "Georgia" }
  );
  s.addText("SECONDARY PERSONA", {
    x: 7.05,
    y: 2.8,
    w: 5,
    h: 0.3,
    fontSize: 9,
    bold: true,
    color: C.primary,
    fontFace: "Calibri",
  });
  s.addText("Tobi", {
    x: 7.05,
    y: 3.15,
    w: 5,
    h: 0.45,
    fontSize: 22,
    color: C.ink,
    fontFace: "Georgia",
  });
  s.addText("19 · JAMB repeat · part-time work", {
    x: 7.05,
    y: 3.65,
    w: 5.2,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: C.primary,
    fontFace: "Calibri",
  });
  s.addText(
    "Retaking UTME alone — no teacher to ask.\nGoal: raise score for Computer Science.\nFrustration: loses track of weak subjects.",
    { x: 7.05, y: 4.05, w: 5.2, h: 1.2, fontSize: 11, color: C.muted, fontFace: "Calibri", paraSpaceAfter: 6 }
  );
  s.addText(
    "\"By the time I return to a topic, I've forgotten half of it.\"",
    { x: 7.05, y: 5.35, w: 5.2, h: 0.7, fontSize: 11, italic: true, color: C.ink, fontFace: "Georgia" }
  );
  foot(s, "Out-of-school · personal phone", 3);
}

// 4 Problem
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "PROBLEM · 25% FIT");
  eyebrow(s, "The problem");
  headline(s, "Students study hard.\nThen forget what mattered.", 1.35, 28);
  body(
    s,
    "Millions of Nigerian candidates prepare alone after school. They reread notes — but they don't know what they've actually lost until exam day.",
    2.95,
    6.2,
    13
  );
  const stats = [
    ["~1.95M", "WASSCE candidates — 2026 cycle"],
    ["~2.24M", "JAMB UTME registrations"],
    ["61.5%", "Credit pass incl. Eng + Maths"],
  ];
  stats.forEach((row, i) => {
    const y = 1.35 + i * 1.55;
    panel(s, 7.1, y, 5.55, 1.35);
    s.addShape(pptx.shapes.RECTANGLE, {
      x: 7.1,
      y,
      w: 0.07,
      h: 1.35,
      fill: { color: i === 2 ? C.accent : C.primary },
    });
    s.addText(row[0], {
      x: 7.35,
      y: y + 0.2,
      w: 5,
      h: 0.55,
      fontSize: 24,
      color: C.ink,
      fontFace: "Georgia",
    });
    s.addText(row[1], {
      x: 7.35,
      y: y + 0.75,
      w: 5.1,
      h: 0.45,
      fontSize: 11,
      color: C.muted,
      fontFace: "Calibri",
    });
  });
  foot(s, "Retention is the gap", 4);
}

// 5 Gap
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "INNOVATION · 20%");
  eyebrow(s, "Why not just use ChatGPT?");
  headline(s, "Passive memory is not enough.", 1.35, 30);
  panel(s, 0.65, 2.35, 5.95, 3.85);
  panel(s, 6.75, 2.35, 5.95, 3.85, true);
  s.addText("CHATGPT / CLAUDE", {
    x: 0.95,
    y: 2.65,
    w: 5,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.muted,
    fontFace: "Calibri",
  });
  s.addText("RECA", {
    x: 7.05,
    y: 2.65,
    w: 5,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.accent,
    fontFace: "Calibri",
  });
  s.addText(
    "• Explain when you ask\n• Remember when you return\n• You open another app\n• No exam-triggered follow-up",
    { x: 0.95, y: 3.15, w: 5.3, h: 2.8, fontSize: 14, color: C.ink, fontFace: "Calibri", paraSpaceAfter: 8 }
  );
  s.addText(
    "• Explain → quiz → grade\n• Remembers wrong answers\n• Messages you first on WhatsApp\n• WAEC/JAMB-framed practice",
    { x: 7.05, y: 3.15, w: 5.3, h: 2.8, fontSize: 14, color: C.ink, fontFace: "Calibri", paraSpaceAfter: 8 }
  );
  foot(s, "Active vs passive memory", 5);
}

// 6 Solution
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "SOLUTION");
  eyebrow(s, "The solution");
  headline(s, "Study companion that\nreturns on its own.", 1.35, 28);
  body(
    s,
    "Student sends a topic or past-question photo. Reca explains, quizzes, grades — then resurfaces weak spots unprompted. No new app. WhatsApp is the habit.",
    2.95,
    6.3,
    13
  );
  panel(s, 7.2, 2.2, 5.45, 4.2);
  s.addText("RECA · UNPROMPTED", {
    x: 7.45,
    y: 2.45,
    w: 5,
    h: 0.3,
    fontSize: 9,
    bold: true,
    color: C.wa,
    fontFace: "Calibri",
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.45,
    y: 2.95,
    w: 4.8,
    h: 0.55,
    fill: { color: "005C4B" },
    rectRadius: 0.08,
  });
  s.addText("Explain photosynthesis", {
    x: 7.55,
    y: 3.05,
    w: 4.5,
    h: 0.35,
    fontSize: 10,
    color: "E9EDEF",
    fontFace: "Calibri",
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.45,
    y: 3.65,
    w: 4.8,
    h: 0.75,
    fill: { color: "1F2C34" },
    rectRadius: 0.08,
  });
  s.addText("Quick check — where does the light reaction happen?", {
    x: 7.55,
    y: 3.78,
    w: 4.5,
    h: 0.5,
    fontSize: 10,
    color: "E9EDEF",
    fontFace: "Calibri",
  });
  s.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.45,
    y: 4.55,
    w: 4.8,
    h: 0.85,
    fill: { color: "1A2744" },
    line: { color: C.accent, width: 1 },
    rectRadius: 0.08,
  });
  s.addText("RECA COMES FIRST", {
    x: 7.55,
    y: 4.65,
    w: 4.5,
    h: 0.25,
    fontSize: 8,
    bold: true,
    color: C.accent,
    fontFace: "Calibri",
  });
  s.addText("Chloroplast — let's lock this in.", {
    x: 7.55,
    y: 4.95,
    w: 4.5,
    h: 0.35,
    fontSize: 10,
    color: "E9EDEF",
    fontFace: "Calibri",
  });
  foot(s, "WhatsApp-native · zero download", 6);
}

// 7 Loop
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "EXECUTION · 10%");
  eyebrow(s, "Functionality");
  headline(s, "One loop. Built end-to-end.", 1.35, 30);
  const steps = [
    ["01", "Capture"],
    ["02", "Explain"],
    ["03", "Quiz + grade"],
    ["★", "Resurface"],
    ["05", "Briefing"],
  ];
  steps.forEach((st, i) => {
    const x = 0.55 + i * 2.5;
    const hero = i === 3;
    s.addShape(pptx.shapes.OVAL, {
      x: x + 0.65,
      y: 2.85,
      w: hero ? 1.15 : 0.95,
      h: hero ? 1.15 : 0.95,
      fill: { color: hero ? "2A1814" : C.panel },
      line: { color: hero ? C.accent : C.line, width: hero ? 1.5 : 0.75 },
    });
    s.addText(st[0], {
      x: x + 0.65,
      y: 2.85,
      w: hero ? 1.15 : 0.95,
      h: hero ? 1.15 : 0.95,
      fontSize: hero ? 14 : 10,
      bold: true,
      color: hero ? C.accent : C.muted,
      align: "center",
      valign: "middle",
      fontFace: "Calibri",
    });
    s.addText(st[1], {
      x: x + 0.15,
      y: 4.15,
      w: 2.1,
      h: 0.55,
      fontSize: 12,
      bold: hero,
      color: C.ink,
      align: "center",
      fontFace: "Calibri",
    });
  });
  body(
    s,
    "Web + WhatsApp sync · Learn / Revise / Progress · 10 subjects · photo past-questions · preset fallback · shipped and live.",
    5.0,
    12,
    12
  );
  foot(s, "Working product — not a mock", 7);
}

// 8 AI
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "AI SOLUTION");
  eyebrow(s, "Use of AI");
  headline(s, "AI that teaches — then remembers.", 1.35, 30);
  panel(s, 0.65, 2.35, 5.95, 2.65);
  panel(s, 6.75, 2.35, 5.95, 2.65, true);
  s.addText("GENERATION", {
    x: 0.95,
    y: 2.65,
    w: 5,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.muted,
    fontFace: "Calibri",
  });
  s.addText("MEMORY DECISION", {
    x: 7.05,
    y: 2.65,
    w: 5,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.accent,
    fontFace: "Calibri",
  });
  s.addText(
    "Gemini explains WAEC/JAMB topics, builds 2 practice questions, grades answers, reads past-question photos.",
    { x: 0.95, y: 3.1, w: 5.3, h: 1.6, fontSize: 13, color: C.ink, fontFace: "Calibri" }
  );
  s.addText(
    "Wrong answers schedule follow-up. Reca decides when to return — student doesn't open chat to dig it up.",
    { x: 7.05, y: 3.1, w: 5.3, h: 1.6, fontSize: 13, color: C.ink, fontFace: "Calibri" }
  );
  body(
    s,
    "Preset curriculum bank keeps demo reliable offline. AI is the teacher; spaced recall is the product.",
    5.35,
    12,
    12
  );
  foot(s, "LLM + correctness-triggered memory", 8);
}

// 9 Tools
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "TOOLS USED · REQUIRED");
  eyebrow(s, "Build stack");
  headline(s, "What we built Reca with.", 1.35, 30);
  const tools = [
    ["MESSAGING", "Meta Business Suite", "WhatsApp Cloud API — OTP + unprompted resurface."],
    ["AI", "Google Gemini", "Explain, quiz, grade, photo past-questions."],
    ["BUILD AGENT", "Antigravity", "Scaffolding and shipping the product loop."],
    ["IDE", "Cursor", "UX polish, security harden, deck and handoff."],
  ];
  tools.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.65 + col * 6.2;
    const y = 2.35 + row * 2.05;
    panel(s, x, y, 5.95, 1.85);
    s.addText(t[0], {
      x: x + 0.3,
      y: y + 0.25,
      w: 5.3,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: C.primary,
      fontFace: "Calibri",
    });
    s.addText(t[1], {
      x: x + 0.3,
      y: y + 0.55,
      w: 5.3,
      h: 0.45,
      fontSize: 18,
      color: C.ink,
      fontFace: "Georgia",
    });
    s.addText(t[2], {
      x: x + 0.3,
      y: y + 1.05,
      w: 5.3,
      h: 0.55,
      fontSize: 11,
      color: C.muted,
      fontFace: "Calibri",
    });
  });
  foot(s, "Portal checklist complete", 9);
}

// 10 Impact
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "USEFULNESS · 25%");
  eyebrow(s, "Business impact");
  headline(s, "Built for how Nigerian\nstudents already study.", 1.35, 28);
  const bullets = [
    "After-school phone habit — not an in-school laptop fantasy",
    "Zero download friction on the channel they already use",
    "Turns \"I read it\" into \"I still know it\"",
    "Free-tier stack — pilot without paid infra day one",
  ];
  bullets.forEach((b, i) => {
    s.addShape(pptx.shapes.OVAL, {
      x: 0.65,
      y: 3.05 + i * 0.72,
      w: 0.35,
      h: 0.35,
      fill: { color: "1A3D28" },
      line: { color: C.wa, width: 0.75 },
    });
    s.addText("✓", {
      x: 0.65,
      y: 3.05 + i * 0.72,
      w: 0.35,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: C.wa,
      align: "center",
      valign: "middle",
      fontFace: "Calibri",
    });
    s.addText(b, {
      x: 1.15,
      y: 3.05 + i * 0.72,
      w: 11,
      h: 0.55,
      fontSize: 14,
      color: C.ink,
      fontFace: "Calibri",
    });
  });
  foot(s, "Everyday life · exam calendar demand", 10);
}

// 11 Business
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "BUSINESS MODEL");
  eyebrow(s, "Sustainability");
  headline(s, "Free for students.\nPaid where schools need visibility.", 1.35, 26);
  const biz = [
    ["FREEMIUM", "Students stay free — low marginal AI cost."],
    ["B2B2C", "Schools & tutorials — cohort plans + teacher view."],
    ["SPONSORED", "NGOs, telcos, brands subsidise public-school access."],
  ];
  biz.forEach((b, i) => {
    const x = 0.65 + i * 4.1;
    panel(s, x, 2.75, 3.95, 2.35);
    s.addText(b[0], {
      x: x + 0.25,
      y: 3.0,
      w: 3.4,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: C.muted,
      fontFace: "Calibri",
    });
    s.addText(b[1], {
      x: x + 0.25,
      y: 3.45,
      w: 3.4,
      h: 1.4,
      fontSize: 13,
      color: C.ink,
      fontFace: "Calibri",
    });
  });
  body(
    s,
    "Moat: attempt history + WhatsApp distribution + WAEC/JAMB curriculum — not another generic chat.",
    5.45,
    12,
    12
  );
  foot(s, "Post-fest roadmap", 11);
}

// 12 Live
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "LIVE DEMO");
  eyebrow(s, "Try it now");
  headline(s, "Watch the aha moment.", 1.35, 32);
  body(
    s,
    "Web companion runs the same memory loop. WhatsApp is the stage hero — Reca messages first.",
    2.35,
    11,
    14
  );
  panel(s, 0.65, 3.15, 8.5, 2.1);
  s.addText("https://reca-study-companion.vercel.app/signup.html", {
    x: 0.95,
    y: 3.55,
    w: 8,
    h: 0.45,
    fontSize: 16,
    bold: true,
    color: C.primary,
    fontFace: "Calibri",
  });
  s.addText(
    "Demo: explain photosynthesis → wrong Q1 → unprompted resurface → chloroplast. Guest mode available.",
    { x: 0.95, y: 4.15, w: 7.8, h: 0.8, fontSize: 11, color: C.muted, fontFace: "Calibri" }
  );
  foot(s, "GitHub · github.com/Misterhoye10/Techfest", 12);
}

// 13 Team
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "THE TEAM");
  eyebrow(s, "Built in two days");
  headline(s, "Who built Reca.", 1.35, 32);
  panel(s, 0.65, 2.35, 5.95, 2.75);
  panel(s, 6.75, 2.35, 5.95, 2.75);
  s.addText("PRODUCT DESIGN & UX", {
    x: 0.95,
    y: 2.65,
    w: 5,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.muted,
    fontFace: "Calibri",
  });
  s.addText("Talodabioluwa Paul", {
    x: 0.95,
    y: 3.05,
    w: 5,
    h: 0.5,
    fontSize: 20,
    color: C.ink,
    fontFace: "Georgia",
  });
  s.addText("Experience, copy, flows, student-facing product system.", {
    x: 0.95,
    y: 3.65,
    w: 5.2,
    h: 0.9,
    fontSize: 12,
    color: C.muted,
    fontFace: "Calibri",
  });
  s.addText("ENGINEERING & WHATSAPP", {
    x: 7.05,
    y: 2.65,
    w: 5,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.muted,
    fontFace: "Calibri",
  });
  s.addText("Folarin Oyewole", {
    x: 7.05,
    y: 3.05,
    w: 5,
    h: 0.5,
    fontSize: 20,
    color: C.ink,
    fontFace: "Georgia",
  });
  s.addText("Backend, Meta Cloud API, memory loop, deploy.", {
    x: 7.05,
    y: 3.65,
    w: 5.2,
    h: 0.9,
    fontSize: 12,
    color: C.muted,
    fontFace: "Calibri",
  });
  s.addText("Participant ID BF-0933 · Track 3 · Case Study 2", {
    x: 0.65,
    y: 5.45,
    w: 12,
    h: 0.35,
    fontSize: 11,
    color: C.muted,
    fontFace: "Calibri",
  });
  foot(s, "Design + engineering", 13);
}

// 14 Roadmap
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "WHAT'S NEXT");
  eyebrow(s, "The ask");
  headline(s, "Pilot with real students.\nKeep coming first.", 1.35, 28);
  panel(s, 0.65, 2.75, 5.95, 1.65);
  panel(s, 6.75, 2.75, 5.95, 1.65);
  s.addText("NOW", {
    x: 0.95,
    y: 3.0,
    w: 5,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.muted,
    fontFace: "Calibri",
  });
  s.addText("Working loop on WhatsApp + web. Live link ready for judges.", {
    x: 0.95,
    y: 3.45,
    w: 5.2,
    h: 0.7,
    fontSize: 13,
    color: C.ink,
    fontFace: "Calibri",
  });
  s.addText("NEXT 90 DAYS", {
    x: 7.05,
    y: 3.0,
    w: 5,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: C.muted,
    fontFace: "Calibri",
  });
  s.addText("2–3 school pilots · teacher progress view · broader WAEC coverage.", {
    x: 7.05,
    y: 3.45,
    w: 5.2,
    h: 0.7,
    fontSize: 13,
    color: C.ink,
    fontFace: "Calibri",
  });
  s.addText(
    "The ask: recognition and support to pilot Reca with real students for the next WAEC/JAMB cycle.",
    {
      x: 0.65,
      y: 4.75,
      w: 12,
      h: 0.7,
      fontSize: 14,
      color: C.ink,
      fontFace: "Calibri",
    }
  );
  foot(s, "Case Study 2 · AI for Everyday Life", 14);
}

// 15 Thank you
{
  const s = pptx.addSlide();
  bg(s);
  chrome(s, "THANK YOU · BF-0933");
  eyebrow(s, "Questions welcome", 2.95);
  headline(s, "ChatGPT waits.\nReca comes first.", 3.35, 36);
  body(
    s,
    "An AI-powered WAEC/JAMB study companion — active AI memory, not another chatbot that waits.",
    5.15,
    10,
    14
  );
  s.addText("reca-study-companion.vercel.app", {
    x: 0.65,
    y: 5.85,
    w: 8,
    h: 0.35,
    fontSize: 14,
    bold: true,
    color: C.primary,
    fontFace: "Calibri",
  });
  s.addText("Talodabioluwa Paul · Folarin Oyewole · BF-0933", {
    x: 0.65,
    y: 6.25,
    w: 8,
    h: 0.3,
    fontSize: 11,
    color: C.muted,
    fontFace: "Calibri",
  });
  foot(s, "AI BuildFest 2026", 15);
}

pptx.writeFile({ fileName: OUT }).then(() => {
  console.log("Wrote", OUT);
});
