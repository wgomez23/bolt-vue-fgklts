<template>
  <div
    ref="root"
    class="relative w-full h-[220px] md:h-[260px] mt-4"
    style="content-visibility: auto; contain: layout paint size; pointer-events: none;"
  >
    <svg class="absolute inset-0 w-full h-full" viewBox="-140 -140 280 280" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="white-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="orange-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Rotating group: holds radial lines and white dots -->
      <g ref="orbit" :style="{ transformOrigin: '50% 50%', transformBox: 'view-box' }">
        <g
          v-for="(angle, i) in angles"
          :key="i"
          :transform="`rotate(${angle})`"
          :style="{ willChange: 'transform', transformOrigin: '0 0', transformBox: 'view-box' }"
        >
          <!-- Radial connector line (drawn from center to target radius) -->
          <line
            :ref="el => registerLine(i, el as SVGLineElement)"
            :x1="centerR" y1="0" :x2="radius" y2="0"
            stroke="#ffffff" stroke-linecap="round"
            :stroke-width="lineWidth"
            vector-effect="non-scaling-stroke"
            :style="{ strokeDasharray: lineLen + ' ' + lineLen, strokeDashoffset: String(lineLen), opacity: 1, willChange: 'stroke-dashoffset' }"
          />
          <!-- White orbiting dot (starts at center, translates outward along the rotated axis) -->
          <circle
            :ref="el => registerDot(i, el as SVGCircleElement)"
            r="10" cx="0" cy="0" fill="#ffffff"
            filter="url(#white-glow)"
            :style="{ willChange: 'transform', transformOrigin: 'center', transformBox: 'fill-box' }"
          />
        </g>
        <!-- Orbit outline on top (fades in during rotation, out before collapse) -->
        <circle
          ref="ring"
          :r="radius"
          cx="0" cy="0"
          fill="none"
          stroke="#ffffff"
          :stroke-width="Math.max(1, lineWidth - 3)"
          vector-effect="non-scaling-stroke"
          filter="url(#white-glow)"
          :style="{ opacity: 0 }"
        />
      </g>

      <!-- Center orange circle on top so dots appear to emerge from behind it -->
      <circle :r="centerR" cx="0" cy="0" fill="#F7931A" filter="url(#orange-glow)" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { animate as motionAnimate } from 'motion'

// Small wrapper to avoid TS issues with generic elements
const A = (el: any, keyframes: any, options?: any) => (motionAnimate as any)(el, keyframes, options)

// Visual/layout constants (in SVG viewBox units)
const DOT_COUNT = 6
const radius = 100 // distance from center for white dots
const centerR = 22
const lineWidth = 5
const lineLen = radius - centerR

const angles = computed(() => Array.from({ length: DOT_COUNT }, (_, i) => (360 / DOT_COUNT) * i))

const root = ref<HTMLElement | null>(null)
const orbit = ref<SVGGElement | null>(null)
const ring = ref<SVGCircleElement | null>(null)
const dotEls = new Map<number, SVGCircleElement>()
const lineEls = new Map<number, SVGLineElement>()

function registerDot(i: number, el: SVGCircleElement | null) { if (el) dotEls.set(i, el) }
function registerLine(i: number, el: SVGLineElement | null) { if (el) lineEls.set(i, el) }

let running = false
let io: IntersectionObserver | null = null
let currentAnims: Array<{ cancel?: () => void; finished?: Promise<any> }> = []

function cancelAll() {
  currentAnims.forEach(c => { try { c.cancel?.() } catch {} })
  currentAnims = []
}

function sleep(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

async function cycleOnce() {
  // Prepare initial state
  if (ring.value) ring.value.style.opacity = '0'
  dotEls.forEach((dot) => {
    try { dot.style.transform = '' } catch {}
    dot.setAttribute('cx', '0')
    dot.setAttribute('cy', '0')
  })
  lineEls.forEach((line) => {
    line.style.strokeDashoffset = '0'
    line.setAttribute('x2', String(centerR))
  })
  if (orbit.value) orbit.value.style.transform = 'rotate(0deg)'

  // Expansion: stagger dots outward and draw lines
  const STAGGER = 120 // ms
  const expandDuration = 650 // ms per item
  const expandAnims: any[] = []
  for (let i = 0; i < DOT_COUNT; i++) {
    const dot = dotEls.get(i)
    const line = lineEls.get(i)
    if (!dot || !line) continue
    const d = A(dot, { cx: [0, radius] }, { duration: expandDuration / 1000, easing: [0.22, 0.8, 0.2, 1], delay: (STAGGER * i) / 1000 })
    const l = A(0, 1, {
      duration: expandDuration / 1000,
      easing: 'ease-out',
      delay: (STAGGER * i) / 1000,
      onUpdate: (t: number) => {
        const x = Math.max(centerR, t * radius)
        line.setAttribute('x2', String(x))
      }
    })
    expandAnims.push(d, l)
    currentAnims.push(d, l)
  }
  // Wait for last staggered item
  await sleep(STAGGER * (DOT_COUNT - 1) + expandDuration + 150)

  // Orbit: rotate the whole group once
  if (orbit.value) {
    // Fade in ring while rotation begins
    if (ring.value) {
      ring.value.style.opacity = '1' // force visible in case animation is throttled
      const ringIn = A(ring.value, { opacity: [0, 1] }, { duration: 0.6, easing: 'ease-in' })
      currentAnims.push(ringIn)
    }
    const rot = A(orbit.value, { transform: ['rotate(0deg)', 'rotate(360deg)'] }, { duration: 5.0, easing: 'linear' })
    currentAnims.push(rot)
    await rot.finished
    // Before collapse, fade the ring out
    if (ring.value) {
      try { await A(ring.value, { opacity: [1, 0] }, { duration: 0.45, easing: 'ease-out' }).finished } finally { ring.value!.style.opacity = '0' }
    }
  } else {
    await sleep(1500)
  }

  // Collapse: stagger back inward
  const collapseDuration = 520
  for (let i = 0; i < DOT_COUNT; i++) {
    const dot = dotEls.get(i)
    const line = lineEls.get(i)
    if (!dot || !line) continue
    const d = A(dot, { cx: [radius, 0] }, { duration: collapseDuration / 1000, easing: 'ease-in', delay: (STAGGER * i) / 1000 })
    const l = A(1, 0, {
      duration: collapseDuration / 1000,
      easing: 'ease-in',
      delay: (STAGGER * i) / 1000,
      onUpdate: (t: number) => {
        const x = Math.max(centerR, t * radius)
        line.setAttribute('x2', String(x))
      }
    })
    currentAnims.push(d, l)
  }
  await sleep(STAGGER * (DOT_COUNT - 1) + collapseDuration + 250)
}

async function loop() {
  running = true
  // Respect prefers-reduced-motion
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return
  while (running) {
    await nextTick()
    await cycleOnce()
  }
}

onMounted(async () => {
  await nextTick()
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      const e = entries[0]
      const visible = !!e?.isIntersecting
      if (visible && !running) {
        cancelAll()
        loop()
      } else if (!visible && running) {
        running = false
        cancelAll()
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' })
    if (root.value) io.observe(root.value)
  } else {
    loop()
  }
})

onBeforeUnmount(() => {
  running = false
  cancelAll()
  if (root.value && io) io.unobserve(root.value)
  io = null
})
</script>

<style scoped>
:host { display: block; }
</style>
