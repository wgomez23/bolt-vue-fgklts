// Decimal places needed to show `v` (0 < v < 1) to `sig` significant digits, e.g. 4e-8 -> 9 ("0.000000040")
export function sigDecimals(v: number, sig = 2): number {
  return Math.min(20, Math.max(0, sig - 1 - Math.floor(Math.log10(v))))
}

// Percent with full precision for small values. `compact` truncates tiny values for tight spaces.
export function fmtPct(p: number, compact = false): string {
  if (!(p > 0)) return '0%'
  if (p >= 10) return p.toFixed(0) + '%'
  if (p >= 1) return p.toFixed(1) + '%'
  if (p >= 0.01) return p.toFixed(2) + '%'
  if (compact && p < 1e-4) return '<0.0001%'
  return p.toFixed(sigDecimals(p)) + '%'
}
