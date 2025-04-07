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
import axios from "axios";
import CartItem from './CartItem.vue';
import Summary from './Summary.vue';
import Loader from '../Home/Loader.vue'; 


export default {
  name: "CartShopPage",
  components: {
    CartItem,
    Summary,
    Loader,  // Register the Loader component
  },
  data() {
    return {
      cartItems: [],
      loading: false,
    };
  },
  methods: {
    async fetchCartItems() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }
      this.loading = true;
      try {
        const response = await axios.get("http://26.235.139.202:8080/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Оновлюємо cartItems, включаючи нові поля
        this.cartItems = response.data.products.map(item => ({
          id: item.id,
          image: item.image_url,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
          isAvailable: item.is_available,
          selectedSize: item.selected_size || item.variants[0]?.size || '', // Вибираємо перший доступний розмір
          variants: item.variants.map(variant => ({
            size: variant.size,
            quantity: variant.quantity,
            isAvailable: variant.is_available,
          })),
        }));


        // Обробка помилок (якщо є недоступні товари)
        if (response.data.errors && response.data.errors.length > 0) {
          response.data.errors.forEach(error => {
            const itemIndex = this.cartItems.findIndex(item => item.title === error.product_name);
            if (itemIndex !== -1) {
              this.cartItems[itemIndex].isAvailable = false;
              this.cartItems[itemIndex].errorMessage = error.message;
            }
          });
        }
      } catch (error) {
        console.error("Помилка завантаження кошика:", error);
        alert("Не вдалося завантажити кошик.");
      } finally {
        this.loading = false;
      }
    },
    async updateCartItem({ id, quantity = null, operation = null, size = null }) {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }

      try {
        const data = size
          ? { size } // Якщо змінюємо розмір
          : { operation, quantity }; // Якщо змінюємо кількість

        await axios.patch(
          `http://26.235.139.202:8080/api/cart/${id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const itemIndex = this.cartItems.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          if (size) {
            this.cartItems[itemIndex].selectedSize = size; // Оновлюємо локально
          } else if (quantity !== null) {
            this.cartItems[itemIndex].quantity = quantity;
          }
        }

        alert("Товар успішно оновлено.");
      } catch (error) {
        console.error("Помилка оновлення товару в кошику:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Не вдалося оновити товар у кошику.");
      }
    },



    async removeItem(id) {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }
      try {
        await axios.delete(`http://26.235.139.202:8080/api/cart/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.cartItems = this.cartItems.filter(item => item.id !== id);
      } catch (error) {
        console.error("Помилка видалення товару:", error);
        alert("Не вдалося видалити товар із кошика.");
      }
    },
  },
  mounted() {
    this.fetchCartItems();
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
