<template>
  <div class="overflow-x-auto bg-dark-card p-6 rounded-xl">
    <h2
      class="text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center"
    >
      Miner Leaderboard
    </h2>
    <!-- No data found message -->
    <template v-if="!isLoading && list.length === 0">
      <div>
        <p
          class="py-2 px-4 text-center text-gray-500 mx-auto flex items-center justify-center"
        >
          Oops! It looks like we couldn't find any data. Please try again later.
        </p>
      </div>
    </template>
    <div v-else>
      <table class="w-full text-left border border-gray-700">
        <thead>
          <tr class="border-b border-gray-700">
            <th class="py-2 px-4 text-primary text-lg text-center">Pool</th>
            <th class="py-2 px-4 text-primary text-lg text-center">$NAT Reward</th>
            <th class="py-2 px-4 text-primary text-lg text-center">$NAT Balance</th>
            <th class="py-2 px-4 text-primary text-lg text-center">BTC Reward</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading skeleton -->
          <template v-if="isLoading">
            <tr v-for="i in 10" :key="i" class="text-gray-300 animate-pulse">
              <td v-for="j in 4" :key="j" class="py-2 px-4">
                <div class="h-4 bg-gray-700 rounded w-20"></div>
              </td>
            </tr>
          </template>
          <!-- Actual data -->
          <tr
            v-else
            class="text-gray-300"
            :class="{ 'bg-dark': index % 2 == 0 }"
            v-for="(item, index) in list"
            :key="item.id"
          >
            <td class="py-2 px-4">
              <div class="items-center gap-2 flex w-full justify-center py-2">
                <p class="text-sm">{{ item.name }}</p>
                <img
                  class="w-[15px] h-[15px]"
                  :src="
                    'https://mempool.space/resources/mining-pools/' +
                    item.slug +'.svg'
                  "
                  alt="pool-logo"
                  width="15"
                  height="15"
                  @error="getDefault"
                />
              </div>
            </td>
            <td class="py-2 px-4 text-center">{{ formatNumber(item.total_rewards) }}</td>
            <td class="py-2 px-4 text-center">{{ formatNumber(item.balance) }}</td>
            <td class="py-2 px-4 text-center">
              {{ formatNumber(satsToBitcoin(item?.extraData?.totalReward, 0)) }} <span class="text-xs text-primary">BTC</span>
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
</template>
<script>
import Pagination from "./Pagination.vue";

export default {
  components: {
    Pagination,
  },
  mounted() {
    this.initChart();
  },
  data() {
    return {
      list: [],
      isLoading: false,
      currentPage: 1,
      offset: 0,
      limit: 10,
      total: 0,
      abortController: null,
    };
  },
  methods: {
    async initChart() {
      this.isLoading = true;
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();
      const signal = this.abortController.signal;

      try {
        const response = await fetch(
          `https://mscribe-stage-4385d64f074b.herokuapp.com/api/pools/list?offset=${this.offset}&limit=${this.limit}`,
          { signal }
        );

        if (!response.ok) {
          this.isLoading = false;
          throw new Error(`${response.status}`);
        }
        const { data, success } = await response.json();
        if (success) {
          this.list = data?.pools || [];
          this.total = data?.total || 0;
        }
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
      this.initChart();
    },
    formatNumber(value) {
      if (!value) return "0";
      return new Intl.NumberFormat().format(value);
    },
    getDefault(e){
      e.target.src = 'https://mempool.space/resources/mining-pools/default.svg';
    }
  },
};
</script>