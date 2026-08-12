// Audit all 5 languages × 10 pages. Save to dev/screenshots/r5/
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'dev/screenshots/r5';
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const LANGS = ['en', 'zh', 'fr', 'es', 'pt'];
const PAGES = [
  { slug: 'home', path: '' },
  { slug: 'tracks', path: 'tracks' },
  { slug: 'track-detail-q1', path: 'tracks/q1-senolytic-discovery' },
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
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const report = [];

for (const lang of LANGS) {
  for (const page of PAGES) {
    const page1 = await ctx.newPage();
    const prefix = lang === 'en' ? '' : `/${lang}`;
    const url = `http://localhost:5173${prefix}/${page.path}`;
    try {
      await page1.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // give animations time
      await page1.waitForTimeout(800);
      const file = join(OUT, `r5-${lang}-${page.slug}.png`);
      await page1.screenshot({ path: file, fullPage: true });
      // Get full visible body text
      const text = await page1.evaluate(() => document.body.innerText);
      // Look for English residues
      const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
      // crude English-passage detector: any line > 40 chars with > 80% ascii letters + spaces, no CJK or accented
      const suspect = lines.filter(line => {
        if (line.length < 40) return false;
        const letters = (line.match(/[A-Za-z]/g) || []).length;
        const cjk = (line.match(/[\u4e00-\u9fff]/g) || []).length;
        const accented = (line.match(/[àâçéèêëîïôûùüÿœæÀÂÇÉÈÊËÎÏÔÛÙÜŸŒÆñáéíóúüÑÁÉÍÓÚÜãõÃÕâêôÂÊÔ]/g) || []).length;
        const total = line.replace(/[\s\d\W_]/g, '').length;
        if (total === 0) return false;
        const englishish = letters / total;
        const nonEnglishish = (cjk + accented) / total;
        // For non-en lang, flag if very high englishish and almost no cjk/accented
        if (lang !== 'en') {
          return englishish > 0.85 && nonEnglishish < 0.05;
        }
        return false;
      });
      report.push({ lang, page: page.slug, url, file, suspectCount: suspect.length, suspect: suspect.slice(0, 5) });
    } catch (e) {
      report.push({ lang, page: page.slug, url, error: String(e).slice(0, 200) });
    } finally {
      await page1.close();
    }
  }
}

await writeFile(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();

// Console summary
const problems = report.filter(r => r.suspect && r.suspectCount > 0);
console.log(`\nAudited ${report.length} pages`);
console.log(`Found ${problems.length} pages with potential untranslated English passages:`);
for (const p of problems) {
  console.log(`\n=== ${p.lang} /${p.page} (${p.suspectCount} suspects) ===`);
  for (const s of p.suspect) console.log('  • ' + s.slice(0, 180));
}
