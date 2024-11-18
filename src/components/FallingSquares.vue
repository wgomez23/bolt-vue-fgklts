<script setup lang="ts">
const squares = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  size: Math.random() * 8 + 4,
  left: Math.random() * 100,
  delay: Math.random() * 5,
  duration: Math.random() * 3 + 4,
  opacity: Math.random() * 0.3 + 0.4
}));
</script>

<template>
  <div class="falling-squares">
    <div
      v-for="square in squares"
      :key="square.id"
      class="square"
      :style="{
        '--size': `${square.size}px`,
        '--left': `${square.left}%`,
        '--delay': `${square.delay}s`,
        '--duration': `${square.duration}s`,
        '--opacity': square.opacity
      }"
    ></div>
  </div>
</template>

<style scoped>
.falling-squares {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.square {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: #F7931A;
  opacity: var(--opacity);
  left: var(--left);
  top: -20px;
  animation: fall var(--duration) linear var(--delay) infinite;
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(247, 147, 26, 0.5);
}

@keyframes fall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: var(--opacity);
  }
  100% {
    transform: translateY(120vh) rotate(360deg);
    opacity: 0;
  }
}
</style>