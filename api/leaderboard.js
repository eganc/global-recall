// Cross-player leaderboard for Global Recall.
//
// Storage: Upstash Redis (provisioned via the Vercel marketplace
// integration). Each mode has a ZSET keyed `lb:<mode>`:
//   member = "INITIALS|TS|NONCE"   (unique per submission)
//   score  = the game score (Sprint countries / Strict perfect count)
// Top 100 kept; lowest scores trimmed on each write.
//
// Privacy posture (locked):
//   - No PII collected. {initials, score, mode, ts} is the entire record.
//   - No IP / user-agent / device ID stored. (Vercel itself logs request
//     IPs for ~24h for platform reasons; that's outside this code's scope.)
//   - No auth, no accounts, no tokens. The local board is the player's
//     truth; this board is shared glory.
//
// Anti-abuse posture (locked, simplest tier):
//   - Server validates score range, mode, initials shape.
//   - No rate limit. A determined kid with devtools can flood the board;
//     trimming-to-top-100 + score caps mean the worst case is that the
//     board fills with bogus 195s. If that ever happens, a single
//     `redis.del('lb:sprint')` wipes it.

import { Redis } from '@upstash/redis';

const VALID_MODES = ['sprint', 'strict'];
const MIN_SCORE = 1;
const MAX_SCORE = 195;
const TOP_N = 100;

// Lazily constructed so we can return a clean 503 when KV isn't
// configured yet (i.e., the Upstash integration hasn't been linked to
// the project), rather than 500-ing during cold-start.
let redis;
function getRedis() {
  if (redis) return redis;
  const url   = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function cleanInitials(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3)
    .padEnd(3, 'A');
}

// Member format: "INITIALS|TS|NONCE". Nonce so two identical
// {INITIALS, TS} submissions stay distinct members in the ZSET.
function encodeMember(initials, ts) {
  const nonce = Math.floor(Math.random() * 1e9).toString(36);
  return `${initials}|${ts}|${nonce}`;
}
function parseMember(m) {
  const [initials, tsStr] = String(m).split('|');
  return { initials: initials || 'AAA', ts: Number(tsStr) || 0 };
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const r = getRedis();
  if (!r) {
    return res.status(503).json({ error: 'leaderboard-unavailable' });
  }

  try {
    if (req.method === 'GET') {
      const mode = String((req.query && req.query.mode) || '').toLowerCase();
      if (!VALID_MODES.includes(mode)) {
        return res.status(400).json({ error: 'invalid-mode' });
      }
      // ZRANGE with REV gives highest-score first; withScores returns
      // an interleaved [member, score, member, score, ...] array on the
      // Upstash REST client.
      const raw = await r.zrange(`lb:${mode}`, 0, TOP_N - 1, {
        rev: true,
        withScores: true,
      });
      const entries = [];
      for (let i = 0; i < raw.length; i += 2) {
        const { initials, ts } = parseMember(raw[i]);
        entries.push({ initials, score: Number(raw[i + 1]) || 0, ts });
      }
      return res.status(200).json({ entries });
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); }
        catch { return res.status(400).json({ error: 'invalid-json' }); }
      }
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'invalid-body' });
      }
      const mode  = String(body.mode || '').toLowerCase();
      const score = Number(body.score);
      if (!VALID_MODES.includes(mode)) {
        return res.status(400).json({ error: 'invalid-mode' });
      }
      if (!Number.isInteger(score) || score < MIN_SCORE || score > MAX_SCORE) {
        return res.status(400).json({ error: 'invalid-score' });
      }
      const initials = cleanInitials(body.initials);
      // Honour the client's timestamp when it sends a sane one. ts is not PII
      // (it's already shown as the entry date); letting the client own it means
      // the client can recognise its *own* rows on the global board across
      // different initials by matching {initials, score, ts} — without any
      // account or device id ever reaching the server. Falls back to now.
      const clientTs = Number(body.ts);
      const now = Date.now();
      const ts = (Number.isFinite(clientTs) && clientTs > 1.5e12 && clientTs <= now + 86400000)
        ? Math.floor(clientTs) : now;
      const member = encodeMember(initials, ts);
      await r.zadd(`lb:${mode}`, { score, member });
      // Trim to top TOP_N (Redis ranks ascending; -TOP_N-1 keeps the top N).
      await r.zremrangebyrank(`lb:${mode}`, 0, -TOP_N - 1);
      const rank = await r.zrevrank(`lb:${mode}`, member);
      return res.status(200).json({
        rank: rank == null ? null : rank + 1,
        onBoard: rank != null,
      });
    }

    return res.status(405).json({ error: 'method-not-allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'server-error' });
  }
}
