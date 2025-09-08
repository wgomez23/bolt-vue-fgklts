<template>
  <div ref="root" class="root relative w-full h-full" style="background: transparent;">
    <svg class="absolute inset-0 w-full h-full" viewBox="-220 -220 440 440" preserveAspectRatio="xMidYMid meet" style="background: transparent;">
      <defs>
        <linearGradient id="netGrad" x1="-220" y1="-220" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#F7931A" />
          <stop offset="100%" stop-color="#00FF94" />
        </linearGradient>
      </defs>
      <g ref="scene" :style="{ transformOrigin: 'center center' }">
        <!-- Edges -->
        <g>
          <line
            v-for="e in edges"
            :key="e.id"
            :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2"
            stroke="url(#netGrad)"
            stroke-width="1.6"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
            :stroke-dasharray="lengthOf(e)"
            :stroke-dashoffset="lengthOf(e)"
            :ref="el => registerEdge(e.id, el as SVGLineElement)"
          />
        </g>
        
        <!-- Nodes -->
        <g>
          <!-- Center node -->
          <rect
            v-if="center"
            :x="center.x - centerSize/2" :y="center.y - centerSize/2"
            :width="centerSize" :height="centerSize" rx="4"
            fill="url(#netGrad)"
            :ref="el => centerEl = el as SVGRectElement"
            style="will-change: transform, opacity"
          />
          <!-- Ring nodes -->
          <rect
            v-for="n in ringNodes"
            :key="n.id"
            :x="n.x - nodeSize/2" :y="n.y - nodeSize/2"
            :width="nodeSize" :height="nodeSize" rx="3"
            fill="url(#netGrad)"
            opacity="0"
            :ref="el => registerNode(n.id, el as SVGRectElement)"
            style="will-change: transform, opacity"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { animate } from 'motion'

// Layout config
const centerSize = 22
const nodeSize = 12

const rings = [
  { radius: 60, count: 6 },
  { radius: 120, count: 12 },
  { radius: 180, count: 18 },
]

// Build nodes
interface Node { id: string; x: number; y: number; ring: number }
const center: Node = { id: 'c', x: 0, y: 0, ring: 0 }
const ringNodes = computed<Node[]>(() => {
  const nodes: Node[] = []
  rings.forEach((r, ri) => {
    const step = (Math.PI * 2) / r.count
    for (let i = 0; i < r.count; i++) {
      const angle = i * step + (ri % 2 === 0 ? 0 : step / 2)
      const x = Math.cos(angle) * r.radius
      const y = Math.sin(angle) * r.radius
      nodes.push({ id: `r${ri+1}-${i}`, x, y, ring: ri+1 })
    }
  })
  return nodes
})

// Build edges for a mesh network: intra-ring connections + cross-ring nearest neighbors
interface Edge { id: string; x1: number; y1: number; x2: number; y2: number; group: number }
const edges = computed<Edge[]>(() => {
  const out: Edge[] = []
  const r1 = ringNodes.value.filter(n => n.ring === 1)
  const r2 = ringNodes.value.filter(n => n.ring === 2)
  const r3 = ringNodes.value.filter(n => n.ring === 3)

  const pushEdge = (id: string, a: Node, b: Node, group: number) => {
    out.push({ id, x1: a.x, y1: a.y, x2: b.x, y2: b.y, group })
  }

  // helper: connect each node to its next 1st and 2nd neighbors within a ring
  const connectNeighbors = (nodes: Node[], ringIndex: number) => {
    const L = nodes.length
    if (L === 0) return
    nodes.forEach((n, i) => {
      const n1 = nodes[(i + 1) % L]
      const n2 = nodes[(i + 2) % L]
      pushEdge(`g${ringIndex}-intra-${i}-1`, n, n1, ringIndex)
      pushEdge(`g${ringIndex}-intra-${i}-2`, n, n2, ringIndex)
    })
  }

  // helper: connect from ring A to nearest neighbors in ring B
  const connectAcross = (from: Node[], to: Node[], group: number, tag: string) => {
    const N = from.length
    const M = to.length
    if (N === 0 || M === 0) return
    from.forEach((n, i) => {
      const j = Math.round((i * M) / N) % M
      const t0 = to[j]
      const t1 = to[(j + 1) % M]
      pushEdge(`g${group}-${tag}-${i}-a`, n, t0, group)
      pushEdge(`g${group}-${tag}-${i}-b`, n, t1, group)
    })
  }

  // Ring 1: intra + cross to ring 2
  connectNeighbors(r1, 1)
  connectAcross(r1, r2, 1, 'r1r2')

  // Ring 2: intra + cross to ring 3
  connectNeighbors(r2, 2)
  connectAcross(r2, r3, 2, 'r2r3')

  // Ring 3: intra only
  connectNeighbors(r3, 3)

  return out
})

// Element refs
const root = ref<HTMLElement | null>(null)
const scene = ref<SVGGElement | null>(null)
let centerEl: SVGRectElement | null = null
const nodeEls = new Map<string, SVGRectElement>()
const edgeEls = new Map<string, SVGLineElement>()

function registerNode(id: string, el: SVGRectElement | null) {
  if (!el) return
  nodeEls.set(id, el)
}
function registerEdge(id: string, el: SVGLineElement | null) {
  if (!el) return
  edgeEls.set(id, el)
}

// Edge length helper (dash values bound in template)
function lengthOf(e: Edge) { return Math.hypot(e.x2 - e.x1, e.y2 - e.y1) }

// Scroll trigger
const visible = ref(false)
let io: IntersectionObserver | null = null
let played = false

onMounted(() => {
  // Prep initial states
  if (scene.value) scene.value.style.transform = 'rotate(90deg) scale(2.15)'
  if (centerEl) {
    centerEl.style.opacity = '0'
    centerEl.style.transform = 'scale(2.25)'
    centerEl.style.transformOrigin = 'center'
  }
  nodeEls.forEach((el) => {
    el.style.opacity = '0'
    el.style.transform = 'scale(0.6)'
    el.style.transformOrigin = 'center'
  })

  // IO
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    visible.value = true
    start()
  } else {
    io = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry && entry.isIntersecting) {
        visible.value = true
        start()
        if (root.value && io) io.unobserve(root.value)
        io = null
      }
    }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' })
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

  // Camera zoom out over the whole sequence
  if (scene.value) {
    animate(scene.value, { transform: ['rotate(0deg) scale(1.25)', 'rotate(150deg) scale(1.0)'] }, { duration: 4.2, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
  }

  // Center appear
  if (centerEl) {
    await animate(centerEl, { opacity: [0, 1], transform: ['scale(1.25)', 'scale(1)'] }, { duration: 0.8, easing: 'ease-out' }).finished
  }

  // Animate ring 1 edges then nodes
  await animateGroup(1, 0.08)
  await revealNodes(1, 0.08)

  // Ring 2
  await animateGroup(2, 0.06)
  await revealNodes(2, 0.06)

  // Ring 3
  await animateGroup(3, 0.05)
  await revealNodes(3, 0.05)
}

async function animateGroup(group: number, stepDelay: number) {
  const groupEdges = edges.value.filter(e => e.group === group)
  const promises = groupEdges.map((e, i) => {
    const el = edgeEls.get(e.id)
    const len = lengthOf(e)
    if (!el) return Promise.resolve()
    return animate(el, { strokeDashoffset: [len, 0] }, { duration: 0.7, delay: i * stepDelay, easing: 'ease-out' }).finished
  })
  await Promise.all(promises)
}

async function revealNodes(ring: number, stepDelay: number) {
  const groupNodes = ringNodes.value.filter(n => n.ring === ring)
  const promises = groupNodes.map((n, i) => {
    const el = nodeEls.get(n.id)
    if (!el) return Promise.resolve()
    return animate(el, { opacity: [0, 1], transform: ['scale(1.25)', 'scale(1)'] }, { duration: 0.6, delay: i * stepDelay, easing: 'ease-out' }).finished
  })
  await Promise.all(promises)
}
</script>

<style scoped>
:host {
  display: block;
  background: transparent !important;
}
.root {
  background: transparent !important;
}
:host svg {
  background: transparent !important;
}
</style>
