// Replace `longevity.agent` with `longevityagent.top` across all relevant files.
// Excludes node_modules, dist, dev/screenshots, .git.

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative, extname } from "path";

const ROOT = "C:\\Users\\P1\\.minimax-agent-cn\\projects\\longevity-agent";
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "screenshots", "dev"]);
const FILE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".html", ".css", ".yml", ".yaml", ".txt", ".svg"]);
const FROM = "longevity.agent";
const TO = "longevityagent.top";

let changed = 0;
let scanned = 0;
const matches = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) walk(full);
    else if (s.isFile() && FILE_EXTS.has(extname(entry))) {
      scanned++;
      let text;
      try { text = readFileSync(full, "utf-8"); } catch { continue; }
      if (text.includes(FROM)) {
        const count = text.split(FROM).length - 1;
        matches.push({ file: relative(ROOT, full), count });
        writeFileSync(full, text.split(FROM).join(TO), "utf-8");
        changed++;
      }
    }
  }
}

walk(ROOT);

console.log(`Scanned ${scanned} files`);
console.log(`Modified ${changed} files`);
matches.sort((a, b) => b.count - a.count);
for (const m of matches) console.log(`  ${String(m.count).padStart(3)} × ${m.file}`);
