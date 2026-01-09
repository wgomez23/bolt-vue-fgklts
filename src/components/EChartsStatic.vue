<template>
  <div ref="chartContainer" class="w-full" :style="{ height: height + 'px' }">
    <v-chart
      v-if="mounted"
      :option="staticOption"
      :init-options="initOptions"
      autoresize
      class="w-full h-full"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  MarkLineComponent
} from 'echarts/components'
import type { EChartsOption } from 'echarts'

use([
  SVGRenderer,
  LineChart,
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  MarkLineComponent
])

interface Props {
  option: EChartsOption
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  height: 200
})

const chartContainer = ref<HTMLElement | null>(null)
const mounted = ref(false)

const initOptions = {
  renderer: 'svg' as const
}

const staticOption = computed<EChartsOption>(() => {
  return {
    ...props.option,
    animation: false,
    animationDuration: 0,
    animationEasing: undefined
  }
})

onMounted(() => {
  mounted.value = true
})
</script>
