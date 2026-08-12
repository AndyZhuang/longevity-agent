import { chromium } from "playwright";
const URL = "http://localhost:5173";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`console.error: ${m.text()}`); });

const routes = [
  "/", "/skill", "/skill/q1",
  "/zh", "/zh/skill", "/zh/skill/q2", "/zh/leaderboard",
  "/fr", "/fr/skill", "/fr/skill/q3", "/fr/judges",
  "/es", "/es/skill", "/es/skill/q4", "/es/tracks",
  "/pt", "/pt/skill", "/pt/skill/q1", "/pt/sponsors",
  "/.well-known/skill.md", "/skill.md", "/skill-q1.md", "/api/openapi.yaml",
];

for (const r of routes) {
  try {
    const resp = await page.request.get(`${URL}${r}`);
    const body = await resp.text();
    console.log(`${resp.status().toString().padStart(3)} ${r.padEnd(28)} ${body.length}B`);
  } catch (e) {
    console.log(`ERR ${r} ${e.message.slice(0, 80)}`);
  }
}

if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  errors.slice(0, 8).forEach((e) => console.log("  - " + e));
}

await browser.close();
