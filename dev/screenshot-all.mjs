import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const URL = "http://localhost:5173";
const OUT = "dev-screenshots";
await mkdir(OUT, { recursive: true });

const pages = [
  { path: "/", name: "01-home" },
  { path: "/tracks", name: "02-tracks" },
  { path: "/tracks/q1", name: "03-track-detail-q1" },
  { path: "/leaderboard", name: "04-leaderboard" },
  { path: "/judges", name: "05-judges" },
  { path: "/prizes", name: "06-prizes" },
  { path: "/sponsors", name: "07-sponsors" },
  { path: "/register", name: "08-register" },
  { path: "/docs", name: "09-docs" },
  { path: "/docs/targets", name: "10-docs-targets" },
  { path: "/docs/api", name: "11-docs-api" },
  { path: "/docs/rules", name: "12-docs-rules" },
  { path: "/manifesto", name: "13-manifesto" },
  { path: "/about", name: "14-about" },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(`console.error: ${msg.text()}`);
});

let failures = 0;
for (const p of pages) {
  try {
    await page.goto(`${URL}${p.path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(800);
    const out = `${OUT}/${p.name}.png`;
    await page.screenshot({ path: out, fullPage: true });
    const t = await page.title();
    console.log(`OK  ${p.path.padEnd(22)} → ${out}  (${t})`);
  } catch (e) {
    failures++;
    console.log(`FAIL ${p.path.padEnd(22)} ${e instanceof Error ? e.message.slice(0, 120) : e}`);
  }
}

if (consoleErrors.length) {
  console.log(`\nConsole errors (${consoleErrors.length}):`);
  consoleErrors.slice(0, 20).forEach((e) => console.log("  - " + e));
}

await browser.close();
console.log(`\nDone. ${pages.length - failures}/${pages.length} OK.`);
process.exit(failures > 0 ? 1 : 0);
