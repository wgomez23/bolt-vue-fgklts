<template >
  <div @click="$emit('handleClick', block)" class="relative my-10 cursor-pointer">
    <div class="text-center" :class="{'underline text-[#FA951D]': blockSelected == block.height}">{{block.height}} </div>
      <div class="relative bg-[#00FF94] h-[120px] w-[120px] flex flex-col px-[5px] py-[4.5px] mt-[2rem] justify-center gap-1 items-center">
        <div class="absolute skew-y-[50deg] origin-top transition-colors bg-[#1b583b]" style="height: 120px; width: calc(20px); top: calc(-12px); left: calc(-20px);"></div>
        <div class="absolute skew-x-[40deg] origin-top transition-colors bg-[#1b583b]" style="width: 120px; height: calc(24px); top: calc(-24px); left: calc(-20px);"></div>
        <img src="/public//Nat_logo.png" class="w-[20px] h-[20px]" />
        <p class="text-black font-medium text-sm text-center">{{formatNumber(block.bits)}} NATs</p>
        <p class="text-black  font-medium  text-sm">{{getTimeDifference}}</p>
      </div>
      <div class="items-center gap-2 flex w-full justify-center py-2">
        <img class="w-[15px] h-[15px]" :src="'https://mempool.space/resources/mining-pools/'+block.extras.pool.slug+'.svg' " alt="pool-logo" width="15" height="15" />
        <p class="text-sm">{{block.extras.pool.name}}</p>
      </div>
      <div v-if="blockSelected == block.height" class="absolute w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[25px] border-b-[#fff] bottom-[-25px] left-1/2 transform -translate-x-1/2 translate-y-1/2"></div>
  </div>
</template>
<script>
export default {
  props: ['block', 'blockSelected'],
  data() {
    return {
      timer: null,
      currentDiff: ''
    }
  },
  created() {
    this.updateTimeDiff()
    this.timer = setInterval(this.updateTimeDiff, 5000)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    updateTimeDiff() {
      const now = Math.floor(Date.now() / 1000);
      const diff = now - this.block.timestamp;
      const minutes = Math.floor(diff / 60);
      if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        this.currentDiff = `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
      } else {
        this.currentDiff = `${minutes} mins ago`;
      }
    }
  },
  computed: {
    getTimeDifference() {
      return this.currentDiff;
    }
  }
}

</script>