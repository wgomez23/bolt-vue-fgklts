<template>
  <div ref="container" class="w-full h-56 md:h-72">
    <v-chart v-if="visible" :option="option" autoresize class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent, TitleComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([CanvasRenderer, LineChart, GridComponent, LegendComponent, TooltipComponent, TitleComponent])

// Site brand colors (from tailwind.config.js)
const PRIMARY = '#F7931A'   // orange
const SECONDARY = '#00FF94' // green
const GRID = 'rgba(255,255,255,0.08)'
const AXIS_TEXT = '#9CA3AF'  // gray-400

const years = [
  2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
  2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032,
  2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041
]

// Simplified step function for block subsidy in BTC per block
function subsidyForYear(y: number): number {
  if (y < 2012) return 50
  if (y < 2016) return 25
  if (y < 2020) return 12.5
  if (y < 2024) return 6.25
  if (y < 2028) return 3.125
  if (y < 2032) return 1.5625
  if (y < 2036) return 0.78125
  if (y < 2040) return 0.390625
  return 0.1953125
}

const subsidy = years.map(subsidyForYear)

// Approximate cumulative supply trajectory (M BTC) approaching 21M
// Anchor points derived from historical/expected schedule, then lightly smoothed.
const supplyAnchors: Record<number, number> = {
  2009: 0,
  2012: 10.8,
  2016: 16.7,
  2020: 18.6,
  2024: 19.7,
  2028: 20.4,
  2032: 20.7,
  2036: 20.91,
  2040: 20.95,
  2041: 20.97
}

function interpolateSupply(years: number[], anchors: Record<number, number>): number[] {
  const pts = Object.keys(anchors).map(y => Number(y)).sort((a, b) => a - b)
  const res: number[] = []
  for (const y of years) {
    // find surrounding anchors
    let i = 0
    while (i < pts.length && pts[i] < y) i++
    if (i === 0) {
      res.push(anchors[pts[0]])
    } else if (i >= pts.length) {
      res.push(anchors[pts[pts.length - 1]])
    } else {
      const y0 = pts[i - 1]
      const y1 = pts[i]
      const v0 = anchors[y0]
      const v1 = anchors[y1]
      const t = (y - y0) / (y1 - y0)
      res.push(v0 + (v1 - v0) * t)
    }
  }
  return res
}

const supplyM = interpolateSupply(years, supplyAnchors)

const option = ref<EChartsOption>({
  backgroundColor: 'transparent',
  title: {
    text: 'BTC supply and block subsidy',
    left: 8,
    top: 2,
    textStyle: { color: AXIS_TEXT, fontSize: 12, fontWeight: 'bold' }
  },
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['BTC Supply', 'BTC Subsidy'],
    top: 24,
    textStyle: { color: AXIS_TEXT }
  },
  grid: { left: 48, right: 56, top: 44, bottom: 36 },
  animation: true,
  animationDuration: 3000,
  animationEasing: 'cubicOut',
  xAxis: {
    type: 'category',
    data: years,
    boundaryGap: false,
    axisLine: { lineStyle: { color: GRID } },
    axisTick: { show: false },
    axisLabel: { color: AXIS_TEXT }
  },
  yAxis: [
    {
      type: 'value',
      name: 'BTC supply (M)',
      min: 0,
      max: 22,
      axisLine: { lineStyle: { color: GRID } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: GRID } },
      axisLabel: { color: AXIS_TEXT }
    },
    {
      type: 'value',
      name: 'BTC block subsidy',
      min: 0,
      max: 50,
      position: 'right',
      axisLine: { lineStyle: { color: GRID } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { color: AXIS_TEXT }
    }
  ],
  series: [
    {
      name: 'BTC Supply',
      type: 'line',
      smooth: true,
      yAxisIndex: 0,
      symbol: 'none',
      lineStyle: { color: PRIMARY, width: 2 },
      data: supplyM
    },
    {
      name: 'BTC Subsidy',
      type: 'line',
      step: 'end',
      yAxisIndex: 1,
      symbol: 'none',
      lineStyle: { color: SECONDARY, width: 2 },
      data: subsidy
    }
  ]
})

// Animate on first viewport appearance
const container = ref<HTMLElement | null>(null)
const visible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (visible.value) return
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    visible.value = true
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting) {
        visible.value = true
        if (container.value && observer) observer.unobserve(container.value)
        observer = null
      }
    },
    { root: null, threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
  )
  if (container.value) observer.observe(container.value)
})

onBeforeUnmount(() => {
  if (container.value && observer) observer.unobserve(container.value)
  observer = null
})
</script>
