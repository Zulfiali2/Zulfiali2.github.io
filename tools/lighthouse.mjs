// Runs Google Lighthouse (desktop) on every project in data.js and writes scores.json
// Runs on GitHub Actions after the screenshots. Keeps the previous score if a site fails this time.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { chromium } from "playwright";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import desktopConfig from "lighthouse/core/config/desktop-config.js";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data.js"), "utf8"), ctx);
const { projects } = ctx.window.PORTFOLIO;
const slug = (u) => u.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();

const outFile = path.join(root, "scores.json");
let scores = {};
try { scores = JSON.parse(fs.readFileSync(outFile, "utf8")); } catch {}

const chrome = await chromeLauncher.launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

const pct = (c) => (c && c.score != null ? Math.round(c.score * 100) : null);
let ok = 0;
for (const p of projects) {
  const key = slug(p.url);
  try {
    const run = await lighthouse(p.url, { port: chrome.port, output: "json", logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"] }, desktopConfig);
    const lhr = run.lhr;
    if (lhr.runtimeError) throw new Error(lhr.runtimeError.message);
    const c = lhr.categories;
    scores[key] = {
      performance: pct(c.performance), accessibility: pct(c.accessibility),
      bestPractices: pct(c["best-practices"]), seo: pct(c.seo),
      lcp: lhr.audits["largest-contentful-paint"]?.displayValue || null,
      tested: new Date().toISOString().slice(0, 10),
    };
    ok++;
    console.log("✓", p.name, JSON.stringify(scores[key]));
  } catch (e) {
    console.log("✗", p.name, "-", String(e.message).split("\n")[0]);
  }
}
await chrome.kill();

// drop scores for projects no longer in data.js
const keep = new Set(projects.map((p) => slug(p.url)));
for (const k of Object.keys(scores)) if (!keep.has(k)) delete scores[k];

fs.writeFileSync(outFile, JSON.stringify(scores, null, 2) + "\n");
console.log(`${ok}/${projects.length} sites scored`);
