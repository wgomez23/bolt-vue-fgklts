<script setup lang="ts">
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';
import SectionTitle from './SectionTitle.vue';

const features = [
  '#1 mission coin on Bitcoin',
  '100% free and fair',
  'No team allocation',
  'No presale',
  'Organic decentralized community',
  'Harnesses the thermodynamic property of Bitcoin',
  'No insider group',
  '100% community driven',
  'Does not pay influencers'
];
</script>

<template>
  <section>
    <div class="bg-dark-card rounded-xl p-6 max-w-2xl mx-auto">
      <h2 class="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
        How to contribute
      </h2>
      
      <p class="text-gray-300 text-center mb-8 max-w-3xl mx-auto">
        With $NAT's mission firmly established and its perpetual alignment with Bitcoin as a network security enhancement subsidy token, the time has come to shift into high gear. $NAT is ready to move beyond experimental territory and emerge as a serious force in the crypto space. Contribute your tokens today and be part of the movement that strengthens Bitcoin's future and cements $NAT's place in history.
      </p>
      
      <div class="flex  items-center">
        <!-- Features List -->
        <div class="space-y-6 mx-auto flex flex-col items-center">
          <div v-for="feature in features" 
               :key="feature" 
               class="flex items-center space-x-4 group transition-transform duration-300 hover:translate-x-2 w-full max-w-md justify-center">
            <div class="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
              <svg class="w-4 h-4 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="  text-gray-300 group-hover:text-white transition-colors w-[60%]">{{ feature }}</span>
          </div>
        </div>

        <!-- Lottie Animation 
        <div class="relative flex justify-center items-center h-[400px] rounded-xl">
          <DotLottieVue
            src="https://lottie.host/3303623d-a47f-4ee3-9663-67c66c00494e/ld5BPUvnbX.lottie"
            autoplay
            loop
            class="lottie-animation"
          />
        </div>-->
      </div>

      <!-- Contribute Button -->
      <div class="mt-12">
        <a 
          href="https://listing.natgmi.com/" 
          target="_blank" 
          class="block w-full py-4 text-center text-white text-lg font-bold rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark transition-all duration-300 transform hover:scale-[1.02]"
        >
          Contribute
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.lottie-animation {
  width: 100%;
  height: 100%;
  max-width: 400px;
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
}

.lottie-animation :deep(svg) {
  width: 100%;
  height: 100%;
  background: transparent !important;
}

/* Remove all background fills */
.lottie-animation :deep(rect),
.lottie-animation :deep(path),
.lottie-animation :deep(circle),
.lottie-animation :deep(g) {
  fill: none !important;
  background: transparent !important;
}

/* Target background elements specifically */
.lottie-animation :deep([data-name="bg"]),
.lottie-animation :deep([data-name="background"]),
.lottie-animation :deep([data-name="Background"]) {
  fill: transparent !important;
  opacity: 0 !important;
}

/* Keep specific colors for the rocket */
.lottie-animation :deep([stroke="#F7931A"]) {
  stroke: #F7931A !important;
}

.lottie-animation :deep([fill="#00FF94"]) {
  fill: #00FF94 !important;
}

/* Ensure white parts are transparent */
.lottie-animation :deep([fill="#FFFFFF"]),
.lottie-animation :deep([fill="#ffffff"]),
.lottie-animation :deep([fill="white"]) {
  fill: transparent !important;
}

/* Additional transparency for rocket parts */
.lottie-animation :deep(.rocket-body),
.lottie-animation :deep(.rocket-window),
.lottie-animation :deep(.rocket-interior) {
  fill: transparent !important;
  background: transparent !important;
}
</style>