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
    answer: "Digital Matter Theory analyzes Bitcoin's underlying properties like hash power and difficulty adjustment to establish fundamental principles for digital value."
  },
  {
    question: "What is the total supply of $NAT?",
    answer: "The supply of $NAT is determined by mathematical principles derived from Digital Matter Theory, ensuring a non-arbitrary distribution model."
  },
  {
    question: "How can I participate in the $NAT ecosystem?",
    answer: "You can participate by trading $NAT on supported exchanges, contributing to the protocol development, or joining our community discussions."
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