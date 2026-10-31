import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeD1 } from './d1-shim.js';
import { fakeMempool, mempoolBlock } from './fixtures.js';
import { fromMempoolBlock, fromEsplora, RateLimitError } from '../src/sources.js';
import { buildMatcher, slugify, coinbaseText } from '../src/pools.js';
import { natFromBitsHex } from '../src/nat.js';
import { runUpdate } from '../src/update.js';
import { latestBlocks, poolList, poolRewards } from '../src/store.js';

const START = 885588;
const chainOf = (from, to, f = () => ({})) => {
  const m = new Map();
  for (let h = from; h <= to; h++) m.set(h, fromMempoolBlock(mempoolBlock(h, f(h))));
  return m;
};
const noEsplora = { tipHeight: async () => { throw new Error('esplora not expected'); } };

test('NAT per block is nBits read as an integer', () => {
  assert.equal(natFromBitsHex('1702d8d6'), 386062550);
  assert.throws(() => natFromBitsHex('xyz'));
});

test('slugs match mempool pool logo names', () => {
  assert.equal(slugify('Foundry USA'), 'foundryusa');
  assert.equal(slugify('MARA Pool'), 'marapool');
  assert.equal(slugify('F2Pool'), 'f2pool');
});

test('pool matcher prefers payout address, then coinbase tag (incl. UTF-8 tags)', () => {
  const match = buildMatcher([
    { id: 36, name: 'F2Pool', addresses: [], tags: ['七彩神仙鱼'] },
    { id: 111, name: 'Foundry USA', addresses: ['bc1qfoundry'], tags: ['Foundry USA Pool'] },
    { id: 102, name: 'SpiderPool', addresses: [], tags: ['SpiderPool'] },
  ]);
  assert.equal(match({ addresses: ['bc1qfoundry'], scriptsigAscii: 'SpiderPool' }).slug, 'foundryusa');
  assert.equal(match({ addresses: [], scriptsigAscii: coinbaseText(Buffer.from('xx/SpiderPool/xx').toString('hex')) }).slug, 'spiderpool');
  assert.equal(match({ addresses: [], scriptsigAscii: coinbaseText(Buffer.from('七彩神仙鱼').toString('hex')) }).slug, 'f2pool');
  assert.equal(match({ addresses: ['nope'], scriptsigAscii: 'nothing' }).slug, 'unknown');
});

test('esplora block + coinbase normalize like mempool', () => {
  const match = buildMatcher([{ id: 102, name: 'SpiderPool', addresses: [], tags: ['SpiderPool'] }]);
  const r = fromEsplora(
    { id: 'h', height: 900000, timestamp: 1, bits: 386062550 },
    { vin: [{ scriptsig: Buffer.from('/SpiderPool/').toString('hex') }], vout: [{ value: 312_500_000, scriptpubkey_address: 'a' }, { value: 0 }] },
    match,
  );
  assert.deepEqual(r, { height: 900000, hash: 'h', ts: 1, bits: 386062550, pool: { id: 102, name: 'SpiderPool', slug: 'spiderpool' }, reward: 312_500_000, source: 'esplora' });
});

test('first run catches up in pages of 15 and stops at maxPagesPerRun', async () => {
  const db = makeD1();
  const mempool = fakeMempool(chainOf(START, START + 99));
  const r = await runUpdate({ db, mempool, esplora: noEsplora });
  assert.equal(r.source, 'mempool');
  assert.deepEqual(mempool.calls, ['tip', `blocks/${START + 14}`, `blocks/${START + 29}`, `blocks/${START + 44}`, `blocks/${START + 59}`]);
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM blocks').first()).n, 60);
  // next run continues where it left off and reaches the tip
  const m2 = fakeMempool(chainOf(START, START + 99));
  await runUpdate({ db, mempool: m2, esplora: noEsplora });
  assert.equal((await db.prepare('SELECT MAX(height) h FROM blocks').first()).h, START + 99);
});

test('no new block means a single tip request', async () => {
  const db = makeD1();
  const chain = chainOf(START, START + 10);
  await runUpdate({ db, mempool: fakeMempool(chain), esplora: noEsplora });
  const m = fakeMempool(chain);
  await runUpdate({ db, mempool: m, esplora: noEsplora });
  assert.deepEqual(m.calls, ['tip']);
});

test('ignores blocks before START_HEIGHT', async () => {
  const db = makeD1();
  await runUpdate({ db, mempool: fakeMempool(chainOf(START - 20, START + 2)), esplora: noEsplora, opts: { startHeight: START } });
  assert.equal((await db.prepare('SELECT MIN(height) h FROM blocks').first()).h, START);
});

test('leaderboard totals follow a reorg to the new pool', async () => {
  const db = makeD1();
  const chain = chainOf(START, START + 5);
  await runUpdate({ db, mempool: fakeMempool(chain), esplora: noEsplora });
  // tip block replaced by a SpiderPool block with the same height
  chain.set(START + 5, fromMempoolBlock(mempoolBlock(START + 5, { pool: 'SpiderPool', slug: 'spiderpool', id: 102, hash: 'other' })));
  chain.set(START + 6, fromMempoolBlock(mempoolBlock(START + 6)));
  await runUpdate({ db, mempool: fakeMempool(chain), esplora: noEsplora });
  const { pools, total } = await poolList(db, 0, 10);
  assert.equal(total, 2);
  const foundry = pools.find((p) => p.slug === 'foundryusa');
  const spider = pools.find((p) => p.slug === 'spiderpool');
  assert.equal(foundry.blocks, 6);
  assert.equal(foundry.total_rewards, 6 * 386062550);
  assert.equal(spider.blocks, 1);
  assert.equal(spider.extraData.totalReward, 315_000_000);
});

test('rate limit backs off mempool.space and uses esplora for a few blocks', async () => {
  const db = makeD1();
  await runUpdate({ db, mempool: fakeMempool(chainOf(START, START + 1)), esplora: noEsplora });
  const esploraCalls = [];
  const esplora = {
    tipHeight: async () => START + 10,
    blockAt: async (h) => {
      esploraCalls.push(h);
      return { ...fromMempoolBlock(mempoolBlock(h)), source: 'esplora' };
    },
  };
  const now = 1_000_000;
  const r = await runUpdate({ db, mempool: fakeMempool(new Map(), { failWith: new RateLimitError('x', 429) }), esplora, now });
  assert.equal(r.source, 'esplora');
  assert.deepEqual(esploraCalls, [START + 2, START + 3, START + 4]);
  // inside the backoff window mempool.space isn't touched at all
  const m = fakeMempool(chainOf(START, START + 10));
  await runUpdate({ db, mempool: m, esplora, now: now + 60_000 });
  assert.deepEqual(m.calls, []);
  // after it, mempool.space is used again and the backoff resets
  const m2 = fakeMempool(chainOf(START, START + 10));
  const r2 = await runUpdate({ db, mempool: m2, esplora, now: now + 3 * 60_000 });
  assert.equal(r2.source, 'mempool');
  assert.equal((await db.prepare('SELECT MAX(height) h FROM blocks').first()).h, START + 10);
});

test('repeated rate limits double the backoff up to the cap', async () => {
  const db = makeD1();
  const limited = fakeMempool(new Map(), { failWith: new RateLimitError('x', 429) });
  const esplora = { tipHeight: async () => START - 1, blockAt: async () => assert.fail() };
  let now = 0;
  const waits = [];
  for (let i = 0; i < 7; i++) {
    await runUpdate({ db, mempool: limited, esplora, now });
    const b = JSON.parse((await db.prepare("SELECT value FROM meta WHERE key='mempool_backoff'").first()).value);
    waits.push(b.ms / 60_000);
    now = b.until;
  }
  assert.deepEqual(waits, [2, 4, 8, 16, 32, 60, 60]);
});

test('API reads come back in the shapes the site already uses', async () => {
  const db = makeD1();
  await runUpdate({ db, mempool: fakeMempool(chainOf(START, START + 20)), esplora: noEsplora });
  const blocks = await latestBlocks(db, 15);
  assert.equal(blocks.length, 15);
  assert.equal(blocks[0].height, START + 20);
  assert.deepEqual(Object.keys(blocks[0]).sort(), ['bits', 'extras', 'height', 'id', 'timestamp']);
  assert.equal(blocks[0].extras.pool.slug, 'foundryusa');
  const pr = await poolRewards(db, 'foundryusa', 0, 10);
  assert.equal(pr.blocks.length, 10);
  assert.equal(pr.blocks[0].blck, START + 20);
  assert.equal(pr.analytics.total, 21);
  assert.equal(pr.analytics.total_rewards, 21 * 386062550);
});
