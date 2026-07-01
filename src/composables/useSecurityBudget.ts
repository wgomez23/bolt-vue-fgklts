import { reactive, computed } from 'vue'

// Security-budget model, ported faithfully from the nat-explorable explorable
// (https://nat-explorable.pages.dev). All math is price/series logic only;
// rendering is done natively with echarts in the Vue components.

// ---------- constants (2026-05 snapshot) ----------
export const BTC_PRICE = 59901        // USD snapshot; Today mode overrides with live spot when available
export const SUBSIDY_BTC_24 = 3.125   // BTC/block after the 4th halving (block 840,000)
export const FEE_LO = 1359            // USD/block, 24h average baseline
export const FEE_HI = 28000           // USD/block, congestion-spike scenario
export const NAT_BASE_USD = 32.68     // USD/block at base market cap
export const MCAP_BASE = 32.9         // $M, today's NAT market cap
export const BLOCKS_PER_YEAR = 52560  // 144 blocks/day x 365
export const SUPPLY_BTC = 21e6

export const YEAR_MIN = 2024
export const YEAR_MAX = 2140

// Power Law (Santostasi/Burger), calibrated to pass through today's anchor. Projection, not forecast.
const PL_GENESIS = 2009
const PL_T0 = 2026
const PL_EXP = 5.8

export type PriceModel = 'today' | 'custom' | 'pl'
export type NatScale = 'abs' | 'rel'
export type FeeScenario = 'lo' | 'hi'

export interface SBState {
  year: number
  nat: boolean
  fee: FeeScenario
  mcapSlider: number        // 0..1000
  priceModel: PriceModel
  natScale: NatScale
  showSecurity: boolean       // Power Law chart: overlay the security-% decay line
  customPrice: number
  livePrice: number | null  // live spot when available
}

export function useSecurityBudget() {
  const state = reactive<SBState>({
    year: 2140,
    nat: true,
    fee: 'lo',
    mcapSlider: 0,
    priceModel: 'today',
    natScale: 'abs',
    showSecurity: false,
    customPrice: 150000,
    livePrice: null,
  })

  // ---------- model ----------
  const halvings = (year: number) => Math.floor((year - 2024) / 4)

  function subsidyUSD(year: number): number {
    let h = halvings(year)
    if (h < 0) h = 0
    let btc = SUBSIDY_BTC_24 / Math.pow(2, h)
    if (year >= 2140) btc = 0   // emission effectively ends ~2140
    return btc * BTC_PRICE
  }

  const feeUSD = () => (state.fee === 'hi' ? FEE_HI : FEE_LO)

  function powerLawMult(year: number): number {
    const d = Math.max(1, year - PL_GENESIS)
    const d0 = PL_T0 - PL_GENESIS
    return Math.pow(d / d0, PL_EXP)
  }
  const powerLawPrice = (year: number) => BTC_PRICE * powerLawMult(year)

  // circulating supply by year (BTC), halving-consistent
  function supplyAt(year: number): number {
    return year <= 2009 ? 1 : SUPPLY_BTC * (1 - Math.pow(2, -(year - 2008) / 4))
  }

  // raw block subsidy in BTC (price-independent), full halving schedule incl. history.
  // This is the "halving staircase": miner issuance is cut in half every ~4 years
  // regardless of price, collapsing toward 0 by ~2140.
  function subsidyBtcAt(year: number): number {
    if (year >= 2140) return 0
    const h = Math.floor((year - 2024) / 4)
    return SUBSIDY_BTC_24 / Math.pow(2, h)
  }

  // staircase points across the Power Law chart span (2011..2140), flat at 0 past 2140
  function subsidyBtcStep(): [number, number][] {
    const pts: [number, number][] = [[2011, subsidyBtcAt(2011)]]
    let prev = 2011
    for (let hy = 2012; hy <= 2140; hy += 4) {
      pts.push([hy, subsidyBtcAt(prev)])   // hold prior level up to the halving
      pts.push([hy, subsidyBtcAt(hy)])     // vertical step down
      prev = hy
    }
    pts.push([2140, 0])
    return pts
  }

  function priceMult(): number {
    if (state.priceModel === 'pl') return powerLawMult(state.year)
    if (state.priceModel === 'custom') return state.customPrice / BTC_PRICE
    return state.livePrice ? state.livePrice / BTC_PRICE : 1
  }

  const btcMcapUSD = () => BTC_PRICE * priceMult() * supplyAt(state.year)

  function mcapMult(): number {
    // Slider end (1000) maps to 100% of BTC market cap in both modes.
    let capMult = btcMcapUSD() / (MCAP_BASE * 1e6)
    if (!(capMult > 1)) capMult = 1
    const t = state.mcapSlider / 1000
    const m = state.natScale === 'rel'
      ? (1e-5 * Math.pow(1e5, t)) * capMult    // % of BTC: log 0.001% .. 100%
      : Math.pow(capMult, t)                   // $ value: log $32.9M .. 100% of BTC
    return Math.min(m, capMult)
  }

  const natMcapM = () => MCAP_BASE * mcapMult()                  // $M
  const natUSD = () => (state.nat ? NAT_BASE_USD * mcapMult() : 0)

  // annual security spend as % of total BTC value, PRICE-INDEPENDENT
  function securitySharePct(year: number): number {
    const h = halvings(year)
    const subBtc = year >= 2140 ? 0 : SUBSIDY_BTC_24 / Math.pow(2, h)
    const feeBtc = feeUSD() / BTC_PRICE
    const annualBtc = (subBtc + feeBtc) * BLOCKS_PER_YEAR
    return (annualBtc / supplyAt(year)) * 100
  }

  // ----- Power Law view: USD-equivalent security share, evaluated PER YEAR along
  // the power-law price path. Subsidy $ halves, fees are a fixed $ (share shrinks as
  // price climbs), and $NAT (a % of BTC market cap) contributes a constant share that
  // the slider scales directly. Verified: BTC market cap cancels in the NAT term, so
  // NAT holds a flat floor and the slider raises it. Nothing is nudged arbitrarily.
  const btcMcapAtPL = (year: number) => powerLawPrice(year) * supplyAt(year)
  function capMultAt(year: number): number {
    const c = btcMcapAtPL(year) / (MCAP_BASE * 1e6)
    return c > 1 ? c : 1
  }
  function mcapMultAt(year: number): number {
    const capMult = capMultAt(year)
    const t = state.mcapSlider / 1000
    const m = state.natScale === 'rel'
      ? (1e-5 * Math.pow(1e5, t)) * capMult
      : Math.pow(capMult, t)
    return Math.min(m, capMult)
  }
  const natUSDAt = (year: number) => NAT_BASE_USD * mcapMultAt(year)   // ungated (caller decides)
  function securitySharePctUSD(year: number, includeNat: boolean): number {
    const price = powerLawPrice(year)
    const subUSD = subsidyBtcAt(year) * price
    const natUSDv = includeNat ? natUSDAt(year) : 0
    const annualUSD = (subUSD + feeUSD() + natUSDv) * BLOCKS_PER_YEAR
    return (annualUSD / (price * supplyAt(year))) * 100
  }

  // ---------- series for the main chart (log $/block over years) ----------
  // subsidy step path across the full timeline (price-scaled)
  function subsidyStepSeries(): [number, number][] {
    const pm = priceMult()
    const pts: [number, number][] = []
    let year = YEAR_MIN
    while (year <= YEAR_MAX) {
      const h = Math.floor((year - 2024) / 4)
      const btc = SUBSIDY_BTC_24 / Math.pow(2, h)
      const usd = (year >= 2140 ? 0 : btc * BTC_PRICE) * pm
      pts.push([year, usd])
      let nextBoundary = 2024 + (h + 1) * 4
      if (nextBoundary > YEAR_MAX) nextBoundary = YEAR_MAX
      pts.push([nextBoundary, usd])
      year = nextBoundary
      if (nextBoundary >= YEAR_MAX) break
    }
    return pts
  }

  const subsidySeries = computed(() => subsidyStepSeries())
  const subsidyBtcSeries = computed(() => subsidyBtcStep())
  const feeLevel = computed(() => feeUSD())                       // fixed USD (share shrinks as price climbs); do NOT scale by price
  const natLevel = computed(() => natUSD())                      // flat across years

  // dynamic y-axis ceiling so price-scaled subsidy never clips
  const yMax = computed(() => {
    let maxSub = 0
    for (const p of subsidySeries.value) if (p[1] > maxSub) maxSub = p[1]
    const ladder = [300000, 1e6, 3e6, 1e7, 3e7]
    for (const l of ladder) if (maxSub <= l) return l
    return ladder[ladder.length - 1]
  })

  // selected-year readouts
  const readout = computed(() => {
    const sub = subsidyUSD(state.year) * priceMult()
    const fee = feeLevel.value
    const nat = natLevel.value
    const total = sub + fee + nat
    return {
      year: state.year,
      subsidy: sub,
      fees: fee,
      nat,
      total,
      btcMcap: btcMcapUSD(),
      annualSecurity: total * BLOCKS_PER_YEAR,
      natSharePct: total > 0 ? (nat / total) * 100 : 0,
      natMcapM: natMcapM(),
      securitySharePct: securitySharePct(state.year),
      btcPrice: BTC_PRICE * priceMult(),
    }
  })

  // power-law projection panel
  const powerLaw = computed(() => ({
    price: powerLawPrice(state.year),
    mcap: powerLawPrice(state.year) * supplyAt(state.year),
    securitySharePct: securitySharePct(state.year),
  }))

  // ---------- live BTC spot ----------
  async function fetchLivePrice(): Promise<void> {
    const tryFetch = async (url: string, pick: (j: any) => number | null) => {
      try {
        const r = await fetch(url, { cache: 'no-store' })
        if (!r.ok) return null
        return pick(await r.json())
      } catch {
        return null
      }
    }
    let px = await tryFetch('https://mempool.space/api/v1/prices', (j) =>
      j && typeof j.USD === 'number' ? j.USD : null
    )
    if (!px) {
      px = await tryFetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', (j) => {
        const a = j?.data?.amount
        return a ? Number(a) : null
      })
    }
    if (px && isFinite(px) && px > 0) state.livePrice = px
  }

  return {
    state,
    // model fns
    subsidyUSD, feeUSD, powerLawMult, powerLawPrice, supplyAt, subsidyBtcAt,
    priceMult, btcMcapUSD, mcapMult, natMcapM, natUSD, securitySharePct, securitySharePctUSD, natUSDAt,
    // series + computed
    subsidySeries, subsidyBtcSeries, feeLevel, natLevel, yMax, readout, powerLaw,
    fetchLivePrice,
  }
}
