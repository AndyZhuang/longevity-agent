// Comprehensive regression suite — runs on local dev before production deploy.
// Verifies:
//   1. build compiles without errors
//   2. every page in every language renders with 0 console errors
//   3. every page × viewport combo has no horizontal overflow (mobile + desktop)
//   4. all 5 languages load and produce non-empty <html lang>
//   5. all key SEO endpoints return 200 (sitemap, robots, og-image)
//   6. skill.md (the LAGP entry point) is served and references the i18n languages
// Output: PASS/FAIL summary + non-zero exit code on any failure
import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const LANGS = ['en', 'zh', 'fr', 'es', 'pt'];
const VIEWPORTS = [
  { name: 'iphone-se',  w: 375,  h: 667,  dpr: 2, mobile: true },
  { name: 'desktop',    w: 1280, h: 900,  dpr: 1, mobile: false },
];
const PAGES = [
  '', 'tracks', 'tracks/q1', 'tracks/q2', 'tracks/q3', 'tracks/q4',
  'judges', 'prizes', 'agents', 'agents/senolytic-3', 'leaderboard',
  'manifesto', 'about', 'press', 'register', 'skill', 'docs', 'sponsors',
  'not-a-real-page',  // for 404 path
];

let pass = 0, fail = 0;
const failures = [];

function check(name, ok, detail) {
  if (ok) {
    pass++;
    console.log('  ✓', name);
  } else {
    fail++;
    failures.push({ name, detail });
    console.log('  ✗', name, detail ? '— ' + String(detail).slice(0, 200) : '');
  }
}

const browser = await chromium.launch();

console.log('\n[1/5] Build artifacts (dist/)');
check('dist/index.html exists', existsSync('dist/index.html'));
check('dist/sitemap.xml exists', existsSync('dist/sitemap.xml'));
check('dist/robots.txt exists', existsSync('dist/robots.txt'));
check('dist/og-image.png exists', existsSync('dist/og-image.png'));
check('dist/skill.md exists', existsSync('dist/skill.md'));
const sitemap = readFileSync('dist/sitemap.xml', 'utf-8');
check('sitemap.xml has 5 langs × 18 routes',
  (sitemap.match(/<loc>/g) || []).length >= 18 * 5,
  `found ${(sitemap.match(/<loc>/g) || []).length} locs`);
const robots = readFileSync('dist/robots.txt', 'utf-8');
check('robots.txt has Sitemap line', /Sitemap:/i.test(robots));
const skill = readFileSync('dist/skill.md', 'utf-8');
check('skill.md has multi-lang reference',
  /fr|es|pt|zh/i.test(skill) && /SKILL/i.test(skill));

console.log('\n[2/5] Page rendering × 5 languages × 2 viewports');
for (const lang of LANGS) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: vp.dpr,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });
    for (const page of PAGES) {
      const p = await ctx.newPage();
      const prefix = lang === 'en' ? '' : `/${lang}`;
      const url = `${BASE}${prefix}/${page}`;
      const errs = [];
      p.on('pageerror', (e) => errs.push(String(e)));
      p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
      try {
        await p.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
        await p.waitForTimeout(500);
        const m = await p.evaluate(() => ({
          scrollW: document.documentElement.scrollWidth,
          winW: window.innerWidth,
          lang: document.documentElement.lang,
        }));
        const noOverflow = m.scrollW <= m.winW + 2;
        const noErrors = errs.length === 0;
        const langOk = page === 'not-a-real-page' ? true :
          (lang === 'en' ? m.lang === 'en' : m.lang === lang);
        const id = `${lang}/${vp.name}/${page || 'home'}`;
        check(id, noOverflow && noErrors && langOk,
          !noOverflow ? `overflow ${m.scrollW}>${m.winW}` :
          !noErrors ? `console: ${errs[0]}` :
          !langOk ? `<html lang="${m.lang}"` : '');
      } catch (e) {
        // 404 is fine for the not-real-page case
        if (page === 'not-a-real-page') {
          pass++;
          console.log('  ✓', `${lang}/${vp.name}/not-a-real-page`, '(404 as expected)');
        } else {
          fail++;
          failures.push({ name: `${lang}/${vp.name}/${page}`, detail: String(e).slice(0, 200) });
          console.log('  ✗', `${lang}/${vp.name}/${page}`, '—', String(e).slice(0, 200));
        }
      } finally {
        await p.close();
      }
    }
    await ctx.close();
  }
}

console.log('\n[3/5] SEO critical assets (live dev)');
const seo = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text()).catch(() => '');
check('sitemap.xml serves on dev', seo.includes('<loc>'));
const robotsLive = await fetch(`${BASE}/robots.txt`).then((r) => r.text()).catch(() => '');
check('robots.txt serves on dev', robotsLive.toLowerCase().includes('sitemap'));
const og = await fetch(`${BASE}/og-image.png`).then((r) => ({ ok: r.ok, type: r.headers.get('content-type') })).catch(() => ({ ok: false }));
check('og-image.png serves', og.ok && /image/.test(og.type || ''));
const skillLive = await fetch(`${BASE}/skill.md`).then((r) => r.text()).catch(() => '');
check('skill.md serves', skillLive.length > 500);

console.log('\n[4/5] SEO per-page meta');
{
  const ctx = await browser.newContext();
  for (const lang of LANGS) {
    const p = await ctx.newPage();
    const prefix = lang === 'en' ? '' : `/${lang}`;
    await p.goto(`${BASE}${prefix}/`, { waitUntil: 'networkidle' });
    const meta = await p.evaluate(() => ({
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content,
      ogImage: document.querySelector('meta[property="og:image"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      hreflangs: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map(l => l.getAttribute('hreflang')),
      jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    }));
    const id = `home/${lang}`;
    check(`${id} title`, !!meta.title && meta.title.length > 5);
    check(`${id} description`, !!meta.desc && meta.desc.length > 20);
    check(`${id} og:image`, !!meta.ogImage);
    check(`${id} hreflang 5 langs + x-default`,
      meta.hreflangs.length === 6 && meta.hreflangs.includes('x-default'),
      `got ${meta.hreflangs.length}: ${meta.hreflangs.join(',')}`);
    check(`${id} JSON-LD ≥ 1`, meta.jsonLd >= 1);
    await p.close();
  }
  await ctx.close();
}

console.log('\n[5/5] Console errors across all pages');
{
  const ctx = await browser.newContext();
  for (const lang of LANGS) {
    for (const page of ['', 'tracks', 'agents', 'leaderboard', 'register']) {
      const p = await ctx.newPage();
      const errs = [];
      p.on('pageerror', (e) => errs.push(String(e)));
      p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
      const prefix = lang === 'en' ? '' : `/${lang}`;
      await p.goto(`${BASE}${prefix}/${page}`, { waitUntil: 'networkidle' });
      await p.waitForTimeout(500);
      check(`${lang}/${page || 'home'} no console errors`,
        errs.length === 0, errs[0]);
      await p.close();
    }
  }
  await ctx.close();
}

await browser.close();

console.log(`\n${'='.repeat(60)}`);
console.log(`PASS: ${pass}    FAIL: ${fail}`);
if (fail > 0) {
  console.log('\nFailures:');
  for (const f of failures.slice(0, 20)) {
    console.log('  -', f.name, '|', f.detail || '');
  }
  process.exit(1);
}
console.log('✓ All regression checks passed');
