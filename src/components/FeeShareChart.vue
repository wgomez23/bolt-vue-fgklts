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
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, MarkLineComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent, MarkLineComponent])

// Brand palette
const SECONDARY = '#00FF94' // green
const AXIS_TEXT = '#9CA3AF' // gray-400
const GRID = 'rgba(255,255,255,0.08)'

// Static, illustrative dataset of transaction fees share of miner revenue (% of total)
// Format: [ISO date, percent]
const fallbackPoints: Array<[string, number]> = [
  ['2016-01-01', 2.0],
  ['2017-01-01', 6.5],  // 2017 spike
  ['2018-01-01', 2.1],
  ['2019-01-01', 1.3],
  ['2020-01-01', 2.4],
  ['2021-01-01', 3.5],
  ['2022-01-01', 1.1],
  ['2023-01-01', 2.8],
  ['2024-01-01', 1.4],
  ['2025-01-01', 0.9]
]

const seriesData: Array<[number, number]> = fallbackPoints.map(([d, v]) => [new Date(d).getTime(), v])

const option = ref<EChartsOption>({
  backgroundColor: 'transparent',
  title: {
    text: 'Transaction fees share of miner revenue (%)',
    left: 8,
    top: 0,
    textStyle: { color: AXIS_TEXT, fontSize: 12, fontWeight: 'bold' }
  },
  tooltip: { trigger: 'axis' },
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
    type: 'value',
    min: 0,
    max: 10,
    axisLine: { lineStyle: { color: GRID } },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: GRID } },
    axisLabel: { color: AXIS_TEXT }
  },
  series: [
    {
      name: 'Fees share (%)',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: SECONDARY, width: 2 },
      areaStyle: { color: 'rgba(0, 255, 148, 0.15)' },
      data: seriesData,
      markLine: {
        silent: true,
        data: [{ yAxis: 5, name: '5% threshold' }],
        lineStyle: { type: 'dashed', color: 'rgba(255,255,255,0.35)' },
        label: { color: AXIS_TEXT }
      }
    }
  ]
})

// Viewport-triggered render
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
