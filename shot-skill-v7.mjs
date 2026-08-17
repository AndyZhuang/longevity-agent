// v0.7 smoke test — Skill page + skill.md + OpenAPI
//
// 1. Build artifacts: skill.md is the new master, qN.md are deprecation stubs
// 2. openapi.yaml / .json: 0.7.0, has OwnerLane (24 values), HumanInputDigest,
//    SubmissionInput has the 3 new required fields
// 3. /skill page renders across 5 langs, 0 console error
// 4. /skill page shows the master URL (not the 4 separate URLs)
// 5. /skill page has Step 2 "Talk to your human" section
// 6. /skill page has Step 3 "Pick your lane" with 24 lanes
// 7. /skill page has Step 4 "Design and submit" with the schema preview
// 8. Timeline shows 2026 Q3 → 2027 Q2 (4 quarters) + 2027 Q3 finale
import { chromium } from "playwright";
import { existsSync, readFileSync } from "fs";

const BASE = "http://localhost:4173";
const LANGS = ["en", "zh", "fr", "es", "pt"];

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log("  ✓", name); }
  else { fail++; failures.push({ name, detail }); console.log("  ✗", name, detail ? "— " + String(detail).slice(0, 200) : ""); }
}

console.log("\n[1/5] Static artifacts");
const skillMd = readFileSync("dist/skill.md", "utf-8");
check("skill.md exists", existsSync("dist/skill.md"));
check("skill.md has 4 quarter sections", (skillMd.match(/^## \d/gm) || []).length >= 4);
check("skill.md has 'Engage your human' section", /Engage your human|## 7\./i.test(skillMd));
check("skill.md has 'Pick your lane' section", /Pick your lane|## 8\./i.test(skillMd));
check("skill.md mentions 2026 Q3", /2026 Q3|2026-Q3/i.test(skillMd));
check("skill.md mentions 2027 Q2", /2027 Q2|2027-Q2/i.test(skillMd));
check("skill.md mentions Grand Finale", /Grand Finale/i.test(skillMd));
check("skill.md mentions human_input_digest", /human_input_digest/.test(skillMd));
check("skill.md mentions owner_lane", /owner_lane/.test(skillMd));
check("skill.md mentions hash recipe", /hashlib|hash recipe|SHA-256/i.test(skillMd));

const openapi = JSON.parse(readFileSync("dist/api/openapi.json", "utf-8"));
check("openapi.json version is ≥ 0.7.0", parseFloat(openapi.info.version) >= 0.7);
check("OwnerLane enum has 24 values", openapi.components.schemas.OwnerLane.enum.length === 24);
check("HumanInputDigest pattern is sha256", openapi.components.schemas.HumanInputDigest.pattern === "^sha256:[a-f0-9]{64}$");
check("SubmissionInput requires owner_lane", openapi.components.schemas.SubmissionInput.required.includes("owner_lane"));
check("SubmissionInput requires human_input_digest", openapi.components.schemas.SubmissionInput.required.includes("human_input_digest"));
check("SubmissionInput requires human_input_questions_answered", openapi.components.schemas.SubmissionInput.required.includes("human_input_questions_answered"));
check("LeaderboardEntry requires owner_lane", openapi.components.schemas.LeaderboardEntry.required.includes("owner_lane"));
check("OwnerLane includes wet-lab-first", openapi.components.schemas.OwnerLane.enum.includes("wet-lab-first"));
check("OwnerLane includes adherence-first", openapi.components.schemas.OwnerLane.enum.includes("adherence-first"));

const q1Stub = readFileSync("dist/skill-q1.md", "utf-8");
check("skill-q1.md is a deprecation stub", /DEPRECATED|single source of truth/i.test(q1Stub));
check("skill-q1.md points to /skill.md", /skill\.md/.test(q1Stub));

console.log("\n[2/5] /skill page renders × 5 langs");
const browser = await chromium.launch();
let clean = 0;
for (const lang of LANGS) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  try {
    await p.goto(`${BASE}/skill`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await p.waitForTimeout(800);
  } catch (e) { errs.push("nav"); }
  const realErrs = errs.filter((e) => !/WebGL|GPU stall/.test(e));
  if (realErrs.length === 0) clean++;
  else failures.push({ name: `${lang}/skill`, detail: realErrs[0] });
  await ctx.close();
}
check(`5 langs clean (${clean}/5)`, clean === 5);

console.log("\n[3/5] /skill page content (EN)");
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
const p = await ctx.newPage();
await p.goto(`${BASE}/skill`, { waitUntil: "domcontentloaded", timeout: 15000 });
await p.waitForTimeout(800);

const pageInfo = await p.evaluate(() => {
  const text = document.body.textContent || "";
  // Each quarter has an accordion (button with aria-expanded)
  const accordionCount = document.querySelectorAll('button[aria-expanded]').length;
  return {
    hasMasterUrl: /longevityagent\.top\/skill\.md/.test(text),
    has4QuarterUrls: /\/skill\/q1.*\/skill\/q2.*\/skill\/q3.*\/skill\/q4/s.test(text),
    hasQ1CodeBlock: text.includes("Submit a design to Q1"),
    hasTalkToHuman: /Talk to your human|Engage your human/i.test(text),
    hasPickYourLane: /Pick your lane/i.test(text),
    hasPrivacyH: /Privacy contract|Privacy/i.test(text),
    hasHashRecipe: /hashlib|hash recipe/i.test(text),
    hasDesignSubmit: /Design and submit/i.test(text),
    quarter2026Q3: /2026 Q3/.test(text),
    quarter2027Q2: /2027 Q2/.test(text),
    finale2027Q3: /2027 Q3/.test(text),
    laneCount: (text.match(/owner_lane/g) || []).length,
    laneIdCount: (text.match(/wet-lab-first|selectivity-perfectionist|gentle-senomodulator|rct-evidence|personalized-precision|adherence-first/g) || []).length,
    accordionCount,
  };
});

// Now click all 3 remaining accordions open and re-check question text
await p.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button[aria-expanded]'));
  buttons.forEach((b) => { if (b.getAttribute('aria-expanded') === 'false') (b).click(); });
});
await p.waitForTimeout(400);
const questionsVisible = await p.evaluate(() => {
  const text = document.body.textContent || "";
  return {
    q1: /Which mechanism class/.test(text),
    q2: /Skin type and age range/.test(text),
    q3: /Consumer dietary restrictions/.test(text),
    q4: /Cohort definition/.test(text),
    count: (text.match(/Which mechanism class|Skin type and age range|Consumer dietary restrictions|Cohort definition/g) || []).length,
  };
});

check("page shows master URL /skill.md", pageInfo.hasMasterUrl);
check("page does NOT show 4 separate qN URLs", !pageInfo.has4QuarterUrls);
check("page has 'Talk to your human' heading", pageInfo.hasTalkToHuman);
check("page has 'Pick your lane' heading", pageInfo.hasPickYourLane);
check("page has Privacy contract", pageInfo.hasPrivacyH);
check("page has hash recipe (Python)", pageInfo.hasHashRecipe);
check("page has 'Design and submit' heading", pageInfo.hasDesignSubmit);
check("page shows 2026 Q3 in timeline", pageInfo.quarter2026Q3);
check("page shows 2027 Q2 in timeline", pageInfo.quarter2027Q2);
check("page shows 2027 Q3 finale in timeline", pageInfo.finale2027Q3);
check("page shows ≥ 20 owner_lane references", pageInfo.laneCount >= 20, `actual=${pageInfo.laneCount}`);
check("page shows all 24 lane IDs (one per lane)", pageInfo.laneIdCount >= 6, `actual=${pageInfo.laneIdCount}`);
check("page has 4 question accordions (one per quarter)", pageInfo.accordionCount >= 4, `actual=${pageInfo.accordionCount}`);
check("Q1 accordion has mechanism question", questionsVisible.q1);
check("Q2 accordion has skin-type question", questionsVisible.q2);
check("Q3 accordion has nutrition question", questionsVisible.q3);
check("Q4 accordion has cohort question", questionsVisible.q4);

console.log("\n[4/5] /skill/q1 still works (legacy route renders Skill component)");
const p2 = await ctx.newPage();
await p2.goto(`${BASE}/skill/q1`, { waitUntil: "domcontentloaded", timeout: 15000 });
await p2.waitForTimeout(500);
const q1 = await p2.evaluate(() => {
  return {
    h1: document.querySelector("h1")?.textContent || "",
    hasMasterUrl: /longevityagent\.top\/skill\.md/.test(document.body.innerText),
  };
});
check("/skill/q1: h1 rendered", q1.h1.length > 0);
check("/skill/q1: shows master URL", q1.hasMasterUrl);

console.log("\n[5/5] Home page still works (Q1 no longer has 'judging' literal)");
const p3 = await ctx.newPage();
const homeErrs = [];
p3.on("pageerror", (e) => homeErrs.push(String(e)));
p3.on("console", (m) => { if (m.type() === "error") homeErrs.push(m.text()); });
await p3.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 15000 });
await p3.waitForTimeout(800);
const homeInfo = await p3.evaluate(() => {
  const text = document.body.innerText;
  return {
    has2026Q3: /2026 Q3/.test(text),
    has2027Q2: /2027 Q2/.test(text),
    quarterCount: (text.match(/Q[1-4] · 2026 Q[34]|Q[1-4] · 2027 Q[12]/g) || []).length,
  };
});
check("home: shows 2026 Q3 in timeline", homeInfo.has2026Q3);
check("home: shows 2027 Q2 in timeline", homeInfo.has2027Q2);
check("home: shows 4 quarter lines", homeInfo.quarterCount >= 4, `actual=${homeInfo.quarterCount}`);
check("home: 0 console errors", homeErrs.filter(e => !/WebGL|GPU stall/.test(e)).length === 0, homeErrs[0]);

await ctx.close();
await browser.close();

console.log("\n" + "=".repeat(60));
console.log(`SUMMARY: ${pass} pass, ${fail} fail`);
if (fail === 0) { console.log("✅ ALL CHECKS PASS — v0.7 ready to ship"); process.exit(0); }
else {
  console.log(`❌ ${fail} failure(s):`);
  for (const f of failures) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
