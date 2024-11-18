<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  LogarithmicScale,
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'
import { ref } from 'vue'

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  LogarithmicScale,
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
)

const chartData = ref({
  labels: [
    '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', 
    '2018', '2019', '2020', '2021', '2022', '2023', '2024'
  ],
  datasets: [
    {
      label: 'Hash Power (EH/s)',
      data: [
        0.000001, 0.0001, 0.01, 0.1, 0.3, 0.5, 2, 10,
        45, 80, 120, 180, 250, 400, 741.75
      ],
      borderColor: '#F7931A',
      tension: 0.4,
      yAxisID: 'y1'
    },
    {
      label: '$NAT - Bits Field (Decimal)',
      data: [
        486604799, 436929919, 424491007, 419430400, 409544448, 
        403570176, 402653184, 398458880, 392826880, 389885952,
        387940352, 386977792, 386453504, 386256896, 386057444
      ],
      borderColor: '#00FF94',
      tension: 0.4,
      yAxisID: 'y'
    }
  ]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      min: 380000000,
      max: 490000000,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        callback: function(value) {
          return (value / 1000000).toFixed(1) + 'M';
        }
      },
      title: {
        display: true,
        text: '$NAT - Bits Field (Decimal)',
        color: 'rgba(255, 255, 255, 0.7)'
      }
    },
    y1: {
      type: 'logarithmic',
      display: true,
      position: 'right',
      min: 0.0000001,
      grid: {
        drawOnChartArea: false
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        callback: function(value) {
          if (value <= 0.001) return value.toExponential(1);
          if (value < 1000) return value.toFixed(1);
          return (value / 1000).toFixed(0) + 'k';
        }
      },
      title: {
        display: true,
        text: 'Hash Power (EH/s)',
        color: 'rgba(255, 255, 255, 0.7)'
      }
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    }
  },
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.dataset.yAxisID === 'y1') {
            if (context.parsed.y <= 0.001) {
              label += context.parsed.y.toExponential(3);
            } else if (context.parsed.y < 1000) {
              label += context.parsed.y.toFixed(2);
            } else {
              label += (context.parsed.y / 1000).toFixed(1) + 'k';
            }
          } else {
            label += context.parsed.y.toLocaleString();
          }
          return label;
        }
      }
    }
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="h-[400px]">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <p class="text-center text-gray-400 text-sm italic">
      The inverse relationship between hash rate and the decimal value of the "bits" field remains clear. Chart in logarithmic scale.
    </p>
  </div>
</template>