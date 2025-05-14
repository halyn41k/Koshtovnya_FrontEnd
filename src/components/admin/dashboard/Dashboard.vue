<template>
  <main class="p-6 font-montserrat space-y-10">

<!-- Заголовок і фільтри -->
<div class="flex flex-wrap items-center justify-between gap-4 mb-6">
  <h1 class="text-2xl font-extrabold text-gray-900 whitespace-nowrap">Статистика</h1>

  <div class="flex items-center gap-3 flex-wrap">
    <div class="flex flex-col">
      <label class="text-sm text-gray-600 mb-1 ml-1">Період</label>
      <select
        v-model="selectedPeriod"
        @change="loadData"
        class="border border-gray-300 rounded px-3 py-2 focus:ring-[#6B1F1F] focus:outline-none"
      >
        <option value="day">За сьогодні</option>
        <option value="week">За тиждень</option>
        <option value="month">За місяць</option>
        <option value="year">За рік</option>
      </select>
    </div>

    <div class="flex flex-col">
      <label class="text-sm text-gray-600 mb-1 ml-1">Період вручну</label>
      <VueDatePicker
  v-model="dateRange"
  range
  format="yyyy-MM-dd"
  :enable-time-picker="false"
  placeholder="Оберіть період"
  @update:model-value="loadData"
  input-class-name="custom-datepicker-input"
  :locale="uk"
/>

    </div>
  </div>
</div>


    <!-- Картки статистики -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        v-for="(card, i) in cards"
        :key="card.label"
        class="flex flex-col justify-center items-center bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-5 text-center h-[120px] animate-fade-in-up"
        :style="{ animationDelay: `${i * 80}ms` }"
      >
        <p class="text-sm text-gray-500 mb-1">{{ card.label }}</p>
        <p class="text-3xl font-black text-gray-800">{{ card.value }}</p>
      </div>
    </section>

    <!-- Графік замовлень -->
    <section class="bg-white p-6 rounded-lg shadow-sm">
      <h2 class="text-xl font-semibold mb-4">Динаміка замовлень</h2>
      <OrderChart :labels="orderChart.labels" :values="orderChart.values" :type="orderChart.type" />
    </section>

    <!-- Популярні товари -->
    <section>
      <h2 class="text-xl font-semibold mb-4 mt-6">🔥 Популярні товари</h2>
      <div v-if="popular.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div
          v-for="(item, index) in popular"
          :key="item.id"
          class="flex gap-4 border border-gray-300 rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-transform duration-300 hover:scale-[1.01] animate-fade-in-up"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <img
            :src="item.image_url"
            :alt="item.name"
            class="w-20 h-20 object-cover rounded"
          />
          <div class="flex flex-col justify-between">
            <div>
              <p class="font-semibold text-base leading-5">{{ item.name }}</p>
              <p class="text-sm text-gray-500">Виробник: {{ item.bead_producer_name }}</p>
              <p class="text-sm text-gray-500">Ціна: {{ item.price }} грн</p>
            </div>
            <div class="text-sm text-gray-600 mt-2 flex gap-3">
              <span>⭐ {{ item.rating ?? 0 }}</span>
              <span>💬 {{ item.review_count }} відгуків</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Останні замовлення -->
    <section>
      <h2 class="text-xl font-semibold mb-4 mt-8">💸 Останні замовлення</h2>
      <ul v-if="latest.length" class="space-y-4">
        <li
          v-for="(order, i) in latest"
          :key="order.id"
          class="border border-gray-300 rounded-md p-4 bg-white shadow-sm transition hover:shadow-md animate-fade-in-up"
          :style="{ animationDelay: `${i * 100}ms` }"
        >
          <p class="font-semibold text-base mb-2">#{{ order.id }}</p>
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>📞 {{ order.phone_number }}</span>
            <span>{{ order.order_date }}</span>
          </div>
          <p class="text-sm text-gray-500 italic mb-1">
            🧾 {{ order.products.join(', ') }}
          </p>
          <span
            class="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
            :class="{
              'bg-yellow-100 text-yellow-800': order.status === 'В очікуванні',
              'bg-green-100 text-green-800': order.status === 'Успішно',
              'bg-red-100 text-red-800': order.status === 'Скасовано'
            }"
          >
            {{ order.status }}
          </span>
        </li>
      </ul>
    </section>
  </main>
</template>


<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import OrderChart from '@/components/admin/dashboard/OrderChart.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { uk } from 'date-fns/locale'


const selectedPeriod = ref('month')
const dateRange = ref(null)

const summary = ref({
  orders: 0,
  views: 0,
  comments: 0,
  avg_order_value: 0,
  users_count: 0,
  sold_products_count: 0
})
const orderChart = ref({ labels: [], values: [], type: 'day' })
const latest = ref([])
const popular = ref([])

const cards = computed(() => [
  { label: 'Кількість замовлень', value: summary.value.orders },
  { label: 'Кількість коментарів', value: summary.value.comments },
  { label: 'Зареєстрованих користувачів', value: summary.value.users_count },
  { label: 'Продано товарів', value: summary.value.sold_products_count },
])

const getParams = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    return {
      start_date: dateRange.value[0],
      end_date: dateRange.value[1]
    }
  } else {
    return {
      period: selectedPeriod.value
    }
  }
}

const loadData = async () => {
  try {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    const params = getParams()

    const [summaryRes, chartRes, popRes, latestRes] = await Promise.all([
      axios.get('https://koshtovnya.api-dev.bmax-edu.website/api/admin/stats/summary', { params, headers }),
      axios.get('https://koshtovnya.api-dev.bmax-edu.website/api/admin/stats/order-dynamics', { params, headers }),
      axios.get('https://koshtovnya.api-dev.bmax-edu.website/api/admin/stats/popular-products', { params, headers }),
      axios.get('https://koshtovnya.api-dev.bmax-edu.website/api/admin/stats/latest-orders', { headers })
    ])

    summary.value = {
      orders: summaryRes.data.orders_count || 0,
      comments: summaryRes.data.reviews_count || 0,
      users_count: summaryRes.data.users_count || 0,
      sold_products_count: summaryRes.data.sold_products_count || 0,
      avg_order_value: summaryRes.data.avg_order_value || 0
    }

    orderChart.value = chartRes.data
    popular.value = popRes.data.products || []
    latest.value = latestRes.data.data || []
  } catch (e) {
    console.error('Помилка завантаження статистики:', e)
  }
}

watch(dateRange, loadData)
onMounted(loadData)
</script>

<style scoped>
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}



</style>
