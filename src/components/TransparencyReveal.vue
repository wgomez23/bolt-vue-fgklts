<template>
  <div
    ref="root"
    class="relative w-full h-full select-none"
    style="content-visibility: auto; contain: layout paint size; cursor: none;"
  >
    <!-- Base text (full, crisp) -->
    <div class="absolute inset-0 flex items-center justify-center">
      <h3 class="transparency-text">Are you $NAT entertained?</h3>
    </div>

    <!-- Frosted glass overlay that obscures the base text -->
    <div
      class="absolute inset-0 z-10 rounded-md"
      style="backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(12px); background: transparent; pointer-events: none;"
    ></div>

    <!-- Revealed, crisp text masked to the moving window (topmost for clarity) -->
    <div
      ref="maskText"
      class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none mask-window"
      :style="maskStyle"
    >
      <h3 class="transparency-text">Are you $NAT entertained?</h3>
    </div>

    <!-- Visual lens frame following the cursor (rounded square with subtle shadow) -->
    <div
      ref="lens"
      class="absolute z-30 pointer-events-none"
      :style="lensStyle"
      aria-hidden="true"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const root = ref<HTMLElement | null>(null)
const maskText = ref<HTMLElement | null>(null)
const lens = ref<HTMLElement | null>(null)

// Reactive sizing
const cwRef = ref(0)
const chRef = ref(0)
const lensSizeRef = ref(180)
const radiusRef = ref(16)

// Visibility for lens frame
const lensVisible = ref(false)

const lensStyle = computed(() => ({
  width: lensSizeRef.value + 'px',
  height: lensSizeRef.value + 'px',
  borderRadius: radiusRef.value + 'px',
  boxShadow: '0 10px 28px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.28)',
  outline: '1px solid rgba(255,255,255,0)',
  background: 'transparent',
  top: '0px',
  left: '0px',
  transform: 'translate3d(0px, 0px, 0)',
  opacity: lensVisible.value ? 1 : 0,
  willChange: 'transform, opacity',
}))

const maskStyle = computed(() => ({
  // Use CSS variables so we can animate them type-safely
  ['--t' as any]: chRef.value + 'px',
  ['--r' as any]: '0px',
  ['--b' as any]: '0px',
  ['--l' as any]: cwRef.value + 'px',
  ['--radius' as any]: radiusRef.value + 'px',
}))

// Follow factor (1 = exact tracking; < 1 introduces smoothing)
const FOLLOW = 1

function updateContainerRect() {
  if (!root.value) return
  const r = root.value.getBoundingClientRect()
  cwRef.value = Math.max(0, Math.floor(r.width))
  chRef.value = Math.max(0, Math.floor(r.height))
  // Pick a lens size relative to container
  const minSide = Math.min(cwRef.value, chRef.value)
  const large = Math.min(260, Math.floor(minSide * 0.55))
  const small = Math.min(200, Math.floor(minSide * 0.5))
  lensSizeRef.value = window.matchMedia('(min-width: 768px)').matches ? large : small
  radiusRef.value = Math.max(12, Math.floor(lensSizeRef.value * 0.08))
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }

function moveLensTo(clientX: number, clientY: number) {
  if (!root.value) return
  const rect = root.value.getBoundingClientRect()
  const x = clientX - rect.left
  const y = clientY - rect.top
  const half = lensSizeRef.value / 2
  // Target center inside bounds
  targetCx.value = clamp(x, half, Math.max(half, cwRef.value - half))
  targetCy.value = clamp(y, half, Math.max(half, chRef.value - half))
  // Ensure loop is running
  if (!rafId) rafId = requestAnimationFrame(loop)
}

let onPointerMove: (e: PointerEvent) => void
let onPointerEnter: () => void
let onPointerLeave: () => void
let onTouchMove: (e: TouchEvent) => void
let onResize: () => void

// rAF loop state
const currentCx = ref(0)
const currentCy = ref(0)
const targetCx = ref(0)
const targetCy = ref(0)
let rafId = 0

function applyLensAndMask(cx: number, cy: number) {
  const half = lensSizeRef.value / 2
  const left = Math.max(0, cx - half)
  const top = Math.max(0, cy - half)
  const right = Math.max(0, cwRef.value - (cx + half))
  const bottom = Math.max(0, chRef.value - (cy + half))
  if (lens.value) lens.value.style.transform = `translate3d(${left}px, ${top}px, 0)`
  if (maskText.value) {
    const s = maskText.value.style as CSSStyleDeclaration
    s.setProperty('--t', `${top}px`)
    s.setProperty('--r', `${right}px`)
    s.setProperty('--b', `${bottom}px`)
    s.setProperty('--l', `${left}px`)
    s.setProperty('--radius', `${radiusRef.value}px`)
  }
}

function loop() {
  // Move instantly to target for precise tracking (FOLLOW=1)
  currentCx.value += (targetCx.value - currentCx.value) * FOLLOW
  currentCy.value += (targetCy.value - currentCy.value) * FOLLOW
  applyLensAndMask(currentCx.value, currentCy.value)
  // Continue while pointer is inside (lensVisible)
  if (lensVisible.value) {
    rafId = requestAnimationFrame(loop)
  } else {
    rafId = 0
  }
}

onMounted(() => {
  updateContainerRect()
  // Initialize center to container center for first render
  currentCx.value = cwRef.value / 2
  currentCy.value = chRef.value / 2
  targetCx.value = currentCx.value
  targetCy.value = currentCy.value
  applyLensAndMask(currentCx.value, currentCy.value)

  onResize = () => {
    updateContainerRect()
  }

  onPointerMove = (e: PointerEvent) => {
    lensVisible.value = true
    // Compute once and update immediately to eliminate perceived lag
    const rect = root.value!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const half = lensSizeRef.value / 2
    const cx = clamp(x, half, Math.max(half, cwRef.value - half))
    const cy = clamp(y, half, Math.max(half, chRef.value - half))
    currentCx.value = targetCx.value = cx
    currentCy.value = targetCy.value = cy
    applyLensAndMask(cx, cy)
    if (!rafId) rafId = requestAnimationFrame(loop)
  }

  onPointerEnter = () => {
    lensVisible.value = true
    if (!rafId) rafId = requestAnimationFrame(loop)
  }

  onPointerLeave = () => {
    lensVisible.value = false
    // Hide the mask by clipping to an empty region
    if (maskText.value) {
      const s = maskText.value.style as CSSStyleDeclaration
      s.setProperty('--t', `${chRef.value}px`)
      s.setProperty('--r', '0px')
      s.setProperty('--b', '0px')
      s.setProperty('--l', `${cwRef.value}px`)
      s.setProperty('--radius', `${radiusRef.value}px`)
    }
    if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
  }

  onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    lensVisible.value = true
    moveLensTo(t.clientX, t.clientY)
  }

  window.addEventListener('resize', onResize)
  const el = root.value!
  el.addEventListener('pointerenter', onPointerEnter)
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)
  el.addEventListener('touchmove', onTouchMove, { passive: true })
  el.addEventListener('touchend', onPointerLeave as any)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  const el = root.value
  if (el) {
    el.removeEventListener('pointerenter', onPointerEnter)
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerleave', onPointerLeave)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onPointerLeave as any)
  }
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.transparency-text {
  font-weight: 800;
  text-align: center;
  color: white;
  letter-spacing: -0.02em;
  /* Responsive sizes similar to page headings */
  font-size: clamp(28px, 5.5vw, 64px);
  line-height: 1.05;
}

/* Window that reveals crisp text beneath the frosted glass using a dynamic clip-path */
.mask-window {
  clip-path: inset(var(--t) var(--r) var(--b) var(--l) round var(--radius));
  -webkit-clip-path: inset(var(--t) var(--r) var(--b) var(--l) round var(--radius));
  will-change: clip-path;
}
</style>
