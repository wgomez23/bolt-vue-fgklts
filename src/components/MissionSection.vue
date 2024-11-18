<script setup lang="ts">
import StatCard from './StatCard.vue';

const stats = [
  {
    icon: '⏱️',
    value: '20,500+',
    label: 'Holders'
  },
  {
    icon: '📦',
    value: '358T',
    label: 'Supply'
  },
  {
    icon: '💎',
    value: '$12M',
    label: 'Marketcap'
  },
  {
    icon: '👥',
    value: '358,000,000+',
    label: 'Subsidies Contributed'
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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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