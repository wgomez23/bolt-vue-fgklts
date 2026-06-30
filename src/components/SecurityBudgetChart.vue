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
import { LineChart } from 'echarts/charts'
import {
  GridComponent, LegendComponent, TooltipComponent, TitleComponent, MarkLineComponent, MarkPointComponent,
} from 'echarts/components'
import type { EChartsOption } from 'echarts'
import { YEAR_MIN, YEAR_MAX } from '../composables/useSecurityBudget'

use([
  CanvasRenderer, LineChart, GridComponent, LegendComponent,
  TooltipComponent, TitleComponent, MarkLineComponent, MarkPointComponent,
])

const props = withDefaults(defineProps<{
  subsidySeries: [number, number][]
  feeLevel: number
  natLevel: number
  natEnabled: boolean
  yMax: number
  year: number
  printMode?: boolean
  height?: number
}>(), { printMode: false, height: 460 })

// Site brand + explorable palette
const ORANGE = '#F7931A'   // subsidy
const YELLOW = '#F5C542'   // fees
const TEAL = '#00FF94'     // NAT
const grid = () => (props.printMode ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)')
const axisText = () => (props.printMode ? '#374151' : '#9CA3AF')

const feeData = computed<[number, number][]>(() => [[YEAR_MIN, props.feeLevel], [YEAR_MAX, props.feeLevel]])
const natData = computed<[number, number][]>(() => [[YEAR_MIN, props.natLevel], [YEAR_MAX, props.natLevel]])

function fmtUSD(v: number): string {
  if (v >= 1e12) return '$' + (v / 1e12).toFixed(1) + 'T'
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B'
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return '$' + (v / 1e3).toFixed(1) + 'k'
  if (v >= 1) return '$' + Math.round(v)
  return '$' + v.toFixed(2)
}

const option = computed<EChartsOption>(() => {
  const series: any[] = [
    {
      name: 'Subsidy', type: 'line', step: 'end', symbol: 'none',
      color: ORANGE, data: props.subsidySeries,
      lineStyle: { color: ORANGE, width: 2.5 },
      areaStyle: { color: ORANGE, opacity: 0.1 },
      z: 3,
    },
    {
      name: 'Fees', type: 'line', symbol: 'none', color: YELLOW, data: feeData.value,
      lineStyle: { color: YELLOW, width: 2, type: 'dashed' }, z: 2,
    },
  ]
  if (props.natEnabled) {
    series.push({
      name: '$NAT', type: 'line', symbol: 'none', color: TEAL, data: natData.value,
      lineStyle: { color: TEAL, width: 2.5 },
      z: 4,
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { color: axisText(), type: 'dashed', width: 1, opacity: 0.7 },
        label: { show: false },
        data: [{ xAxis: props.year }],
      },
    })
  } else {
    series[0].markLine = {
      silent: true, symbol: 'none',
      lineStyle: { color: axisText(), type: 'dashed', width: 1, opacity: 0.7 },
      label: { show: false },
      data: [{ xAxis: props.year }],
    }
  }

  return {
    backgroundColor: 'transparent',
    animation: !props.printMode,
    animationDuration: props.printMode ? 0 : 600,
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v: any) => (typeof v === 'number' ? fmtUSD(v) : v),
    },
    legend: {
      data: props.natEnabled ? ['Subsidy', 'Fees', '$NAT'] : ['Subsidy', 'Fees'],
      top: 4, textStyle: { color: axisText() },
    },
    grid: { left: 8, right: 24, top: 44, bottom: 36, containLabel: true },
    xAxis: {
      type: 'value', min: YEAR_MIN, max: YEAR_MAX,
      interval: 20,
      axisLine: { lineStyle: { color: grid() } },
      axisTick: { show: false },
      axisLabel: { color: axisText(), formatter: (v: number) => String(v) },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'log', min: 10, max: props.yMax,
      name: 'Security $/block (log)',
      nameTextStyle: { color: axisText(), align: 'left' },
      nameGap: 12,
      axisLine: { lineStyle: { color: grid() } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: grid() } },
      axisLabel: { color: axisText(), formatter: (v: number) => fmtUSD(v) },
    },
    series,
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
