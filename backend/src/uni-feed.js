/**
 * AI-powered university admin feed — fetch official pages, detect changes, Gemini summarize.
 * Falls back to curated static updates in data/uni-updates.js when fetch or LLM fails.
 */

const crypto = require("crypto");
const { UNI_SOURCES, sourceByUniversityId } = require("./data/uni-sources");
const uniData = require("./data/uni-updates");
const llm = require("./llm");

const FETCH_TIMEOUT_MS = Number(process.env.UNI_FEED_TIMEOUT_MS || 15000);
const MAX_PAGE_CHARS = Number(process.env.UNI_FEED_MAX_CHARS || 14000);
const USER_AGENT =
  process.env.UNI_FEED_USER_AGENT ||
  "Reca-Study-Bot/1.0 (+https://reca-study-companion.vercel.app)";

/** universityId → live update object */
const liveUpdates = new Map();
/** universityId → { contentHash, fetchedAt, fetchOk, error? } */
const sourceState = new Map();

function isEnabled() {
  return process.env.UNI_FEED_ENABLED !== "false";
}

function htmlToText(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_PAGE_CHARS);
}

function contentHash(text) {
  return crypto.createHash("sha256").update(String(text || "")).digest("hex");
}

function updateIdFor(universityId, hash) {
  return `live-${universityId}-${hash.slice(0, 12)}`;
}

async function fetchPageText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const html = await res.text();
    const text = htmlToText(html);
    if (text.length < 80) {
      throw new Error("Page text too short");
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

function buildLiveUpdate(source, summary, hash) {
  return {
    id: updateIdFor(source.universityId, hash),
    universityId: source.universityId,
    headline: summary.headline,
    detail: summary.detail,
    actionHint: summary.actionHint,
    category: summary.category || "admission",
    sourceUrl: source.url,
    source: "ai-feed",
    contentHash: hash,
    fetchedAt: Date.now(),
  };
}

/**
 * Refresh one official source. Calls Gemini only when page content hash changes.
 */
async function refreshSource(source) {
  const result = {
    universityId: source.universityId,
    name: source.shortName || source.name,
    url: source.url,
    changed: false,
    summarized: false,
    hasUpdate: false,
    error: null,
  };

  if (!isEnabled()) {
    result.error = "feed disabled";
    return result;
  }

  let pageText;
  try {
    pageText = await fetchPageText(source.url);
  } catch (err) {
    result.error = err.message || "fetch failed";
    sourceState.set(source.universityId, {
      contentHash: sourceState.get(source.universityId)?.contentHash || null,
      fetchedAt: Date.now(),
      fetchOk: false,
      error: result.error,
    });
    return result;
  }

  const hash = contentHash(pageText);
  const prev = sourceState.get(source.universityId);
  sourceState.set(source.universityId, {
    contentHash: hash,
    fetchedAt: Date.now(),
    fetchOk: true,
    error: null,
  });

  if (prev?.contentHash === hash) {
    return result;
  }

  result.changed = true;

  if (!llm.isEnabled()) {
    result.error = "GEMINI_API_KEY not set — using curated fallback only";
    return result;
  }

  const summary = await llm.summarizeUniAdmin({
    universityName: source.name,
    shortName: source.shortName || source.name,
    sourceUrl: source.url,
    pageText,
  });

  result.summarized = true;

  if (!summary?.hasUpdate) {
    return result;
  }

  result.hasUpdate = true;
  const live = buildLiveUpdate(source, summary, hash);
  liveUpdates.set(source.universityId, live);
  return result;
}

async function refreshAllSources() {
  const results = [];
  for (const source of UNI_SOURCES) {
    try {
      results.push(await refreshSource(source));
    } catch (err) {
      results.push({
        universityId: source.universityId,
        name: source.shortName || source.name,
        url: source.url,
        changed: false,
        summarized: false,
        hasUpdate: false,
        error: err.message || "refresh failed",
      });
    }
  }
  return results;
}

async function refreshForUniversity(universityId) {
  const source =
    sourceByUniversityId(universityId) || sourceByUniversityId("general-jamb");
  if (!source) return null;
  return refreshSource(source);
}

function liveUpdatesForStudent(targetUniversityId, deliveredIds = []) {
  const delivered = new Set(deliveredIds);
  const target = targetUniversityId || null;
  const out = [];

  for (const [uniId, update] of liveUpdates.entries()) {
    if (delivered.has(update.id)) continue;
    if (uniId === "general-jamb") {
      out.push(update);
      continue;
    }
    if (target && uniId === target) out.push(update);
  }

  const uniSpecific = target ? out.filter((u) => u.universityId === target) : [];
  if (uniSpecific.length) return uniSpecific;

  return out.filter((u) => u.universityId === "general-jamb");
}

/** Next update for student — AI live feed first, curated static fallback. */
function getUpdateForStudent(targetUniversityId, deliveredIds = []) {
  const live = liveUpdatesForStudent(targetUniversityId, deliveredIds);
  if (live.length) return live[0];

  let update = uniData.nextUpdateForStudent(targetUniversityId, deliveredIds);
  if (update) {
    const src = sourceByUniversityId(update.universityId);
    return {
      ...update,
      source: "curated",
      sourceUrl: src?.url || null,
    };
  }
  return null;
}

function feedStatus() {
  return {
    enabled: isEnabled(),
    llm: llm.providerLabel(),
    liveCount: liveUpdates.size,
    sources: UNI_SOURCES.map((s) => {
      const state = sourceState.get(s.universityId);
      const live = liveUpdates.get(s.universityId);
      return {
        universityId: s.universityId,
        name: s.shortName || s.name,
        url: s.url,
        lastFetched: state?.fetchedAt || null,
        fetchOk: state?.fetchOk ?? null,
        contentHash: state?.contentHash ? state.contentHash.slice(0, 12) : null,
        liveHeadline: live?.headline || null,
        error: state?.error || null,
      };
    }),
  };
}

module.exports = {
  isEnabled,
  refreshSource,
  refreshAllSources,
  refreshForUniversity,
  getUpdateForStudent,
  feedStatus,
  liveUpdates,
};
