// Keeps miner NAT balances fresh from the TAP reader, a few addresses per cron run so each run
// stays well under the free plan's 50 outbound requests.
import { setMetaStmt } from './store.js';
import { NAT_TICKER } from './tap.js';

export const BALANCE_DEFAULTS = {
  perRun: 25, // address lookups per run
  maxAgeMs: 6 * 60 * 60_000, // re-check an address after 6 hours
  tokenEveryMs: 30 * 60_000, // supply and holder count every 30 minutes
};

export async function refreshBalances({ db, tap, now = Date.now(), opts = {} }) {
  const o = { ...BALANCE_DEFAULTS, ...opts };
  const out = { checked: 0, errors: 0 };

  // 1. Look up the stalest payout addresses (they're registered as blocks are saved).
  const { results: due } = await db
    .prepare('SELECT address, pool_slug, balance FROM address_balances WHERE checked_at < ? ORDER BY checked_at LIMIT ?')
    .bind(now - o.maxAgeMs, o.perRun)
    .all();
  const stmts = [];
  const delta = new Map(); // pool -> change in NAT held
  for (const row of due) {
    let bal;
    try {
      bal = await tap.balance(row.address);
    } catch (e) {
      out.errors++;
      out.error = String(e.message || e);
      break; // reader down; try again next run
    }
    stmts.push(db.prepare('UPDATE address_balances SET balance = ?, checked_at = ? WHERE address = ?').bind(bal, now, row.address));
    delta.set(row.pool_slug, (delta.get(row.pool_slug) || 0) + bal - (row.balance || 0));
    out.checked++;
  }

  // 2. Move pool totals by the change, so no run has to re-add every address.
  for (const [slug, d] of delta) {
    stmts.push(
      db.prepare('UPDATE pools SET balance = COALESCE(balance, 0) + ?, balance_checked_at = ? WHERE slug = ?').bind(d, now, slug),
    );
  }

  // 3. Token stats now and then.
  const token = await db.prepare("SELECT value FROM meta WHERE key = 'token'").first();
  const last = token ? JSON.parse(token.value).checked_at : 0;
  if (!out.error && now - last >= o.tokenEveryMs) {
    try {
      const [deployment, mintLeft, holders, block] = await Promise.all([
        tap.deployment(),
        tap.mintLeft(),
        tap.holders(),
        tap.currentBlock(),
      ]);
      stmts.push(
        setMetaStmt(db, 'token', {
          ticker: NAT_TICKER,
          max: deployment?.max ?? null,
          mint_left: mintLeft,
          holders, // includes addresses that now hold 0
          reader_block: block,
          checked_at: now,
        }),
      );
    } catch (e) {
      out.error = String(e.message || e);
    }
  }
  if (stmts.length) await db.batch(stmts);
  return out;
}
