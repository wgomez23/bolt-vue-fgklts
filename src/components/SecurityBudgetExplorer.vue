<template>
  <div class="w-full">
    <!-- FULL-WIDTH CHART -->
    <div class="w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:p-4">
      <PowerLawChart
        v-if="state.priceModel === 'pl'"
        :power-law-price="powerLawPrice"
        :security-share-pct="securitySharePct"
        :subsidy-btc-series="subsidyBtcSeries"
        :show-security="state.showSecurity"
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

    <!-- READOUT STRIP -->
    <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div v-for="r in readoutCards" :key="r.label" class="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
        <div class="text-[11px] uppercase tracking-wide text-gray-400">{{ r.label }}</div>
        <div class="text-base font-semibold" :style="{ color: r.color }">{{ r.value }}</div>
      </div>
    </div>

    <!-- CONTROLS BELOW CHART -->
    <div class="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Year -->
      <div class="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-gray-200">Year</label>
          <span class="font-mono text-[#F7931A]">{{ state.year }}</span>
        </div>
        <input type="range" :min="2024" :max="2140" step="1" v-model.number="state.year" class="sb-range w-full" />
        <div class="flex justify-between text-[11px] text-gray-500 mt-1"><span>2024</span><span>2140</span></div>
      </div>

      <!-- NAT market cap -->
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

      <!-- Toggles row -->
      <div class="rounded-lg border border-white/10 bg-white/[0.02] p-4 flex flex-wrap gap-x-8 gap-y-4">
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
      </div>

      <!-- BTC price model -->
      <div class="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <div class="text-sm font-medium text-gray-200 mb-2">Bitcoin price</div>
        <div class="flex gap-2 mb-3">
          <button @click="state.priceModel = 'today'" :class="segBtn(state.priceModel === 'today')">
            Today<span v-if="state.livePrice" class="ml-1 text-[10px] text-gray-400">({{ fmtUSD(state.livePrice) }})</span>
          </button>
          <button @click="state.priceModel = 'custom'" :class="segBtn(state.priceModel === 'custom')">Custom</button>
          <button @click="state.priceModel = 'pl'" :class="segBtn(state.priceModel === 'pl')">Power law</button>
        </div>
        <div v-if="state.priceModel === 'custom'" class="flex items-center gap-2">
          <span class="text-gray-400">$</span>
          <input type="number" v-model.number="state.customPrice" min="1000" step="1000"
            class="w-40 rounded bg-black/30 border border-white/10 px-2 py-1 font-mono text-gray-100" />
        </div>
        <div v-else-if="state.priceModel === 'pl'" class="text-sm text-gray-400">
          Projected BTC price in {{ state.year }}: <span class="font-mono text-gray-100">{{ fmtUSD(powerLaw.price) }}</span>
        </div>
        <div v-else class="text-sm text-gray-400">
          Using {{ state.livePrice ? 'live spot' : 'May-2026 snapshot' }}.
        </div>
      </div>
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
import { useSecurityBudget } from '../composables/useSecurityBudget'

withDefaults(defineProps<{ chartHeight?: number }>(), { chartHeight: 460 })

const {
  state, subsidySeries, subsidyBtcSeries, feeLevel, natLevel, yMax, readout, powerLaw, natMcapM, fetchLivePrice,
  powerLawPrice, securitySharePct,
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

const natMcapLabel = computed(() => fmtMcapM(natMcapM()))

const readoutCards = computed(() => {
  const r = readout.value
  return [
    { label: 'Subsidy / block', value: fmtUSD(r.subsidy), color: '#F7931A' },
    { label: 'Fees / block', value: fmtUSD(r.fees), color: '#F5C542' },
    { label: '$NAT / block', value: fmtUSD(r.nat), color: '#00FF94' },
    { label: 'Total / block', value: fmtUSD(r.total), color: '#FFFFFF' },
    { label: 'NAT share', value: r.natSharePct.toFixed(1) + '%', color: '#00FF94' },
    { label: 'Annual security', value: fmtUSD(r.annualSecurity), color: '#FFFFFF' },
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
