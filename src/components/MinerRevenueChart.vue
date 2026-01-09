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

const props = withDefaults(defineProps<{ printMode?: boolean }>(), { printMode: false })

// Site brand colors
const PRIMARY = '#F7931A'   // orange
const getAxisText = () => props.printMode ? '#374151' : '#9CA3AF'
const getGrid = () => props.printMode ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)'

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
    text: 'BSI = Miner Revenue (annualized) / Market Cap',
    left: 8,
    top: 0,
    textStyle: { color: getAxisText(), fontSize: 12, fontWeight: 'bold' }
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: { show: false },
  grid: { left: 50, right: 50, top: 32, bottom: 40, containLabel: true },
  animation: !props.printMode,
  animationDuration: props.printMode ? 0 : 3000,
  animationEasing: 'cubicOut',
  xAxis: {
    type: 'time',
    min: new Date('2010-01-01').getTime(),
    max: new Date('2026-01-01').getTime(),
    axisLine: { lineStyle: { color: getGrid() } },
    axisTick: { show: false },
    axisLabel: { color: getAxisText() }
  },
  yAxis: {
    type: 'log',
    logBase: 10,
    min: 0.05,
    max: 64,
    axisLine: { lineStyle: { color: getGrid() } },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: getGrid() } },
    axisLabel: {
      color: getAxisText(),
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
  // In print mode, show immediately without waiting for intersection
  if (props.printMode) {
    visible.value = true
    return
  }
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
