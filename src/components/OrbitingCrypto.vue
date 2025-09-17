<template>
  <div class="w-full flex justify-center" ref="containerRef" aria-label="Orbiting cryptocurrency logos">
    <div class="relative aspect-square w-full max-w-[420px] pointer-events-none" :style="rootStyle">
      <!-- Rotating group -->
      <div class="absolute inset-0 orbit-wrap" ref="orbitRef">
        <img :src="ethUrl" alt="Ethereum" class="orbit-item" style="--angle: 0deg" />
        <img :src="dogeUrl" alt="Dogecoin" class="orbit-item" style="--angle: 60deg" />
        <img :src="tronUrl" alt="Tron" class="orbit-item" style="--angle: 120deg" />
        <img :src="bnbUrl" alt="BNB" class="orbit-item" style="--angle: 180deg" />
        <img :src="cardanoUrl" alt="Cardano" class="orbit-item" style="--angle: 240deg" />
        <img :src="solanaUrl" alt="Solana" class="orbit-item" style="--angle: 300deg" />
      </div>

      <!-- Center Bitcoin logo -->
      <img :src="bitcoinUrl" alt="Bitcoin" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] object-contain select-none drop-shadow-[0_0_18px_rgba(255,128,0,.25)]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { animate } from 'motion'
import bitcoinUrl from '../assets/bitcoin.png'
import ethUrl from '../assets/ethereum.png'
import solanaUrl from '../assets/solana.png'
import dogeUrl from '../assets/dogecoin.png'
import cardanoUrl from '../assets/Cardano.png'
import bnbUrl from '../assets/bnb.png'
import tronUrl from '../assets/tron.png'

const orbitRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
let controls: any | null = null
let observer: IntersectionObserver | null = null

// Responsive radius via CSS variable (clamps between ~100px and 150px)
const rootStyle = computed(() => ({
  '--orbit-radius': 'clamp(100px, 22vmin, 150px)',
  '--theta': '0deg'
}) as any)

onMounted(() => {
  const el = orbitRef.value
  if (!el) return
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!prefersReduced) {
    const anim: any = animate as any
    controls = anim(0, 360, {
      duration: 20,
      easing: 'linear',
      repeat: Infinity,
      onUpdate: (v: number) => { el.style.setProperty('--theta', `${v}deg`) }
    })
  }

  // Pause when offscreen for performance
  observer = new IntersectionObserver((entries) => {
    const visible = entries.some(e => e.isIntersecting)
    if (!controls) return
    if (visible) { controls.play?.() } else { controls.pause?.() }
  }, { threshold: 0.1 })

  if (containerRef.value) observer.observe(containerRef.value)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  if (controls?.cancel) controls.cancel()
})
</script>

<style scoped>
.orbit-wrap { transform-origin: 50% 50%; }
.orbit-item {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 80px;
  height: 80px;
  object-fit: contain;
  transform: translate(-50%, -50%) rotate(calc(var(--angle) + var(--theta))) translateX(var(--orbit-radius)) rotate(calc(-1 * (var(--angle) + var(--theta))));
  will-change: transform;
  image-rendering: auto;
}
</style>
