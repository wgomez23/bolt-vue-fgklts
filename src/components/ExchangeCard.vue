<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NonKycLogo from '../assets/nonkyclogoicon.png';
import BitLogo from '../assets/bit.png';

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
    case 'TaparooSwap':
      return 'https://mscribe-webapp.s3.us-east-2.amazonaws.com/Taparooswap.jpg';
    case 'SuperEx':
      return 'https://mscribe-webapp.s3.us-east-2.amazonaws.com/superex.png';
    case 'OrdinalsWallet':
      return 'https://ordinalswallet.com/logo-icon.svg';
    case 'SatX':
      return 'https://mscribe-webapp.s3.us-east-2.amazonaws.com/satx_dark.png';
    case 'Hypermall':
      return 'https://mscribe-webapp.s3.us-east-2.amazonaws.com/hypermall.png';
    case 'Uniswap':
      return 'https://mscribe-webapp.s3.us-east-2.amazonaws.com/uniswap.png';
    case 'NonKyc':
      return NonKycLogo;
    case 'Bit.com':
      return BitLogo;
    default:
      return null;
  }
};

const getExchangeUrl = (name: string) => {
  switch (name) {
    case 'TaparooSwap':
      return 'https://swap.taparooswap.com/';
    case 'SuperEx':
      return 'https://www.superex.com/trade/DMT-NAT_USDT';
    case 'OrdinalsWallet':
      return 'https://ordinalswallet.com/collection/tap-DMT-NAT';
    case 'SatX':
      return 'https://www.satsx.io/ordinals/tap/dmt-nat/listed';
    case 'Hypermall':
      return 'https://www.hypermall.io';
    case 'Uniswap':
      return 'https://app.uniswap.org/explore/pools/ethereum/0xa1eeec225bf382384e92e00f2c5224a23634c29c3e1d86ea7f017b73e55668f9';
    case 'NonKyc':
      return 'https://nonkyc.io/market/NAT_USDT';
    case 'Bit.com':
      return 'https://www.bit.com/spot?pair=NAT-USDT';
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
  <!-- Uniswap: do NOT make the whole card clickable; show inline links instead -->
  <div v-if="name === 'Uniswap'"
       ref="cardRef"
       class="block bg-dark-card p-6 rounded-xl hover:bg-dark-lighter transition-all duration-700 ease-out flex flex-col items-center transform"
       :class="{
         'opacity-0 translate-y-16 scale-95': !isVisible,
         'opacity-100 translate-y-0 scale-100': isVisible
       }">
    <img v-if="displayLogo"
         :src="displayLogo"
         :alt="`${name} logo`"
         class="w-24 h-24 mb-4 object-contain rounded-lg" />
    <h3 class="text-xl font-bold">{{ name }}</h3>
    <div class="mt-2 flex items-center gap-3">
      <a href="https://bridge.taparooswap.com/"
         target="_blank"
         rel="noopener noreferrer"
         class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">Bridge</a>
      <a href="https://app.uniswap.org/explore/pools/ethereum/0xa1eeec225bf382384e92e00f2c5224a23634c29c3e1d86ea7f017b73e55668f9"
         target="_blank"
         rel="noopener noreferrer"
         class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">Pool 1</a>
      <a href="https://app.uniswap.org/explore/pools/ethereum/0xc2333e81bcd1226bc04d65acaf3df7f23e1f588195b11fbe7ef8f9e8e7b716ba"
         target="_blank"
         rel="noopener noreferrer"
         class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">Pool 2</a>
    </div>
  </div>

  <!-- Other exchanges: keep the whole card clickable -->
  <a v-else
     ref="cardRef"
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