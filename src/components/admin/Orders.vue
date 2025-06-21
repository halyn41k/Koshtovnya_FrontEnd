<template>
  <main class="w-full p-4 space-y-6 relative dark:bg-[#0c1a2b] dark:text-white">
    <!-- Заголовок -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">{{ $t('admin.orders.title') }}</h1>
    </div>

    <!-- Пошук -->
    <div class="mb-6">
      <div class="relative w-80">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('admin.orders.search')"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-pink-200 dark:bg-[#112a45] dark:border-[#2b4b6e] dark:text-white"
        />
        <img
          src="@/assets/icons/search.svg"
          alt="Search"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none dark:invert"
        />
      </div>
    </div>

    <!-- Таблиця замовлень -->
    <div v-if="filteredAndSorted.length" class="overflow-x-auto">
      <div class="inline-block min-w-full border border-gray-300 rounded-md overflow-hidden dark:border-[#2b4b6e]">
        <table class="min-w-full bg-white divide-y divide-gray-200 dark:bg-[#102336] dark:divide-[#2b4b6e]">
          <thead class="bg-[#F6E7E7] dark:bg-[#1b3352]">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                @click="cycleSort(col.key)"
                class="px-4 py-2 text-sm font-medium text-gray-700 text-left cursor-pointer select-none dark:text-white"
              >
                <div class="inline-flex items-center gap-1">
                  {{ col.label }}
                  <img v-if="col.sortable" :src="getSortIcon(sortState[col.key])" class="w-4 h-4" alt=""/>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-[#0f1e31] dark:divide-[#2b4b6e]">
            <tr
              v-for="order in filteredAndSorted"
              :key="order.id"
              :class="order.id === highlightedOrderId ? 'bg-green-50 dark:bg-green-900' : ''"
            >
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ order.id }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ order.order_date }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200 w-48">
                <Multiselect
                  v-model="order.selectedOption"
                  :options="statusOptions"
                  track-by="value"
                  label="label"
                  @input="onStatusChange(order)"
                  @select="onStatusChange(order)"
                />
              </td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ order.phone_number }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ order.products.join(', ') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Порожні стани -->
    <div v-else-if="!orders.length && !searchQuery" class="py-20 text-center text-gray-500 dark:text-gray-400">
      {{ $t('admin.orders.noOrders') }}
    </div>
    <div v-else-if="searchQuery && !filteredAndSorted.length" class="py-20 text-center text-gray-500 dark:text-gray-400">
      {{ $t('admin.orders.noResults', { query: searchQuery }) }}
    </div>

    <!-- Пагінація -->
    <div v-if="orders.length" class="flex justify-center items-center gap-2 mt-6">
      <button @click="fetchOrders(currentPage - 1)" :disabled="currentPage === 1" class="px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 dark:bg-[#112a45] dark:border-[#2b4b6e] dark:hover:bg-[#153254]">&lt;</button>
      <button
        v-for="page in meta.last_page"
        :key="page"
        @click="fetchOrders(page)"
        :class="[ 'px-3 py-1 rounded border border-gray-300 hover:bg-gray-100', page === currentPage ? 'bg-[#6B1F1F] text-white' : 'bg-white dark:bg-[#112a45] dark:border-[#2b4b6e] dark:text-white' ]"
      >
        {{ page }}
      </button>
      <button @click="fetchOrders(currentPage + 1)" :disabled="currentPage === meta.last_page" class="px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 dark:bg-[#112a45] dark:border-[#2b4b6e] dark:hover:bg-[#153254]">&gt;</button>
    </div>

    <!-- Модал деталів -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50" @click.self="closeDetailsModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg dark:bg-[#1a2f4a] dark:text-white">
        <h3 class="text-xl font-semibold mb-4">{{ $t('admin.orders.details') }} #{{ orderDetails.id }}</h3>
        <p class="mb-2"><strong>Дата:</strong> {{ orderDetails.order_date }}</p>
        <p class="mb-2"><strong>Статус:</strong> {{ orderDetails.statusLabel }}</p>
        <p class="mb-2"><strong>Телефон:</strong> {{ orderDetails.phone_number }}</p>
        <p class="mb-4"><strong>Продукти:</strong> {{ orderDetails.products.join(', ') }}</p>
        <button @click="closeDetailsModal" class="mt-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-[#1a2f4a] dark:text-white dark:hover:bg-[#153254]">{{ $t('admin.orders.close') }}</button>
      </div>
    </div>
  </main>
</template>

<script>
import 'vue-multiselect/dist/vue-multiselect.min.css'
import Multiselect from 'vue-multiselect'
import api from '@/services/api'

// Статичний перелік статусів, де:
// - `value`: технічне значення для бекенду
// - `labelKey`: ключ для i18n
const STATIC_STATUS_LIST = [
  { value: 'В очікуванні', labelKey: 'admin.orders.statusOrder.pending' },
  { value: 'Відправлено',   labelKey: 'admin.orders.statusOrder.sent' },
  { value: 'Доставлено',     labelKey: 'admin.orders.statusOrder.delivered' },
  { value: 'Скасовано',      labelKey: 'admin.orders.statusOrder.cancelled' }
]

export default {
  name: 'OrderList',
  components: { Multiselect },
  data() {
    return {
      orders: [],
      searchQuery: '',
      sortState: {
        id: 'none',
        order_date: 'none',
        statusInternal: 'none',
        phone_number: 'none',
        products: 'none'
      },
      meta: { last_page: 1 },
      currentPage: 1,
      highlightedOrderId: null,
      showDetailsModal: false,
      orderDetails: {},
      rawStatusList: [] // [{ value: 'pending', labelKey: 'orders.status.pending' }, ...]
    }
  },
  computed: {
    statusOptions() {
      return this.rawStatusList.map(raw => ({
        value: raw.value,
        label: this.$t(raw.labelKey)
      }))
    },
    columns() {
      return [
        { key: 'id', label: this.$t('admin.orders.id'), sortable: true },
        { key: 'order_date', label: this.$t('admin.orders.date'), sortable: true },
        { key: 'statusInternal', label: this.$t('admin.orders.status'), sortable: true },
        { key: 'phone_number', label: this.$t('admin.orders.phone'), sortable: true },
        { key: 'products', label: this.$t('admin.orders.products'), sortable: true }
      ]
    },
    filteredAndSorted() {
      let arr = this.orders.filter(o => {
        const q = this.searchQuery.toLowerCase()
        return (
          o.id.toString().includes(q) ||
          (o.order_date || '').toLowerCase().includes(q) ||
          (o.statusInternal || '').toLowerCase().includes(q) ||
          (o.phone_number || '').includes(q)
        )
      })
      const [key, order] = Object.entries(this.sortState).find(([, v]) => v !== 'none') || []
      if (key) {
        arr.sort((a, b) => {
          let va = a[key], vb = b[key]
          if (Array.isArray(va)) va = va.join()
          if (Array.isArray(vb)) vb = vb.join()
          return order === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
        })
      }
      return arr
    }
  },
  mounted() {
    this.initStatusList().then(() => this.fetchOrders())
  },
  watch: {
    '$i18n.locale'(newLocale) {
      // Оновлення label при зміні мови
      this.orders = this.orders.map(o => {
        const match = this.rawStatusList.find(s => s.value === o.statusInternal)
        return {
          ...o,
          selectedOption: match
            ? { value: match.value, label: this.$t(match.labelKey) }
            : { value: o.statusInternal, label: o.statusInternal }
        }
      })
    }
  },
  methods: {
    async initStatusList() {
      try {
        // Можна отримати з API, якщо потрібно:
        // const res = await api.getAdminOrderStatuses()
        // this.rawStatusList = res.data
        this.rawStatusList = STATIC_STATUS_LIST.slice()
      } catch (e) {
        console.warn('Не вдалося отримати список статусів, використовуємо static:', e)
        this.rawStatusList = STATIC_STATUS_LIST.slice()
      }
    },
    cleanRawStatus(raw) {
      if (!raw) return ''
      if (raw.startsWith('orders.status.')) {
        const parts = raw.split('.')
        return parts[parts.length - 1]
      }
      return raw
    },
    async fetchOrders(page = 1) {
      console.log('>>> fetchOrders, page →', page)
      try {
        const res = await api.getAdminOrders(page)
        console.log('<<< API meta →', res.meta)
        this.orders = res.data.map(o => {
          const cleaned = this.cleanRawStatus(o.status)
          const match = this.rawStatusList.find(s => s.value === cleaned)
          const selectedOption = match
            ? { value: match.value, label: this.$t(match.labelKey) }
            : { value: cleaned, label: cleaned }

          return {
            ...o,
            _rawStatus: cleaned,
            statusInternal: cleaned,
            selectedOption
          }
        })
        this.meta = { ...res.meta }
        this.currentPage = res.meta.current_page
      } catch (e) {
        console.error('Помилка завантаження замовлень:', e)
      }
    },
    cycleSort(col) {
      const ord = this.sortState[col]
      Object.keys(this.sortState).forEach(k => (this.sortState[k] = 'none'))
      this.sortState[col] = ord === 'none' ? 'asc' : ord === 'asc' ? 'desc' : 'none'
    },
    getSortIcon(s) {
      if (s === 'asc') return require('@/assets/icons/asc.svg')
      if (s === 'desc') return require('@/assets/icons/desc.svg')
      return require('@/assets/icons/none_sorted.svg')
    },
    goToPage(page) {
      if (page < 1 || page > this.meta.last_page) return
      this.fetchOrders(page)
    },
    async onStatusChange(order) {
      const prevRaw = order._rawStatus
      const sel = order.selectedOption
      const newRaw = sel && sel.value
      if (!this.rawStatusList.find(s => s.value === newRaw)) {
        console.error('Спроба надіслати невідомий статус:', sel)
        order.selectedOption = { value: prevRaw, label: this.$t(`orders.status.${prevRaw}`) }
        return
      }
      order.statusInternal = newRaw
      try {
        const payload = { status: newRaw }
        console.log('Надсилаємо PATCH status:', payload)
        await api.updateAdminOrder(order.id, payload)
        order._rawStatus = newRaw
        this.highlightedOrderId = order.id
        setTimeout(() => (this.highlightedOrderId = null), 3000)
      } catch (e) {
        console.error('Помилка оновлення статусу:', e)
        if (e.response?.data?.errors?.status) {
          console.warn('Validation errors for status:', e.response.data.errors.status)
        }
        order.statusInternal = prevRaw
        order.selectedOption = {
          value: prevRaw,
          label: this.$t(`orders.status.${prevRaw}`)
        }
      }
    },
    async showOrderDetails(id) {
      try {
        const res = await api.getAdminOrder(id)
        const raw = res.data.status
        const cleaned = this.cleanRawStatus(raw)
        this.orderDetails = {
          ...res.data,
          statusInternal: cleaned,
          statusLabel: this.$t(`orders.status.${cleaned}`)
        }
        this.showDetailsModal = true
      } catch (e) {
        console.error('Не вдалося отримати деталі замовлення:', e)
      }
    },
    closeDetailsModal() {
      this.showDetailsModal = false
      this.orderDetails = {}
    }
  }
}
</script>


<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.5s ease-out both; }
.custom-multiselect .multiselect__option--highlight::after { display: none !important; }
.multiselect__option--highlight { background: #F3F4F6 !important; color: #6B1F1F !important; }
</style>
