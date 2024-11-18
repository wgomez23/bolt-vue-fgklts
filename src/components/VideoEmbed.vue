<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  videoId: string
}>()

const embedUrl = computed(() => `https://www.youtube.com/embed/${props.videoId}`)
</script>

<template>
  <div class="relative w-full" style="padding-top: 56.25%">
    <div class="absolute inset-0 bg-gray-900 rounded-xl overflow-hidden">
      <iframe
        class="w-full h-full"
        :src="embedUrl"
        :title="'Video Player'"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>