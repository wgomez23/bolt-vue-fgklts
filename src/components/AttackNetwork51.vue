<template>
  <div ref="root" class="relative w-full h-[320px] md:h-[420px]" style="content-visibility: auto; contain: layout paint size; pointer-events: none;">
    <svg class="absolute inset-0 w-full h-full" viewBox="-220 -220 440 440" preserveAspectRatio="xMidYMid meet">
      <defs>
        <!-- Color defs -->
        <linearGradient id="edgeOrange" x1="-220" y1="-220" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#F7931A" />
          <stop offset="100%" stop-color="#FFB347" />
        </linearGradient>
        
        <!-- Glow filter that matches the element's current stroke/fill color -->
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g ref="scene" :style="{ transformOrigin: 'center center' }">
        <!-- Nodes (squares) -->
        <g>
          <rect
            v-for="n in ringNodes"
            :key="n.id"
            :x="n.x - nodeSize/2" :y="n.y - nodeSize/2"
            :width="nodeSize" :height="nodeSize" rx="3"
            shape-rendering="optimizeSpeed"
            :ref="el => registerNode(n.id, el as SVGRectElement)"
            :data-id="n.id"
            :style="{
              willChange: 'transform, opacity',
              opacity: 0,
              transform: 'scale(0.8)',
              transformOrigin: 'center',
              transformBox: 'fill-box',
              fill: baseNodeColor,
              transition: 'opacity 500ms ease-out, transform 500ms ease-out'
            }"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
const props = defineProps<{ enableGlow?: boolean }>()

// Utility sleep for reliable delays
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

// CSS animation helpers (rely on inline transitions already applied to rects)
function setNode(el: SVGRectElement, styles: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, styles)
}
function waitForTransitions(ms: number) { return sleep(ms) }

// Visual config
const nodeSize = 10
const baseNodeColor = '#F7931A'
const attackColor = '#FF4D4D'

// Layout: grid
const GRID_ROWS = 10
const GRID_COLS = 16
const GRID_X_MIN = -180
const GRID_X_MAX = 180
const GRID_Y_MIN = -160
const GRID_Y_MAX = 160

// Build nodes (grid). 'ring' is the row index (1-based). 'angle' unused here.
interface Node { id: string; x: number; y: number; ring: number; angle: number }
const ringNodes = computed<Node[]>(() => {
  const nodes: Node[] = []
  const dx = (GRID_X_MAX - GRID_X_MIN) / (GRID_COLS - 1)
  const dy = (GRID_Y_MAX - GRID_Y_MIN) / (GRID_ROWS - 1)
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const x = GRID_X_MIN + c * dx
      const y = GRID_Y_MIN + r * dy
      nodes.push({ id: `g${r}-${c}`, x, y, ring: r + 1, angle: 0 })
    }
  }
  return nodes
})

// Angle helper not used in grid version

// No edges for the grid look

// Element refs
const root = ref<HTMLElement | null>(null)
const scene = ref<SVGGElement | null>(null)
const nodeEls = new Map<string, SVGRectElement>()
// No edge elements in grid version

function registerNode(id: string, el: SVGRectElement | null) {
  if (!el) return
  nodeEls.set(id, el)
}
// registerEdge removed (no edges)

// Helpers

// Scroll trigger
let io: IntersectionObserver | null = null
let played = false

onMounted(async () => {
  // Initial camera state
  if (scene.value) scene.value.style.transform = 'translate(0px, 0px) scale(0.95) rotate(0deg)'

  // Prep nodes
  await nextTick()
  // If ref callbacks didn't populate, hydrate from DOM
  if (nodeEls.size === 0 && root.value) {
    const rects = root.value.querySelectorAll('rect[data-id]')
    rects.forEach((el) => {
      const id = (el as SVGRectElement).dataset.id
      if (id) nodeEls.set(id, el as SVGRectElement)
    })
  }
  nodeEls.forEach((el) => {
    el.style.opacity = '0'
    el.style.transform = 'scale(0.8)'
    el.style.transformOrigin = 'center'
    // Use inline style to override `.prose` SVG defaults
    el.style.fill = baseNodeColor
    // Ensure heavy filters are not applied initially
    el.removeAttribute('filter')
  })
  
  // Setup Intersection Observer for scroll-based trigger
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting) {
        start()
        if (root.value && io) io.unobserve(root.value)
        io = null
      }
    }, { 
      threshold: 0.1, // Trigger when 10% of the element is visible
      rootMargin: '0px 0px -15% 0px' // 15% bottom margin to trigger slightly before scrolled into view
    })
    
    if (root.value) io.observe(root.value)
  }
})

onBeforeUnmount(() => {
  if (root.value && io) io.unobserve(root.value)
  io = null
})

async function start() {
  if (played) return
  played = true

  // Grid draw-in: reveal row by row
  for (let r = 1; r <= GRID_ROWS; r++) {
    await revealNodes(r, 0.02)
  }

  // Short pause
  await sleep(200)

  // No camera pan for the grid version
  const camera = Promise.resolve()

  // Keep nodes bright during takeover; dim neutrals after reds finish
  await Promise.all([camera])

  // Take-over: convert 68% of squares from the right side
  const nodesSorted = ringNodes.value.slice().sort((a, b) => b.x - a.x)
  const targetCount = Math.ceil(nodesSorted.length * 0.68)
  const batchSize = 20
  const clusterSet = new Set<string>()

  for (let start = 0; start < targetCount; start += batchSize) {
    const batch = nodesSorted.slice(start, Math.min(start + batchSize, targetCount))
    batch.forEach(n => clusterSet.add(n.id))

    // Animate new captured nodes to red and slightly larger (CSS transitions)
    const batchMaxDelay = (batch.length - 1) * 20
    batch.forEach((n, i) => {
      const el = nodeEls.get(n.id)
      if (!el) return
      el.style.fill = attackColor
      if (props.enableGlow) el.setAttribute('filter', 'url(#glow)')
      el.style.transitionDelay = `${i * 20}ms`
      setNode(el, { opacity: '1', transform: 'scale(1.45)' })
    })
    // Reset delays after this wave completes
    setTimeout(() => {
      batch.forEach((n) => {
        const el = nodeEls.get(n.id)
        if (el) el.style.transitionDelay = '0ms'
      })
    }, batchMaxDelay + 600)

    // No edges to animate in the grid version

    // Per-wave updates only affect captured (red) nodes

    await waitForTransitions(900)
    // brief beat between waves
    await sleep(120)
  }
  
  // After red squares are fully rendered, dim the remaining orange squares
  await waitForTransitions(300)
  const redSet = clusterSet
  ringNodes.value.forEach((n) => {
    if (!redSet.has(n.id)) {
      const el = nodeEls.get(n.id)
      if (el) setNode(el, { opacity: '0.22', transform: 'scale(0.9)' })
    }
  })
  
  // Cleanup: drop will-change hints to free resources after animation ends
  nodeEls.forEach((el) => { el.style.willChange = 'auto' })
}

// animateGroup removed (no edges)

async function revealNodes(ring: number, stepDelay: number) {
  const groupNodes = ringNodes.value.filter(n => n.ring === ring)
  const stepMs = stepDelay * 1000
  groupNodes.forEach((n, i) => {
    let el = nodeEls.get(n.id)
    if (!el && root.value) {
      const dom = root.value.querySelector(`rect[data-id="${n.id}"]`)
      if (dom) { el = dom as SVGRectElement; nodeEls.set(n.id, el) }
    }
    if (!el) return
    el!.style.transitionDelay = `${i * stepMs}ms`
    setNode(el!, { opacity: '1', transform: 'scale(1)' })
  })
  // Reset transition delays after wave completes
  setTimeout(() => {
    groupNodes.forEach((n) => {
      const el2 = nodeEls.get(n.id)
      if (el2) el2.style.transitionDelay = '0ms'
    })
  }, stepMs * groupNodes.length + 600)
  await waitForTransitions(stepMs * groupNodes.length + 500)
}
</script>

<style scoped>
:host { display: block; }
</style>
