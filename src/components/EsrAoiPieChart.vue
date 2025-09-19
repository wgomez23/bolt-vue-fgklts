<template>
  <div ref="container" class="space-y-3">
    <Motion v-if="visible" :initial="{ opacity: 0, y: 16 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, easing: 'ease-out' }">
      <div class="w-full h-[260px] md:h-[300px]">
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

const ESR = 4.8
const AOI = 95.2

const option = ref<EChartsOption>({
  backgroundColor: 'transparent',
  color: [SECONDARY, DANGER],
  title: {
    text: `ESR\n${ESR}%`,
    left: 'center',
    top: 'center',
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
    data: ['ESR', 'AOI']
  },
  animation: true,
  animationDuration: 2000,
  animationEasing: 'cubicOut',
  series: [
    {
      name: 'ESR vs AOI',
      type: 'pie',
      radius: ['60%', '80%'],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      data: [
        { value: ESR, name: 'ESR', itemStyle: { color: SECONDARY } },
        { value: AOI, name: 'AOI', itemStyle: { color: DANGER } }
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
