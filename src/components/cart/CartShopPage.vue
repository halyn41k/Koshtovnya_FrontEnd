<template>
  <main class="min-h-screen font-sans pt-[150px] bg-[url('@/assets/cartpattern.png')] bg-cover">
    <header class="flex items-center justify-center gap-4 py-8">
      <div class="h-px bg-gray-300 flex-1"></div>
      <h1 class="text-4xl font-black text-center" style="font-family: 'KyivType Titling Black2';">
        Кошик
      </h1>
      <div class="h-px bg-gray-300 flex-1"></div>
    </header>

    <section class="container mx-auto px-4 md:px-8 lg:px-16 flex flex-col lg:flex-row gap-8">
      <!-- Items List із скролом -->
      <div class="flex-1 space-y-6">


        <Loader v-if="loading" class="mx-auto" />
        <!-- Порожній стан -->
<div
  v-else-if="cartItems.length === 0"
  class="flex items-center justify-center text-center min-h-[400px] w-full empty-cart-message lg:pl-5"
>


  <div class="flex flex-col items-center">
    <img src="@/assets/icons/empty-cart.svg" alt="Порожній кошик" class="w-24 h-24 mb-6 opacity-50" />
    <p class="text-2xl font-semibold text-gray-600 mb-2">Ваш кошик порожній</p>
    <p class="text-base text-gray-400">Перейдіть до каталогу, щоб додати товари</p>
    <router-link
      to="/allproducts"
      class="mt-6 px-6 py-2 bg-[#6B1F1F] text-white rounded-lg hover:bg-[#A01212] transition"
    >
      До каталогу
    </router-link>
  </div>
</div>




        <CartItem
          v-else
          v-for="item in cartItems"
          :key="item.id"
          :item="item"
          @change-quantity="updateCartItem"
          @remove-item="removeItem"
          @change-size="updateCartItem"
        />
      </div>

      <!-- Summary: mobile first, desktop last -->
      <div class="w-full order-first lg:order-last lg:w-auto">
        <Summary v-if="cartItems.length > 0" :cart-items="cartItems" />
      </div>
    </section>
  </main>
</template>

<script>
import api from '@/services/api';
// eslint-disable-next-line 
import CartItem from './CartItem.vue';
// eslint-disable-next-line 
import Summary from './Summary.vue';
// eslint-disable-next-line 
import Loader from '../home/Loader.vue';
import bus from '@/eventBus';
import { useToast } from 'vue-toastification'; // додати
const toast = useToast(); // ініціалізація тосту


export default {
  name: 'CartShopPage',
  components: { CartItem, Summary, Loader },
  data() {
    return {
      cartItems: [],
      loading: false,
    };
  },
  methods: {
    async fetchCartItems() {
      this.loading = true;
      try {
        const data = await api.getCart();
        this.cartItems = data.products.map(item => ({
          id: item.id,
          image: item.image_url,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.selected_size,
          variants: item.variants.map(v => ({ size: v.size, quantity: v.quantity, isAvailable: v.is_available })),
        }));
      } catch (err) {
        console.error('Помилка завантаження кошика:', err);
      } finally {
        this.loading = false;
      }
    },
    async updateCartItem({ id, operation = null, size = null }) {
      try {
        const payload = {};
        if (size !== null) payload.size = size;
        else if (operation) payload.operation = operation;
        else return;
        await api.updateCartItem(id, payload);
        const idx = this.cartItems.findIndex(i => i.id === id);
        if (idx !== -1) {
          if (size !== null) this.cartItems[idx].selectedSize = size;
          else if (operation === 'increase') this.cartItems[idx].quantity++;
          else if (operation === 'decrease' && this.cartItems[idx].quantity > 1) this.cartItems[idx].quantity--;
        }
      } catch (err) {
        console.error('Помилка оновлення:', err);
      }
    },
    async removeItem(id) {
  try {
    await api.removeFromCart(id);
    this.cartItems = this.cartItems.filter(i => i.id !== id);

    // Оповіщаємо шапку оновити лічильник
    bus.emit('cart-updated');
  } catch (err) {
    console.error('Помилка видалення:', err);
    alert('Не вдалося видалити товар.');
  }
},
  },
  mounted() {
    this.fetchCartItems();
    document.title = 'Кошик';
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

/* Окремо: всі елементи в межах компонента */
* {
  font-family: 'Montserrat', sans-serif;
}

/* Або якщо тільки на порожній стан — додай до контейнера клас і застосуй тільки туди */
.empty-cart-message * {
  font-family: 'Montserrat', sans-serif !important;
}

@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

</style>

