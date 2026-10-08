// Builds knowledge.json — the facts the "Ask about me" AI is allowed to use.
// Source of truth: data.js (+ scores.json). Runs in the GitHub Action; local: node tools/knowledge.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data.js"), "utf8"), ctx);
const D = ctx.window.PORTFOLIO, P = D.profile;
let S = {};
try { S = JSON.parse(fs.readFileSync(path.join(root, "scores.json"), "utf8")); } catch {}

const host = (u) => u.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
const slug = (u) => host(u).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
const cat = Object.fromEntries(D.categories.map((c) => [c.id, c.label]));
const STATUS = { live: "live", staging: "staging build (test domain)", building: "in progress" };

const perf = Object.values(S).map((s) => s.performance).filter((n) => n != null).sort((a, b) => a - b);
const median = perf.length ? perf[Math.floor(perf.length / 2)] : null;

const lines = [];
lines.push(`# ${P.name}`);
lines.push(`Role: ${P.role}. Location: ${P.location}. Status: ${P.available}.`);
lines.push(`Summary: ${P.summary}`);
lines.push(`Contact: email ${P.email}; WhatsApp/phone ${P.phone}; LinkedIn ${P.linkedin}; GitHub ${P.github}; CV PDF downloadable on the portfolio.`);
lines.push(`Languages: ${D.languages.join(", ")}.`);
lines.push("");
lines.push("## Experience and education");
for (const x of D.experience) lines.push(`- ${x.role}, ${x.org} (${x.when}): ${x.points.join("; ")}.`);
lines.push("");
lines.push("## Skills");
for (const g of D.skills) lines.push(`- ${g.group}: ${g.items.join(", ")}`);
lines.push("");
lines.push(`## Websites built (${D.projects.length} total, ${D.projects.filter((p) => p.status === "live").length} live)`);
if (median != null) lines.push(`Google Lighthouse desktop performance: median ${median}/100 across ${perf.length} tested sites (tested weekly).`);
for (const p of D.projects) {
  const s = S[slug(p.url)];
  let l = `- ${p.name} (${host(p.url)}) — ${cat[p.cat]}; ${STATUS[p.status]}. ${p.desc} Built with: ${p.tech.join(", ")}.`;
  if (p.did) l += ` What he did: ${p.did.join("; ")}.`;
  if (s) l += ` Lighthouse: performance ${s.performance}, accessibility ${s.accessibility}, best practices ${s.bestPractices}, SEO ${s.seo}${s.lcp ? `, main content loads in ${s.lcp}` : ""}.`;
  if (p.featured) l += " Featured project.";
  lines.push(l);
}
lines.push("");
lines.push("## Code projects (Lab)");
for (const l of D.lab) lines.push(`- ${l.name} (${l.url}): ${l.desc} Tech: ${l.tech.join(", ")}.`);

const out = { name: P.name, updated: new Date().toISOString().slice(0, 10), text: lines.join("\n") };
fs.writeFileSync(path.join(root, "knowledge.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`knowledge.json: ${out.text.length} characters`);
