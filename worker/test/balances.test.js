import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeD1 } from './d1-shim.js';
import { fakeMempool, mempoolBlock } from './fixtures.js';
import { fromMempoolBlock } from '../src/sources.js';
import { runUpdate } from '../src/update.js';
import { refreshBalances } from '../src/balances.js';
import { poolList, poolRewards, getMeta } from '../src/store.js';
import { tapSource, toInt } from '../src/tap.js';

const START = 885588;
const noEsplora = { tipHeight: async () => { throw new Error('no'); } };

function fakeTap(balances, { failAfter = Infinity } = {}) {
  const calls = [];
  return {
    calls,
    balance: async (a) => {
      calls.push(a);
      if (calls.length > failAfter) throw new Error('reader down');
      return balances[a] ?? 0;
    },
    deployment: async () => ({ max: '1000000000000000' }),
    mintLeft: async () => 600_000_000_000_000,
    holders: async () => 22569,
    currentBlock: async () => 925000,
  };
}

async function seeded() {
  const db = makeD1();
  const chain = new Map();
  for (let h = START; h < START + 6; h++) {
    const opts = h % 3 === 0 ? { pool: 'AntPool', slug: 'antpool', id: 44 } : { payout: h % 2 ? 'bc1qf2' : 'bc1qf1' };
    chain.set(h, fromMempoolBlock(mempoolBlock(h, opts)));
  }
  await runUpdate({ db, mempool: fakeMempool(chain), esplora: noEsplora });
  return db;
}

test('balances roll up per pool, a few addresses per run', async () => {
  const db = await seeded();
  const tap = fakeTap({ bc1qf1: 100, bc1qf2: 50, bc1qantpool: 7 });
  let now = 1_000_000_000_000;
  const r1 = await refreshBalances({ db, tap, now, opts: { perRun: 2 } });
  assert.equal(r1.checked, 2);
  const r2 = await refreshBalances({ db, tap, now, opts: { perRun: 2 } });
  assert.equal(r2.checked, 1); // only 3 addresses
  const { pools } = await poolList(db, 0, 10);
  const by = Object.fromEntries(pools.map((p) => [p.slug, p.balance]));
  assert.deepEqual(by, { foundryusa: 150, antpool: 7 });
  assert.equal((await poolRewards(db, 'foundryusa', 0, 5)).analytics.balance, 150);

  // Nothing is due again until 6 hours pass; then a change moves the pool total by the difference.
  assert.equal((await refreshBalances({ db, tap, now: now + 60_000 })).checked, 0);
  const tap2 = fakeTap({ bc1qf1: 40, bc1qf2: 50, bc1qantpool: 7 });
  await refreshBalances({ db, tap: tap2, now: now + 7 * 3600_000 });
  const after = Object.fromEntries((await poolList(db, 0, 10)).pools.map((p) => [p.slug, p.balance]));
  assert.deepEqual(after, { foundryusa: 90, antpool: 7 });
});

test('a reader outage stops the run and keeps the last good balances', async () => {
  const db = await seeded();
  const r = await refreshBalances({ db, tap: fakeTap({ bc1qf1: 100 }, { failAfter: 1 }), now: 1_000_000_000_000 });
  assert.equal(r.checked, 1);
  assert.match(r.error, /reader down/);
  assert.equal(await getMeta(db, 'token'), null); // token stats skipped while the reader is failing
});

test('token stats are stored with supply inputs and holder count', async () => {
  const db = await seeded();
  await refreshBalances({ db, tap: fakeTap({}), now: 1_000_000_000_000 });
  const t = await getMeta(db, 'token');
  assert.equal(t.holders, 22569);
  assert.equal(t.mint_left, 600_000_000_000_000);
  assert.equal(t.max, '1000000000000000');
});

test('TAP reader client sends the token and parses { result }', async () => {
  const seen = [];
  const fetchImpl = async (url, init) => {
    seen.push([url, init.headers.Authorization]);
    return { ok: true, json: async () => ({ result: '9518323798413' }) };
  };
  const tap = tapSource({ base: 'https://tap.example/', token: 's3cret', fetchImpl });
  assert.equal(await tap.balance('bc1qabc'), 9518323798413);
  assert.deepEqual(seen[0], ['https://tap.example/getBalance/bc1qabc/dmt-nat', 'Bearer s3cret']);
  assert.equal(toInt(null), 0);
  assert.throws(() => toInt('99999999999999999999'));
});
