import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const URL = "http://localhost:5173";
const OUT = "dev/screenshots";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const langs = ["en", "zh", "fr", "es", "pt"];
const pages = [
  { p: "register", name: "register" },
  { p: "docs", name: "docs" },
  { p: "sponsors", name: "sponsors" },
  { p: "tracks", name: "tracks" },
];

let i = 0;
for (const lang of langs) {
  for (const pg of pages) {
    i++;
    const path = lang === "en" ? `/${pg.p}` : `/${lang}/${pg.p}`;
    const fname = `r3-${String(i).padStart(2, "0")}-${pg.name}-${lang}.png`;
    await page.goto(`${URL}${path}`, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${fname}`, fullPage: true });
    console.log(`OK ${path} -> ${fname}`);
  }
}

// Also the new skill + the new track detail CTA
await page.goto(`${URL}/tracks/q1`, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/r3-21-trackdetail-en.png`, fullPage: true });
console.log(`OK /tracks/q1 -> r3-21-trackdetail-en.png`);

await browser.close();
console.log("done");
