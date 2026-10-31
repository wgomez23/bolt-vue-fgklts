// DMT-NAT mints one block's worth of NAT equal to the block's nBits field read as an integer
// (e.g. bits 0x1702d8d6 -> 386,062,550 NAT). The site has always shown `block.bits` as the NAT amount.
// mempool.space and Esplora return bits as that integer; Bitcoin Core RPC returns it as hex.

export function natFromBitsHex(hex) {
  if (!/^[0-9a-f]{8}$/i.test(hex)) throw new Error(`unexpected bits hex: ${hex}`);
  return parseInt(hex, 16);
}
