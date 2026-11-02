-- D1 schema for the natgmi block API.
-- One row per block since START_HEIGHT; NAT per block is the block's nBits read as an integer.
CREATE TABLE IF NOT EXISTS blocks (
  height     INTEGER PRIMARY KEY,
  hash       TEXT    NOT NULL,
  ts         INTEGER NOT NULL,
  bits       INTEGER NOT NULL,
  pool_id    INTEGER,
  pool_name  TEXT    NOT NULL,
  pool_slug  TEXT    NOT NULL,
  reward     INTEGER,            -- coinbase reward in sats (subsidy + fees), when known
  payout_addresses TEXT,         -- JSON array of the coinbase output addresses, for NAT balance lookups
  source     TEXT    NOT NULL    -- mempool | esplora | node
);
CREATE INDEX IF NOT EXISTS blocks_by_pool ON blocks (pool_slug, height DESC);

-- Running totals per pool, kept in step with `blocks` so the leaderboard never scans the whole table.
CREATE TABLE IF NOT EXISTS pools (
  slug              TEXT    PRIMARY KEY,
  id                INTEGER,
  name              TEXT    NOT NULL,
  blocks            INTEGER NOT NULL DEFAULT 0,
  total_rewards     INTEGER NOT NULL DEFAULT 0,   -- sum of NAT (bits) for blocks this pool found
  total_reward_sats INTEGER NOT NULL DEFAULT 0,
  last_height       INTEGER,
  balance           INTEGER,                      -- current NAT held by this pool's payout addresses (from the TAP reader)
  balance_checked_at INTEGER
);
CREATE INDEX IF NOT EXISTS pools_by_rewards ON pools (total_rewards DESC);

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Current dmt-nat balance of every coinbase payout address, refreshed a few at a time from the TAP reader.
CREATE TABLE IF NOT EXISTS address_balances (
  address    TEXT    PRIMARY KEY,
  pool_slug  TEXT    NOT NULL,
  balance    INTEGER,            -- null until first checked
  checked_at INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS address_balances_by_age ON address_balances (checked_at);
CREATE INDEX IF NOT EXISTS address_balances_by_pool ON address_balances (pool_slug);

-- For a database created before these columns existed:
--   ALTER TABLE blocks ADD COLUMN payout_addresses TEXT;
--   ALTER TABLE pools ADD COLUMN balance INTEGER;
--   ALTER TABLE pools ADD COLUMN balance_checked_at INTEGER;
