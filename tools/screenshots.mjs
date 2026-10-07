// Captures a homepage screenshot of every project in data.js into shots/<slug>.webp
// Runs on GitHub Actions (see .github/workflows/screenshots.yml). Local: node tools/screenshots.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "data.js"), "utf8"), ctx);
const { projects } = ctx.window.PORTFOLIO;

// must match slug() in app.js
const slug = (u) => u.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();

// Hide pop-ups, cookie banners and chat widgets; stop entrance animations
const HIDE = `
*{animation-duration:0s!important;transition:none!important}
.elementor-invisible{visibility:visible!important;opacity:1!important}
.elementor-popup-modal,.dialog-widget.elementor-popup-modal,.pum-overlay,.pum-container,.mfp-wrap,.mfp-bg,.modal-backdrop,
#cmplz-cookiebanner-container,.cmplz-cookiebanner,#cookie-law-info-bar,.cli-modal,.cky-consent-container,.cky-overlay,
#moove_gdpr_cookie_info_bar,#cookie-notice,.cookie-notice-container,#CybotCookiebotDialog,#onetrust-banner-sdk,.cc-window,
.cookie-banner,.cookies-banner,[id*="cookie-banner"],[class*="cookie-consent"],[id*="cookieconsent"],.borlabs-cookie,#BorlabsCookieBox,
.wcc-consent-container,.iubenda-cs-container,#ht-ctc-chat,.joinchat,.wa__btn_popup,#tidio-chat,.tawk-min-container{display:none!important}
html,body{overflow:auto!important}`;

const outDir = path.join(root, "shots");
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1080 },
  deviceScaleFactor: 1,
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
});

let ok = 0;
for (const p of projects) {
  const file = path.join(outDir, slug(p.url) + ".webp");
  const page = await context.newPage();
  try {
    const res = await page.goto(p.url, { waitUntil: "load", timeout: 45000 });
    if (!res || res.status() >= 400) throw new Error("site returned HTTP " + (res ? res.status() : "no response"));
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    // trigger lazy-loaded images / Elementor entrance animations
    await page.evaluate(async () => { window.scrollTo(0, 600); await new Promise(r => setTimeout(r, 600)); window.scrollTo(0, 0); });
    await page.addStyleTag({ content: HIDE }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.keyboard.press("Escape").catch(() => {});
    await page.addStyleTag({ content: HIDE }).catch(() => {}); // again, for pop-ups injected late
    const text = (await page.evaluate(() => document.body.innerText.slice(0, 400)).catch(() => "")).toLowerCase();
    if (/service unavailable|503 error|site is experiencing technical difficulties|account suspended/.test(text)) throw new Error("site shows an error page");
    const png = await page.screenshot({ type: "png" });
    await sharp(png).resize({ width: 960 }).webp({ quality: 72 }).toFile(file);
    ok++;
    console.log("✓", p.name);
  } catch (e) {
    fs.rmSync(file, { force: true }); // don't keep a stale or broken screenshot; the site falls back to a live preview
    console.log("✗", p.name, "-", e.message.split("\n")[0]);
  } finally {
    await page.close();
  }
}
await browser.close();
console.log(`${ok}/${projects.length} screenshots saved`);
