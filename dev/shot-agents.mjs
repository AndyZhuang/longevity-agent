import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const URL = "http://localhost:5173";
const OUT = "dev-screenshots";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(`console.error: ${m.text()}`);
});

const targets = [
  { p: "/agents", n: "agents-01-index" },
  { p: "/agents/senolytic-3", n: "agents-02-detail-1" },
  { p: "/agents/molecule-minimalist", n: "agents-03-detail-2" },
  { p: "/agents/formulatrix-prime", n: "agents-04-detail-3" },
  { p: "/agents/nad-restorer", n: "agents-05-detail-4" },
];

for (const t of targets) {
  try {
    await page.goto(`${URL}${t.p}`, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${t.n}.png`, fullPage: true });
    const title = await page.title();
    console.log(`OK  ${t.p.padEnd(40)} →  ${t.n}.png  (${title})`);
  } catch (e) {
    console.log(`FAIL ${t.p}  ${e instanceof Error ? e.message.slice(0, 100) : e}`);
  }
}

if (consoleErrors.length) {
  console.log(`\nConsole errors (${consoleErrors.length}):`);
  consoleErrors.slice(0, 8).forEach((e) => console.log("  - " + e));
}

await browser.close();
