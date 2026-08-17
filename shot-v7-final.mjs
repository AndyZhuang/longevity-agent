// shot-v7-final.mjs — quick final check: home + skill + swagger + 5 langs key
import { chromium } from "playwright";
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
let pass = 0, fail = 0;
const failList = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log("  ✓", name); }
  else { fail++; failList.push(name + " — " + (detail||"")); console.log("  ✗", name, "—", detail||""); }
}

console.log("\n[A] / (home)");
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
await p.goto("http://localhost:4173/", { waitUntil: "load", timeout: 30000 });
await p.waitForTimeout(2000);
const home = await p.evaluate(() => {
  const t = document.body.textContent || "";
  return {
    qCount: (t.match(/Q[1-4] · 202[6-7] Q[1-4]/g) || []).length,
    has2026Q3: /2026 Q3/.test(t),
    has2027Q2: /2027 Q2/.test(t),
    hasGrandFinale: /Grand Finale|Geneva/i.test(t),
  };
});
check("home: shows 4 quarters with calendar labels", home.qCount >= 4, `actual=${home.qCount}`);
check("home: 2026 Q3 mentioned", home.has2026Q3);
check("home: 2027 Q2 mentioned", home.has2027Q2);
check("home: Grand Finale / Geneva mentioned", home.hasGrandFinale);
check("home: 0 console errors", errs.filter(e => !/WebGL|GPU stall/i.test(e)).length === 0, errs[0]);

console.log("\n[B] /skill 5 langs");
for (const lang of ["en", "zh", "fr", "es", "pt"]) {
  errs.length = 0;
  await p.goto(`http://localhost:4173/${lang}/skill`, { waitUntil: "load", timeout: 30000 });
  await p.waitForTimeout(2000);
  const ok = errs.filter(e => !/WebGL|GPU stall/i.test(e)).length === 0;
  check(`/skill ${lang} clean`, ok, errs[0]);
}

console.log("\n[C] /docs swagger");
errs.length = 0;
await p.goto("http://localhost:4173/docs", { waitUntil: "load", timeout: 30000 });
await p.waitForTimeout(2500);
try {
  await p.click('a:has-text("Submission API"), button:has-text("Submission API")', { timeout: 5000 });
  await p.waitForTimeout(1500);
  await p.click('button:has-text("Interactive Swagger UI")', { timeout: 5000 });
  await p.waitForTimeout(7000);
} catch (e) {
  console.log("  (nav/click warning: " + e.message.split("\n")[0] + ")");
}
const docs = await p.evaluate(() => {
  const hasSw = !!document.querySelector(".swagger-ui");
  const hasOp = !!document.querySelector(".opblock");
  const text = document.querySelector(".swagger-ui-host")?.textContent || "";
  return { hasSw, hasOp, version: /0\.7\.0/.test(text) };
});
check("docs: swagger-ui present", docs.hasSw);
check("docs: at least 1 opblock", docs.hasOp);
check("docs: spec shows v0.7.0", docs.version);
check("docs: 0 console errors", errs.filter(e => !/WebGL|GPU stall/i.test(e)).length === 0, errs[0]);

console.log("\n" + "=".repeat(50));
console.log(`FINAL: ${pass} pass, ${fail} fail`);
if (fail > 0) failList.forEach(f => console.log("  -", f));
await browser.close();
process.exit(fail === 0 ? 0 : 1);
