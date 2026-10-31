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
  last_height       INTEGER
);
CREATE INDEX IF NOT EXISTS pools_by_rewards ON pools (total_rewards DESC);

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
