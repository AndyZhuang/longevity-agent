// Capture full React warnings on the prizes page
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const logs = [];
page.on('console', (m) => logs.push({ type: m.type(), text: m.text(), location: m.location() }));
page.on('pageerror', (e) => logs.push({ type: 'pageerror', text: String(e) }));

await page.goto('http://localhost:5173/prizes', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

for (const l of logs) {
  if (l.type === 'warning' || l.type === 'error' || l.type === 'pageerror') {
    console.log(`[${l.type}]`);
    console.log(l.text);
    if (l.location) console.log('at', JSON.stringify(l.location));
    console.log('---');
  }
}

await browser.close();
