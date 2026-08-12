import { readFile, writeFile } from 'node:fs/promises';

for (const l of ['en', 'zh', 'fr', 'es', 'pt']) {
  const path = `src/i18n/locales/${l}.json`;
  const d = JSON.parse(await readFile(path, 'utf-8'));
  if (d.register?.success_claimed) {
    d.register.success_claimed = d.register.success_claimed.replace(/@\{handle\}/g, '@{{handle}}');
    console.log(l, '→', d.register.success_claimed);
    await writeFile(path, JSON.stringify(d, null, 2) + '\n', 'utf-8');
  }
}
