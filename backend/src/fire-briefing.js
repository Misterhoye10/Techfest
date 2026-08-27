/**
 * CLI: fire daily briefing for a phone (demo backup)
 * Usage: npm run briefing -- +2348012345678
 */
require("dotenv").config();
const phone = process.argv[2];
if (!phone) {
  console.error("Usage: npm run briefing -- +234...");
  process.exit(1);
}

const base = process.env.RECA_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;

fetch(`${base}/demo/briefing`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phone }),
})
  .then((r) => r.json())
  .then((j) => {
    console.log(j);
    if (!j.ok) process.exit(1);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
