/**
 * Sync teen-friendly intro copy into subject-intros.js + curriculum-bank.js
 * Run: node scripts/sync-intro-explanations.js
 */
const fs = require("fs");
const path = require("path");
const TEEN = require("./teen-intro-copy");

const introsPath = path.join(__dirname, "subject-intros.js");
const bankPath = path.join(__dirname, "..", "src", "data", "curriculum-bank.js");

function setSuffix(n) {
  return ` Practice set ${n}. Same ideas, more exam-style checks.`;
}

function replaceJsonString(haystack, from, to) {
  const a = JSON.stringify(from);
  const b = JSON.stringify(to);
  if (!haystack.includes(a)) return { text: haystack, count: 0 };
  const parts = haystack.split(a);
  return { text: parts.join(b), count: parts.length - 1 };
}

function patchSubjectIntrosFile() {
  delete require.cache[require.resolve("./subject-intros")];
  const { SUBJECT_INTROS } = require("./subject-intros");
  let src = fs.readFileSync(introsPath, "utf8");
  let n = 0;
  for (const intro of SUBJECT_INTROS) {
    const neu = TEEN[intro.subject];
    if (!neu) {
      console.warn("No teen copy for", intro.subject);
      continue;
    }
    const old = intro.explanation;
    if (old === neu) continue;
    const res = replaceJsonString(src, old, neu);
    if (!res.count) {
      console.warn("Could not patch subject-intros for", intro.subject);
      continue;
    }
    src = res.text;
    n += res.count;
  }
  fs.writeFileSync(introsPath, src);
  console.log("subject-intros.js replacements:", n);
}

function patchCurriculumBank() {
  delete require.cache[require.resolve("./subject-intros")];
  const { SUBJECT_INTROS } = require("./subject-intros");
  let src = fs.readFileSync(bankPath, "utf8");
  let n = 0;

  for (const intro of SUBJECT_INTROS) {
    const neu = TEEN[intro.subject] || intro.explanation;
    // Capture current bank explanation for base title
    delete require.cache[require.resolve("../src/data/curriculum-bank")];
    const bank = require("../src/data/curriculum-bank");
    const base = (bank.topics || []).find((t) => t.title === intro.title);
    const oldBase = base?.explanation || intro.explanation;

    if (oldBase && oldBase !== neu) {
      const res = replaceJsonString(src, oldBase, neu);
      src = res.text;
      n += res.count;
    }

    for (let set = 2; set <= 12; set++) {
      const oldSet = `${oldBase || neu}${setSuffix(set)}`;
      const newSet = `${neu}${setSuffix(set)}`;
      if (oldSet === newSet) continue;
      const res = replaceJsonString(src, oldSet, newSet);
      src = res.text;
      n += res.count;
    }
  }

  fs.writeFileSync(bankPath, src);
  console.log("curriculum-bank.js replacements:", n);
}

patchSubjectIntrosFile();
patchCurriculumBank();

// Verify
delete require.cache[require.resolve("./subject-intros")];
delete require.cache[require.resolve("../src/data/curriculum-bank")];
const { SUBJECT_INTROS } = require("./subject-intros");
const bank = require("../src/data/curriculum-bank");
let ok = 0;
let miss = [];
for (const intro of SUBJECT_INTROS) {
  const t = bank.topics.find((x) => x.title === intro.title);
  const expect = TEEN[intro.subject];
  if (t && expect && t.explanation.startsWith(expect.slice(0, 40))) ok++;
  else miss.push(intro.subject);
}
console.log("Verified intros:", ok, "/", SUBJECT_INTROS.length);
if (miss.length) console.warn("Miss:", miss.join(", "));
console.log("Done.");
