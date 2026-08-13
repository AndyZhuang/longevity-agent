// Fix `class="..."` → `className="..."` in all HTML strings across all locales
// (i18next Trans passes HTML attrs directly to React elements; `class` is invalid)
import { readFile, writeFile } from 'node:fs/promises';

for (const l of ['en', 'zh', 'fr', 'es', 'pt']) {
  const path = `src/i18n/locales/${l}.json`;
  const d = JSON.parse(await readFile(path, 'utf-8'));
  let touched = 0;
  function walk(o) {
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'string') {
        const next = v
          // class=  → className=  (HTML attr in <tag class="...">)
          .replace(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*?)\bclass=/g, '<$1$2className=')
          // for=    → htmlFor= (HTML attr in <label for="...">)
          .replace(/<([a-zA-Z][a-zA-Z0-9]*)([^>]*?)\bfor=/g, '<$1$2htmlFor=');
        if (next !== v) {
          o[k] = next;
          touched++;
        }
      } else if (typeof v === 'object' && v !== null) {
        walk(v);
      }
    }
  }
  walk(d);
  if (touched > 0) {
    await writeFile(path, JSON.stringify(d, null, 2) + '\n', 'utf-8');
    console.log(`${l}.json: fixed ${touched} HTML attr(s)`);
  } else {
    console.log(`${l}.json: clean`);
  }
}
