<template>
  <div ref="container" class="space-y-3">
    <Motion v-if="visible" :initial="{ opacity: 0, y: 16 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, easing: 'ease-out' }">
      <div class="w-full h-[300px] md:h-[360px]">
        <v-chart :option="option" autoresize class="w-full h-full" />
      </div>
      <p class="text-center text-gray-400 text-sm italic">
        Energy Security Ratio (ESR) vs Attack Opportunity Index (AOI)
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
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent, TitleComponent])

// Brand palette
const SECONDARY = '#00FF94' // green (use for ESR)
const DANGER = '#EF4444'    // red-500 (use for AOI)
const AXIS_TEXT = '#9CA3AF' // gray-400
const BLUE = '#3B82F6'      // blue-500 (use for Target ring)

const ESR = 4.8
const AOI = 95.2

const option = ref<EChartsOption>({
  backgroundColor: 'transparent',
  color: [SECONDARY, DANGER, BLUE],
  title: {
    text: `ESR\n${ESR}%`,
    left: 'center',
    top: 'center',
    subtext: 'Target ESR > 51%',
    subtextStyle: {
      color: AXIS_TEXT,
      fontSize: 12,
      fontWeight: 'normal',
      lineHeight: 16,
      align: 'center'
    },
    textStyle: {
      color: AXIS_TEXT,
      fontSize: 14,
      fontWeight: 'bold',
      lineHeight: 20,
      align: 'center'
    }
  },
  tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
  legend: {
    bottom: 0,
    textStyle: { color: AXIS_TEXT },
    selectedMode: false,
    data: ['ESR', 'AOI', 'Target > 51%']
  },
  animation: true,
  animationDuration: 2000,
  animationEasing: 'cubicOut',
  series: [
    {
      name: 'ESR vs AOI',
      type: 'pie',
      radius: ['60%', '74%'],
      center: ['50%', '44%'],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      data: [
        { value: ESR, name: 'ESR', itemStyle: { color: SECONDARY } },
        { value: AOI, name: 'AOI', itemStyle: { color: DANGER } }
      ]
    },
    // Thin interactive outer ring using pie to support hover + legend color
    {
      name: 'Target > 51%',
      type: 'pie',
      radius: ['82%', '86%'],
      center: ['50%', '44%'],
      avoidLabelOverlap: true,
      color: [BLUE, 'rgba(0,0,0,0)'],
      z: 3,
      label: { show: false },
      labelLine: { show: false },
      tooltip: {
        show: true,
        formatter: (params: any) => (params?.name === 'Target > 51%' ? 'Target > 51%' : '')
      },
      data: [
        { value: 51, name: 'Target > 51%', itemStyle: { color: BLUE } },
        { value: 49, name: '', itemStyle: { color: 'rgba(0,0,0,0)' } }
      ]
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
