<template>
  <div ref="container" class="space-y-3">
    <Motion v-if="visible" :initial="{ opacity: 0, y: 16 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, easing: 'ease-out' }">
      <div class="w-full h-[400px]">
        <v-chart :option="option" autoresize class="w-full h-full" />
      </div>
      <p class="text-center text-gray-400 text-sm italic">
        The inverse relationship between hash rate and the decimal value of the "bits" field remains clear. Chart in logarithmic scale.
      </p>
    </Motion>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Motion } from '@motionone/vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

// Brand palette
const PRIMARY = '#F7931A'   // orange
const SECONDARY = '#00FF94' // green
const AXIS_TEXT = '#9CA3AF' // gray-400
const GRID = 'rgba(255,255,255,0.08)'

// X-axis categories (years)
const years: string[] = [
  '2010','2011','2012','2013','2014','2015','2016','2017',
  '2018','2019','2020','2021','2022','2023','2024'
]

// Data replicated from BitcoinChart.vue (home page)
const hashPowerEh: number[] = [
  0.000001, 0.0001, 0.01, 0.1, 0.3, 0.5, 2, 10,
  45, 80, 120, 180, 250, 400, 741.75
]

const bitsDecimal: number[] = [
  486604799, 436929919, 424491007, 419430400, 409544448,
  403570176, 402653184, 398458880, 392826880, 389885952,
  387940352, 386977792, 386453504, 386256896, 386057444
]

const option = ref<EChartsOption>({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['Hash Power (EH/s)', '$NAT - Bits Field (Decimal)'],
    top: 0,
    textStyle: { color: AXIS_TEXT }
  },
  grid: { left: 50, right: 56, top: 28, bottom: 28 },
  animation: true,
  animationDuration: 2000,
  animationEasing: 'cubicOut',
  xAxis: {
    type: 'category',
    data: years,
    axisLine: { lineStyle: { color: GRID } },
    axisTick: { show: false },
    axisLabel: { color: AXIS_TEXT }
  },
  yAxis: [
    {
      type: 'value', // Left axis: Bits (linear)
      min: 380000000,
      max: 490000000,
      axisLine: { lineStyle: { color: GRID } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: GRID } },
      axisLabel: {
        color: AXIS_TEXT,
        formatter: (val: number) => `${(val / 1_000_000).toFixed(1)}M`
      },
      name: '$NAT - Bits Field (Decimal)',
      nameTextStyle: { color: AXIS_TEXT }
    },
    {
      type: 'log', // Right axis: Hash Power (log)
      logBase: 10,
      min: 0.000001,
      axisLine: { lineStyle: { color: GRID } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        color: AXIS_TEXT,
        formatter: (val: number) => {
          if (val <= 0.001) return val.toExponential(1)
          if (val < 1000) return val.toFixed(1)
          return `${(val / 1000).toFixed(0)}k`
        }
      },
      name: 'Hash Power (EH/s)',
      nameTextStyle: { color: AXIS_TEXT }
    }
  ],
  series: [
    {
      name: 'Hash Power (EH/s)',
      type: 'line',
      yAxisIndex: 1,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: PRIMARY, width: 2 },
      areaStyle: { color: 'rgba(247, 147, 26, 0.10)' },
      data: hashPowerEh
    },
    {
      name: '$NAT - Bits Field (Decimal)',
      type: 'line',
      yAxisIndex: 0,
      smooth: true,
      symbol: 'none',
      lineStyle: { color: SECONDARY, width: 2 },
      areaStyle: { color: 'rgba(0, 255, 148, 0.10)' },
      data: bitsDecimal
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
