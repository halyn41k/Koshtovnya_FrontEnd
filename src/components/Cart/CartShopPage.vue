<template>
  <main class="cart">
    <header class="cart-header">
      <div class="line"></div>
      <h1 class="main-title">Кошик</h1>
      <div class="line"></div>
    </header>
    <div class="cart-content">
      <section class="cart-items">
        <div v-if="loading" class="loading">
          <Loader />
        </div>
        <div v-else-if="cartItems.length === 0" class="empty-cart">
          Ваш кошик порожній.
        </div>
        <CartItem v-for="(item, index) in cartItems" :key="item.id" :id="item.id" :itemNumber="index + 1"
          :imageSrc="item.image" :title="item.title" :price="item.price" :quantity="item.quantity"
          :selectedSize="item.selectedSize" :variants="item.variants" @change-quantity="updateCartItem"
          @remove-item="removeItem" @change-size="updateCartItem" />


      </section>
      <Summary v-if="cartItems.length > 0" :cartItems="cartItems" />
    </div>
  </main>
</template>

<script>
import api from '@/services/api';
import CartItem from './CartItem.vue';
import Summary from './Summary.vue';
import Loader from '../home/Loader.vue';

export default {
  name: "CartShopPage",
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
        // припустимо API повертає { products: [...] }
        this.cartItems = data.products.map(item => ({
          id: item.id,
          image: item.image_url,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
          isAvailable: item.is_available,
          selectedSize: item.selected_size || item.variants[0]?.size || '',
          variants: item.variants.map(v => ({
            size: v.size,
            quantity: v.quantity,
            isAvailable: v.is_available,
          })),
        }));
      } catch (err) {
        console.error("Помилка завантаження кошика:", err);
        alert("Не вдалося завантажити кошик.");
      } finally {
        this.loading = false;
      }
    },
    async updateCartItem({ id, quantity = null, operation = null, size = null }) {
      try {
        const payload = size ? { size } : { operation, quantity };
        await api.updateCartItem(id, payload);
        const idx = this.cartItems.findIndex(i => i.id === id);
        if (idx !== -1) {
          if (size) this.cartItems[idx].selectedSize = size;
          else if (quantity !== null) this.cartItems[idx].quantity = quantity;
        }
        alert("Товар успішно оновлено.");
      } catch (err) {
        console.error("Помилка оновлення:", err);
        alert(err.response?.data?.message || "Не вдалося оновити.");
      }
    },
    async removeItem(id) {
      try {
        await api.removeFromCart(id);
        this.cartItems = this.cartItems.filter(i => i.id !== id);
      } catch (err) {
        console.error("Помилка видалення:", err);
        alert("Не вдалося видалити товар.");
      }
    },
  },
  mounted() {
    this.fetchCartItems();
    document.title = "Кошик";
  }
};
</script>


<style scoped>
@font-face {
  font-family: 'KyivType Medium';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeSans-Medium2.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}

.cart {
  display: flex;
  flex-direction: column;
  padding: 0 46.67px;
  margin-top: 180px;
  background-image: url('@/assets/cartpattern.png');
  /* Додаємо фон */
  background-size: cover;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
}

.line {
  flex: 1;
  height: 2px;
  background-color: grey;
  width: 45%;
}

.main-title {
  font-family: 'KyivType Titling', sans-serif;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: -1.2px;
  text-shadow: 0 2px 3px rgba(99, 2, 2, 0.22);
  text-align: center;

}

.cart-content {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.cart-items {
  width: 50%;
  height: 500px;
  overflow-y: auto;
  /* Тонкий скрол */
  scrollbar-width: thin;
  /* Для Firefox */
}

/* Стиль для скроллбару */
.cart-items::-webkit-scrollbar {
  width: 8px;
}

.cart-items::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.cart-items::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.loading {
  text-align: center;
  color: grey;
}

.empty-cart {
  text-align: center;
  font-size: 18px;
  color: grey;
}
</style>
