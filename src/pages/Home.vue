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

    <!-- Bitcoin Security Budget explorer -->
    <AnimatedSection :delay="150">
      <section>
        <SectionTitle>The Bitcoin Security Budget</SectionTitle>
        <p class="text-gray-400 max-w-3xl -mt-2 mb-6">
          As the block subsidy halves toward zero by 2140, who pays to secure Bitcoin? Explore how subsidy, fees, and
          $NAT combine, and why $NAT matters to Bitcoin's long-term security.
        </p>
        <SecurityBudgetExplorer :chart-height="640" />
      </section>
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
          <VideoEmbed :videoId="'https://www.youtube.com/embed/1mCpgkYfVng?si=piKUJY2ppjwzLRxQ'" class="h-full" />
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
          <VideoEmbed :videoId="'https://www.youtube.com/embed/46saZxONdcM?si=hmejU1Wsmj8uY74H'" class="h-full order-1 lg:order-2" />
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
import SecurityBudgetExplorer from '../components/SecurityBudgetExplorer.vue'
import FeaturesSection from '../components/FeaturesSection.vue'

const exchanges = [
  { name: 'Hypermall', logo: null },
  { name: 'OrdinalsWallet', logo: null },
  { name: 'TapScope', logo: null },
  { name: 'Satflow', logo: null },
  { name: 'Uniswap', logo: null },
  { name: '1inch', logo: null },
  { name: 'NonKyc', logo: null },
  { name: 'SuperEx', logo: null },
  { name: 'LBank', logo: null },
  { name: 'CoinEx', logo: null },
  { name: 'Raydium', logo: null },
  { name: 'BingX', logo: null },
  { name: 'BitMart', logo: null }
];
const API_URL = 'https://api.mscribe.io/api/tokens/all';
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
  const deployment = response?.deployments?.[0] ?? null;
  usdValue.value = response?.usd_value ?? null;
  // derive token properties only if a deployment exists
  if (deployment) {
    deployment.totalSupply = getTotalAvailable(deployment.max, deployment.mintLeft);
    deployment.marketcap = deployment.floor_price * deployment.totalSupply;
    // Fold in Ethereum $DMT-NAT holders (client-side, Ethplorer free key)
    try {
      const ethRes = await fetch('https://api.ethplorer.io/getTokenInfo/0x249130f5e2dd4cf278180c0df8273f3592ad1247?apiKey=freekey');
      const ethInfo = await ethRes.json();
      const ethHolders = Number(ethInfo?.holdersCount) || 0;
      if (ethHolders > 0) {
        deployment.holders = (Number(deployment.holders) || 0) + ethHolders;
      }
    } catch (e) {
      console.log('eth holders fetch failed', e);
    }
    // Fold in BSC $DMT-NAT holders (client-side, Ankr Advanced API)
    try {
      const bscRes = await fetch('https://rpc.ankr.com/multichain/ff361887ec45cd4385c2baddc80ab0bce30c9dd897be1d80017edb536e8e4ec5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'ankr_getTokenHoldersCount',
          params: { blockchain: 'bsc', contractAddress: '0x600e3b55d5368c32a94f9372563318adb6a3f882' },
          id: 1
        })
      });
      const bscInfo = await bscRes.json();
      const bscHolders = Number(bscInfo?.result?.holderCountHistory?.[0]?.holderCount) || 0;
      if (bscHolders > 0) {
        deployment.holders = (Number(deployment.holders) || 0) + bscHolders;
      }
    } catch (e) {
      console.log('bsc holders fetch failed', e);
    }
  }
  // assign once, after holders are combined, so the counter shows the total
  token.value = deployment;
  } catch (error) {
    console.log(error);
  }
})
</script>
