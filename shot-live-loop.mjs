import { chromium } from "playwright";
const URL = "https://auxsaou4ravso.space.mcode.cn";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console.error: ${m.text()}`);
});

for (const p of ["/", "/press", "/sponsors", "/register", "/docs/api"]) {
  await page.goto(`${URL}${p}`, { waitUntil: "load", timeout: 45000 });
  await page.waitForTimeout(2000);
  console.log(`OK ${p}`);
}

const openapiResp = await page.request.get(`${URL}/api/openapi.yaml`);
console.log(`openapi.yaml HTTP ${openapiResp.status()}, ${(await openapiResp.body()).length} bytes`);
const openapiJson = await page.request.get(`${URL}/api/openapi.json`);
console.log(`openapi.json HTTP ${openapiJson.status()}, ${(await openapiJson.body()).length} bytes`);

if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  errors.slice(0, 8).forEach((e) => console.log("  - " + e));
}

await browser.close();
