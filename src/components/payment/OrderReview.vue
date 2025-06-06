<template>
  <div class="order-review font-montserrat text-[14px]">
    <p class="text-gray-700 dark:text-gray-200 font-semibold mb-4">
      Будь ласка, перевірте своє замовлення перед оплатою.
    </p>

    <section
      ref="orderItems"
      class="overflow-y-auto max-h-[400px] mb-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
    >
      <div v-if="localCartItems.length > 0" class="flex flex-col space-y-4">
        <div
          v-for="item in localCartItems"
          :key="item.id"
          class="flex items-center bg-white dark:bg-[#1e293b] rounded-lg shadow p-4"
        >
          <img
            :src="item.image"
            alt="Product Image"
            class="w-20 h-20 object-cover rounded-md mr-4"
          />
          <div class="flex-1">
            <h3 class="text-gray-900 dark:text-white font-medium text-lg mb-1">
              {{ item.title }}
            </h3>
            <p class="text-gray-600 dark:text-gray-300">
              <span class="font-semibold">{{ formatCurrencyIntl(item.price, item.currency) }}</span> за штуку
            </p>
            <p class="text-gray-600 dark:text-gray-300">
              Кількість: {{ item.quantity }}
            </p>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 dark:text-gray-400 py-10">
        Ваш кошик порожній.
      </div>
    </section>
  </div>
</template>



<script>
import api from '@/services/api';

export default {
  name: 'OrderReview',
  data() {
    return {
      localCartItems: [],
      deliveryCost: 0,
      loading: false,
      formData: {
        city: '',
        deliveryType: '',
      },
      errors: {},
    };
  },
  computed: {
    calculatedTotalAmount() {
      return (
        this.localCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        + this.deliveryCost
      );
    },
  },
  methods: {
    async fetchCartItems() {
      const token = localStorage.getItem('token');
      if (!token) return this.$router.push('/login');
      this.loading = true;
      try {
        const currency = localStorage.getItem('currency')?.toLowerCase() || 'uah';
const data = await api.getCart();

        this.localCartItems = data.products.map(item => ({
        id: item.id,
        image: item.image_url,
        title: item.name,
        price: item.price,
        quantity: item.quantity,
        currency: item.currency || 'UAH',
      }));

      } catch {
        alert('Не вдалося завантажити кошик.');
      } finally {
        this.loading = false;
      }
    },
    submitOrder() {
      alert('Ваше замовлення успішно оформлено!');
    },
     formatCurrencyIntl(amount, currency) {
    const finalCurrency = (currency || localStorage.getItem('currency') || 'UAH').toUpperCase();
    const locale = finalCurrency === 'USD' ? 'en-US' : 'uk-UA';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: finalCurrency,
    }).format(Number(amount));
  },
  },
  mounted() {
    this.fetchCartItems();
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&display=swap');

.font-montserrat { font-family: 'Montserrat', sans-serif; }
</style>