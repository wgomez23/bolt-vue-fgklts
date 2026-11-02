# TAP reader server (miner NAT balances + token stats)

natgmi.com's block API can show each pool's current NAT balance and the token's supply and
holder count. Those come from a Trac TAP reader: it needs **no Bitcoin node and no ord**; it
syncs TAP data that Trac's indexers publish on their peer-to-peer network.

## Server

Any Ubuntu 24.04 machine with 4 vCPU, 8 GB RAM and 160 GB SSD (Trac asks for 2-4 cores,
8 GB RAM, 150 GB SSD). For example a Hetzner Cloud plan of that size, about $35-40 a month.

1. Create the server (Ubuntu 24.04, your SSH key).
2. Add a DNS **A record** `tap.natgmi.com` → the server's IP. If natgmi.com's DNS is on
   Cloudflare, leave the record **DNS only** (grey cloud) so Caddy can get its certificate.
3. Copy `setup.sh` to the server and run:

   ```sh
   sudo DOMAIN=tap.natgmi.com bash setup.sh
   ```

   It prints a token at the end. The first sync can take several hours.
4. Check it's catching up (the number should approach the current block height):

   ```sh
   curl -s -H "Authorization: Bearer $(sudo cat /etc/tap-reader/token)" https://tap.natgmi.com/getCurrentBlock
   ```

   Then compare one pool payout address's balance against Tapalytics' rich list:

   ```sh
   curl -s -H "Authorization: Bearer $(sudo cat /etc/tap-reader/token)" \
     https://tap.natgmi.com/getBalance/ADDRESS/dmt-nat
   ```

## Connect the Worker

In `worker/`:

```sh
wrangler secret put TAP_READER_TOKEN   # paste the token from setup.sh
```

Set `TAP_READER_URL = "https://tap.natgmi.com"` in `wrangler.toml`, then `wrangler deploy`.

Each 2-minute run then checks 25 payout addresses (stalest first, each re-checked after
6 hours) and, every 30 minutes, supply and holders. The leaderboard and pool popup show the
balances automatically; `GET /token` returns the token stats.

## Security

- The reader's REST API listens on 127.0.0.1 only.
- Caddy serves HTTPS and answers only `GET` requests with the bearer token, on the five read
  routes natgmi uses. Everything else gets 404.
- The firewall allows SSH, 80 and 443. The reader's peer-to-peer sync works outbound.

## Caveats

- The reader copies what Trac's indexers publish. If Trac stops publishing, balances stop
  updating (the site keeps the last values). This is not an independent indexer.
- It's beta software (v0.15.12, last updated June 2026).
- Later, the same script works on a dedicated Mac mini running Ubuntu, or the reader can be run
  directly with Node on macOS (`npm install && npm start` in a clone).
