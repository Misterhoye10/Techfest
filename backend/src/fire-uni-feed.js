/**
 * CLI: refresh AI university feed from official sources
 * Usage: npm run uni-feed -- [universityId]
 * Set DEMO_SECRET in .env to match the server.
 */
require("dotenv").config();
const universityId = process.argv[2] || "";

const base = process.env.RECA_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
const secret = process.env.DEMO_SECRET || process.env.ADMIN_KEY || "";
const headers = { "Content-Type": "application/json" };
if (secret) headers["x-demo-secret"] = secret;

fetch(`${base}/demo/uni-feed-refresh`, {
  method: "POST",
  headers,
  body: JSON.stringify(universityId ? { universityId } : {}),
})
  .then((r) => r.json())
  .then((j) => {
    console.log(JSON.stringify(j, null, 2));
    if (!j.ok) process.exit(1);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
