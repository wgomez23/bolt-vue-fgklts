#!/usr/bin/env bash
# Sets up a Trac TAP reader (https://github.com/Trac-Systems/tap-reader) on a fresh Ubuntu 24.04
# server for natgmi.com's miner balances and NAT token stats.
#
#   sudo DOMAIN=tap.natgmi.com bash setup.sh
#
# Before running: point DOMAIN's DNS A record at this server, so Caddy can get an HTTPS certificate.
# What it does:
#   - installs Node 22 (official tarball, checksum verified), git, Caddy and a firewall
#   - runs the reader as an unprivileged "tap" user under systemd, REST bound to localhost only
#   - puts Caddy in front on HTTPS, answering only GET requests that carry the bearer token,
#     and only the few read routes natgmi uses
#   - prints the token at the end; give it to the Worker with: wrangler secret put TAP_READER_TOKEN
set -euo pipefail

DOMAIN="${DOMAIN:?Set DOMAIN, e.g. DOMAIN=tap.natgmi.com}"
NODE_VERSION="${NODE_VERSION:-22.14.0}"
TAP_READER_COMMIT="${TAP_READER_COMMIT:-7c361745febeb95bab37f74de9df9952e071351a}" # main as of 2026-06-03
APP_DIR=/opt/tap-reader
TOKEN_FILE=/etc/tap-reader/token

[ "$(id -u)" = 0 ] || { echo "Run as root (sudo)." >&2; exit 1; }

echo "== Packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends git curl ca-certificates xz-utils ufw caddy build-essential python3

echo "== Node $NODE_VERSION"
if ! node --version 2>/dev/null | grep -q "^v$NODE_VERSION$"; then
  tmp=$(mktemp -d)
  arch=$(dpkg --print-architecture); case "$arch" in amd64) narch=x64 ;; arm64) narch=arm64 ;; *) echo "unsupported arch $arch" >&2; exit 1 ;; esac
  file="node-v$NODE_VERSION-linux-$narch.tar.xz"
  curl -fsSLo "$tmp/$file" "https://nodejs.org/dist/v$NODE_VERSION/$file"
  curl -fsSLo "$tmp/SHASUMS256.txt" "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt"
  (cd "$tmp" && grep " $file\$" SHASUMS256.txt | sha256sum -c -)
  tar -xJf "$tmp/$file" -C /usr/local --strip-components=1
  rm -rf "$tmp"
fi
node --version

echo "== TAP reader"
id tap >/dev/null 2>&1 || useradd --system --create-home --home-dir /var/lib/tap --shell /usr/sbin/nologin tap
if [ ! -d "$APP_DIR/.git" ]; then
  install -d -o tap -g tap "$APP_DIR"
  sudo -u tap git clone https://github.com/Trac-Systems/tap-reader.git "$APP_DIR"
fi
sudo -u tap git -C "$APP_DIR" fetch --quiet origin
sudo -u tap git -C "$APP_DIR" checkout --quiet "$TAP_READER_COMMIT"
sudo -u tap bash -c "cd '$APP_DIR' && npm install --omit=dev --no-audit --no-fund"

# local.json overrides config/default.json (node-config); the mainnet channel stays as Trac ships it.
sudo -u tap tee "$APP_DIR/config/local.json" >/dev/null <<'JSON'
{
  "enableRest": true,
  "enableRestApiDocs": false,
  "restPort": 5099,
  "host": "127.0.0.1",
  "enableWebsockets": false,
  "enableBlockDownloader": false
}
JSON

cat > /etc/systemd/system/tap-reader.service <<UNIT
[Unit]
Description=Trac TAP reader (natgmi)
After=network-online.target
Wants=network-online.target

[Service]
User=tap
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/node src/main.mjs
Restart=always
RestartSec=10
Environment=NODE_ENV=production
NoNewPrivileges=true
ProtectSystem=full
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now tap-reader

echo "== HTTPS proxy"
mkdir -p /etc/tap-reader
[ -s "$TOKEN_FILE" ] || (umask 077; openssl rand -hex 32 > "$TOKEN_FILE")
TOKEN=$(cat "$TOKEN_FILE")
cat > /etc/caddy/Caddyfile <<CADDY
$DOMAIN {
	@allowed {
		method GET
		header Authorization "Bearer $TOKEN"
		path /getBalance/* /getHoldersLength/* /getDeployment/* /getMintTokensLeft/* /getCurrentBlock
	}
	handle @allowed {
		reverse_proxy 127.0.0.1:5099
	}
	respond 404
}
CADDY
chmod 640 /etc/caddy/Caddyfile
chgrp caddy /etc/caddy/Caddyfile
systemctl restart caddy

echo "== Firewall"
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

cat <<DONE

Done. The reader is syncing in the background; the first sync can take hours.
  Watch it:        journalctl -u tap-reader -f
  Check progress:  curl -s -H "Authorization: Bearer \$(cat $TOKEN_FILE)" https://$DOMAIN/getCurrentBlock

Worker settings (run in worker/):
  TAP_READER_URL = "https://$DOMAIN"   (in wrangler.toml)
  wrangler secret put TAP_READER_TOKEN   and paste:
$TOKEN
DONE
