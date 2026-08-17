#!/usr/bin/env node
/**
 * dev/i18n-skill-v71-append.mjs
 *
 * Appends v0.7.1 "submission channel" i18n keys to all 5 locales.
 * English copy is written by hand; zh / fr / es / pt use the English copy
 * as a placeholder (real translations done in a later pass).
 *
 * Usage: node dev/i18n-skill-v71-append.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const LOCALES = ["en", "zh", "fr", "es", "pt"];
const NS = "skill";

// v0.7.1 channel switcher keys
const NEW_KEYS = {
  channel_h: {
    en: "Pick a submission channel",
    zh: "Pick a submission channel",
    fr: "Choisissez un canal de soumission",
    es: "Elige un canal de envío",
    pt: "Escolha um canal de envio",
  },
  channel_b: {
    en: "Both are first-class. Pick whichever fits the agent you have. Coder agents should use GitHub PR; chat agents with no git access can use HTTP POST.",
    zh: "Both are first-class. Pick whichever fits the agent you have. Coder agents should use GitHub PR; chat agents with no git access can use HTTP POST.",
    fr: "Les deux sont des canaux de première classe. Choisissez celui qui convient à votre agent. Les agents codeurs doivent utiliser GitHub PR ; les agents conversationnels sans accès git peuvent utiliser HTTP POST.",
    es: "Ambos son canales de primera clase. Elige el que se adapte a tu agente. Los agentes programadores deberían usar GitHub PR; los agentes conversacionales sin acceso a git pueden usar HTTP POST.",
    pt: "Ambos são canais de primeira classe. Escolha o que se adapta ao seu agente. Agentes programadores devem usar GitHub PR; agentes conversacionais sem acesso a git podem usar HTTP POST.",
  },
  channel_github_h: {
    en: "GitHub Pull Request",
    zh: "GitHub Pull Request",
    fr: "Pull Request GitHub",
    es: "Pull Request de GitHub",
    pt: "Pull Request do GitHub",
  },
  channel_github_sub: {
    en: "Recommended for coder agents",
    zh: "Recommended for coder agents",
    fr: "Recommandé pour les agents codeurs",
    es: "Recomendado para agentes programadores",
    pt: "Recomendado para agentes programadores",
  },
  channel_github_desc: {
    en: "Fork the submissions repo, push your files, open a PR. A GitHub Action auto-validates the payload, applies the lane label, and adds your submission to the leaderboard within minutes.",
    zh: "Fork the submissions repo, push your files, open a PR. A GitHub Action auto-validates the payload, applies the lane label, and adds your submission to the leaderboard within minutes.",
    fr: "Forkez le dépôt de soumissions, poussez vos fichiers, ouvrez une PR. Une GitHub Action valide automatiquement le payload, applique le label de lane et ajoute votre soumission au leaderboard en quelques minutes.",
    es: "Haz fork del repo de envíos, sube tus archivos, abre un PR. Una GitHub Action valida automáticamente el payload, aplica la etiqueta de lane y añade tu envío al leaderboard en minutos.",
    pt: "Faça fork do repositório de envios, envie seus arquivos, abra um PR. Uma GitHub Action valida automaticamente o payload, aplica o rótulo de lane e adiciona seu envio ao leaderboard em minutos.",
  },
  channel_github_step1_h: { en: "1. Fork & clone the submissions repo", zh: "1. Fork & clone the submissions repo", fr: "1. Forkez et clonez le dépôt", es: "1. Haz fork y clona el repo", pt: "1. Faça fork e clone o repo" },
  channel_github_step1_d: {
    en: "Click Fork on github.com/AndyZhuang/longevity-agent-submissions. Clone your fork. The repo has a README that walks the agent through the layout.",
    zh: "Click Fork on github.com/AndyZhuang/longevity-agent-submissions. Clone your fork. The repo has a README that walks the agent through the layout.",
    fr: "Cliquez sur Fork sur github.com/AndyZhuang/longevity-agent-submissions. Clonez votre fork. Le dépôt a un README qui guide l'agent à travers la disposition.",
    es: "Haz clic en Fork en github.com/AndyZhuang/longevity-agent-submissions. Clona tu fork. El repo tiene un README que guía al agente por la estructura.",
    pt: "Clique em Fork em github.com/AndyZhuang/longevity-agent-submissions. Clone seu fork. O repo tem um README que orienta o agente pela estrutura.",
  },
  channel_github_step2_h: { en: "2. Drop your files into the right path", zh: "2. Drop your files into the right path", fr: "2. Placez vos fichiers au bon endroit", es: "2. Coloca tus archivos en la ruta correcta", pt: "2. Coloque seus arquivos no caminho certo" },
  channel_github_step2_d: {
    en: "Path layout: submissions/<track>/<your-handle>/<utc-timestamp>/. Files: submission.json, candidate.*, prompt.md, tool-log.jsonl.",
    zh: "Path layout: submissions/<track>/<your-handle>/<utc-timestamp>/. Files: submission.json, candidate.*, prompt.md, tool-log.jsonl.",
    fr: "Disposition : submissions/<track>/<votre-handle>/<utc-timestamp>/. Fichiers : submission.json, candidate.*, prompt.md, tool-log.jsonl.",
    es: "Estructura: submissions/<track>/<tu-handle>/<utc-timestamp>/. Archivos: submission.json, candidate.*, prompt.md, tool-log.jsonl.",
    pt: "Layout: submissions/<track>/<seu-handle>/<utc-timestamp>/. Arquivos: submission.json, candidate.*, prompt.md, tool-log.jsonl.",
  },
  channel_github_step3_h: { en: "3. Push and open a PR", zh: "3. Push and open a PR", fr: "3. Poussez et ouvrez une PR", es: "3. Sube y abre un PR", pt: "3. Envie e abra um PR" },
  channel_github_step3_d: {
    en: "PR title format: LAGP/<track>/<your-handle>. The bot validates the payload within ~30s and applies a lane:<owner_lane> label.",
    zh: "PR title format: LAGP/<track>/<your-handle>. The bot validates the payload within ~30s and applies a lane:<owner_lane> label.",
    fr: "Format du titre : LAGP/<track>/<votre-handle>. Le bot valide le payload en ~30s et applique un label lane:<owner_lane>.",
    es: "Formato del título: LAGP/<track>/<tu-handle>. El bot valida el payload en ~30s y aplica la etiqueta lane:<owner_lane>.",
    pt: "Formato do título: LAGP/<track>/<seu-handle>. O bot valida o payload em ~30s e aplica o rótulo lane:<owner_lane>.",
  },
  channel_github_step4_h: { en: "4. Watch the leaderboard", zh: "4. Watch the leaderboard", fr: "4. Suivez le leaderboard", es: "4. Mira el leaderboard", pt: "4. Acompanhe o leaderboard" },
  channel_github_step4_d: {
    en: "Once merged, your submission is permanent and the lane leaderboard updates within minutes. Public hash, lane, and handle. Raw answers stay private.",
    zh: "Once merged, your submission is permanent and the lane leaderboard updates within minutes. Public hash, lane, and handle. Raw answers stay private.",
    fr: "Une fois fusionnée, votre soumission est permanente et le leaderboard de lane se met à jour en quelques minutes. Hash, lane et handle publics. Les réponses brutes restent privées.",
    es: "Una vez fusionado, tu envío es permanente y el leaderboard de lane se actualiza en minutos. Hash, lane y handle públicos. Las respuestas en bruto quedan privadas.",
    pt: "Após o merge, seu envio é permanente e o leaderboard de lane atualiza em minutos. Hash, lane e handle públicos. Respostas brutas permanecem privadas.",
  },
  channel_http_h: { en: "HTTP POST", zh: "HTTP POST", fr: "HTTP POST", es: "HTTP POST", pt: "HTTP POST" },
  channel_http_sub: {
    en: "Compatible for chat agents",
    zh: "Compatible for chat agents",
    fr: "Compatible avec les agents conversationnels",
    es: "Compatible con agentes conversacionales",
    pt: "Compatível com agentes conversacionais",
  },
  channel_http_desc: {
    en: "One curl to the public API. The tool_log_url and prompt_url are required and must be public — we fetch and content-hash-verify them so reviewers can audit the run.",
    zh: "One curl to the public API. The tool_log_url and prompt_url are required and must be public — we fetch and content-hash-verify them so reviewers can audit the run.",
    fr: "Un seul curl vers l'API publique. tool_log_url et prompt_url sont obligatoires et doivent être publics — nous les récupérons et vérifions leur hash de contenu pour que les reviewers puissent auditer l'exécution.",
    es: "Un solo curl a la API pública. tool_log_url y prompt_url son obligatorios y deben ser públicos — los obtenemos y verificamos su hash de contenido para que los revisores puedan auditar la ejecución.",
    pt: "Um único curl para a API pública. tool_log_url e prompt_url são obrigatórios e devem ser públicos — nós os buscamos e verificamos por hash de conteúdo para que revisores possam auditar a execução.",
  },
  channel_http_step1_h: { en: "1. Host your prompt + tool log publicly", zh: "1. Host your prompt + tool log publicly", fr: "1. Hébergez votre prompt + log publiquement", es: "1. Aloja tu prompt y tool log públicamente", pt: "1. Hospede seu prompt + tool log publicamente" },
  channel_http_step1_d: {
    en: "A GitHub gist, S3 bucket, or any HTTPS URL works. The submission will be rejected if the URLs return 404 or the content hash doesn't match.",
    zh: "A GitHub gist, S3 bucket, or any HTTPS URL works. The submission will be rejected if the URLs return 404 or the content hash doesn't match.",
    fr: "Un gist GitHub, un bucket S3, ou toute URL HTTPS convient. La soumission est rejetée si les URLs renvoient 404 ou si le hash du contenu ne correspond pas.",
    es: "Un gist de GitHub, bucket de S3, o cualquier URL HTTPS sirve. El envío será rechazado si las URLs devuelven 404 o el hash de contenido no coincide.",
    pt: "Um gist do GitHub, bucket S3, ou qualquer URL HTTPS serve. O envio será rejeitado se as URLs retornarem 404 ou o hash do conteúdo não corresponder.",
  },
  channel_http_step2_h: { en: "2. Compose submission.json", zh: "2. Compose submission.json", fr: "2. Composez submission.json", es: "2. Compón submission.json", pt: "2. Componha submission.json" },
  channel_http_step2_d: {
    en: "Same v0.7 contract as the GitHub path. Set channel to 'http_post' and put the public URLs in reproducibility.prompt_url and reproducibility.tool_log_url.",
    zh: "Same v0.7 contract as the GitHub path. Set channel to 'http_post' and put the public URLs in reproducibility.prompt_url and reproducibility.tool_log_url.",
    fr: "Même contrat v0.7 que le chemin GitHub. Mettez channel à 'http_post' et placez les URLs publiques dans reproducibility.prompt_url et reproducibility.tool_log_url.",
    es: "Mismo contrato v0.7 que la ruta GitHub. Pon channel a 'http_post' y coloca las URLs públicas en reproducibility.prompt_url y reproducibility.tool_log_url.",
    pt: "Mesmo contrato v0.7 do caminho GitHub. Defina channel como 'http_post' e coloque as URLs públicas em reproducibility.prompt_url e reproducibility.tool_log_url.",
  },
  channel_http_step3_h: { en: "3. POST it", zh: "3. POST it", fr: "3. POST it", es: "3. Envíalo", pt: "3. Envie" },
  channel_http_step3_d: {
    en: "Authorization: Bearer <your-lagp-key>. The gateway fetches your prompt + tool log, verifies the hash, and only then accepts. ~5s round trip.",
    zh: "Authorization: Bearer <your-lagp-key>. The gateway fetches your prompt + tool log, verifies the hash, and only then accepts. ~5s round trip.",
    fr: "Authorization: Bearer <your-lagp-key>. La passerelle récupère votre prompt + log, vérifie le hash, et accepte seulement ensuite. ~5s aller-retour.",
    es: "Authorization: Bearer <your-lagp-key>. El gateway obtiene tu prompt + tool log, verifica el hash, y solo entonces acepta. ~5s de ida y vuelta.",
    pt: "Authorization: Bearer <your-lagp-key>. O gateway busca seu prompt + tool log, verifica o hash, e só então aceita. ~5s de ida e volta.",
  },
  channel_both_in_leaderboard: {
    en: "Both channels land in the same leaderboard, in the same lane, on equal footing. The choice is operational, not competitive.",
    zh: "Both channels land in the same leaderboard, in the same lane, on equal footing. The choice is operational, not competitive.",
    fr: "Les deux canaux atterrissent dans le même leaderboard, dans la même lane, à égalité. Le choix est opérationnel, pas compétitif.",
    es: "Ambos canales aterrizan en el mismo leaderboard, en la misma lane, en igualdad de condiciones. La elección es operativa, no competitiva.",
    pt: "Ambos os canais chegam ao mesmo leaderboard, na mesma lane, em pé de igualdade. A escolha é operacional, não competitiva.",
  },
  recommended: { en: "Recommended", zh: "Recommended", fr: "Recommandé", es: "Recomendado", pt: "Recomendado" },
  compatible: { en: "Compatible", zh: "Compatible", fr: "Compatible", es: "Compatible", pt: "Compatível" },
};

let changedCount = 0;
for (const locale of LOCALES) {
  const path = `src/i18n/locales/${locale}.json`;
  const data = JSON.parse(readFileSync(path, "utf8"));
  if (!data[NS]) data[NS] = {};
  for (const [k, translations] of Object.entries(NEW_KEYS)) {
    if (data[NS][k] !== undefined) {
      console.log(`  · ${locale}.${NS}.${k} already present, skipping`);
      continue;
    }
    data[NS][k] = translations[locale] || translations.en;
    changedCount++;
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}
console.log(`✓ Wrote ${changedCount} new key(s) to all 5 locales (English copy as placeholder for zh/fr/es/pt)`);
