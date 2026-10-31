import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeD1 } from './d1-shim.js';
import { fakeMempool, mempoolBlock } from './fixtures.js';
import { fromMempoolBlock } from '../src/sources.js';
import { runUpdate } from '../src/update.js';
import worker from '../src/index.js';

// Workers runtime stand-ins: an always-miss edge cache and a ctx that runs waitUntil.
globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };
const ctx = { waitUntil: () => {} };
const get = async (env, path) => {
  const res = await worker.fetch(new Request(`https://api.natgmi.com${path}`), env, ctx);
  return { status: res.status, cors: res.headers.get('access-control-allow-origin'), body: await res.json() };
};

test('HTTP routes return what the site components read', async () => {
  const db = makeD1();
  const chain = new Map();
  for (let h = 885588; h <= 885600; h++) {
    chain.set(h, fromMempoolBlock(mempoolBlock(h, h === 885600 ? { pool: 'AntPool', slug: 'antpool', id: 44 } : {})));
  }
  await runUpdate({ db, mempool: fakeMempool(chain), esplora: null });
  const env = { DB: db };

  const blocks = await get(env, '/blocks?limit=5');
  assert.equal(blocks.status, 200);
  assert.equal(blocks.cors, '*');
  assert.equal(blocks.body.blocks.length, 5);
  assert.equal(blocks.body.blocks[0].extras.pool.slug, 'antpool');

  const pools = await get(env, '/pools?offset=0&limit=10');
  assert.equal(pools.body.success, true);
  assert.equal(pools.body.data.total, 2);
  assert.equal(pools.body.data.pools[0].slug, 'foundryusa');
  assert.equal(pools.body.data.pools[0].total_rewards, 12 * 386062550);

  const one = await get(env, '/pools/antpool?offset=0&limit=10');
  assert.equal(one.body.analytics.total, 1);
  assert.equal(one.body.blocks[0].blck, 885600);

  assert.equal((await get(env, '/pools/../etc')).status, 404);
  // Fixture timestamps are in the past, so health reports stale.
  assert.equal((await get(env, '/health')).status, 503);
});
