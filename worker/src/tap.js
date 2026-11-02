// Client for a Trac TAP reader (https://github.com/Trac-Systems/tap-reader) with REST enabled,
// reached through the token-protected proxy in /tap-reader-server. Every route answers { result }.
export const NAT_TICKER = 'dmt-nat';

export function tapSource({ base, token, fetchImpl = fetch }) {
  const root = base.replace(/\/+$/, '');
  const get = async (path) => {
    const res = await fetchImpl(`${root}${path}`, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'natgmi-block-api' },
    });
    if (!res.ok) throw new Error(`${res.status} from TAP reader ${path}`);
    return (await res.json()).result;
  };
  const t = encodeURIComponent(NAT_TICKER);
  return {
    currentBlock: async () => Number(await get('/getCurrentBlock')),
    balance: async (address) => toInt(await get(`/getBalance/${encodeURIComponent(address)}/${t}`)),
    holders: async () => Number(await get(`/getHoldersLength/${t}`)),
    mintLeft: async () => toInt(await get(`/getMintTokensLeft/${t}`)),
    deployment: async () => get(`/getDeployment/${t}`),
  };
}

// TAP amounts are big-integer strings; dmt-nat has 0 decimals and stays well under 2^53.
export function toInt(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = BigInt(String(v));
  if (n > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(`amount too large: ${v}`);
  return Number(n);
}
