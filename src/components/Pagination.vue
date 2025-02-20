<template>
  <div class="flex justify-center items-center space-x-2 mt-4">
    <!-- Previous button -->
    <button 
      @click="handlePageChange(currentPage - 1)"
      :disabled="currentPage === 1"
      class="px-3 py-1 rounded-md text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Previous
    </button>

    <!-- Page numbers -->
    <div class="flex space-x-1">
      <button
        v-for="pageNumber in displayedPages"
        :key="pageNumber"
        @click="handlePageChange(pageNumber)"
        :class="[
          'px-3 py-1 rounded-md',
          currentPage === pageNumber 
            ? 'bg-primary text-white' 
            : 'text-gray-400 hover:text-white'
        ]"
      >
        {{ pageNumber }}
      </button>
    </div>

    <!-- Next button -->
    <button 
      @click="handlePageChange(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="px-3 py-1 rounded-md text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Next
    </button>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    total: {
      type: Number,
      required: true
    },
    limit: {
      type: Number,
      required: true
    },
    page: {
      type: Number,
      required: true
    }
  },
  computed: {
    currentPage: {
      get() {
        return this.page;
      },
      set(value) {
        this.$emit('onPageChange', value);
      }
    },
    totalPages() {
      return Math.ceil(this.total / this.limit);
    },
    displayedPages() {
      const pages = [];
      let start = Math.max(1, this.currentPage - 2);
      let end = Math.min(this.totalPages, start + 4);
      
      // Adjust start if end is at max
      if (end === this.totalPages) {
        start = Math.max(1, end - 4);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    }
  },
  methods: {
    handlePageChange(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  }
}
</script> 