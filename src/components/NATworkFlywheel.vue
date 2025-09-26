<template>
  <div ref="containerRef" class="relative w-full h-72 md:h-96 overflow-visible" aria-label="NATwork flywheel animation">
    <!-- Left: Bitcoin gear group -->
    <div class="absolute left-[4%] top-[6%] z-20" :style="gear1Style">
      <!-- Rotating gear -->
      <img
        ref="gear1Ref"
        class="w-full h-full object-contain drop-shadow"
        :src="paths.gear1"
        alt="Bitcoin gear"
        @error="onImgError"
        style="transform-origin:center"
      />
      <!-- Static BTC badge -->
      <div class="absolute inset-0 grid place-items-center pointer-events-none">
        <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F7931A] text-white font-extrabold text-3xl md:text-4xl flex items-center justify-center shadow-inner">
          ₿
        </div>
      </div>
    </div>

    <!-- Right: Dollar gear group -->
    <div class="absolute right-[4%] top-[6%]" :style="gear2Style">
      <img
        ref="gear2Ref"
        class="w-full h-full object-contain drop-shadow"
        :src="paths.gear2"
        alt="Dollar gear"
        @error="onImgError"
        style="transform-origin:center"
      />
      <!-- Static $ badge -->
      <div class="absolute inset-0 grid place-items-center pointer-events-none">
        <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-500 text-white font-extrabold text-3xl md:text-4xl flex items-center justify-center shadow-inner">
          $
        </div>
      </div>
      <!-- Caption under dollar gear -->
      <div class="absolute left-1/2 top-[102%] -translate-x-1/2 text-xs md:text-sm text-gray-300 font-semibold pointer-events-none select-none">
        Web3 App
      </div>
    </div>

    <!-- NAT logo rotating (positioned to the right of the BTC gear) -->
    <div class="absolute left-[20%] top-[45%] z-10" :style="natStyle">
      <img
        ref="natRef"
        class="w-full h-full object-contain"
        :src="paths.nat1"
        alt="NAT logo"
        @error="onImgError"
        style="transform-origin:center"
      />
    </div>

    <!-- Arrow 1: BTC -> $ (horizontal growth) -->
    <div class="absolute left-[35%] right-[35%] top-[26%] h-6 z-30">
      <div class="relative w-full h-full">
        <div
          ref="arrow1BarRef"
          class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-400 rounded origin-left"
          style="width: calc(100% - 18px)"
        />
        <!-- arrow head -->
        <div
          ref="arrow1HeadRef"
          class="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[18px] border-l-emerald-400 border-y-[10px] border-y-transparent"
        />
        <!-- Moving label -->
        <div
          ref="arrow1LabelRef"
          class="absolute top-1/2 -translate-y-[1.25rem] text-white text-base md:text-lg font-bold"
        >
          DMT
        </div>
      </div>
    </div>

    <!-- Arrow 2: $ -> NAT (diagonal down) -->
    <div class="absolute right-[33%] top-[36%] w-[28%] h-6 z-30" style="transform: rotate(-28deg); transform-origin: right center;">
      <div class="relative w-full h-full">
        <div
          ref="arrow2BarRef"
          class="absolute right-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-400 rounded origin-right"
          style="width: calc(100% - 18px)"
        />
        <div
          ref="arrow2HeadRef"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-r-[18px] border-r-emerald-400 border-y-[10px] border-y-transparent"
        />
        <div
          ref="arrow2LabelRef"
          class="absolute top-1/2 right-0 -translate-y-[1rem] text-white text-sm md:text-base font-bold"
        >
          Purchase $NAT
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { animate } from '@motionone/dom'
import { onMounted, onBeforeUnmount, ref, nextTick, computed } from 'vue'
// Import assets so Vite resolves paths correctly in production
import gear1Url from '../assets/gear1.png'
import gear2Url from '../assets/gear2.png'
import nat1Url from '../assets/nat1.png'
import fallbackUrl from '../assets/vue.svg'

const paths = {
  gear1: gear1Url,
  gear2: gear2Url,
  nat1: nat1Url,
}

// Replace missing images with a neutral fallback
const fallback = fallbackUrl

function onImgError(ev: Event) {
  const img = ev.target as HTMLImageElement
  if (img && img.src !== fallback) img.src = fallback
}

// Refs for imperative animations
const gear1Ref = ref<HTMLImageElement | null>(null)
const gear2Ref = ref<HTMLImageElement | null>(null)
const natRef = ref<HTMLImageElement | null>(null)
const arrow1BarRef = ref<HTMLDivElement | null>(null)
const arrow1HeadRef = ref<HTMLDivElement | null>(null)
const arrow1LabelRef = ref<HTMLDivElement | null>(null)
const arrow2BarRef = ref<HTMLDivElement | null>(null)
const arrow2HeadRef = ref<HTMLDivElement | null>(null)
const arrow2LabelRef = ref<HTMLDivElement | null>(null)

const running: any[] = []

// Responsive sizing based on container width with sensible clamps
const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref<number>(1024)

let ro: ResizeObserver | null = null

// Helper to compute a clamped size from container width percentage
function sizeClamp(minPx: number, pctOfWidth: number, maxPx: number): number {
  const target = (containerWidth.value * pctOfWidth) / 100
  return Math.max(minPx, Math.min(maxPx, Math.round(target)))
}

// Primary gears slightly larger than NAT logo; desktop containers make these scale to a reasonable size
const gearSizePx = computed(() => sizeClamp(120, 26, 220)) // 16% of container, clamped 120–220px
const natSizePx = computed(() => sizeClamp(96, 24, 180))   // 13% of container, clamped 96–180px

const gear1Style = computed(() => ({ width: `${gearSizePx.value}px`, height: `${gearSizePx.value}px` }))
const gear2Style = computed(() => ({ width: `${gearSizePx.value}px`, height: `${gearSizePx.value}px` }))
const natStyle = computed(() => ({ width: `${natSizePx.value}px`, height: `${natSizePx.value}px` }))

onMounted(async () => {
  await nextTick()
  // Initialize container width and observe for size changes
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
    ro = new ResizeObserver((entries) => {
      const e = entries[0]
      if (e && e.contentRect) containerWidth.value = e.contentRect.width
    })
    ro.observe(containerRef.value)
  }
  // Ensure the browser has painted before starting animations
  requestAnimationFrame(() => {
  // Gears & NAT rotations
  if (gear1Ref.value) running.push(animate(gear1Ref.value, { transform: ['rotate(0deg)', 'rotate(-360deg)'] }, { duration: 10, easing: 'linear', repeat: Infinity }))
  if (gear2Ref.value) running.push(animate(gear2Ref.value, { transform: ['rotate(0deg)', 'rotate(360deg)'] }, { duration: 10, easing: 'linear', repeat: Infinity }))
  if (natRef.value) running.push(animate(natRef.value, { transform: ['rotate(0deg)', 'rotate(360deg)'] }, { duration: 12, easing: 'linear', repeat: Infinity }))

  // Arrow 1 (BTC -> $)
  if (arrow1BarRef.value) {
    // Static green arrow bar
    arrow1BarRef.value.style.transformOrigin = 'left center'
    arrow1BarRef.value.style.transform = 'scaleX(1)'
  }
  if (arrow1HeadRef.value) {
    // Static arrow head
    arrow1HeadRef.value.style.opacity = '1'
  }
  if (arrow1LabelRef.value) {
    // Animate label only: glide L->R and fade near the dollar gear
    running.push(
      animate(
        arrow1LabelRef.value,
        { transform: ['translateX(0%)', 'translateX(300%)', 'translateX(400%)'], opacity: [1, 1, 0] },
        { duration: 5.5, easing: 'ease-out', repeat: Infinity }
      )
    )
  }

  // Arrow 2 ($ -> NAT)
  if (arrow2BarRef.value) {
    // Static bar anchored on the right
    arrow2BarRef.value.style.transformOrigin = 'right center'
    arrow2BarRef.value.style.transform = 'scaleX(1)'
  }
  if (arrow2HeadRef.value) {
    // Static arrow head
    arrow2HeadRef.value.style.opacity = '1'
  }
  if (arrow2LabelRef.value) {
    running.push(animate(arrow2LabelRef.value, { transform: ['translateX(10%)', 'translateX(-50%)', 'translateX(-80%)'], opacity: [1, 1, 0] }, { duration: 5.5, easing: 'ease-out', repeat: Infinity }))
  }
  })
})

onBeforeUnmount(() => {
  running.forEach((a) => a?.cancel?.())
  if (containerRef.value && ro) ro.unobserve(containerRef.value)
  ro = null
})
</script>

<style scoped>
.drop-shadow { filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35)); }
</style>
