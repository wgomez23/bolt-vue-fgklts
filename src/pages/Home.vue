<template>
  <!-- Hero with full viewport height -->
  <div class="relative h-screen flex items-center">
    <FallingSquares />
    <div class=" overflow-x-scroll overflow-x-hidden w-full flex flex-col absolute ">
      <div class="text-center mb-8">
        <h1 class="text-6xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          $NAT Token
        </h1>
        <p class="text-xl text-gray-400">The First Bitcoin Produced Digital Commodity</p>
      </div>
      <MempoolBlocks />
    </div>
  </div>

  <main class="container mx-auto px-4 py-16 space-y-32">
    <AnimatedSection>
      <MissionSection v-if="token"
      :natStats="token"
      :usd="usdValue"/>
    </AnimatedSection>

    <!-- Miner Leaderboards-->
    <AnimatedSection :delay="100">
      <MinerLeaderBoard :currentMarketCap="token?.marketcap * usdValue" />
    </AnimatedSection>

    <AnimatedSection :delay="200">
      <section>
        <SectionTitle>Hash Power & $NAT Expansion</SectionTitle>
        <div class="bg-dark-card p-6 rounded-xl">
          <BitcoinChart />
        </div>
      </section>
    </AnimatedSection>

    <AnimatedSection :delay="400">
      <section>
        <SectionTitle>What is DMT?</SectionTitle>
        <div class="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start">
          <VideoEmbed :videoId="'https://www.youtube.com/embed/Zcu7FBbNYdU?si=ZglBvNgxcunDNMUW'" class="h-full" />
          <div class="prose prose-invert max-w-none">
            <h3 class="text-2xl font-bold mb-4 text-white">Digital Matter Theory Explained</h3>
            <p class="text-gray-300 mb-4">
              Digital Matter Theory (DMT) is a pioneering meta-protocol on Bitcoin that redefines the concept of digital commodities. It introduces a foundational framework that ties Bitcoin's intrinsic value to its thermodynamic properties, transforming how we perceive and apply its unique characteristics.
            </p>
            <p class="text-gray-300 mb-6">
              By examining Bitcoin's core properties, DMT establishes a new paradigm for valuing digital assets. This framework enables the creation of truly non-arbitrary digital matter, starting with $NAT, and sets the stage for a more structured approach to digital scarcity and value.
            </p>
            <a 
              href="https://digital-matter-theory.gitbook.io/"
              target="_blank"
              class="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </AnimatedSection>

    <AnimatedSection :delay="600">
      <section>
        <SectionTitle>What is $NAT?</SectionTitle>
        <div class="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start">
          <div class="prose prose-invert max-w-none order-2 lg:order-1">
            <h3 class="text-2xl font-bold mb-4 text-white">Non-Arbitrary Token</h3>
            <p class="text-gray-300 mb-4">
              $NAT is the first Non-Arbitrary Token that is uniquely designed to be generated with every Bitcoin block and distributed directly to Bitcoin miners as an additional subsidy reward - a first in Bitcoin's history. Its supply is determined by the 'bits' field of Bitcoin's block data and harnesses the thermodynamic properties of Bitcoin's immutable data layer to create an entirely new class of digital commodity.
            </p>
          </div>
          <VideoEmbed :videoId="'https://www.youtube.com/embed/37MprVMRHhU'" class="h-full order-1 lg:order-2" />
        </div>
      </section>
    </AnimatedSection>

    <!-- Features Section -->
    <AnimatedSection :delay="500">
      <FeaturesSection />
    </AnimatedSection>

    <AnimatedSection :delay="800">
      <section id="whereToBuy">
        <SectionTitle>Where to Buy</SectionTitle>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ExchangeCard
            v-for="(exchange, index) in exchanges"
            :key="exchange.name"
            :name="exchange.name"
            :logo="exchange.logo"
            :index="index"
          />
        </div>
      </section>
    </AnimatedSection>

    <AnimatedSection :delay="1000" id="faq">
      <FAQSection />
    </AnimatedSection>
  </main>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import BitcoinChart from '../components/BitcoinChart.vue'
import SectionTitle from '../components/SectionTitle.vue'
import FAQSection from '../components/FAQSection.vue'
import VideoEmbed from '../components/VideoEmbed.vue'
import ExchangeCard from '../components/ExchangeCard.vue'
import MissionSection from '../components/MissionSection.vue'
import FallingSquares from '../components/FallingSquares.vue'
import AnimatedSection from '../components/AnimatedSection.vue'
import MempoolBlocks from '../components/MempoolBlocks.vue'
import MinerLeaderBoard from '../components/MinerLeaderBoard.vue'
import FeaturesSection from '../components/FeaturesSection.vue'

const exchanges = [
  { name: 'Hypermall', logo: null },
  { name: 'OrdinalsWallet', logo: null },
  { name: 'TaparooSwap', logo: null },
  { name: 'SatX', logo: null },
  { name: 'SuperEx', logo: null },
  { name: 'Uniswap', logo: null }
];
const API_URL = 'https://mscribe.io/api/tokens/all';
const token = ref<any | null>(null);
const usdValue = ref<any | null>(null);
let getTotalAvailable = (max:string, left:string)=> {
      let balance =  BigInt(max ) - BigInt(left);
      return balance.toString();
}
watchEffect(async () => {
  try {
    const request = await fetch(API_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        ticker: 'dmt-nat',
        limit: 1,
        offset: 0,
        latest_deployed: 0,
        isGetHolders: 1
      })
    });
  const response = await request.json();
  token.value = response?.deployments?.[0] ?? null;
  usdValue.value = response?.usd_value ?? null;
  } catch (error) {
    console.log(error);
  }
 // derive token properties only if token exists
 if (token.value) {
   token.value.totalSupply = getTotalAvailable(token.value.max, token.value.mintLeft);
   token.value.marketcap = token.value.floor_price * token.value.totalSupply;
 }
})
</script>
