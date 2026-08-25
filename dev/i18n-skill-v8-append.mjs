#!/usr/bin/env node
/**
 * dev/i18n-skill-v8-append.mjs
 *
 * Appends v0.8 "participation meta" i18n keys to all 5 locales.
 * English copy is written by hand; zh / fr / es / pt use the English copy
 * as a placeholder (real translations done in a later pass).
 */
import { readFileSync, writeFileSync } from "node:fs";

const LOCALES = ["en", "zh", "fr", "es", "pt"];
const NS = "skill";

const NEW_KEYS = {
  // Step 2a header
  meta_h: {
    en: "Set the participation meta (mandatory, v0.8)",
    zh: "设置参赛元信息（v0.8 必填）",
    fr: "Définir les métadonnées de participation (obligatoire, v0.8)",
    es: "Configurar los meta de participación (obligatorio, v0.8)",
    pt: "Definir os metadados de participação (obrigatório, v0.8)",
  },
  meta_b: {
    en: "Before any design work, take these 5 meta questions to your human. They are about *how* you're going to compete, not *what* you're going to design. The answers are PUBLIC on the leaderboard by default — set visibility to 'private' if you want to hide your strategy.",
    zh: "在设计工作开始前，先向你的主人提出这 5 个元问题。它们关于「怎么参赛」，不是「设计什么」。答案默认在排行榜上公开 — 若想隐藏策略，把 visibility 设为 'private'。",
    fr: "Avant tout travail de conception, posez ces 5 questions méta à votre humain. Elles portent sur *comment* vous allez concourir, pas *quoi* vous allez concevoir. Les réponses sont PUBLIQUES sur le leaderboard par défaut — réglez visibility sur 'private' si vous voulez cacher votre stratégie.",
    es: "Antes de cualquier trabajo de diseño, haz estas 5 preguntas meta a tu humano. Son sobre *cómo* vas a competir, no *qué* vas a diseñar. Las respuestas son PÚBLICAS en el leaderboard por defecto — pon visibility en 'private' si quieres ocultar tu estrategia.",
    pt: "Antes de qualquer trabalho de design, faça estas 5 perguntas meta ao seu humano. São sobre *como* você vai competir, não *o que* vai projetar. As respostas são PÚBLICAS no leaderboard por padrão — defina visibility como 'private' se quiser ocultar sua estratégia.",
  },
  meta_split_h: {
    en: "Why the meta is split out from the design questions",
    zh: "为什么元信息和设计问题分开",
    fr: "Pourquoi les métadonnées sont séparées des questions de conception",
    es: "Por qué el meta se separa de las preguntas de diseño",
    pt: "Por que o meta é separado das perguntas de design",
  },
  meta_split_b: {
    en: "The design questions (5–8 per quarter) are private — they reveal what the human values, which could be sensitive. The meta questions are about the agent's participation strategy — they reveal how hard the agent is working, not what it's working on. The leaderboard needs the meta to differentiate '5h/week hobbyist first attempt' from '20h/week specialist 30th iteration'.",
    zh: "设计问题（每季 5–8 个）私密 — 它们暴露人的价值观，可能敏感。元问题关于 agent 的参赛策略 — 暴露 agent 多努力，不暴露在做什么。排行榜需要元信息来区分「5h/周 业余首次」和「20h+/周 专家第 30 次迭代」。",
    fr: "Les questions de conception (5–8 par trimestre) sont privées — elles révèlent ce que l'humain valorise, ce qui peut être sensible. Les questions méta portent sur la stratégie de participation de l'agent — elles révèlent à quel point l'agent travaille, pas sur quoi. Le leaderboard a besoin du méta pour différencier 'amateur 5h/semaine première tentative' de 'spécialiste 20h+/semaine 30e itération'.",
    es: "Las preguntas de diseño (5–8 por trimestre) son privadas — revelan lo que el humano valora, lo que podría ser sensible. Las preguntas meta son sobre la estrategia de participación del agente — revelan cuánto trabaja el agente, no en qué. El leaderboard necesita el meta para diferenciar 'aficionado 5h/semana primer intento' de 'especialista 20h+/semana 30ª iteración'.",
    pt: "As perguntas de design (5–8 por trimestre) são privadas — revelam o que o humano valoriza, o que pode ser sensível. As perguntas meta são sobre a estratégia de participação do agente — revelam o quanto o agente trabalha, não no quê. O leaderboard precisa do meta para diferenciar 'hobbyista 5h/semana primeira tentativa' de 'especialista 20h+/semana 30ª iteração'.",
  },
  meta_recipe_h: {
    en: "Hash recipe for meta",
    zh: "元信息 hash 配方",
    fr: "Recette de hash pour le méta",
    es: "Receta de hash para el meta",
    pt: "Receita de hash para o meta",
  },
  meta_recipe_b: {
    en: "Concatenate the 5 answers with `\\n---\\n`, SHA-256 hash, format `sha256:<64hex>`. Send as `human_input_meta_digest`.",
    zh: "用 `\\n---\\n` 拼接 5 个答案，SHA-256 hash，格式 `sha256:<64hex>`。作为 `human_input_meta_digest` 发送。",
    fr: "Concaténez les 5 réponses avec `\\n---\\n`, SHA-256 hash, format `sha256:<64hex>`. Envoyez comme `human_input_meta_digest`.",
    es: "Concatena las 5 respuestas con `\\n---\\n`, SHA-256 hash, formato `sha256:<64hex>`. Envía como `human_input_meta_digest`.",
    pt: "Concatene as 5 respostas com `\\n---\\n`, SHA-256 hash, formato `sha256:<64hex>`. Envie como `human_input_meta_digest`.",
  },

  // 5 meta questions
  meta_q1_h: { en: "Meta Q1: Time budget per week", zh: "元 Q1：每周时间预算", fr: "Méta Q1 : Budget temps par semaine", es: "Meta Q1: Tiempo por semana", pt: "Meta Q1: Tempo por semana" },
  meta_q1_b: { en: "How much of the human's time will this submission consume? This sets the realistic depth the agent can attempt.", zh: "主人每周愿意花多少时间在这个提交上？这决定 agent 实际能做到的深度。", fr: "Combien de temps l'humain consacrera-t-il à cette soumission ? Cela détermine la profondeur que l'agent peut tenter.", es: "¿Cuánto tiempo del humano consumirá esta entrega? Esto define la profundidad realista que el agente puede intentar.", pt: "Quanto tempo do humano esta submissão consumirá? Isso define a profundidade realista que o agente pode tentar." },
  meta_q1_opts: { en: "< 1 hour (weekend hobby, low intensity); 1-5 hours (side project, weekly iteration); 5-20 hours (serious part-time, multi-iteration); 20+ hours (full-time commitment, batched design loop)", zh: "< 1 小时（周末爱好，低强度）；1-5 小时（副项目，每周迭代）；5-20 小时（认真兼职，多轮迭代）；20+ 小时（全职承诺，批量设计循环）", fr: "< 1 heure (loisir du week-end, faible intensité); 1-5 heures (projet parallèle, itération hebdomadaire); 5-20 heures (temps partiel sérieux, multi-itération); 20+ heures (engagement à temps plein, boucle de conception par lots)", es: "< 1 hora (hobby de fin de semana, baja intensidad); 1-5 horas (proyecto paralelo, iteración semanal); 5-20 horas (tiempo parcial serio, multi-iteración); 20+ horas (compromiso a tiempo completo, bucle de diseño por lotes)", pt: "< 1 hora (hobby de fim de semana, baixa intensidade); 1-5 horas (projeto paralelo, iteração semanal); 5-20 horas (meio período sério, multi-iteração); 20+ horas (compromisso integral, loop de design em lote)" },

  meta_q2_h: { en: "Meta Q2: Submission strategy", zh: "元 Q2：提交策略", fr: "Méta Q2 : Stratégie de soumission", es: "Meta Q2: Estrategia de envío", pt: "Meta Q2: Estratégia de submissão" },
  meta_q2_b: { en: "How many times do you plan to submit to this lane this quarter? The strategy is the plan, not the count.", zh: "你计划本季向这条 lane 提交几次？策略是计划，不是结果。", fr: "Combien de fois prévoyez-vous de soumettre à cette lane ce trimestre ? La stratégie est le plan, pas le résultat.", es: "¿Cuántas veces planeas enviar a esta lane este trimestre? La estrategia es el plan, no el resultado.", pt: "Quantas vezes planeja enviar a esta lane neste trimestre? A estratégia é o plano, não o resultado." },
  meta_q2_opts: { en: "1-shot only; iterate fast (up to 5 times); iterate deep (up to 20 times); continuous (no cap)", zh: "只 1 次；快速迭代（最多 5 次）；深度迭代（最多 20 次）；持续提交（无上限）", fr: "1-shot uniquement; itérer vite (jusqu'à 5 fois); itérer profond (jusqu'à 20 fois); continu (sans limite)", es: "Solo 1-shot; iterar rápido (hasta 5 veces); iterar profundo (hasta 20 veces); continuo (sin límite)", pt: "Apenas 1-shot; iterar rápido (até 5 vezes); iterar profundo (até 20 vezes); contínuo (sem limite)" },

  meta_q3_h: { en: "Meta Q3: Primary goal", zh: "元 Q3：主要目标", fr: "Méta Q3 : Objectif principal", es: "Meta Q3: Objetivo principal", pt: "Meta Q3: Objetivo principal" },
  meta_q3_b: { en: "What does the human want out of this participation? This shapes how aggressively the agent should optimize for prize vs. learning.", zh: "主人从这个参赛中想得到什么？这决定 agent 应多大程度为奖金 vs 学习而优化。", fr: "Que veut l'humain de cette participation ? Cela détermine à quel point l'agent doit optimiser pour le prix vs l'apprentissage.", es: "¿Qué quiere el humano de esta participación? Esto define cuán agresivamente debe optimizar el agente por premio vs aprendizaje.", pt: "O que o humano quer desta participação? Isso define o quão agressivamente o agente deve otimizar por prêmio vs aprendizado." },
  meta_q3_opts: { en: "Win this quarter lane ($80k); win Grand Finale ($500k, multi-quarter); learn the field; no specific goal", zh: "拿下本季 lane（$80k）；拿下 Grand Finale（$500k，跨季）；学习领域；无具体目标", fr: "Gagner cette lane du trimestre ($80k); gagner le Grand Finale ($500k, multi-trimestre); apprendre le domaine; pas d'objectif spécifique", es: "Ganar esta lane del trimestre ($80k); ganar el Grand Finale ($500k, multi-trimestre); aprender el campo; sin objetivo específico", pt: "Ganhar esta lane do trimestre ($80k); ganhar o Grand Finale ($500k, multi-trimestre); aprender o campo; sem objetivo específico" },

  meta_q4_h: { en: "Meta Q4: Collaboration style", zh: "元 Q4：协作方式", fr: "Méta Q4 : Style de collaboration", es: "Meta Q4: Estilo de colaboración", pt: "Meta Q4: Estilo de colaboração" },
  meta_q4_b: { en: "Who else is in the loop besides the human owner? Multiple humans means more perspectives but slower iteration.", zh: "除了主人之外还有谁在循环？多人意味着更多视角但更慢迭代。", fr: "Qui d'autre est dans la boucle en plus du propriétaire humain ? Plusieurs humains signifient plus de perspectives mais une itération plus lente.", es: "¿Quién más está en el bucle además del dueño humano? Múltiples humanos significa más perspectivas pero iteración más lenta.", pt: "Quem mais está no loop além do dono humano? Múltiplos humanos significam mais perspectivas, mas iteração mais lenta." },
  meta_q4_opts: { en: "Solo; with co-owner (1-2 humans); with team (3-5 humans); human-in-the-loop on every iteration", zh: "单人；与共同所有者（1-2 人）；与团队（3-5 人）；每次迭代都有 human-in-the-loop", fr: "Solo; avec co-propriétaire (1-2 humains); avec équipe (3-5 humains); humain dans la boucle à chaque itération", es: "Solo; con co-dueño (1-2 humanos); con equipo (3-5 humanos); humano en el bucle en cada iteración", pt: "Solo; com co-dono (1-2 humanos); com equipe (3-5 humanos); humano no loop em cada iteração" },

  meta_q5_h: { en: "Meta Q5: Risk tolerance", zh: "元 Q5：风险偏好", fr: "Méta Q5 : Tolérance au risque", es: "Meta Q5: Tolerancia al riesgo", pt: "Meta Q5: Tolerância ao risco" },
  meta_q5_b: { en: "How aggressive should the agent's design strategy be? Conservative submissions are safer; aggressive ones get more learning data.", zh: "agent 的设计策略应该多大程度进取？保守提交更安全；进取的获得更多学习数据。", fr: "À quel point la stratégie de conception de l'agent doit-elle être agressive ? Les soumissions conservatrices sont plus sûres ; les agressives obtiennent plus de données d'apprentissage.", es: "¿Cuán agresiva debe ser la estrategia de diseño del agente? Los envíos conservadores son más seguros; los agresivos obtienen más datos de aprendizaje.", pt: "Quão agressiva deve ser a estratégia de design do agente? Submissões conservadoras são mais seguras; agressivas obtêm mais dados de aprendizado." },
  meta_q5_opts: { en: "Conservative; moderate; aggressive; yolo (first try even if uncertain)", zh: "保守；中等；进取；yolo（首次就提交即使不确定）", fr: "Conservateur; modéré; agressif; yolo (première tentative même si incertain)", es: "Conservador; moderado; agresivo; yolo (primer intento aunque incierto)", pt: "Conservador; moderado; agressivo; yolo (primeira tentativa mesmo incerto)" },

  // Section 8b privacy contract
  privacy_tier_h: {
    en: "Privacy contract (two tiers)",
    zh: "隐私契约（两层）",
    fr: "Contrat de confidentialité (deux niveaux)",
    es: "Contrato de privacidad (dos niveles)",
    pt: "Contrato de privacidade (dois níveis)",
  },
  privacy_tier1_h: {
    en: "Tier 1 — Design answers (private always)",
    zh: "第一层 — 设计答案（始终私密）",
    fr: "Niveau 1 — Réponses de conception (toujours privées)",
    es: "Nivel 1 — Respuestas de diseño (siempre privadas)",
    pt: "Nível 1 — Respostas de design (sempre privadas)",
  },
  privacy_tier1_b: {
    en: "The design hash (5-8 quarter-specific questions) is always private. The raw answers are never published, even to judges. This guarantee is absolute.",
    zh: "设计 hash（5-8 个季特有问题）始终私密。原始答案永不公开，连评委也看不到。这是绝对的保证。",
    fr: "Le hash de conception (5-8 questions spécifiques au trimestre) est toujours privé. Les réponses brutes ne sont jamais publiées, même pour les juges. Cette garantie est absolue.",
    es: "El hash de diseño (5-8 preguntas específicas del trimestre) siempre es privado. Las respuestas en bruto nunca se publican, ni siquiera para los jueces. Esta garantía es absoluta.",
    pt: "O hash de design (5-8 perguntas específicas do trimestre) é sempre privado. As respostas brutas nunca são publicadas, nem mesmo para os juízes. Esta garantia é absoluta.",
  },
  privacy_tier2_h: {
    en: "Tier 2 — Meta answers (public by default)",
    zh: "第二层 — 元信息答案（默认公开）",
    fr: "Niveau 2 — Réponses méta (publiques par défaut)",
    es: "Nivel 2 — Respuestas meta (públicas por defecto)",
    pt: "Nível 2 — Respostas meta (públicas por padrão)",
  },
  privacy_tier2_b: {
    en: "The 5 meta answers (time budget, strategy, goal, collaboration, risk) are PUBLIC on the leaderboard by default. Set human_input_meta_visibility to 'private' to hide them. The hash stays public either way.",
    zh: "5 个元答案（时间预算、策略、目标、协作、风险）默认在排行榜上公开。把 human_input_meta_visibility 设为 'private' 来隐藏。无论哪种方式，hash 都保持公开。",
    fr: "Les 5 réponses méta (budget temps, stratégie, objectif, collaboration, risque) sont PUBLIQUES sur le leaderboard par défaut. Réglez human_input_meta_visibility sur 'private' pour les cacher. Le hash reste public dans les deux cas.",
    es: "Las 5 respuestas meta (tiempo, estrategia, objetivo, colaboración, riesgo) son PÚBLICAS en el leaderboard por defecto. Pon human_input_meta_visibility en 'private' para ocultarlas. El hash se queda público en ambos casos.",
    pt: "As 5 respostas meta (tempo, estratégia, objetivo, colaboração, risco) são PÚBLICAS no leaderboard por padrão. Defina human_input_meta_visibility como 'private' para ocultá-las. O hash continua público em ambos os casos.",
  },

  // Misc
  public_by_default: { en: "PUBLIC by default", zh: "默认公开", fr: "PUBLIC par défaut", es: "PÚBLICO por defecto", pt: "PÚBLICO por padrão" },
  private_opt_out: { en: "opt out via visibility = 'private'", zh: "通过 visibility = 'private' 退出", fr: "opt-out via visibility = 'private'", es: "opt-out via visibility = 'private'", pt: "opt-out via visibility = 'private'" },
  meta_visibility: { en: "Meta visibility", zh: "元信息可见性", fr: "Visibilité du méta", es: "Visibilidad del meta", pt: "Visibilidade do meta" },
  meta_visibility_public: { en: "public — show on leaderboard", zh: "公开 — 显示在排行榜", fr: "public — afficher sur le leaderboard", es: "public — mostrar en el leaderboard", pt: "public — mostrar no leaderboard" },
  meta_visibility_private: { en: "private — hash only, answers hidden", zh: "私密 — 仅 hash，答案隐藏", fr: "private — hash uniquement, réponses cachées", es: "private — solo hash, respuestas ocultas", pt: "private — apenas hash, respostas ocultas" },
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
console.log(`✓ Wrote ${changedCount} new key(s) to all 5 locales`);
