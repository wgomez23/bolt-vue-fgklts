<template>
  <!-- Renders the slot at full precision; switches to its compact form only when the full form would overflow -->
  <div ref="box" class="relative min-w-0">
    <div aria-hidden="true" class="absolute inset-0 overflow-hidden invisible pointer-events-none">
      <div ref="probe" class="w-max whitespace-nowrap"><slot :compact="false" /></div>
    </div>
    <slot :compact="compact" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const box = ref<HTMLElement | null>(null)
const probe = ref<HTMLElement | null>(null)
const compact = ref(false)

function measure(): void {
  if (!box.value || !probe.value) return
  compact.value = probe.value.offsetWidth > box.value.clientWidth + 0.5
}

// The probe resizes when the text changes and the box when the layout does; either can flip the mode
let ro: ResizeObserver | undefined
onMounted(() => {
  ro = new ResizeObserver(measure)
  if (box.value) ro.observe(box.value)
  if (probe.value) ro.observe(probe.value)
  measure()
})
onBeforeUnmount(() => ro?.disconnect())
</script>
