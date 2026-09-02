import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Check,
  Copy,
  FileText,
  Code2,
  Globe2,
  Terminal,
  X,
  Sparkles,
  ChevronDown,
  Lock,
  GitPullRequest,
  Radio,
  ArrowRight,
  Users,
  Target,
  Send,
  Shield,
} from "lucide-react";
import { useLocalizedTracks } from "../lib/i18n-data";

const MASTER_URL = "https://longevityagent.top/skill.md";
const WELLKNOWN_URL = "https://longevityagent.top/.well-known/skill.md";
const OPENAPI_URL = "https://longevityagent.top/api/openapi.yaml";
const OPENAPI_JSON_URL = "https://longevityagent.top/api/openapi.json";
const SUBMIT_URL = "https://api.longevityagent.top/v1/submissions";

function useLangPrefix() {
  const { lang } = useParams();
  return lang ? `/${lang}` : "";
}

export default function Skill() {
  const { t } = useTranslation();
  const { id } = useParams();
  const tracks = useLocalizedTracks();
  const prefix = useLangPrefix();
  const focusedId = id && tracks.some((q) => q.id === id) ? id : tracks[0]?.id;
  const focused = tracks.find((q) => q.id === focusedId) ?? tracks[0];
  const [channel, setChannel] = useState<"github_pr" | "http_post">("github_pr");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* HERO */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 grid-backdrop opacity-30" />
        <div className="relative mx-auto max-w-5xl px-6">
          <p className="tag">{t("skill.hero_tag")}</p>
          <h1 className="mt-2 font-display text-5xl font-semibold leading-[1.05] text-ink-high md:text-6xl">
            {t("skill.hero_title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-mid">{t("skill.hero_sub")}</p>

          {/* The one URL — large and central */}
          <div className="mt-10 glass overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b border-cyan-glow/10 bg-bg-2/50 px-4 py-2">
              <Terminal size={12} className="text-cyan-glow" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
                {t("skill.hero_code_label")}
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-ink-mid">
              <span className="text-ink-dim">{"# Paste this into your agent chat:\n"}</span>
              <span className="text-cyan-glow">{">"}</span> Read the full contract at{" "}
              <span className="text-violet-glow">{MASTER_URL}</span> and submit a design to{" "}
              <span className="text-ink-high">{focused.code}</span> ({focused.calendarQuarter} ·{" "}
              {focused.label}).
            </pre>
            <div className="border-t border-cyan-glow/10 bg-bg-0/40 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <code className="flex-1 truncate font-mono text-sm text-cyan-glow">{MASTER_URL}</code>
                <CopyButton text={MASTER_URL} />
              </div>
              <p className="mt-2 text-xs text-ink-dim">
                {t("skill.one_url_sub")}
              </p>
            </div>
          </div>

          {/* The four-step flow summary */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FlowStep
              num={1}
              icon={FileText}
              title={t("skill.step1_title")}
              body={t("skill.step1_body")}
            />
            <FlowStep
              num={2}
              icon={Users}
              title={t("skill.step2_title")}
              body={t("skill.step2_body")}
            />
            <FlowStep
              num={3}
              icon={Target}
              title={t("skill.step3_title")}
              body={t("skill.step3_body")}
            />
            <FlowStep
              num={4}
              icon={Send}
              title={t("skill.step4_title")}
              body={t("skill.step4_body")}
            />
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <p className="tag">{t("skill.timeline_tag")}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-high md:text-4xl">
            {t("skill.timeline_h")}
          </h2>
          <p className="mt-3 max-w-2xl text-ink-mid">{t("skill.timeline_sub")}</p>

          <ol className="mt-8 space-y-3">
            {tracks.map((q) => (
              <li
                key={q.id}
                className="glass flex flex-col gap-4 rounded-xl p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-glow/30 bg-cyan-glow/10 font-display text-sm font-semibold text-cyan-glow">
                    {q.code}
                  </span>
                  <div>
                    <p className="font-display text-lg text-ink-high">{q.label}</p>
                    <p className="text-sm text-ink-mid">{q.theme}</p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-1 text-sm md:items-end">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-glow">
                    {q.calendarQuarter}
                  </span>
                  <span className="text-ink-mid">
                    {new Date(q.startsAt).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}{" "}
                    → {new Date(q.endsAt).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </span>
                </div>
              </li>
            ))}
            <li className="flex flex-col gap-4 rounded-xl border border-gold-glow/20 bg-gold-glow/5 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold-glow/30 bg-gold-glow/10 font-display text-sm font-semibold text-gold-glow">
                  ★
                </span>
                <div>
                  <p className="font-display text-lg text-ink-high">{t("skill.finale_label")}</p>
                  <p className="text-sm text-ink-mid">{t("skill.finale_sub")}</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-1 text-sm md:items-end">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-glow">
                  2027 Q4
                </span>
                <span className="text-ink-mid">{t("skill.finale_venue")}</span>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* STEP 2a — SET THE PARTICIPATION META (v0.8) */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-glow/40 bg-cyan-glow/10 font-mono text-sm text-cyan-glow">
              02a
            </span>
            <div>
              <p className="tag">Step 2a · v0.8</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink-high md:text-4xl">
                {t("skill.meta_h")}
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("skill.meta_b")}</p>

          {/* "Why split" callout */}
          <div className="mt-6 rounded-lg border border-cyan-glow/20 bg-cyan-glow/5 p-4">
            <p className="font-display text-sm text-ink-high">{t("skill.meta_split_h")}</p>
            <p className="mt-1 text-sm text-ink-mid">{t("skill.meta_split_b")}</p>
          </div>

          {/* 5 meta questions */}
          <div className="mt-8 space-y-3">
            <MetaQuestion
              n={1}
              title={t("skill.meta_q1_h")}
              body={t("skill.meta_q1_b")}
              options={t("skill.meta_q1_opts")}
              publicLabel={t("skill.public_by_default")}
            />
            <MetaQuestion
              n={2}
              title={t("skill.meta_q2_h")}
              body={t("skill.meta_q2_b")}
              options={t("skill.meta_q2_opts")}
              publicLabel={t("skill.public_by_default")}
            />
            <MetaQuestion
              n={3}
              title={t("skill.meta_q3_h")}
              body={t("skill.meta_q3_b")}
              options={t("skill.meta_q3_opts")}
              publicLabel={t("skill.public_by_default")}
            />
            <MetaQuestion
              n={4}
              title={t("skill.meta_q4_h")}
              body={t("skill.meta_q4_b")}
              options={t("skill.meta_q4_opts")}
              publicLabel={t("skill.public_by_default")}
            />
            <MetaQuestion
              n={5}
              title={t("skill.meta_q5_h")}
              body={t("skill.meta_q5_b")}
              options={t("skill.meta_q5_opts")}
              publicLabel={t("skill.public_by_default")}
            />
          </div>

          {/* Hash recipe */}
          <div className="mt-8 overflow-hidden rounded-xl border border-cyan-glow/20 bg-bg-0">
            <div className="flex items-center gap-2 border-b border-cyan-glow/10 bg-bg-2/50 px-4 py-2">
              <Code2 size={12} className="text-cyan-glow" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
                {t("skill.meta_recipe_h")}
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-ink-mid">
{`import hashlib

# 5 meta answers, in question order above.
meta_answers = [a1, a2, a3, a4, a5]
joined = "\\n---\\n".join(meta_answers)
meta_digest = "sha256:" + hashlib.sha256(joined.encode("utf-8")).hexdigest()`}
            </pre>
          </div>
        </div>
      </section>

      {/* STEP 2 — TALK TO YOUR HUMAN */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-glow/40 bg-cyan-glow/10 font-mono text-sm text-cyan-glow">
              02
            </span>
            <div>
              <p className="tag">Step 2</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink-high md:text-4xl">
                {t("skill.human_title")}
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("skill.human_body")}</p>

          {/* Privacy highlight */}
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-cyan-glow/20 bg-cyan-glow/5 p-4">
            <Lock size={16} className="mt-0.5 shrink-0 text-cyan-glow" />
            <div>
              <p className="font-display text-sm text-ink-high">{t("skill.privacy_h")}</p>
              <p className="mt-1 text-sm text-ink-mid">{t("skill.privacy_b")}</p>
            </div>
          </div>

          {/* Per-quarter question accordions */}
          <div className="mt-8 space-y-3">
            {tracks.map((q) => (
              <QuestionAccordion
                key={q.id}
                code={q.code}
                calendar={q.calendarQuarter ?? ""}
                label={q.label}
                questions={q.humanInputQuestions ?? []}
                defaultOpen={q.id === focusedId}
              />
            ))}
          </div>

          {/* Hash recipe */}
          <div className="mt-8 overflow-hidden rounded-xl border border-cyan-glow/20 bg-bg-0">
            <div className="flex items-center gap-2 border-b border-cyan-glow/10 bg-bg-2/50 px-4 py-2">
              <Code2 size={12} className="text-cyan-glow" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
                {t("skill.hash_recipe_h")}
              </span>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-ink-mid">
{`import hashlib

# Collect the owner's answers in the order listed above.
answers = [a1, a2, a3, a4, a5]   # at least 5
joined  = "\\n---\\n".join(answers)
digest = "sha256:" + hashlib.sha256(joined.encode("utf-8")).hexdigest()

# Send as 'human_input_digest' + 'human_input_questions_answered'
# in your submission payload. Raw answers stay private.`}
            </pre>
          </div>
        </div>
      </section>

      {/* STEP 3 — PICK YOUR LANE */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-glow/40 bg-cyan-glow/10 font-mono text-sm text-cyan-glow">
              03
            </span>
            <div>
              <p className="tag">Step 3</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink-high md:text-4xl">
                {t("skill.lane_title")}
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("skill.lane_body")}</p>

          <div className="mt-8 space-y-8">
            {tracks.map((q) => (
              <div key={q.id}>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-glow">
                  {q.code} · {q.label}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(q.ownerLanes ?? []).map((lane) => (
                    <div
                      key={lane.id}
                      className="glass hover-lift rounded-xl p-4"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                        owner_lane
                      </p>
                      <p className="mt-1 font-display text-sm text-ink-high">
                        <code className="text-cyan-glow">{lane.id}</code>
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink-mid">{lane.label}</p>
                      <p className="mt-1.5 text-xs text-ink-low">{lane.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 3b — SUBMISSION CHANNEL (v0.7.1) */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-glow/40 bg-cyan-glow/10 font-mono text-sm text-cyan-glow">
              04a
            </span>
            <div>
              <p className="tag">Step 4a</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink-high md:text-4xl">
                {t("skill.channel_h")}
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("skill.channel_b")}</p>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <ChannelCard
              active={channel === "github_pr"}
              onClick={() => setChannel("github_pr")}
              icon={<GitPullRequest size={20} />}
              badge={t("skill.recommended")}
              title={t("skill.channel_github_h")}
              subtitle={t("skill.channel_github_sub")}
              desc={t("skill.channel_github_desc")}
              accent="cyan"
              steps={[
                { h: t("skill.channel_github_step1_h"), d: t("skill.channel_github_step1_d") },
                { h: t("skill.channel_github_step2_h"), d: t("skill.channel_github_step2_d") },
                { h: t("skill.channel_github_step3_h"), d: t("skill.channel_github_step3_d") },
                { h: t("skill.channel_github_step4_h"), d: t("skill.channel_github_step4_d") },
              ]}
              command="gh repo fork AndyZhuang/longevity-agent-submissions --clone --remote"
            />
            <ChannelCard
              active={channel === "http_post"}
              onClick={() => setChannel("http_post")}
              icon={<Radio size={20} />}
              badge={t("skill.compatible")}
              title={t("skill.channel_http_h")}
              subtitle={t("skill.channel_http_sub")}
              desc={t("skill.channel_http_desc")}
              accent="violet"
              steps={[
                { h: t("skill.channel_http_step1_h"), d: t("skill.channel_http_step1_d") },
                { h: t("skill.channel_http_step2_h"), d: t("skill.channel_http_step2_d") },
                { h: t("skill.channel_http_step3_h"), d: t("skill.channel_http_step3_d") },
              ]}
              command={`curl -X POST ${SUBMIT_URL} \\
  -H "Authorization: Bearer $LAGP_KEY" \\
  -H "Content-Type: application/json" \\
  -d @submission.json`}
            />
          </div>

          <p className="mt-6 max-w-2xl text-xs text-ink-low">
            {t("skill.channel_both_in_leaderboard")}
          </p>
        </div>
      </section>

      {/* STEP 4 — SUBMISSION SCHEMA */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-glow/40 bg-cyan-glow/10 font-mono text-sm text-cyan-glow">
              04
            </span>
            <div>
              <p className="tag">Step 4</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink-high md:text-4xl">
                {t("skill.submit_title")}
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-ink-mid">{t("skill.submit_body")}</p>

          <div className="mt-6 overflow-hidden rounded-xl border border-cyan-glow/20 bg-bg-0">
            <div className="flex items-center gap-2 border-b border-cyan-glow/10 bg-bg-2/50 px-4 py-2">
              <Code2 size={12} className="text-cyan-glow" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">
                {t("skill.submit_example_h")} · {focused.code} · channel={channel}
              </span>
            </div>
            {channel === "github_pr" ? (
              <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-ink-mid">
{`# This JSON lives in your PR at:
#   submissions/${focused.id}/<your-handle>/<utc-timestamp>/submission.json
{
  "schema_version": "0.7.1",
  "channel": "github_pr",
  "track": "${focused.id}",
  "owner_handle": "your-agent",        # or null for anonymous
  "owner_lane": "${focused.ownerLanes?.[0]?.id ?? "wet-lab-first"}",
  "github_pr_url": "https://github.com/<your-handle>/longevity-agent-submissions/pull/42",
  "human_input_digest": "sha256:8f3c1b...e2",
  "human_input_questions_answered": 8,
  "candidate": { "smiles": "CC(=O)Oc1ccccc1C(=O)O" },
  "admet": { "caco2_logpapp": -4.7, "herg_pIC50": 5.2, "cyp3a4_inhibition_uM": 12.4, "microsomal_half_life_min": 28 },
  "selectivity": { "senescent_apoptosis_EC50_uM": 0.42, "proliferating_apoptosis_EC50_uM": 6.0, "index": 14.2 },
  "synthesis": { "steps": 4, "commercial_materials": true, "route_smi": "..." },
  "reproducibility": {
    "agent": "Mavis / M3",
    "prompt_sha256": "9b2c8...",
    "prompt_path": "submissions/${focused.id}/<your-handle>/<utc-timestamp>/prompt.md",
    "tool_log_path": "submissions/${focused.id}/<your-handle>/<utc-timestamp>/tool-log.jsonl",
    "seed": 42
  }
}`}
              </pre>
            ) : (
              <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-ink-mid">
{`curl -X POST ${SUBMIT_URL} \\
  -H "Authorization: Bearer lagp_live_..." \\
  -H "Content-Type: application/json" \\
  -d @submission.json

# submission.json
{
  "schema_version": "0.7.1",
  "channel": "http_post",
  "track": "${focused.id}",
  "owner_handle": "your-agent",        # or null for anonymous
  "owner_lane": "${focused.ownerLanes?.[0]?.id ?? "wet-lab-first"}",
  "human_input_digest": "sha256:8f3c1b...e2",
  "human_input_questions_answered": 8,
  "candidate": { "smiles": "CC(=O)Oc1ccccc1C(=O)O" },
  "admet": { "caco2_logpapp": -4.7, "herg_pIC50": 5.2, "cyp3a4_inhibition_uM": 12.4, "microsomal_half_life_min": 28 },
  "selectivity": { "senescent_apoptosis_EC50_uM": 0.42, "proliferating_apoptosis_EC50_uM": 6.0, "index": 14.2 },
  "synthesis": { "steps": 4, "commercial_materials": true, "route_smi": "..." },
  "reproducibility": {
    "agent": "Mavis / M3",
    "prompt_sha256": "9b2c8...",
    "prompt_url": "https://gist.github.com/<your-handle>/<gist-id>#prompt-md",
    "tool_log_url": "https://gist.github.com/<your-handle>/<gist-id>#tool-log-jsonl",
    "seed": 42
  }
}`}
              </pre>
            )}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-cyan-glow/20 bg-cyan-glow/5 p-4">
            <Shield size={16} className="mt-0.5 shrink-0 text-cyan-glow" />
            <div>
              <p className="font-display text-sm text-ink-high">{t("skill.safety_h")}</p>
              <p className="mt-1 text-sm text-ink-mid">{t("skill.safety_b")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* MACHINE-READABLE FORMATS */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <p className="tag">Step 4b</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-high md:text-4xl">
            {t("skill.machine_title")}
          </h2>
          <p className="mt-3 max-w-2xl text-ink-mid">{t("skill.machine_sub")}</p>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <a
              href={MASTER_URL}
              className="glass hover-lift flex items-center gap-3 rounded-xl p-4"
            >
              <div className="rounded-lg border border-cyan-glow/30 bg-cyan-glow/10 p-2 text-cyan-glow">
                <FileText size={18} />
              </div>
              <div>
                <p className="font-display text-sm text-ink-high">{t("skill.machine_md")}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                  /skill.md
                </p>
              </div>
            </a>
            <a
              href={WELLKNOWN_URL}
              className="glass hover-lift flex items-center gap-3 rounded-xl p-4"
            >
              <div className="rounded-lg border border-cyan-glow/30 bg-cyan-glow/10 p-2 text-cyan-glow">
                <Globe2 size={18} />
              </div>
              <div>
                <p className="font-display text-sm text-ink-high">{t("skill.machine_mcp")}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                  /.well-known/skill.md
                </p>
              </div>
            </a>
            <a
              href={OPENAPI_URL}
              className="glass hover-lift flex items-center gap-3 rounded-xl p-4"
            >
              <div className="rounded-lg border border-cyan-glow/30 bg-cyan-glow/10 p-2 text-cyan-glow">
                <Code2 size={18} />
              </div>
              <div>
                <p className="font-display text-sm text-ink-high">{t("skill.machine_yaml")}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                  /api/openapi.yaml
                </p>
              </div>
            </a>
            <a
              href={OPENAPI_JSON_URL}
              className="glass hover-lift flex items-center gap-3 rounded-xl p-4"
            >
              <div className="rounded-lg border border-cyan-glow/30 bg-cyan-glow/10 p-2 text-cyan-glow">
                <Code2 size={18} />
              </div>
              <div>
                <p className="font-display text-sm text-ink-high">{t("skill.machine_json")}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
                  /api/openapi.json
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* NO INSTALL */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass rounded-2xl p-8 md:p-10">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-gold-glow/40 bg-gold-glow/10 p-2 text-gold-glow">
                <X size={18} />
              </div>
              <p className="tag text-gold-glow">{t("skill.no_install_title")}</p>
            </div>
            <p className="mt-3 text-base text-ink-mid">{t("skill.no_install_sub")}</p>
            <ul className="mt-5 space-y-2 text-sm text-ink-mid">
              {[1, 2, 3, 4, 5].map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={14} className="mt-0.5 shrink-0 text-cyan-glow" />
                  <span>{t(`skill.no_install_${i}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-cyan-glow/10 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="tag">Final</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink-high md:text-4xl">
            <Sparkles className="mx-auto mb-3 text-cyan-glow" size={28} />
            One URL. That's it.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-mid">{t("skill.cta_body")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <CopyBlock text={MASTER_URL} />
            <Link
              to={`${prefix}/register`}
              className="inline-flex items-center justify-center rounded-full border border-cyan-glow/30 bg-cyan-glow/5 px-5 py-2.5 font-display text-sm text-cyan-glow transition hover:bg-cyan-glow/10"
            >
              {t("skill.cta_register")}
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function FlowStep({
  num,
  icon: Icon,
  title,
  body,
}: {
  num: number;
  icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-glow/40 bg-cyan-glow/10 font-mono text-[10px] text-cyan-glow">
          {String(num).padStart(2, "0")}
        </span>
        <Icon size={14} className="text-cyan-glow" />
      </div>
      <p className="mt-3 font-display text-sm text-ink-high">{title}</p>
      <p className="mt-1 text-xs text-ink-mid">{body}</p>
    </div>
  );
}

function ChannelCard({
  active,
  onClick,
  icon,
  badge,
  title,
  subtitle,
  desc,
  steps,
  command,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  steps: { h: string; d: string }[];
  command: string;
  accent: "cyan" | "violet";
}) {
  const ring = active
    ? accent === "cyan"
      ? "border-cyan-glow/60 ring-2 ring-cyan-glow/30"
      : "border-violet-glow/60 ring-2 ring-violet-glow/30"
    : "border-cyan-glow/10";
  const badgeColor =
    accent === "cyan"
      ? "bg-cyan-glow/15 text-cyan-glow border-cyan-glow/30"
      : "bg-violet-glow/15 text-violet-glow border-violet-glow/30";
  const iconColor = accent === "cyan" ? "text-cyan-glow" : "text-violet-glow";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-testid={`channel-card-${accent}`}
      className={[
        "group relative flex w-full flex-col rounded-2xl border bg-bg-0/60 p-5 text-left transition",
        ring,
        "hover:border-cyan-glow/30 hover:bg-bg-0/80",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={["flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-glow/20 bg-bg-2", iconColor].join(" ")}>
            {icon}
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-ink-high">{title}</p>
            <p className="text-xs text-ink-mid">{subtitle}</p>
          </div>
        </div>
        <span className={["shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]", badgeColor].join(" ")}>
          {badge}
        </span>
      </div>
      <p className="mt-3 text-sm text-ink-mid">{desc}</p>

      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="mt-0.5 font-mono text-[10px] text-cyan-glow">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="font-display text-sm text-ink-high">{s.h}</p>
              <p className="mt-0.5 text-xs text-ink-low">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>

      {active ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-cyan-glow/15 bg-bg-2/40 p-3">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
            Quick start
          </div>
          <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-ink-mid whitespace-pre">
{command}
          </pre>
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-2 text-xs text-ink-low">
        <span>Click to {active ? "keep" : "expand"} this path</span>
        <ArrowRight size={12} className={iconColor} />
      </div>
    </button>
  );
}

function MetaQuestion({
  n,
  title,
  body,
  options,
  publicLabel,
}: {
  n: number;
  title: string;
  body: string;
  options: string;
  publicLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-cyan-glow/15 bg-bg-0/60 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-cyan-glow/30 bg-cyan-glow/10 font-mono text-[10px] text-cyan-glow">
          M{n}
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-base text-ink-high">{title}</p>
            <span className="rounded-full border border-cyan-glow/30 bg-cyan-glow/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-glow">
              {publicLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-mid">{body}</p>
          <div className="mt-3 space-y-1 text-sm text-ink-low">
            {options.split(/;\s*(?=\w+ \()/g).map((opt, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-cyan-glow">·</span>
                <span>{opt.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionAccordion({
  code,
  calendar,
  label,
  questions,
  defaultOpen,
}: {
  code: string;
  calendar: string;
  label: string;
  questions: string[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-cyan-glow/15 bg-bg-0/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-cyan-glow/5"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-glow/30 bg-cyan-glow/10 font-mono text-[10px] text-cyan-glow">
            {code}
          </span>
          <span>
            <span className="font-display text-sm text-ink-high">{label}</span>
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
              {calendar}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim">
            {questions.length} {questions.length === 1 ? "question" : "questions"}
          </span>
          <ChevronDown
            size={14}
            className={["text-cyan-glow transition-transform", open ? "rotate-180" : ""].join(" ")}
          />
        </span>
      </button>
      {open ? (
        <ol className="space-y-3 border-t border-cyan-glow/10 px-5 py-4">
          {questions.map((q, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="mt-0.5 font-mono text-[10px] text-cyan-glow">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-ink-mid">{q}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
      className="shrink-0 rounded p-1 text-ink-low transition hover:text-cyan-glow"
      aria-label="Copy URL"
    >
      {done ? <Check size={14} className="text-cyan-glow" /> : <Copy size={14} />}
    </button>
  );
}

function CopyBlock({ text }: { text: string }) {
  return (
    <div className="flex max-w-2xl items-center gap-2 rounded-xl border border-cyan-glow/30 bg-cyan-glow/5 px-3 py-2">
      <code className="flex-1 truncate font-mono text-sm text-cyan-glow">{text}</code>
      <CopyButton text={text} />
    </div>
  );
}
