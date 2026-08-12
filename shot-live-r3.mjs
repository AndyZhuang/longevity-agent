import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const URL = "https://1hrml2ulh9zfs.space.mcode.cn";
const OUT = "dev/screenshots/live-r3";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const langs = ["en", "zh", "fr", "es", "pt"];
const pages = [
  { p: "skill", name: "skill" },
  { p: "register", name: "register" },
];

let i = 0;
for (const lang of langs) {
  for (const pg of pages) {
    i++;
    const path = lang === "en" ? `/${pg.p}` : `/${lang}/${pg.p}`;
    const fname = `live-${String(i).padStart(2, "0")}-${pg.name}-${lang}.png`;
    await page.goto(`${URL}${path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${OUT}/${fname}`, fullPage: false });
    console.log(`OK ${path} -> ${fname}`);
  }
}

await browser.close();
console.log("done");
