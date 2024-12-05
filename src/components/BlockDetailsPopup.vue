<template>
  <div v-if="show" class="bg-black bg-opacity-50 flex items-center justify-center z-50 mb-4">
    <div class="bg-[#1a1a1a] p-6 max-w-2xl w-full mx-4 border-t-[3px] border-solid">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Block #{{ block.height }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="py-2 px-4 text-primary">Height</th>
              <th class="py-2 px-4 text-primary">Timestamp</th>
              <th class="py-2 px-4 text-primary">Mined</th>
              <th class="py-2 px-4 text-primary">Amount</th>
              <th class="py-2 px-4 text-primary">Status</th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading skeleton -->
            <template v-if="isLoading">
              <tr v-for="i in 10" :key="i" class="text-gray-300 animate-pulse">
                <td v-for="j in 5" :key="j" class="py-2 px-4">
                  <div class="h-4 bg-gray-700 rounded w-20"></div>
                </td>
              </tr>
            </template>
            
            <!-- Actual data -->
            <tr v-else class="text-gray-300" :class="{'bg-dark': index % 2 == 0}" v-for="(entry,index) in entries " :key="entry.tx">
              <td class="py-2 px-4">{{ entry.blck }}</td>
              <td class="py-2 px-4">{{ formatTimestamp(entry.ts) }}</td>
              <td class="py-2 px-4">{{ formatRelativeTime(entry.ts) }}</td>
              <td class="py-2 px-4">{{ formatNumber(entry.amt) }}</td>
              <td class="py-2 px-4">
                <span class="px-2 py-1 rounded-full text-sm" 
                      :class="block.confirmed ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'">
                  {{ !entry.fail ? 'Valid' : 'invalid' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: Boolean,
    block: Object
  },
  data() {
    return {
      isLoading: false,
      entries:[]
    }
  },
  watch: {
    'block.height': {
      immediate: true,
      async handler(newVal) {
        if (!newVal || !this.block.extras?.pool?.slug) return
        
        this.isLoading = true
        try {
          const response = await fetch('https://mscribe.io/api/pools/get', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pool: this.block.extras.pool.slug,
              offset: 0,
              limit: 10
            })
          })
          const data = await response.json();

          if (data.success) {
            this.entries = data.stats;
          }
          // Handle the response data as needed
        } catch (error) {
          console.error('Error fetching pool data:', error)
        } finally {
          this.isLoading = false
        }
      }
    }
  },
  methods: {
    formatTimestamp(timestamp) {
      return new Date(timestamp * 1000).toDateString();
    },
    formatRelativeTime(timestamp) {
      const now = Math.floor(Date.now() / 1000);
      const diff = now - timestamp;
      
      // Less than 60 minutes
      if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      
      // Less than 24 hours
      if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      }
      
      // Days
      const days = Math.floor(diff / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  }
}
</script> 