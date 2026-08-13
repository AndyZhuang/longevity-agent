// Capture React error stack to find the source location
import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

page.on('pageerror', (e) => {
  console.log('PAGE ERROR:');
  console.log(e.message);
  console.log('STACK:');
  console.log(e.stack);
});

page.on('console', async (m) => {
  if (m.type() === 'error' || m.type() === 'warning') {
    const args = await Promise.all(m.args().map((a) => a.jsonValue().catch(() => '?')));
    const stack = args.find((a) => typeof a === 'string' && a.includes('class'));
    if (stack) {
      console.log(`[${m.type()}]`, m.text());
      // Get the JSHandle of the first arg to see if there's a stack
      try {
        const stackHandle = m.args().find((a) => a.toString().includes('class'));
        if (stackHandle) {
          const props = await stackHandle.getProperties();
          for (const [k, v] of props) {
            if (k === 'stack' || k === 'componentStack') {
              const val = await v.jsonValue();
              console.log(`${k}:`, val);
            }
          }
        }
      } catch (e) {
        console.log('err:', e.message);
      }
    }
  }
});

await page.goto('http://localhost:4173/prizes', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

await browser.close();
