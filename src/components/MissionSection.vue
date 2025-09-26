<script setup lang="ts">
import StatCard from './StatCard.vue';
const { natStats,usd } = defineProps(['natStats','usd']);
//functions
const caculateSupply = (supply: string) => {
  let formattedSupply = supply;
  //Return value in billion or trillion 
  if (supply.length > 12) {
    formattedSupply = supply.slice(0, 3) + 'T';
  } else if (supply.length > 9) {
    formattedSupply = supply.slice(0, 9) + 'B';
  }
  return formattedSupply;
}
const satsToBitcoin = (sats: number, dec = 8) => {
  // 1 Bitcoin is equal to 100,000,000 satoshis
  const satoshisPerBitcoin = 100_000_000;

  // Convert satoshis to Bitcoin
  const bitcoinValue = Number(sats) / satoshisPerBitcoin;
  const amount = bitcoinValue.toFixed(dec);
  return amount
}
const stats = [
  {
    icon: '👥',
    value: natStats.holders.toString(),
    label: 'Holders'
  },
  {
    icon: '📦',
    value: caculateSupply(natStats.totalSupply),
    label: 'Supply'
  },
  {
    icon: '💎',
    value: '$'+satsToBitcoin(natStats.marketcap  * usd,2) ,
    label: 'Marketcap'
  }
];

</script>

<template>
  <section class="mb-20 text-center">
    <h1 class="text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      Mission
    </h1>
    <p class="max-w-3xl mx-auto text-gray-300 mb-12">
      Our mission is to redefine the Bitcoin mining incentive model by directing newly generated $DMT-NAT tokens to miners who win blocks, using the principles of Digital Matter Theory. This initiative aims to ensure a long-term, sustainable mining economy and to maintain the security and decentralization of the Bitcoin blockchain as the subsidy decreases.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        v-for="stat in stats"
        :key="stat.label"
        :icon="stat.icon"
        :value="stat.value"
        :label="stat.label"
      />
    </div>
  </section>
</template>