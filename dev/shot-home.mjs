import { chromium } from "playwright";
import { mkdir } from "fs/promises";

const URL = "http://localhost:5173";
const OUT = "dev-screenshots";
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${URL}/`, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/01-home.png`, fullPage: true });
console.log("OK");
await browser.close();
