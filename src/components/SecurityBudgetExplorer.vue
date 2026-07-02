<template>
  <div class="w-full">
    <!-- TOUR CTA -->
    <div v-if="!tour.active" class="mb-4">
      <button @click="startTour"
        class="group w-full flex items-center gap-3 rounded-xl border border-[#00FF94]/30 bg-[#00FF94]/[0.06] px-4 py-3 text-left transition-colors hover:bg-[#00FF94]/[0.10]">
        <span class="tour-pulse flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00FF94] text-black text-sm">&#9654;</span>
        <span class="min-w-0">
          <span class="block text-sm font-semibold text-gray-100">New here? Take the 90-second tour</span>
          <span class="block text-xs text-gray-400">The whole argument, hands-free. Pause or take over anytime.</span>
        </span>
        <span class="ml-auto hidden sm:block text-[#00FF94] text-sm font-medium">Start tour &rarr;</span>
      </button>
    </div>

    <!-- FULL-WIDTH CHART -->
    <div data-tour="chart" class="w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
      <PowerLawChart
        v-if="state.priceModel === 'pl'"
        :power-law-price="powerLawPrice"
        :security-usd="securitySharePctUSD"
        :subsidy-btc-series="subsidyBtcSeries"
        :show-security="state.showSecurity"
        :nat-on="state.nat"
        :mcap-slider="state.mcapSlider"
        :nat-scale="state.natScale"
        :year="state.year"
        :fee="state.fee"
        :height="chartHeight"
      />
      <SecurityBudgetChart
        v-else
        :subsidy-series="subsidySeries"
        :fee-level="feeLevel"
        :nat-level="natLevel"
        :nat-enabled="state.nat"
        :y-max="yMax"
        :year="state.year"
        :height="chartHeight"
      />
    </div>

    <!-- TOGGLES: scenario config, right below the chart -->
    <div class="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 flex flex-wrap gap-x-8 gap-y-4 items-start">
      <div data-tour="nat">
        <div class="text-sm font-medium text-gray-200 mb-2">NAT layer</div>
        <div class="flex gap-2">
          <button @click="state.nat = false" :class="segBtn(!state.nat)">Without NAT</button>
          <button @click="state.nat = true" :class="segBtn(state.nat)">With NAT</button>
        </div>
      </div>
      <div>
        <div class="text-sm font-medium text-gray-200 mb-2">Fee scenario</div>
        <div class="flex gap-2">
          <button @click="state.fee = 'lo'" :class="segBtn(state.fee === 'lo')">Baseline</button>
          <button @click="state.fee = 'hi'" :class="segBtn(state.fee === 'hi')">Congestion</button>
        </div>
      </div>
      <div>
        <div class="text-sm font-medium text-gray-200 mb-2">NAT scale</div>
        <div class="flex gap-2">
          <button @click="state.natScale = 'abs'" :class="segBtn(state.natScale === 'abs')">$ value</button>
          <button @click="state.natScale = 'rel'" :class="segBtn(state.natScale === 'rel')">% of BTC</button>
        </div>
      </div>
      <div v-if="state.priceModel === 'pl'">
        <div class="text-sm font-medium text-gray-200 mb-2">Security % line</div>
        <div class="flex gap-2">
          <button @click="state.showSecurity = false" :class="segBtn(!state.showSecurity)">Hide</button>
          <button @click="state.showSecurity = true" :class="segBtn(state.showSecurity)">Show</button>
        </div>
      </div>
      <div>
        <div class="text-sm font-medium text-gray-200 mb-2">Bitcoin price</div>
        <div class="flex gap-2">
          <button @click="state.priceModel = 'today'" :class="segBtn(state.priceModel === 'today')">
            Today<span v-if="state.livePrice" class="ml-1 text-[10px] text-gray-400">({{ fmtUSD(state.livePrice) }})</span>
          </button>
          <button @click="state.priceModel = 'custom'" :class="segBtn(state.priceModel === 'custom')">Custom</button>
          <button @click="state.priceModel = 'pl'" :class="segBtn(state.priceModel === 'pl')">Power law</button>
        </div>
        <div v-if="state.priceModel === 'custom'" class="flex items-center gap-2 mt-2">
          <span class="text-gray-400">$</span>
          <input type="number" v-model.number="state.customPrice" min="1000" step="1000"
            class="w-40 rounded bg-black/30 border border-white/10 px-2 py-1 font-mono text-gray-100" />
        </div>
        <div v-else-if="state.priceModel === 'pl'" class="text-sm text-gray-400 mt-2">
          Projected BTC price in {{ state.year }}: <span class="font-mono text-gray-100">{{ fmtUSD(powerLaw.price) }}</span>
        </div>
      </div>
    </div>

    <!-- SLIDERS: the two primary controls that drive the data below -->
    <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div data-tour="year" class="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-200">Year</label>
          <span class="font-mono text-[#F7931A]">{{ state.year }}</span>
        </div>
        <input type="range" :min="2026" :max="2140" step="1" v-model.number="state.year" class="sb-range w-full" />
        <div class="flex justify-between text-[11px] text-gray-500 mt-1"><span>2026</span><span>2140</span></div>
      </div>
      <div data-tour="mcap" class="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-200">$NAT market cap</label>
          <span class="font-mono text-[#00FF94]">{{ natMcapLabel }}</span>
        </div>
        <input type="range" :min="0" :max="1000" step="1" v-model.number="state.mcapSlider" :disabled="!state.nat" class="sb-range w-full disabled:opacity-40" />
        <div class="flex justify-between text-[11px] text-gray-500 mt-1">
          <span>{{ state.natScale === 'rel' ? '0.001% of BTC' : '$32.9M' }}</span>
          <span>100% of BTC</span>
        </div>
      </div>
    </div>

    <!-- HERO STAT: $NAT share of the security budget -->
    <div data-tour="natshare"
      class="mt-4 rounded-xl border p-5 flex flex-col items-center text-center transition-colors"
      :class="state.nat ? 'border-[#00FF94]/40 bg-[#00FF94]/[0.06]' : 'border-white/10 bg-white/[0.02]'">
      <div class="font-mono text-4xl sm:text-5xl font-bold leading-none" :style="{ color: state.nat ? '#00FF94' : '#e0533d' }">
        {{ fmtPct(readout.natSharePct) }}
      </div>
      <div class="mt-2 text-sm text-gray-300">of the security budget is <span class="font-semibold text-[#00FF94]">$NAT</span></div>
    </div>

    <!-- DATA TABLE: what the user reads as the sliders move -->
    <div data-tour="table" class="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 overflow-x-auto">
      <table class="w-full min-w-[760px] border-collapse">
        <thead>
          <tr class="border-b border-white/10">
            <th class="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400 align-bottom"></th>
            <th v-for="h in colHeaders" :key="h"
              class="px-3 py-2 text-right text-[11px] font-medium uppercase tracking-wide text-gray-400 align-bottom">
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in assetRows" :key="row.label" class="border-b border-white/5 last:border-0" :class="row.total ? 'border-t border-white/15' : ''">
            <td class="px-3 py-3 text-sm font-semibold whitespace-nowrap" :style="{ color: row.color }">{{ row.label }}</td>
            <td v-for="(c, i) in row.cells" :key="i"
              class="px-3 py-3 text-right font-mono text-base font-semibold whitespace-nowrap"
              :style="{ color: c === '\u2014' ? '#525252' : row.color }">
              {{ c }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-4 text-[11px] leading-relaxed text-gray-500">
      Scenarios, not forecasts. $NAT's contribution is demand-driven and reflexive, not guaranteed. Power-law price is a
      long-run projection calibrated to today's anchor. Model ported from the NAT security-budget explorable.
    </p>

    <!-- TOUR OVERLAY -->
    <div v-if="tour.active" class="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 pointer-events-none">
      <div class="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-white/10 bg-[#0b0b0d]/95 backdrop-blur p-4 shadow-2xl">
        <div class="h-1 w-full rounded-full bg-white/10 overflow-hidden mb-3">
          <div class="h-full rounded-full bg-[#00FF94] transition-all duration-500" :style="{ width: barPct + '%' }"></div>
        </div>
        <div class="flex items-start gap-3">
          <span v-if="tourSteps[tour.step].badge"
            class="shrink-0 rounded bg-[#00FF94]/15 text-[#00FF94] text-[10px] font-bold px-2 py-1 tracking-wide">
            {{ tourSteps[tour.step].badge }}
          </span>
          <p class="text-sm leading-relaxed text-gray-100">{{ tourSteps[tour.step].caption }}</p>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <span class="text-[11px] text-gray-500 font-mono">{{ tour.step + 1 }} / {{ tourSteps.length }}</span>
          <div class="ml-auto flex items-center gap-2">
            <button @click="prev" :disabled="tour.step === 0" class="tour-btn disabled:opacity-30">Back</button>
            <button @click="togglePlay" class="tour-btn">{{ tour.playing ? 'Pause' : 'Play' }}</button>
            <button v-if="tour.step < tourSteps.length - 1" @click="next()" class="tour-btn-primary">Next</button>
            <button @click="exitTour" class="tour-btn">{{ tour.step === tourSteps.length - 1 ? 'Done' : 'Exit' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, reactive, nextTick } from 'vue'
import SecurityBudgetChart from './SecurityBudgetChart.vue'
import PowerLawChart from './PowerLawChart.vue'
import { useSecurityBudget, BLOCKS_PER_YEAR } from '../composables/useSecurityBudget'

withDefaults(defineProps<{ chartHeight?: number }>(), { chartHeight: 460 })

const {
  state, subsidySeries, subsidyBtcSeries, feeLevel, natLevel, yMax, readout, powerLaw, natMcapM, fetchLivePrice,
  powerLawPrice, securitySharePctUSD,
} = useSecurityBudget()

function fmtUSD(v: number): string {
  if (v >= 1e12) return '$' + (v / 1e12).toFixed(1) + 'T'
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B'
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'k'
  if (v >= 1) return '$' + Math.round(v).toLocaleString('en-US')
  return '$' + v.toFixed(2)
}
function fmtMcapM(m: number): string {
  if (m >= 1e6) return '$' + (m / 1e6).toFixed(1) + 'T'
  if (m >= 1000) return '$' + (m / 1000).toFixed(1) + 'B'
  return '$' + Math.round(m) + 'M'
}

function fmtPct(p: number): string {
  if (p >= 10) return p.toFixed(0) + '%'
  if (p >= 1) return p.toFixed(1) + '%'
  if (p >= 0.01) return p.toFixed(2) + '%'
  return p.toPrecision(1) + '%'
}

const natMcapLabel = computed(() => {
  if (state.natScale === 'rel') {
    const m = readout.value.btcMcap
    const pct = m > 0 ? (natMcapM() * 1e6 / m) * 100 : 0
    return fmtPct(pct)
  }
  return fmtMcapM(natMcapM())
})

const DASH = '\u2014'
const NAT_SUPPLY = 391e12   // ~391T $NAT total supply, for implied price
const colHeaders = ['Market cap', 'Price', 'Subsidy / block', 'Subsidy / year', 'Fees / block', 'Fees / year', 'Total annual security']

function fmtPrice(v: number): string {
  if (v >= 1) return fmtUSD(v)
  if (v >= 0.01) return '$' + v.toFixed(3)
  return '$' + v.toPrecision(2)
}

const assetRows = computed(() => {
  const r = readout.value
  const on = state.nat
  const NATON = '#00FF94'
  const NATOFF = '#e0533d'
  const feesYear = r.fees * BLOCKS_PER_YEAR
  const btcTotal = (r.subsidy + r.fees) * BLOCKS_PER_YEAR
  const natTotal = r.nat * BLOCKS_PER_YEAR
  const natPrice = (natMcapM() * 1e6) / NAT_SUPPLY
  return [
    {
      label: 'Bitcoin', color: '#F7931A',
      cells: [
        fmtUSD(r.btcMcap),
        fmtUSD(r.btcPrice),
        fmtUSD(r.subsidy),
        fmtUSD(r.subsidy * BLOCKS_PER_YEAR),
        fmtUSD(r.fees),
        fmtUSD(feesYear),
        fmtUSD(btcTotal),
      ],
    },
    {
      label: '$NAT', color: on ? NATON : NATOFF,
      cells: [
        on ? fmtUSD(natMcapM() * 1e6) : '$0',
        on ? fmtPrice(natPrice) : '$0',
        on ? fmtUSD(r.nat) : '$0',
        on ? fmtUSD(r.nat * BLOCKS_PER_YEAR) : '$0',
        DASH,
        DASH,
        on ? fmtUSD(natTotal) : '$0',
      ],
    },
    {
      label: 'Total', color: '#e5e7eb', total: true,
      cells: [
        DASH,
        DASH,
        fmtUSD(r.subsidy + (on ? r.nat : 0)),
        fmtUSD((r.subsidy + (on ? r.nat : 0)) * BLOCKS_PER_YEAR),
        fmtUSD(r.fees),
        fmtUSD(feesYear),
        fmtUSD(btcTotal + (on ? natTotal : 0)),
      ],
    },
  ]
})

function segBtn(active: boolean): string {
  return [
    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
    active ? 'bg-[#F7931A] text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10',
  ].join(' ')
}

/* ---------------- GUIDED TOUR ---------------- */
interface TourStep { caption: string; badge?: string; spot?: string; dwell: number; apply?: () => void }

const tour = reactive({ active: false, step: 0, playing: false })
const barPct = computed(() => ((tour.step + 1) / tourSteps.length) * 100)

let tweenRaf = 0
function tween(get: () => number, set: (v: number) => void, target: number, ms = 1400): void {
  cancelAnimationFrame(tweenRaf)
  const start = get()
  const t0 = performance.now()
  const frame = (now: number) => {
    const p = Math.min(1, (now - t0) / ms)
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
    set(Math.round(start + (target - start) * e))
    if (p < 1) tweenRaf = requestAnimationFrame(frame)
  }
  tweenRaf = requestAnimationFrame(frame)
}

let lastSpot: HTMLElement | null = null
function setSpot(sel?: string): void {
  if (lastSpot) { lastSpot.classList.remove('tour-spotlight'); lastSpot = null }
  if (!sel) return
  const el = document.querySelector(sel) as HTMLElement | null
  if (el) {
    el.classList.add('tour-spotlight')
    lastSpot = el
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const tourSteps: TourStep[] = [
  {
    caption: "Bitcoin's security budget is the total value paid to miners each year to keep the chain secure. Today it is almost entirely the block subsidy.",
    spot: '[data-tour=chart]', dwell: 8000,
    apply: () => { cancelAnimationFrame(tweenRaf); state.priceModel = 'pl'; state.nat = false; state.showSecurity = false; state.mcapSlider = 0; state.year = 2026 },
  },
  {
    caption: "Every four years the subsidy halves. Watch the miner reward fall as we move through time.",
    spot: '[data-tour=year]', dwell: 6500,
    apply: () => tween(() => state.year, v => (state.year = v), 2060, 2800),
  },
  {
    caption: "By 2140 the block subsidy reaches zero. New bitcoin issuance ends forever.",
    spot: '[data-tour=chart]', dwell: 7000,
    apply: () => tween(() => state.year, v => (state.year = v), 2140, 2800),
  },
  {
    caption: "Fees will not fill the gap. They are a fixed dollar amount, so as the price climbs their share only shrinks.",
    spot: '[data-tour=table]', dwell: 8000,
    apply: () => { state.showSecurity = true },
  },
  {
    caption: "So Bitcoin's security keeps falling as a share of its own market cap. This is the security budget problem.",
    spot: '[data-tour=chart]', dwell: 7500,
    apply: () => { state.showSecurity = true },
  },
  {
    caption: "Now add the $NAT layer. $NAT pays miners on top of the subsidy.",
    badge: 'TRY IT', spot: '[data-tour=nat]', dwell: 6500,
    apply: () => { state.nat = true },
  },
  {
    caption: "Drag $NAT's market cap up and the total security budget recovers, even after the subsidy is gone.",
    badge: 'TRY IT', spot: '[data-tour=mcap]', dwell: 7500,
    apply: () => { state.nat = true; tween(() => state.mcapSlider, v => (state.mcapSlider = v), 700, 2800) },
  },
  {
    caption: "That is the whole argument. As the subsidy is halved, $NAT makes up a growing share of the security budget. Try the sliders yourself.",
    spot: '[data-tour=natshare]', dwell: 9000,
    apply: () => {},
  },
]

let tourTimer: ReturnType<typeof setTimeout> | undefined
function schedule(): void {
  clearTimeout(tourTimer)
  if (!tour.playing) return
  tourTimer = setTimeout(() => next(), tourSteps[tour.step].dwell)
}
function applyStep(i: number): void {
  tour.step = i
  tourSteps[i].apply?.()
  nextTick(() => setSpot(tourSteps[i].spot))
}
function startTour(): void {
  tour.active = true
  tour.playing = true
  applyStep(0)
  schedule()
}
function next(): void {
  if (tour.step < tourSteps.length - 1) {
    applyStep(tour.step + 1)
    schedule()
  } else {
    tour.playing = false
    clearTimeout(tourTimer)
  }
}
function prev(): void {
  if (tour.step > 0) {
    tour.playing = false
    clearTimeout(tourTimer)
    cancelAnimationFrame(tweenRaf)
    applyStep(tour.step - 1)
  }
}
function togglePlay(): void {
  tour.playing = !tour.playing
  if (tour.playing) schedule()
  else clearTimeout(tourTimer)
}
function exitTour(): void {
  tour.active = false
  tour.playing = false
  clearTimeout(tourTimer)
  cancelAnimationFrame(tweenRaf)
  setSpot()
}

onMounted(() => { fetchLivePrice() })
onBeforeUnmount(() => { clearTimeout(tourTimer); cancelAnimationFrame(tweenRaf); setSpot() })
</script>

<style scoped>
.sb-range {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  outline: none;
}
.sb-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #F7931A;
  cursor: pointer;
  border: 2px solid #000;
}
.sb-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #F7931A;
  cursor: pointer;
  border: 2px solid #000;
}

.tour-btn {
  padding: 0.4rem 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.06);
  color: #d1d5db;
  transition: background-color 0.15s ease;
}
.tour-btn:hover { background: rgba(255, 255, 255, 0.12); }
.tour-btn-primary {
  padding: 0.4rem 0.85rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  background: #00FF94;
  color: #000;
}
.tour-pulse { animation: tourPulse 2s ease-in-out infinite; }
@keyframes tourPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 255, 148, 0.5); }
  50% { box-shadow: 0 0 0 8px rgba(0, 255, 148, 0); }
}
</style>

<style>
.tour-spotlight {
  position: relative;
  z-index: 45;
  border-radius: 12px;
  box-shadow: 0 0 0 3px #00FF94, 0 0 0 9999px rgba(0, 0, 0, 0.62);
  transition: box-shadow 0.35s ease;
}
</style>
