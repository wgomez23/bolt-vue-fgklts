<template>
  <div class="min-h-screen bg-black text-white">
    <NavBar />
    
    <!-- Hero with full viewport height -->
    <div class="relative h-screen flex items-center">
      <FallingSquares />
      <div class=" overflow-x-scroll overflow-x-hidden w-full flex flex-col absolute ">
        <div class="text-center mb-8">
          <h1 class="text-6xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            $NAT Token
          </h1>
          <p class="text-xl text-gray-400">The First Non-Arbitrary Token Based on Digital Matter Theory</p>
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
                Digital Matter Theory is a groundbreaking meta-protocol that revolutionizes how we think about digital assets.
                It establishes a fundamental framework for understanding the intrinsic value of digital entities through
                mathematical principles and quantum computing concepts.
              </p>
              <p class="text-gray-300">
                By analyzing the fundamental properties of digital systems, DMT creates a new paradigm for understanding
                value in the digital realm. This theoretical framework provides the foundation for truly non-arbitrary
                digital assets, beginning with $NAT.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <!--<AnimatedSection :delay="600">
        <section>
          <SectionTitle>What is $NAT?</SectionTitle>
          <div class="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start">
            <VideoEmbed videoId="nat-video-id" class="h-full order-1 lg:order-2" />
            <div class="prose prose-invert max-w-none order-2 lg:order-1">
              <h3 class="text-2xl font-bold mb-4 text-white">Non-Arbitrary Token</h3>
              <p class="text-gray-300 mb-4">
                $NAT (Non-Arbitrary Token) is the first implementation of Digital Matter Theory principles in a digital asset.
                Unlike traditional cryptocurrencies, $NAT's value is derived from fundamental digital properties rather than
                arbitrary market forces.
              </p>
              <p class="text-gray-300">
                Through its unique design and implementation of DMT principles, $NAT represents a new generation of digital
                assets that bridge the gap between theoretical foundations and practical value creation in the digital realm.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>
    -->

      <AnimatedSection :delay="800">
        <section>
          <SectionTitle>Where to Buy</SectionTitle>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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

    <Footer />
  </div>
</template>

<script setup lang="ts">
import {ref,  watchEffect } from 'vue';
import BitcoinChart from './components/BitcoinChart.vue'
import NavBar from './components/NavBar.vue'
import SectionTitle from './components/SectionTitle.vue'
import FAQSection from './components/FAQSection.vue'
import VideoEmbed from './components/VideoEmbed.vue'
import ExchangeCard from './components/ExchangeCard.vue'
import MissionSection from './components/MissionSection.vue'
import Footer from './components/Footer.vue'
import FallingSquares from './components/FallingSquares.vue'
import AnimatedSection from './components/AnimatedSection.vue'
import MempoolBlocks from './components/MempoolBlocks.vue'
const exchanges = [
  { name: 'Taprooswap', logo: null },
  { name: 'SuperEx', logo: null },
  { name: 'OrdinalsWallet', logo: null }
];
const API_URL = 'https://mscribe.io/api/tokens/all';
const token = (ref());
const usdValue = (ref());
let getTotalAvailable = (max:string, left:string)=> {
      let balance =  BigInt(max ) - BigInt(left);
      return balance.toString();
}
watchEffect(async()=>{
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
  token.value = response.deployments[0];
  usdValue.value = response.usd_value;
  } catch (error) {
    console.log(error);
  }
 //change token properties
 token.value.totalSupply = getTotalAvailable(token.value.max, token.value.mintLeft);
 token.value.marketcap = token.value.floor_price * token.value.totalSupply;
})
</script>