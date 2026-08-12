// Mobile responsiveness audit.
// Visit each page at 4 viewports (iPhone SE, iPhone 14 Pro, iPad, Desktop)
// across 5 languages. Save to dev/screenshots/mobile/<lang>/<viewport>/<page>.png
// Also do a "fat-finger" check: are any text rows narrower than 16px (Tailwind's
// font-mono text-[10px] etc.) overflowing? Are any horizontal scrollbars?
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dev/screenshots/mobile';
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'iphone-se',   width: 375,  height: 667,  isMobile: true,  dpr: 2 },  // small iPhone
  { name: 'iphone-14',   width: 390,  height: 844,  isMobile: true,  dpr: 3 },  // modern iPhone
  { name: 'android-md',  width: 412,  height: 915,  isMobile: true,  dpr: 2.625 }, // Pixel 7
  { name: 'ipad',        width: 768,  height: 1024, isMobile: true,  dpr: 2 },  // iPad portrait
  { name: 'desktop',     width: 1280, height: 900,  isMobile: false, dpr: 1 },  // baseline
];

const LANGS = ['en', 'zh', 'fr']; // 3 langs × 5 viewports × 12 pages = 180 shots
const PAGES = [
  { slug: 'home', path: '' },
  { slug: 'tracks', path: 'tracks' },
  { slug: 'track-detail', path: 'tracks/q1' },
  { slug: 'judges', path: 'judges' },
  { slug: 'prizes', path: 'prizes' },
  { slug: 'agents', path: 'agents' },
  { slug: 'agent-detail', path: 'agents/senolytic-3' },
  { slug: 'leaderboard', path: 'leaderboard' },
  { slug: 'manifesto', path: 'manifesto' },
  { slug: 'about', path: 'about' },
  { slug: 'press', path: 'press' },
  { slug: 'register', path: 'register' },
];

const browser = await chromium.launch();

// We'll do per-(lang, viewport) full sweep; full audit = 3 × 5 × 12 = 180.
const report = [];

for (const lang of LANGS) {
  for (const vp of VIEWPORTS) {
    const dir = join(OUT, lang, vp.name);
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });

    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });

    for (const page of PAGES) {
      const p = await ctx.newPage();
      const prefix = lang === 'en' ? '' : `/${lang}`;
      const url = `http://localhost:5173${prefix}/${page.path}`;
      const issues = [];
      try {
        // Capture console errors
        const consoleErrs = [];
        p.on('pageerror', (err) => consoleErrs.push(String(err)));
        p.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrs.push(msg.text());
        });
        await p.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await p.waitForTimeout(800);

        // 1) Check for horizontal overflow (mobile is the strict test)
        const overflow = await p.evaluate(() => {
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          return { docW, winW, overflows: docW > winW + 1, ratio: docW / winW };
        });
        if (overflow.overflows) {
          issues.push({
            kind: 'h-overflow',
            detail: `document scrollWidth ${overflow.docW}px > viewport ${overflow.winW}px (ratio ${overflow.ratio.toFixed(2)})`,
          });
        }

        // 2) Check for tiny text (less than 8px effective) — fat-finger / accessibility
        const tinyTexts = await p.evaluate(() => {
          const results = [];
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const t = (el.textContent || '').trim();
            if (t.length === 0 || t.length > 200) continue;
            // Only text-ish elements
            const tag = el.tagName.toLowerCase();
            if (!['span', 'p', 'a', 'button', 'h1','h2','h3','h4','h5','h6','li','td','th','label','strong','em','div'].includes(tag)) continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            const cs = getComputedStyle(el);
            const fs = parseFloat(cs.fontSize);
            if (fs > 0 && fs < 9) {
              results.push({ tag, text: t.slice(0, 40), fontSize: fs });
            }
          }
          // Dedupe
          const seen = new Set();
          return results.filter(r => {
            const k = r.tag + '|' + r.text + '|' + r.fontSize;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          }).slice(0, 10);
        });
        if (tinyTexts.length > 0) {
          issues.push({ kind: 'tiny-text', detail: tinyTexts });
        }

        // 3) Check for nav bar overflow (too many items in nav for mobile)
        const navOverflow = await p.evaluate(() => {
          const nav = document.querySelector('header nav, nav, [role="navigation"]');
          if (!nav) return null;
          const r = nav.getBoundingClientRect();
          return { width: r.width, height: r.height, scrollWidth: nav.scrollWidth };
        });
        if (navOverflow && navOverflow.scrollWidth > navOverflow.width + 1) {
          issues.push({
            kind: 'nav-overflow',
            detail: `nav scrollWidth ${navOverflow.scrollWidth}px > width ${navOverflow.width}px`,
          });
        }

        const file = join(dir, `${page.slug}.png`);
        await p.screenshot({ path: file, fullPage: true });

        report.push({
          lang, viewport: vp.name, page: page.slug, url, file,
          overflow, navOverflow, issues, consoleErrs,
        });
      } catch (e) {
        report.push({ lang, viewport: vp.name, page: page.slug, url, error: String(e).slice(0, 200) });
      } finally {
        await p.close();
      }
    }
    await ctx.close();
  }
}

await writeFile(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();

// Print summary
const problemPages = report.filter(r => r.issues && r.issues.length > 0);
console.log(`\nAudited ${report.length} page×viewport×lang combos`);
console.log(`Found ${problemPages.length} combos with issues:\n`);
for (const p of problemPages) {
  console.log(`--- ${p.lang} / ${p.viewport} / ${p.page} ---`);
  for (const i of p.issues) {
    console.log('  •', i.kind, '→', JSON.stringify(i.detail).slice(0, 220));
  }
}
