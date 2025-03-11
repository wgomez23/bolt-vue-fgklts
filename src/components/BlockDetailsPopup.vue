<template>
  <div
    v-if="show"
    class="bg-black bg-opacity-50 flex items-center justify-center z-50 mb-4"
  >
    <div
      class="bg-[#1a1a1a] p-6 max-w-2xl w-full mx-4 border-t-[3px] border-solid"
    >
      <div class="flex justify-between items-center mb-4">
        <h2
          class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent capitalize"
        >
          {{ block.extras.pool?.name }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div
        class="my-5 flex items-center justify-between"
        :class="{ 'animate-pulse bg-gray-700': isLoading }"
      >
        <p
          v-if="totalRewards"
          class="text-gray-400 font-bold flex text-center flex-col"
        >
          $NAT Historic Rewards
          <span class="text-white font-bold">{{
            formatNumber(totalRewards)
          }}</span>
        </p>
        <p
          v-if="balance"
          class="text-gray-400 font-bold flex text-center flex-col"
        >
          $NAT Balance
          <span class="text-white font-bold">{{
            formatNumber(balance)
          }}</span>
        </p>
      </div>
      <!-- No data found message -->
      <template v-if="!isLoading && entries.length === 0">
        <div>
          <p  class="py-2 px-4 text-center text-gray-500 mx-auto flex
          items-center justify-center">
            Oops! It looks like we couldn't find any data. Please try again later.
          </p>
        </div>
      </template>
      <div class="overflow-x-auto" v-else>
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
            <tr
              v-else
              class="text-gray-300"
              :class="{ 'bg-dark': index % 2 == 0 }"
              v-for="(entry, index) in entries"
              :key="entry.tx"
            >
              <td class="py-2 px-4 cursor-pointer">
                <a
                  :href="'https://mempool.space/tx/' + entry.tx"
                  target="_blank"
                  class="hover:underline hover:text-primary"
                >
                  {{ entry.blck }}
                </a>
              </td>
              <td class="py-2 px-4">{{ formatTimestamp(entry.ts) }}</td>
              <td class="py-2 px-4">{{ formatRelativeTime(entry.ts) }}</td>
              <td class="py-2 px-4">{{ formatNumber(entry.amt) }}</td>
              <td class="py-2 px-4">
                <span
                  class="px-2 py-1 rounded-full text-sm"
                  :class="
                    block.confirmed
                      ? 'bg-green-900 text-green-300'
                      : 'bg-yellow-900 text-yellow-300'
                  "
                >
                  {{ !entry.fail ? "Valid" : "invalid" }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <Pagination
          :total="total"
          :limit="limit"
          :page="currentPage"
          @onPageChange="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from "./Pagination.vue";
export default {
  components: {
    Pagination,
  },
  props: {
    show: Boolean,
    block: Object,
  },
  data() {
    return {
      isLoading: false,
      entries: [],
      totalRewards: null,
      balance: null,
      //pagination
      currentPage: 1,
      offset: 0,
      limit: 10,
      total: 0,
      abortController: null,
    };
  },
  watch: {
    "block.height": {
      immediate: true,
      async handler(newVal) {
        if (!newVal || !this.block.extras?.pool?.slug) return;
        this.totalRewards = null;
        this.currentPage = 1;
        this.limit = 10;
        this.offset = 0;
        this.fetchPoolData();
      },
    },
  },
  methods: {
    async fetchPoolData() {
      this.isLoading = true;
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();
      const signal = this.abortController.signal;

      try {
        const response = await fetch(
          `https://mscribe-stage-4385d64f074b.herokuapp.com/api/pools/rewards/${this.block.extras.pool?.slug}?offset=${this.offset}&limit=${this.limit}`,
          { signal }
        );

        if (!response.ok) {
          this.isLoading = false;
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success) {
          this.entries = data.blocks;
          this.totalRewards = data.analytics?.total_rewards || 0;
          this.balance = data.analytics?.balance || 0;
          this.total = data.analytics?.total || 0;
        }
        // Handle the response data as needed
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error("Error fetching pool data:", error);
        }
      } finally {
        this.isLoading = false;
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.offset = (page - 1) * this.limit;
      this.fetchPoolData();
    },
    formatTimestamp(timestamp) {
      return new Date(timestamp * 1000).toDateString();
    },
    formatRelativeTime(timestamp) {
      const now = Math.floor(Date.now() / 1000);
      const diff = now - timestamp;

      // Less than 60 minutes
      if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
      }

      // Less than 24 hours
      if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      }

      // Days
      const days = Math.floor(diff / 86400);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    },
  },
};
</script> 