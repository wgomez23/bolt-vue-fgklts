<template>
  <div class="mt-8 select-none">
    <div
      ref="grid"
      class="grid gap-1 rounded-md bg-white/5 p-2"
      :style="{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }"
      @pointermove="onPointerMove"
      @pointerleave="onPointerLeave"
    >
      <div
        v-for="i in CELL_COUNT"
        :key="i"
        class="cell aspect-square rounded-sm bg-white/10 will-change-transform"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { animate, stagger } from 'motion'

// Grid size. Keep relatively small for perf.
const ROWS = 9
const COLS = 14
const CELL_COUNT = ROWS * COLS

const grid = ref<HTMLElement | null>(null)
let cells: HTMLElement[] = []
let raf: number | null = null
let lastRow = -1
let lastCol = -1

// Wave timing controls
const BASE_DELAY = 0.01 // seconds per grid unit (50% faster)

function indexToRC(index: number) {
  const i = index
  return { r: Math.floor(i / COLS), c: i % COLS }
}

// No gating: allow overlapping waves for continuous ripple
function waveFrom(r0: number, c0: number) {
  if (!cells.length) return
  const base = BASE_DELAY // seconds per unit distance
  for (let i = 0; i < cells.length; i++) {
    const { r, c } = indexToRC(i)
    const d = Math.hypot(r - r0, c - c0)
    const delay = d * base
    const el = cells[i]

    animate(
      el,
      {
        scale: [1, 1.25, 1],
        // base -> orange -> green -> base
        backgroundColor: [
          'rgba(255,255,255,0.10)',
          'rgba(234,179,8,0.90)',
          'rgba(34,197,94,0.90)',
          'rgba(255,255,255,0.10)'
        ],
      },
      {
        duration: 0.35,
        ease: 'easeOut',
        delay,
      }
    )
  }
}

function onPointerMove(e: PointerEvent) {
  const g = grid.value
  if (!g) return
  const rect = g.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const cellW = rect.width / COLS
  const cellH = rect.height / ROWS
  const c = Math.max(0, Math.min(COLS - 1, Math.floor(x / cellW)))
  const r = Math.max(0, Math.min(ROWS - 1, Math.floor(y / cellH)))

  if (r === lastRow && c === lastCol) return
  lastRow = r
  lastCol = c

  if (raf) cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    waveFrom(r, c)
  })
}

function onPointerLeave() {
  // Gentle reset wave from center
  waveFrom(Math.floor(ROWS / 2), Math.floor(COLS / 2))
}

onMounted(() => {
  const g = grid.value
  if (!g) return
  cells = Array.from(g.querySelectorAll<HTMLElement>('.cell'))

  // Initial reveal from center
  animate(
    cells,
    { opacity: [0, 1], scale: [0.9, 1] },
    { delay: stagger(0.01, { from: 'center' }), duration: 0.4, ease: 'easeOut' }
  )
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
})
</script>

<style scoped>
.cell {
  transition: box-shadow 150ms ease;
}
.cell:hover {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
}
</style>
