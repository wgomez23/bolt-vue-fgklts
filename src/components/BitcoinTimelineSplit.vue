<template>
  <div ref="root" class="w-full" aria-label="Bitcoin timeline split animation">
    <svg
      ref="svgEl"
      class="w-full h-auto"
      viewBox="0 0 900 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      :style="{ background: 'transparent' }"
    >
      <!-- Lines -->
      <path ref="mainPath" d="M 40 260 L 340 260" :stroke="lineColor" stroke-width="3" stroke-linecap="round" />
      <path ref="topPath" d="M 340 260 L 520 150" :stroke="lineColor" stroke-width="3" stroke-linecap="round" />
      <path ref="bottomPath" d="M 340 260 L 520 370" :stroke="lineColor" stroke-width="3" stroke-linecap="round" />

      <!-- Label -->
      <text x="80" y="245" :fill="labelColor" font-size="16" font-family="ui-sans-serif, system-ui">Bitcoin Timeline</text>

      <!-- Images and captions -->
      <image :href="ponzi" x="540" y="70" width="300" height="170" preserveAspectRatio="xMidYMid slice" />
      <text x="690" y="255" text-anchor="middle" :fill="captionColor" font-size="14" font-family="ui-sans-serif, system-ui">Bitcoin running at a loss</text>

      <image :href="subsidy" x="540" y="300" width="300" height="170" preserveAspectRatio="xMidYMid slice" />
      <text x="690" y="485" text-anchor="middle" :fill="captionColor" font-size="14" font-family="ui-sans-serif, system-ui">Bitcoin with sound economic incentives</text>

      <!-- Animated dots -->
      <g v-show="phase === 'main'">
        <circle ref="mainDot" class="dot" :r="6" :fill="pulseColor" />
        <circle ref="mainDotHalo" class="halo" :r="10" :fill="pulseColor" opacity="0.25" />
      </g>
      <g v-show="phase === 'split'">
        <circle ref="topDot" class="dot" :r="6" :fill="pulseColor" />
        <circle ref="topDotHalo" class="halo" :r="10" :fill="pulseColor" opacity="0.25" />
        <circle ref="bottomDot" class="dot" :r="6" :fill="pulseColor" />
        <circle ref="bottomDotHalo" class="halo" :r="10" :fill="pulseColor" opacity="0.25" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import ponzi from '../assets/ponzi.png'
import subsidy from '../assets/subsidy.png'

const root = ref<HTMLDivElement | null>(null)
const svgEl = ref<SVGSVGElement | null>(null)
const mainPath = ref<SVGPathElement | null>(null)
const topPath = ref<SVGPathElement | null>(null)
const bottomPath = ref<SVGPathElement | null>(null)

const mainDot = ref<SVGCircleElement | null>(null)
const mainDotHalo = ref<SVGCircleElement | null>(null)
const topDot = ref<SVGCircleElement | null>(null)
const topDotHalo = ref<SVGCircleElement | null>(null)
const bottomDot = ref<SVGCircleElement | null>(null)
const bottomDotHalo = ref<SVGCircleElement | null>(null)

const lineColor = '#9CA3AF' // gray-400
const labelColor = '#CBD5E1' // slate-300
const captionColor = '#E5E7EB' // gray-200
const pulseColor = '#F97316' // orange-500

let rafId = 0
let active = true
let started = 0

// Durations in ms
const MAIN_DUR = 1400
const BRANCH_DUR = 1400
const PAUSE = 400
const TOTAL = MAIN_DUR + BRANCH_DUR + PAUSE

let mainLen = 0
let topLen = 0
let bottomLen = 0

const phase = ref<'main' | 'split'>('main')

const positionCircle = (circle: SVGCircleElement | null, x: number, y: number) => {
  if (!circle) return
  circle.setAttribute('cx', String(x))
  circle.setAttribute('cy', String(y))
}

const animate = (now: number) => {
  if (!active) return
  if (!started) started = now
  const elapsed = (now - started) % TOTAL

  if (!mainPath.value || !topPath.value || !bottomPath.value) {
    rafId = requestAnimationFrame(animate)
    return
  }

  if (elapsed < MAIN_DUR) {
    // Move along main path
    phase.value = 'main'
    const t = elapsed / MAIN_DUR
    const p = mainPath.value.getPointAtLength(mainLen * t)
    positionCircle(mainDot.value, p.x, p.y)
    positionCircle(mainDotHalo.value, p.x, p.y)
  } else if (elapsed < MAIN_DUR + BRANCH_DUR) {
    // Split along both branches
    phase.value = 'split'
    const t = (elapsed - MAIN_DUR) / BRANCH_DUR
    const pTop = topPath.value.getPointAtLength(topLen * t)
    const pBot = bottomPath.value.getPointAtLength(bottomLen * t)
    positionCircle(topDot.value, pTop.x, pTop.y)
    positionCircle(topDotHalo.value, pTop.x, pTop.y)
    positionCircle(bottomDot.value, pBot.x, pBot.y)
    positionCircle(bottomDotHalo.value, pBot.x, pBot.y)
  } else {
    // Pause (keep last position)
  }

  rafId = requestAnimationFrame(animate)
}

const resize = () => {
  // No-op: using viewBox; but recompute lengths in case of dynamic changes
  if (mainPath.value) mainLen = mainPath.value.getTotalLength()
  if (topPath.value) topLen = topPath.value.getTotalLength()
  if (bottomPath.value) bottomLen = bottomPath.value.getTotalLength()
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  started = performance.now()
  active = true
  rafId = requestAnimationFrame(animate)

  // Pause when offscreen
  if (root.value) {
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      const shouldRun = entry.isIntersecting && entry.intersectionRatio > 0
      if (shouldRun && !active) {
        active = true
        started = performance.now()
        rafId = requestAnimationFrame(animate)
      } else if (!shouldRun && active) {
        active = false
        cancelAnimationFrame(rafId)
      }
    }, { threshold: [0, 0.1, 0.25, 0.5, 1] })
    observer.observe(root.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  cancelAnimationFrame(rafId)
  if (observer && root.value) observer.unobserve(root.value)
})
</script>

<style scoped>
/* Subtle pulsing for halos */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.25; }
  50% { transform: scale(1.8); opacity: 0; }
}
.halo {
  animation: pulse 1.2s infinite;
  transform-origin: center;
}

.dot {
  filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.8));
}
</style>
