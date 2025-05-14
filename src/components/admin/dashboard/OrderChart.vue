<template>
  <div>
    <canvas ref="chart"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import {
  Chart, LineElement, PointElement, LineController,
  CategoryScale, LinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js'

Chart.register(
  LineElement, PointElement, LineController,
  CategoryScale, LinearScale, Title, Tooltip, Legend, Filler
)
// eslint-disable-next-line no-undef
const props = defineProps({
  labels: Array,
  values: Array,
  type: String
})

const chart = ref(null)
let instance = null

const createChart = () => {
  if (instance) instance.destroy()

  instance = new Chart(chart.value, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [{
        label: '',
        data: props.values,
        fill: true,
        tension: 0.35,
        backgroundColor: 'rgba(107, 31, 31, 0.15)',
        borderColor: '#6B1F1F',
        borderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#6B1F1F'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#000',
          bodyColor: '#333',
          borderColor: '#ccc',
          borderWidth: 1,
          titleFont: { family: 'Montserrat', weight: 'bold' },
          bodyFont: { family: 'Montserrat' },
          callbacks: {
            title: items => `📅 ${items[0].label}`,
            label: item => `🔢 Кількість: ${item.formattedValue}`
          }
        }
      },
      layout: {
        padding: { left: 0, right: 0, top: 10, bottom: 10 }
      },
      scales: {
        x: {
          title: {
            display: true,
            text:
              props.type === 'hour' ? 'Години' :
              props.type === 'day' ? 'Дні' :
              'Місяці',
            font: { family: 'Montserrat', size: 14, weight: '600' }
          },
          ticks: {
            font: { family: 'Montserrat' },
            maxRotation: 50,
            minRotation: 0
          },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          suggestedMax: props.values.length ? Math.max(...props.values) + 1 : 10,
          title: {
            display: true,
            text: 'Кількість',
            font: { family: 'Montserrat', size: 14, weight: '600' }
          },
          ticks: {
            font: { family: 'Montserrat' },
            precision: 0,
            stepSize: 1
          },
          grid: {
            color: '#eee'
          }
        }
      }
    }
  })
}

watch(
  () => [props.labels, props.values],
  () => createChart(),
  { deep: true }
)

onMounted(createChart)
</script>

<style scoped>
canvas {
  max-height: 340px;
  width: 100%;
}

@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
</style>
