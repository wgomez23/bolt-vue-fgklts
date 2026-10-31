<template  >
  <div class=" flex flex-col">
  <div class="container flex items-center gap-2 justify-start relative mx-auto">
    <div class="pl-[20px]">
      <p></p>
      <div class="relative bg-[#ED711A] h-[120px] w-[120px] flex flex-col px-[11px] py-[4.5px] mt-[3.5rem] justify-center">
        <div class="absolute skew-y-[50deg] origin-top transition-colors bg-[#58441b]" style="height: 120px; width: calc(20px); top: calc(-12px); left: calc(-20px);"></div>
        <div class="absolute skew-x-[40deg] origin-top transition-colors bg-[#58441b]" style="width: 120px; height: calc(24px); top: calc(-24px); left: calc(-20px);"></div>
        <img :src="CDN_URL+'bitcoin.png'" class="animate-[spin_4s_infinite]" />
      </div>
      <div class="py-4"></div>
    </div>
    <div class="h-[200px] border-r-[2px] border-dashed mx-3 my-auto">
    </div>
    <div class="pl-[20px] flex items-center gap-7 justify-start overflow-x-scroll overflow-x-hidden w-full ">
      <Block 
      :key="block.id"
      :block="block" v-for="(block) in sortedBlocks"
      :blockSelected=" selectedBlock?.height"
      :class="{'new-block' : block.id == newBlockHash}"
      @handleClick="showBlockDetails(block)"
      :data-block-height="block.height"
      />
    </div>
  </div>
  <BlockDetailsPopup 
    :show="selectedBlock !== null"
    :block="selectedBlock"
    @close="selectedBlock = null"
  />
</div>
</template>
<script >
import Block from './Block.vue';
import BlockDetailsPopup from './BlockDetailsPopup.vue';
import { USE_NAT_API, latestBlocksUrl } from '../utils/natApi';

const POLL_MS = 60_000; // a new block comes about every 10 minutes

export default{
  mounted() {
    if (USE_NAT_API) {
      this.startPolling();
    } else {
      this.connectWebSocket();
    }
  },
  beforeUnmount() {
    this.stopped = true;
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
    document.removeEventListener('visibilitychange', this.onVisibility);
  },
  components:{Block, BlockDetailsPopup},
  data(){
    return {
      CDN_URL: 'https://mscribe-webapp.s3.amazonaws.com/',
      blocks: [],
      ws: null,
      pingInterval: null,
      pollTimer: null,
      stopped: false,
      newBlockHash:null,
      selectedBlock: null
    }
  },
  computed:{
    sortedBlocks(){
      return [...this.blocks].sort((a, b) => b.height - a.height);
    }
  },
  methods:{
    // Free block API: fetch the latest blocks once a minute while the tab is visible.
    startPolling() {
      this.onVisibility = () => {
        if (document.visibilityState === 'visible') this.fetchBlocks();
      };
      document.addEventListener('visibilitychange', this.onVisibility);
      this.fetchBlocks();
      this.pollTimer = setInterval(() => {
        if (document.visibilityState === 'visible') this.fetchBlocks();
      }, POLL_MS);
    },
    async fetchBlocks() {
      try {
        const res = await fetch(latestBlocksUrl(15));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { blocks } = await res.json();
        if (!Array.isArray(blocks) || this.stopped) return;
        const known = new Set(this.blocks.map((b) => b.id));
        const hadBlocks = this.blocks.length > 0;
        this.blocks = blocks;
        const newest = blocks.reduce((a, b) => (b.height > (a?.height ?? -1) ? b : a), null);
        if (hadBlocks && newest && !known.has(newest.id)) {
          this.newBlockHash = newest.id;
          setTimeout(() => {
            this.newBlockHash = null;
          }, 1500); // Match the animation duration
        }
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    },
    connectWebSocket() {
      if (this.stopped) return;
      this.ws = new WebSocket('wss://mscribe-indexer-32036803921d.herokuapp.com');

      this.ws.onopen = () => {
        this.ws.send(JSON.stringify({ action: "init" }));
        this.ws.send(JSON.stringify({ action: "want", data:["blocks"] }));

        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ action: "ping" }));
          }
        }, 5000);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
        setTimeout(() => this.connectWebSocket(), 5000);
      };
    },
    handleWebSocketMessage(data) {

      if (data.blocks) {
        this.blocks = data.blocks;
      }
      if (data.block) {
        this.blocks.push(data.block);
        this.newBlockHash = data.block.id;
        setTimeout(() => {
          this.newBlockHash = null;
        }, 1500); // Match the animation duration
      }
    },
    showBlockDetails(block) {
      if (this.selectedBlock?.height === block.height) {
        this.selectedBlock = null;
      } else {
        this.selectedBlock = block;
        this.$nextTick(() => {
          const blockElement = document.querySelector(`[data-block-height="${block.height}"]`);
          if (blockElement) {
            blockElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });
          }
        });
      }
    }
  }

}
</script>
<style  scoped>
*::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
* {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.new-block {
  animation: slide-in 3s cubic-bezier(0.36, 1.07, 1, 1)
}

@keyframes slide-in {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>