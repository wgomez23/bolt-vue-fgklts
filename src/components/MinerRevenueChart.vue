<template>
  <div ref="container" class="w-full h-full">
    <v-chart v-if="visible" :option="option" autoresize class="w-full h-full" />
  </div>
  
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

// Site brand colors (from tailwind.config.js)
const PRIMARY = '#F7931A'   // orange
const AXIS_TEXT = '#9CA3AF'  // gray-400
const GRID = 'rgba(255,255,255,0.08)'

// Approximate monthly/annual downtrend of Miner Revenue / Market Cap (% of mcap)
// Data is illustrative to match the look & feel of the reference chart.
// Format: [ISO date, percent]
const fallbackPoints: Array<[string, number]> = [
  ['2010-01-01', 64],
  ['2011-01-01', 12],
  ['2012-01-01', 8],
  ['2013-01-01', 4],
  ['2014-01-01', 2.8],
  ['2015-01-01', 1.9],
  ['2016-01-01', 1.2],
  ['2017-01-01', 1.1],
  ['2018-01-01', 0.9],
  ['2019-01-01', 0.8],
  ['2020-01-01', 0.6],
  ['2021-01-01', 0.5],
  ['2022-01-01', 0.4],
  ['2023-01-01', 0.3],
  ['2024-01-01', 0.15],
  ['2025-01-01', 0.08]
]

// Convert fallback points to numeric timestamps for consistent typing
const fallbackSeries: Array<[number, number]> = fallbackPoints.map(([d, v]) => [new Date(d).getTime(), v])

const option = ref<EChartsOption>({
  backgroundColor: 'transparent',
  title: {
    text: 'Miner revenue / market cap (annualized %)',
    left: 8,
    top: 0,
    textStyle: { color: AXIS_TEXT, fontSize: 12, fontWeight: 'bold' }
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: { show: false },
  grid: { left: 44, right: 12, top: 28, bottom: 24 },
  animation: true,
  animationDuration: 3000,
  animationEasing: 'cubicOut',
  xAxis: {
    type: 'time',
    axisLine: { lineStyle: { color: GRID } },
    axisTick: { show: false },
    axisLabel: { color: AXIS_TEXT }
  },
  yAxis: {
    type: 'log',
    logBase: 10,
    min: 0.05,
    max: 64,
    axisLine: { lineStyle: { color: GRID } },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: GRID } },
    axisLabel: {
      color: AXIS_TEXT,
      formatter: (val: number) => `${val}`
    }
  },
  series: [
    {
      name: 'Miner revenue / mcap (annualized)',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: PRIMARY, width: 2 },
      areaStyle: {
        color: 'rgba(247, 147, 26, 0.15)'
      },
      data: fallbackSeries
    }
  ]
})

// Static mode: no external API calls. Chart uses fallbackSeries only.

// Animate on first viewport appearance using IntersectionObserver
const container = ref<HTMLElement | null>(null)
const visible = ref(false)

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (visible.value) return
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: show immediately
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
