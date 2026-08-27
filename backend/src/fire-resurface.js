/**
 * CLI: fire resurface for a phone (demo backup)
 * Usage: npm run resurface -- +2348012345678
 * Set DEMO_SECRET in .env to match the server.
 */
require("dotenv").config();
const phone = process.argv[2];
if (!phone) {
  console.error("Usage: npm run resurface -- +234...");
  process.exit(1);
}

const base = process.env.RECA_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
const secret = process.env.DEMO_SECRET || process.env.ADMIN_KEY || "";
const headers = { "Content-Type": "application/json" };
if (secret) headers["x-demo-secret"] = secret;

fetch(`${base}/demo/resurface`, {
  method: "POST",
  headers,
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
