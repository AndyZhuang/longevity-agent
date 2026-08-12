// Find the widest elements in the home page on desktop
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
  isMobile: false,
});
const page = await ctx.newPage();
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const result = await page.evaluate(() => {
  const winW = window.innerWidth;
  const all = document.querySelectorAll('*');
  const wide = [];
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width > winW) {
      wide.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0, 140),
        width: Math.round(r.width),
        right: Math.round(r.right),
        left: Math.round(r.left),
        text: (el.textContent || '').trim().slice(0, 50),
      });
    }
  }
  // Get the offsetRight of all top-level elements under <body>
  const body = document.body;
  const tops = [];
  for (const c of Array.from(body.children)) {
    const r = c.getBoundingClientRect();
    tops.push({ tag: c.tagName, cls: (c.className || '').toString().slice(0, 80), right: Math.round(r.right), width: Math.round(r.width) });
  }
  // Check scrollWidth by section
  const secs = document.querySelectorAll('section, header, footer, main');
  const secInfo = [];
  for (const s of secs) {
    secInfo.push({ tag: s.tagName, cls: (s.className || '').toString().slice(0, 80), right: Math.round(s.getBoundingClientRect().right), w: Math.round(s.getBoundingClientRect().width) });
  }
  return { winW, docScrollW: document.documentElement.scrollWidth, wide: wide.slice(0, 30), tops, secInfo };
});

console.log('viewport:', result.winW);
console.log('doc scrollWidth:', result.docScrollW);
console.log('wide elements:');
for (const w of result.wide) {
  console.log(' ', w.width + 'px', w.tag + '.' + w.cls.slice(0, 100), '|', w.text);
}

const parents = await page.evaluate(() => {
  const winW = window.innerWidth;
  const all = Array.from(document.querySelectorAll('*'));
  const result = [];
  for (const el of all) {
    const r = el.getBoundingClientRect();
    // Find elements that overflow just a tiny bit
    if (r.width > winW + 1) {
      let p = el;
      let depth = 0;
      while (p && p.tagName.toLowerCase() !== 'body' && depth < 10) {
        const pr = p.getBoundingClientRect();
        if (pr.width > winW) {
          p = p.parentElement;
          depth++;
        } else {
          break;
        }
      }
      if (p) {
        result.push({
          wideChild: el.tagName + '.' + (el.className || '').toString().slice(0, 80),
          wideChildW: Math.round(el.getBoundingClientRect().width),
          stopAt: p.tagName + '.' + (p.className || '').toString().slice(0, 80),
          stopAtW: Math.round(p.getBoundingClientRect().width),
          childRight: Math.round(r.right),
        });
      }
    }
  }
  return result.slice(0, 15);
});

console.log('\nwide → first non-wide ancestor:');
for (const p of parents) {
  console.log(' ', p.wideChildW + 'px', p.wideChild, '→ stopped at', p.stopAtW + 'px', p.stopAt);
}

console.log('\nbody children:');
for (const t of result.tops) {
  console.log(' ', t.tag, t.cls.slice(0, 60), 'right=' + t.right, 'w=' + t.width);
}
console.log('\nsection/header/footer info:');
for (const s of result.secInfo) {
  console.log(' ', s.tag, s.cls.slice(0, 60), 'right=' + s.right, 'w=' + s.w);
}

// Find elements that have right edge > 1280 (off-screen)
const offScreen = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('*'));
  const found = [];
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.right > 1281 && r.width > 0) {
      // Only top-level or near-top elements
      if (el.parentElement && el.parentElement.getBoundingClientRect().right < 1281) {
        found.push({
          tag: el.tagName,
          cls: (el.className || '').toString().slice(0, 80),
          right: Math.round(r.right),
          w: Math.round(r.width),
          text: (el.textContent || '').trim().slice(0, 60),
          parent: el.parentElement.tagName + '.' + (el.parentElement.className || '').toString().slice(0, 60),
        });
      }
    }
  }
  return found.slice(0, 20);
});
console.log('\nelements whose parent is at 1280 but they extend right:');
for (const o of offScreen) {
  console.log(' ', o.right + 'px', o.w + 'px', o.tag + '.' + o.cls.slice(0, 60), '|', o.text);
  console.log('    parent:', o.parent);
}

await browser.close();
