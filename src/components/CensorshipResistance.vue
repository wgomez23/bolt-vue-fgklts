<template>
  <div ref="root" class="relative w-full h-[320px] md:h-[420px] flex items-center justify-center bg-transparent" style="content-visibility: auto; contain: layout paint size; pointer-events: auto; cursor: none; background: transparent;">
    <svg class="w-full h-full" viewBox="-220 -220 440 440" preserveAspectRatio="xMidYMid meet" style="background: transparent;">
      <defs>
        <!-- Glow filter that matches the element's current stroke/fill color -->
        <filter id="tx-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g ref="scene" :style="{ transformOrigin: 'center center' }">
        <!-- Transactions Grid -->
        <g ref="txG"></g>
        <!-- Cursor Indicator (red) -->
        <g ref="cursorG"></g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

// Visual config
const ORANGE = '#F7931A'

// World / layout
const NS = 'http://www.w3.org/2000/svg'
// Using SVG getScreenCTM for coordinate mapping

// Grid configuration
const GRID_COLS = 11
const GRID_ROWS = 8
const GRID_SPACING = 36 // px in viewBox units
const GRID_Y_OFFSET = -70 // shift grid slightly upward for balanced top/bottom margins
const CIRCLE_R = 6

// Interaction configuration
const INFLUENCE_RADIUS = 64 // radius where cursor repels
const FOLLOW = 0.22 // smoothing toward repulsion target
// Internal spring physics for return-to-home
const RETURN_K = 280 // spring stiffness
const RETURN_DAMP = 28 // damping
const CURSOR_R = 24
const CURSOR_COLOR = '#FF4D4D'
const EXTRA_PADDING = 20 // extra visual and physical gap beyond red radius + dot radius
const CLEARANCE = CURSOR_R + CIRCLE_R + EXTRA_PADDING
const GENTLE_REPEL = 16 // mild displacement at the center of influence

// Refs
const root = ref<HTMLElement | null>(null)
const scene = ref<SVGGElement | null>(null)
const txG = ref<SVGGElement | null>(null)
const cursorG = ref<SVGGElement | null>(null)

// Scroll trigger
let io: IntersectionObserver | null = null
let played = false
let running = false

// Runtime state
interface Dot {
  id: number
  el: SVGGElement
  circle: SVGCircleElement
  baseX: number
  baseY: number
  x: number
  y: number
  vx: number
  vy: number
}

function initCursorIndicator() {
  if (!cursorG.value) return
  const g = document.createElementNS(NS, 'g')
  g.style.willChange = 'transform, opacity'
  g.style.pointerEvents = 'none'
  g.style.setProperty('--cx', '0')
  g.style.setProperty('--cy', '0')
  g.setAttribute('style', `${g.getAttribute('style')}; transform: translate(calc(var(--cx) * 1px), calc(var(--cy) * 1px)); transform-box: fill-box;`)
  const c = document.createElementNS(NS, 'circle')
  c.setAttribute('r', String(CURSOR_R))
  c.setAttribute('cx', '0')
  c.setAttribute('cy', '0')
  c.setAttribute('fill', CURSOR_COLOR)
  c.setAttribute('filter', 'url(#tx-glow)')
  c.style.opacity = '0.9'
  g.appendChild(c)
  cursorG.value.appendChild(g)
  // store for quick updates
  cursorIndicator = g
}

let dotId = 0
const dots: Dot[] = []
const cleanups: Array<() => void> = []
let rafId = 0
let lastT = performance.now()

const cursor = { x: 0, y: 0, active: false }

// Helpers

function makeDot(x0: number, y0: number) {
  const g = document.createElementNS(NS, 'g')
  g.style.willChange = 'transform'
  g.style.transformOrigin = 'center'
  // Transform driven by CSS vars for smooth Motion control
  g.style.setProperty('--x', String(x0))
  g.style.setProperty('--y', String(y0))
  g.style.setProperty('--s', '1')
  g.setAttribute('transform', 'translate(0,0)')
  g.setAttribute('style', `${g.getAttribute('style')}; transform: translate(calc(var(--x) * 1px), calc(var(--y) * 1px)) scale(var(--s)); transform-box: fill-box;`)

  const c = document.createElementNS(NS, 'circle')
  c.setAttribute('r', String(CIRCLE_R))
  c.setAttribute('cx', '0')
  c.setAttribute('cy', '0')
  c.setAttribute('fill', ORANGE)
  c.setAttribute('filter', 'url(#tx-glow)')
  c.style.willChange = 'transform, opacity'
  g.appendChild(c)

  return { g, c }
}

 

onMounted(async () => {
  await nextTick()
  if (scene.value) scene.value.style.transform = 'translate(0px, 0px) scale(1)'

  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting) {
        start()
        if (root.value && io) io.unobserve(root.value)
        io = null
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -15% 0px' })
    if (root.value) io.observe(root.value)
  }
})

onBeforeUnmount(() => {
  running = false
  if (root.value && io) io.unobserve(root.value)
  io = null
  if (rafId) cancelAnimationFrame(rafId)
  cleanups.forEach(fn => { try { fn() } catch {} })
})

function start() {
  if (played) return
  played = true
  running = true

  initGrid()
  initCursorIndicator()
  addPointerHandlers()
  loop()
}

function initGrid() {
  if (!txG.value) return
  // compute centered grid
  const totalW = (GRID_COLS - 1) * GRID_SPACING
  const totalH = (GRID_ROWS - 1) * GRID_SPACING
  const x0 = -totalW / 2
  const y0 = -totalH / 2 + GRID_Y_OFFSET
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const bx = x0 + c * GRID_SPACING
      const by = y0 + r * GRID_SPACING
      const { g, c: circle } = makeDot(bx, by)
      txG.value.appendChild(g)
      const d: Dot = { id: ++dotId, el: g, circle, baseX: bx, baseY: by, x: bx, y: by, vx: 0, vy: 0 }
      dots.push(d)
    }
  }
}

function addPointerHandlers() {
  const el = root.value
  if (!el) return
  const getSvg = () => el.querySelector('svg') as SVGSVGElement | null
  const toViewBox = (clientX: number, clientY: number) => {
    const svg = getSvg()
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const inv = ctm.inverse()
    const P = pt.matrixTransform(inv)
    return { x: P.x, y: P.y }
  }

  const onMove = (e: PointerEvent) => {
    const p = toViewBox(e.clientX, e.clientY)
    cursor.x = p.x
    cursor.y = p.y
    cursor.active = true
    if (cursorIndicator) {
      cursorIndicator.style.setProperty('--cx', cursor.x.toFixed(3))
      cursorIndicator.style.setProperty('--cy', cursor.y.toFixed(3))
      cursorIndicator.style.opacity = '0.9'
    }
  }
  const onEnter = () => {
    cursor.active = true
    if (cursorIndicator) cursorIndicator.style.opacity = '0.9'
  }
  const onLeave = () => {
    cursor.active = false
    if (cursorIndicator) cursorIndicator.style.opacity = '0.0'
  }
  el.addEventListener('pointerenter', onEnter)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)
  // touch support
  el.addEventListener('touchmove', (e: TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    const p = toViewBox(t.clientX, t.clientY)
    cursor.x = p.x
    cursor.y = p.y
    cursor.active = true
    if (cursorIndicator) {
      cursorIndicator.style.setProperty('--cx', cursor.x.toFixed(3))
      cursorIndicator.style.setProperty('--cy', cursor.y.toFixed(3))
      cursorIndicator.style.opacity = '0.9'
    }
  }, { passive: true })
  el.addEventListener('touchend', onLeave)

  // store cleanup
  const cleanup = () => {
    el.removeEventListener('pointerenter', onEnter)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
    el.removeEventListener('touchend', onLeave)
  }
  cleanups.push(cleanup)
}

let cursorIndicator: SVGGElement | null = null

function loop() {
  if (!running) return
  try {
    const now = performance.now()
    const dt = Math.max(0.008, Math.min(0.033, (now - lastT) / 1000))
    lastT = now
    for (const d of dots) {
      // determine target based on cursor state
      let tx = d.baseX
      let ty = d.baseY
      if (cursor.active) {
        const dx = d.x - cursor.x
        const dy = d.y - cursor.y
        const dist = Math.hypot(dx, dy) || 0.0001
        const nx = dx / dist
        const ny = dy / dist
        if (dist < CLEARANCE) {
          tx = cursor.x + nx * CLEARANCE
          ty = cursor.y + ny * CLEARANCE
        } else if (dist < INFLUENCE_RADIUS) {
          const f = (INFLUENCE_RADIUS - dist) / INFLUENCE_RADIUS
          const mag = GENTLE_REPEL * f
          tx = d.baseX + nx * mag
          ty = d.baseY + ny * mag
        }
      }

      // two-part motion: direct follow toward repulsion target + spring toward home
      d.x += (tx - d.x) * FOLLOW
      d.y += (ty - d.y) * FOLLOW

      // spring to base (critically damped-ish)
      const ax = RETURN_K * (d.baseX - d.x) - RETURN_DAMP * d.vx
      const ay = RETURN_K * (d.baseY - d.y) - RETURN_DAMP * d.vy
      d.vx += ax * dt
      d.vy += ay * dt
      d.x += d.vx * dt
      d.y += d.vy * dt

      // enforce hard clearance from cursor after integration
      if (cursor.active) {
        const ndx = d.x - cursor.x
        const ndy = d.y - cursor.y
        const ndist = Math.hypot(ndx, ndy) || 0.0001
        if (ndist < CLEARANCE) {
          const nnx = ndx / ndist
          const nny = ndy / ndist
          d.x = cursor.x + nnx * CLEARANCE
          d.y = cursor.y + nny * CLEARANCE
          // damp velocity when clamped to avoid jitter
          d.vx *= 0.2
          d.vy *= 0.2
        }
      }

      // update DOM
      d.el.style.setProperty('--x', d.x.toFixed(3))
      d.el.style.setProperty('--y', d.y.toFixed(3))
    }
  } catch {
    // keep RAF alive
  }
  rafId = requestAnimationFrame(loop)
}

</script>

<style scoped>
:host { display: block; background: transparent !important; }
/* In case global prose styles set a background on SVGs */
svg { background: transparent !important; }
/* Ensure no nested element introduces a background */
:host * { background: transparent !important; }
</style>
