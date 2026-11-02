// natgmi block API: a Cloudflare Worker on the free plan.
//   scheduled  -> runUpdate() every 2 minutes (see wrangler.toml)
//   GET /blocks              latest blocks, shaped like mempool.space blocks
//   GET /pools               leaderboard: NAT per pool
//   GET /pools/:slug         one pool's blocks
//   GET /token               dmt-nat supply and holders from the TAP reader
//   GET /health              last update, for an uptime monitor
import { esploraSource, mempoolSource } from './sources.js';
import { getMeta, latestBlocks, lastHeight, poolList, poolRewards } from './store.js';
import { runUpdate } from './update.js';
import { refreshBalances } from './balances.js';
import { tapSource } from './tap.js';

const STALE_AFTER_S = 2 * 60 * 60; // a 2-hour gap between blocks is very rare; let the monitor alert

function json(body, { status = 200, maxAge = 30 } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': `public, max-age=${maxAge}`,
    },
  });
}

function page(url, defLimit, maxLimit) {
  const limit = Math.min(maxLimit, Math.max(1, Number(url.searchParams.get('limit')) || defLimit));
  const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);
  return { limit, offset };
}

async function route(request, env) {
  const url = new URL(request.url);
  const db = env.DB;
  if (url.pathname === '/blocks') {
    const { limit } = page(url, 15, 50);
    return json({ blocks: await latestBlocks(db, limit) }, { maxAge: 30 });
  }
  if (url.pathname === '/pools') {
    const { limit, offset } = page(url, 10, 100);
    return json({ success: true, data: await poolList(db, offset, limit) }, { maxAge: 120 });
  }
  const m = url.pathname.match(/^\/pools\/([a-z0-9]+)$/);
  if (m) {
    const { limit, offset } = page(url, 10, 100);
    return json({ success: true, ...(await poolRewards(db, m[1], offset, limit)) }, { maxAge: 120 });
  }
  if (url.pathname === '/token') {
    const t = await getMeta(db, 'token');
    if (!t) return json({ success: false, error: 'no TAP reader data yet' }, { status: 503, maxAge: 60 });
    const supply = t.max != null && t.mint_left != null ? (BigInt(t.max) - BigInt(t.mint_left)).toString() : null;
    return json({ success: true, ...t, supply }, { maxAge: 300 });
  }
  if (url.pathname === '/health') {
    const [status, height] = await Promise.all([getMeta(db, 'status'), lastHeight(db)]);
    const newest = await db.prepare('SELECT ts FROM blocks ORDER BY height DESC LIMIT 1').first();
    const age = newest ? Math.floor(Date.now() / 1000) - newest.ts : null;
    const ok = age !== null && age < STALE_AFTER_S;
    return json({ ok, last_height: height, newest_block_age_s: age, status }, { status: ok ? 200 : 503, maxAge: 0 });
  }
  return json({ error: 'not found' }, { status: 404, maxAge: 300 });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return json(null, { maxAge: 86400 });
    if (request.method !== 'GET') return json({ error: 'method not allowed' }, { status: 405, maxAge: 0 });
    // Edge cache (works on a custom domain such as api.natgmi.com; a no-op on workers.dev).
    const cache = caches.default;
    const hit = await cache.match(request);
    if (hit) return hit;
    const res = await route(request, env);
    if (res.status === 200 && !new URL(request.url).pathname.startsWith('/health')) {
      ctx.waitUntil(cache.put(request, res.clone()));
    }
    return res;
  },

  async scheduled(event, env, ctx) {
    const opts = env.START_HEIGHT ? { startHeight: Number(env.START_HEIGHT) } : {};
    ctx.waitUntil(
      (async () => {
        await runUpdate({ db: env.DB, mempool: mempoolSource(), esplora: esploraSource(), opts });
        // Miner balances and token stats, only once a TAP reader is set up (see tap-reader-server/).
        if (env.TAP_READER_URL && env.TAP_READER_TOKEN) {
          const tap = tapSource({ base: env.TAP_READER_URL, token: env.TAP_READER_TOKEN });
          const r = await refreshBalances({ db: env.DB, tap });
          if (r.error) console.log('TAP reader:', r.error);
        }
      })(),
    );
  },
};
