import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const URL = "http://localhost:5173";
const OUT = "dev/screenshots";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const targets = [
  { p: "/", name: "i18n-01-home-en" },
  { p: "/skill", name: "i18n-02-skill-en" },
  { p: "/skill/q1", name: "i18n-03-skill-q1-en" },
  { p: "/zh", name: "i18n-04-home-zh" },
  { p: "/zh/skill", name: "i18n-05-skill-zh" },
  { p: "/fr", name: "i18n-06-home-fr" },
  { p: "/fr/skill", name: "i18n-07-skill-fr" },
  { p: "/es", name: "i18n-08-home-es" },
  { p: "/pt", name: "i18n-09-home-pt" },
];

for (const t of targets) {
  await page.goto(`${URL}${t.p}`, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/${t.name}.png`, fullPage: true });
  console.log(`OK ${t.p}`);
}

await browser.close();
