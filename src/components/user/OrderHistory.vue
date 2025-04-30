<template>
  <div class="max-w-3xl p-5 overflow-y-auto h-[90vh] font-sans">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Історія замовлень</h2>

    <!-- Loader при завантаженні -->
    <Loader v-if="loading" class="mx-auto my-10" />

    <!-- Повідомлення, якщо замовлень немає -->
    <div v-else-if="orders.length === 0" class="text-center text-lg text-gray-500 mt-8">
      Ви не розмістили жодного замовлення :(
    </div>

    <!-- Список замовлень -->
    <div v-else class="space-y-6 overflow-y-auto h-[70vh] pr-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-gray-100 p-5 rounded-2xl transform transition hover:scale-[1.02]"
      >
        <!-- header with number, date, status, amount -->
        <div class="flex justify-between items-center mb-4">
          <div>
            <span class="text-xl font-semibold text-gray-900">Замовлення №{{ order.id }}</span>
            <span class="text-sm text-gray-600 ml-2">{{ order.order_date }}</span>
          </div>
          <div class="text-lg font-medium text-gray-700">
            Статус: {{ order.status }}
          </div>
        </div>

        <div class="space-y-4 mb-4">
          <div
            v-for="(item, i) in order.items"
            :key="i"
            class="flex items-center gap-4"
          >
            <img
              :src="item.image_url"
              alt="Product Image"
              class="w-24 h-24 object-cover rounded-lg"
            />
            <div class="flex flex-col">
              <h3 v-if="!item.is_deleted" class="text-lg font-medium text-gray-800">
                {{ item.title }}
              </h3>
              <h3 v-else class="text-lg text-red-600">Товар видалено</h3>
              <p class="text-sm text-gray-600">Кількість: {{ item.quantity }}</p>
              <p class="text-sm text-gray-600">Ціна: {{ item.price }}₴</p>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-lg font-semibold text-gray-800">Всього: {{ order.amount }}₴</span>
          <button
            @click="openOrderDetails(order)"
            class="inline-flex items-center px-4 py-2 bg-[#6B1F1F] text-white rounded-xl hover:bg-[#A01212] transition"
          >
            Деталі замовлення
          </button>
        </div>
      </div>
    </div>

    <!-- Модальне вікно з деталями замовлення -->
    <OrderDetailModal
      v-if="showModal"
      :order="selectedOrder"
      @close="closeModal"
    />
  </div>
</template>

<script>
import axios from "axios";
import Loader from '../home/Loader.vue';
import OrderDetailModal from "./OrderDetailModal.vue";

export default {
  name: "OrderHistory",
  components: {
    Loader,
    OrderDetailModal,
  },
  data() {
    return {
      orders: [],
      loading: true,
      showModal: false,
      selectedOrder: null,
    };
  },
  methods: {
    async fetchOrders() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }

      try {
        const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.orders = (response.data.orders || []).map(order => ({
          id: order.id,
          order_date: order.order_date,
          status: order.status,
          amount: order.amount,
          items: (order.products || []).map(item => ({
            id: item.id,
            title: item.name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url || "default_image_path",
            is_deleted: item.is_deleted,
          })),
        }));
      } catch (error) {
        console.error("Помилка завантаження замовлень:", error);
        alert("Не вдалося завантажити ваші замовлення.");
      } finally {
        this.loading = false;
      }
    },
    openOrderDetails(order) {
      this.selectedOrder = order;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedOrder = null;
    },
  },
  mounted() {
    document.title = "Історія замовлень";
    this.fetchOrders();
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
.font-sans { font-family: 'Montserrat', sans-serif; }
</style>
