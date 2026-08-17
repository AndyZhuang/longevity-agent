/**
 * Copy the three swagger-ui-dist static assets we need (CSS + UMD bundle +
 * standalone preset) into public/swagger-ui-dist so they ship in the dist/
 * output and can be loaded by <script>/<link> tags from the page.
 *
 * The Vite ESM build path is avoided on purpose — the swagger-ui UMD bundle
 * is the one the project docs use, and avoids a class of init crashes
 * (e.g. "Cannot read properties of undefined (reading 'download')") that
 * happen when the ESM bundle is initialised inside React's render cycle.
 *
 * Idempotent.
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "node_modules/swagger-ui-dist");
const DST = resolve(ROOT, "public/swagger-ui-dist");

const FILES = [
  "swagger-ui.css",
  "swagger-ui-bundle.js",
  "swagger-ui-standalone-preset.js",
];

if (!existsSync(SRC)) {
  console.error("node_modules/swagger-ui-dist not found; run `npm install` first");
  process.exit(1);
}
mkdirSync(DST, { recursive: true });
for (const f of FILES) {
  copyFileSync(resolve(SRC, f), resolve(DST, f));
  console.log("copied", f);
}
