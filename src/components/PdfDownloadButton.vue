<template>
  <a
    href="/natpaper.pdf"
    download="NATpaper.pdf"
    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/25"
    :class="props.class"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    <span>{{ label }}</span>
  </a>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Download PDF',
  class: ''
})
</script>
