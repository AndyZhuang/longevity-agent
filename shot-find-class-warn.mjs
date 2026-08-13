// Find the element producing "Invalid DOM property `class`"
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

// Hook into React's error path by intercepting console.error
await page.addInitScript(() => {
  const origError = console.error;
  window.__reactErrors = [];
  console.error = function(...args) {
    window.__reactErrors.push(args.map(a => String(a)).join(' '));
    origError.apply(console, args);
  };
});

await page.goto('http://localhost:5173/prizes', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const result = await page.evaluate(() => {
  // Find elements with literal "class" attribute (not className)
  const all = document.querySelectorAll('*');
  const found = [];
  for (const el of all) {
    // Check the actual attributes
    if (el.hasAttribute('class')) {
      const tag = el.tagName.toLowerCase();
      const cls = el.getAttribute('class');
      // React only complains on DOM elements
      found.push({ tag, class: cls.slice(0, 100), text: (el.textContent || '').slice(0, 60) });
    }
  }
  return { found: found.slice(0, 10), reactErrors: window.__reactErrors };
});

console.log('react errors:');
for (const e of result.reactErrors) {
  console.log(' ', e);
}
console.log('\nelements with class= attribute:');
for (const e of result.found) {
  console.log(' ', e.tag, '|', e.class, '|', e.text);
}

await browser.close();
