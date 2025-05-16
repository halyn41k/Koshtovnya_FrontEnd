<template>
  <main class="p-6 max-w-7xl mx-auto font-montserrat">
    <!-- Заголовок -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">Замовлення</h1>
    </div>

    <!-- Пошук -->
    <div class="mb-6">
      <div class="relative w-80">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Пошук"
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-pink-200"
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
      <div class="inline-block min-w-full border border-gray-300 rounded-md overflow-hidden">
        <table class="min-w-full bg-white divide-y divide-gray-200">
          <thead class="bg-[#F6E7E7]">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                @click="cycleSort(col.key)"
                class="px-4 py-2 text-sm font-medium text-gray-700 text-left cursor-pointer select-none"
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
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="order in filteredAndSorted"
              :key="order.id"
              :class="order.id === highlightedOrderId ? 'bg-green-50' : ''"
            >
              <td class="px-4 py-2 text-sm text-gray-800">{{ order.id }}</td>
              <td class="px-4 py-2 text-sm text-gray-800">{{ order.order_date }}</td>
              <td class="px-4 py-2 text-sm text-gray-800">
  <Multiselect
    v-model="order.status"
    :options="statusOptions"
    placeholder="Оберіть статус"
    :allow-empty="false"
    :close-on-select="true"
    :show-labels="false"
    @input="updateStatus(order.id, order.status)"
    class="text-sm"
  />
</td>

              <td class="px-4 py-2 text-sm text-gray-800">{{ order.phone_number }}</td>
              <td class="px-4 py-2 text-sm text-gray-800">{{ order.products.join(', ') }}</td>
              
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Порожній стани -->
    <div v-else-if="!orders.length && !searchQuery" class="py-20 text-center text-gray-500">
      Поки що не було додано жодного замовлення.
    </div>
    <div v-else-if="searchQuery && !filteredAndSorted.length" class="py-20 text-center text-gray-500">
      За запитом «<strong>{{ searchQuery }}</strong>» нічого не знайдено.
    </div>

    <!-- Пагінація -->
    <div v-if="orders.length" class="flex justify-center items-center gap-2 mt-6">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
      >&lt;</button>
      <button
        v-for="page in meta.last_page"
        :key="page"
        @click="goToPage(page)"
        :class="['px-3 py-1 rounded border border-gray-300 hover:bg-gray-100', page === currentPage ? 'bg-[#6B1F1F] text-white' : 'bg-white']"
      >
        {{ page }}
      </button>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === meta.last_page"
        class="px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
      >&gt;</button>
    </div>

    <!-- Модал деталів -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
      @click.self="closeDetailsModal"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h3 class="text-xl font-semibold mb-4">Деталі замовлення #{{ orderDetails.id }}</h3>
        <p class="mb-2"><strong>Дата:</strong> {{ orderDetails.order_date }}</p>
        <p class="mb-2"><strong>Статус:</strong> {{ orderDetails.status }}</p>
        <p class="mb-2"><strong>Телефон:</strong> {{ orderDetails.phone_number }}</p>
        <p class="mb-4"><strong>Продукти:</strong> {{ orderDetails.products.join(', ') }}</p>
        <button
          @click="closeDetailsModal"
          class="mt-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >Закрити</button>
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
        { key: "id", label: "ID", sortable: true },
        { key: "order_date", label: "Дата", sortable: true },
        { key: "status", label: "Статус", sortable: true },
        { key: "phone_number", label: "Телефон", sortable: true },
        { key: "products", label: "Продукти", sortable: true }
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

<style>
.custom-multiselect .multiselect__option--highlight::after {
  display: none !important;
}

.multiselect__option--highlight {
  background: #F3F4F6 !important;
  /* Ніжно-рожевий */
  color: #6B1F1F !important;
  /* Головний колір тексту */
}

.multiselect__option--selected {
  font-weight: 600 !important;
  /* semibold */
}

.multiselect__option--selected::after {
  content: 'Обрано' !important;
  color: #9CA3AF;
  /* світло-сірий */
  font-size: 0.75rem;
  /* text-sm */
  font-weight: 500;
  float: right;
  margin-right: 1rem;
}

.multiselect__option--highlight::after {
  display: none !important;
}

</style>