<template>
  <div class="w-full">
    <!-- FULL-WIDTH CHART -->
    <div class="w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
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
      <div>
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
      <div class="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-200">Year</label>
          <span class="font-mono text-[#F7931A]">{{ state.year }}</span>
        </div>
        <input type="range" :min="2024" :max="2140" step="1" v-model.number="state.year" class="sb-range w-full" />
        <div class="flex justify-between text-[11px] text-gray-500 mt-1"><span>2024</span><span>2140</span></div>
      </div>
      <div class="rounded-lg border border-white/10 bg-white/[0.02] p-4">
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

    <!-- DATA TABLE: what the user reads as the sliders move -->
    <div class="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 overflow-x-auto">
      <table class="w-full min-w-[780px] border-collapse">
        <thead>
          <tr class="border-b border-white/10">
            <th v-for="c in tableCols" :key="c.label"
              class="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-gray-400 align-bottom">
              {{ c.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td v-for="c in tableCols" :key="c.label"
              class="px-3 pt-3 font-mono text-xl font-semibold whitespace-nowrap" :style="{ color: c.color }">
              {{ c.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-4 text-[11px] leading-relaxed text-gray-500">
      Scenarios, not forecasts. $NAT's contribution is demand-driven and reflexive, not guaranteed. Power-law price is a
      long-run projection calibrated to today's anchor. Model ported from the NAT security-budget explorable.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
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

const tableCols = computed(() => {
  const r = readout.value
  return [
    { label: 'Bitcoin market cap', value: fmtUSD(r.btcMcap), color: '#F7931A' },
    { label: 'Bitcoin price', value: fmtUSD(r.btcPrice), color: '#F7931A' },
    { label: 'BTC subsidy / block', value: fmtUSD(r.subsidy), color: '#F7931A' },
    { label: 'BTC subsidy / year', value: fmtUSD(r.subsidy * BLOCKS_PER_YEAR), color: '#F7931A' },
    { label: 'Fees / block', value: fmtUSD(r.fees), color: '#F5C542' },
    { label: '$NAT value / block', value: state.nat ? fmtUSD(r.nat) : '$0', color: state.nat ? '#00FF94' : '#e0533d' },
    { label: '$NAT subsidy / year', value: state.nat ? fmtUSD(r.nat * BLOCKS_PER_YEAR) : '$0', color: state.nat ? '#00FF94' : '#e0533d' },
    { label: 'Total annual security', value: fmtUSD(r.annualSecurity), color: '#FFFFFF' },
  ]
})

function segBtn(active: boolean): string {
  return [
    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
    active ? 'bg-[#F7931A] text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10',
  ].join(' ')
}

onMounted(() => { fetchLivePrice() })
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
</style>
