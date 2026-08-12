// Find the widest elements in the agent-detail page on mobile
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 375, height: 667 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();
await page.goto('http://localhost:5173/agents/senolytic-3', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const result = await page.evaluate(() => {
  const winW = window.innerWidth;
  const all = document.querySelectorAll('*');
  const wide = [];
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width > winW * 1.2) {
      const cs = getComputedStyle(el);
      wide.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 120),
        width: Math.round(r.width),
        right: Math.round(r.right),
        left: Math.round(r.left),
        text: (el.textContent || '').trim().slice(0, 60),
      });
    }
  }
  // Also find what's causing document.scrollWidth to be huge
  const html = document.documentElement;
  const body = document.body;
  return {
    winW,
    docScrollW: html.scrollWidth,
    bodyScrollW: body.scrollWidth,
    htmlW: html.offsetWidth,
    bodyW: body.offsetWidth,
    wide: wide.slice(0, 30),
  };
});

console.log('viewport:', result.winW);
console.log('html.scrollWidth:', result.docScrollW);
console.log('body.scrollWidth:', result.bodyScrollW);
console.log('html.offsetWidth:', result.htmlW);
console.log('body.offsetWidth:', result.bodyW);
console.log('wide elements:');
for (const w of result.wide) {
  console.log(' ', w.width + 'px', w.tag + '.' + w.cls.slice(0, 80), '|', w.text);
}

await browser.close();
