/**
 * Official admission source URLs for AI feed refresh.
 * Reca fetches these pages, detects changes, and summarizes with Gemini.
 */

const UNI_SOURCES = [
  {
    universityId: "general-jamb",
    name: "JAMB",
    shortName: "JAMB",
    url: "https://www.jamb.gov.ng/",
  },
  {
    universityId: "unilag",
    name: "University of Lagos (UNILAG)",
    shortName: "UNILAG",
    url: "https://unilag.edu.ng/",
  },
  {
    universityId: "ui",
    name: "University of Ibadan (UI)",
    shortName: "UI",
    url: "https://www.ui.edu.ng/",
  },
  {
    universityId: "oau",
    name: "Obafemi Awolowo University (OAU)",
    shortName: "OAU",
    url: "https://oauife.edu.ng/",
  },
  {
    universityId: "abu",
    name: "Ahmadu Bello University (ABU)",
    shortName: "ABU",
    url: "https://abu.edu.ng/",
  },
  {
    universityId: "uniben",
    name: "University of Benin (UNIBEN)",
    shortName: "UNIBEN",
    url: "https://uniben.edu.ng/",
  },
  {
    universityId: "lasu",
    name: "Lagos State University (LASU)",
    shortName: "LASU",
    url: "https://lasu.edu.ng/",
  },
  {
    universityId: "futa",
    name: "Federal University of Technology, Akure (FUTA)",
    shortName: "FUTA",
    url: "https://futa.edu.ng/",
  },
];

function sourceByUniversityId(id) {
  return UNI_SOURCES.find((s) => s.universityId === id) || null;
}

module.exports = { UNI_SOURCES, sourceByUniversityId };
