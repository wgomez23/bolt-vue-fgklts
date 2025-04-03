<template>
  <div class="overflow-x-auto bg-dark-card p-6 rounded-xl">
    <h2
      class="text-5xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center"
    >
      Miner Leaderboard
    </h2>

    <!-- Market Cap Slider -->
    <div class="mb-8 p-4 bg-dark-lighter rounded-lg">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <label class="text-gray-300">Theoretical $NAT Market Cap:</label>
        <span class="text-primary font-bold">${{ formatLargeNumber(marketCapValue) }}</span>
      </div>
      <div class="relative">
        <input
          type="range"
          v-model="sliderValue"
          min="0"
          max="100"
          step="0.1"
          class="slider-input w-full h-2 rounded-lg appearance-none cursor-pointer"
          ref="slider"
          @input="handleSliderInput"
          :style="{
            background: `linear-gradient(to right, #00FF94 ${sliderValue}%, #374151 ${sliderValue}%)`
          }"
        />
      </div>
      <div class="flex justify-between text-xs text-gray-400 mt-1">
        <span>$0</span>
        <span>$1T</span>
      </div>
      <!-- Per Block Value -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4 pt-4 border-t border-gray-700">
        <label class="text-gray-300">Theoretical USD Value of $NAT Per Block:</label>
        <span class="text-secondary font-bold">${{ calculateTheoreticalBlockValue() }}</span>
      </div>
    </div>

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
    <div v-else class="overflow-x-auto">
      <div class="min-w-[800px]"> <!-- Minimum width container -->
        <table class="w-full text-left border border-gray-700">
          <thead>
            <tr class="border-b border-gray-700">
              <th class="py-2 px-4 text-primary text-lg text-center whitespace-nowrap">Pool</th>
              <th class="py-2 px-4 text-primary text-lg text-center whitespace-nowrap">$NAT Reward</th>
              <th class="py-2 px-4 text-primary text- lg text-center whitespace">$NAT Balance</th>
              <th class="py-2 px-4 text-primary text-lg text-center whitespace-nowrap">Theoretical USD Value</th>
              <th class="py-2 px-4 text-primary text-lg text-center whitespace-nowrap">BTC Reward</th>
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
              v-for="(item, index) in list"
              :key="item.id"
            >
              <td class="py-2 px-4">
                <div class="items-center gap-2 flex w-full justify-center py-2">
                  <p class="text-sm whitespace-nowrap">{{ item.name }}</p>
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
              <td class="py-2 px-4 text-center whitespace-nowrap">{{ formatNumber(item.total_rewards) }}</td>
              <td class="py-2 px-4 text-center whitespace-nowrap">{{ formatNumber(item.balance) }}</td>
              <td class="py-2 px-4 text-center text-green-400 whitespace-nowrap">${{ new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(calculateTheoreticalValueRaw(item.balance)) }}</td>
              <td class="py-2 px-4 text-center whitespace-nowrap">
                {{ formatNumber(satsToBitcoin(item?.extraData?.totalReward, 0)) }} <span class="text-xs text-primary">BTC</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
import confetti from 'canvas-confetti';

export default {
  components: {
    Pagination,
  },
  props: {
    currentMarketCap: {
      type: Number,
      required: true
    }
  },
  watch: {
    currentMarketCap: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          // Divide by 100,000,000 to convert to correct scale
          const adjustedMarketCap = newValue / 100000000;
          const minValue = Math.log10(1e6);
          const maxValue = Math.log10(1e12);
          const currentValue = Math.log10(adjustedMarketCap);
          this.sliderValue = ((currentValue - minValue) / (maxValue - minValue)) * 100;
        }
      }
    }
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
      sliderValue: 0,
      totalSupply: 386057444,
      currentBlockBits: 386038124,
      lastTrillionConfetti: 0, // To prevent multiple confetti bursts
    };
  },
  computed: {
    marketCapValue() {
      const minValue = 1e6; // $1M
      const maxValue = 1e12; // $1T
      const exponent = this.sliderValue / 100 * (Math.log10(maxValue) - Math.log10(minValue)) + Math.log10(minValue);
      return Math.floor(Math.pow(10, exponent));
    }
  },
  methods: {
    handleSliderInput() {
      // Check if we're at $1T (allowing for some small deviation due to floating point)
      if (this.marketCapValue >= 0.999e12 && Date.now() - this.lastTrillionConfetti > 1000) {
        this.lastTrillionConfetti = Date.now();
        this.triggerConfetti();
      }
    },
    triggerConfetti() {
      const slider = this.$refs.slider;
      if (!slider) return;

      // Get the slider's position
      const rect = slider.getBoundingClientRect();
      const x = (rect.left + rect.right) / 2 / window.innerWidth;
      const y = rect.top / window.innerHeight;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#F7931A', '#00FF94', '#ffffff'],
        ticks: 200,
        gravity: 1.2,
        scalar: 1.2,
        shapes: ['circle', 'square']
      });
    },
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
    formatLargeNumber(value) {
      if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
      if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
      return this.formatNumber(value);
    },
    calculateTheoreticalValueRaw(balance) {
      if (!balance || !this.marketCapValue || !this.totalSupply) return 0;
      return ((balance / this.totalSupply) * this.marketCapValue) / 1000000;
    },
    calculateTheoreticalValue(balance) {
      const value = this.calculateTheoreticalValueRaw(balance);
      return this.formatLargeNumber(value);
    },
    calculateTheoreticalBlockValue() {
      if (!this.marketCapValue || !this.totalSupply || !this.currentBlockBits) return "0";
      const value = ((this.currentBlockBits / this.totalSupply) * this.marketCapValue) / 1000000;
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },
    getDefault(e) {
      e.target.src = 'https://mempool.space/resources/mining-pools/default.svg';
    },
    satsToBitcoin(sats, dec = 8) {
      if (!sats) return 0;
      const satoshisPerBitcoin = 100_000_000;
      const bitcoinValue = Number(sats) / satoshisPerBitcoin;
      return bitcoinValue.toFixed(dec);
    }
  },
};
</script>

<style scoped>
/* Slider custom styling */
.slider-input {
  -webkit-appearance: none;
  appearance: none;
  background: #374151;
  cursor: pointer;
  height: 8px;
  border-radius: 4px;
}

/* Thumb styling */
.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--primary-color, #F7931A);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.slider-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: var(--primary-color, #F7931A);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

/* Focus styles */
.slider-input:focus {
  outline: none;
}

.slider-input:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(247, 147, 26, 0.3);
}

.slider-input:focus::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(247, 147, 26, 0.3);
}

/* Smooth scrolling for table container */
.overflow-x-auto {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #374151 #1a1a1a;
}

/* Custom scrollbar styling */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}
</style>