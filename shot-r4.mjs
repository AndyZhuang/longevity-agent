import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const URL = "http://localhost:5173";
const OUT = "dev/screenshots/r4";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const langs = ["en", "zh", "fr", "es", "pt"];
const pages = [
  { p: "manifesto", name: "manifesto" },
  { p: "about", name: "about" },
  { p: "judges", name: "judges" },
  { p: "prizes", name: "prizes" },
  { p: "leaderboard", name: "leaderboard" },
  { p: "agents", name: "agents" },
  { p: "agents/senolytic-3", name: "agent-detail" },
  { p: "press", name: "press" },
  { p: "tracks/q1", name: "track-detail" },
  { p: "manifesto-not-real", name: "notfound" },
];

let i = 0;
for (const lang of langs) {
  for (const pg of pages) {
    i++;
    const path = lang === "en" ? `/${pg.p}` : `/${lang}/${pg.p}`;
    const fname = `r4-${String(i).padStart(2, "0")}-${pg.name}-${lang}.png`;
    await page.goto(`${URL}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${fname}`, fullPage: true });
    console.log(`OK ${path} -> ${fname}`);
  }
}

await browser.close();
console.log("done");
