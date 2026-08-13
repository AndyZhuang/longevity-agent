// Walk all locale files looking for HTML attribute issues
import { readFileSync } from 'node:fs';

for (const l of ['en', 'zh', 'fr', 'es', 'pt']) {
  const d = JSON.parse(readFileSync(`src/i18n/locales/${l}.json`, 'utf-8'));
  console.log(`\n=== ${l}.json ===`);
  function walk(o, p = '') {
    for (const [k, v] of Object.entries(o || {})) {
      const path = p ? p + '.' + k : k;
      if (typeof v === 'string') {
        // Look for HTML attribute patterns that React would reject
        const m = v.match(/<(span|a|div|p|h\d|em|strong|br|img|li|ul|ol|td|th|button|input|label)[^>]*\b(class|for)=/g);
        if (m) console.log(' ', path, '→', m);
      } else if (typeof v === 'object') {
        walk(v, path);
      }
    }
  }
  walk(d);
}
