<template>
  <div class="sticky top-20">
    <div ref="stage" class="relative w-full">
      <div class="flex flex-col space-y-4 relative pb-28">
        <!-- NAT (top) -->
        <div ref="natRef" class="h-24 rounded bg-emerald-300 text-black flex items-center justify-center shadow-lg will-change-transform">
          NAT
        </div>
        <!-- DMT -->
        <div ref="dmtRef" class="h-24 rounded bg-green-600 text-white flex items-center justify-center shadow-lg will-change-transform">
          DMT
        </div>
        <!-- TAP Protocol -->
        <div ref="tapRef" class="h-24 rounded bg-fuchsia-500 text-white flex items-center justify-center shadow-lg will-change-transform">
          TAP Protocol
        </div>
        <!-- Ordinals -->
        <div ref="ordinalsRef" class="h-24 rounded bg-gray-500 text-white flex items-center justify-center shadow-lg will-change-transform">
          Ordinals
        </div>
        <!-- Bitcoin (bottom) -->
        <div ref="bitcoinRef" class="h-24 rounded bg-orange-500 text-black flex items-center justify-center shadow-lg will-change-transform sticky bottom-0 z-10">
          Bitcoin
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const stage = ref<HTMLElement | null>(null)
const bitcoinRef = ref<HTMLElement | null>(null)
const ordinalsRef = ref<HTMLElement | null>(null)
const tapRef = ref<HTMLElement | null>(null)
const dmtRef = ref<HTMLElement | null>(null)
const natRef = ref<HTMLElement | null>(null)

let scrollHandler: ((this: Window, ev: Event) => any) | null = null
let resizeHandler: ((this: Window, ev: UIEvent) => any) | null = null
let rafId: number | null = null
let sectionEl: HTMLElement | null = null
let prevScrollY = 0
let scrollingDown = true
// Mobile-only triggers
let mobileObserver: IntersectionObserver | null = null
let mobileTimers: number[] = []

onMounted(() => {
  sectionEl = document.querySelector('#fallacies-duplicate') as HTMLElement | null
  const els = [bitcoinRef, ordinalsRef, tapRef, dmtRef, natRef]

  // initial state: hidden and lifted
  els.forEach(r => {
    if (r.value) {
      r.value.style.transform = 'translateY(-80px)'
      r.value.style.opacity = '0'
      r.value.style.transition = 'transform 600ms ease-out, opacity 550ms ease-out'
    }
  })

  // If on a small viewport, trigger an entrance animation once the section enters the viewport
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  if (isMobile) {
    const playMobile = () => {
      // Bitcoin appears immediately
      if (bitcoinRef.value) {
        bitcoinRef.value.style.opacity = '1'
        bitcoinRef.value.style.transform = 'translateY(0)'
      }
      const seq = [ordinalsRef, tapRef, dmtRef, natRef]
      const step = 220 // ms between items
      const base = 120
      seq.forEach((r, i) => {
        const id = window.setTimeout(() => {
          if (r.value) {
            r.value.style.opacity = '1'
            r.value.style.transform = 'translateY(0)'
          }
        }, base + i * step)
        mobileTimers.push(id)
      })
    }

    // Observe the surrounding section (fallback to component root)
    const target = sectionEl || stage.value
    if (target) {
      mobileObserver = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            playMobile()
            mobileObserver?.disconnect()
            mobileObserver = null
            break
          }
        }
      }, { threshold: 0.15 })
      mobileObserver.observe(target)
    } else {
      // Fallback: play after a tick
      const id = window.setTimeout(playMobile, 200)
      mobileTimers.push(id)
    }
    return // Skip scroll-linked behavior on mobile
  }

  // -------- Desktop/large screens: keep scroll-linked behavior --------
  const clamp01 = (v:number) => Math.max(0, Math.min(1, v))
  const lerp = (a:number, b:number, t:number) => a + (b - a) * t

  // Persist last applied progress per box to prevent regression while scrolling down
  const lastTs = [0, 0, 0, 0, 0] // [bitcoin, ordinals, tap, dmt, nat]

  const applyProgress = (p:number) => {
    // p in [0,1] based on percentage of section visible in viewport
    // Bitcoin: always visible once section has any visibility
    let bt = p > 0 ? 1 : 0
    if (scrollingDown) bt = Math.max(lastTs[0], bt)
    if (bitcoinRef.value) {
      bitcoinRef.value.style.opacity = String(bt)
      bitcoinRef.value.style.transform = 'translateY(0)'
    }
    lastTs[0] = bt

    // Remaining boxes drop+fade sequentially with equal bands
    const sequence = [ordinalsRef, tapRef, dmtRef, natRef]
    const sStart = 0.7, sEnd = 1.0
    const band = (sEnd - sStart) / sequence.length
    sequence.forEach((r, i) => {
      const start = sStart + i * band
      const end = start + band
      let t = clamp01((p - start) / (end - start))
      const idx = i + 1 // shift since 0 is bitcoin
      if (scrollingDown) t = Math.max(lastTs[idx], t)
      if (r.value) {
        r.value.style.opacity = String(t)
        const y = lerp(-80, 0, t)
        r.value.style.transform = `translateY(${y}px)`
      }
      lastTs[idx] = t
    })
  }

  const computeProgress = () => {
    const el = sectionEl
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    const sectionHeight = rect.height || 1
    const visible = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0))
    return clamp01(visible / sectionHeight)
  }

  let scheduled = false
  const update = () => {
    scheduled = false
    const el = sectionEl
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight

    // If the section has scrolled above the viewport, keep everything fully visible
    if (rect.bottom <= 0) {
      applyProgress(1)
      return
    }
    // If the section is still below the viewport, keep initial hidden state
    if (rect.top >= vh) {
      applyProgress(0)
      return
    }

    const p = computeProgress()
    applyProgress(p)
  }

  const scheduleUpdate = () => {
    if (scheduled) return
    scheduled = true
    rafId = window.requestAnimationFrame(update)
  }

  // listeners
  scrollHandler = () => { const y = window.scrollY || 0; scrollingDown = y >= prevScrollY; prevScrollY = y; scheduleUpdate() }
  resizeHandler = () => scheduleUpdate()
  window.addEventListener('scroll', scrollHandler, { passive: true })
  window.addEventListener('resize', resizeHandler)

  // initial paint
  scheduleUpdate()
})

onBeforeUnmount(() => {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler)
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  if (rafId) cancelAnimationFrame(rafId)
  if (mobileObserver) mobileObserver.disconnect()
  mobileTimers.forEach(id => clearTimeout(id))
})
</script>

<style scoped>
/* Ensure the sticky column has enough height to visualize the stacking */
:host { display: block; }
</style>
