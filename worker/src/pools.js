// Identify the pool that found a block from its coinbase, the same way mempool.space does:
// first by payout address, then by a tag in the coinbase script. The pool list comes from
// mempool's open mining-pools repo, so names and slugs match the logos the site already uses.

export const POOLS_URL = 'https://raw.githubusercontent.com/mempool/mining-pools/master/pools-v2.json';

export const UNKNOWN_POOL = Object.freeze({ id: 0, name: 'Unknown', slug: 'unknown' });

export function slugify(name) {
  return String(name).replace(/[^a-z0-9]/gi, '').toLowerCase();
}

export function buildMatcher(poolList) {
  const byAddress = new Map();
  const tags = [];
  for (const p of poolList) {
    const pool = { id: p.id, name: p.name, slug: slugify(p.name) };
    for (const a of p.addresses || []) byAddress.set(a, pool);
    for (const t of p.tags || []) if (t) tags.push([t, pool]);
  }
  return function match({ addresses = [], scriptsigAscii = '' }) {
    for (const a of addresses) {
      const hit = byAddress.get(a);
      if (hit) return hit;
    }
    for (const [tag, pool] of tags) {
      if (scriptsigAscii.includes(tag)) return pool;
    }
    return UNKNOWN_POOL;
  };
}

// Coinbase scriptSig hex -> printable text, like mempool's coinbaseSignatureAscii.
export function hexToAscii(hex) {
  let out = '';
  for (let i = 0; i + 1 < hex.length; i += 2) {
    const c = parseInt(hex.slice(i, i + 2), 16);
    if (c >= 0x20 && c < 0x7f) out += String.fromCharCode(c);
  }
  return out;
}

// The UTF-8 tags (F2Pool's '七彩神仙鱼', emoji) need a byte-level decode, so also try that.
export function hexToUtf8(hex) {
  const bytes = new Uint8Array(hex.length >> 1);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

export function coinbaseText(scriptsigHex) {
  return hexToAscii(scriptsigHex) + '\n' + hexToUtf8(scriptsigHex);
}
