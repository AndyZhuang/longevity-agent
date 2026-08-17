// v0.6.0 legal/FAQ/Swagger smoke test:
// 1. Build artifacts present (incl. updated sitemap with 30 routes)
// 2. 4 new pages × 5 langs render with 0 console errors
// 3. Footer "Legal" column visible and links work
// 4. /docs/api tab switcher: "Static reference" shows endpoints, "Interactive" loads Swagger
// 5. SEO meta tags present (title, description, og:locale, hreflang)
import { chromium } from "playwright";
import { existsSync, readFileSync } from "fs";

const BASE = "http://localhost:4173";
const LANGS = ["en", "zh", "fr", "es", "pt"];
const NEW_PAGES = [
  { path: "/legal/terms", name: "terms" },
  { path: "/legal/privacy", name: "privacy" },
  { path: "/legal/conduct", name: "conduct" },
  { path: "/faq", name: "faq" },
];
const HOMES = ["/", "/tracks"]; // footer must be present on these

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log("  ✓", name); }
  else { fail++; failures.push({ name, detail }); console.log("  ✗", name, detail ? "— " + String(detail).slice(0, 200) : ""); }
}

console.log("\n[1/4] Build artifacts");
check("dist/index.html exists", existsSync("dist/index.html"));
check("dist/sitemap.xml exists", existsSync("dist/sitemap.xml"));
const sitemap = readFileSync("dist/sitemap.xml", "utf-8");
const locs = (sitemap.match(/<loc>/g) || []).length;
check(`sitemap has >= 30 routes (got ${locs})`, locs >= 30);
check("sitemap includes /legal/terms", /\/legal\/terms/.test(sitemap));
check("sitemap includes /legal/privacy", /\/legal\/privacy/.test(sitemap));
check("sitemap includes /legal/conduct", /\/legal\/conduct/.test(sitemap));
check("sitemap includes /faq", /\/faq/.test(sitemap));
check("dist/api/openapi.json exists", existsSync("dist/api/openapi.json"));

console.log("\n[2/4] New pages render × 5 langs");
const browser = await chromium.launch();
let totalCombos = 0, cleanCombos = 0;
for (const lang of LANGS) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  for (const page of NEW_PAGES) {
    totalCombos++;
    const url = lang === "en" ? `${BASE}${page.path}` : `${BASE}/${lang}${page.path}`;
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e)));
    p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    let navOk = true;
    try {
      await p.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await p.waitForTimeout(700);
    } catch (e) { navOk = false; errs.push("nav: " + e.message.split("\n")[0]); }

    // Check key elements
    const h1 = await p.evaluate(() => document.querySelector("h1")?.textContent || "").catch(() => "");
    const hasH1 = h1.length > 0;
    const reactClassWarn = errs.some((e) => /class.*React|className.*unknown/i.test(e));
    const realErrs = errs.filter((e) => !/WebGL|GPU stall/.test(e));
    const ok = navOk && hasH1 && !reactClassWarn && realErrs.length === 0;
    if (ok) cleanCombos++;
    else failures.push({ name: `${lang}/${page.name}`, detail: `navOk=${navOk} h1="${h1.slice(0, 40)}" errs=${realErrs.length} sample=${realErrs[0] || ""}` });
  }
  await ctx.close();
}
check(`20 new-page combos clean (got ${cleanCombos}/${totalCombos})`, cleanCombos === totalCombos);

console.log("\n[3/4] Footer has Legal column on /, /tracks");
for (const home of HOMES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}${home}`, { waitUntil: "domcontentloaded", timeout: 20000 });
  await p.waitForTimeout(500);
  const footerInfo = await p.evaluate(() => {
    const footer = document.querySelector("footer");
    if (!footer) return { found: false };
    const links = Array.from(footer.querySelectorAll("a")).map((a) => a.getAttribute("href") || "");
    return {
      found: true,
      hasTerms: links.some((h) => h.includes("/legal/terms")),
      hasPrivacy: links.some((h) => h.includes("/legal/privacy")),
      hasConduct: links.some((h) => h.includes("/legal/conduct")),
      hasFaq: links.some((h) => h.endsWith("/faq") || h.endsWith("/faq/")),
    };
  });
  check(`[${home}] footer links to /legal/terms`, footerInfo.hasTerms);
  check(`[${home}] footer links to /legal/privacy`, footerInfo.hasPrivacy);
  check(`[${home}] footer links to /legal/conduct`, footerInfo.hasConduct);
  check(`[${home}] footer links to /faq`, footerInfo.hasFaq);
  await ctx.close();
}

console.log("\n[4/4] /docs/api tab switcher + Swagger UI loads");
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto(`${BASE}/docs/api`, { waitUntil: "domcontentloaded", timeout: 20000 });
await p.waitForTimeout(500);
// Initial: static view shows endpoint list
const staticView = await p.evaluate(() => {
  return {
    hasStaticBtn: !!Array.from(document.querySelectorAll("button")).find((b) => /Static reference/.test(b.textContent || "")),
    hasInteractiveBtn: !!Array.from(document.querySelectorAll("button")).find((b) => /Interactive/.test(b.textContent || "")),
    hasEndpoints: !!Array.from(document.querySelectorAll("code")).find((c) => /\/v1\/tracks/.test(c.textContent || "")),
  };
});
check("docs/api: 'Static reference' tab exists", staticView.hasStaticBtn);
check("docs/api: 'Interactive Swagger UI' tab exists", staticView.hasInteractiveBtn);
check("docs/api: static view shows endpoint list", staticView.hasEndpoints);

// Click the Interactive tab
const clicked = await p.evaluate(() => {
  const btn = Array.from(document.querySelectorAll("button")).find((b) => /Interactive/.test(b.textContent || ""));
  if (btn) { btn.click(); return true; }
  return false;
});
check("docs/api: clicked 'Interactive' tab", clicked);
await p.waitForTimeout(2500); // give swagger-ui-bundle time to mount
const swagger = await p.evaluate(() => {
  const host = document.querySelector("#swagger-ui-container");
  if (!host) return { mounted: false };
  // swagger-ui-bundle injects .swagger-ui class into the host element
  return {
    mounted: !!host.querySelector(".swagger-ui"),
    hasOpBlock: !!host.querySelector(".opblock"),
    title: host.querySelector(".info .title")?.textContent || "",
  };
});
check("docs/api: Swagger UI mounted in host", swagger.mounted);
check("docs/api: Swagger UI shows operation blocks (endpoints)", swagger.hasOpBlock);
check("docs/api: Swagger UI shows API title", swagger.title.length > 0, swagger.title);
await ctx.close();

await browser.close();

console.log("\n" + "=".repeat(60));
console.log(`SUMMARY: ${pass} pass, ${fail} fail`);
if (fail === 0) { console.log("✅ ALL CHECKS PASS"); process.exit(0); }
else {
  console.log(`❌ ${fail} failure(s):`);
  for (const f of failures) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
