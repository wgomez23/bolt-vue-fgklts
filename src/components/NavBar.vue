<template>
  <div class="fixed top-4 left-0 right-0 z-50 px-4">
    <nav class="relative max-w-7xl mx-auto bg-dark-card/40 backdrop-blur-sm rounded-full border border-dark-lighter/50">
      <div class="container mx-auto px-6 relative">
        <div class="flex items-center h-14">
          <!-- Logo -->
          <div class="flex items-center gap-2">
            <img src="../../public//Nat_logo.png" class="w-[30px] h-[30px]"/>
            <span class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              $NAT
            </span>
          </div>
          
          <!-- Center navigation -->
          <div class="hidden md:flex flex-1 justify-center items-center">
            <div class="flex items-center space-x-8">
              <a href="https://digital-matter-theory.gitbook.io/" target="_blank" class="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.802 17.77a.703.703 0 11-.002 1.406.703.703 0 01.002-1.406m11.024-4.347a.703.703 0 11.001-1.406.703.703 0 01-.001 1.406m0-2.876a2.176 2.176 0 00-2.174 2.174c0 .233.039.465.115.691l-7.181 3.823a2.165 2.165 0 00-1.784-.937c-.829 0-1.584.475-1.95 1.216l-6.451-3.402c-.682-.358-1.192-1.48-1.138-2.502.028-.533.212-.947.493-1.107.178-.1.392-.092.62.027l.042.023c1.71.9 7.304 3.847 7.54 3.956.363.169.565.237 1.185-.057l11.564-6.014c.17-.064.368-.227.368-.474 0-.342-.354-.477-.355-.477-.658-.315-1.669-.788-2.655-1.25-2.108-.987-4.497-2.105-5.546-2.655-.906-.474-1.635-.074-1.765.006l-.252.125C7.78 6.048 1.46 9.178 1.1 9.397.457 9.789.058 10.57.006 11.539c-.08 1.537.703 3.14 1.824 3.727l6.822 3.518a2.175 2.175 0 002.15 1.862 2.177 2.177 0 002.173-2.14l7.514-4.073c.38.298.853.461 1.337.461A2.176 2.176 0 0024 12.72a2.176 2.176 0 00-2.174-2.174" />
                </svg>
                Gitbook
              </a>
              <a href="#faq" class="text-gray-300 hover:text-white transition-colors">FAQ</a>
              <a href="#whereToBuy" class="text-gray-300 hover:text-white transition-colors">How to buy</a>
            </div>
          </div>

          <!-- Buy button -->
          <a class="hidden md:block flex-none" href="#whereToBuy">
            <button class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full transition-colors">
              Buy
            </button>
          </a>

          <!-- Mobile menu button -->
          <button 
            class="md:hidden ml-auto bg-dark-lighter/50 p-2 rounded-full"
            @click="isOpen = !isOpen"
          >
            <svg 
              class="w-6 h-6 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                v-if="!isOpen"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path 
                v-else
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Mobile menu -->
        <div 
          v-show="isOpen" 
          class="md:hidden absolute top-full left-0 right-0 mt-2 bg-dark-card/95 backdrop-blur-sm rounded-2xl border border-dark-lighter/50"
        >
          <div class="px-4 py-3 space-y-3">
            <a href="https://digital-matter-theory.gitbook.io/" target="_blank" class="block text-gray-300 hover:text-white transition-colors flex items-center gap-2">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.802 17.77a.703.703 0 11-.002 1.406.703.703 0 01.002-1.406m11.024-4.347a.703.703 0 11.001-1.406.703.703 0 01-.001 1.406m0-2.876a2.176 2.176 0 00-2.174 2.174c0 .233.039.465.115.691l-7.181 3.823a2.165 2.165 0 00-1.784-.937c-.829 0-1.584.475-1.95 1.216l-6.451-3.402c-.682-.358-1.192-1.48-1.138-2.502.028-.533.212-.947.493-1.107.178-.1.392-.092.62.027l.042.023c1.71.9 7.304 3.847 7.54 3.956.363.169.565.237 1.185-.057l11.564-6.014c.17-.064.368-.227.368-.474 0-.342-.354-.477-.355-.477-.658-.315-1.669-.788-2.655-1.25-2.108-.987-4.497-2.105-5.546-2.655-.906-.474-1.635-.074-1.765.006l-.252.125C7.78 6.048 1.46 9.178 1.1 9.397.457 9.789.058 10.57.006 11.539c-.08 1.537.703 3.14 1.824 3.727l6.822 3.518a2.175 2.175 0 002.15 1.862 2.177 2.177 0 002.173-2.14l7.514-4.073c.38.298.853.461 1.337.461A2.176 2.176 0 0024 12.72a2.176 2.176 0 00-2.174-2.174" />
              </svg>
              Gitbook
            </a>
            <a href="#faq" class="block text-gray-300 hover:text-white transition-colors">FAQ</a>
            <a href="#whereToBuy" class="block text-gray-300 hover:text-white transition-colors">How to buy</a>
            <button class="w-full bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full transition-colors">
              Buy
            </button>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
</script>

<style scoped>
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
</style>