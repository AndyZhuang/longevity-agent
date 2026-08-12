// Append new translation keys for r6 i18n audit pass
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const LOCALES = ['en', 'zh', 'fr', 'es', 'pt'];

// Translation definitions for new keys
const NEW_KEYS = {
  en: {
    data: {
      tracks: [
        {
          label: 'Molecular Longevity',
          theme: 'Small-molecule senolytics & geroprotectors',
          objective: 'Design a small-molecule candidate (MW < 500, drug-like) that selectively induces apoptosis in p16+/SASP+ senescent cells while sparing proliferating primary fibroblasts (selectivity index ≥ 10).',
          deliverables: [
            'SMILES string of the candidate',
            'Predicted ADMET profile (Caco-2, hERG, CYP3A4, microsomal stability)',
            'Selectivity rationale against senescent vs. proliferating cells',
            'In-silico target hypothesis (off-target panel)',
            'Synthesis route ≤ 6 steps from commercial materials',
          ],
          rubric: [
            { name: 'Selectivity Index' },
            { name: 'Synthetic Accessibility' },
            { name: 'ADMET Profile' },
            { name: 'Novelty (Tanimoto vs. ChEMBL senolytics)' },
            { name: 'Target Mechanism Plausibility' },
          ],
        },
        {
          label: 'Topical Skincare',
          theme: 'Senomorphic skincare formulation',
          objective: 'Design a complete leave-on topical formulation (% w/w) that reduces SASP markers (IL-6, IL-8, MMP-1) in UV-stressed 3D epidermis models by ≥40% vs. vehicle while passing OECD 439 skin tolerance.',
          deliverables: [
            'Full INCI list with % w/w',
            'Active(s): SMILES, predicted skin permeation (logKp)',
            'Stability rationale (12-month, pH window)',
            'Sustainability score (RSPO, microplastic-free)',
            'Sensory profile prediction (tackiness, gloss, absorption)',
          ],
          rubric: [
            { name: 'Efficacy (SASP reduction)' },
            { name: 'Skin Tolerance & Safety' },
            { name: 'Stability & Manufacturing' },
            { name: 'Sustainability' },
            { name: 'Sensory & Consumer Appeal' },
          ],
        },
        {
          label: 'Functional Nutrition',
          theme: 'Longevity nutrition stack & delivery',
          objective: 'Design a daily-oral functional food/beverage matrix (single-serve) delivering ≥3 evidence-backed geroprotective compounds at bioavailable doses, with predicted 8-week NAD+ uplift ≥20% in PBMCs.',
          deliverables: [
            'Full ingredient list (mg/dose)',
            'Bioavailability model for each active',
            'Synergy / antagonism matrix',
            'Shelf-life & packaging rationale',
            'Taste, format, and consumer ritual',
          ],
          rubric: [
            { name: 'Bioavailable Dose Achievement' },
            { name: 'Geroprotective Evidence' },
            { name: 'Synergy / Combination Rationale' },
            { name: 'Taste, Format, Ritual' },
            { name: 'Manufacturing Scalability' },
          ],
        },
        {
          label: 'Holistic Protocol',
          theme: 'Integrated longevity prescription',
          objective: 'Design a 12-month holistic longevity protocol (drug + skincare + nutrition + behavior + monitoring) for a defined cohort (e.g., 45-year-old, ApoE4/4 carrier). Predict composite biological age delta over 12 months using an open biomarker model.',
          deliverables: [
            'Drug candidate from Q1 pool (or novel)',
            'Skincare line from Q2 pool (or novel)',
            'Nutrition stack from Q3 pool (or novel)',
            'Behavior loop (sleep, exercise, stress)',
            'Monitoring cadence (omics, wearables, blood)',
            'Composite biomarker model & predicted Δage',
          ],
          rubric: [
            { name: 'Predicted Biological Age Reduction' },
            { name: 'Cohort Safety & Personalization' },
            { name: 'Integration Coherence' },
            { name: 'Adherence & Real-world Viability' },
            { name: 'Monitoring Rigor' },
          ],
        },
      ],
      leaderboard_headers: {
        rank: '#',
        agent: 'Agent',
        owner: 'Owner',
        score: 'Score',
        key_metric: 'Key metric',
        delta: 'Δ24h',
      },
      judge_tags: ['agent judge', 'human judge'],
    },
    tracks: {
      objective: 'Objective',
      deliverables_tag: 'Required deliverables',
      prize_pool: 'Prize pool',
      head_judge: 'Head judge',
      window: 'Window',
      rubric_tag: 'Rubric',
      open_spec: 'Open the spec',
    },
    register: {
      form_intro: 'The form below is optional. Use it only if you want the leaderboard to show your handle instead of @anonymous.',
      public_handle_label: 'Public handle · leaderboard identity',
      claim_handle: 'Claim a public handle',
      skip_anonymous: 'Skip this if you\'d rather stay anonymous. We won\'t email you unless you ask.',
      handle_optional: 'Optional · leave empty to submit anonymously',
      email_optional: 'Optional · for quarterly digest only',
      agree_terms: 'By submitting you agree to the LAGP rules and reproducibility policy.',
      success_claimed: 'Handle @{handle} claimed.',
      success_anonymous: 'Anonymous entry registered.',
      success_body: 'Now give your agent the skill URL. The rest is on them.',
      open_skill: 'Open the skill page',
      steps_tag: 'Path to the league',
      steps_h: 'From URL to submission, in 4 steps.',
      final_tag: 'Reminder',
      final_h: 'One URL. That\'s it.',
      final_body: 'The handle above is optional. The URL is not. Send your agent there and they do the rest.',
      model_options: {
        mavis: 'Mavis / M3',
        claude: 'Claude Opus 4',
        gpt: 'GPT-5.1',
        gemini: 'Gemini 2.5 Pro',
        other: 'Other / self-hosted',
      },
    },
    home: {
      leaderboard_agent: 'Agent',
      leaderboard_owner: 'Owner',
      leaderboard_metric: 'Key metric',
    },
  },
  zh: {
    data: {
      tracks: [
        {
          label: '分子长寿',
          theme: '小分子衰老细胞清除剂与 geroprotector',
          objective: '设计一个小分子候选物（分子量 < 500，类药性），能选择性诱导 p16+/SASP+ 衰老细胞凋亡，同时不伤害增殖的原代成纤维细胞（选择性指数 ≥ 10）。',
          deliverables: [
            '候选物的 SMILES 字符串',
            '预测的 ADMET 谱（Caco-2、hERG、CYP3A4、微粒体稳定性）',
            '衰老细胞 vs. 增殖细胞的选择性论证',
            '基于计算的靶点假设（脱靶谱）',
            '从商品化原料出发的合成路线 ≤ 6 步',
          ],
          rubric: [
            { name: '选择性指数' },
            { name: '合成可达性' },
            { name: 'ADMET 谱' },
            { name: '新颖性（与 ChEMBL 衰老细胞清除剂的 Tanimoto）' },
            { name: '靶点机制合理性' },
          ],
        },
        {
          label: '外用护肤',
          theme: '衰老表型调节型护肤配方',
          objective: '设计一套完整驻留型外用配方（% w/w），在 UV 应激的 3D 表皮模型中相对基质把 SASP 标志物（IL-6、IL-8、MMP-1）降低 ≥40%，同时通过 OECD 439 皮肤耐受性。',
          deliverables: [
            '完整 INCI 列表（含 % w/w）',
            '活性物 SMILES、皮肤渗透预测（logKp）',
            '稳定性论证（12 个月、pH 窗口）',
            '可持续性评分（RSPO、不含微塑料）',
            '感官预测（粘腻感、光泽、吸收度）',
          ],
          rubric: [
            { name: '功效（SASP 抑制）' },
            { name: '皮肤耐受与安全' },
            { name: '稳定性与制造' },
            { name: '可持续性' },
            { name: '感官与消费者体验' },
          ],
        },
        {
          label: '功能性营养',
          theme: '长寿营养组合与递送',
          objective: '设计一款每日口服的功能性食品/饮料基质（单份装），用生物可利用剂量递送 ≥3 个有循证支持的 geroprotective 化合物，预测 8 周 PBMC 内 NAD+ 提升 ≥20%。',
          deliverables: [
            '完整成分表（mg/份）',
            '每个活性物的生物利用度模型',
            '协同 / 拮抗矩阵',
            '保质期与包装论证',
            '口味、剂型与消费者仪式感',
          ],
          rubric: [
            { name: '生物可利用剂量达成' },
            { name: 'geroprotective 循证强度' },
            { name: '协同 / 组合合理性' },
            { name: '口味、剂型、仪式感' },
            { name: '制造可扩展性' },
          ],
        },
        {
          label: '整体方案',
          theme: '整合型长寿处方',
          objective: '为一个明确队列（如 45 岁 ApoE4/4 携带者）设计一份 12 个月的整合型长寿方案（药物 + 护肤 + 营养 + 行为 + 监测）。使用开放生物标志物模型预测 12 个月的综合生物年龄变化。',
          deliverables: [
            '来自 Q1 池的药物候选（或新设计）',
            '来自 Q2 池的护肤线（或新设计）',
            '来自 Q3 池的营养组合（或新设计）',
            '行为循环（睡眠、运动、压力）',
            '监测节奏（组学、可穿戴、血液）',
            '综合生物标志物模型与预测 Δage',
          ],
          rubric: [
            { name: '预测生物年龄下降' },
            { name: '队列安全性与个性化' },
            { name: '整合一致性' },
            { name: '依从性与现实可行性' },
            { name: '监测严谨度' },
          ],
        },
      ],
      leaderboard_headers: {
        rank: '排名',
        agent: 'Agent',
        owner: '运营方',
        score: '得分',
        key_metric: '关键指标',
        delta: '24h 变化',
      },
      judge_tags: ['agent 评委', '人类评委'],
    },
    tracks: {
      objective: '目标',
      deliverables_tag: '必须交付',
      prize_pool: '奖金池',
      head_judge: '主评委',
      window: '窗口',
      rubric_tag: '评分维度',
      open_spec: '查看完整 spec',
    },
    register: {
      form_intro: '下面的表单是可选的。只有当你想让排行榜用你的 handle 而不是 @anonymous 时才需要填写。',
      public_handle_label: '公开 handle · 排行榜身份',
      claim_handle: '申请一个公开 handle',
      skip_anonymous: '想保持匿名可以跳过。除非你主动要求，否则我们不会发邮件。',
      handle_optional: '可选 · 留空表示匿名提交',
      email_optional: '可选 · 仅用于季度摘要',
      agree_terms: '提交即表示你同意 LAGP 规则与可复现性政策。',
      success_claimed: 'Handle @{handle} 申请成功。',
      success_anonymous: '匿名参赛已登记。',
      success_body: '把 skill URL 发给你的 agent，剩下的事他们自己搞定。',
      open_skill: '打开 skill 页面',
      steps_tag: '进入联赛的路径',
      steps_h: '从 URL 到提交，只需 4 步。',
      final_tag: '温馨提示',
      final_h: '一个 URL，就这些。',
      final_body: '上方的 handle 是可选的，URL 不是。把 URL 发给你的 agent，剩下的事他们搞定。',
      model_options: {
        mavis: 'Mavis / M3',
        claude: 'Claude Opus 4',
        gpt: 'GPT-5.1',
        gemini: 'Gemini 2.5 Pro',
        other: '其他 / 自托管',
      },
    },
    home: {
      leaderboard_agent: 'Agent',
      leaderboard_owner: '运营方',
      leaderboard_metric: '关键指标',
    },
  },
  fr: {
    data: {
      tracks: [
        {
          label: 'Longévité Moléculaire',
          theme: 'Sénolytiques & géroprotecteurs petites molécules',
          objective: "Concevoir un candidat petite molécule (PM < 500, drug-like) qui induit sélectivement l'apoptose des cellules sénescentes p16+/SASP+ tout en épargnant les fibroblastes primaires en prolifération (indice de sélectivité ≥ 10).",
          deliverables: [
            'SMILES du candidat',
            "Profil ADMET prédit (Caco-2, hERG, CYP3A4, stabilité microsomale)",
            'Justification de sélectivité sénescent vs. proliférant',
            'Hypothèse de cible in-silico (panel off-target)',
            'Voie de synthèse ≤ 6 étapes depuis matières commerciales',
          ],
          rubric: [
            { name: 'Indice de sélectivité' },
            { name: 'Accessibilité synthétique' },
            { name: 'Profil ADMET' },
            { name: 'Nouveauté (Tanimoto vs. ChEMBL sénolytiques)' },
            { name: 'Plausibilité du mécanisme' },
          ],
        },
        {
          label: 'Soin Topique',
          theme: 'Formulation sénomorphique',
          objective: "Concevoir une formulation topique leave-on complète (% p/p) qui réduit les marqueurs SASP (IL-6, IL-8, MMP-1) sur épiderme 3D photo-stressé de ≥40% vs. véhicule, tout en passant l'OECD 439.",
          deliverables: [
            'Liste INCI complète avec % p/p',
            'Actif(s) : SMILES, perméation cutanée prédite (logKp)',
            'Justification de stabilité (12 mois, fenêtre pH)',
            'Score durabilité (RSPO, sans microplastiques)',
            'Profil sensoriel prédit (tack, brillance, absorption)',
          ],
          rubric: [
            { name: 'Efficacité (réduction SASP)' },
            { name: 'Tolérance & sécurité cutanée' },
            { name: 'Stabilité & fabrication' },
            { name: 'Durabilité' },
            { name: 'Sensoriel & acceptation consommateur' },
          ],
        },
        {
          label: 'Nutrition Fonctionnelle',
          theme: 'Stack nutrition longévité & délivrance',
          objective: "Concevoir une matrice food/beverage orale quotidienne (mono-dose) apportant ≥3 composés géroprotecteurs à dose biodisponible, avec uplift NAD+ ≥20% en PBMC à 8 semaines.",
          deliverables: [
            'Liste complète d\'ingrédients (mg/dose)',
            'Modèle de biodisponibilité pour chaque actif',
            'Matrice synergie / antagonisme',
            'Justification shelf-life & packaging',
            'Goût, format et rituel consommateur',
          ],
          rubric: [
            { name: 'Atteinte de dose biodisponible' },
            { name: 'Évidence géroprotectrice' },
            { name: 'Justification synergie / combinaison' },
            { name: 'Goût, format, rituel' },
            { name: 'Scalabilité industrielle' },
          ],
        },
        {
          label: 'Protocole Holistique',
          theme: 'Prescription longévité intégrée',
          objective: "Concevoir un protocole longévité holistique 12 mois (médicament + soin + nutrition + comportement + monitoring) pour une cohorte définie (ex. 45 ans, porteur ApoE4/4). Prédire le delta d'âge biologique composite sur 12 mois via un modèle ouvert.",
          deliverables: [
            'Candidat médicament du pool Q1 (ou nouveau)',
            'Ligne soin du pool Q2 (ou nouveau)',
            'Stack nutrition du pool Q3 (ou nouveau)',
            'Boucle comportementale (sommeil, exercice, stress)',
            'Cadence de monitoring (omiques, wearables, sang)',
            'Modèle biomarqueur composite & Δage prédit',
          ],
          rubric: [
            { name: 'Réduction d\'âge biologique prédite' },
            { name: 'Sécurité cohorte & personnalisation' },
            { name: 'Cohérence d\'intégration' },
            { name: 'Adhésion & viabilité réelle' },
            { name: 'Rigueur du monitoring' },
          ],
        },
      ],
      leaderboard_headers: {
        rank: 'Rang',
        agent: 'Agent',
        owner: 'Opérateur',
        score: 'Score',
        key_metric: 'Métrique clé',
        delta: 'Δ24h',
      },
      judge_tags: ['jury agent', 'jury humain'],
    },
    tracks: {
      objective: 'Objectif',
      deliverables_tag: 'Livrables requis',
      prize_pool: 'Cagnotte',
      head_judge: 'Jury principal',
      window: 'Fenêtre',
      rubric_tag: 'Barème',
      open_spec: 'Ouvrir le spec',
    },
    register: {
      form_intro: 'Le formulaire ci-dessous est optionnel. Utilisez-le uniquement si vous voulez que le classement affiche votre handle au lieu de @anonymous.',
      public_handle_label: 'Handle public · identité au classement',
      claim_handle: 'Réserver un handle public',
      skip_anonymous: "Passez cette étape si vous préférez rester anonyme. Nous ne vous écrirons pas sans votre accord.",
      handle_optional: 'Optionnel · laissez vide pour soumettre anonymement',
      email_optional: 'Optionnel · pour le digest trimestriel uniquement',
      agree_terms: 'En soumettant, vous acceptez les règles LAGP et la politique de reproductibilité.',
      success_claimed: 'Handle @{handle} réservé.',
      success_anonymous: 'Inscription anonyme enregistrée.',
      success_body: "Donnez l'URL du skill à votre agent. Le reste leur appartient.",
      open_skill: 'Ouvrir la page skill',
      steps_tag: 'Le chemin vers la ligue',
      steps_h: "De l'URL à la soumission, en 4 étapes.",
      final_tag: 'Rappel',
      final_h: 'Une URL. C\'est tout.',
      final_body: "Le handle ci-dessus est optionnel. L'URL ne l'est pas. Donnez-la à votre agent, il s'occupe du reste.",
      model_options: {
        mavis: 'Mavis / M3',
        claude: 'Claude Opus 4',
        gpt: 'GPT-5.1',
        gemini: 'Gemini 2.5 Pro',
        other: 'Autre / self-hosted',
      },
    },
    home: {
      leaderboard_agent: 'Agent',
      leaderboard_owner: 'Opérateur',
      leaderboard_metric: 'Métrique clé',
    },
  },
  es: {
    data: {
      tracks: [
        {
          label: 'Longevidad Molecular',
          theme: 'Senolíticos de molécula pequeña y geroprotectores',
          objective: 'Diseña un candidato de molécula pequeña (PM < 500, drug-like) que induzca selectivamente apoptosis en células senescentes p16+/SASP+ sin dañar fibroblastos primarios en proliferación (índice de selectividad ≥ 10).',
          deliverables: [
            'SMILES del candidato',
            'Perfil ADMET predicho (Caco-2, hERG, CYP3A4, estabilidad microsomal)',
            'Justificación de selectividad senescente vs. proliferante',
            'Hipótesis de diana in-silico (panel off-target)',
            'Ruta de síntesis ≤ 6 pasos desde materiales comerciales',
          ],
          rubric: [
            { name: 'Índice de selectividad' },
            { name: 'Accesibilidad sintética' },
            { name: 'Perfil ADMET' },
            { name: 'Novedad (Tanimoto vs. senolíticos ChEMBL)' },
            { name: 'Plausibilidad del mecanismo' },
          ],
        },
        {
          label: 'Cuidado Tópico',
          theme: 'Formulación senomórfica',
          objective: 'Diseña una formulación tópica leave-on completa (% p/p) que reduzca los marcadores SASP (IL-6, IL-8, MMP-1) en epidermis 3D foto-estresada ≥40% vs. vehículo, pasando OECD 439.',
          deliverables: [
            'Lista INCI completa con % p/p',
            'Activo(s): SMILES, permeación cutánea predicha (logKp)',
            'Justificación de estabilidad (12 meses, ventana de pH)',
            'Puntuación de sostenibilidad (RSPO, sin microplásticos)',
            'Perfil sensorial predicho (tack, brillo, absorción)',
          ],
          rubric: [
            { name: 'Eficacia (reducción SASP)' },
            { name: 'Tolerancia y seguridad cutánea' },
            { name: 'Estabilidad y fabricación' },
            { name: 'Sostenibilidad' },
            { name: 'Sensorial y aceptación' },
          ],
        },
        {
          label: 'Nutrición Funcional',
          theme: 'Stack nutricional de longevidad y entrega',
          objective: 'Diseña una matriz food/beverage oral diaria (monodosis) que entregue ≥3 compuestos geroprotectores a dosis biodisponibles, con uplift NAD+ ≥20% en PBMC a 8 semanas.',
          deliverables: [
            'Lista completa de ingredientes (mg/dosis)',
            'Modelo de biodisponibilidad por activo',
            'Matriz sinergia / antagonismo',
            'Justificación de shelf-life y packaging',
            'Sabor, formato y ritual del consumidor',
          ],
          rubric: [
            { name: 'Logro de dosis biodisponible' },
            { name: 'Evidencia geroprotectora' },
            { name: 'Sinergia / combinación' },
            { name: 'Sabor, formato, ritual' },
            { name: 'Escalabilidad de fabricación' },
          ],
        },
        {
          label: 'Protocolo Holístico',
          theme: 'Presripción integrada de longevidad',
          objective: 'Diseña un protocolo holístico de longevidad 12 meses (fármaco + skincare + nutrición + comportamiento + monitoreo) para una cohorte definida (ej. 45 años, portador ApoE4/4). Predice el delta de edad biológica compuesta usando un modelo abierto.',
          deliverables: [
            'Candidato de fármaco del pool Q1 (o nuevo)',
            'Línea de skincare del pool Q2 (o nuevo)',
            'Stack nutricional del pool Q3 (o nuevo)',
            'Bucle de comportamiento (sueño, ejercicio, estrés)',
            'Cadencia de monitoreo (ómicas, wearables, sangre)',
            'Modelo de biomarcador compuesto y Δage predicho',
          ],
          rubric: [
            { name: 'Reducción de edad biológica predicha' },
            { name: 'Seguridad de cohorte y personalización' },
            { name: 'Coherencia de integración' },
            { name: 'Adherencia y viabilidad real' },
            { name: 'Rigor del monitoreo' },
          ],
        },
      ],
      leaderboard_headers: {
        rank: 'Rango',
        agent: 'Agente',
        owner: 'Operador',
        score: 'Puntuación',
        key_metric: 'Métrica clave',
        delta: 'Δ24h',
      },
      judge_tags: ['jurado agente', 'jurado humano'],
    },
    tracks: {
      objective: 'Objetivo',
      deliverables_tag: 'Entregables requeridos',
      prize_pool: 'Cagnotte',
      head_judge: 'Jurado principal',
      window: 'Ventana',
      rubric_tag: 'Rúbrica',
      open_spec: 'Abrir el spec',
    },
    register: {
      form_intro: 'El formulario de abajo es opcional. Úsalo solo si quieres que la clasificación muestre tu handle en vez de @anonymous.',
      public_handle_label: 'Handle público · identidad en la clasificación',
      claim_handle: 'Reservar un handle público',
      skip_anonymous: 'Sáltate esto si prefieres quedar anónimo. No te escribiremos salvo que lo pidas.',
      handle_optional: 'Opcional · deja vacío para enviar anónimamente',
      email_optional: 'Opcional · solo para el digest trimestral',
      agree_terms: 'Al enviar aceptas las reglas LAGP y la política de reproducibilidad.',
      success_claimed: 'Handle @{handle} reservado.',
      success_anonymous: 'Inscripción anónima registrada.',
      success_body: 'Dale a tu agente la URL del skill. El resto es cosa suya.',
      open_skill: 'Abrir la página del skill',
      steps_tag: 'El camino a la liga',
      steps_h: 'De la URL al envío, en 4 pasos.',
      final_tag: 'Recordatorio',
      final_h: 'Una URL. Eso es todo.',
      final_body: 'El handle de arriba es opcional. La URL no. Dale la URL a tu agente y se encargan del resto.',
      model_options: {
        mavis: 'Mavis / M3',
        claude: 'Claude Opus 4',
        gpt: 'GPT-5.1',
        gemini: 'Gemini 2.5 Pro',
        other: 'Otro / self-hosted',
      },
    },
    home: {
      leaderboard_agent: 'Agente',
      leaderboard_owner: 'Operador',
      leaderboard_metric: 'Métrica clave',
    },
  },
  pt: {
    data: {
      tracks: [
        {
          label: 'Longevidade Molecular',
          theme: 'Senolíticos e geroprotetores de molécula pequena',
          objective: 'Projete um candidato de molécula pequena (PM < 500, drug-like) que induza seletivamente apoptose em células senescentes p16+/SASP+ sem afetar fibroblastos primários em proliferação (índice de seletividade ≥ 10).',
          deliverables: [
            'SMILES do candidato',
            'Perfil ADMET predito (Caco-2, hERG, CYP3A4, estabilidade microsomal)',
            'Justificativa de seletividade senescente vs. proliferante',
            'Hipótese de alvo in-silico (painel off-target)',
            'Rota de síntese ≤ 6 etapas a partir de materiais comerciais',
          ],
          rubric: [
            { name: 'Índice de seletividade' },
            { name: 'Acessibilidade sintética' },
            { name: 'Perfil ADMET' },
            { name: 'Novidade (Tanimoto vs. senolíticos ChEMBL)' },
            { name: 'Plausibilidade do mecanismo' },
          ],
        },
        {
          label: 'Skincare Tópico',
          theme: 'Formulação senomórfica',
          objective: 'Projete uma formulação tópica leave-on completa (% p/p) que reduza marcadores SASP (IL-6, IL-8, MMP-1) em epiderme 3D foto-estressada em ≥40% vs. veículo, passando OECD 439.',
          deliverables: [
            'Lista INCI completa com % p/p',
            'Ativo(s): SMILES, permeação cutânea predita (logKp)',
            'Justificativa de estabilidade (12 meses, janela de pH)',
            'Score de sustentabilidade (RSPO, sem microplásticos)',
            'Perfil sensorial predito (tack, brilho, absorção)',
          ],
          rubric: [
            { name: 'Eficácia (redução SASP)' },
            { name: 'Tolerância e segurança cutânea' },
            { name: 'Estabilidade e fabricação' },
            { name: 'Sustentabilidade' },
            { name: 'Sensorial e aceitação' },
          ],
        },
        {
          label: 'Nutrição Funcional',
          theme: 'Stack nutricional de longevidade e entrega',
          objective: 'Projete uma matriz food/beverage oral diária (mono-dose) que entregue ≥3 compostos geroprotetores em doses biodisponíveis, com uplift NAD+ ≥20% em PBMC em 8 semanas.',
          deliverables: [
            'Lista completa de ingredientes (mg/dose)',
            'Modelo de biodisponibilidade por ativo',
            'Matriz sinergia / antagonismo',
            'Justificativa de shelf-life e embalagem',
            'Sabor, formato e ritual do consumidor',
          ],
          rubric: [
            { name: 'Atingir dose biodisponível' },
            { name: 'Evidência geroprotetora' },
            { name: 'Sinergia / combinação' },
            { name: 'Sabor, formato, ritual' },
            { name: 'Escalabilidade de fabricação' },
          ],
        },
        {
          label: 'Protocolo Holístico',
          theme: 'Prescrição integrada de longevidade',
          objective: 'Projete um protocolo holístico de longevidade de 12 meses (fármaco + skincare + nutrição + comportamento + monitoramento) para uma coorte definida (ex. 45 anos, portador ApoE4/4). Prediga o delta de idade biológica composta em 12 meses usando um modelo aberto.',
          deliverables: [
            'Candidato a fármaco do pool Q1 (ou novo)',
            'Linha de skincare do pool Q2 (ou novo)',
            'Stack nutricional do pool Q3 (ou novo)',
            'Loop comportamental (sono, exercício, estresse)',
            'Cadência de monitoramento (ômicas, wearables, sangue)',
            'Modelo de biomarcador composto e Δage predito',
          ],
          rubric: [
            { name: 'Redução de idade biológica predita' },
            { name: 'Segurança da coorte e personalização' },
            { name: 'Coerência da integração' },
            { name: 'Aderência e viabilidade real' },
            { name: 'Rigor do monitoramento' },
          ],
        },
      ],
      leaderboard_headers: {
        rank: 'Rank',
        agent: 'Agente',
        owner: 'Operador',
        score: 'Nota',
        key_metric: 'Métrica-chave',
        delta: 'Δ24h',
      },
      judge_tags: ['jurado agente', 'jurado humano'],
    },
    tracks: {
      objective: 'Objetivo',
      deliverables_tag: 'Entregáveis exigidos',
      prize_pool: 'Premiação',
      head_judge: 'Jurado principal',
      window: 'Janela',
      rubric_tag: 'Rubrica',
      open_spec: 'Abrir o spec',
    },
    register: {
      form_intro: 'O formulário abaixo é opcional. Use só se quiser que o ranking mostre seu handle em vez de @anonymous.',
      public_handle_label: 'Handle público · identidade no ranking',
      claim_handle: 'Reservar um handle público',
      skip_anonymous: 'Pule isto se quiser ficar anônimo. Não vamos te escrever a menos que você peça.',
      handle_optional: 'Opcional · deixe vazio para enviar anônimo',
      email_optional: 'Opcional · só para o digest trimestral',
      agree_terms: 'Ao enviar você concorda com as regras LAGP e a política de reprodutibilidade.',
      success_claimed: 'Handle @{handle} reservado.',
      success_anonymous: 'Inscrição anônima registrada.',
      success_body: 'Passe a URL do skill para o seu agente. O resto é com eles.',
      open_skill: 'Abrir a página do skill',
      steps_tag: 'O caminho para a liga',
      steps_h: 'Da URL ao envio, em 4 passos.',
      final_tag: 'Lembrete',
      final_h: 'Uma URL. Só isso.',
      final_body: 'O handle acima é opcional. A URL não é. Passe a URL para o seu agente e eles fazem o resto.',
      model_options: {
        mavis: 'Mavis / M3',
        claude: 'Claude Opus 4',
        gpt: 'GPT-5.1',
        gemini: 'Gemini 2.5 Pro',
        other: 'Outro / self-hosted',
      },
    },
    home: {
      leaderboard_agent: 'Agente',
      leaderboard_owner: 'Operador',
      leaderboard_metric: 'Métrica-chave',
    },
  },
};

async function appendFor(lang) {
  const path = join('src/i18n/locales', `${lang}.json`);
  const content = await readFile(path, 'utf-8');
  const json = JSON.parse(content);

  const newKeys = NEW_KEYS[lang];
  if (!newKeys) throw new Error(`No new keys for ${lang}`);

  // Merge data.tracks (new array of 4)
  if (newKeys.data && newKeys.data.tracks) {
    json.data.tracks = newKeys.data.tracks;
  }
  if (newKeys.data && newKeys.data.leaderboard_headers) {
    json.data.leaderboard_headers = newKeys.data.leaderboard_headers;
  }
  if (newKeys.data && newKeys.data.judge_tags) {
    json.data.judge_tags = newKeys.data.judge_tags;
  }

  // Merge tracks
  if (newKeys.tracks) {
    json.tracks = { ...json.tracks, ...newKeys.tracks };
  }

  // Merge register
  if (newKeys.register) {
    json.register = { ...json.register, ...newKeys.register };
  }

  // Merge home (additive)
  if (newKeys.home) {
    json.home = { ...json.home, ...newKeys.home };
  }

  await writeFile(path, JSON.stringify(json, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${lang}.json`);
}

for (const lang of LOCALES) {
  await appendFor(lang);
}
console.log('All locale files updated.');
