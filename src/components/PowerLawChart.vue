<template>
  <div ref="container" class="w-full" :style="{ minHeight: height + 'px' }">
    <v-chart
      v-if="visible"
      :option="option"
      autoresize
      class="w-full"
      :style="{ height: height + 'px' }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, CustomChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, MarkLineComponent, MarkPointComponent, GraphicComponent,
} from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([
  CanvasRenderer, LineChart, CustomChart, GridComponent,
  TooltipComponent, MarkLineComponent, MarkPointComponent, GraphicComponent,
])

const props = withDefaults(defineProps<{
  powerLawPrice: (y: number) => number
  securityUsd: (y: number, includeNat: boolean) => number
  subsidyBtcSeries: [number, number][]
  showSecurity: boolean
  natOn: boolean
  mcapSlider: number
  natScale: string
  year: number
  fee: string
  printMode?: boolean
  height?: number
}>(), { printMode: false, height: 460 })

// dark-mode palette ported from the explorable
const WHITE = '#fafafa'
const RED = '#e0533d'
const TEAL = '#5daa3e'
const ORANGE = '#f7931a'
const TERT = '#737373'
const NATG = '#00FF94'   // $NAT lift line
const SEC = '#a3a3a3'
const grid = () => (props.printMode ? 'rgba(0,0,0,0.10)' : '#1f1f1f')
const axisLine = () => (props.printMode ? '#b8b2a6' : '#404040')
const axisText = () => (props.printMode ? '#57534e' : '#a3a3a3')
const boxFill = () => (props.printMode ? '#f1efe9' : '#1c1c1c')
const textCol = () => (props.printMode ? '#1a1a1a' : '#fafafa')

const YR_LO = 2011, YR_HI = 2140

// rainbow corridor around the power-law trend
const bMult = [0.25, 0.5, 1, 2, 4, 8]
const bCol = ['#1d4ed8', '#3b82f6', '#5daa3e', '#eab308', '#f7931a', '#e0533d']
const bandYrs = (() => {
  const a: number[] = []
  for (let y = YR_LO; y <= YR_HI; y += 2) a.push(y)
  if (a[a.length - 1] !== YR_HI) a.push(YR_HI)
  return a
})()
const capV = (v: number) => Math.max(1, Math.min(1e10, v))

function fmtUSD(v: number): string {
  if (v >= 1e9) return '$' + Math.round(v / 1e9) + 'B'
  if (v >= 1e6) return '$' + Math.round(v / 1e6) + 'M'
  if (v >= 1e3) return '$' + Math.round(v / 1e3) + 'k'
  return '$' + Math.round(v)
}
function fmtPct(v: number): string {
  if (v >= 1) return v + '%'
  if (v >= 0.1) return v.toFixed(1) + '%'
  return v.toFixed(2) + '%'
}

const option = computed<EChartsOption>(() => {
  // touch reactive deps so the chart recomputes on year/fee/NAT/slider changes
  const yr = props.year
  const _feeKey = props.fee
  const _natOn = props.natOn
  const _mcap = props.mcapSlider
  const _natScale = props.natScale
  const plp = props.powerLawPrice
  const sec = props.securityUsd

  // band polygons (custom series): one polygon per band, drawn behind everything
  const bandData = [0, 1, 2, 3, 4].map((b) => ({ value: b }))
  const renderBands = (params: any, api: any) => {
    const b = params.dataIndex
    const pts: number[][] = []
    for (const y of bandYrs) pts.push(api.coord([y, capV(plp(y) * bMult[b + 1])]))
    for (let k = bandYrs.length - 1; k >= 0; k--) pts.push(api.coord([bandYrs[k], capV(plp(bandYrs[k]) * bMult[b])]))
    return { type: 'polygon', shape: { points: pts }, style: { fill: bCol[b + 1], opacity: 0.13 }, silent: true }
  }

  // price line (the iconic climb)
  const priceData: [number, number][] = []
  for (let y = YR_LO; y <= YR_HI; y++) priceData.push([y, plp(y)])
  // security-share lines (right axis). USD-equivalent share of BTC value spent on security.
  // Baseline (no NAT) collapses toward 0 as subsidy halves + fees shrink vs a climbing price.
  // With-NAT holds a flat floor (NAT tracks a % of BTC mcap, not the halving schedule) and the
  // slider raises that floor. Start at 2024 to avoid power-law backcast distortion.
  const secBase: [number, number][] = []
  const secNat: [number, number][] = []
  for (let y = 2024; y <= YR_HI; y++) {
    secBase.push([y, sec(y, false)])
    if (_natOn) secNat.push([y, sec(y, true)])
  }

  // always-on halving staircase (raw BTC subsidy, hidden axis). Clamp 0 -> axis floor so
  // the collapsed tail sits flat on the bottom.
  const stairData: [number, number][] = props.subsidyBtcSeries.map(([x, v]) => [x, Math.max(1e-3, v)])

  // halving markers (year-independent, static): green dashed verticals at each halving.
  // Animation is disabled on this markLine so the bars never redraw when the year moves.
  const halvingMl: any[] = []
  for (let h = 2012; h <= YR_HI; h += 4) {
    halvingMl.push({
      xAxis: h,
      lineStyle: { color: TEAL, type: [2, 4], width: 1, opacity: h <= 2040 ? 0.5 : 0.2 },
      label: { show: false },
    })
  }
  // interactive year marker: a single vertical line that slides horizontally as the
  // Year slider changes (its own series so the halving bars stay put).
  const yearMl: any[] = [{
    xAxis: yr,
    lineStyle: { color: TERT, type: [3, 3], width: 1.2, opacity: 0.85 },
    label: { show: true, position: 'end', formatter: () => String(yr), color: textCol(), fontFamily: 'monospace', fontSize: 11 },
  }]

  return {
    backgroundColor: 'transparent',
    animation: !props.printMode,
    animationDuration: props.printMode ? 0 : 600,
    tooltip: {
      trigger: 'axis',
      formatter: (ps: any) => {
        const x = Array.isArray(ps) && ps.length ? ps[0].axisValue : ''
        let s = '<b>' + x + '</b>'
        for (const p of (Array.isArray(ps) ? ps : [ps])) {
          if (p.seriesName === 'BTC price') s += '<br/>' + p.marker + ' Price: ' + fmtUSD(p.value[1])
          if (p.seriesName === 'Security % (no NAT)') s += '<br/>' + p.marker + ' Security: ' + fmtPct(Number(p.value[1].toFixed(3)))
          if (p.seriesName === 'Security % (+NAT)') s += '<br/>' + p.marker + ' + $NAT: ' + fmtPct(Number(p.value[1].toFixed(3)))
        }
        return s
      },
    },
    grid: { left: 64, right: 60, top: 28, bottom: 48, containLabel: false },
    xAxis: {
      type: 'value', min: YR_LO, max: YR_HI,
      interval: 20,
      axisLine: { lineStyle: { color: axisLine() } },
      axisTick: { show: false },
      axisLabel: { color: axisText(), formatter: (v: number) => String(v) },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: 'log', min: 1, max: 1e10,
        name: 'BTC price $ (log · Power Law)',
        nameLocation: 'middle', nameGap: 44, nameTextStyle: { color: axisText() },
        axisLine: { show: true, lineStyle: { color: axisLine() } },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: grid() } },
        axisLabel: {
          color: axisText(),
          formatter: (v: number) => {
            const allowed = [1, 100, 1e4, 1e6, 1e8, 1e10]
            return allowed.some((a) => Math.abs(Math.log10(v) - Math.log10(a)) < 0.01) ? fmtUSD(v) : ''
          },
        },
      },
      {
        type: 'log', min: 0.003, max: 30, position: 'right',
        name: 'security, % of value (log)',
        nameLocation: 'middle', nameGap: 46, nameTextStyle: { color: RED },
        axisLine: { show: true, lineStyle: { color: RED, opacity: 0.55 } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: RED,
          formatter: (v: number) => {
            const allowed = [0.01, 0.1, 1, 10]
            return allowed.some((a) => Math.abs(Math.log10(v) - Math.log10(a)) < 0.01) ? fmtPct(v) : ''
          },
        },
      },
      {
        // hidden axis: raw BTC block subsidy for the always-on halving staircase
        type: 'log', min: 1e-3, max: 60, show: false, position: 'right',
      },
    ],
    series: [
      {
        name: 'bands', type: 'custom', renderItem: renderBands,
        data: bandData, yAxisIndex: 0, z: 1, silent: true,
      },
      {
        // always-on halving staircase (hidden axis): miner issuance cut in half every ~4y
        name: 'Subsidy (halvings)', type: 'line', symbol: 'none', yAxisIndex: 2,
        data: stairData, color: ORANGE, z: 3, silent: true,
        lineStyle: { color: ORANGE, width: 1.8, opacity: 0.75 },
        areaStyle: { color: ORANGE, opacity: 0.06 },
      },
      ...(props.showSecurity ? [
        {
          name: 'Security % (no NAT)', type: 'line', symbol: 'none', yAxisIndex: 1,
          data: secBase, color: RED, z: 4,
          lineStyle: { color: RED, width: 2.5, type: _natOn ? [6, 4] : 'solid', opacity: _natOn ? 0.5 : 1 },
          markPoint: {
            silent: true, symbol: 'circle', symbolSize: 9,
            itemStyle: { color: RED, borderColor: props.printMode ? '#f8f7f4' : '#0a0a0a', borderWidth: 1.5, opacity: _natOn ? 0.5 : 1 },
            label: { show: false },
            data: [{ coord: [yr, sec(yr, false)] }],
          },
        },
        ...(_natOn ? [{
          name: 'Security % (+NAT)', type: 'line', symbol: 'none', yAxisIndex: 1,
          data: secNat, color: NATG, lineStyle: { color: NATG, width: 2.5 }, z: 5,
          markPoint: {
            silent: true, symbol: 'circle', symbolSize: 9,
            itemStyle: { color: NATG, borderColor: props.printMode ? '#f8f7f4' : '#0a0a0a', borderWidth: 1.5 },
            label: { show: false },
            data: [{ coord: [yr, sec(yr, true)] }],
          },
        }] : []),
      ] : []),
      {
        name: 'BTC price', type: 'line', symbol: 'none', yAxisIndex: 0,
        data: priceData, color: WHITE, lineStyle: { color: WHITE, width: 2.5 }, z: 5,
        // static halving bars: animation off so they hold position across year changes
        markLine: { silent: true, symbol: 'none', animation: false, data: halvingMl },
        markPoint: {
          silent: true, symbol: 'circle', symbolSize: 9,
          itemStyle: { color: WHITE, borderColor: props.printMode ? '#f8f7f4' : '#0a0a0a', borderWidth: 1.5 },
          label: { show: false },
          data: [{ coord: [yr, plp(yr)] }],
        },
      },
      {
        // year marker on its own series: the single vertical line translates horizontally
        // (animated position update) while the halving bars above stay fixed.
        name: 'Year marker', type: 'line', symbol: 'none', yAxisIndex: 0,
        data: [], silent: true, z: 6,
        markLine: {
          silent: true, symbol: 'none',
          animation: !props.printMode, animationDurationUpdate: 350, animationEasingUpdate: 'cubicOut',
          data: yearMl,
        },
      },
    ] as any,
    graphic: [
      {
        type: 'group', left: 72, top: 32, z: 20,
        children: [
          { type: 'rect', shape: { x: 0, y: 0, width: 244, height: 37, r: 5 }, style: { fill: boxFill(), opacity: 0.88, stroke: axisLine(), lineWidth: 1 } },
          { type: 'text', left: 8, top: 7, style: { text: 'price ≈ 10^k × days^5.8', fill: textCol(), font: '600 12px monospace' } },
          { type: 'text', left: 8, top: 22, style: { text: 'Power Law (Santostasi/Burger)', fill: TERT, font: '10px monospace' } },
        ],
      },
      { type: 'text', right: 64, bottom: 56, z: 20, style: { text: 'Price climbs the Power Law ↑   security\u2019s share ↓ to ~0', fill: SEC, font: '600 11px monospace' } },
      { type: 'text', left: 72, bottom: 56, z: 20, style: { text: 'model line, not actual price', fill: TERT, font: '9px monospace', opacity: 0.9 } },
    ],
  }
})

const container = ref<HTMLElement | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (props.printMode || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    visible.value = true
    return
  }
  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      visible.value = true
      if (container.value && observer) observer.unobserve(container.value)
      observer = null
    }
  }, { threshold: 0.15 })
  if (container.value) observer.observe(container.value)
})

onBeforeUnmount(() => {
  if (container.value && observer) observer.unobserve(container.value)
  observer = null
})
</script>
