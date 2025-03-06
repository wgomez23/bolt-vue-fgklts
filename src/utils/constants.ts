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
    },
    satsToBitcoin(sats:number, dec = 8) {
      // 1 Bitcoin is equal to 100,000,000 satoshis
      const satoshisPerBitcoin = 100_000_000;

      // Convert satoshis to Bitcoin
      const bitcoinValue = Number(sats) / satoshisPerBitcoin;

      return bitcoinValue.toFixed(dec).replace(/\.?0+$/, '');
    }
  }
}