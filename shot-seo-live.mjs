import { chromium } from "playwright";

const URL = "https://0kjldj2gtdb94.space.mcode.cn";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const probes = [
  { path: "/" },
  { path: "/tracks" },
  { path: "/tracks/q1" },
  { path: "/zh" },
  { path: "/fr/skill" },
];

for (const p of probes) {
  await page.goto(`${URL}${p.path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
  const data = await page.evaluate(() => {
    const get = (sel) => document.head.querySelector(sel)?.getAttribute("content") || null;
    const altCount = document.head.querySelectorAll('link[rel="alternate"][hreflang]').length;
    const ldTypes = (() => {
      const ld = document.getElementById("ld-json-graph")?.textContent;
      return ld ? JSON.parse(ld)["@graph"].map((g) => g["@type"]).join(",") : null;
    })();
    return {
      title: document.title,
      htmlLang: document.documentElement.lang,
      desc: get('meta[name="description"]')?.slice(0, 60),
      canonical: document.head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ogUrl: get('meta[property="og:url"]'),
      ogLocale: get('meta[property="og:locale"]'),
      robots: get('meta[name="robots"]'),
      altCount,
      ldTypes,
    };
  });
  console.log(`\n[${p.path}]  <html lang=${data.htmlLang}>`);
  console.log(`  title      : ${data.title}`);
  console.log(`  desc       : ${data.desc}…`);
  console.log(`  canonical  : ${data.canonical}`);
  console.log(`  og:url     : ${data.ogUrl}`);
  console.log(`  og:locale  : ${data.ogLocale}`);
  console.log(`  robots     : ${data.robots}`);
  console.log(`  hreflangs  : ${data.altCount}  (expected 6)`);
  console.log(`  JSON-LD    : ${data.ldTypes}`);
}

// Also verify the static SEO files
console.log("\n--- static files ---");
for (const f of ["/robots.txt", "/sitemap.xml", "/og-image.png", "/og-image.svg"]) {
  const r = await page.goto(`${URL}${f}`, { waitUntil: "load", timeout: 30000 });
  console.log(`  ${f.padEnd(20)} ${r.status()}  ${r.headers()["content-type"]}  ${(await r.body()).length} bytes`);
}

await browser.close();
console.log("\n✓ production SEO probe done");
