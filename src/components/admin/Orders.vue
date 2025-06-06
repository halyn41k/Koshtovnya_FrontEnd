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
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
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
                  <img
                    v-if="col.sortable"
                    :src="getSortIcon(sortState[col.key])"
                    class="w-4 h-4"
                    alt=""
                  />
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
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                <Multiselect
  v-model="order.status"
  :options="statusOptions"
  :placeholder="$t('admin.orders.selectStatus')"
  :allow-empty="false"
  :close-on-select="true"
  :show-labels="false"
  @input="updateStatus(order.id, order.status)"
  class="text-sm custom-multiselect"
/>

              </td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ order.phone_number }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ order.products.join(', ') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Порожній стани -->
    <div v-else-if="!orders.length && !searchQuery" class="py-20 text-center text-gray-500 dark:text-gray-400">
      {{ $t('admin.orders.noOrders') }}
    </div>
    <div v-else-if="searchQuery && !filteredAndSorted.length" class="py-20 text-center text-gray-500 dark:text-gray-400">
      {{ $t('admin.orders.noResults', { query: searchQuery }) }}
    </div>

    <!-- Пагінація -->
    <div v-if="orders.length" class="flex justify-center items-center gap-2 mt-6">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 dark:bg-[#112a45] dark:border-[#2b4b6e] dark:hover:bg-[#153254]"
      >&lt;</button>
      <button
        v-for="page in meta.last_page"
        :key="page"
        @click="goToPage(page)"
        :class="[
          'px-3 py-1 rounded border border-gray-300 hover:bg-gray-100',
          page === currentPage ? 'bg-[#6B1F1F] text-white' : 'bg-white dark:bg-[#112a45] dark:border-[#2b4b6e] dark:text-white'
        ]"
      >
        {{ page }}
      </button>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === meta.last_page"
        class="px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 dark:bg-[#112a45] dark:border-[#2b4b6e] dark:hover:bg-[#153254]"
      >&gt;</button>
    </div>

    <!-- Модал деталів -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
      @click.self="closeDetailsModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg dark:bg-[#1a2f4a] dark:text-white">
        <h3 class="text-xl font-semibold mb-4">{{ $t('admin.orders.details') }} #{{ orderDetails.id }}</h3>
        <p class="mb-2"><strong>Дата:</strong> {{ orderDetails.order_date }}</p>
        <p class="mb-2"><strong>Статус:</strong> {{ orderDetails.status }}</p>
        <p class="mb-2"><strong>Телефон:</strong> {{ orderDetails.phone_number }}</p>
        <p class="mb-4"><strong>Продукти:</strong> {{ orderDetails.products.join(', ') }}</p>
        <button
          @click="closeDetailsModal"
          class="mt-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
        >{{ $t('admin.orders.close') }}</button>
      </div>
    </div>
  </main>
</template>


<script>
import axios from "axios";
import Multiselect from 'vue-multiselect'

export default {
  name: "OrderList",
  components: {
    Multiselect
  },
  data() {
    return {
      statusOptions: ["В очікуванні", "Відправлено", "Доставлено", "Скасовано"],
      orders: [],
      searchQuery: "",
      sortState: {
        id: "none",
        order_date: "none",
        status: "none",
        phone_number: "none",
        products: "none"
      },
      meta: { last_page: 1 },
      currentPage: 1,
      highlightedOrderId: null,
      showDetailsModal: false,
      orderDetails: {}
    };
  },
  computed: {
    columns() {
      return [
        { key: "id", label: this.$t('admin.orders.id'), sortable: true },
        { key: "order_date", label: this.$t('admin.orders.date'), sortable: true },
        { key: "status", label: this.$t('admin.orders.status'), sortable: true },
        { key: "phone_number", label: this.$t('admin.orders.phone'), sortable: true },
        { key: "products", label: this.$t('admin.orders.products'), sortable: true }
      ];
    },
    filteredAndSorted() {
      let arr = this.orders.filter(o => {
        const q = this.searchQuery.toLowerCase();
        return (
          o.id.toString().includes(q) ||
          o.order_date.toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q) ||
          o.phone_number.includes(q)
        );
      });
      const [key, order] = Object.entries(this.sortState).find(([_, v]) => v !== "none") || [];
      if (key) {
        arr.sort((a, b) => {
          let va = a[key], vb = b[key];
          if (Array.isArray(va)) va = va.join();
          if (order === "asc") return va > vb ? 1 : va < vb ? -1 : 0;
          else return va < vb ? 1 : va > vb ? -1 : 0;
        });
      }
      return arr;
    }
  },
  mounted() {
    this.fetchOrders(1);
  },
  methods: {
    async fetchOrders(page = 1) {
      this.currentPage = page;
      const params = { page };
      const sorted = Object.entries(this.sortState).find(([_, v]) => v !== "none");
      if (sorted) {
        params.sort_by = sorted[0];
        params.sort_order = sorted[1];
      }
      try {
        const res = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/admin/orders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params
        });
        // Ensure placeholder appears for null statuses
        this.orders = res.data.data.map(o => ({ ...o, status: o.status || '' }));
        this.meta.last_page = res.data.meta.last_page;
      } catch (e) {
        console.error(e);
      }
    },
    cycleSort(col) {
      const ord = this.sortState[col];
      Object.keys(this.sortState).forEach(k => (this.sortState[k] = "none"));
      this.sortState[col] = ord === "none" ? "asc" : ord === "asc" ? "desc" : "none";
      this.fetchOrders(this.currentPage);
    },
    getSortIcon(s) {
      if (s === "asc") return require("@/assets/icons/asc.svg");
      if (s === "desc") return require("@/assets/icons/desc.svg");
      return require("@/assets/icons/none_sorted.svg");
    },
    goToPage(page) {
      if (page < 1 || page > this.meta.last_page) return;
      this.fetchOrders(page);
    },
    showOrderDetails(id) {
      axios
        .get(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/orders/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(res => {
          this.orderDetails = { ...res.data.data, status: res.data.data.status || '' };
          this.showDetailsModal = true;
        })
        .catch(console.error);
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.orderDetails = {};
    },
    updateStatus(id, status) {
      axios
        .patch(
          `https://koshtovnya.api-dev.bmax-edu.website/api/admin/orders/${id}`,
          { status },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        )
        .then(() => {
          this.highlightedOrderId = id;
          setTimeout(() => this.highlightedOrderId = null, 3000);
        })
        .catch(console.error);
    }
  }
};
</script>

<style scoped>
/* Світла тема */
.custom-multiselect .multiselect {
  background-color: white;
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 0.375rem;   /* rounded-md */
  color: #1f2937;            /* gray-800 */
  font-size: 0.875rem;       /* text-sm */
}

/* Темна тема */
.dark .custom-multiselect .multiselect {
  background-color: #112a45;
  border-color: #2b4b6e;
  color: #fff;
}

/* Dropdown */
.custom-multiselect .multiselect__content-wrapper {
  background-color: white;
  border-radius: 0 0 0.375rem 0.375rem;
}
.dark .custom-multiselect .multiselect__content-wrapper {
  background-color: #112a45;
}

/* Опції */
.custom-multiselect .multiselect__option {
  padding: 0.5rem;
  font-size: 0.875rem;
}
.dark .custom-multiselect .multiselect__option {
  color: #fff;
}
.dark .custom-multiselect .multiselect__option--highlight {
  background-color: #153254;
}

/* Обрана опція */
.custom-multiselect .multiselect__single {
  color: inherit;
}
</style>
