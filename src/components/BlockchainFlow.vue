<template>
  <div ref="root" class="relative w-full h-[160px] md:h-[190px] mt-6" style="pointer-events:none;">
    <div ref="viewport" class="relative w-full h-full overflow-hidden">
      <!-- Keyframe actors -->
      <div ref="lineEl" class="absolute h-[3px]" style="background:#e69a2a;box-shadow:0 0 6px rgba(247,147,26,.45);"></div>
      <div ref="blockEl" class="absolute rounded-[5px]" style="border:1px solid rgba(247,147,26,.65);background:#F7931A;box-shadow:0 0 10px rgba(247,147,26,.25);"></div>
      <div ref="overlay" class="absolute inset-0 pointer-events-none" style="z-index:999"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { animate as motionAnimate } from 'motion'
import btcUrl from '../assets/bitcoin.png'
import natUrl from '../assets/nat1.png'

// Wrapper around motion.animate to avoid TS typing issues with generic HTMLElements
// Fixes lint IDs: 3d2217cc-d9e1-41a6-a104-b40bbc150b50, 806574e0-ef0c-4e47-a06a-86add7bef004, 22892474-34fc-4904-a5cb-897dca8607a6, 8c97e885-587b-47df-a286-ef66289fb93b
const A = (el: any, keyframes: any, options?: any) => (motionAnimate as any)(el, keyframes, options)

// Preload logos once to avoid any race with lazy decoding
function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

function nextFrame() { return new Promise<void>(r => requestAnimationFrame(() => r())) }
const logosReady = Promise.all([preload(btcUrl), preload(natUrl)])

const root = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const lineEl = ref<HTMLElement | null>(null)
const blockEl = ref<HTMLElement | null>(null)
const overlay = ref<HTMLElement | null>(null)

let running = false
let io: IntersectionObserver | null = null
let startedOnce = false
let size = 66
let lineExtended = false

function updateMetrics() {
  const w = root.value?.clientWidth || window.innerWidth
  if (w < 480) { size = 56 } else if (w < 768) { size = 62 } else { size = 70 }
}

// no per-block DOM; the block is the single actor "blockEl"

function makeLogo(src: string): HTMLImageElement {
  const img = new Image()
  img.src = src
  img.alt = 'logo'
  img.decoding = 'async'
  img.loading = 'eager'
  img.style.position = 'absolute'
  img.style.left = '50%'
  img.style.bottom = `${size + 18}px`
  img.style.width = `${Math.round(size * 0.9)}px`
  img.style.transform = 'translate(0, 0) scale(0.5)'
  img.style.opacity = '0'
  img.style.pointerEvents = 'none'
  img.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,.35))'
  img.style.zIndex = '10'
  return img
}

async function animateLogosInAt(centerX: number, baseY: number): Promise<{ btc: HTMLImageElement, nat: HTMLImageElement }> {
  await logosReady
  const btc = makeLogo(btcUrl)
  const nat = makeLogo(natUrl)
  // Append to overlay so logos don't move with chain transforms
  overlay.value!.appendChild(btc)
  overlay.value!.appendChild(nat)
  // Compute pixel positions above the block (lifted higher)
  const yTop = baseY - (size / 1) - Math.round(size * 0.5) // higher above the block
  const dx = size * 0.55
  const shift = Math.round(size * 0.5) // move both a bit left for visual centering
  btc.style.left = `${centerX - dx - shift}px`
  nat.style.left = `${centerX + dx - shift}px`
  btc.style.top = `${yTop}px`
  nat.style.top = `${yTop}px`
  // Clear bottom since we're using top-based absolute positioning in the overlay
  btc.style.bottom = 'auto'
  nat.style.bottom = 'auto'
  // Prepare animations
  btc.style.willChange = 'transform, opacity'; nat.style.willChange = 'transform, opacity'
  // ensure layout is committed before animating
  try { await Promise.allSettled([(btc as any).decode?.(), (nat as any).decode?.()]) } catch {}
  await nextFrame()
  // slight pre-pop so the icons are not completely invisible if animations are throttled
  btc.style.opacity = '0.001'
  nat.style.opacity = '0.001'
  
  // In animations (slightly staggered)
  const btcIn = A(btc, {
    opacity: [0, 1],
    transform: ['translate(0px, 6px) scale(0.5)', 'translate(0px, -8px) scale(1)']
  }, { duration: 1.0, easing: 'ease-out', delay: 0.2 }).finished

  const natIn = A(nat, {
    opacity: [0, 1],
    transform: ['translate(0px, 6px) scale(0.5)', 'translate(0px, -8px) scale(1)']
  }, { duration: 1.0, easing: 'ease-out', delay: 0.55 }).finished

  await Promise.allSettled([btcIn, natIn])
  // Hold briefly while visible
  await sleep(1200)
  return { btc, nat }
}

async function animateLogosOut(btc: HTMLImageElement, nat: HTMLImageElement): Promise<void> {
  const btcOut = A(btc, {
    opacity: [1, 0],
    transform: ['translate(0px, -8px) scale(1)', 'translate(0px, -28px) scale(0.5)']
  }, { duration: 0.9, easing: 'ease-in', delay: 0 }).finished

  const natOut = A(nat, {
    opacity: [1, 0],
    transform: ['translate(0px, -8px) scale(1)', 'translate(0px, -28px) scale(0.5)']
  }, { duration: 0.9, easing: 'ease-in', delay: 0.2 }).finished

  await Promise.allSettled([btcOut, natOut])
  btc.remove(); nat.remove()
}

// no prime() needed in keyframe mode

function sleep(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

// no insert/trim logic in keyframe mode

// old loop removed; using runKeyframeLoop()

// New keyframe loop: line extends, block slides in to center, logos in/hold, logos+block out, repeat
async function runKeyframeLoop() {
  if (!root.value || !viewport.value || !lineEl.value || !blockEl.value) return
  while (running) {
    updateMetrics()
    const w = viewport.value.clientWidth
    const h = viewport.value.clientHeight
    const centerX = Math.round(w / 2)
    const baseY = Math.round(h * 0.62)

    // Setup line in middle
    const line = lineEl.value
    const lineLen = Math.max(80, Math.round(w * 0.42))
    Object.assign(line.style, {
      left: `${centerX + size / 2}px`, top: `${baseY}px`, width: `${lineLen}px`, height: '3px',
      transformOrigin: 'left center'
    } as CSSStyleDeclaration)
    // Keyframe #1: extend line to the right (first loop only)
    if (!lineExtended) {
      line.style.transform = 'scaleX(0)'
      await A(line, { transform: ['scaleX(0)', 'scaleX(1)'] }, { duration: 0.9, easing: 'ease-out' }).finished
      lineExtended = true
    } else {
      line.style.transform = 'scaleX(1)'
    }

    // Setup block centered
    const block = blockEl.value
    Object.assign(block.style, {
      width: `${size}px`, height: `${size}px`, left: `${centerX - size / 2}px`, top: `${baseY - size / 2}px`,
      transform: `translateX(-${w / 2 + size + 30}px)`
    } as CSSStyleDeclaration)


    // Keyframe #2: slide block in from left to center
    await A(block, { transform: [`translateX(-${w / 2 + size + 30}px)`, 'translateX(0px)'] }, { duration: 1.0, easing: [0.22, 0.8, 0.2, 1] }).finished

    // Keyframe #3 and #4 handled via animateLogosInAt/Out + block out
    const logos = await animateLogosInAt(centerX, baseY)
    const distance = w / 2 + size + 30
    const blockOut = A(block, { transform: ['translateX(0px)', `translateX(${distance}px)`] }, { duration: 0.9, easing: 'ease-in' }).finished
    const logosOut = animateLogosOut(logos.btc, logos.nat)
    await Promise.allSettled([blockOut, logosOut])

    // Short beat before next cycle (line stays visible)
    await sleep(300)
  }
}

function start() {
  if (running) return
  running = true
  startedOnce = true
  updateMetrics()
  runKeyframeLoop()
}
function stop() { running = false }

onMounted(() => {
  updateMetrics()
  const onResize = () => updateMetrics()
  window.addEventListener('resize', onResize)
  // Start only when first visible; then keep looping continuously
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      const e = entries[0]
      if (e?.isIntersecting && !startedOnce) {
        start()
        if (root.value && io) io.unobserve(root.value)
        io = null
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' })
    if (root.value) io.observe(root.value)
  } else {
    start()
  }
  onBeforeUnmount(() => { stop(); window.removeEventListener('resize', onResize); if (root.value && io) io.unobserve(root.value); io = null })
})
</script>

<style scoped>
:host{display:block}
</style>
