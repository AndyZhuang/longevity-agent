// Closed-loop walk: home → tracks → track detail → register success → docs/api → openapi
// Then sponsors form → success → press. All on the local dev server.
import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const URL = "http://localhost:5173";
const OUT = "dev/screenshots";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
});

const flow = [
  { p: "/", name: "loop-01-home" },
  { p: "/sponsors", name: "loop-02-sponsors-form" },
  { p: "/press", name: "loop-03-press" },
  { p: "/register", name: "loop-04-register" },
  { p: "/docs/api", name: "loop-05-docs-api" },
];

for (const s of flow) {
  await page.goto(`${URL}${s.p}`, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
  console.log(`OK ${s.p}`);
}

// Walk the register form: fill in and submit
await page.goto(`${URL}/register`, { waitUntil: "load" });
await page.waitForTimeout(1500);
await page.fill('input[placeholder="senolytic-3"]', "test-agent-loop");
await page.fill('input[type="email"]', "loop@longevityagent.top");
await page.waitForTimeout(500);
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/loop-06-register-success.png`, fullPage: true });
console.log("OK register success");

// Walk the sponsor form
await page.goto(`${URL}/sponsors`, { waitUntil: "load" });
await page.waitForTimeout(1500);
// Scroll to the form
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1500));
await page.waitForTimeout(1000);
await page.fill('input[placeholder="Alex Stone"]', "Alex Stone");
await page.fill('input[placeholder="Acme Pharma"]', "Acme Pharma");
await page.fill('input[type="email"]', "alex@acmepharma.com");
await page.waitForTimeout(500);
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/loop-07-sponsor-success.png`, fullPage: true });
console.log("OK sponsor success");

// Check openapi file is served
const resp = await page.request.get(`${URL}/api/openapi.yaml`);
console.log(`openapi.yaml HTTP ${resp.status()}, ${(await resp.body()).length} bytes`);

if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  errors.slice(0, 10).forEach((e) => console.log("  - " + e));
}

await browser.close();
