<template>
  <main class="w-full p-4 space-y-6 relative dark:text-white">
    <!-- Заголовок і фільтри -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-extrabold text-gray-900 whitespace-nowrap dark:invert">
        {{ $t('admin.dashboard.title') }}
      </h1>

      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 mb-1 ml-1">
            {{ $t('admin.dashboard.period') }}
          </label>
          <Multiselect
            v-model="selectedPeriod"
            :options="periodOptions"
            track-by="value"
            label="label"
            :reduce="opt => opt.value"
            class="custom-multiselect w-40"
            @input="onPeriodChange"
            placeholder=" " 
            :allow-empty="false"
          />
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 mb-1 ml-1">
            {{ $t('admin.dashboard.customPeriod') }}
          </label>
          <VueDatePicker
            v-model="dateRange"
            range
            format="yyyy-MM-dd"
            :enable-time-picker="false"
            :placeholder="$t('admin.dashboard.selectPeriod')"
            @update:model-value="onDateRangeChange"
            input-class-name="custom-datepicker-input"
            locale="uk"
          />
        </div>
      </div>
    </div>

    <!-- Картки статистики -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 ">
      <div
        v-for="(card, i) in cards"
        :key="card.label"
class="flex flex-col justify-center items-center bg-white dark:bg-[#1f2a42] border border-gray-200 dark:border-[#303b59] rounded-lg shadow-sm px-6 py-5 text-center h-[120px] animate-fade-in-up"        :style="{ animationDelay: `${i * 80}ms` }"
      >
        <p class="text-sm text-gray-500 dark:text-gray-300 mb-1">{{ card.label }}</p>
        <p class="text-3xl font-black text-gray-800 dark:text-white">{{ card.value }}</p>
      </div>
    </section>

    <!-- Графік замовлень -->
    <section class="bg-white dark:bg-[#1f2a42]  p-6 rounded-lg shadow-sm">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">{{ $t('admin.dashboard.orderDynamics') }}</h2>
      <OrderChart :labels="orderChart.labels" :values="orderChart.values" :type="orderChart.type" />
    </section>

    <!-- Популярні товари -->
    <section>
      <h2 class="text-xl font-semibold mb-4 mt-6">🔥 {{ $t('admin.dashboard.popular') }}</h2>
      <div v-if="popular.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div
          v-for="(item, index) in popular"
          :key="item.id"
          class="flex gap-4 border border-gray-300  rounded-md p-4 bg-white dark:bg-[#1f2a42] shadow-sm hover:shadow-md transition-transform duration-300 hover:scale-[1.01] animate-fade-in-up"
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
      <h2 class="text-xl font-semibold mb-4 mt-8">💸 {{ $t('admin.dashboard.latest') }}</h2>
      <ul v-if="latest.length" class="space-y-4">
        <li
          v-for="(order, i) in latest"
          :key="order.id"
          class="dark:bg-[#1f2a42] border border-gray-300 rounded-md p-4 bg-white shadow-sm transition hover:shadow-md animate-fade-in-up"
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
import { ref, onMounted, watch, computed, toRaw } from 'vue'
import api from '@/services/api'
import OrderChart from '@/components/admin/dashboard/OrderChart.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { uk } from 'date-fns/locale'
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear
} from 'date-fns'
import Multiselect from 'vue-multiselect'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Опції для вибору періоду
const periodOptions = computed(() => [
  { value: 'day', label: t('admin.dashboard.today') },
  { value: 'week', label: t('admin.dashboard.week') },
  { value: 'month', label: t('admin.dashboard.month') },
  { value: 'year', label: t('admin.dashboard.year') }
])

// Вибір періоду або кастомного діапазону дат
const selectedPeriod = ref('month')
const dateRange = ref(null) // [Date, Date] або null

// Стан для статистики
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

// Стан для звіту про прибуток
const incomeRecords = ref([])
const incomeSummary = ref({
  total_income: 0,
  total_expenses: 0,
  total_net_income: 0
})

const cards = computed(() => [
  { label: t('admin.dashboard.ordersCount'), value: summary.value.orders },
  { label: t('admin.dashboard.commentsCount'), value: summary.value.comments },
  { label: t('admin.dashboard.usersCount'), value: summary.value.users_count },
  { label: t('admin.dashboard.soldCount'), value: summary.value.sold_products_count }
])

// Допоміжна: отримати примітивне значення period
const getPeriodValue = () => {
  const p = selectedPeriod.value
  // Якщо Vue Proxy-об’єкт, можливо має поле .value
  if (p && typeof p === 'object') {
    // якщо об’єкт виду { value: 'week', label: 'Week' }
    if ('value' in p && typeof p.value === 'string') {
      return p.value
    }
    // інакше, спробуємо raw:
    try {
      const raw = toRaw(p)
      if (raw && typeof raw.value === 'string') {
        return raw.value
      }
    } catch {
        console.error('Помилка ...')

    }
    console.warn('selectedPeriod має нетипове значення:', p)
    return null
  }
  // простий рядок або null
  return p
}

// Формуємо параметри: або { start_date, end_date }, або { period }
const getParams = () => {
  if (Array.isArray(dateRange.value) && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    if (start && end) {
      const startStr = start instanceof Date
        ? format(start, 'yyyy-MM-dd')
        : String(start)
      const endStr = end instanceof Date
        ? format(end, 'yyyy-MM-dd')
        : String(end)
      return { start_date: startStr, end_date: endStr }
    }
  }
  const periodVal = getPeriodValue()
  if (periodVal) {
    return { period: periodVal }
  }
  return null
}

// Обчислити ручний діапазон для даного period
const computeDateRangeForPeriod = (period) => {
  const now = new Date()
  let start, end
  switch (period) {
    case 'day':
      start = startOfDay(now)
      end = endOfDay(now)
      break
    case 'week':
      start = startOfWeek(now, { weekStartsOn: 1 })
      end = endOfWeek(now, { weekStartsOn: 1 })
      break
    case 'month':
      start = startOfMonth(now)
      end = endOfMonth(now)
      break
    case 'year':
      start = startOfYear(now)
      end = endOfYear(now)
      break
    default:
      return null
  }
  return {
    start_date: format(start, 'yyyy-MM-dd'),
    end_date: format(end, 'yyyy-MM-dd')
  }
}

const loadData = async () => {
  try {
    const params = getParams()
    console.log('loadData params:', params)
    if (!params) {
      console.warn('Немає валідного періоду або діапазону дат для завантаження.')
      return
    }

    // Основні запити
    const [summaryRes, chartRes, popRes, latestRes] = await Promise.all([
      api.getAdminStatsSummary(params),
      api.getAdminStatsOrderDynamics(params),
      api.getAdminStatsPopularProducts(params),
      api.getAdminStatsLatestOrders()
    ])

    // 1) Summary
    const summaryData = summaryRes || {}
    summary.value = {
      orders: summaryData.orders_count || 0,
      comments: summaryData.reviews_count || 0,
      users_count: summaryData.users_count || 0,
      sold_products_count: summaryData.sold_products_count || 0,
      avg_order_value: summaryData.avg_order_value || 0
    }

    // 2) Chart
    orderChart.value = chartRes || { labels: [], values: [], type: 'day' }

    // 3) Popular products
    popular.value = Array.isArray(popRes?.products) ? popRes.products : []

    // 4) Latest orders
    latest.value = Array.isArray(latestRes?.data) ? latestRes.data : []

    // 5) Income: спочатку пробуємо з тими ж params
    if (api.getAdminStatsIncome) {
      try {
        console.log('Запит income з params:', params)
        const incomeRes = await api.getAdminStatsIncome(params)
        incomeRecords.value = Array.isArray(incomeRes.data) ? incomeRes.data : []
        const s = incomeRes.summary || {}
        incomeSummary.value = {
          total_income: s.total_income || 0,
          total_expenses: s.total_expenses || 0,
          total_net_income: s.total_net_income || 0
        }
      } catch (errIncome) {
        const resp = errIncome.response?.data
        const isInvalidPeriod = resp?.errors?.period
        console.warn('Income request помилка:', resp)
        if (isInvalidPeriod && params.period) {
          const fallback = computeDateRangeForPeriod(params.period)
          if (fallback) {
            try {
              console.log('Фолбек income: використовую dateRange', fallback)
              const incomeRes2 = await api.getAdminStatsIncome(fallback)
              incomeRecords.value = Array.isArray(incomeRes2.data) ? incomeRes2.data : []
              const s2 = incomeRes2.summary || {}
              incomeSummary.value = {
                total_income: s2.total_income || 0,
                total_expenses: s2.total_expenses || 0,
                total_net_income: s2.total_net_income || 0
              }
            } catch (err2) {
              console.error('Навіть із фолбеком неможливо отримати income:', err2)
            }
          }
        } else {
          console.error('Помилка отримання income:', errIncome)
        }
      }
    }

  } catch (e) {
    console.error('Помилка завантаження статистики:', e)
    const resp = e.response?.data
    if (resp?.errors?.period) {
      console.error('Невалідний період:', resp.errors.period)
      // тут можна показати користувачу повідомлення
    }
  }
}

watch(selectedPeriod, (newPeriod) => {
  // Впевнитися, що selectedPeriod тепер рядок або null
  const val = getPeriodValue()
  console.log('selectedPeriod змінився, значення:', val)
  if (val) {
    if (dateRange.value) {
      dateRange.value = null
    }
    loadData()
  }
})

watch(dateRange, (newRange) => {
  if (Array.isArray(newRange) && newRange.length === 2) {
    const [start, end] = newRange
    if (start && end) {
      selectedPeriod.value = null
      loadData()
      return
    }
  }
  if (newRange == null) {
    selectedPeriod.value = 'month'
    loadData()
  }
})

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

.custom-multiselect .multiselect__option--highlight::after {
  display: none !important;
}

.multiselect__option--highlight {
  background: #F3F4F6 !important;
  color: #6B1F1F !important;
}
.multiselect__option--selected {
  font-weight: 600 !important;
}
.multiselect__option--selected::after {
  content: 'Обрано' !important;
  color: #9CA3AF;
  font-size: 0.75rem;
  font-weight: 500;
  float: right;
  margin-right: 1rem;
}



</style>
