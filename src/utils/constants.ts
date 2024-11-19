export const Access = {
  data() {
    return {
      LOCAL:import.meta.env.VITE_LOCAL,
    }
  },
  methods:{
    formatNumber(nr:number) {
      return nr.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    getTotalAvailable(max:number, left:number) {
      let balance =  BigInt(max ) - BigInt(left);
      return balance.toString();
    }
  }
}