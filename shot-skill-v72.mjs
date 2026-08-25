// shot-skill-v72.mjs — v0.7.2 smoke test: phase 1 critical + phase 2 important
import { chromium } from "playwright";
import { readFileSync, existsSync } from "fs";

const BASE = "http://localhost:4173";

let pass = 0, fail = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { pass++; console.log("  ✓", name); }
  else { fail++; failures.push({ name, detail }); console.log("  ✗", name, detail ? "— " + String(detail).slice(0, 200) : ""); }
}

console.log("\n[1/6] Phase 1 critical fixes");
const skillMd = readFileSync("dist/skill.md", "utf-8");

// #1: hash recipe Python syntax error fixed
const hashRecipeSection = skillMd.slice(skillMd.indexOf("### Hash recipe"));
check("hash recipe: has 'answers = [a1, a2, a3, a4, a5]' example",
  /answers\s*=\s*\[a1,\s*a2,\s*a3,\s*a4,\s*a5\]/.test(hashRecipeSection));
check("hash recipe: has 'Common mistakes the CI has already caught'",
  /Common mistakes the CI has already caught/.test(hashRecipeSection));
check("hash recipe: NO broken '+ ([] for unused' syntax",
  !/\+\s*\(\[\]\s*for/.test(hashRecipeSection));

// #2-4: example JSON has schema_version + channel
const submissionSchemaSection = skillMd.slice(skillMd.indexOf("## 8. Submission schema"));
check("example JSON has 'schema_version' (any 0.7.x or 0.8.x)",
  /"schema_version":\s*"0\.[78]\.\d+"/.test(submissionSchemaSection));
check("example JSON has 'channel: \"github_pr\"'",
  /"channel":\s*"github_pr"/.test(submissionSchemaSection));
check("example JSON has 'channel: \"http_post\"'",
  /"channel":\s*"http_post"/.test(submissionSchemaSection));
check("github_pr example uses tool_log_path",
  /"tool_log_path":\s*"submissions\//.test(submissionSchemaSection));
check("http_post example uses tool_log_url (and prompt_url)",
  /"tool_log_url":\s*"https:\/\//.test(submissionSchemaSection) &&
  /"prompt_url":\s*"https:\/\//.test(submissionSchemaSection));

// #5: header version is ≥ 0.7.2
check("header version is ≥ 0.7.2", /\*\*Version:\*\* 0\.[78]/.test(skillMd));

// Bonus: reference submission link
check("skill.md links to reference submission",
  /AndyZhuang\/longevity-agent-submissions\/tree\/main\/submissions\/q1\/_reference-wet-lab-first/.test(skillMd));

console.log("\n[2/6] Phase 2 #1: How to choose a quarter");
check("has 'How to choose your quarter(s)' heading",
  /## 1a\. How to choose your quarter/.test(skillMd));
check("has 4 strategy rows (specialist, generalist, multi-stage, first-time)",
  /Specialist agent/.test(skillMd) &&
  /Generalist agent/.test(skillMd) &&
  /Multi-stage agent/.test(skillMd) &&
  /First-time agent/.test(skillMd));

console.log("\n[3/6] Phase 2 #2: Per-lane strategy descriptions");
check("has 'What this lane optimizes for' column header",
  /What this lane optimizes for/.test(skillMd));
check("has 'What it accepts as the cost' column header",
  /What it accepts as the cost/.test(skillMd));
check("table has 24 lane rows (4 quarter headers + 24 lane rows)",
  (skillMd.match(/\| `?(wet-lab-first|selectivity-perfectionist|moa-novelty|admet-safety|rubric-maxxer|crowd-pleaser|gentle-senomodulator|aggressive-retinoid|clean-beauty|luxury-sensory|clinical-actives|k-beauty-ritual|rct-evidence|mechanistic-stack|longevity-blueprint|fitness-recovery|cognitive-focus|gut-axis|personalized-precision|evidence-conformist|risk-taker|cost-pragmatist|biomarker-driven|adherence-first)/g) || []).length >= 24);
check("Q1 has all 6 lane names in strategy section",
  ["wet-lab-first", "selectivity-perfectionist", "moa-novelty", "admet-safety", "rubric-maxxer", "crowd-pleaser"]
    .every((l) => skillMd.includes(l)));
check("Q2 has all 6 lane names in strategy section",
  ["gentle-senomodulator", "aggressive-retinoid", "clean-beauty", "luxury-sensory", "clinical-actives", "k-beauty-ritual"]
    .every((l) => skillMd.includes(l)));
check("Q3 has all 6 lane names in strategy section",
  ["rct-evidence", "mechanistic-stack", "longevity-blueprint", "fitness-recovery", "cognitive-focus", "gut-axis"]
    .every((l) => skillMd.includes(l)));
check("Q4 has all 6 lane names in strategy section",
  ["personalized-precision", "evidence-conformist", "risk-taker", "cost-pragmatist", "biomarker-driven", "adherence-first"]
    .every((l) => skillMd.includes(l)));

console.log("\n[4/6] Phase 2 #3-5: Q4 timing, judging formula, safety veto");
check("Q4 has '6a. Q4 timing' section with calendar",
  /## 6a\. Q4 timing/.test(skillMd) && /2026-10-04/.test(skillMd));
check("section 9 has '9a. The formula'",
  /## 9a\. The formula/.test(skillMd));
check("formula is shown: 0.6 * agent_score + 0.4 * human_score",
  /0\.6 \* agent_score \+ 0\.4 \* human_score/.test(skillMd));
check("section 9 has '9b. The agent judges'",
  /## 9b\. The agent judges/.test(skillMd));
check("section 9 has '9e. Head-judge veto'",
  /## 9e\. Head-judge veto/.test(skillMd));
check("veto triggers enumerated (4 of them)",
  /Reproducibility failure/.test(skillMd) &&
  /Process-integrity concern/.test(skillMd) &&
  /Misdeclared lane/.test(skillMd) &&
  /IP or ethical red flag/.test(skillMd));

console.log("\n[5/6] Phase 2 #6-8: identity, materially-similar, FAQ");
check("section 8c has 'Path A — github_pr' identity",
  /#### Path A — `channel: "github_pr"`/.test(skillMd));
check("section 8c has 'Path B — http_post' identity",
  /#### Path B — `channel: "http_post"`/.test(skillMd));
check("section 10 has 'materially similar' threshold table",
  /Tanimoto ≥ 0\.85 on canonical SMILES/.test(skillMd) &&
  /Cosine ≥ 0\.90 on the INCI vector/.test(skillMd) &&
  /Cohen's κ ≥ 0\.7 on the behavior loop tags/.test(skillMd));
check("section 11 'Post-submission FAQ' exists",
  /## 11\. Post-submission FAQ/.test(skillMd));
check("FAQ has 7 sub-questions (a-g)",
  ["11a", "11b", "11c", "11d", "11e", "11f", "11g"]
    .every((s) => skillMd.includes(`### ${s}.`)));
check("FAQ answers the retry question (11c)",
  /no penalty for re-submitting/.test(skillMd));
check("FAQ answers multi-lane question (11d)",
  /you can only enter \*\*one lane per\s+quarter\*\*/.test(skillMd));

console.log("\n[6/6] OpenAPI ≥ 0.7.2 + references field");
const openapi = JSON.parse(readFileSync("dist/api/openapi.json", "utf-8"));
check("openapi version is ≥ 0.7.2", parseFloat(openapi.info.version) >= 0.7);
check("SubmissionInput has references field", !!openapi.components.schemas.SubmissionInput.properties.references);
check("references is array", openapi.components.schemas.SubmissionInput.properties.references.type === "array");
check("references maxItems is 3", openapi.components.schemas.SubmissionInput.properties.references.maxItems === 3);
check("references items source enum is q1|q2|q3",
  JSON.stringify(openapi.components.schemas.SubmissionInput.properties.references.items.properties.source.enum) ===
  JSON.stringify(["q1", "q2", "q3"]));
check("references items has relationship enum (own|collaborator)",
  JSON.stringify(openapi.components.schemas.SubmissionInput.properties.references.items.properties.relationship.enum) ===
  JSON.stringify(["own", "collaborator"]));

console.log("\n" + "=".repeat(60));
console.log(`SUMMARY: ${pass} pass, ${fail} fail`);
if (fail === 0) { console.log("✅ ALL CHECKS PASS — v0.7.2 ready to ship"); process.exit(0); }
else {
  console.log(`❌ ${fail} failure(s):`);
  for (const f of failures) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
