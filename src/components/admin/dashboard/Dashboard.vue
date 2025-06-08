<template>
  <main class="w-full p-4 space-y-6 relative dark:text-white">
    <!-- Заголовок і фільтри -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-extrabold text-gray-900 whitespace-nowrap  dark:invert">{{ $t('admin.dashboard.title') }}</h1>

      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex flex-col">
          <label class="text-sm text-gray-600 mb-1 ml-1">{{ $t('admin.dashboard.period') }}</label>
          <Multiselect
            v-model="selectedPeriod"
            :options="periodOptions"
            :reduce="opt => opt.value"
            label="label"
            class="custom-multiselect w-40"
            @input="loadData"
          />
        </div>

        <div class="flex flex-col">
          <label class="text-sm text-gray-600 mb-1 ml-1">{{ $t('admin.dashboard.customPeriod') }}</label>
          <VueDatePicker
            v-model="dateRange"
            range
            format="yyyy-MM-dd"
            :enable-time-picker="false"
            :placeholder="$t('admin.dashboard.selectPeriod')"
            @update:model-value="loadData"
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
import { ref, onMounted, watch, computed } from 'vue'
import api from '@/services/api'
import OrderChart from '@/components/admin/dashboard/OrderChart.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { uk } from 'date-fns/locale'
import Multiselect from 'vue-multiselect'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const periodOptions = computed(() => [
  { value: 'day', label: t('admin.dashboard.today') },
  { value: 'week', label: t('admin.dashboard.week') },
  { value: 'month', label: t('admin.dashboard.month') },
  { value: 'year', label: t('admin.dashboard.year') }
])


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
  { label: t('admin.dashboard.ordersCount'), value: summary.value.orders },
  { label: t('admin.dashboard.commentsCount'), value: summary.value.comments },
  { label: t('admin.dashboard.usersCount'), value: summary.value.users_count },
  { label: t('admin.dashboard.soldCount'), value: summary.value.sold_products_count }
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
    const params = getParams();
    const [summaryRes, chartRes, popRes, latestRes] = await Promise.all([
      api.getAdminStatsSummary(params),
      api.getAdminStatsOrderDynamics(params),
      api.getAdminStatsPopularProducts(params),
      api.getAdminStatsLatestOrders()
    ]);

    // 1) Summary
    const rawSummary  = summaryRes.data      ?? {};
    const sumPayload  = rawSummary.data      ?? rawSummary;
    const {
      orders_count        = 0,
      reviews_count       = 0,
      users_count         = 0,
      sold_products_count = 0,
      avg_order_value     = 0
    } = sumPayload;
    summary.value = {
      orders: orders_count,
      comments: reviews_count,
      users_count,
      sold_products_count,
      avg_order_value
    };

    // 2) Chart
    orderChart.value = chartRes.data ?? { labels: [], values: [], type: 'day' };

    // 3) Popular products
    const rawPopular = popRes.data      ?? {};
    // якщо повертають { products: [...] } або [...] — обидва варіанти
    popular.value = Array.isArray(rawPopular.products)
      ? rawPopular.products
      : Array.isArray(rawPopular)
        ? rawPopular
        : [];

    // 4) Latest orders
    const rawLatest  = latestRes.data      ?? {};
    const latPayload = rawLatest.data     ?? rawLatest;
    latest.value     = Array.isArray(latPayload) ? latPayload : [];

  } catch (e) {
    console.error('Помилка завантаження статистики:', e);
  }
};




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
