// One scheduled run: bring D1 up to the chain tip with as few public-API calls as possible.
//  - 1 request to learn the tip; nothing more if no new block (most runs).
//  - mempool.space returns 15 blocks per request, so one request covers each new block plus
//    the previous 14 (which also catches reorgs). Big gaps are paged, a few pages per run.
//  - On 429/503 or errors, mempool.space is left alone with a doubling backoff and up to a few
//    blocks come from Blockstream's Esplora instead. Missed blocks are filled on later runs.
import { getMeta, lastHeight, saveBlocks, setMetaStmt } from './store.js';
import { RateLimitError } from './sources.js';

export const DEFAULTS = {
  startHeight: 885588, // first block NAT went to the miner who found it
  maxPagesPerRun: 4, // mempool requests for catching up (15 blocks each)
  maxEsploraBlocksPerRun: 3,
  minBackoffMs: 2 * 60_000,
  maxBackoffMs: 60 * 60_000,
};

export async function runUpdate({ db, mempool, esplora, now = Date.now(), opts = {} }) {
  const o = { ...DEFAULTS, ...opts };
  const last = (await lastHeight(db)) ?? o.startHeight - 1;
  const backoff = (await getMeta(db, 'mempool_backoff')) || { until: 0, ms: 0 };
  const status = { ran_at: now, last_height_before: last };

  if (now >= backoff.until) {
    try {
      const tip = await mempool.tipHeight();
      status.tip = tip;
      const records = [];
      if (tip > last) {
        let h = Math.min(tip, last + 15);
        for (let page = 0; page < o.maxPagesPerRun; page++) {
          records.push(...(await mempool.blocksAt(h)));
          if (h >= tip) break;
          h = Math.min(tip, h + 15);
        }
      }
      const fresh = records.filter((r) => r.height >= o.startHeight);
      status.saved = await saveBlocks(db, fresh, [
        setMetaStmt(db, 'mempool_backoff', { until: 0, ms: 0 }),
        setMetaStmt(db, 'status', { ...status, source: 'mempool', error: null }),
      ]);
      return { ...status, source: 'mempool' };
    } catch (err) {
      const ms = Math.min(o.maxBackoffMs, Math.max(o.minBackoffMs, backoff.ms * 2));
      // Rate limits get the full backoff; other errors retry on the next run but still use the fallback now.
      const next = err instanceof RateLimitError ? { until: now + ms, ms } : { until: 0, ms: backoff.ms };
      await saveBlocks(db, [], [setMetaStmt(db, 'mempool_backoff', next)]);
      status.mempool_error = String(err.message || err);
    }
  } else {
    status.mempool_backoff_until = backoff.until;
  }

  // Fallback: a few blocks from Esplora.
  try {
    const tip = await esplora.tipHeight();
    status.tip = tip;
    const records = [];
    for (let h = last + 1; h <= tip && records.length < o.maxEsploraBlocksPerRun; h++) {
      records.push(await esplora.blockAt(h));
    }
    status.saved = await saveBlocks(db, records, [
      setMetaStmt(db, 'status', { ...status, source: 'esplora', error: null }),
    ]);
    return { ...status, source: 'esplora' };
  } catch (err) {
    status.error = String(err.message || err);
    await saveBlocks(db, [], [setMetaStmt(db, 'status', { ...status, source: null })]);
    return { ...status, source: null };
  }
}
