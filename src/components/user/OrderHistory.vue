<template>
  <div class="max-w-3xl p-4 sm:p-6 overflow-y-auto h-[90vh] font-sans">
    <h2 class="text-2xl font-bold text-gray-800 mb-5">
      {{ $t('user.orderHistory') }}
    </h2>

    <Loader v-if="loading" class="mx-auto my-16" />

    <div v-else-if="orders.length === 0" class="text-center text-lg text-gray-500 mt-10">
      {{ $t('user.noOrders') }}
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="relative bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col gap-4"
      >
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div class="flex items-center gap-2">
            <span class="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {{ $t('user.orderNumber') }} №{{ order.id }}
            </span>
            <span class="text-sm text-gray-600 whitespace-nowrap">{{ order.order_date }}</span>
          </div>
          <span class="text-sm sm:text-base font-medium text-gray-700 whitespace-nowrap">
            {{ $t('user.status') }}: {{ order.status }}
          </span>
        </div>

        <div class="space-y-4">
          <div
            v-for="(item, i) in order.items"
            :key="i"
            class="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <img
              :src="item.image_url"
              alt="Product Image"
              class="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg flex-shrink-0"
            />
            <div class="flex-1 flex flex-col gap-1">
              <h3 v-if="!item.is_deleted" class="text-base sm:text-lg font-medium text-gray-800 truncate">
                {{ item.title }}
              </h3>
              <h3 v-else class="text-base sm:text-lg text-red-600 dark:text-gray-100">
                {{ $t('user.productDeleted') }}
              </h3>
              <p class="text-sm text-gray-600 whitespace-nowrap">
                {{ $t('user.quantity') }}: {{ item.quantity }}
              </p>
              <p class="text-sm text-gray-600 whitespace-nowrap">
                {{ $t('user.price') }}: {{ formatCurrencyIntl(item.price, item.currency) }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span class="text-lg font-semibold text-gray-800 whitespace-nowrap">
            {{ $t('user.total') }}: {{ formatCurrencyIntl(order.amount, order.currency) }}
          </span>
          <div class="flex gap-2">
            <button
              @click="openOrderDetails(order)"
              class="inline-flex items-center px-4 py-2 bg-[#6B1F1F] text-white text-sm font-medium rounded-lg hover:bg-[#A01212] transition"
            >
              {{ $t('user.orderDetails') }}
            </button>
            <button
              v-if="order.status === 'В очікуванні'"
              @click="cancelOrder(order.id)"
              class="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm text-gray-800 font-medium rounded-lg transition"
            >
              {{ $t('user.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <OrderDetailModal
      v-if="showModal"
      :order="selectedOrder"
      @close="closeModal"
    />
  </div>
</template>


<script>
import api from '@/services/api';
import Loader from '../home/Loader.vue';
import OrderDetailModal from "./OrderDetailModal.vue";
import { useToast } from 'vue-toastification';
const toast = useToast();

export default {
  name: "OrderHistory",
  components: { Loader, OrderDetailModal },
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
    const data = await api.getOrders();
    this.orders = (data.orders || []).map(order => ({
      id: order.id,
      order_date: order.order_date,
      status: order.status,
      amount: order.amount,
      currency: order.currency, // ДОДАНО!
      items: (order.products || []).map(item => ({
        id: item.id,
        title: item.name,
        price: item.price,
        currency: item.currency, // ДОДАНО!
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
    formatCurrencyIntl(price, currency) {
  const fallbackCurrency = (localStorage.getItem('currency') || 'UAH').toUpperCase();
  const finalCurrency = (currency || fallbackCurrency).toUpperCase();
  const locale = finalCurrency === 'USD' ? 'en-US' : 'uk-UA';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: finalCurrency,
  }).format(Number(price));
},

    async cancelOrder(id) {
      if (!confirm("Ви дійсно хочете скасувати це замовлення?")) return;
      try {
        await api.cancelOrder(id);
        toast.success("Замовлення успішно скасовано");
        this.fetchOrders();
      } catch (e) {
        console.error("Помилка скасування замовлення:", e);
        toast.error("Не вдалося скасувати замовлення");
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