// Find the source of the "Invalid DOM property class" warning
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const errs = [];
page.on('console', (m) => {
  if (m.type() === 'error') {
    errs.push({ text: m.text(), location: m.location() });
  }
});

await page.goto('http://localhost:4173/prizes', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

console.log('console.error count:', errs.length);
for (const e of errs) {
  console.log('---');
  console.log('TEXT:', e.text);
  console.log('LOC:', JSON.stringify(e.location));
}

await browser.close();
