<template>
  <main class="product-content">
    <section class="product-section">
      <div class="product-layout">
        <!-- Зображення товару -->
        <article class="product-image-container">
          <img loading="lazy" :src="product.image_url" alt="Фото товару" class="product-image" />
          <img src="@/assets/size_change.png" alt="Змінити розмір" class="size-icon" @click="openModal" />
        </article>

        <article class="product-info-container">
          <div class="product-info-wrapper">
            <section class="product-card">
              <div class="product-header">
                <h1 class="product-title">{{ product.name }}</h1>
                <hr class="divider" />
                <p class="product-price">{{ product.price }}₴</p>
                <div class="availability-badge" :class="{ 'available': isAvailable, 'unavailable': !isAvailable }">
                  <span>{{ isAvailable ? 'В наявності' : 'Немає в наявності' }}</span>
                </div>

                <div class="rating-container">
                  <span class="stars">
                    <template v-for="index in 5" :key="index">
                      <i class="star-icon" :class="{
                        'filled-star': index <= Math.floor(product.average_rating),
                        'half-star': index === Math.ceil(product.average_rating) && product.average_rating % 1 !== 0,
                        'empty-star': index > product.average_rating
                      }">★</i>
                    </template>


                  </span>
                  <span class="review-count">({{ product.review_count }})</span>
                </div>
                <hr class="thin-divider" />
                <p class="delivery-time">Приблизний час доставки: 1-7 днів</p>
              </div>

              <label for="size-select" class="size-label">Розмір</label>
              <div class="size-selector">
                <select id="size-select" class="size-dropdown" v-model="selectedSize">
                  <option v-for="variant in product.variants" :key="variant.size" :value="variant.size"
                    :disabled="!variant.is_available">
                    {{ variant.size }} см
                    {{ !variant.is_available ? ' (Немає в наявності)' : '' }}
                  </option>

                </select>
              </div>

              <div class="purchase-controls">
                <div class="quantity-wrapper">
                  <div class="quantity-display">
                    {{ quantity }}
                  </div>
                  <div class="quantity-buttons">
                    <button class="quantity-arrow up-arrow" @click="increaseQuantity"
                      :disabled="!selectedVariant || quantity >= selectedVariant.quantity">
                      ▲
                    </button>
                    <button class="quantity-arrow down-arrow" @click="decreaseQuantity" :disabled="quantity <= 1">
                      ▼
                    </button>
                  </div>
                </div>
                <!-- Кнопка "Купити" якщо товар доступний -->
                <button v-if="isAvailable" class="buy-button" :disabled="!selectedVariant" @click="addToCart(product)">
                  <span class="buy-text">Купити</span>
                  <img src="@/assets/miniarrow.png" alt="Arrow icon" class="button-icon" />
                </button>

                <button v-else class="notify-button" @click="notifyWhenAvailable">
                  <span class="notify-text">Повідомити про наявність</span>
                </button>

                <!-- Сердечко -->
                <div class="wishlist-wrapper">
                  <div class="wishlist-square" @click="toggleWishlist(product)">
                    <svg v-if="isInWishlist(product.id)" class="filled-heart heart-icon"
                      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <svg v-else class="empty-heart heart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path
                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </div>
                </div>
              </div>
              <hr class="thin-divider" />
            </section>
          </div>
        </article>
      </div>
    </section>

    <!-- Характеристики -->
    <h2 class="specifications-title">Характеристики</h2>
    <section class="specifications-list">
      <dl class="spec-grid" v-if="formattedCharacteristics">
        <div class="spec-item" v-for="(value, key) in formattedCharacteristics" :key="key">
          <dt class="spec-term">{{ key }}</dt>
          <dd class="spec-description">{{ value }}</dd>
          <hr class="spec-divider" />
        </div>
      </dl>
    </section>

    <!-- Відгуки -->
    <ProductReviews v-if="productId" :productId="productId" />

    <!-- Схожі товари -->
    <section>
      <ViewOtherProduct />
    </section>

    <!-- Модальне вікно -->
    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <img :src="product.image_url" alt="Збільшене фото товару" class="modal-image" />
      </div>
    </div>
  </main>
</template>

<script>
import ViewOtherProduct from "./ViewOtherProduct.vue";
import ProductReviews from "./ProductReviews.vue";
import axios from "axios";

export default {
  components: {
    ProductReviews,
    ViewOtherProduct,
  },
  data() {
    return {
      isModalOpen: false,
      product: {
        review_count: 0, // Кількість відгуків
        average_rating: 0, // Середній рейтинг (від 0 до 5)
        variants: [],
        colors: [],
      },
      quantity: 1,
      wishlist: [],
      selectedSize: null,
      productId: null,
      translations: {
        country_of_manufacture: "Країна виробник товару",
        material: "Матеріал",
        type_of_fitting: "Фурнітура",
        type_of_bead: "Тип бісеру",
        weight: "Вага",
        colors: "Кольори",
        bead_producer_name: "Виробник бісеру",
        size: "Розміри",
      },
    };
  },
  computed: {
    isAvailable() {
      const available = Array.isArray(this.product.variants) && this.product.variants.some((variant) => variant.is_available);
      console.log("isAvailable:", available);
      return available;
    },
    selectedVariant() {
      const variant = Array.isArray(this.product.variants)
        ? this.product.variants.find((variant) => variant.size === this.selectedSize)
        : null;
      console.log("selectedVariant:", variant);
      return variant;
    },
    formattedCharacteristics() {
      const excludeKeys = [
        "id",
        "name",
        "price",
        "image_url",
        "is_available",
        "quantity",
        "is_in_wishlist",
        "is_in_cart",
        "notify_when_available",
        "review_count",      // Додаємо це
        "average_rating",     // І це
        "rating"
      ];

      const result = {};
      Object.entries(this.product)
        .filter(([key]) => !excludeKeys.includes(key))
        .forEach(([key, value]) => {
          const translatedKey = this.translations[key] || key;

          if (key === "colors" && Array.isArray(value)) {
            result[translatedKey] = value.join(", ");
          } else if (key === "variants") {
            result[this.translations.size] = value.map((v) => v.size).join(", ");
          } else if (key === "type_of_fitting" && Array.isArray(value)) {
            result[translatedKey] = value.join(", "); // Фурнітура без []
          } else {
            result[translatedKey] = value || "Немає";
          }
        });

      return result;
    },

  },
  methods: {
    async fetchWishlist() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Користувач не авторизований");
        return;
      }

      try {
        const response = await axios.get("http://26.235.139.202:8080/api/wishlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const wishlistItems = response.data.products || [];
        this.wishlist = wishlistItems.map((item) => item.id);
      } catch (error) {
        console.error("Помилка завантаження списку бажаного:", error);
      }
    },
    async fetchReviews() {
      try {
        const response = await axios.get(`http://26.235.139.202:8080/api/products/${this.productId}`);
        console.log("Відповідь API:", response.data); // Логування всієї відповіді

        const { rating, review_count } = response.data.data; // Доступ до data.data (оскільки дані містяться в об'єкті data)
        console.log("Рейтинг:", rating); // Перевірка наявності рейтингу
        console.log("Кількість відгуків:", review_count); // Перевірка наявності кількості відгуків

        this.product.average_rating = rating || 0;
        this.product.review_count = review_count || 0;
      } catch (error) {
        console.error('Помилка при завантаженні відгуків:', error);
      }
    },






    async toggleWishlist(product) {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }

      try {
        if (this.isInWishlist(product.id)) {
          await axios.delete(`http://26.235.139.202:8080/api/wishlist/${product.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.wishlist = this.wishlist.filter((id) => id !== product.id);
          alert(`${product.name} видалено зі списку бажаного.`);
        } else {
          await axios.post("http://26.235.139.202:8080/api/wishlist", { product_id: product.id }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.wishlist.push(product.id);
          alert(`${product.name} додано до списку бажаного.`);
        }
      } catch (error) {
        console.error("Помилка роботи зі списком бажаного:", error);
        alert("Не вдалося оновити список бажаного.");
      }
    },
    isInWishlist(productId) {
      return this.wishlist.includes(productId);
    },
    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
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
          cartData.size = this.selectedSize;

        }

        const response = await axios.post(
          'http://26.235.139.202:8080/api/cart',
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
        alert('Не вдалося додати товар до кошика.');
      }
    },

    async notifyWhenAvailable() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }

      try {
        await axios.post(
          "http://26.235.139.202:8080/api/notification",
          { product_id: this.productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(`Ви будете повідомлені, коли ${this.product.name} з'явиться в наявності.`);
      } catch (error) {
        console.error("Помилка реєстрації на сповіщення:", error);
        alert("Не вдалося підписатися на сповіщення. Спробуйте пізніше.");
      }
    },
    increaseQuantity() {
      if (this.selectedVariant && this.quantity < this.selectedVariant.quantity) {
        this.quantity++;
      }
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },

  },

  watch: {
    'product.variants': {
      handler(newVariants) {
        if (newVariants.length > 0 && !this.selectedSize) {
          const firstAvailableVariant = newVariants.find(variant => variant.is_available);
          if (firstAvailableVariant) {
            this.selectedSize = firstAvailableVariant.size;
          }
        }
      },
      immediate: true // Виконати одразу після завантаження компонента
    }
  },

  created() {
    const productIdFromRoute = this.$route.params.id;
    if (productIdFromRoute) {
      this.productId = productIdFromRoute;
      axios.get(`http://26.235.139.202:8080/api/products/${this.productId}`)
        .then((response) => {
          this.product = response.data.data || {};
          this.fetchReviews(); // Завантаження відгуків
        })
        .catch((error) => {
          console.error("Помилка при завантаженні продукту:", error);
        });
      this.fetchWishlist();
    }
  },
};
</script>






<style scoped>
.title-divider {
  margin: 8px 0;
  /* Відступ зверху та знизу */
  width: 50%;
  /* Ширина лінії (коротша, ніж інші) */
  border: 1px solid #ccc;
  /* Тонка сіра лінія */
}

.size-icon {
  position: absolute;
  right: 0;
  top: 300px;
  /* Піднято на 300px */
  transform: translateY(-50%);
  width: 35px;
  height: 40px;
  cursor: pointer;
  right: -90px;
}

.specifications-list .spec-grid {
  margin-left: 50px;
  /* Зміщення характеристик ліворуч */
}

.spec-divider {
  border-top: 1px solid grey;
  margin: 8px 0;
}



.product-image {
  width: 90%;
  height: 300px;
  object-fit: cover;
  margin-left: 100px;
  margin-top: 15px;
  box-shadow: 10px 10px 50px #ddafaf;
  /* Збільшена інтенсивність тіні */

}

.quantity-input {
  width: 50px;
  height: 40px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.arrow-button {
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml;base64,...");
  /* Додайте свої іконки */
  background-repeat: no-repeat;
  background-position: center;
}

.purchase-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  /* Відстань між елементами */
  margin-left: -30px;
}

.quantity-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 80px;
  height: 40px;
  background-color: #f9f9f9;
  margin-left: -10px;

}

.quantity-display {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  padding: 5px;
  border-right: 1px solid #ccc;
}

.quantity-buttons {
  display: flex;
  flex-direction: column;
}

.quantity-arrow {
  width: 25px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  line-height: 20px;
  color: #6b1f1f;
}

.quantity-arrow:hover {
  background-color: #f0f0f0;
}

.up-arrow {
  border-bottom: 1px solid #ccc;
}

.quantity-display {
  font-size: 18px;
  font-weight: bold;
  margin: 5px 0;
  color: #171717;
}


.product-content {
  display: flex;
  flex-direction: column;
  margin-top: 200px;
}

.product-layout {
  display: flex;
  gap: 20px;
}

.product-image-container {
  width: 40%;
  position: relative;
}


.image-normal .product-image {
  width: 300px;
  height: auto;
}

.image-enlarged .product-image {
  width: 500px;
  /* Новий розмір для збільшення */
  height: auto;
}



/* Product Info */
.product-info-container {
  width: 50%;
  margin-left: auto;
}

.product-info-wrapper {
  margin-top: 13px;
  display: flex;
  flex-direction: column;
}

.product-card {
  background: #FFF7F6;
  padding: 26px 24px;
  text-align: center;
  background-image: url('@/assets/angle.png');
  background-size: 220px 220px;
  background-repeat: no-repeat;
  background-position: top right;
}

.product-title {
  color: #000;
  font-size: 30px;
  font-family: 'Merriweather', serif;
  margin-bottom: 4px;
}

.product-price {
  color: #A01212;
  font-size: 25px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;

}

.availability-badge {
  display: inline-flex;
  align-items: center;
  gap: 0px;
  color: #FFF;
  font-size: 15px;
  font-family: 'Merriweather', serif;
  border-radius: 8px;
  padding: 10px 15px;
  margin-top: 0px;
}

.available {
  background: #3C6B1F;
  /* Зелений для товару в наявності */
}

.unavailable {
  background: #8B0000;
  /* Темно-червоний для відсутнього товару */
}


.size-label {
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  font-size: 18px;
  color: #171717;
}

.delivery-time {
  font-family: 'Montserrat', sans-serif;
}

/* Controls */
.size-selector {
  margin-top: 20px;
}

.size-dropdown {
  width: 170px;
  height: 40px;
  background-color: #F6E7E7;
  /* основний колір фону */
  border: none;
  font-family: 'Montserrat', sans-serif;
  padding-right: 20px;
  background-image: url('data:image/svg+xml;base64,...');
  background-position: calc(100% - 10px) center;
  background-repeat: no-repeat;

}

.size-dropdown option {
  background-color: #F6E7E7;
  /* основний колір */
  color: #171717;
  /* колір тексту */
}

.size-dropdown option:hover {
  background-color: #D8B3B3;
  /* темніший колір, коли наведено */
}


.purchase-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.buy-button {
  max-width: 200px;
  display: flex;
  justify-content: space-between;
  /* Align text and icon */

  padding: 12px 17px;
  /* Збільшені падінги */
  width: 180px;
  /* Більша ширина */
  color: #FFF;
  align-items: center;
  background: #6B1F1F;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-family: 'Merriweather', serif;
  z-index: 3;
}

/* Centered Sections */
.centered-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}


.specifications-title {
  font-size: 22px;
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  margin-top: -100px;
  color: #171717;
}

.wider-centered-section {
  width: 90%;
  /* Wider content */
  max-width: 1400px;
}

.decorative-line {
  border-top: 2px solid grey;
  margin: 20px auto;
  width: 100%;
}


.wishlist-square {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f8f8f8;
  cursor: pointer;
}

.heart-icon {
  width: 24px;
  height: 24px;
}

.specifications-list {
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  color: #171717;
}

.spec-grid {
  display: flex;
  flex-direction: column;
  /* Робимо всі елементи вертикальними */
  gap: 2px;
  width: 2400px;
  margin-left: 200px;
}

.spec-term {
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  text-align: left;
  margin-bottom: -15px;
}


.spec-description {
  font-family: 'Montserrat', sans-serif;
  font-weight: normal;
  text-align: left;
  margin-left: 800px;
}

.spec-divider {
  border-top: 1px solid lightgrey;
  margin: 8px 0;
}

/* Reviews */

.specifications-list,
.reviews-section {
  padding-top: 10px;
  /* Adjusted spacing */
}

.specifications-title,
.reviews-title {
  font-size: 22px;
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  color: #171717;
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.specifications-title::before,
.reviews-title::before,
.specifications-title::after,
.reviews-title::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 2px;
  background: grey;
}

.specifications-title::before,
.reviews-title::before {
  left: 0;
}

.specifications-title::after,
.reviews-title::after {
  right: 0;
}


.heart-icon {
  width: 20px;
  height: 20px;
}

.divider {
  width: 100px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: zoom-in;
}

.modal-image:hover {
  transform: scale(1.1);
  /* Легке збільшення при наведенні */
  transition: transform 0.2s ease-in-out;
}

.notify-button {
  max-width: 250px;
  display: flex;
  justify-content: center;
  padding: 12px 17px;
  width: 250px;
  color: #FFF;
  align-items: center;
  background: #A01212;
  /* Darker red to differentiate from buy button */
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Merriweather', serif;
  text-align: center;
}

.notify-button:hover {
  background: #6B1F1F;
  /* Even darker shade on hover */
}

.button-icon {
  width: 15px;
  height: 12px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  margin-top: 10px;
}

.rating-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  margin-top: 10px;
}

.review-count {
  font-size: 14px;
  color: #555;
}

.star-icon {
  font-size: 20px;
  /* Розмір зірок */
  color: lightgray;
  /* Колір для порожніх зірок */
  margin-right: 2px;
  font-style: normal;
  /* Вимикаємо курсив */
}


.filled-star {
  color: gold;
  /* Золотий колір для заповнених зірок */
}

.half-star {
  position: relative;
  display: inline-block;
  color: lightgray;
  /* Колір для неактивної частини */
}

.half-star::before {
  content: '★';
  position: absolute;
  left: 0;
  width: 50%;
  overflow: hidden;
  color: gold;
  /* Колір для заповненої частини */
}

.empty-star {
  color: lightgray;
  /* Сірий для порожніх */
}


</style>