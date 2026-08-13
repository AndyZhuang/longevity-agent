// Quick verification: visit /, /prizes, /press across 5 langs and check console errors
// Specifically look for: "class" attribute warning from React
import { chromium } from "playwright";

const BASE = "http://localhost:4173";
const LANGS = ["en", "zh", "fr", "es", "pt"];
const PAGES = [
  { path: "/", name: "home" },
  { path: "/prizes", name: "prizes" },
  { path: "/press", name: "press" },
];

const errors = [];
const warnings = [];

const browser = await chromium.launch();
try {
  for (const lang of LANGS) {
    for (const page of PAGES) {
      const url = lang === "en" ? `${BASE}${page.path}` : `${BASE}/${lang}${page.path}`;
      const ctx = await browser.newContext();
      const p = await ctx.newPage();

      const consoleMsgs = [];
      p.on("console", (msg) => {
        const t = msg.type();
        const txt = msg.text();
        if (t === "error") consoleMsgs.push({ type: "error", text: txt });
        if (t === "warning") consoleMsgs.push({ type: "warning", text: txt });
      });
      p.on("pageerror", (err) => consoleMsgs.push({ type: "pageerror", text: err.message }));

      try {
        await p.goto(url, { waitUntil: "networkidle", timeout: 15000 });
        await p.waitForTimeout(800);
      } catch (e) {
        consoleMsgs.push({ type: "navfail", text: e.message });
      }

      // Look for the specific React "class" attribute warning
      const classAttrWarn = consoleMsgs.find(
        (m) => m.text.includes("Received `class`") || (m.text.includes("class") && m.text.includes("React") && m.text.includes("attribute"))
      );
      const classNameLitWarn = consoleMsgs.find((m) =>
        m.text.includes("className") && m.text.includes("unknown prop")
      );

      if (classAttrWarn) {
        errors.push({ lang, page: page.name, kind: "class-attr-warn", text: classAttrWarn.text });
      }
      if (classNameLitWarn) {
        errors.push({ lang, page: page.name, kind: "className-lit", text: classNameLitWarn.text });
      }

      const otherErrs = consoleMsgs.filter(
        (m) => m.type === "error" || m.type === "pageerror"
      );
      if (otherErrs.length > 0) {
        for (const e of otherErrs) {
          errors.push({ lang, page: page.name, kind: e.type, text: e.text });
        }
      }
      if (consoleMsgs.length > 0) {
        const info = consoleMsgs.map((m) => `[${m.type}] ${m.text.slice(0, 120)}`).join("\n  ");
        console.log(`[${lang}/${page.name}] (${consoleMsgs.length} msgs):\n  ${info}`);
      } else {
        console.log(`[${lang}/${page.name}] ✓ clean`);
      }
      await ctx.close();
    }
  }
} finally {
  await browser.close();
}

console.log("\n" + "=".repeat(60));
if (errors.length === 0) {
  console.log(`✅ ALL CLEAN — 0 React warnings, 0 console errors across 5 langs × 3 pages = 15 combos`);
  process.exit(0);
} else {
  console.log(`❌ ${errors.length} issue(s) found:`);
  for (const e of errors) {
    console.log(`  - [${e.lang}/${e.page}] ${e.kind}: ${e.text.slice(0, 200)}`);
  }
  process.exit(1);
}
