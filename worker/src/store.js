// D1 access. `blocks` holds one row per block; `pools` keeps running totals in the same
// transaction so reorgs (a height whose hash changed) move the NAT to the right pool.

export async function getMeta(db, key) {
  const row = await db.prepare('SELECT value FROM meta WHERE key = ?').bind(key).first();
  return row ? JSON.parse(row.value) : null;
}

export function setMetaStmt(db, key, value) {
  return db
    .prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .bind(key, JSON.stringify(value));
}

export async function lastHeight(db) {
  const row = await db.prepare('SELECT MAX(height) AS h FROM blocks').first();
  return row?.h ?? null;
}

function poolAddStmt(db, b, sign) {
  const reward = b.reward ?? 0;
  if (sign < 0) {
    return db
      .prepare(
        'UPDATE pools SET blocks = blocks - 1, total_rewards = total_rewards - ?, total_reward_sats = total_reward_sats - ? WHERE slug = ?',
      )
      .bind(b.bits, reward, b.pool_slug);
  }
  return db
    .prepare(
      `INSERT INTO pools (slug, id, name, blocks, total_rewards, total_reward_sats, last_height)
       VALUES (?, ?, ?, 1, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         id = excluded.id, name = excluded.name, blocks = blocks + 1,
         total_rewards = total_rewards + excluded.total_rewards,
         total_reward_sats = total_reward_sats + excluded.total_reward_sats,
         last_height = MAX(COALESCE(last_height, 0), excluded.last_height)`,
    )
    .bind(b.pool.slug, b.pool.id, b.pool.name, b.bits, reward, b.height);
}

// Returns how many rows were new or replaced. `extra` statements (meta) ride in the same batch.
export async function saveBlocks(db, records, extra = []) {
  // Overlapping pages can carry the same height twice; keep the last copy of each.
  records = [...new Map(records.map((r) => [r.height, r])).values()];
  if (!records.length) {
    if (extra.length) await db.batch(extra);
    return 0;
  }
  const heights = records.map((r) => r.height);
  const { results: existing } = await db
    .prepare('SELECT height, hash, bits, reward, pool_slug FROM blocks WHERE height BETWEEN ? AND ?')
    .bind(Math.min(...heights), Math.max(...heights))
    .all();
  const byHeight = new Map(existing.map((r) => [r.height, r]));

  const stmts = [];
  let changed = 0;
  for (const r of records) {
    const old = byHeight.get(r.height);
    if (old && old.hash === r.hash) continue;
    if (old) stmts.push(poolAddStmt(db, old, -1));
    stmts.push(
      db
        .prepare(
          `INSERT OR REPLACE INTO blocks (height, hash, ts, bits, pool_id, pool_name, pool_slug, reward, source)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(r.height, r.hash, r.ts, r.bits, r.pool.id, r.pool.name, r.pool.slug, r.reward, r.source),
    );
    stmts.push(poolAddStmt(db, r, +1));
    changed++;
  }
  if (stmts.length || extra.length) await db.batch([...stmts, ...extra]);
  return changed;
}

// ---- reads, shaped like the responses the site already consumes ----

export async function latestBlocks(db, limit) {
  const { results } = await db
    .prepare('SELECT * FROM blocks ORDER BY height DESC LIMIT ?')
    .bind(limit)
    .all();
  return results.map((r) => ({
    id: r.hash,
    height: r.height,
    timestamp: r.ts,
    bits: r.bits,
    extras: { pool: { id: r.pool_id, name: r.pool_name, slug: r.pool_slug }, reward: r.reward },
  }));
}

export async function poolList(db, offset, limit) {
  const [{ results }, count] = await db.batch([
    db.prepare('SELECT * FROM pools WHERE blocks > 0 ORDER BY total_rewards DESC LIMIT ? OFFSET ?').bind(limit, offset),
    db.prepare('SELECT COUNT(*) AS n FROM pools WHERE blocks > 0'),
  ]);
  return {
    total: count.results[0].n,
    pools: results.map((p) => ({
      id: p.id ?? p.slug,
      name: p.name,
      slug: p.slug,
      blocks: p.blocks,
      total_rewards: p.total_rewards,
      balance: null, // needs a TAP indexer; the site hides empty balances
      extraData: { totalReward: p.total_reward_sats },
    })),
  };
}

export async function poolRewards(db, slug, offset, limit) {
  const [rows, pool] = await db.batch([
    db
      .prepare('SELECT height, hash, ts, bits FROM blocks WHERE pool_slug = ? ORDER BY height DESC LIMIT ? OFFSET ?')
      .bind(slug, limit, offset),
    db.prepare('SELECT blocks, total_rewards FROM pools WHERE slug = ?').bind(slug),
  ]);
  const p = pool.results[0];
  return {
    blocks: rows.results.map((r) => ({ blck: r.height, ts: r.ts, amt: r.bits, hash: r.hash, tx: null, fail: false })),
    analytics: { total_rewards: p?.total_rewards ?? 0, balance: null, total: p?.blocks ?? 0 },
  };
}
