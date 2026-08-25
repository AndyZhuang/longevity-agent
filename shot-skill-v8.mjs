// shot-skill-v8.mjs — v0.8.0 smoke test: participation meta contract
import { chromium } from "playwright";
import { readFileSync } from "fs";

const BASE = "http://localhost:4173";

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log("  ✓", name); }
  else { fail++; failures.push({ name, detail }); console.log("  ✗", name, detail ? "— " + String(detail).slice(0, 200) : ""); }
}

console.log("\n[1/4] Static artifacts — skill.md");
const skillMd = readFileSync("dist/skill.md", "utf-8");

// Header version
check("header version is 0.8.0", /\*\*Version:\*\* 0\.8\.0/.test(skillMd));

// Step 2a exists
check("Step 2a heading exists", /### Step 2a — Set the participation meta/.test(skillMd));
check("Step 2a body explains 5 meta questions", /5 meta questions in Section 7a/.test(skillMd));

// Section 7a exists
check("Section 7a 'META questions' exists", /### 7a\. META questions/.test(skillMd));
check("7a lists 5 questions",
  /Time budget per week/.test(skillMd) &&
  /Submission strategy/.test(skillMd) &&
  /Primary goal/.test(skillMd) &&
  /Collaboration style/.test(skillMd) &&
  /Risk tolerance/.test(skillMd));

// Section 7c-7f renumbered
check("7c Q1 design questions exists", /### 7c\. Q1 — Molecular Longevity design questions/.test(skillMd));
check("7d Q2 design questions exists", /### 7d\. Q2 — Topical Skincare design questions/.test(skillMd));
check("7e Q3 design questions exists", /### 7e\. Q3 — Functional Nutrition design questions/.test(skillMd));
check("7f Q4 design questions exists", /### 7f\. Q4 — Holistic Protocol design questions/.test(skillMd));

// Two-tier privacy
check("8b has 'Privacy contract (two-tier)'", /### 8b\. Privacy contract \(two-tier\)/.test(skillMd));
check("8b has Tier 1 — Design answers (private always)", /Tier 1 — Design answers \(Section 7c.*private always\)/.test(skillMd));
check("8b has Tier 2 — Meta answers (public by default)", /Tier 2 — Meta answers \(Section 7a.*public by default\)/.test(skillMd));

// Example JSON has meta fields
check("Path A example has human_input_meta_digest", /"human_input_meta_digest":\s*"sha256:/.test(skillMd));
check("Path A example has human_input_meta_questions_answered: 5", /"human_input_meta_questions_answered":\s*5/.test(skillMd));
check("Path A example has human_input_meta_visibility: 'public'", /"human_input_meta_visibility":\s*"public"/.test(skillMd));
check("Path A example has human_input_meta_answers block with 5 keys",
  /"human_input_meta_answers":\s*\{[^}]*"q1":/.test(skillMd) &&
  /"q2":/.test(skillMd) && /"q3":/.test(skillMd) && /"q4":/.test(skillMd) && /"q5":/.test(skillMd));
check("Path B example also has meta fields", /"channel":\s*"http_post"[\s\S]{0,2000}"human_input_meta_digest":\s*"sha256:/.test(skillMd));

// Both examples have v0.8.0
const v08Count = (skillMd.match(/"schema_version":\s*"0\.8\.0"/g) || []).length;
check("skill.md has schema_version 0.8.0 in 2 example payloads", v08Count === 2, `actual=${v08Count}`);

console.log("\n[2/4] Static artifacts — openapi.json");
const openapi = JSON.parse(readFileSync("dist/api/openapi.json", "utf-8"));
check("openapi version 0.8.0", openapi.info.version === "0.8.0");
check("SubmissionInput required includes human_input_meta_digest",
  openapi.components.schemas.SubmissionInput.required.includes("human_input_meta_digest"));
check("SubmissionInput required includes human_input_meta_questions_answered",
  openapi.components.schemas.SubmissionInput.required.includes("human_input_meta_questions_answered"));
check("human_input_meta_visibility default is 'public'",
  openapi.components.schemas.SubmissionInput.properties.human_input_meta_visibility.default === "public");
check("human_input_meta_visibility enum is public|private",
  JSON.stringify(openapi.components.schemas.SubmissionInput.properties.human_input_meta_visibility.enum) ===
  JSON.stringify(["public", "private"]));
check("MetaQuestionsAnswered enum is [5]",
  JSON.stringify(openapi.components.schemas.MetaQuestionsAnswered.enum) === JSON.stringify([5]));
check("Submission has human_input_meta_answers object with 5 q-keys",
  ["q1", "q2", "q3", "q4", "q5"].every((q) => !!openapi.components.schemas.Submission.properties.human_input_meta_answers.properties[q]));
check("Submission has human_input_meta_digest (required)",
  openapi.components.schemas.Submission.required.includes("human_input_meta_digest"));
check("MetaVisibility default is 'public'",
  openapi.components.schemas.MetaVisibility.default === "public");

console.log("\n[3/4] Static artifacts — i18n");
for (const lang of ["en", "zh", "fr", "es", "pt"]) {
  const data = JSON.parse(readFileSync(`src/i18n/locales/${lang}.json`, "utf-8"));
  check(`i18n ${lang}: skill.meta_h exists`, !!data.skill?.meta_h);
  check(`i18n ${lang}: skill.meta_q1_h through q5_h all exist`,
    ["meta_q1_h", "meta_q2_h", "meta_q3_h", "meta_q4_h", "meta_q5_h"].every((k) => !!data.skill?.[k]));
  check(`i18n ${lang}: skill.privacy_tier1_h + privacy_tier2_h exist`,
    !!data.skill?.privacy_tier1_h && !!data.skill?.privacy_tier2_h);
}

console.log("\n[4/4] /skill page renders × 5 langs + Step 2a visible");
const browser = await chromium.launch();
let clean = 0;
for (const lang of ["en", "zh", "fr", "es", "pt"]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1500 } });
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

// Check Step 2a is in the DOM
const ctx = await browser.newContext({ viewport: { width: 1280, height: 2000 } });
const p = await ctx.newPage();
await p.goto(`${BASE}/skill`, { waitUntil: "domcontentloaded", timeout: 15000 });
await p.waitForTimeout(1500);
const step2a = await p.evaluate(() => {
  const text = document.body.textContent || "";
  const hasStep2a = /Step 2a|Step 2 · v0\.8|Set the participation meta/.test(text);
  const hasPublicBadge = /PUBLIC by default/.test(text);
  const metaQ1 = /Meta Q1|Time budget per week|M1[\s\S]{0,300}Time budget/.test(text);
  const has5Meta = (text.match(/Meta Q[1-5]:|M[1-5]\b/g) || []).length >= 5;
  return { hasStep2a, hasPublicBadge, metaQ1, has5Meta };
});
check("Step 2a section visible in DOM", step2a.hasStep2a);
check("PUBLIC by default badge visible", step2a.hasPublicBadge);
check("At least 5 meta question items visible", step2a.has5Meta);
check("Meta Q1 (time budget) visible", step2a.metaQ1);
await ctx.close();
await browser.close();

console.log("\n" + "=".repeat(60));
console.log(`SUMMARY: ${pass} pass, ${fail} fail`);
if (fail === 0) { console.log("✅ ALL CHECKS PASS — v0.8.0 ready to ship"); process.exit(0); }
else {
  console.log(`❌ ${fail} failure(s):`);
  for (const f of failures) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
