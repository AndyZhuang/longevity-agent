import { chromium } from "playwright";
import { writeFile, mkdir } from "fs/promises";

const URL = "http://localhost:5173";
const OUT = "dev/screenshots/seo";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const probes = [
  { path: "/", route: "home" },
  { path: "/tracks", route: "tracks" },
  { path: "/tracks/q1", route: "track-q1" },
  { path: "/leaderboard", route: "leaderboard" },
  { path: "/skill", route: "skill" },
  { path: "/register", route: "register" },
  { path: "/zh", route: "home (zh)" },
  { path: "/fr", route: "home (fr)" },
  { path: "/es/tracks/q2", route: "track-q2 (es)" },
  { path: "/pt/sponsors", route: "sponsors (pt)" },
];

const out = [];
for (const p of probes) {
  await page.goto(`${URL}${p.path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(800);
  const data = await page.evaluate(() => {
    const get = (sel) => document.head.querySelector(sel)?.getAttribute("content") || null;
    const getHref = (sel) => document.head.querySelector(sel)?.getAttribute("href") || null;
    const alts = Array.from(document.head.querySelectorAll('link[rel="alternate"][hreflang]')).map(
      (l) => `${l.getAttribute("hreflang")}=${l.getAttribute("href")}`
    );
    const ld = document.getElementById("ld-json-graph")?.textContent || null;
    return {
      title: document.title,
      htmlLang: document.documentElement.lang,
      description: get('meta[name="description"]'),
      canonical: getHref('link[rel="canonical"]'),
      ogTitle: get('meta[property="og:title"]'),
      ogDescription: get('meta[property="og:description"]'),
      ogUrl: get('meta[property="og:url"]'),
      ogLocale: get('meta[property="og:locale"]'),
      twitterCard: get('meta[name="twitter:card"]'),
      robots: get('meta[name="robots"]'),
      hreflangs: alts,
      ldGraphTypes: ld ? JSON.parse(ld)["@graph"].map((g) => g["@type"]).join(",") : null,
    };
  });
  out.push({ path: p.path, route: p.route, ...data });
}

await writeFile(`${OUT}/seo-probe.json`, JSON.stringify(out, null, 2), "utf8");

// Pretty print
for (const r of out) {
  console.log(`\n=== ${r.path}  (${r.route}) ===`);
  console.log(`  <html lang>     : ${r.htmlLang}`);
  console.log(`  <title>         : ${r.title}`);
  console.log(`  description     : ${r.description?.slice(0, 80)}...`);
  console.log(`  canonical       : ${r.canonical}`);
  console.log(`  og:title        : ${r.ogTitle}`);
  console.log(`  og:description  : ${r.ogDescription?.slice(0, 80)}...`);
  console.log(`  og:url          : ${r.ogUrl}`);
  console.log(`  og:locale       : ${r.ogLocale}`);
  console.log(`  robots          : ${r.robots}`);
  console.log(`  twitter:card    : ${r.twitterCard}`);
  console.log(`  hreflang count  : ${r.hreflangs.length}  (should be 6)`);
  console.log(`  hreflangs       :`);
  for (const a of r.hreflangs) console.log(`    ${a}`);
  console.log(`  JSON-LD @types  : ${r.ldGraphTypes}`);
}

await browser.close();
console.log(`\nFull report: ${OUT}/seo-probe.json`);
