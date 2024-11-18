<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  icon: string;
  value: string;
  label: string;
}>();

const displayValue = ref('0');
let animationFrame: number;

// Parse the numeric value and suffix
const parseValue = (value: string) => {
  // Handle currency values
  if (value.startsWith('$')) {
    const match = value.match(/^\$([0-9,.]+)([MBTk+]*)$/);
    if (match) {
      const numberStr = match[1].replace(/,/g, '');
      const number = parseFloat(numberStr);
      const suffix = match[2] || '';
      // Convert M to actual number
      if (suffix === 'M') {
        return { number: number * 1000000, suffix: '', isCurrency: true };
      }
      return { number, suffix, isCurrency: true };
    }
  }
  
  // Handle other values
  const match = value.match(/^([0-9,.]+)(.*)$/);
  if (!match) return { number: 0, suffix: '', isCurrency: false };
  
  const numberStr = match[1].replace(/,/g, '');
  const number = parseFloat(numberStr);
  const suffix = match[2] || '';
  
  return { number, suffix, isCurrency: false };
};

const { number: targetValue, suffix, isCurrency } = parseValue(props.value);

const formatNumber = (num: number) => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toFixed(0);
};

const easeOutQuart = (x: number): number => {
  return 1 - Math.pow(1 - x, 4);
};

const animateValue = (timestamp: number, startTime: number) => {
  const elapsed = timestamp - startTime;
  const duration = 2500; // Increased to 2.5 seconds
  const progress = Math.min(elapsed / duration, 1);
  
  const easedProgress = easeOutQuart(progress);
  const currentValue = targetValue * easedProgress;
  
  // Format the value based on type
  if (isCurrency) {
    displayValue.value = '$' + formatNumber(currentValue);
  } else if (suffix === 'T') {
    displayValue.value = currentValue.toFixed(0) + suffix;
  } else if (suffix.includes('+')) {
    displayValue.value = formatNumber(currentValue) + suffix;
  } else {
    displayValue.value = formatNumber(currentValue) + suffix;
  }

  if (progress < 1) {
    animationFrame = requestAnimationFrame((t) => animateValue(t, startTime));
  }
};

const startAnimation = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  const startTime = performance.now();
  animationFrame = requestAnimationFrame((timestamp) => animateValue(timestamp, startTime));
};

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '50px'
    }
  );

  const element = document.querySelector('.stat-card') as Element;
  if (element) {
    observer.observe(element);
  }
});
</script>

<template>
  <div class="stat-card bg-dark-card p-6 rounded-xl flex items-center space-x-4">
    <div class="w-10 h-10 bg-dark-lighter rounded-lg flex items-center justify-center text-primary">
      <span class="text-xl" v-html="icon"></span>
    </div>
    <div>
      <div class="text-xl font-bold">{{ displayValue }}</div>
      <div class="text-gray-400 text-sm">{{ label }}</div>
    </div>
  </div>
</template>