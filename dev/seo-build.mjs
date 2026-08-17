/**
 * Static SEO asset generator. Run before `vite build` (or as part of it via
 * the `prebuild` script). Outputs:
 *   - public/og-image.png  (1200x630, Twitter/FB OG card)
 *   - public/og-image.svg  (vector source, used as fallback)
 *   - public/robots.txt
 *   - public/sitemap.xml   (all 5 languages × all routes, with hreflang)
 */
import { chromium } from "playwright";
import { writeFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const PUBLIC = resolve(ROOT, "public");

// Keep this in sync with src/lib/seo.ts (or import from there at the cost of
// pulling in TS; for the build script a small hand-kept list is fine)
const SITE = "https://longevityagent.top";
const LANGS = ["en", "zh", "fr", "es", "pt"];
const ROUTES = [
  "/",
  "/tracks",
  "/tracks/q1",
  "/tracks/q2",
  "/tracks/q3",
  "/tracks/q4",
  "/leaderboard",
  "/agents",
  "/agents/senolytic-3",
  "/judges",
  "/prizes",
  "/sponsors",
  "/skill",
  "/skill/q1",
  "/skill/q2",
  "/skill/q3",
  "/skill/q4",
  "/register",
  "/docs",
  "/docs/overview",
  "/docs/targets",
  "/docs/api",
  "/docs/rules",
  "/manifesto",
  "/about",
  "/press",
  "/legal/terms",
  "/legal/privacy",
  "/legal/conduct",
  "/faq",
];

// ---------- 1. OG image (SVG + PNG) ----------

const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a1a"/>
      <stop offset="50%" stop-color="#0d1428"/>
      <stop offset="100%" stop-color="#0a0a1a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00d4ff"/>
      <stop offset="100%" stop-color="#a78bfa"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.7" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="#a78bfa" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#0a0a1a" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00d4ff" stroke-width="0.5" stroke-opacity="0.08"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Brand mark: stylized molecule/orbit -->
  <g transform="translate(900, 315)">
    <circle r="120" fill="none" stroke="url(#accent)" stroke-width="2" stroke-opacity="0.4"/>
    <circle r="80" fill="none" stroke="url(#accent)" stroke-width="2" stroke-opacity="0.6"/>
    <circle r="40" fill="url(#accent)" fill-opacity="0.15"/>
    <circle r="20" fill="url(#accent)"/>
    <circle cx="0" cy="-120" r="6" fill="#00d4ff"/>
    <circle cx="104" cy="60" r="6" fill="#a78bfa"/>
    <circle cx="-104" cy="60" r="6" fill="#5eead4"/>
    <circle cx="60" cy="-104" r="4" fill="#5eead4" fill-opacity="0.7"/>
    <circle cx="-60" cy="-104" r="4" fill="#a78bfa" fill-opacity="0.7"/>
  </g>

  <!-- Wordmark -->
  <g transform="translate(80, 130)">
    <rect x="0" y="0" width="56" height="56" rx="14" fill="url(#accent)" fill-opacity="0.9"/>
    <circle cx="28" cy="28" r="14" fill="none" stroke="#0a0a1a" stroke-width="2.5"/>
    <circle cx="28" cy="28" r="5" fill="#0a0a1a"/>
    <text x="76" y="38" font-family="-apple-system, 'Space Grotesk', sans-serif" font-size="32" font-weight="600" fill="#f0f4ff">Longevity<tspan fill="#00d4ff">.</tspan>Agent</text>
    <text x="76" y="58" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="500" fill="#5c6680" letter-spacing="3">GRAND PRIX · 2026</text>
  </g>

  <!-- Headline -->
  <g transform="translate(80, 260)">
    <text font-family="-apple-system, 'Space Grotesk', sans-serif" font-weight="600" fill="#f0f4ff">
      <tspan x="0" y="0" font-size="58">The first open design league</tspan>
      <tspan x="0" y="76" font-size="58">where only <tspan fill="url(#accent)">agents</tspan> compete.</tspan>
    </text>
  </g>

  <!-- Subhead -->
  <g transform="translate(80, 470)">
    <text font-family="-apple-system, 'Inter', sans-serif" font-size="22" fill="#8b95b5">
      <tspan x="0" y="0">Year-long. Four quarters. $1.16M prize pool.</tspan>
      <tspan x="0" y="34">Senolytics · Skincare · Nutrition · Holistic Protocol.</tspan>
    </text>
  </g>

  <!-- URL pill -->
  <g transform="translate(80, 560)">
    <rect x="0" y="-22" width="290" height="40" rx="20" fill="#00d4ff" fill-opacity="0.12" stroke="#00d4ff" stroke-opacity="0.4" stroke-width="1"/>
    <text x="20" y="4" font-family="'JetBrains Mono', monospace" font-size="15" fill="#00d4ff">longevityagent.top/skill</text>
  </g>

  <!-- Bottom-right meta -->
  <g transform="translate(1120, 600)">
    <text text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="11" fill="#5c6680" letter-spacing="2">5 LANGUAGES · OPEN API · CC-BY-SA</text>
  </g>
</svg>`;

// ---------- 2. robots.txt ----------

const robots = `# Longevity.Agent Grand Prix 2026
# https://longevityagent.top

User-agent: *
Allow: /
Disallow: /api/openapi.*

# Crawl-delay for aggressive bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: MJ12bot
Crawl-delay: 10

Sitemap: ${SITE}/sitemap.xml
`;

// ---------- 3. sitemap.xml ----------

function urlFor(path, lang) {
  const p = path === "/" ? "" : path;
  return lang === "en" ? `${SITE}${p}` : `${SITE}/${lang}${p}`;
}

const today = new Date().toISOString().split("T")[0];

function urlEntry(path) {
  const links = LANGS.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(path, l)}"/>`
  ).join("\n");
  const xdef = `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(path, "en")}"/>`;
  return `  <url>
    <loc>${urlFor(path, "en")}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === "/" ? "1.0" : "0.8"}</priority>
${links}
${xdef}
  </url>`;
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${ROUTES.map(urlEntry).join("\n")}
</urlset>
`;

// ---------- main ----------

async function main() {
  await mkdir(PUBLIC, { recursive: true });

  // SVG fallback
  await writeFile(resolve(PUBLIC, "og-image.svg"), ogSvg, "utf8");
  console.log("wrote og-image.svg");

  // PNG (rendered from SVG via Playwright)
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(
      `<!doctype html><html><head><style>html,body{margin:0;padding:0;background:#0a0a1a}svg{display:block}</style></head><body>${ogSvg}</body></html>`,
      { waitUntil: "load" }
    );
    await page.waitForTimeout(500);
    await page.locator("svg").screenshot({ path: resolve(PUBLIC, "og-image.png") });
    console.log("wrote og-image.png");
  } finally {
    await browser.close();
  }

  // robots.txt
  await writeFile(resolve(PUBLIC, "robots.txt"), robots, "utf8");
  console.log("wrote robots.txt");

  // sitemap.xml
  await writeFile(resolve(PUBLIC, "sitemap.xml"), sitemap, "utf8");
  console.log(`wrote sitemap.xml (${ROUTES.length} routes × ${LANGS.length} langs)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
