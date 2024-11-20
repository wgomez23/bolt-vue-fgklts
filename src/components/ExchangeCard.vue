<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  name: string;
  logo?: string | null;
  index: number;
}>();

const isVisible = ref(false);
const cardRef = ref<HTMLElement | null>(null);

// Use different placeholder images for each exchange
const getLogoUrl = (name: string) => {
  switch (name) {
    case 'Taprooswap':
      return 'https://mscribe-webapp.s3.us-east-2.amazonaws.com/Taparooswap.jpg';
    case 'SuperEx':
      return 'https://mscribe-webapp.s3.us-east-2.amazonaws.com/superex.png';
    case 'OrdinalsWallet':
      return 'https://ordinalswallet.com/logo-icon.svg';
    default:
      return null;
  }
};

const getExchangeUrl = (name: string) => {
  switch (name) {
    case 'Taprooswap':
      return 'https://taparooswap.com/';
    case 'SuperEx':
      return 'https://superex.com';
    case 'OrdinalsWallet':
      return 'https://ordinalswallet.com';
    default:
      return '#';
  }
};

const displayLogo = getLogoUrl(props.name);
const exchangeUrl = getExchangeUrl(props.name);

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Increased delay between cards and added setTimeout
          setTimeout(() => {
            isVisible.value = true;
          }, 100 + props.index * 300); // 300ms delay between each card, 100ms initial delay
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '50px'
    }
  );

  if (cardRef.value) {
    observer.observe(cardRef.value);
  }
});
</script>

<template>
  <a ref="cardRef"
     :href="exchangeUrl" 
     target="_blank" 
     rel="noopener noreferrer" 
     class="block bg-dark-card p-6 rounded-xl hover:bg-dark-lighter transition-all duration-700 ease-out cursor-pointer flex flex-col items-center transform"
     :class="{
       'opacity-0 translate-y-16 scale-95': !isVisible,
       'opacity-100 translate-y-0 scale-100': isVisible
     }">
    <img v-if="displayLogo" 
         :src="displayLogo" 
         :alt="`${name} logo`" 
         class="w-24 h-24 mb-4 object-contain rounded-lg" />
    <h3 class="text-xl font-bold">{{ name }}</h3>
  </a>
</template>