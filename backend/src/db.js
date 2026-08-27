/**
 * Shared Supabase Postgres (DATABASE_URL).
 * Phone is the student unique ID across web + WhatsApp.
 * Never expose DATABASE_URL to the browser.
 */

const { Pool } = require("pg");

let pool = null;
let ready = false;
let initPromise = null;

function databaseUrl() {
  return String(process.env.DATABASE_URL || "").trim();
}

function isEnabled() {
  return Boolean(databaseUrl());
}

function getPool() {
  if (!isEnabled()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl(),
      ssl: { rejectUnauthorized: false },
      max: 4,
    });
    pool.on("error", (err) => {
      console.error("Postgres pool error:", err.message);
    });
  }
  return pool;
}

/** Digits only — matches Render /api/send-alert body style */
function phoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "");
}

async function ensureSchema() {
  const p = getPool();
  if (!p) return false;
  if (ready) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await p.query(`
      CREATE TABLE IF NOT EXISTS students (
        phone TEXT PRIMARY KEY,
        name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    ready = true;
    console.log("Supabase: students table ready");
    return true;
  })().catch((err) => {
    initPromise = null;
    console.error("Supabase schema init failed:", err.message);
    throw err;
  });

  return initPromise;
}

/**
 * Upsert student by WhatsApp phone (unique ID).
 * Stores digits without + so WhatsApp backend + web share the same key.
 */
async function upsertStudent({ phone, name }) {
  if (!isEnabled()) return { ok: false, skipped: true, reason: "no DATABASE_URL" };

  const digits = phoneDigits(phone);
  if (!digits || digits.length < 10) {
    const err = new Error("Invalid phone for database");
    err.status = 400;
    throw err;
  }

  await ensureSchema();
  const p = getPool();
  const displayName = String(name || "").trim().slice(0, 80) || null;

  const result = await p.query(
    `INSERT INTO students (phone, name, created_at, updated_at)
     VALUES ($1, $2, NOW(), NOW())
     ON CONFLICT (phone) DO UPDATE SET
       name = COALESCE(EXCLUDED.name, students.name),
       updated_at = NOW()
     RETURNING phone, name, created_at, updated_at`,
    [digits, displayName]
  );

  return { ok: true, student: result.rows[0] };
}

async function getStudentByPhone(phone) {
  if (!isEnabled()) return null;
  const digits = phoneDigits(phone);
  if (!digits) return null;
  await ensureSchema();
  const p = getPool();
  const result = await p.query(
    `SELECT phone, name, created_at, updated_at FROM students WHERE phone = $1`,
    [digits]
  );
  return result.rows[0] || null;
}

async function ping() {
  if (!isEnabled()) return { ok: false, configured: false };
  try {
    const p = getPool();
    await p.query("SELECT 1");
    return { ok: true, configured: true };
  } catch (err) {
    return { ok: false, configured: true, error: err.message };
  }
}

module.exports = {
  isEnabled,
  upsertStudent,
  getStudentByPhone,
  phoneDigits,
  ping,
  ensureSchema,
};
