<template>
  <div class="order-review font-montserrat text-[14px]">
    <p class="text-gray-700 font-semibold mb-4">
      Будь ласка, перевірте своє замовлення перед оплатою.
    </p>

    <section ref="orderItems" class="overflow-y-auto max-h-[400px] mb-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div v-if="localCartItems.length > 0" class="flex flex-col space-y-4">
        <div v-for="item in localCartItems" :key="item.id" class="flex items-center bg-white rounded-lg shadow p-4">
          <img :src="item.image" alt="Product Image" class="w-20 h-20 object-cover rounded-md mr-4" />
          <div class="flex-1">
            <h3 class="text-gray-900 font-medium text-lg mb-1">{{ item.title }}</h3>
            <p class="text-gray-600">
              <span class="font-semibold">{{ item.price }}₴</span> за штуку
            </p>
            <p class="text-gray-600">Кількість: {{ item.quantity }}</p>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-10">
        Ваш кошик порожній.
      </div>
    </section>

    <PaymentSummary
      :cartItems="localCartItems"
      :deliveryCost="deliveryCost"
      :totalAmount="calculatedTotalAmount"
      :cityRef="formData.city"
      :deliveryType="formData.deliveryType"
      @submit-payment="submitOrder"
      class="w-full"
    />
  </div>
</template>

<script>
import axios from 'axios';
import PaymentSummary from './PaymentSummary.vue';

export default {
  name: 'OrderReview',
  components: { PaymentSummary },
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
        const { data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/cart',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.localCartItems = data.products.map(item => ({
          id: item.id,
          image: item.image_url,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
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