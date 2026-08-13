// Fix the `class=` HTML attribute in prizes.title_1_html → `className=`
// (Trans passes HTML attrs directly to React elements; `class` is invalid on DOM)
import { readFile, writeFile } from 'node:fs/promises';

for (const l of ['en', 'zh', 'fr', 'es', 'pt']) {
  const path = `src/i18n/locales/${l}.json`;
  const d = JSON.parse(await readFile(path, 'utf-8'));
  if (d.prizes?.title_1_html) {
    const before = d.prizes.title_1_html;
    d.prizes.title_1_html = before.replace(/\bclass="/g, 'className="');
    console.log(l, 'before:', before);
    console.log(l, ' after:', d.prizes.title_1_html);
    await writeFile(path, JSON.stringify(d, null, 2) + '\n', 'utf-8');
  }
}
