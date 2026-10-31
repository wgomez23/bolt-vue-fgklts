#!/usr/bin/env node
// One-off history backfill for the natgmi block API. Writes SQL you load into D1 with
//   npx wrangler d1 execute natgmi-blocks --remote --file backfill-<from>-<to>.sql
//
// Two sources:
//   --source node     Your own Bitcoin Core node (fast, no rate limits). Needs a node that still
//                     has the old blocks, so run this BEFORE the full node is turned off.
//                     Set BITCOIN_RPC_URL=http://user:pass@127.0.0.1:8332 in the environment.
//   --source mempool  mempool.space's public API, 15 blocks per request, one request every
//                     --delay ms (default 3000). Slow but needs nothing. Backs off on 429.
//
// Options: --from <height> (default 885588) --to <height> (default: chain tip) --out <file>
import { writeFileSync } from 'node:fs';
import { buildMatcher, coinbaseText, POOLS_URL } from '../src/pools.js';
import { natFromBitsHex } from '../src/nat.js';
import { mempoolSource, RateLimitError } from '../src/sources.js';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1]?.startsWith('--') ? true : all[i + 1] ?? true]);
    return acc;
  }, []),
);
const source = args.source || 'mempool';
const from = Number(args.from || 885588);
const delay = Number(args.delay || 3000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...m) => console.error(...m);

// ---------- sources ----------
function nodeSource() {
  const raw = process.env.BITCOIN_RPC_URL;
  if (!raw) throw new Error('Set BITCOIN_RPC_URL=http://user:pass@host:8332');
  const u = new URL(raw);
  const auth = 'Basic ' + Buffer.from(`${decodeURIComponent(u.username)}:${decodeURIComponent(u.password)}`).toString('base64');
  u.username = '';
  u.password = '';
  let id = 0;
  const rpc = async (method, params = []) => {
    const res = await fetch(u, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: auth },
      body: JSON.stringify({ jsonrpc: '1.0', id: ++id, method, params }),
    });
    const body = await res.json();
    if (body.error) throw new Error(`${method}: ${body.error.message}`);
    return body.result;
  };
  let match;
  return {
    tipHeight: () => rpc('getblockcount'),
    async *blocks(lo, hi) {
      match ??= buildMatcher(await (await fetch(POOLS_URL)).json());
      for (let h = lo; h <= hi; h++) {
        const hash = await rpc('getblockhash', [h]);
        const b = await rpc('getblock', [hash, 1]);
        const cb = await rpc('getrawtransaction', [b.tx[0], true, hash]);
        const addresses = cb.vout.map((o) => o.scriptPubKey?.address).filter(Boolean);
        const reward = cb.vout.reduce((s, o) => s + Math.round(o.value * 1e8), 0);
        yield {
          height: h,
          hash,
          ts: b.time,
          bits: natFromBitsHex(b.bits),
          pool: match({ addresses, scriptsigAscii: coinbaseText(cb.vin[0].coinbase || '') }),
          reward,
          source: 'node',
        };
      }
    },
  };
}

function mempoolPaged() {
  const m = mempoolSource();
  return {
    tipHeight: m.tipHeight,
    async *blocks(lo, hi) {
      let backoff = 30_000;
      let done = lo - 1; // highest height already yielded (the last page can overlap)
      for (let top = Math.min(hi, lo + 14); ; top = Math.min(hi, top + 15)) {
        let page;
        for (;;) {
          try {
            page = await m.blocksAt(top);
            backoff = 30_000;
            break;
          } catch (e) {
            if (!(e instanceof RateLimitError)) throw e;
            log(`rate limited at ${top}; waiting ${backoff / 1000}s`);
            await sleep(backoff);
            backoff = Math.min(backoff * 2, 15 * 60_000);
          }
        }
        for (const r of page.reverse()) {
          if (r.height > done && r.height <= hi) {
            done = r.height;
            yield r;
          }
        }
        if (top >= hi) return;
        await sleep(delay);
      }
    },
  };
}

// ---------- SQL ----------
const q = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const row = (r) =>
  `(${[r.height, r.hash, r.ts, r.bits, r.pool.id, r.pool.name, r.pool.slug, r.reward, r.source].map(q).join(',')})`;

const src = source === 'node' ? nodeSource() : mempoolPaged();
const to = Number(args.to || (await src.tipHeight()));
const out = args.out || `backfill-${from}-${to}.sql`;
log(`Backfilling ${from}..${to} (${to - from + 1} blocks) from ${source} into ${out}`);

const lines = [];
let batch = [];
let n = 0;
const flush = () => {
  if (!batch.length) return;
  lines.push(
    `INSERT OR REPLACE INTO blocks (height, hash, ts, bits, pool_id, pool_name, pool_slug, reward, source) VALUES\n${batch.join(',\n')};`,
  );
  batch = [];
};
for await (const r of src.blocks(from, to)) {
  batch.push(row(r));
  if (batch.length === 200) flush();
  if (++n % 1000 === 0) log(`  ${n} blocks (at ${r.height})`);
}
flush();

// Rebuild the per-pool totals from the blocks table so they always match it.
lines.push(`DELETE FROM pools;`);
lines.push(`INSERT INTO pools (slug, id, name, blocks, total_rewards, total_reward_sats, last_height)
SELECT b.pool_slug, b.pool_id, b.pool_name, t.blocks, t.nat, t.sats, t.last
FROM (SELECT pool_slug, COUNT(*) AS blocks, SUM(bits) AS nat, SUM(COALESCE(reward, 0)) AS sats, MAX(height) AS last
      FROM blocks GROUP BY pool_slug) t
JOIN blocks b ON b.height = t.last;`);
writeFileSync(out, lines.join('\n') + '\n');
log(`Wrote ${n} blocks to ${out}`);
