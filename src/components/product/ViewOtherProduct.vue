<template>
  <section class="py-16">
    <!-- Заголовок з лініями -->
    <div class="flex items-center my-6">
      <hr class="flex-grow border-t-2 border-gray-300 dark:border-gray-600" />
      <h2 class="mx-4 text-2xl font-bold text-gray-900 dark:invert">Перегляньте інші товари</h2>
      <hr class="flex-grow border-t-2 border-gray-300 dark:border-gray-600" />
    </div>

    <div class="relative flex items-center justify-center max-w-[2100px] mx-auto">
      <!-- Ліва стрілка -->
<button
  @click="showPreviousProducts"
  class="hidden sm:block absolute left-0 -translate-x-full transform hover:scale-125 transition-all duration-500 ease-in-out z-10"
>
  <img src="@/assets/left_arrow.png" alt="left-arrow" class="w-10 h-10 dark:invert" />
</button>


      <!-- Свайп/Грід товарів -->
      <div
  class="flex gap-4 overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:snap-none justify-start scroll-pl-4"
      >
        <article
  v-for="product in visibleProducts"
  :key="product.id"
  class="snap-start w-72 flex-shrink-0 h-[440px] bg-[#fff7f6] dark:bg-[#17223b] border-2 border-gray-200 dark:border-[#303b59] rounded-2xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-500 ease-in-out flex flex-col overflow-hidden"
>
  <router-link :to="`/productpage/${product.id}`" class="flex-1 flex flex-col">
    <div class="h-48 overflow-hidden">
      <img
        :src="product.image_url"
        :alt="product.name"
        class="w-full h-full object-cover hover:scale-105 transition-all duration-500 ease-in-out"
      />
    </div>
    <div class="px-3 py-2 flex-1 flex flex-col justify-between">
      <h3 class="text-lg font-montserrat font-semibold line-clamp-2 h-12 text-gray-800 dark:text-gray-100">
        {{ product.name }}
      </h3>
      <p class="text-xl font-semibold text-red-700 dark:text-gray-100 mt-1">
        {{ formatCurrencyIntl(product.price, product.currency) }}
      </p>
    </div>
  </router-link>

   <!-- Рейтинг та кількість відгуків -->
          <div class="px-3 mb-2 flex items-center space-x-2">
            <div class="flex items-center">
              <span v-for="n in 5" :key="n">
                <svg
                  v-if="n <= Math.round(product.rating)"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="#FFD700"
                  class="w-4 h-4"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462
                       c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07
                       3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0
                       00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1
                       1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1
                       1 0 00.95-.69l1.07-3.292z"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  stroke="#FFD700"
                  fill="none"
                  class="w-4 h-4"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462
                       c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07
                       3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0
                       00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1
                       1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1
                       1 0 00.95-.69l1.07-3.292z"
                  />
                </svg>
              </span>
            </div>
            <span class="text-sm text-gray-600">({{ product.review_count }})</span>
          </div>

          <!-- Бісер та лайк -->
          <div class="px-3 mb-6 flex justify-between items-center">
            <span class="text-base font-montserrat font-medium text-gray-800 dark:text-white">
  {{ product.bead_producer_name }}
</span>

            <button
              @click.stop="toggleWishlist(product)"
              class="focus:outline-none transform hover:scale-110 transition-all duration-500 ease-in-out"
            >
              <svg
                v-if="product.is_in_wishlist"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#A01212"
                class="w-6 h-6"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2
                     8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81
                     4.5 2.09C13.09 3.81 14.76 3 16.5
                     3 19.58 3 22 5.42 22 8.5c0
                     3.78-3.4 6.86-8.55 11.54L12
                     21.35z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="#B3B3B3"
                stroke-width="2"
                fill="none"
                class="w-6 h-6"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 00-7.78
                     0L12 5.67l-1.06-1.06a5.5 5.5 0
                     00-7.78 7.78L12 21.23l8.84-8.84a5.5
                     5.5 0 000-7.78z"
                />
              </svg>
            </button>
          </div>

          <div class="px-4 pb-4">
    <button
      v-if="product.has_available_variant"
      @click="addToCart(product)"
       class="w-full h-11 bg-[#6B1F1F] hover:bg-[#861818] dark:bg-[#A01212] dark:hover:bg-[#c42e2e] 
         text-white font-montserrat font-semibold rounded-lg flex items-center justify-between px-4 
         transition-all duration-300 ease-in-out shadow-sm hover:shadow-md"
>
      <span>Купити</span>
      <img src="@/assets/miniarrow.png" alt="arrow" class="w-5 h-4" />
    </button>

    <button
      v-else
      @click="notifyWhenAvailable(product)"
      class="w-full h-11 bg-gray-300 text-gray-700 dark:bg-[#3c465f] dark:text-gray-200 font-montserrat font-semibold rounded-lg flex items-center justify-center px-4 transition duration-300"
    >
      Повідомити про наявність
    </button>
  </div>
</article>

      </div>

      <!-- Права стрілка -->
<button
  @click="showNextProducts"
  class="hidden sm:block absolute right-0 translate-x-full transform hover:scale-125 transition-all duration-500 ease-in-out z-10"
>
  <img src="@/assets/arrow_big.png" alt="right-arrow" class="w-10 h-10 dark:invert" />
</button>

    </div>

    <!-- Дотси (desktop only) -->
    <div class="hidden sm:flex justify-center items-center gap-2 mt-6">
      <span
        v-for="(_, index) in totalPages"
        :key="index"
        :class="['w-3 h-3 rounded-full', index === currentPage ? 'bg-red-900 opacity-75' : 'bg-red-900 opacity-25']"
      />
    </div>
  </section>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'PopularProducts',
  data() {
    return {
      products: [],
      visibleProducts: [],
      currentPage: 0,
      productsPerPage: 3,
      totalPages: 0,
    };
  },
  methods: {
    goToProduct(id) {
  this.$router.push(`/productpage/${id}`);
},
formatCurrencyIntl(price, currency) {
  const val = Number(price);
  const curr = (currency || 'UAH').toUpperCase();
  const locale = curr === 'USD' ? 'en-US' : 'uk-UA';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
  }).format(val);
},
    updateProductsPerPage() {
      const perPage = window.innerWidth < 640 ? 6 : 3;
      this.productsPerPage = perPage;
      this.totalPages = Math.ceil(this.products.length / perPage);
      this.currentPage = 0;
      this.updateVisibleProducts();
    },

    async fetchProducts() {
      try {
        const response = await api.getPopularProducts();
        const items = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        this.products = items;
        this.updateProductsPerPage();
      } catch (error) {
        console.error('Помилка при завантаженні популярних товарів:', error);
      }
    },

    updateVisibleProducts() {
      const start = this.currentPage * this.productsPerPage;
      this.visibleProducts = this.products.slice(start, start + this.productsPerPage);
    },

    showPreviousProducts() {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.updateVisibleProducts();
      }
    },

    showNextProducts() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
        this.updateVisibleProducts();
      }
    },

    async toggleWishlist(product) {
      try {
        if (product.is_in_wishlist) {
          await api.deleteWishlistItem(product.id);
        } else {
          await api.addToWishlist({ product_id: product.id });
        }
        product.is_in_wishlist = !product.is_in_wishlist;
      } catch (error) {
        console.error('Помилка оновлення списку бажаного:', error);
      }
    },

    async addToCart(product) {
      try {
        const res = await api.addToCart({ product_id: product.id, quantity: 1 });
        console.log('Додано до кошика:', res.data);
      } catch (error) {
        console.error('Помилка додавання в кошик:', error.response?.data || error);
      }
    },
  },
  mounted() {
    window.addEventListener('resize', this.updateProductsPerPage);
    this.fetchProducts();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateProductsPerPage);
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

/* Приховати рідний скролбар */
.flex::-webkit-scrollbar {
  display: none;
}
.flex {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
