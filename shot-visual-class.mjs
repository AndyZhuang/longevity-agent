// Visual verify: capture prizes + press pages in 5 langs, check the gold-glow span
// (the one that originally had <span class="text-glow-gold text-gold-glow">$1.16M</span>)
// is still rendered with gold color (the className fix must not break the class binding)
import { chromium } from "playwright";
import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";

const BASE = "http://localhost:4173";
const LANGS = ["en", "zh", "fr", "es", "pt"];
const OUT = resolve("dev/screenshots/r5-class");

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const report = [];

try {
  for (const lang of LANGS) {
    // Prizes
    const url1 = lang === "en" ? `${BASE}/prizes` : `${BASE}/${lang}/prizes`;
    const ctx1 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const p1 = await ctx1.newPage();
    await p1.goto(url1, { waitUntil: "domcontentloaded", timeout: 20000 });
    await p1.waitForTimeout(1000);
    const prizeSpan = await p1.evaluate(() => {
      const span = document.querySelector("span.text-glow-gold");
      if (!span) return { found: false };
      const cs = getComputedStyle(span);
      return {
        found: true,
        text: span.textContent,
        color: cs.color,
        fontWeight: cs.fontWeight,
        classList: Array.from(span.classList),
      };
    });
    await p1.screenshot({ path: resolve(OUT, `${lang}-prizes.png`), fullPage: false });
    report.push({ lang, page: "prizes", ...prizeSpan });
    await ctx1.close();

    // Press
    const url2 = lang === "en" ? `${BASE}/press` : `${BASE}/${lang}/press`;
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const p2 = await ctx2.newPage();
    await p2.goto(url2, { waitUntil: "domcontentloaded", timeout: 20000 });
    await p2.waitForTimeout(1000);
    const pressStrong = await p2.evaluate(() => {
      const el = document.querySelector("strong.text-ink-high");
      if (!el) return { found: false };
      const cs = getComputedStyle(el);
      return {
        found: true,
        text: el.textContent,
        color: cs.color,
        fontWeight: cs.fontWeight,
        classList: Array.from(el.classList),
      };
    });
    await p2.screenshot({ path: resolve(OUT, `${lang}-press.png`), fullPage: false });
    report.push({ lang, page: "press", ...pressStrong });
    await ctx2.close();
  }
} finally {
  await browser.close();
}

console.log("\n" + "=".repeat(60));
console.log("Class binding check (gold span on /prizes, ink-high strong on /press):\n");
let pass = true;
for (const r of report) {
  const status = r.found ? "✓" : "✗";
  const colorOK = r.found && r.color !== "rgb(0, 0, 0)" && r.color !== "rgba(0, 0, 0, 0)";
  if (!r.found || !colorOK) pass = false;
  console.log(`  ${status} [${lang_label(r.lang)}/${r.page}] found=${r.found} color=${r.color} weight=${r.fontWeight} classes=[${(r.classList || []).join(",")}]`);
  if (r.text) console.log(`      text: "${r.text.slice(0, 60)}…"`);
}
console.log();
if (pass) {
  console.log("✅ All elements render with correct CSS classes (color != black, classes include expected names)");
} else {
  console.log("❌ Some elements missing or unstyled — className fix may have broken class binding");
  process.exit(1);
}

function lang_label(l) { return l.toUpperCase(); }
