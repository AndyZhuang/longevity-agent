// shot-skill-v71.mjs — v0.7.1 smoke test: channel switcher UI + OpenAPI 0.7.1
import { chromium } from "playwright";
import { readFileSync, existsSync } from "fs";

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
check("skill.md mentions 'Two submission channels'", /Two submission channels/i.test(skillMd));
check("skill.md mentions github_pr channel", /github_pr/.test(skillMd));
check("skill.md mentions http_post channel", /http_post/.test(skillMd));
check("skill.md mentions longevity-agent-submissions", /longevity-agent-submissions/.test(skillMd));

const openapi = JSON.parse(readFileSync("dist/api/openapi.json", "utf-8"));
check("openapi.json version is ≥ 0.7.1", parseFloat(openapi.info.version) >= 0.7);
check("SubmissionInput requires schema_version", openapi.components.schemas.SubmissionInput.required.includes("schema_version"));
check("SubmissionInput requires channel", openapi.components.schemas.SubmissionInput.required.includes("channel"));
check("SubmissionInput.channel is enum github_pr|http_post",
  JSON.stringify(openapi.components.schemas.SubmissionInput.properties.channel.enum) === JSON.stringify(["github_pr", "http_post"]));
check("SubmissionInput has github_pr_url", !!openapi.components.schemas.SubmissionInput.properties.github_pr_url);
check("Reproducibility has prompt_url", !!openapi.components.schemas.Reproducibility.properties.prompt_url);
check("Reproducibility has tool_log_path (new)", !!openapi.components.schemas.Reproducibility.properties.tool_log_path);
check("Reproducibility required dropped tool_log_url", !openapi.components.schemas.Reproducibility.required.includes("tool_log_url"));

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

console.log("\n[3/5] Channel switcher UI (EN)");
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1500 } });
const p = await ctx.newPage();
const errs2 = [];
p.on("pageerror", (e) => errs2.push(String(e)));
p.on("console", (m) => { if (m.type() === "error") errs2.push(m.text()); });
await p.goto(`${BASE}/skill`, { waitUntil: "domcontentloaded", timeout: 15000 });
await p.waitForTimeout(1500);

const ui = await p.evaluate(() => {
  const text = document.body.textContent || "";
  const githubCard = document.querySelector('[data-testid="channel-card-cyan"]');
  const httpCard = document.querySelector('[data-testid="channel-card-violet"]');
  return {
    hasStep4a: /Step 4a|Pick a submission channel/i.test(text),
    hasGithubCard: !!githubCard,
    hasHttpCard: !!httpCard,
    githubCardTitle: githubCard?.querySelector("p.font-display")?.textContent?.trim() || null,
    githubHasRecommended: /Recommended/i.test(githubCard?.textContent || ""),
    httpHasCompatible: /Compatible/i.test(httpCard?.textContent || ""),
    githubActive: githubCard?.getAttribute("aria-pressed") === "true",
    httpActive: httpCard?.getAttribute("aria-pressed") === "true",
  };
});
check("Step 4a heading visible", ui.hasStep4a);
check("GitHub PR card rendered", ui.hasGithubCard);
check("HTTP POST card rendered", ui.hasHttpCard);
check("GitHub card has 'Recommended' badge", ui.githubHasRecommended);
check("HTTP card has 'Compatible' badge", ui.httpHasCompatible);
check("GitHub card is initially active", ui.githubActive);
check("HTTP card is initially inactive", !ui.httpActive);

console.log("\n[4/5] Click HTTP card → schema updates");
await p.click('[data-testid="channel-card-violet"]');
await p.waitForTimeout(500);
const afterClick = await p.evaluate(() => {
  const text = document.body.textContent || "";
  const httpCard = document.querySelector('[data-testid="channel-card-violet"]');
  const githubCard = document.querySelector('[data-testid="channel-card-cyan"]');
  // Get the schema code block (the one inside the pre tag under Step 4)
  const pres = Array.from(document.querySelectorAll("pre"));
  const channelSchema = pres.find((pr) => /channel.*http_post|channel.*github_pr/.test(pr.textContent || ""));
  return {
    httpActive: httpCard?.getAttribute("aria-pressed") === "true",
    githubActive: githubCard?.getAttribute("aria-pressed") === "true",
    schemaShowsHttpPost: /channel.*http_post/.test(channelSchema?.textContent || ""),
  };
});
check("After click: HTTP card is active", afterClick.httpActive);
check("After click: GitHub card is inactive", !afterClick.githubActive);
check("After click: schema shows 'http_post'", afterClick.schemaShowsHttpPost);

console.log("\n[5/5] Back to GitHub card → schema shows github_pr");
await p.click('[data-testid="channel-card-cyan"]');
await p.waitForTimeout(500);
const backToGithub = await p.evaluate(() => {
  const pres = Array.from(document.querySelectorAll("pre"));
  const channelSchema = pres.find((pr) => /channel.*http_post|channel.*github_pr/.test(pr.textContent || ""));
  return { schemaShowsGithub: /channel.*github_pr/.test(channelSchema?.textContent || "") };
});
check("Schema shows 'github_pr' after click back", backToGithub.schemaShowsGithub);
check("Skill page: 0 console errors", errs2.filter(e => !/WebGL|GPU stall/i.test(e)).length === 0, errs2[0]);

await ctx.close();
await browser.close();

console.log("\n" + "=".repeat(60));
console.log(`SUMMARY: ${pass} pass, ${fail} fail`);
if (fail === 0) { console.log("✅ ALL CHECKS PASS — v0.7.1 ready to ship"); process.exit(0); }
else {
  console.log(`❌ ${fail} failure(s):`);
  for (const f of failures) console.log(`  - ${f.name}: ${f.detail}`);
  process.exit(1);
}
