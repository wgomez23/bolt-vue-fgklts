<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import SectionTitle from './SectionTitle.vue'

const faqs = [
  {
    question: "What makes $NAT different from other tokens?",
    answer: "$NAT differentiates itself by being a Bitcoin-native token that rewards miners based on Bitcoin's own difficulty metrics, utilizing the novel Digital Matter Theory to give value to the computational effort behind Bitcoin's security. This token model has the potential to provide a sustainable revenue stream for miners in the long term, helping to address challenges that will arise as Bitcoin's block rewards diminish."
  },
  {
    question: "How is Digital Matter Theory related to Bitcoin?",
    answer: "Bitcoin's immutable nature and energy consumption create a direct parallel between the digital and physical worlds. Just as the laws of physics remain constant, the data recorded on Bitcoin's blockchain is permanently unalterable. This fundamental connection is what enables Digital Matter Theory to emerge as a concept uniquely suited to Bitcoin."
  },
  {
    question: "What is the total supply of $NAT?",
    answer: "The supply of $NAT is inherently non-arbitrary, as it is derived entirely from Bitcoin's block data. Specifically, it originates from the Bits field, which represents the network's difficulty adjustment—a value that updates every 2,016 blocks. As Bitcoin's hash power increases, the Bits value decreases. By summing the Bits values across all Bitcoin blocks, a deterministic and non-arbitrary supply of $NAT is established. The current supply is displayed at the top of this page."
  },
  {
    question: "Is $NAT inflationary?",
    answer: "Yes, $NAT has a diminishing inflationary supply that correlates with Bitcoin's increasing security. Since Bitcoin generates a new block approximately every 10 minutes, each block contains a Bits value, which reflects the network's difficulty adjustment every 2,016 blocks. As Bitcoin's hash power rises, the Bits value decreases, naturally reducing the rate at which new $NAT is generated over time."
  },
  {
    question: "How can I participate in the $NAT ecosystem?",
    answer: "You can participate by trading $NAT on supported exchanges, contributing to the protocol development, or joining our community discussions."
  },
  {
    question: "Can $NAT become as valuable as Bitcoin one day?",
    answer: "Bitcoin remains the dominant force in the digital commodity space and is likely to retain its position as the most valuable asset ever created. However, $NAT stands out as the first commodity derived from Bitcoin's immutable data substrate, which grants it unique value comparable to real-world naturally occurring commodities like rare earth metals and oil. With Bitcoin's established reputation as \"digital gold\" driving it to a market capitalization of around $2 trillion, it's reasonable to expect that $NAT, if viewed as \"digital silver,\" could follow a similar 10:1 value ratio. This would position $NAT at an estimated fair value market cap of around $200 billion today."
  },
  {
    question: "Who will buy $NAT?",
    answer: "Those who buy $NAT are the passionate defenders of financial freedom, the same people who rallied behind Bitcoin to escape fiat's endless money printing and hidden inflation taxes that rob everyday savers while benefiting the powerful. They spot the risk in Bitcoin's halvings: assuming prices will double forever to keep miners rewarded is unrealistic, potentially leading to mining centralization and a single entity controlling or censoring transactions. $NAT buyers step up to prevent this by investing in a token that gives miners a lasting extra subsidy, linked directly to Bitcoin's 'bits' field without touching its 21 million cap, creating stronger network security. They're Bitcoin purists, Ordinals creators, and savvy miners (like AntPool and Spiderpool) who view $NAT as a vital shield for decentralization, driven by the same revolutionary spirit of empowerment and resistance that started it all."
  }
]
</script>

<template>
  <section>
    <SectionTitle>Frequently Asked Questions</SectionTitle>
    <div class="space-y-4">
      <Disclosure v-for="faq in faqs" :key="faq.question" v-slot="{ open }" as="div" class="bg-dark-card rounded-xl">
        <DisclosureButton class="w-full px-6 py-4 text-left flex justify-between items-center">
          <span class="font-medium">{{ faq.question }}</span>
          <span class="ml-6 flex-shrink-0">
            <svg class="w-6 h-6 transform transition-transform" :class="{ 'rotate-180': open }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </DisclosureButton>
        <DisclosurePanel class="px-6 pb-4 text-gray-300">
          {{ faq.answer }}
        </DisclosurePanel>
      </Disclosure>
    </div>
  </section>
</template>