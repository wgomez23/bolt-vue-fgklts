// Block data sources. Each returns normalized records:
// { height, hash, ts, bits, pool: { id, name, slug }, reward, source }
import { buildMatcher, coinbaseText, POOLS_URL } from './pools.js';

export const MEMPOOL_BASE = 'https://mempool.space/api';
export const ESPLORA_BASE = 'https://blockstream.info/api';

export class RateLimitError extends Error {
  constructor(url, status) {
    super(`${status} from ${url}`);
    this.status = status;
  }
}

async function get(url, as = 'json', fetchImpl = fetch) {
  const res = await fetchImpl(url, { headers: { 'User-Agent': 'natgmi-block-api' } });
  if (res.status === 429 || res.status === 503) throw new RateLimitError(url, res.status);
  if (!res.ok) throw new Error(`${res.status} from ${url}`);
  return as === 'text' ? (await res.text()).trim() : res.json();
}

export function fromMempoolBlock(b) {
  const pool = b.extras?.pool;
  return {
    height: b.height,
    hash: b.id,
    ts: b.timestamp,
    bits: b.bits,
    pool: pool ? { id: pool.id, name: pool.name, slug: pool.slug } : { id: 0, name: 'Unknown', slug: 'unknown' },
    reward: b.extras?.reward ?? null,
    source: 'mempool',
  };
}

export function mempoolSource({ base = MEMPOOL_BASE, fetchImpl = fetch } = {}) {
  return {
    name: 'mempool',
    tipHeight: async () => Number(await get(`${base}/blocks/tip/height`, 'text', fetchImpl)),
    // Returns up to 15 blocks at and below `height`, newest first.
    blocksAt: async (height) => (await get(`${base}/v1/blocks/${height}`, 'json', fetchImpl)).map(fromMempoolBlock),
  };
}

export function fromEsplora(block, coinbaseTx, match) {
  const vin = coinbaseTx.vin?.[0] || {};
  const addresses = (coinbaseTx.vout || []).map((o) => o.scriptpubkey_address).filter(Boolean);
  const reward = (coinbaseTx.vout || []).reduce((s, o) => s + (o.value || 0), 0);
  return {
    height: block.height,
    hash: block.id,
    ts: block.timestamp,
    bits: block.bits,
    pool: match({ addresses, scriptsigAscii: coinbaseText(vin.scriptsig || '') }),
    reward,
    source: 'esplora',
  };
}

// Fallback when mempool.space is down or rate limiting. Esplora doesn't name the pool,
// so it's matched from the coinbase against mempool's open pool list. 4 requests per block.
export function esploraSource({ base = ESPLORA_BASE, poolsUrl = POOLS_URL, fetchImpl = fetch } = {}) {
  let match;
  const matcher = async () => (match ??= buildMatcher(await get(poolsUrl, 'json', fetchImpl)));
  return {
    name: 'esplora',
    tipHeight: async () => Number(await get(`${base}/blocks/tip/height`, 'text', fetchImpl)),
    blockAt: async (height) => {
      const hash = await get(`${base}/block-height/${height}`, 'text', fetchImpl);
      const block = await get(`${base}/block/${hash}`, 'json', fetchImpl);
      const txid = await get(`${base}/block/${hash}/txid/0`, 'text', fetchImpl);
      const tx = await get(`${base}/tx/${txid}`, 'json', fetchImpl);
      return fromEsplora(block, tx, await matcher());
    },
  };
}
