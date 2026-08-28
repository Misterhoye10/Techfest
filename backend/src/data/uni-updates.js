/**
 * Curated Nigerian university admin updates for proactive AI drops.
 * Verify deadlines on each school's official portal — Reca surfaces reminders, not live feeds.
 */

const UNIVERSITIES = [
  { id: "general-jamb", name: "JAMB & general admission", shortName: "JAMB" },
  { id: "unilag", name: "University of Lagos (UNILAG)", shortName: "UNILAG" },
  { id: "ui", name: "University of Ibadan (UI)", shortName: "UI" },
  { id: "oau", name: "Obafemi Awolowo University (OAU)", shortName: "OAU" },
  { id: "abu", name: "Ahmadu Bello University (ABU)", shortName: "ABU" },
  { id: "uniben", name: "University of Benin (UNIBEN)", shortName: "UNIBEN" },
  { id: "lasu", name: "Lagos State University (LASU)", shortName: "LASU" },
  { id: "futa", name: "Federal University of Technology, Akure (FUTA)", shortName: "FUTA" },
];

const UPDATES = [
  {
    id: "jamb-2026-deadline",
    universityId: "general-jamb",
    category: "admission",
    headline: "JAMB UTME registration — confirm before payment",
    detail:
      "JAMB 2026/2027 registration is open. Match your NIN to your profile, pick the right subject combo, and choose your exam town before you pay.",
    actionHint: "Wrong subject combo is the #1 fix-later mistake — check your intended course first.",
  },
  {
    id: "jamb-result-check",
    universityId: "general-jamb",
    category: "results",
    headline: "JAMB result slip ready",
    detail:
      "When your UTME result is out, download your official slip from the JAMB portal. You'll need it for POST-UTME screening at most federal universities.",
    actionHint: "Save a PDF copy — don't rely on screenshots alone.",
  },
  {
    id: "unilag-post-utme-2026",
    universityId: "unilag",
    category: "screening",
    headline: "UNILAG POST-UTME screening opens",
    detail:
      "University of Lagos POST-UTME form is live. Screening is usually online — pay only on the official UNILAG admissions portal.",
    actionHint: "Check the cut-off for your course before you apply; med/law differ from arts cut-offs.",
  },
  {
    id: "unilag-admission-list",
    universityId: "unilag",
    category: "admission",
    headline: "UNILAG admission list — merit & supplementary",
    detail:
      "UNILAG publishes merit and supplementary lists in batches. If your name isn't on merit, watch for supplementary — and accept on CAPS within the deadline.",
    actionHint: "Accept or reject on JAMB CAPS before the window closes.",
  },
  {
    id: "ui-post-utme-2026",
    universityId: "ui",
    category: "screening",
    headline: "UI POST-UTME registration",
    detail:
      "University of Ibadan screening form is open. UI often weights O'level + UTME — confirm your O'level subjects match UI requirements for your course.",
    actionHint: "UI is strict on subject combos — verify on the faculty page before paying.",
  },
  {
    id: "oau-oau-2026",
    universityId: "oau",
    category: "screening",
    headline: "OAU POST-UTME / screening",
    detail:
      "Obafemi Awolowo University screening registration is active. Use only the official OAU admissions site — ignore payment links from random WhatsApp groups.",
    actionHint: "Join only official OAU student channels for date announcements.",
  },
  {
    id: "abu-zaria-screening",
    universityId: "abu",
    category: "screening",
    headline: "ABU Zaria screening form",
    detail:
      "Ahmadu Bello University POST-UTME form is out. Northern applicants: confirm your UTME score meets the departmental cut-off before payment.",
    actionHint: "ABU publishes cut-offs by faculty — search your department, not just the general page.",
  },
  {
    id: "uniben-post-utme",
    universityId: "uniben",
    category: "screening",
    headline: "UNIBEN POST-UTME registration",
    detail:
      "University of Benin screening is open. Medical and engineering courses often have higher UTME floors — check UNIBEN's published cut-off matrix.",
    actionHint: "If you're borderline, have a backup on CAPS before the deadline.",
  },
  {
    id: "lasu-ace-screening",
    universityId: "lasu",
    category: "screening",
    headline: "LASU screening / ACE form",
    detail:
      "Lagos State University screening registration is live. LASU and some state schools run ACE alongside POST-UTME — read which applies to your course.",
    actionHint: "State schools move fast on deadlines — set a phone reminder for the closing date.",
  },
  {
    id: "futa-post-utme",
    universityId: "futa",
    category: "screening",
    headline: "FUTA POST-UTME registration",
    detail:
      "Federal University of Technology, Akure screening form is open. Tech courses need Maths + Physics + Chemistry for most engineering paths.",
    actionHint: "Cross-check JAMB subject combo against FUTA's faculty requirements.",
  },
  {
    id: "caps-acceptance-deadline",
    universityId: "general-jamb",
    category: "deadline",
    headline: "JAMB CAPS — accept your admission",
    detail:
      "If a school offered you admission on CAPS, accept or reject before the deadline. No acceptance = no clearance, even if your name is on the school list.",
    actionHint: "One acceptance at a time on CAPS — pick your firm choice, then upload documents at the school.",
  },
];

function universityById(id) {
  return UNIVERSITIES.find((u) => u.id === id) || null;
}

function updatesForStudent(targetUniversityId, deliveredIds = []) {
  const delivered = new Set(deliveredIds);
  const target = targetUniversityId || null;

  const relevant = UPDATES.filter((u) => {
    if (delivered.has(u.id)) return false;
    if (u.universityId === "general-jamb") return true;
    return target && u.universityId === target;
  });

  const uniSpecific = target
    ? relevant.filter((u) => u.universityId === target)
    : [];
  if (uniSpecific.length) return uniSpecific;

  return relevant.filter((u) => u.universityId === "general-jamb");
}

function nextUpdateForStudent(targetUniversityId, deliveredIds = []) {
  const list = updatesForStudent(targetUniversityId, deliveredIds);
  return list[0] || null;
}

module.exports = {
  UNIVERSITIES,
  UPDATES,
  universityById,
  updatesForStudent,
  nextUpdateForStudent,
};
