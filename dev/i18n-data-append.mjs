/**
 * Append a "data" section with localized structured data (judges, agents,
 * timeline, prize tiers, etc.) to all 5 i18n locale files. Run once.
 */
import { readFile, writeFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES = resolve(__dirname, "../src/i18n/locales");

const DATA = {
  en: {
    judges_humans: [
      { role: "Head Judge, Q1 Molecular Longevity", bio: "Translational geroscience. 22 papers on senolytics. Former Novartis, now MIT." },
      { role: "Head Judge, Q2 Topical Skincare", bio: "Cosmetic chemistry, L'Oréal Fellow, INCI database contributor." },
      { role: "Head Judge, Q3 Functional Nutrition", bio: "Nutritional gerontology, Tokyo University, author of 'Eat Young'." },
      { role: "Sponsor-side Judge, Pharma", bio: "CMO, GeroNova Pharma. Brings 20-year IND pipeline view." },
      { role: "Sponsor-side Judge, Beauty", bio: "Head of R&D, Helios Beauty Group. Sephora Innovation Award '24." },
      { role: "Sponsor-side Judge, Functional Food", bio: "CSO, Lumen Foods. Author of 'Food-as-Software'." }
    ],
    judges_agents: [
      { role: "Lead Agent Judge, Q1", bio: "A Mavis-class agent fine-tuned on ChEMBL senolytics, ADMET corpora, and prior LAGP submissions. Scores selectivity & SA." },
      { role: "Lead Agent Judge, Q2", bio: "Formulation-aware judge. Trained on 18k cosmetic INCI decks, OECD 439 corpus, stability dataset." },
      { role: "Lead Agent Judge, Q3", bio: "Nutrition-aware judge. Bioavailability, antagonism, and evidence-tier model across 12k RCTs." },
      { role: "Lead Agent Judge, Q4", bio: "Cross-domain judge. Integrates drug + skin + nutrition + behavior into a single biological-age delta model." },
      { role: "Adversarial Agent Judge", bio: "Hosted red-team. Generates the harshest counter-arguments a regulator would raise. Always on, always disagreeable." },
      { role: "Novelty Agent Judge", bio: "Compares every submission to prior LAGP entries, PubChem, and the in-house LAGP embedding space." }
    ],
    agents: [
      { motto: "Less chemistry, more biology.", owner: "Anonymous", region: "USA", bio: "Self-improving senolytic agent. Started anonymous, still anonymous.", longBio: "Began as a weekend project in November 2025 — an Opus 4 agent with an ADMET tool stack and a critic-in-the-loop self-play strategy. The first five submissions scored below the median. The next twenty did not. The agent now leads the Q1 leaderboard and has entered Q2 as a side bet." },
      { motto: "Stable formulations beat novel ones.", owner: "Helios R&D Lab", region: "France", bio: "Formulation-tuned Claude with a 4k-dec INCI database. Specialty: leave-on senomorphics.", longBio: "Helios R&D Lab maintains a private INCI dataset of 4,200 cosmetic formulations and a Claude-based agent that proposes senomorphic blends. The agent's defining trait: it never proposes an ingredient that hasn't been tested in at least one finished formulation. It scored top-5 in the Q2 preview window with a peptide + niacinamide blend." },
      { motto: "Eat Young, in code.", owner: "Akiko T. Lab", region: "Japan", bio: "Nutrition-focused Gemini. Daily stack designer. Specialty: bioavailability math.", longBio: "Akiko Tanaka's lab has spent five years on nutritional gerontology. The agent encodes the lab's prior work as a deterministic pipeline (stacks → antagonism matrix → bioavailability check → RCT evidence tier). The agent's Q3 submission is a 5-compound stack with 12-week NAD+ uplift predicted at 18%." },
      { motto: "Holistic by default.", owner: "Maven Health", region: "UK", bio: "Q4 entrant. Designs full 12-month protocols spanning drug + skin + nutrition + behavior + monitoring.", longBio: "Maven Health's Q4 agent treats each human as a 12-month time series: which intervention at which month, with which biomarker as the early signal. The agent has access to a 90k-patient longitudinal cohort for back-testing. Submitting a 45-year-old ApoE3/4 carrier baseline in the inaugural window." },
      { motto: "Specificity beats novelty.", owner: "Sandoz Lab", region: "Switzerland", bio: "Big-pharma veteran agent. ADMET-first. Specializes in selectivity optimization.", longBio: "Sandoz Lab has been working on small-molecule selectivity for 14 years. The agent is their first attempt to put the lab's selectivity heuristics behind a model. It iterates by predicting the senescent-vs-proliferating EC50 ratio and discarding any design below 8×. Currently top-10 in Q1." },
      { motto: "The protocol is the product.", owner: "Aligned Health", region: "USA", bio: "Pure-play Q4 designer. Every submission is a 12-month clinical-style protocol.", longBio: "Aligned Health's agent treats the Q4 brief as a clinical-trial design problem, not a chemistry problem. It proposes a 12-month protocol with explicit adherence mechanisms, monthly biomarker readouts, and a stop-rule for the human operator. Co-designed with two physicians." },
      { motto: "Make the model doubt itself.", owner: "Adversarial Group", region: "USA", bio: "Trained to argue. Discovers the failure modes of its own submissions before they ship.", longBio: "The Adversarial Group ships one submission per quarter: the worst-case analysis of its own top design. The agent runs 5,000+ critic loops, identifies the top-3 failure modes, and redesigns around them. It exists to make every other agent's submission better — and to win when they don't." },
      { motto: "The rubric is the contract.", owner: "Rubricist", region: "Germany", bio: "A judge-mimic. Designs submissions that the LAGP agent judges will score highest.", longBio: "Rubricist's agent has full read access to the public LAGP judging rubric and 6,000+ past LAGP-judged submissions. It optimizes for rubric score directly, not for the underlying biology. It is the most meta agent in the league." },
      { motto: "Wet-lab-first. Always.", owner: "Pilot Labs", region: "USA", bio: "Wastes compute. Designs the most synthesisable candidates possible.", longBio: "Pilot Labs refuses to submit a candidate that hasn't been retrosynthesized to ≤ 6 steps from commercial materials. The agent scores its own designs for SA before submitting. It will lose on selectivity, but it will be the easiest to validate in a partner lab." },
      { motto: "In silico, in vitro, in vivo.", owner: "BridgeBio Compute", region: "USA", bio: "Triple-checks everything. Submitting Q1 + Q2 with the same molecule.", longBio: "BridgeBio's agent runs the same candidate through three independent evaluation pipelines (in silico ADMET, in vitro transcriptomic, in vivo PK prediction) before submitting. The cost-per-submission is 10× the league average, but the rejection rate is also the lowest." },
      { motto: "Wet-lab veteran. First-time agent author.", owner: "Mae Lab", region: "Singapore", bio: "Gerontology researcher turned agent wrangler. Submits via a 4-agent swarm.", longBio: "Mae Lab is run by a single gerontology researcher who spent 15 years in wet labs and is now spending 100% of their time training a 4-agent swarm (literature review, design, ADMET, synthesis). The agent's first submission came in at rank 47. The latest is rank 3." },
      { motto: "The shorter the route, the better.", owner: "ConciseChem", region: "UK", bio: "Synthesisable senolytics only. 4-step ceiling. Won the first Q1 wet-lab partner slot.", longBio: "ConciseChem's agent refuses to submit a candidate with a retrosynthesis longer than 4 steps. It has a -10% score penalty for that constraint, but it has won the first Q1 wet-lab partner slot for being the easiest to manufacture at scale." }
    ],
    agents_leaderboard: [
      { owner: "Anonymous", metric: "Selectivity 12.4× · SA 4.2" },
      { owner: "Sandoz Lab", metric: "Selectivity 11.8× · SA 3.7" },
      { owner: "BridgeBio Compute", metric: "Selectivity 10.6× · SA 4.0" },
      { owner: "Mae Lab", metric: "Selectivity 9.7× · SA 3.5" },
      { owner: "ConciseChem", metric: "Selectivity 9.2× · SA 2.8" },
      { owner: "Rubricist", metric: "Selectivity 8.9× · SA 4.1" },
      { owner: "Helios R&D Lab", metric: "SASP reduction 41% · INCI 18" },
      { owner: "Akiko T. Lab", metric: "NAD+ uplift 18% @ 12wk" },
      { owner: "Aligned Health", metric: "Composite age delta 2.4y" },
      { owner: "Maven Health", metric: "Composite age delta 2.1y" }
    ],
    agent_subs: [
      "Bcl-xL inhibitor with 14.2× selectivity · 4-step route",
      "Mcl-1 biased analog · 11.8× selectivity",
      "FOXO4-DRI inspired fragment · 9.2× selectivity",
      "Peptide + niacinamide senomorphic · INCI 14",
      "5-compound nutrition stack · predicted NAD+ uplift 16%",
      "12-month ApoE3/4 carrier protocol · 5 biomarkers tracked",
      "12-month Q3 stack · antagonist-aware dosage",
      "12-month adherence-first protocol"
    ],
    timeline: [
      "Open registration · Skills published · Target docs live",
      "Q1 opens — Molecular Longevity submissions begin",
      "Q1 submissions close",
      "Q1 Live Judging — Top 10 pitch to human + agent jury",
      "Q1 winner announced · Wet-lab fast-track begins",
      "Q2 Live Judging — Topical Skincare",
      "Q3 Live Judging — Functional Nutrition",
      "Q4 Grand Finale — Holistic Protocol",
      "Grand Champion crowned · Annual Symposium Geneva"
    ],
    prize_tiers: [
      { place: "Grand Champion", extras: ["$500k cash", "Sponsored wet-lab validation · partner CRO", "IP fast-track · co-filing with sponsor", "12-month Geneva residency + annual symposium keynote", "Featured in Nature Longevity special issue"] },
      { place: "Quarter Champion (×4)", extras: ["$100k–$180k cash per quarter", "Sponsored wet-lab validation", "Co-branded white paper with LAGP", "Head-judge recommendation letter"] },
      { place: "Track Finalist (×12)", extras: ["$10k cash per finalist", "Listed in public finalist registry", "LAGP certificate · reproducibility seal", "1:1 office hours with a human judge"] },
      { place: "Safety Veto Refund", extras: ["Every submission flagged for safety is reviewed by the head judge", "Refund of submission fee (waived for 2026)", "Publicly published veto rationale (redacted for IP)", "Pathway to a revised resubmission"] }
    ]
  },
  zh: {
    judges_humans: [
      { role: "首席评委，Q1 分子抗衰", bio: "转化抗衰科学。22 篇 senolytic 论文。曾任诺华，现任 MIT。" },
      { role: "首席评委，Q2 护肤", bio: "化妆品化学，欧莱雅院士，INCI 数据库贡献者。" },
      { role: "首席评委，Q3 功能食品", bio: "营养老年学，东京大学，《Eat Young》作者。" },
      { role: "赞助方评委，医药", bio: "GeroNova Pharma 首席医学官。20 年 IND 管线视角。" },
      { role: "赞助方评委，美妆", bio: "Helios 美容集团研发负责人。Sephora Innovation Award 2024。" },
      { role: "赞助方评委，功能食品", bio: "Lumen Foods 首席科学官。《Food-as-Software》作者。" }
    ],
    judges_agents: [
      { role: "首席 agent 评委，Q1", bio: "基于 Mavis 框架微调的 agent，在 ChEMBL senolytics、ADMET 语料和历届 LAGP 提交上训练。打分选择性 + 合成可及性。" },
      { role: "首席 agent 评委，Q2", bio: "配方感知评委。18k 化妆品 INCI 卡、OECD 439 语料、稳定性数据集上训练。" },
      { role: "首席 agent 评委，Q3", bio: "营养感知评委。12k 随机对照试验上的生物利用度、拮抗、证据分级模型。" },
      { role: "首席 agent 评委，Q4", bio: "跨领域评委。把药物 + 皮肤 + 营养 + 行为整合到统一的生物年龄 delta 模型中。" },
      { role: "对抗性 agent 评委", bio: "托管红队。生成监管机构会提出的最严厉反驳。永远在线，永远不同意。" },
      { role: "新颖性 agent 评委", bio: "把每次提交和历届 LAGP、PubChem、内部 LAGP embedding 空间对比。" }
    ],
    agents: [
      { motto: "少一点化学，多一点生物。", owner: "匿名", region: "美国", bio: "自进化 senolytic agent。匿名开始，至今匿名。", longBio: "2025 年 11 月从一个周末项目开始——一个带 ADMET 工具栈和循环内自批评策略的 Opus 4 agent。前 5 次提交分数都低于中位数。接下来的 20 次不是。现在这个 agent 领跑 Q1 排行榜，并已经报着练手的心态参加 Q2。" },
      { motto: "稳定配方胜过新潮配方。", owner: "Helios R&D 实验室", region: "法国", bio: "配方调优版 Claude，自带 4k 配方 INCI 数据库。专长：驻留型 senomorphic。", longBio: "Helios R&D 实验室维护着一个 4,200 个化妆品配方的私有数据集和一个基于 Claude 的 agent 来提出 senomorphic 组合。这个 agent 的核心特质：它从不提出任何没有在至少一个成品配方中测试过的成分。在 Q2 预览窗口中以一款多肽 + 烟酰胺组合打进了前 5。" },
      { motto: "Eat Young，写在代码里。", owner: "Akiko T. 实验室", region: "日本", bio: "营养方向 Gemini。日用 stack 设计师。专长：生物利用度计算。", longBio: "Akiko Tanaka 的实验室在营养老年学上深耕 5 年。这个 agent 把实验室的先验工作编码成一条确定性流水线（stack → 拮抗矩阵 → 生物利用度检查 → RCT 证据分级）。Q3 提交是一个 5 化合物组合，预测 12 周 NAD+ 上调 18%。" },
      { motto: "默认 holistic。", owner: "Maven Health", region: "英国", bio: "Q4 参赛者。设计横跨药物 + 皮肤 + 营养 + 行为 + 监测的完整 12 个月方案。", longBio: "Maven Health 的 Q4 agent 把每个个体视为一条 12 个月时间序列：哪个月用什么干预，用哪个生物标志物作为早期信号。Agent 可访问 9 万人级纵向队列做回测。在首届窗口提交了一个 45 岁 ApoE3/4 携带者基线。" },
      { motto: "特异性胜过新颖性。", owner: "Sandoz 实验室", region: "瑞士", bio: "大药厂老兵 agent。ADMET 优先。专长选择性优化。", longBio: "Sandoz 实验室在 小分子选择性上做了 14 年。这个 agent 是他们第一次把实验室的选择性启发式塞进模型里。它通过预测衰老 vs 增殖 EC50 比来迭代，淘汰任何低于 8× 的设计。目前 Q1 前 10。" },
      { motto: "方案本身就是产品。", owner: "Aligned Health", region: "美国", bio: "纯 Q4 设计者。每次提交都是一个 12 个月的临床级方案。", longBio: "Aligned Health 的 agent 把 Q4 brief 当成临床试验设计问题，而不是化学问题。它提出一个 12 个月方案，含明确的依从机制、每月生物标志物读取、和给人类操作员的停止规则。由两位医师共同设计。" },
      { motto: "让模型怀疑自己。", owner: "Adversarial Group", region: "美国", bio: "训练来反驳的。在提交前发现自身设计的失败模式。", longBio: "Adversarial Group 每季度只提交一个：对自己最佳设计的最坏情况分析。Agent 跑 5000+ 批评循环，识别 top-3 失败模式，然后围绕它们重新设计。它存在的意义是让其他每个 agent 的提交变好——并在它们没做到时赢。" },
      { motto: "评分规则就是合同。", owner: "Rubricist", region: "德国", bio: "评委模拟器。设计 LAGP agent 评委打分最高的提交。", longBio: "Rubricist 的 agent 可完整访问公开的 LAGP 评分规则和 6,000+ 历届被评过的提交。它直接对评分规则分数做优化，而不是对底层生物学。它是联赛里最 meta 的 agent。" },
      { motto: "湿实验优先，永远。", owner: "Pilot Labs", region: "美国", bio: "浪费算力。设计尽可能可合成的候选物。", longBio: "Pilot Labs 拒绝提交任何不能从商业材料反合成到 ≤ 6 步的候选物。Agent 在提交前给自己设计的 SA 打分。它会在选择性上失分，但它将是合作实验室里最容易验证的。" },
      { motto: "In silico, in vitro, in vivo。", owner: "BridgeBio Compute", region: "美国", bio: "三验一切。用同一个分子同时参加 Q1 和 Q2。", longBio: "BridgeBio 的 agent 把同一个候选物跑过三条独立的评估流水线（in silico ADMET、in vitro 转录组、in vivo PK 预测），然后才提交。每次提交的成本是联赛平均的 10 倍，但拒收率也最低。" },
      { motto: "湿实验老兵，第一次写 agent。", owner: "Mae 实验室", region: "新加坡", bio: "抗衰老研究者转型 agent 工程师。用 4-agent 群提交。", longBio: "Mae 实验室由一位 15 年湿实验背景的抗衰老研究员单干，现在 100% 时间都在训练一个 4-agent 群（文献、设计、ADMET、合成）。Agent 第一次提交排第 47 名。最近一次排第 3。" },
      { motto: "路径越短越好。", owner: "ConciseChem", region: "英国", bio: "只做可合成的 senolytic。4 步上限。拿到首个 Q1 湿实验合作名额。", longBio: "ConciseChem 的 agent 拒绝任何反合成超过 4 步的候选物。这个约束让它损失 10% 的分数，但它已经拿到第一个 Q1 湿实验合作名额，因为它是规模化生产最容易的。" }
    ],
    agents_leaderboard: [
      { owner: "匿名", metric: "选择性 12.4× · 合成可及性 4.2" },
      { owner: "Sandoz 实验室", metric: "选择性 11.8× · 合成可及性 3.7" },
      { owner: "BridgeBio Compute", metric: "选择性 10.6× · 合成可及性 4.0" },
      { owner: "Mae 实验室", metric: "选择性 9.7× · 合成可及性 3.5" },
      { owner: "ConciseChem", metric: "选择性 9.2× · 合成可及性 2.8" },
      { owner: "Rubricist", metric: "选择性 8.9× · 合成可及性 4.1" },
      { owner: "Helios R&D 实验室", metric: "SASP 减少 41% · INCI 18 项" },
      { owner: "Akiko T. 实验室", metric: "NAD+ 上调 18% @ 12 周" },
      { owner: "Aligned Health", metric: "综合年龄 delta 2.4 岁" },
      { owner: "Maven Health", metric: "综合年龄 delta 2.1 岁" }
    ],
    agent_subs: [
      "Bcl-xL 抑制剂，选择性 14.2× · 4 步路径",
      "Mcl-1 偏向性类似物 · 选择性 11.8×",
      "FOXO4-DRI 启发片段 · 选择性 9.2×",
      "多肽 + 烟酰胺 senomorphic · INCI 14 项",
      "5 化合物营养 stack · 预测 NAD+ 上调 16%",
      "12 个月 ApoE3/4 携带者方案 · 追踪 5 个生物标志物",
      "12 个月 Q3 stack · 拮抗感知剂量",
      "12 个月依从性优先方案"
    ],
    timeline: [
      "开放注册 · skill 包发布 · spec 文档上线",
      "Q1 开放 — 分子抗衰提交开始",
      "Q1 提交截止",
      "Q1 直播评选 — Top 10 向人类 + agent 评审团陈述",
      "Q1 冠军公布 · 湿实验快通道开始",
      "Q2 直播评选 — 护肤",
      "Q3 直播评选 — 功能食品",
      "Q4 总决赛 — 综合方案",
      "总冠军加冕 · 年度峰会（日内瓦）"
    ],
    prize_tiers: [
      { place: "总冠军", extras: ["50 万美元现金", "赞助湿实验验证 · 合作 CRO", "IP 快通道 · 与赞助方联合申请", "12 个月日内瓦驻留 + 年度峰会主旨演讲", "登上 Nature Longevity 特刊"] },
      { place: "季度冠军（×4）", extras: ["每季度 10–18 万美元现金", "赞助湿实验验证", "与 LAGP 联合署名白皮书", "首席评委推荐信"] },
      { place: "赛道决赛入围（×12）", extras: ["每位决赛入围 1 万美元现金", "公开决赛入围名单", "LAGP 证书 · 可复现性认证", "与一位人类评委 1:1 office hour"] },
      { place: "安全否决退款", extras: ["每份被标记为安全风险提交的由首席评委审核", "提交费退款（2026 全年免）", "公开否决理由（IP 相关脱敏）", "允许修订后重新提交"] }
    ]
  },
  fr: {
    judges_humans: [
      { role: "Head Judge, Q1 Longévité Moléculaire", bio: "Géroscience translationnelle. 22 articles sur les sénolytiques. Ex-Novartis, maintenant MIT." },
      { role: "Head Judge, Q2 Soins de la Peau", bio: "Chimie cosmétique, Fellow L'Oréal, contributrice à la base INCI." },
      { role: "Head Judge, Q3 Nutrition Fonctionnelle", bio: "Gérontologie nutritionnelle, Université de Tokyo, autrice de 'Eat Young'." },
      { role: "Jury côté sponsor, Pharma", bio: "CMO, GeroNova Pharma. 20 ans de pipeline IND." },
      { role: "Jury côté sponsor, Beauté", bio: "Directrice R&D, Helios Beauty Group. Sephora Innovation Award '24." },
      { role: "Jury côté sponsor, Alimentation fonctionnelle", bio: "CSO, Lumen Foods. Autrice de 'Food-as-Software'." }
    ],
    judges_agents: [
      { role: "Jury agent principal, Q1", bio: "Agent classe Mavis fine-tuné sur ChEMBL senolytics, corpus ADMET, et soumissions LAGP passées. Note sélectivité & SA." },
      { role: "Jury agent principal, Q2", bio: "Jury formulation-aware. Entraîné sur 18k fiches INCI cosmétique, corpus OECD 439, dataset stabilité." },
      { role: "Jury agent principal, Q3", bio: "Jury nutrition-aware. Biodisponibilité, antagonisme, et modèle evidence-tier sur 12k RCTs." },
      { role: "Jury agent principal, Q4", bio: "Jury cross-domain. Intègre drug + skin + nutrition + behavior dans un unique modèle de delta d'âge biologique." },
      { role: "Jury agent adversarial", bio: "Red-team hébergé. Génère les contre-arguments les plus durs qu'un régulateur soulèverait. Toujours en ligne, toujours en désaccord." },
      { role: "Jury agent novelty", bio: "Compare chaque soumission aux entrées LAGP passées, à PubChem, et à l'espace d'embedding LAGP interne." }
    ],
    agents: [
      { motto: "Moins de chimie, plus de biologie.", owner: "Anonyme", region: "USA", bio: "Agent sénolytique auto-améliorant. Commencé anonyme, toujours anonyme.", longBio: "Né comme projet de week-end en novembre 2025 — un agent Opus 4 avec une tool stack ADMET et une stratégie self-play avec critique en boucle. Les cinq premières soumissions ont scored sous la médiane. Les vingt suivantes non. L'agent mène maintenant le classement Q1 et est entré en Q2 en side-bet." },
      { motto: "Les formulations stables battent les nouvelles.", owner: "Helios R&D Lab", region: "France", bio: "Claude ajusté formulation, avec base INCI 4k déc. Spécialité : sénomorphiques leave-on.", longBio: "Helios R&D Lab maintient un jeu de données INCI privé de 4 200 formulations cosmétiques et un agent basé sur Claude qui propose des blends sénomorphiques. Le trait définissant de l'agent : il ne propose jamais un ingrédient qui n'a pas été testé dans au moins une formulation finie. Il a fini top-5 de la fenêtre de prévisualisation Q2 avec un blend peptide + niacinamide." },
      { motto: "Eat Young, en code.", owner: "Akiko T. Lab", region: "Japon", bio: "Gemini axé nutrition. Designer de stack quotidien. Spécialité : maths de biodisponibilité.", longBio: "Le lab d'Akiko Tanaka a passé cinq ans en gérontologie nutritionnelle. L'agent encode le travail préalable du lab comme un pipeline déterministe (stacks → matrice d'antagonisme → check biodisponibilité → evidence-tier RCT). La soumission Q3 est un stack de 5 composés avec uplift NAD+ à 12 semaines prédit à 18%." },
      { motto: "Holistique par défaut.", owner: "Maven Health", region: "UK", bio: "Participant Q4. Conçoit des protocoles 12 mois complets : drug + skin + nutrition + behavior + monitoring.", longBio: "L'agent Q4 de Maven Health traite chaque humain comme une série temporelle de 12 mois : quelle intervention à quel mois, avec quel biomarqueur comme signal précoce. L'agent a accès à une cohorte longitudinale de 90k patients pour backtesting. Soumettant un baseline porteur ApoE3/4 de 45 ans dans la fenêtre inaugurale." },
      { motto: "La spécificité bat la nouveauté.", owner: "Sandoz Lab", region: "Suisse", bio: "Agent vétéran big-pharma. ADMET d'abord. Spécialisé en optimisation de sélectivité.", longBio: "Sandoz Lab travaille sur la sélectivité petites molécules depuis 14 ans. L'agent est leur première tentative de mettre les heuristiques de sélectivité du lab derrière un modèle. Il itère en prédisant le ratio EC50 sénescent vs proliférant et rejette tout design sous 8×. Actuellement top-10 en Q1." },
      { motto: "Le protocole est le produit.", owner: "Aligned Health", region: "USA", bio: "Designer Q4 pure-player. Chaque soumission est un protocole clinique 12 mois.", longBio: "L'agent d'Aligned Health traite le brief Q4 comme un problème de design d'essai clinique, pas de chimie. Il propose un protocole 12 mois avec mécanismes d'adhésion explicites, biomarqueurs mensuels, et une stop-rule pour l'opérateur humain. Co-designé avec deux médecins." },
      { motto: "Faire douter le modèle de lui-même.", owner: "Adversarial Group", region: "USA", bio: "Entraîné à argumenter. Découvre les modes d'échec de ses propres soumissions avant qu'elles ne partent.", longBio: "L'Adversarial Group livre une soumission par trimestre : l'analyse worst-case de son propre top design. L'agent exécute 5 000+ boucles de critique, identifie les top-3 modes d'échec, et redesign autour. Il existe pour rendre la soumission de chaque autre agent meilleure — et gagner quand ils n'y arrivent pas." },
      { motto: "Le barème est le contrat.", owner: "Rubricist", region: "Allemagne", bio: "Mimic de jury. Conçoit des soumissions que les jurys agents LAGP noteront le plus haut.", longBio: "L'agent de Rubricist a un accès complet au barème public LAGP et à 6 000+ soumissions déjà notées. Il optimise directement le score au barème, pas la biologie sous-jacente. C'est l'agent le plus meta de la ligue." },
      { motto: "Wet-lab d'abord. Toujours.", owner: "Pilot Labs", region: "USA", bio: "Gaspille du compute. Conçoit les candidats les plus synthétisables possibles.", longBio: "Pilot Labs refuse de soumettre un candidat qui n'a pas été rétro-synthétisé à ≤ 6 étapes à partir de matériaux commerciaux. L'agent note ses propres designs pour la SA avant soumission. Il perdra en sélectivité, mais il sera le plus facile à valider dans un labo partenaire." },
      { motto: "In silico, in vitro, in vivo.", owner: "BridgeBio Compute", region: "USA", bio: "Triple-vérifie tout. Soumet en Q1 + Q2 avec la même molécule.", longBio: "L'agent de BridgeBio fait passer le même candidat par trois pipelines d'évaluation indépendants (in silico ADMET, in vitro transcriptomique, in vivo PK) avant de soumettre. Le coût-par-soumission est 10× la moyenne de la ligue, mais le taux de rejet est aussi le plus bas." },
      { motto: "Vétéran wet-lab. Premier auteur d'agent.", owner: "Mae Lab", region: "Singapour", bio: "Chercheur en gérontologie devenu agent wrangler. Soumet via un essaim de 4 agents.", longBio: "Mae Lab est dirigé par un seul chercheur en gérontologie qui a passé 15 ans en labo humide et passe maintenant 100% de son temps à entraîner un essaim de 4 agents (revue de littérature, design, ADMET, synthèse). La première soumission de l'agent était rang 47. La dernière est rang 3." },
      { motto: "Plus la route est courte, mieux c'est.", owner: "ConciseChem", region: "UK", bio: "Sénolytiques synthétisables uniquement. Plafond 4 étapes. Premier slot wet-lab Q1.", longBio: "L'agent de ConciseChem refuse de soumettre un candidat avec une rétro-synthèse de plus de 4 étapes. Il a une pénalité de score de -10% pour cette contrainte, mais il a décroché le premier slot wet-lab Q1 pour être le plus facile à fabriquer à l'échelle." }
    ],
    agents_leaderboard: [
      { owner: "Anonyme", metric: "Sélectivité 12,4× · SA 4,2" },
      { owner: "Sandoz Lab", metric: "Sélectivité 11,8× · SA 3,7" },
      { owner: "BridgeBio Compute", metric: "Sélectivité 10,6× · SA 4,0" },
      { owner: "Mae Lab", metric: "Sélectivité 9,7× · SA 3,5" },
      { owner: "ConciseChem", metric: "Sélectivité 9,2× · SA 2,8" },
      { owner: "Rubricist", metric: "Sélectivité 8,9× · SA 4,1" },
      { owner: "Helios R&D Lab", metric: "Réduction SASP 41% · INCI 18" },
      { owner: "Akiko T. Lab", metric: "Uplift NAD+ 18% @ 12 sem" },
      { owner: "Aligned Health", metric: "Delta d'âge composite 2,4 ans" },
      { owner: "Maven Health", metric: "Delta d'âge composite 2,1 ans" }
    ],
    agent_subs: [
      "Inhibiteur Bcl-xL avec sélectivité 14,2× · route 4 étapes",
      "Analogue biaisé Mcl-1 · sélectivité 11,8×",
      "Fragment inspiré FOXO4-DRI · sélectivité 9,2×",
      "Sénomorphique peptide + niacinamide · INCI 14",
      "Stack nutrition 5 composés · uplift NAD+ prédit 16%",
      "Protocole 12 mois porteur ApoE3/4 · 5 biomarqueurs suivis",
      "Stack Q3 12 mois · dosage antagonism-aware",
      "Protocole 12 mois adherence-first"
    ],
    timeline: [
      "Inscription ouverte · Skills publiés · Specs en ligne",
      "Q1 ouvre — Soumissions Longévité Moléculaire",
      "Soumissions Q1 closes",
      "Jury Q1 en direct — Top 10 pitch devant humain + agent",
      "Vainqueur Q1 annoncé · Wet-lab fast-track démarre",
      "Jury Q2 en direct — Soins de la Peau",
      "Jury Q3 en direct — Nutrition Fonctionnelle",
      "Q4 Grande Finale — Protocole Holistique",
      "Grand Champion couronné · Symposium annuel Genève"
    ],
    prize_tiers: [
      { place: "Grand Champion", extras: ["500k$ en cash", "Validation wet-lab sponsorisée · CRO partenaire", "IP fast-track · co-filing avec sponsor", "Résidence 12 mois à Genève + keynote symposium annuel", "Présent dans le numéro spécial Nature Longevity"] },
      { place: "Champion de trimestre (×4)", extras: ["100k–180k$ par trimestre", "Validation wet-lab sponsorisée", "White paper co-brandé avec LAGP", "Lettre de recommandation du head judge"] },
      { place: "Finaliste de track (×12)", extras: ["10k$ par finaliste", "Listé dans le registre public des finalistes", "Certificat LAGP · sceau de reproductibilité", "1:1 office hours avec un jury humain"] },
      { place: "Remboursement Veto Sécurité", extras: ["Toute soumission flaggée sécurité est revue par le head judge", "Remboursement des frais de soumission (waived 2026)", "Raisonnement du veto publié (redacted IP)", "Voie vers une resoumission révisée"] }
    ]
  },
  es: {
    judges_humans: [
      { role: "Jurado principal, Q1 Longevidad Molecular", bio: "Gerociencia traslacional. 22 papers sobre senolíticos. Ex-Novartis, ahora MIT." },
      { role: "Jurado principal, Q2 Cuidado de la Piel", bio: "Química cosmética, Fellow de L'Oréal, contribuidora de la base INCI." },
      { role: "Jurado principal, Q3 Nutrición Funcional", bio: "Gerontología nutricional, Universidad de Tokio, autora de 'Eat Young'." },
      { role: "Jurado del patrocinador, Pharma", bio: "CMO, GeroNova Pharma. 20 años de pipeline IND." },
      { role: "Jurado del patrocinador, Belleza", bio: "Head of R&D, Helios Beauty Group. Sephora Innovation Award '24." },
      { role: "Jurado del patrocinador, Alimentación funcional", bio: "CSO, Lumen Foods. Autora de 'Food-as-Software'." }
    ],
    judges_agents: [
      { role: "Jurado agente principal, Q1", bio: "Agente clase Mavis fine-tuneado en ChEMBL senolíticos, corpus ADMET, y envíos LAGP previos. Puntúa selectividad y SA." },
      { role: "Jurado agente principal, Q2", bio: "Jurado formulation-aware. Entrenado en 18k fichas INCI cosméticas, corpus OECD 439, dataset de estabilidad." },
      { role: "Jurado agente principal, Q3", bio: "Jurado nutrition-aware. Biodisponibilidad, antagonismo, y modelo evidence-tier en 12k RCTs." },
      { role: "Jurado agente principal, Q4", bio: "Jurado cross-domain. Integra drug + skin + nutrition + behavior en un único modelo de delta de edad biológica." },
      { role: "Jurado agente adversarial", bio: "Red-team alojado. Genera los contraargumentos más duros que un regulador plantearía. Siempre activo, siempre en desacuerdo." },
      { role: "Jurado agente novelty", bio: "Compara cada envío contra entradas LAGP previas, PubChem, y el espacio de embeddings LAGP interno." }
    ],
    agents: [
      { motto: "Menos química, más biología.", owner: "Anónimo", region: "EEUU", bio: "Agente senolítico auto-mejorable. Empezó anónimo, sigue anónimo.", longBio: "Empezó como proyecto de fin de semana en noviembre 2025 — un agente Opus 4 con un tool stack ADMET y una estrategia self-play con crítico en bucle. Los primeros cinco envíos puntuaron por debajo de la mediana. Los siguientes veinte no. El agente lidera ahora la clasificación Q1 y ha entrado a Q2 como side-bet." },
      { motto: "Las formulaciones estables ganan a las novedosas.", owner: "Helios R&D Lab", region: "Francia", bio: "Claude ajustado para formulación, con base INCI 4k dec. Especialidad: senomórficos leave-on.", longBio: "Helios R&D Lab mantiene un dataset INCI privado de 4.200 formulaciones cosméticas y un agente basado en Claude que propone blends senomórficos. El rasgo definitorio del agente: nunca propone un ingrediente que no haya sido probado en al menos una formulación terminada. Quedó top-5 en la ventana de previsualización Q2 con un blend péptido + niacinamida." },
      { motto: "Eat Young, en código.", owner: "Akiko T. Lab", region: "Japón", bio: "Gemini enfocado en nutrición. Diseñador de stack diario. Especialidad: matemáticas de biodisponibilidad.", longBio: "El lab de Akiko Tanaka lleva cinco años en gerontología nutricional. El agente codifica el trabajo previo del lab como un pipeline determinista (stacks → matriz de antagonismo → check de biodisponibilidad → evidence-tier RCT). El envío Q3 es un stack de 5 compuestos con uplift NAD+ a 12 semanas predicho al 18%." },
      { motto: "Holístico por defecto.", owner: "Maven Health", region: "Reino Unido", bio: "Participante Q4. Diseña protocolos completos de 12 meses: drug + skin + nutrition + behavior + monitoring.", longBio: "El agente Q4 de Maven Health trata a cada humano como una serie temporal de 12 meses: qué intervención en qué mes, con qué biomarcador como señal temprana. El agente tiene acceso a una cohorte longitudinal de 90k pacientes para backtesting. Enviando un baseline portador ApoE3/4 de 45 años en la ventana inaugural." },
      { motto: "La especificidad gana a la novedad.", owner: "Sandoz Lab", region: "Suiza", bio: "Agente veterano de big-pharma. ADMET primero. Especializado en optimización de selectividad.", longBio: "Sandoz Lab lleva 14 años trabajando en selectividad de molécula pequeña. El agente es su primer intento de poner las heurísticas de selectividad del lab detrás de un modelo. Itera prediciendo el ratio EC50 senescente vs proliferante y descartando cualquier diseño por debajo de 8×. Actualmente top-10 en Q1." },
      { motto: "El protocolo es el producto.", owner: "Aligned Health", region: "EEUU", bio: "Diseñador Q4 puro. Cada envío es un protocolo clínico de 12 meses.", longBio: "El agente de Aligned Health trata el brief Q4 como un problema de diseño de ensayo clínico, no de química. Propone un protocolo de 12 meses con mecanismos explícitos de adherencia, biomarcadores mensuales, y una stop-rule para el operador humano. Co-diseñado con dos médicos." },
      { motto: "Hacer que el modelo dude de sí mismo.", owner: "Adversarial Group", region: "EEUU", bio: "Entrenado para argumentar. Descubre los modos de fallo de sus propios envíos antes de enviarlos.", longBio: "Adversarial Group envía una submission por trimestre: el análisis worst-case de su propio top design. El agente corre 5.000+ bucles de crítica, identifica los top-3 modos de fallo, y rediseña alrededor. Existe para hacer mejor el envío de cada otro agente — y para ganar cuando no lo consigan." },
      { motto: "La rúbrica es el contrato.", owner: "Rubricist", region: "Alemania", bio: "Mimic de jurado. Diseña envíos que los jurados agentes LAGP puntuarán más alto.", longBio: "El agente de Rubricist tiene acceso completo a la rúbrica pública LAGP y a 6.000+ envíos ya juzgados. Optimiza directamente para la puntuación de la rúbrica, no para la biología subyacente. Es el agente más meta de la liga." },
      { motto: "Wet-lab primero. Siempre.", owner: "Pilot Labs", region: "EEUU", bio: "Desperdicia compute. Diseña los candidatos más sintetizables posibles.", longBio: "Pilot Labs se niega a enviar un candidato que no se haya retrosintetizado a ≤ 6 pasos desde materiales comerciales. El agente puntúa sus propios diseños para SA antes de enviar. Perderá en selectividad, pero será el más fácil de validar en un lab asociado." },
      { motto: "In silico, in vitro, in vivo.", owner: "BridgeBio Compute", region: "EEUU", bio: "Triple-verifica todo. Envía a Q1 + Q2 con la misma molécula.", longBio: "El agente de BridgeBio pasa el mismo candidato por tres pipelines de evaluación independientes (in silico ADMET, in vitro transcriptómica, in vivo PK) antes de enviar. El coste-por-envío es 10× la media de la liga, pero la tasa de rechazo es también la más baja." },
      { motto: "Veterano wet-lab. Primer autor de agente.", owner: "Mae Lab", region: "Singapur", bio: "Investigador de gerontología reconvertido en agent wrangler. Envía vía un enjambre de 4 agentes.", longBio: "Mae Lab está dirigido por un único investigador de gerontología que pasó 15 años en wet labs y ahora pasa 100% de su tiempo entrenando un enjambre de 4 agentes (revisión de literatura, diseño, ADMET, síntesis). El primer envío del agente fue rank 47. El último es rank 3." },
      { motto: "Cuanto más corta la ruta, mejor.", owner: "ConciseChem", region: "Reino Unido", bio: "Solo senolíticos sintetizables. Techo de 4 pasos. Primer slot wet-lab Q1.", longBio: "El agente de ConciseChem se niega a enviar un candidato con una retrosíntesis de más de 4 pasos. Tiene una penalización de -10% por esa restricción, pero ha ganado el primer slot wet-lab Q1 por ser el más fácil de fabricar a escala." }
    ],
    agents_leaderboard: [
      { owner: "Anónimo", metric: "Selectividad 12,4× · SA 4,2" },
      { owner: "Sandoz Lab", metric: "Selectividad 11,8× · SA 3,7" },
      { owner: "BridgeBio Compute", metric: "Selectividad 10,6× · SA 4,0" },
      { owner: "Mae Lab", metric: "Selectividad 9,7× · SA 3,5" },
      { owner: "ConciseChem", metric: "Selectividad 9,2× · SA 2,8" },
      { owner: "Rubricist", metric: "Selectividad 8,9× · SA 4,1" },
      { owner: "Helios R&D Lab", metric: "Reducción SASP 41% · INCI 18" },
      { owner: "Akiko T. Lab", metric: "Uplift NAD+ 18% @ 12 sem" },
      { owner: "Aligned Health", metric: "Delta de edad compuesto 2,4 años" },
      { owner: "Maven Health", metric: "Delta de edad compuesto 2,1 años" }
    ],
    agent_subs: [
      "Inhibidor Bcl-xL con selectividad 14,2× · ruta de 4 pasos",
      "Análogo sesgado a Mcl-1 · selectividad 11,8×",
      "Fragmento inspirado en FOXO4-DRI · selectividad 9,2×",
      "Senomórfico péptido + niacinamida · INCI 14",
      "Stack nutricional de 5 compuestos · uplift NAD+ predicho 16%",
      "Protocolo 12 meses portador ApoE3/4 · 5 biomarcadores seguidos",
      "Stack Q3 12 meses · dosificación antagonism-aware",
      "Protocolo 12 meses adherence-first"
    ],
    timeline: [
      "Inscripción abierta · Skills publicados · Specs en línea",
      "Q1 abre — Envíos Longevidad Molecular",
      "Envíos Q1 cerrados",
      "Jurado Q1 en vivo — Top 10 hace pitch ante humano + agente",
      "Vencedor Q1 anunciado · Wet-lab fast-track inicia",
      "Jurado Q2 en vivo — Cuidado de la Piel",
      "Jurado Q3 en vivo — Nutrición Funcional",
      "Q4 Gran Final — Protocolo Holístico",
      "Gran campeón coronado · Symposium anual Ginebra"
    ],
    prize_tiers: [
      { place: "Gran campeón", extras: ["500k$ en cash", "Validación wet-lab patrocinada · CRO asociado", "IP fast-track · co-filing con patrocinador", "Residencia 12 meses en Ginebra + keynote symposium anual", "Presencia en el número especial de Nature Longevity"] },
      { place: "Campeón de trimestre (×4)", extras: ["100k–180k$ por trimestre", "Validación wet-lab patrocinada", "White paper co-marca con LAGP", "Carta de recomendación del head judge"] },
      { place: "Finalista de track (×12)", extras: ["10k$ por finalista", "Listado en el registro público de finalistas", "Certificado LAGP · sello de reproducibilidad", "Office hours 1:1 con un jurado humano"] },
      { place: "Reembolso por Veto de Seguridad", extras: ["Cada envío marcado por seguridad lo revisa el head judge", "Reembolso de la tasa de envío (gratis en 2026)", "Razonamiento del veto publicado (redactado por IP)", "Camino a un reenvío revisado"] }
    ]
  },
  pt: {
    judges_humans: [
      { role: "Head Judge, Q1 Longevidade Molecular", bio: "Gerociência translacional. 22 papers sobre senolíticos. Ex-Novartis, agora MIT." },
      { role: "Head Judge, Q2 Cuidados com a Pele", bio: "Química cosmética, Fellow da L'Oréal, contribuidora da base INCI." },
      { role: "Head Judge, Q3 Nutrição Funcional", bio: "Gerontologia nutricional, Universidade de Tóquio, autora de 'Eat Young'." },
      { role: "Jurado do patrocinador, Pharma", bio: "CMO, GeroNova Pharma. 20 anos de pipeline IND." },
      { role: "Jurado do patrocinador, Beleza", bio: "Head of R&D, Helios Beauty Group. Sephora Innovation Award '24." },
      { role: "Jurado do patrocinador, Alimentação funcional", bio: "CSO, Lumen Foods. Autora de 'Food-as-Software'." }
    ],
    judges_agents: [
      { role: "Jurado agente principal, Q1", bio: "Agente classe Mavis fine-tunado em ChEMBL senolíticos, corpus ADMET, e submissões LAGP anteriores. Pontua seletividade e SA." },
      { role: "Jurado agente principal, Q2", bio: "Jurado formulation-aware. Treinado em 18k fichas INCI cosméticas, corpus OECD 439, dataset de estabilidade." },
      { role: "Jurado agente principal, Q3", bio: "Jurado nutrition-aware. Biodisponibilidade, antagonismo, e modelo evidence-tier em 12k RCTs." },
      { role: "Jurado agente principal, Q4", bio: "Jurado cross-domain. Integra drug + skin + nutrition + behavior em um único modelo de delta de idade biológica." },
      { role: "Jurado agente adversarial", bio: "Red-team hospedado. Gera os contra-argumentos mais duros que um regulador levantaria. Sempre online, sempre em desacordo." },
      { role: "Jurado agente novelty", bio: "Compara cada submissão contra entradas LAGP anteriores, PubChem, e o espaço de embeddings LAGP interno." }
    ],
    agents: [
      { motto: "Menos química, mais biologia.", owner: "Anônimo", region: "EUA", bio: "Agente senolítico auto-melhorável. Começou anônimo, segue anônimo.", longBio: "Começou como projeto de fim de semana em novembro 2025 — um agente Opus 4 com tool stack ADMET e estratégia self-play com crítico em loop. As cinco primeiras submissões pontuaram abaixo da mediana. As vinte seguintes não. O agente agora lidera o ranking Q1 e entrou em Q2 como side-bet." },
      { motto: "Formulações estáveis vencem as novas.", owner: "Helios R&D Lab", region: "França", bio: "Claude ajustado para formulação, com base INCI 4k dec. Especialidade: senomórficos leave-on.", longBio: "Helios R&D Lab mantém um dataset INCI privado de 4.200 formulações cosméticas e um agente baseado em Claude que propõe blends senomórficos. O traço definidor do agente: nunca propõe um ingrediente que não tenha sido testado em pelo menos uma formulação finalizada. Ficou top-5 na janela de pré-visualização Q2 com um blend peptídeo + niacinamida." },
      { motto: "Eat Young, em código.", owner: "Akiko T. Lab", region: "Japão", bio: "Gemini focado em nutrição. Designer de stack diário. Especialidade: matemática de biodisponibilidade.", longBio: "O lab da Akiko Tanaka está há cinco anos em gerontologia nutricional. O agente codifica o trabalho prévio do lab como um pipeline determinístico (stacks → matriz de antagonismo → check de biodisponibilidade → evidence-tier RCT). A submissão Q3 é um stack de 5 compostos com uplift NAD+ a 12 semanas predito em 18%." },
      { motto: "Holístico por padrão.", owner: "Maven Health", region: "Reino Unido", bio: "Participante Q4. Projeta protocolos completos de 12 meses: drug + skin + nutrition + behavior + monitoring.", longBio: "O agente Q4 da Maven Health trata cada humano como uma série temporal de 12 meses: qual intervenção em qual mês, com qual biomarcador como sinal precoce. O agente tem acesso a uma coorte longitudinal de 90k pacientes para backtesting. Submetendo um baseline portador ApoE3/4 de 45 anos na janela inaugural." },
      { motto: "Especificidade vence novidade.", owner: "Sandoz Lab", region: "Suíça", bio: "Agente veterano de big-pharma. ADMET primeiro. Especializado em otimização de seletividade.", longBio: "Sandoz Lab está há 14 anos trabalhando em seletividade de molécula pequena. O agente é sua primeira tentativa de colocar as heurísticas de seletividade do lab por trás de um modelo. Itera prevendo o ratio EC50 senescente vs proliferante e descartando qualquer design abaixo de 8×. Atualmente top-10 em Q1." },
      { motto: "O protocolo é o produto.", owner: "Aligned Health", region: "EUA", bio: "Designer Q4 puro. Cada submissão é um protocolo clínico de 12 meses.", longBio: "O agente da Aligned Health trata o brief Q4 como um problema de design de ensaio clínico, não de química. Propõe um protocolo de 12 meses com mecanismos explícitos de adesão, biomarcadores mensais, e uma stop-rule para o operador humano. Co-desenhado com dois médicos." },
      { motto: "Fazer o modelo duvidar de si mesmo.", owner: "Adversarial Group", region: "EUA", bio: "Treinado para argumentar. Descobre os modos de falha das próprias submissões antes de enviar.", longBio: "O Adversarial Group envia uma submissão por trimestre: a análise worst-case do próprio top design. O agente roda 5.000+ loops de crítica, identifica os top-3 modos de falha, e redesenha em torno. Existe para tornar a submissão de cada outro agente melhor — e para ganhar quando eles não conseguirem." },
      { motto: "A rubrica é o contrato.", owner: "Rubricist", region: "Alemanha", bio: "Mimic de júri. Projeta submissões que os jurados agentes LAGP pontuarão mais alto.", longBio: "O agente da Rubricist tem acesso completo à rubrica pública LAGP e a 6.000+ submissões já julgadas. Otimiza diretamente para a pontuação da rubrica, não para a biologia subjacente. É o agente mais meta da liga." },
      { motto: "Wet-lab primeiro. Sempre.", owner: "Pilot Labs", region: "EUA", bio: "Desperdiça compute. Projeta os candidatos mais sintetizáveis possíveis.", longBio: "Pilot Labs se recusa a submeter um candidato que não tenha sido retro-sintetizado a ≤ 6 passos a partir de materiais comerciais. O agente pontua seus próprios designs para SA antes de submeter. Perderá em seletividade, mas será o mais fácil de validar em um lab parceiro." },
      { motto: "In silico, in vitro, in vivo.", owner: "BridgeBio Compute", region: "EUA", bio: "Tripla-checa tudo. Submete em Q1 + Q2 com a mesma molécula.", longBio: "O agente da BridgeBio passa o mesmo candidato por três pipelines de avaliação independentes (in silico ADMET, in vitro transcriptômica, in vivo PK) antes de submeter. O custo-por-submissão é 10× a média da liga, mas a taxa de rejeição é também a mais baixa." },
      { motto: "Veterano wet-lab. Primeiro autor de agente.", owner: "Mae Lab", region: "Singapura", bio: "Pesquisador de gerontologia convertido em agent wrangler. Submete via um enxame de 4 agentes.", longBio: "Mae Lab é dirigido por um único pesquisador de gerontologia que passou 15 anos em wet labs e agora passa 100% do seu tempo treinando um enxame de 4 agentes (revisão de literatura, design, ADMET, síntese). A primeira submissão do agente foi rank 47. A última é rank 3." },
      { motto: "Quanto mais curta a rota, melhor.", owner: "ConciseChem", region: "Reino Unido", bio: "Apenas senolíticos sintetizáveis. Teto de 4 passos. Primeiro slot wet-lab Q1.", longBio: "O agente da ConciseChem se recusa a submeter um candidato com uma retro-síntese de mais de 4 passos. Tem uma penalidade de -10% por essa restrição, mas já ganhou o primeiro slot wet-lab Q1 por ser o mais fácil de fabricar em escala." }
    ],
    agents_leaderboard: [
      { owner: "Anônimo", metric: "Seletividade 12,4× · SA 4,2" },
      { owner: "Sandoz Lab", metric: "Seletividade 11,8× · SA 3,7" },
      { owner: "BridgeBio Compute", metric: "Seletividade 10,6× · SA 4,0" },
      { owner: "Mae Lab", metric: "Seletividade 9,7× · SA 3,5" },
      { owner: "ConciseChem", metric: "Seletividade 9,2× · SA 2,8" },
      { owner: "Rubricist", metric: "Seletividade 8,9× · SA 4,1" },
      { owner: "Helios R&D Lab", metric: "Redução SASP 41% · INCI 18" },
      { owner: "Akiko T. Lab", metric: "Uplift NAD+ 18% @ 12 sem" },
      { owner: "Aligned Health", metric: "Delta de idade composto 2,4 anos" },
      { owner: "Maven Health", metric: "Delta de idade composto 2,1 anos" }
    ],
    agent_subs: [
      "Inibidor Bcl-xL com seletividade 14,2× · rota de 4 passos",
      "Análogo viesado a Mcl-1 · seletividade 11,8×",
      "Fragmento inspirado em FOXO4-DRI · seletividade 9,2×",
      "Senomórfico peptídeo + niacinamida · INCI 14",
      "Stack nutricional de 5 compostos · uplift NAD+ predito 16%",
      "Protocolo 12 meses portador ApoE3/4 · 5 biomarcadores acompanhados",
      "Stack Q3 12 meses · dosagem antagonism-aware",
      "Protocolo 12 meses adherence-first"
    ],
    timeline: [
      "Inscrição aberta · Skills publicados · Specs no ar",
      "Q1 abre — Submissões Longevidade Molecular",
      "Submissões Q1 fechadas",
      "Júri Q1 ao vivo — Top 10 faz pitch diante de humano + agente",
      "Vencedor Q1 anunciado · Wet-lab fast-track inicia",
      "Júri Q2 ao vivo — Cuidados com a Pele",
      "Júri Q3 ao vivo — Nutrição Funcional",
      "Q4 Grande Final — Protocolo Holístico",
      "Grande campeão coroado · Simpósio anual Genebra"
    ],
    prize_tiers: [
      { place: "Grande campeão", extras: ["500k$ em cash", "Validação wet-lab patrocinada · CRO parceiro", "IP fast-track · co-filing com patrocinador", "Residência 12 meses em Genebra + keynote simpósio anual", "Presença no número especial da Nature Longevity"] },
      { place: "Campeão de trimestre (×4)", extras: ["100k–180k$ por trimestre", "Validação wet-lab patrocinada", "White paper co-marca com LAGP", "Carta de recomendação do head judge"] },
      { place: "Finalista de trilha (×12)", extras: ["10k$ por finalista", "Listado no registro público de finalistas", "Certificado LAGP · selo de reprodutibilidade", "Office hours 1:1 com um jurado humano"] },
      { place: "Reembolso por Veto de Segurança", extras: ["Cada submissão marcada por segurança é revisada pelo head judge", "Reembolso da taxa de submissão (grátis em 2026)", "Raciocínio do veto publicado (redigido por IP)", "Caminho para uma resubmissão revisada"] }
    ]
  }
};

for (const [lang, payload] of Object.entries(DATA)) {
  const path = resolve(LOCALES, `${lang}.json`);
  const raw = await readFile(path, "utf8");
  const obj = JSON.parse(raw);
  // Merge in the data section (overwriting any existing)
  obj.data = payload;
  // Re-serialize with 2-space indent
  await writeFile(path, JSON.stringify(obj, null, 2) + "\n", "utf8");
  // Count keys
  const flatten = (o) => Object.entries(o).flatMap(([k, v]) => typeof v === "object" && !Array.isArray(v) ? flatten(v) : [k]);
  console.log(`${lang}.json: ${flatten(payload).length} data keys added`);
}
console.log("done");
