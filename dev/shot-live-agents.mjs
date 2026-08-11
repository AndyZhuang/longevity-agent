import { chromium } from "playwright";
const URL = "https://o3aoadvdpb7e1.space.mcode.cn";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
for (const t of ["/agents", "/agents/senolytic-3", "/leaderboard"]) {
  await page.goto(`${URL}${t}`, { waitUntil: "load", timeout: 45000 });
  await page.waitForTimeout(2000);
  const name = t.replace(/\//g, "_") || "_root";
  await page.screenshot({ path: `dev-screenshots/live-agents${name}.png`, fullPage: true });
  console.log(`OK ${t}`);
}
await browser.close();
