// Where block and pool data comes from.
// Set VITE_NAT_API (e.g. https://api.natgmi.com) to use the free Cloudflare block API in /worker.
// Leave it unset to keep the old mscribe backend (WebSocket + api.mscribe.io).
const raw = (import.meta.env.VITE_NAT_API as string | undefined) || ''

export const NAT_API = raw.replace(/\/+$/, '')
export const USE_NAT_API = NAT_API !== ''

const MSCRIBE_POOLS = 'https://api.mscribe.io/api/pools'

export function poolListUrl(offset: number, limit: number): string {
  const base = USE_NAT_API ? `${NAT_API}/pools` : `${MSCRIBE_POOLS}/list`
  return `${base}?offset=${offset}&limit=${limit}`
}

export function poolRewardsUrl(slug: string, offset: number, limit: number): string {
  const base = USE_NAT_API ? `${NAT_API}/pools` : `${MSCRIBE_POOLS}/rewards`
  return `${base}/${encodeURIComponent(slug)}?offset=${offset}&limit=${limit}`
}

export const latestBlocksUrl = (limit = 15): string => `${NAT_API}/blocks?limit=${limit}`

// The mscribe API links each reward to its transfer; the free API has only the block.
export function rewardLink(entry: { tx?: string | null; hash?: string; blck: number }): string {
  if (entry.tx) return `https://mempool.space/tx/${entry.tx}`
  return `https://mempool.space/block/${entry.hash || entry.blck}`
}
