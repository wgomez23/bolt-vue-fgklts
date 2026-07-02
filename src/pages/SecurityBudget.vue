<template>
  <div class="min-h-screen px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-16 max-w-7xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-white">The Bitcoin Security Budget</h1>
      <p class="mt-2 text-gray-400 max-w-3xl">
        As the block subsidy halves toward zero by 2140, who pays to secure Bitcoin? Explore how subsidy, fees, and
        $NAT combine, and why $NAT matters to Bitcoin's long-term security.
      </p>
    </header>
    <SecurityBudgetExplorer :chart-height="640" />
  </div>
</template>

<script setup lang="ts">
import SecurityBudgetExplorer from '../components/SecurityBudgetExplorer.vue'
</script>
