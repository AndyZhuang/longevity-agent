// Quick smoke test on the live production URL at mobile viewport
import { chromium } from 'playwright';

const URL = 'https://xi3hfbkq3gc5i.space.mcode.cn';
const PATHS = ['', 'tracks', 'tracks/q1', 'agents', 'agents/senolytic-3', 'leaderboard', 'register'];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 375, height: 667 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

for (const p of PATHS) {
  const page = await ctx.newPage();
  try {
    await page.goto(URL + '/' + p, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(800);
    const m = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      winW: window.innerWidth,
    }));
    const ok = m.scrollW <= m.winW + 1;
    console.log(`${ok ? '✓' : '✗'} ${p.padEnd(30)} scrollW=${m.scrollW} winW=${m.winW}`);
  } catch (e) {
    console.log(`! ${p} ERR ${String(e).slice(0, 80)}`);
  } finally {
    await page.close();
  }
}
await browser.close();
