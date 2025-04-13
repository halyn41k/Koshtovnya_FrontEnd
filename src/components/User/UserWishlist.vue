<template>
  <div class="wishlist">
    <h2 class="wishlist-title">Список бажань</h2>

    <!-- Show Loader while loading wishlist -->
    <Loader v-if="loading" />

    <!-- Show message if no items in wishlist -->
    <div v-else-if="items.length === 0" class="no-items">
      Ваш список бажань порожній :(
    </div>

    <!-- Show wishlist items if they are present -->
    <div v-else>
      <div class="wishlist-items">
        <div v-for="(item, index) in items" :key="index" class="wishlist-item">
          <router-link :to="`/productpage/${item.id}`" class="product-link">
            <div class="item-content">
              <span class="item-number">{{ index + 1 }}.</span>
              <img :src="item.imageSrc" alt="Product Image" class="item-image" />
              <div class="item-details">
                <h3 class="item-name">{{ item.title }}</h3>
                <p class="item-price">{{ item.price }}₴</p>
                <button class="buy-button" :disabled="item.loading" @click.prevent="addToCart(item)">
                  {{ item.loading ? "Додається..." : "Додати в кошик" }}
                </button>
              </div>
            </div>
          </router-link>
          <button class="remove-button" @click.stop="removeItem(index)" aria-label="Remove item">
            X
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Loader from '../Home/Loader.vue'

export default {
  name: "UserWishlist",
  components: {
    Loader, // Register the loader component
  },
  data() {
    return {
      items: [],
      loading: false,
    };
  },
  methods: {
    async fetchWishlist() {
      this.loading = true;
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }
      try {
        const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.items = response.data.products.map((item) => ({
          id: item.id,
          title: item.name,
          price: item.price,
          imageSrc: item.image_url || "default_image_path",
        }));
      } catch (error) {
        console.error("Помилка завантаження списку бажань:", error);
        alert("Не вдалося завантажити ваш список бажаного.");
      } finally {
        this.loading = false;
      }
    },
    async addToCart(item, size = null) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Будь ласка, увійдіть у свій обліковий запис.');
        this.$router.push('/login');
        return;
      }

      try {
        // Додаємо базові параметри для запиту
        const cartData = {
          product_id: item.id,
          quantity: 1, // Ви можете змінити це значення, залежно від потреб
        };

        // Додаємо size, якщо передано
        if (size) {
          cartData.size = size;
        }

        const response = await axios.post(
          'https://koshtovnya.api-dev.bmax-edu.website/api/cart',
          cartData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Відповідь після додавання товару:', response.data); // Логування відповіді

        // Перевірка, чи додавання успішне
        if (response.data && response.data.message === 'Product added to cart') {
          alert('Товар успішно додано до кошика.');
        } else {
          console.error('Товар не був доданий:', response.data);
          alert('Не вдалося додати товар до кошика.');
        }
      } catch (error) {
        console.error('Помилка додавання товару до кошика:', error.response || error);
        alert('Не вдалося додати товар до кошика.');
      }
    },

    async removeItem(index) {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }

      try {
        const itemId = this.items[index].id;
        const response = await axios.delete(`https://koshtovnya.api-dev.bmax-edu.website/api/wishlist/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          this.items.splice(index, 1); // Remove item from the list
          alert("Товар видалено з бажаного.");
        } else {
          alert("Не вдалося видалити товар.");
        }
      } catch (error) {
        console.error("Помилка при видаленні товару:", error);
        alert("Не вдалося видалити товар з бажаного.");
      }
    },
  },

  mounted() {
    this.fetchWishlist();
    document.title = "Список бажаного";
  },
};
</script>



<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Merriweather:wght@400;700&family=Montserrat:wght@600&display=swap');

* {
  font-family: 'Merriweather', serif;
  box-sizing: border-box;
}

.product-link {
  text-decoration: none;
  color: inherit;
  display: flex;
  /* Вирівнюємо елементи flex */
  gap: 20px;
  align-items: center;
}

.wishlist {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  margin-left: -10px;
}

.wishlist-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  text-align: left;
}

.no-items {
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-top: 30px;
}

.wishlist-items {
  max-height: 500px;
  /* Встановлюємо максимальну висоту для прокручуваного контейнера */
  overflow-y: auto;
  /* Додаємо вертикальний скрол */
  padding-right: 10px;
  /* Для відступу від скролбару */
}

/* Стиль для скроллбару */
.wishlist-items::-webkit-scrollbar {
  width: 8px;
}

.wishlist-items::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.wishlist-items::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.wishlist-item {
  display: flex;
  background-color: #F5EAE9;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  position: relative;
  transition: transform 0.3s;
}

.wishlist-item:hover {
  transform: scale(1.02);
}

.item-number {
  font-family: 'Montserrat', sans-serif;
  font-size: 40px;
  font-weight: 600;
  color: #333;
}

.item-content {
  display: flex;
  gap: 20px;
  align-items: center;
  width: 100%;
}

.item-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
}

.item-name {
  font-size: 18px;
  font-family: 'Merriweather', serif;
  font-weight: 700;
  color: #333;
}

.item-price {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #A01212;
}

.buy-button {
  background-color: #6B1F1F;
  color: #fff;
  font-family: 'Merriweather', sans-serif;
  font-size: 16px;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-start;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.buy-button:hover {
  background-color: #a01212;
}

.remove-button {
  background-color: #6B1F1F;
  color: #C4AEAC;
  font-size: 16px;
  border-radius: 5px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  position: absolute;
  top: 10px;
  right: 10px;
}

.remove-button:hover {
  background-color: #8B0E0E;
}
</style>