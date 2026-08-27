/**
 * Export Reca pitch deck HTML → PDF (13 slides, 16:9)
 * Run: node docs/reca/pitch/export-pdf.js
 */
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const DIR = __dirname;
const HTML = path.join(DIR, "reca-pitch-deck.html");
const PDF = path.join(DIR, "Reca-Pitch-Deck.pdf");
const fileUrl = "file:///" + HTML.replace(/\\/g, "/");

const edgePaths = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];

function tryHeadless(browserPath) {
  if (!fs.existsSync(browserPath)) return false;
  const cmd = `"${browserPath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${PDF}" "${fileUrl}"`;
  execSync(cmd, { stdio: "pipe", timeout: 60000 });
  return fs.existsSync(PDF);
}

async function tryPuppeteer() {
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    return false;
  }
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 60000 });
  await page.pdf({
    path: PDF,
    width: "13.333in",
    height: "7.5in",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser.close();
  return fs.existsSync(PDF);
}

(async () => {
  if (!fs.existsSync(HTML)) {
    console.error("Missing", HTML);
    process.exit(1);
  }

  for (const p of edgePaths) {
    try {
      if (tryHeadless(p)) {
        console.log("Wrote", PDF, "via", path.basename(p));
        return;
      }
    } catch {
      /* next */
    }
  }

  try {
    if (await tryPuppeteer()) {
      console.log("Wrote", PDF, "via puppeteer");
      return;
    }
  } catch (e) {
    console.warn("Puppeteer failed:", e.message);
  }

  console.log("Could not auto-export PDF.");
  console.log("Open reca-pitch-deck.html in Chrome → Print → Save as PDF (13.333 × 7.5 in).");
  process.exit(1);
})();
