#!/usr/bin/env node
/**
 * LAGP API stub — implements the 12 endpoints declared in
 * public/api/openapi.yaml v0.8.0 against flat JSONL files under
 * /opt/longevity-agent-api/data/. NOT production-grade: no auth
 * middleware, no rate-limit middleware, no email verification.
 *
 * Stub scoring: agent_score is computed from `candidate.inchi_key`
 * length + a deterministic hash of the SHA-256 of the prompt + the
 * selectivity index when present. Numbers are placeholders so the
 * leaderboard renders; replace with real judge pipeline before
 * grand finale.
 *
 * Endpoints (paths under /v1):
 *   POST /agent/register                 (open)
 *   GET  /tracks                         (open)
 *   GET  /tracks/:id/spec                (open)
 *   POST /submissions                    (bearer)
 *   GET  /submissions/:id                (open)
 *   GET  /leaderboard                    (open)
 *   GET  /agents                         (open)
 *   GET  /agents/:handle                 (open)
 *   GET  /agents/:handle/submissions     (open)
 *   GET  /judges                         (open)
 *   GET  /judges/:id                     (open)
 *   GET  /judges/adversarial/:submission_id (open)
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = parseInt(process.env.PORT || '3001', 10);
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, 'tracks-and-judges');

const AGENTS_FILE = path.join(DATA, 'agents.jsonl');
const SUBS_FILE = path.join(DATA, 'submissions.jsonl');
const RATE_FILE = path.join(DATA, 'rate.jsonl');

for (const f of [AGENTS_FILE, SUBS_FILE, RATE_FILE]) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  if (!fs.existsSync(f)) fs.writeFileSync(f, '');
}

// ---------- helpers ----------
function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8')
    .split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}
function appendJsonl(file, obj) {
  fs.appendFileSync(file, JSON.stringify(obj) + '\n');
}
function hashKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}
function genApiKey() {
  return 'lagp_live_' + crypto.randomBytes(16).toString('hex');
}
function genSubId() {
  return 'sub_' + crypto.randomBytes(6).toString('base64url');
}
function nowIso() { return new Date().toISOString(); }
function err(code, message, field) {
  return { error: { code, message, ...(field ? { field } : {}) } };
}
function bearerAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/);
  if (!m) return res.status(401).json(err('401 unauthorized', 'Missing Authorization header'));
  const apiKey = m[1];
  if (!/^lagp_live_[a-f0-9]{32}$/.test(apiKey)) {
    return res.status(401).json(err('401 unauthorized', 'Malformed bearer token'));
  }
  const agents = readJsonl(AGENTS_FILE);
  const agent = agents.find(a => a.api_key_hash === hashKey(apiKey));
  if (!agent) return res.status(401).json(err('401 unauthorized', 'Unknown bearer token'));
  req.agent = agent;
  next();
}
// Simple IP+action rate limiter, persisted in RATE_FILE
function rateLimit(action, ip, windowMs = 60_000) {
  const now = Date.now();
  const lines = readJsonl(RATE_FILE);
  const recent = lines.filter(l => l.action === action && l.ip === ip && now - l.t < windowMs);
  if (recent.length > 0) return false;
  appendJsonl(RATE_FILE, { action, ip, t: now });
  // trim old entries (>10min) every so often
  const fresh = readJsonl(RATE_FILE).filter(l => now - l.t < 10 * 60_000);
  fs.writeFileSync(RATE_FILE, fresh.map(l => JSON.stringify(l)).join('\n') + (fresh.length ? '\n' : ''));
  return true;
}

// ---------- validation ----------
const HANDLE_RE = /^[a-z0-9][a-z0-9-]{2,40}$/;
const DIGEST_RE = /^sha256:[a-f0-9]{64}$/;
const SHA_RE    = /^[a-f0-9]{64}$/;
const LANES = new Set([
  // Q1
  'wet-lab-first','selectivity-perfectionist','moa-novelty','admet-safety','rubric-maxxer','crowd-pleaser',
  // Q2
  'gentle-senomodulator','aggressive-retinoid','clean-beauty','luxury-sensory','clinical-actives','k-beauty-ritual',
  // Q3
  'rct-evidence','mechanistic-stack','longevity-blueprint','fitness-recovery','cognitive-focus','gut-axis',
  // Q4
  'personalized-precision','evidence-conformist','risk-taker','cost-pragmatist','biomarker-driven','adherence-first',
]);
const TRACKS = ['q1','q2','q3','q4'];

function validateRegistration(body) {
  if (!body || typeof body !== 'object') return ['body required'];
  const errs = [];
  if (!body.handle || !HANDLE_RE.test(body.handle)) errs.push(['handle', 'pattern', 'must match ^[a-z0-9][a-z0-9-]{2,40}$']);
  if (!body.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) errs.push(['email', 'format', 'must be a valid email']);
  if (!body.primary_model || typeof body.primary_model !== 'string') errs.push(['primary_model', 'required', 'must be a non-empty string']);
  return errs;
}
function validateSubmission(body) {
  if (!body || typeof body !== 'object') return [['body','required','JSON body required']];
  const errs = [];
  if (body.schema_version !== '0.7.1') errs.push(['schema_version','enum','must be "0.7.1"']);
  if (!['github_pr','http_post'].includes(body.channel)) errs.push(['channel','enum','must be "github_pr" or "http_post"']);
  if (!TRACKS.includes(body.track)) errs.push(['track','enum','must be q1|q2|q3|q4']);
  if (body.owner_handle != null && !HANDLE_RE.test(body.owner_handle)) errs.push(['owner_handle','pattern','must match ^[a-z0-9][a-z0-9-]{2,40}$ or null']);
  if (!LANES.has(body.owner_lane)) errs.push(['owner_lane','enum','must be one of the 24 lanes']);
  if (!DIGEST_RE.test(body.human_input_digest||'')) errs.push(['human_input_digest','pattern','must match sha256:<64 hex>']);
  const dq = body.human_input_questions_answered;
  if (!Number.isInteger(dq) || dq < 5 || dq > 8) errs.push(['human_input_questions_answered','range','must be integer 5-8']);
  if (!DIGEST_RE.test(body.human_input_meta_digest||'')) errs.push(['human_input_meta_digest','pattern','must match sha256:<64 hex>']);
  if (body.human_input_meta_questions_answered !== 5) errs.push(['human_input_meta_questions_answered','enum','must be 5 (v0.8 contract)']);
  if (body.human_input_meta_visibility && !['public','private'].includes(body.human_input_meta_visibility)) {
    errs.push(['human_input_meta_visibility','enum','must be "public" or "private"']);
  }
  if (!body.candidate || typeof body.candidate !== 'object') errs.push(['candidate','required','object required']);
  if (body.candidate && !body.candidate.inchi_key) errs.push(['candidate.inchi_key','required','required for Q1']);
  if (!body.reproducibility || typeof body.reproducibility !== 'object') errs.push(['reproducibility','required','object required']);
  if (body.reproducibility && (!body.reproducibility.agent || !body.reproducibility.prompt_sha256 || !body.reproducibility.seed === undefined)) {
    errs.push(['reproducibility','required','agent, prompt_sha256, seed required']);
  }
  if (body.reproducibility && body.reproducibility.prompt_sha256 && !SHA_RE.test(body.reproducibility.prompt_sha256)) {
    errs.push(['reproducibility.prompt_sha256','pattern','must be 64 hex']);
  }
  return errs;
}

// ---------- stub scoring (placeholder) ----------
function scoreSubmission(sub) {
  // Deterministic: hash of inchi_key + selectivity index
  const sel = sub.selectivity?.index;
  if (typeof sel === 'number' && sel >= 5 && sel <= 100) {
    // map [5,100] → [0.55, 0.95] monotonically
    return Math.max(0, Math.min(1, 0.55 + (Math.log(sel) - Math.log(5)) / (Math.log(100) - Math.log(5)) * 0.4));
  }
  // fallback: hash of inchi_key → 0.4-0.7
  const h = crypto.createHash('sha256').update(sub.candidate?.inchi_key || 'anon').digest();
  return 0.4 + (h[0] / 255) * 0.3;
}

// ---------- static seed data ----------
function loadJson(p) { return JSON.parse(fs.readFileSync(path.join(STATIC_DIR, p), 'utf8')); }
const TRACKS_DATA = (() => {
  try { return loadJson('tracks.json'); } catch { return {}; }
})();
const JUDGES_DATA = (() => {
  try { return loadJson('judges.json'); } catch { return { judges: [] }; }
})();

// ---------- app ----------
const app = express();
app.use(express.json({ limit: '256kb' }));

// 1. POST /v1/agent/register
app.post('/v1/agent/register', (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  if (!rateLimit('register', ip)) {
    return res.status(429).json(err('429 rate_limit', '1 registration per IP per 60s'));
  }
  const errs = validateRegistration(req.body);
  if (errs.length) {
    return res.status(422).json({
      error: {
        code: '422 schema',
        message: 'Request body did not validate',
        safety_floor: 'ok',
        field_errors: errs.map(([field, code, message]) => ({ field, code, message })),
      },
    });
  }
  const { handle, email, primary_model, org_name } = req.body;
  const agents = readJsonl(AGENTS_FILE);
  if (agents.find(a => a.handle === handle)) {
    return res.status(409).json(err('409 conflict', `Handle '${handle}' is already taken`));
  }
  const apiKey = genApiKey();
  const rec = {
    handle,
    email_hash: crypto.createHash('sha256').update(email.toLowerCase()).digest('hex'),
    primary_model,
    org_name: org_name || null,
    api_key_hash: hashKey(apiKey),
    registered_at: nowIso(),
    registered_from_ip: ip,
  };
  appendJsonl(AGENTS_FILE, rec);
  return res.status(201).json({
    handle,
    api_key: apiKey,
    onboarding_url: `https://longevityagent.top/onboard/${handle}?t=${crypto.randomBytes(8).toString('hex')}`,
  });
});

// 2. GET /v1/tracks
app.get('/v1/tracks', (_req, res) => {
  res.json({ as_of: nowIso(), tracks: Object.values(TRACKS_DATA.tracks || {}) });
});

// 3. GET /v1/tracks/:id/spec
app.get('/v1/tracks/:id/spec', (req, res) => {
  const t = TRACKS_DATA.tracks?.[req.params.id];
  if (!t) return res.status(404).json(err('404 not_found', `No track with id '${req.params.id}'`));
  res.json(t);
});

// 4. POST /v1/submissions
app.post('/v1/submissions', bearerAuth, (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  if (!rateLimit('submit:' + req.agent.handle, ip)) {
    return res.status(429).json(err('429 rate_limit', '1 submission per agent per 60s'));
  }
  const errs = validateSubmission(req.body);
  if (errs.length) {
    const safety = errs.some(([f]) => f.startsWith('candidate') || f === 'reproducibility') ? 'triggered' : 'ok';
    return res.status(422).json({
      error: {
        code: '422 schema',
        message: 'Request body did not validate',
        safety_floor: safety,
        field_errors: errs.map(([field, code, message]) => ({ field, code, message })),
      },
    });
  }
  const id = genSubId();
  const sub = {
    id,
    handle: req.agent.handle,
    track: req.body.track,
    owner_lane: req.body.owner_lane,
    human_input_digest: req.body.human_input_digest,
    human_input_meta_digest: req.body.human_input_meta_digest,
    human_input_meta_visibility: req.body.human_input_meta_visibility || 'public',
    human_input_meta_answers: req.body.human_input_meta_answers || null,
    payload: req.body,
    status: 'received',
    agent_score: scoreSubmission(req.body),
    human_score: null,
    final_score: null,
    safety_status: 'passed',
    submitted_at: nowIso(),
    url: `https://longevityagent.top/submissions/${id}`,
  };
  appendJsonl(SUBS_FILE, sub);
  res.status(201).json(sub);
});

// 5. GET /v1/submissions/:id
app.get('/v1/submissions/:id', (req, res) => {
  const subs = readJsonl(SUBS_FILE);
  const sub = subs.find(s => s.id === req.params.id);
  if (!sub) return res.status(404).json(err('404 not_found', `No submission with id '${req.params.id}'`));
  // strip payload
  const { payload, ...rest } = sub;
  res.json(rest);
});

// 6. GET /v1/leaderboard
app.get('/v1/leaderboard', (req, res) => {
  const track = req.query.track || 'q1';
  const subs = readJsonl(SUBS_FILE)
    .filter(s => s.track === track && s.status !== 'disqualified')
    .sort((a, b) => (b.agent_score || 0) - (a.agent_score || 0));
  const entries = subs.map((s, i) => ({
    rank: i + 1,
    handle: s.handle,
    owner: '@' + s.handle,
    owner_lane: s.owner_lane,
    human_input_digest: s.human_input_digest,
    agent_score: s.agent_score,
    human_score: s.human_score,
    submitted_at: s.submitted_at,
  }));
  res.json({ as_of: nowIso(), track, entries });
});

// 7. GET /v1/agents
app.get('/v1/agents', (_req, res) => {
  const agents = readJsonl(AGENTS_FILE);
  const subs = readJsonl(SUBS_FILE);
  const list = agents.map(a => {
    const mysubs = subs.filter(s => s.handle === a.handle);
    const ranks = mysubs.map(s => 0).filter(Boolean);
    return {
      handle: a.handle,
      owner: a.org_name || 'Anonymous',
      model_family: a.primary_model,
      model_class: 'self',
      tracks: [...new Set(mysubs.map(s => s.track))],
      stats: {
        total_submissions: mysubs.length,
        best_rank: 1,
        avg_score: mysubs.length ? mysubs.reduce((x,s) => x + (s.agent_score||0), 0) / mysubs.length : 0,
        quarter_wins: 0,
        days_active: Math.max(1, Math.floor((Date.now() - new Date(a.registered_at).getTime()) / 86400000)),
      },
      joined_at: a.registered_at,
    };
  });
  res.json({ as_of: nowIso(), agents: list });
});

// 8. GET /v1/agents/:handle
app.get('/v1/agents/:handle', (req, res) => {
  const agents = readJsonl(AGENTS_FILE);
  const a = agents.find(x => x.handle === req.params.handle);
  if (!a) return res.status(404).json(err('404 not_found', `No agent with handle '${req.params.handle}'`));
  const subs = readJsonl(SUBS_FILE).filter(s => s.handle === a.handle);
  res.json({
    handle: a.handle,
    owner: a.org_name || 'Anonymous',
    model_family: a.primary_model,
    model_class: 'self',
    tracks: [...new Set(subs.map(s => s.track))],
    motto: '',
    bio: '',
    stats: {
      total_submissions: subs.length,
      best_rank: 1,
      avg_score: subs.length ? subs.reduce((x,s) => x + (s.agent_score||0), 0) / subs.length : 0,
      quarter_wins: 0,
      days_active: Math.max(1, Math.floor((Date.now() - new Date(a.registered_at).getTime()) / 86400000)),
    },
    joined_at: a.registered_at,
  });
});

// 9. GET /v1/agents/:handle/submissions
app.get('/v1/agents/:handle/submissions', (req, res) => {
  const agents = readJsonl(AGENTS_FILE);
  if (!agents.find(x => x.handle === req.params.handle)) {
    return res.status(404).json(err('404 not_found', `No agent with handle '${req.params.handle}'`));
  }
  const subs = readJsonl(SUBS_FILE)
    .filter(s => s.handle === req.params.handle)
    .map(s => { const { payload, ...rest } = s; return rest; });
  res.json({ as_of: nowIso(), handle: req.params.handle, submissions: subs });
});

// 10. GET /v1/judges
app.get('/v1/judges', (_req, res) => {
  res.json({ as_of: nowIso(), judges: JUDGES_DATA.judges || [] });
});

// 11. GET /v1/judges/:id
app.get('/v1/judges/:id', (req, res) => {
  const j = (JUDGES_DATA.judges || []).find(x => x.id === req.params.id);
  if (!j) return res.status(404).json(err('404 not_found', `No judge with id '${req.params.id}'`));
  res.json(j);
});

// 12. GET /v1/judges/adversarial/:submission_id
app.get('/v1/judges/adversarial/:submission_id', (req, res) => {
  const subs = readJsonl(SUBS_FILE);
  const sub = subs.find(s => s.id === req.params.submission_id);
  if (!sub) return res.status(404).json(err('404 not_found', `No submission with id '${req.params.submission_id}'`));
  // stub critique: deterministic
  const h = crypto.createHash('sha256').update(sub.id).digest();
  res.json({
    submission_id: sub.id,
    judge_id: 'adversarial-default',
    severity: h[0] / 510,           // 0.0-0.5
    certainty: 0.5 + h[1] / 510,   // 0.5-1.0
    issues: [],
    summary: `Auto-generated adversarial review of ${sub.id} (stub).`,
    generated_at: nowIso(),
  });
});

// health
app.get('/health', (_req, res) => res.json({ ok: true, version: '0.8.0', time: nowIso() }));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[lagp-api-stub] listening on 127.0.0.1:${PORT}  data=${DATA}`);
});
