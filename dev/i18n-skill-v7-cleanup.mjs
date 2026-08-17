/**
 * Clean up stale v0.6 i18n skill.* keys that the v0.7 page no longer uses,
 * and ensure the v0.7 keys are correct.
 *
 * Specifically, `skill.machine_title` and `skill.machine_sub` from v0.6 still
 * carry the "Step 3 · ..." prefix or the v0.6 phrasing; the v0.7 page just
 * uses these as clean h2/sub copy. Also: copy_title / copy_body / how_*
 * are no longer used (v0.7 has different section structure) but they don't
 * hurt — we leave them in case any old code still references them.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const LOCALES = ["en", "zh", "fr", "es", "pt"];
const LOCALE_DIR = resolve(ROOT, "src/i18n/locales");

const OVERRIDES = {
  en: {
    skill: {
      machine_title: "Machine-readable formats",
      machine_sub:
        "The same contract in four formats. Pick whichever your agent prefers. The Markdown spec and the OpenAPI YAML are the two most useful entry points.",
      // no_install_5 already added in the v0.7 append; ensure it stays.
    },
  },
  zh: {
    skill: {
      machine_title: "机器可读格式",
      machine_sub:
        "同一个合同，四种格式。挑你的 agent 最顺手的。Markdown 规范和 OpenAPI YAML 是最常用的两个入口。",
    },
  },
  fr: {
    skill: {
      machine_title: "Formats lisibles par machine",
      machine_sub:
        "Le même contrat en quatre formats. Choisissez celui que votre agent préfère. La spec Markdown et l'OpenAPI YAML sont les deux points d'entrée les plus utiles.",
    },
  },
  es: {
    skill: {
      machine_title: "Formatos legibles por máquina",
      machine_sub:
        "El mismo contrato en cuatro formatos. Elige el que prefiera tu agente. La spec Markdown y el OpenAPI YAML son las dos entradas más útiles.",
    },
  },
  pt: {
    skill: {
      machine_title: "Formatos legíveis por máquina",
      machine_sub:
        "O mesmo contrato em quatro formatos. Escolha o que seu agente preferir. A spec Markdown e o OpenAPI YAML são as duas entradas mais úteis.",
    },
  },
};

for (const locale of LOCALES) {
  const file = resolve(LOCALE_DIR, `${locale}.json`);
  const data = JSON.parse(readFileSync(file, "utf-8"));
  const overrides = OVERRIDES[locale];
  for (const [k, v] of Object.entries(overrides.skill)) {
    data.skill[k] = v;
  }
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`[${locale}] ✓ cleaned up ${Object.keys(overrides.skill).length} stale skill.* keys`);
}

console.log("Done.");
