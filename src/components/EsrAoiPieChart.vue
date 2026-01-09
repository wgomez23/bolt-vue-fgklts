<template>
  <div ref="container" class="w-full h-full">
    <Motion v-if="visible" :initial="{ opacity: 0, y: 16 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.8, easing: 'ease-out' }" class="w-full h-full">
      <div class="w-full h-full">
        <v-chart :option="option" autoresize class="w-full h-full" />
      </div>
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

const props = withDefaults(defineProps<{ printMode?: boolean }>(), { printMode: false })

// Brand palette
const SECONDARY = '#00FF94' // green (use for ESR)
const DANGER = '#EF4444'    // red-500 (use for AOI)
const getAxisText = () => props.printMode ? '#374151' : '#9CA3AF'
const BLUE = '#3B82F6'      // blue-500 (use for Target ring)

const ESR = 4.8
const AOI = 95.2

const option = ref<EChartsOption>({
  backgroundColor: 'transparent',
  color: [SECONDARY, DANGER, BLUE],
  title: {
    text: `ESR\n${ESR}%`,
    left: 'center',
    top: '38%',
    textStyle: {
      color: getAxisText(),
      fontSize: 14,
      fontWeight: 'bold',
      lineHeight: 20,
      align: 'center'
    }
  },
  graphic: [
    {
      type: 'text',
      left: 10,
      top: 10,
      style: {
        text: 'Target ESR > 51%',
        fill: getAxisText(),
        fontSize: 11,
        fontWeight: 'normal'
      }
    }
  ],
  tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
  legend: {
    bottom: 0,
    textStyle: { color: getAxisText() },
    selectedMode: false,
    data: ['ESR', 'AOI', 'Target > 51%']
  },
  animation: !props.printMode,
  animationDuration: props.printMode ? 0 : 2000,
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
  // In print mode, show immediately without waiting for intersection
  if (props.printMode) {
    visible.value = true
    return
  }
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
