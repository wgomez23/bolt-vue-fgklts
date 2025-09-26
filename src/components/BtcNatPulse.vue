<template>
  <div ref="root" class="w-full flex justify-center select-none" aria-label="Bitcoin and NAT pulse exchange animation">
    <div ref="viewport" :class="['relative w-full', fullWidth ? '' : 'max-w-[680px]', 'h-[160px] md:h-[180px]']">
      <!-- Faint guideline between logos -->
      <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-white/10"></div>

      <!-- Logos -->
      <img ref="btcRef" :src="btcUrl" alt="Bitcoin" class="absolute object-contain" :style="btcStyle"/>
      <img ref="natRef" :src="natUrl" alt="NAT" class="absolute object-contain rounded-full" :style="natStyle"/>

      <!-- Pulses layer -->
      <div ref="overlay" class="absolute inset-0 pointer-events-none"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const { fullWidth = false } = defineProps<{ fullWidth?: boolean }>()
import { animate as motionAnimate } from 'motion'
import btcUrl from '../assets/bitcoin.png'
import natUrl from '../assets/nat1.png'

// Wrapper to avoid TS generics friction
const A = (el: any, keyframes: any, options?: any) => (motionAnimate as any)(el, keyframes, options)

const root = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const overlay = ref<HTMLElement | null>(null)
const btcRef = ref<HTMLImageElement | null>(null)
const natRef = ref<HTMLImageElement | null>(null)

let running = false
let leftTimer: number | null = null
let rightTimer: number | null = null
let io: IntersectionObserver | null = null

// Responsive layout metrics
const logoSize = ref(84)
const gap = ref(220)

function updateMetrics() {
  const w = viewport.value?.clientWidth || 640
  // Size and spacing scale with width
  logoSize.value = Math.max(64, Math.min(100, Math.round(w * 0.12)))
  gap.value = Math.max(180, Math.min(320, Math.round(w * 0.45)))
  // Update positions
  applyLogoPositions()
}

function applyLogoPositions() {
  const vp = viewport.value
  const btc = btcRef.value
  const nat = natRef.value
  if (!vp || !btc || !nat) return
  const cx = Math.round(vp.clientWidth / 2)
  const cy = Math.round(vp.clientHeight / 2)
  const half = Math.round(logoSize.value / 2)
  btc.style.left = `${cx - gap.value / 2 - half}px`
  btc.style.top = `${cy - half}px`
  btc.style.width = `${logoSize.value}px`
  btc.style.height = `${logoSize.value}px`

  nat.style.left = `${cx + gap.value / 2 - half}px`
  nat.style.top = `${cy - half}px`
  nat.style.width = `${logoSize.value}px`
  nat.style.height = `${logoSize.value}px`
}

const btcStyle = computed(() => ({
  filter: 'drop-shadow(0 0 16px rgba(247,147,26,.25))'
}) as any)

const natStyle = computed(() => ({
  filter: 'drop-shadow(0 0 14px rgba(255,255,255,.25))'
}) as any)

function rand(min: number, max: number) { return Math.random() * (max - min) + min }

function spawnPulse(direction: 'ltr' | 'rtl') {
  const vp = viewport.value
  const ol = overlay.value
  if (!vp || !ol) return
  const w = vp.clientWidth
  const h = vp.clientHeight
  const cx = Math.round(w / 2)
  const cy = Math.round(h / 2)

  // Compute start/end x around logo edges
  const half = Math.round(logoSize.value / 2)
  const startX = direction === 'ltr' ? cx - gap.value / 2 + half : cx + gap.value / 2 - half
  const endX = direction === 'ltr' ? cx + gap.value / 2 - half : cx - gap.value / 2 + half

  const yOffset = Math.round(rand(-14, 14))
  const jitterY = Math.round(rand(-6, 6))
  const size = rand(6, 10)
  const dur = rand(0.9, 1.6)

  const dot = document.createElement('span')
  dot.setAttribute('aria-hidden', 'true')
  dot.style.position = 'absolute'
  dot.style.left = '0px'
  dot.style.top = '0px'
  dot.style.width = `${size}px`
  dot.style.height = `${size}px`
  // Make pulses square for a pixelated look
  dot.style.borderRadius = '0px'
  dot.style.willChange = 'transform, opacity, box-shadow'
  if (direction === 'ltr') {
    dot.style.background = '#F7931A'
    dot.style.boxShadow = '0 0 10px rgba(247,147,26,.7), 0 0 18px rgba(247,147,26,.45)'
  } else {
    dot.style.background = '#ffffff'
    dot.style.boxShadow = '0 0 10px rgba(255,255,255,.7), 0 0 18px rgba(255,255,255,.45)'
  }
  ol.appendChild(dot)

  const start = `translate(${startX}px, ${cy + yOffset}px) scale(${0.6 + Math.random() * 0.2})`
  const end = `translate(${endX}px, ${cy + yOffset + jitterY}px) scale(1)`

  // Trail effect by animating box-shadow intensity
  A(dot, { opacity: [0, 1, 1, 0], transform: [start, end] }, { duration: dur, easing: [0.22, 0.8, 0.2, 1] }).finished
    .finally(() => { dot.remove() })
}

function schedule(direction: 'ltr' | 'rtl') {
  const delay = rand(180, 700)
  const timer = window.setTimeout(() => {
    if (!running) return
    // Burst: 1–3 pulses per tick
    const burst = Math.round(rand(1, 3))
    for (let i = 0; i < burst; i++) {
      setTimeout(() => spawnPulse(direction), rand(0, 180))
    }
    schedule(direction)
  }, delay)
  if (direction === 'ltr') leftTimer = timer as any
  else rightTimer = timer as any
}

function start() {
  if (running) return
  running = true
  schedule('ltr')
  schedule('rtl')
}
function stop() {
  running = false
  if (leftTimer) { clearTimeout(leftTimer); leftTimer = null }
  if (rightTimer) { clearTimeout(rightTimer); rightTimer = null }
}

onMounted(() => {
  updateMetrics()
  const onResize = () => updateMetrics()
  window.addEventListener('resize', onResize)

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!prefersReduced) {
    // Pause when offscreen
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        const visible = entries.some(e => e.isIntersecting)
        if (visible) start(); else stop()
      }, { threshold: 0.2 })
      if (root.value) io.observe(root.value)
    } else {
      start()
    }
  }

  onBeforeUnmount(() => {
    stop()
    window.removeEventListener('resize', onResize)
    if (root.value && io) io.unobserve(root.value)
    io = null
  })
})
</script>

<style scoped>
/* no extra styles; all inline for performance */
</style>
