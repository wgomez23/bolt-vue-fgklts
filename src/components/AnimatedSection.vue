<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  delay?: number;
}>();

const sectionRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            isVisible.value = true;
          }, props.delay || 0);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '50px'
    }
  );

  if (sectionRef.value) {
    observer.observe(sectionRef.value);
  }
});
</script>

<template>
  <div 
    ref="sectionRef" 
    class="transition-all duration-1000 ease-out"
    :class="{
      'opacity-0 translate-y-8': !isVisible,
      'opacity-100 translate-y-0': isVisible
    }"
  >
    <slot></slot>
  </div>
</template>