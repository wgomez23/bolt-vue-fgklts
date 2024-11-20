<script setup lang="ts">
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="bg-black mt-32 py-12 relative overflow-hidden">
    <!-- Grid Pattern Overlay with Fade -->
    <div class="absolute inset-0">
      <div class="absolute inset-0 grid-pattern"></div>
      <div class="absolute inset-0 fade-overlay"></div>
    </div>
    
    <!-- Footer Content -->
    <div class="container mx-auto px-4 relative z-10">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <div class="mb-6 md:mb-0">
          <span class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            $NAT
          </span>
          <p class="text-gray-400 mt-2">The First Non-Arbitrary Token</p>
        </div>
        <div class="flex space-x-6">
          <a href="https://x.com/TheBlockRunner" target="_blank" class="text-gray-400 hover:text-white transition-colors">
            <span class="sr-only">Twitter</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
          <a href="https://discord.gg/du86Kbe8XX" target="_blank" class="text-gray-400 hover:text-white transition-colors">
            <span class="sr-only">Discord</span>
            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
            </svg>
          </a>
        </div>
      </div>
      <div class="mt-8 pt-8 border-t border-dark-lighter text-center text-gray-400 text-sm">
        <p>&copy; {{ currentYear }} $NAT Token. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.grid-pattern {
  background-image: 
    linear-gradient(var(--primary-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--primary-color) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.15;
  --primary-color: #F7931A;
}

.fade-overlay {
  background: radial-gradient(
    circle at center,
    transparent 0%,
    var(--bg-color) 70%
  );
  --bg-color: #000000;
}
</style>