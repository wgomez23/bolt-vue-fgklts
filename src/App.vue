<template>
  <div class="min-h-screen bg-black text-white">
    <NavBar v-if="!hideNav" />
    <RouterView />
    <Footer v-if="!hideNav" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'

const route = useRoute()
const hideNav = computed(() => route.meta.hideNav === true)
</script>