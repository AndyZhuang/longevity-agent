// Quick re-shoot of just track-detail pages (id = q1, q2, q3, q4)
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dev/screenshots/r5';
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const LANGS = ['en', 'zh', 'fr', 'es', 'pt'];
const QIDS = ['q1', 'q2', 'q3', 'q4'];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

for (const lang of LANGS) {
  for (const id of QIDS) {
    const page = await ctx.newPage();
    const prefix = lang === 'en' ? '' : `/${lang}`;
    const url = `http://localhost:5173${prefix}/tracks/${id}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(800);
      const file = join(OUT, `r5-${lang}-track-detail-${id}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log('shot', file);
    } catch (e) {
      console.log('FAIL', url, String(e).slice(0, 100));
    } finally {
      await page.close();
    }
  }
}
await browser.close();
