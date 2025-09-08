<template>
  <!-- Fixed, bottom-pinned progress bar with a subtle track -->
  <div class="fixed left-0 right-0 bottom-0 z-50 pointer-events-none select-none" aria-hidden="true">
    <div class="relative w-full" :style="{ height }">
      <!-- Track -->
      <div class="absolute inset-0 bg-white/10" />
      <!-- Fill (animated with spring) -->
      <div ref="fill" class="absolute left-0 top-0 h-full"
           :style="{
             transform: `scaleX(${progress})`,
             transformOrigin: 'left center',
             background: barColor,
             boxShadow: glowShadow,
             width: '100%'
           }"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

// Props (optional customization)
const props = defineProps<{
  color?: string
  heightPx?: number
}>()

const fill = ref<HTMLDivElement | null>(null)

// Config
const barColor = props.color ?? '#F7931A' // Site orange
const height = (props.heightPx ?? 4) + 'px'
const glowShadow = `0 0 12px rgba(247, 147, 26, 0.55), 0 0 2px rgba(247, 147, 26, 0.8)`

// Spring state
const progress = ref(0) // rendered value [0..1]
let target = 0
let v = 0 // velocity

// Critically damped-ish spring params
const STIFFNESS = 140 // k
const DAMPING = 24    // c

let raf = 0
let last = 0

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function computeTargetFromScroll() {
  const doc = document.documentElement
  const scrollTop = doc.scrollTop
  const scrollHeight = doc.scrollHeight
  const viewport = window.innerHeight
  const scrollable = Math.max(1, scrollHeight - viewport)
  target = clamp(scrollTop / scrollable, 0, 1)
}

function frame(t: number) {
  const dt = Math.min(0.05, (t - last) / 1000 || 0) // cap dt for stability
  last = t

  // F = k(xd - x) - c*v
  const x = progress.value
  const force = STIFFNESS * (target - x) - DAMPING * v
  const a = force // mass=1
  v += a * dt
  const next = clamp(x + v * dt, 0, 1)
  progress.value = next

  if (fill.value) {
    fill.value.style.transform = `scaleX(${next})`
  }

  raf = requestAnimationFrame(frame)
}

function onScroll() { computeTargetFromScroll() }
function onResize() { computeTargetFromScroll() }

onMounted(() => {
  computeTargetFromScroll()
  last = performance.now()
  raf = requestAnimationFrame(frame)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
/* Ensure smooth, GPU-friendly animation */
:host { display: contents; }
</style>
