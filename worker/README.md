# natgmi block API (Cloudflare Worker + D1, free plan)

Replaces the parts of the mscribe backend that natgmi.com uses for its blocks strip, miner
leaderboard and pool popup. It shows, for every block since 885588, how much NAT it generated
(the block's `bits` as an integer) and which pool found it.

- A cron runs every 2 minutes. Most runs make **one** request to mempool.space (the tip height).
  When there's a new block, one more request returns it plus the previous 14, which also
  catches reorgs. That's roughly 870 requests a day.
- If mempool.space rate limits (429/503) or fails, it is left alone with a doubling backoff
  (2 min up to 60 min) and up to 3 blocks per run come from Blockstream's Esplora instead,
  with the pool matched from the coinbase using mempool's open pool list. Missed blocks are
  filled on later runs.
- Responses are cached at Cloudflare's edge, so visitors almost never touch D1.

## Endpoints

| Path | Returns | Used by |
| --- | --- | --- |
| `GET /blocks?limit=15` | `{ blocks: [{ id, height, timestamp, bits, extras: { pool, reward } }] }` | blocks strip |
| `GET /pools?offset&limit` | `{ success, data: { pools, total } }` | miner leaderboard |
| `GET /pools/:slug?offset&limit` | `{ success, blocks, analytics }` | pool popup |
| `GET /health` | 200, or 503 if the newest block is over two hours old | uptime monitor |

Not covered (still from api.mscribe.io or hidden): pool NAT **balances**, the per-reward
valid/invalid status, and token stats (`/api/tokens/all`: supply, holders, floor price).
Those need a TAP indexer or another data source.

## Free-plan budget

| Limit (Workers Free) | Use |
| --- | --- |
| 100k Worker requests/day | ~720 cron runs + site traffic (most served from edge cache) |
| D1 100k rows written/day | ~1.5k/day ongoing; **the backfill is ~2 rows per block, so split it** |
| D1 5M rows read/day, 5 GB | well under; the whole history is a few MB |

## Set up (about 30 minutes)

```sh
cd worker
npm install -g wrangler        # or use npx wrangler
wrangler login
wrangler d1 create natgmi-blocks   # copy the database_id into wrangler.toml
wrangler d1 execute natgmi-blocks --remote --file schema.sql
```

### Backfill history (once)

Run this from the machine with the current Bitcoin Core node **before** that node is turned
off (a pruned node can't serve old blocks):

```sh
BITCOIN_RPC_URL=http://USER:PASS@127.0.0.1:8332 node scripts/backfill.mjs --source node --from 885588 --to 925587
```

Or with no node at all (slow, about 1 request every 3 s, roughly 5 hours for everything):

```sh
node scripts/backfill.mjs --source mempool --from 885588 --to 925587
```

Load the file it writes. Keep each day's load under about 45,000 blocks (D1 free writes reset
at 00:00 UTC), so do the rest the next day with `--from 925588`:

```sh
wrangler d1 execute natgmi-blocks --remote --file backfill-885588-925587.sql
```

Each file ends by rebuilding the per-pool totals from the blocks table, so loading in pieces
is fine.

### Deploy

```sh
wrangler deploy
```

Then in the Cloudflare dashboard add a custom domain for the Worker, e.g. `api.natgmi.com`
(the edge cache doesn't work on `*.workers.dev`). Point a free uptime monitor at
`https://api.natgmi.com/health`.

### Switch the site

Build the site with `VITE_NAT_API=https://api.natgmi.com`. With it unset the site keeps using
mscribe exactly as before. The site can stay on Heroku or move to Cloudflare Pages (free):
build command `npm run build`, output `dist`. `public/_headers` carries the nginx headers;
Pages serves `natpaper.html` at `/natpaper` and falls back to `index.html` for other routes.

Run both for a week and compare the leaderboard against api.mscribe.io before turning
anything off.

## Tests

```sh
npm test   # Node 22+, uses node:sqlite as a stand-in for D1
```
