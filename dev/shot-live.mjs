import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const URL = "https://3gh36cklv2mmb.space.mcode.cn";
const OUT = "dev-screenshots";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const targets = [
  { p: "/", n: "live-01-home" },
  { p: "/tracks", n: "live-02-tracks" },
  { p: "/leaderboard", n: "live-03-leaderboard" },
  { p: "/judges", n: "live-04-judges" },
];

for (const t of targets) {
  try {
    await page.goto(`${URL}${t.p}`, { waitUntil: "load", timeout: 45000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/${t.n}.png`, fullPage: true });
    const title = await page.title();
    console.log(`OK  ${t.p}  →  ${title}`);
  } catch (e) {
    console.log(`FAIL ${t.p}  ${e instanceof Error ? e.message.slice(0, 100) : e}`);
  }
}
await browser.close();
