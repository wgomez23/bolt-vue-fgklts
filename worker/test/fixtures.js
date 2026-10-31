// Block objects in the shape mempool.space's /api/v1/blocks returns (only the fields we read).
export function mempoolBlock(height, { pool = 'Foundry USA', slug = 'foundryusa', id = 111, bits = 386062550, hash } = {}) {
  return {
    id: hash ?? `hash${height}`,
    height,
    timestamp: 1_760_000_000 + (height - 885588) * 600,
    bits,
    extras: { reward: 315_000_000, pool: { id, name: pool, slug } },
  };
}

// Fake mempool source over an in-memory chain (newest-first pages of 15, like the real API).
export function fakeMempool(chain, { failWith } = {}) {
  const calls = [];
  return {
    calls,
    name: 'mempool',
    async tipHeight() {
      calls.push('tip');
      if (failWith) throw failWith;
      return Math.max(...chain.keys());
    },
    async blocksAt(h) {
      calls.push(`blocks/${h}`);
      if (failWith) throw failWith;
      const out = [];
      for (let x = h; x > h - 15; x--) if (chain.has(x)) out.push(chain.get(x));
      return out;
    },
  };
}
