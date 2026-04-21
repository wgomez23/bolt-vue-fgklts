<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NonKycLogo from '../assets/nonkyclogoicon.png';
import OneInchLogo from '../assets/1inch.jpg';

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
    case 'Hypermall':
      return 'https://mscribe-webapp.s3.us-east-2.amazonaws.com/hypermall.png';
    case 'Uniswap':
      return 'https://mscribe-webapp.s3.us-east-2.amazonaws.com/uniswap.png';
    case 'NonKyc':
      return NonKycLogo;
    case '1inch':
      return OneInchLogo;
    case 'Raydium':
      return '/raydium.png';
    case 'Satflow':
      return 'https://www.satflow.com/logo-full-white.svg';
    case 'MEXC':
      return 'https://static.mocortech.com/image-host/web/common/logo/logo-light.png';
    case 'LBank':
      return 'https://www.lbank.com/favicon.ico';
    case 'CoinEx':
      return 'https://www.coinex.com/favicon.ico';
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
    case 'Hypermall':
      return 'https://www.hypermall.io';
    case 'Uniswap':
      return 'https://app.uniswap.org/explore/pools/ethereum/0xa1eeec225bf382384e92e00f2c5224a23634c29c3e1d86ea7f017b73e55668f9';
    case 'NonKyc':
      return 'https://nonkyc.io/market/NAT_USDT';
    case '1inch':
      return 'https://1inch.com/swap?src=1:0x249130f5e2dd4cf278180c0df8273f3592ad1247&dst=1:USDT';
    case 'Raydium':
      return 'https://raydium.io/swap/?inputMint=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB&outputMint=FbKRaqBzupLry3V7QujpNghwrHgxutB4MY11M8aeyVa1&referrer=GxqntmUzXYHddbcPeagPmSnH7NpSXw59wmeAiukcNC38';
    case 'Satflow':
      return 'https://www.satflow.com/tap/DMT-NAT';
    case 'MEXC':
      return 'https://www.mexc.com/exchange/NAT_USDT';
    case 'LBank':
      return 'https://www.lbank.com/trade/dmtnat_usdt';
    case 'CoinEx':
      return 'https://www.coinex.com/zh-hans/price/NAT';
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
       class="block bg-dark-card p-6 rounded-xl hover:bg-dark-lighter transition-all duration-700 ease-out flex flex-col items-center justify-between h-64 transform"
       :class="{
         'opacity-0 translate-y-16 scale-95': !isVisible,
         'opacity-100 translate-y-0 scale-100': isVisible
       }">
    <div class="flex-1 flex items-center justify-center w-full mb-4">
      <img v-if="displayLogo"
           :src="displayLogo"
           :alt="`${name} logo`"
           class="w-24 h-24 object-contain rounded-lg" />
    </div>
    <h3 class="text-xl font-bold">{{ name }}</h3>
    <div class="mt-2 flex flex-col items-center gap-2 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
      <a href="https://bridge.taparooswap.com/"
         target="_blank"
         rel="noopener noreferrer"
         class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">Bridge</a>
      <a href="https://app.uniswap.org/explore/pools/ethereum/0xb44cc02c4ffa5ad68cc66ab404800a4f0029e5b6a9752b7cffc1bf8bbaaa92a3"
         target="_blank"
         rel="noopener noreferrer"
         class="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">Pool</a>
    </div>
  </div>

  <!-- Other exchanges: keep the whole card clickable -->
  <a v-else
     ref="cardRef"
     :href="exchangeUrl"
     target="_blank"
     rel="noopener noreferrer"
     class="block bg-dark-card p-6 rounded-xl hover:bg-dark-lighter transition-all duration-700 ease-out cursor-pointer flex flex-col items-center justify-between h-64 transform"
     :class="{
       'opacity-0 translate-y-16 scale-95': !isVisible,
       'opacity-100 translate-y-0 scale-100': isVisible
     }">
    <div class="flex-1 flex items-center justify-center w-full mb-4">
      <img v-if="displayLogo"
           :src="displayLogo"
           :alt="`${name} logo`"
           class="w-24 h-24 object-contain rounded-lg" />
    </div>
    <h3 class="text-xl font-bold">{{ name }}</h3>
  </a>
</template>