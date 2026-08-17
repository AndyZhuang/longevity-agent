// Debug Swagger UI mount failure
import { chromium } from "playwright";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();

p.on("console", (m) => console.log(`[${m.type()}]`, m.text().slice(0, 500)));
p.on("pageerror", (e) => console.log("[pageerror]", String(e)));
p.on("requestfailed", (req) => console.log("[requestfailed]", req.url(), req.failure()?.errorText));
p.on("response", (res) => {
  if (res.url().includes("swagger") || res.url().includes("openapi")) {
    console.log(`[response ${res.status()}]`, res.url());
  }
});

await p.goto("http://localhost:4173/docs/api", { waitUntil: "domcontentloaded", timeout: 20000 });
await p.waitForTimeout(500);

// Click the Interactive tab
await p.evaluate(() => {
  const btn = Array.from(document.querySelectorAll("button")).find((b) => /Interactive/.test(b.textContent || ""));
  if (btn) btn.click();
  console.log("[click] Interactive tab");
});

await p.waitForTimeout(5000);

// Check the state
const state = await p.evaluate(() => {
  return {
    hasSwaggerUIBundle: typeof window.SwaggerUIBundle,
    hasStandalone: typeof window.SwaggerUIStandalonePreset,
    hasUi: typeof window.ui,
    hasGlobal: typeof window.global,
    hasProcess: typeof window.process,
  };
});
console.log("\n--- GLOBALS ---");
console.log(JSON.stringify(state, null, 2));

// Try calling SwaggerUIBundle directly to see what happens
const directTest = await p.evaluate(() => {
  try {
    const result = window.SwaggerUIBundle({
      url: "/api/openapi.json",
      dom_id: "#swagger-ui-container",
      layout: "BaseLayout",
      tryItOutEnabled: false,
      supportedSubmitMethods: [],
    });
    return { ok: true, resultType: typeof result };
  } catch (e) {
    return { ok: false, error: e.message, stack: e.stack };
  }
});
console.log("\n--- DIRECT TEST ---");
console.log(JSON.stringify(directTest, null, 2));

await p.waitForTimeout(2000);

const info = await p.evaluate(() => {
  const host = document.querySelector("#swagger-ui-container");
  return {
    hostExists: !!host,
    hostChildren: host?.children.length,
    hostHTML: host?.innerHTML.slice(0, 500),
    hasSwaggerUIClass: !!host?.querySelector(".swagger-ui"),
    bodyHasSwaggerUI: !!document.querySelector(".swagger-ui"),
  };
});
console.log("\n--- AFTER DIRECT TEST ---");
console.log(JSON.stringify(info, null, 2));

await browser.close();

