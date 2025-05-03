<template>
  <section class="flex pt-[160px] pb-[100px] px-8">
    <!-- Бокова панель фільтрів -->
    <aside
      v-show="filterVisible"
      class="transition-all duration-300 ease-in-out bg-white z-50"
      :class="isMobile
        ? 'fixed inset-0 w-full h-full overflow-y-auto p-4'
        : 'w-[300px] pr-4 absolute top-0 left-0 h-full shadow-lg'"
    >
      <FilterComponent @filters-changed="applyFilters" />
    </aside>

    <!-- Основний контент -->
    <main class="flex-1 flex flex-col font-montserrat">
      <!-- Заголовок секції по центру -->
      <h2 class="title-kyiv mb-4 text-center">
        {{ computedTitle }}
      </h2>
      <!-- Кнопка фільтра під заголовком -->
      <button
        @click="toggleFilter"
        class="inline-flex items-center mb-8 p-2 pl-3 pr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] focus:ring-offset-1 hover:bg-gray-100 active:scale-95 transition duration-200"
      >
        <img
          src="@/assets/icons/filter.svg"
          alt="Filter"
          class="w-5 h-5 mr-2"
        />
        <span class="text-base font-semibold">Фільтр</span>
      </button>

      <!-- Сітка товарів: 4 коли фільтр заховано, 3 коли показано -->
      <div
        class="grid gap-4"
        :class="filterVisible ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'"
      >
        <article
          v-for="product in visibleProducts"
          :key="product.id"
          class="bg-[#fff7f6] border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transform hover:-translate-y-2 transition duration-300 overflow-hidden"
        >
          <router-link :to="`/productpage/${product.id}`" class="flex-1 flex flex-col">
            <div class="h-48 overflow-hidden">
              <img
                :src="product.image_url"
                :alt="product.name"
                class="w-full h-full object-cover hover:scale-105 transition duration-300"
              />
            </div>
            <div class="px-4 py-3 flex-1 flex flex-col justify-between font-montserrat">
              <h3 class="text-lg font-semibold line-clamp-2 h-12">
                {{ product.name }}
              </h3>
              <p class="text-xl font-semibold mt-2 text-[#6B1F1F]">
                {{ product.price }} грн
              </p>
            </div>
          </router-link>

          <!-- Рейтинг та відгуки -->
          <div class="px-4 mb-2 flex items-center space-x-2">
            <div class="flex">
              <span v-for="n in 5" :key="n">
                <svg v-if="n <= Math.round(product.rating)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#FFD700" class="w-4 h-4"><path d="M9.049 2.927..."/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" stroke="#FFD700" fill="none" class="w-4 h-4"><path d="M9.049 2.927..."/></svg>
              </span>
            </div>
            <span class="text-sm text-gray-600">({{ product.review_count }})</span>
          </div>

          <!-- Бісер та бажане -->
          <div class="px-4 mb-4 flex justify-between items-center font-montserrat">
            <span class="text-base text-gray-800">
              {{ product.bead_producer_name }}
            </span>
            <button @click.stop="toggleWishlist(product)" class="focus:outline-none hover:scale-110 transform transition duration-300">
              <svg v-if="product.is_in_wishlist" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#A01212" class="w-6 h-6"><path d="M12 21.35..."/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="#B3B3B3" stroke-width="2" fill="none" class="w-6 h-6"><path d="M20.84 4.61..."/></svg>
            </button>
          </div>

          <!-- Кнопка купити -->
          <div class="px-4 pb-4">
            <button
              @click="addToCart(product)"
              class="w-full h-12 bg-[#6B1F1F] hover:bg-[#A01212] text-white font-semibold rounded-lg flex items-center justify-between px-4 transition duration-300 font-montserrat"
            >
              <span>Купити</span>
              <img src="@/assets/miniarrow.png" alt="arrow" class="w-5 h-4" />
            </button>
          </div>
        </article>
      </div>

      <!-- Пагінація цифрами внизу -->
      <div class="flex justify-center gap-2 mt-8">
        <button
          v-for="n in totalPages"
          :key="n"
          @click="changePage(n)"
          :class="[
            'px-4 py-2 rounded-lg font-semibold transition duration-200 font-montserrat',
            currentPage === n ? 'bg-[#6B1F1F] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ n }}
        </button>
      </div>
    </main>
  </section>
</template>

<script>
import api from '@/services/api';
import FilterComponent from '../product/FilterComponent.vue';

export default {
  name: 'CategorySection',
  components: { FilterComponent },
  props: { categoryId: Number },
  data() {
    return {
      products: [],
      currentPage: 1,
      productsPerPage: 15,
      filters: {},
      visibleProducts: [],
      totalPages: 0,
      filterVisible: false, // спочатку фільтр схований
    };
  },
  computed: {
    computedTitle() {
      const names = { 1: 'Браслети', 2: 'Гердани', 3: 'Дукати', 4: 'Силянки', 5: 'Сережки', 6: 'Пояси' };
      return names[this.categoryId] || 'Категорія';
    },
    isMobile() {
      return window.innerWidth < 640;
    }
  },
  methods: {
    toggleFilter() {
      this.filterVisible = !this.filterVisible;
    },
    async fetchProducts() {
      try {
        const res = await api.getCategoryProducts(this.categoryId, { params: this.filters });
        this.products = Array.isArray(res.data) ? res.data : res.data?.data || [];
        this.updatePagination();
      } catch (e) {
        console.error('Error fetching products', e);
      }
    },
    updatePagination() {
      this.totalPages = Math.ceil(this.products.length / this.productsPerPage);
      this.currentPage = 1;
      this.updateVisibleProducts();
    },
    updateVisibleProducts() {
      const start = (this.currentPage - 1) * this.productsPerPage;
      this.visibleProducts = this.products.slice(start, start + this.productsPerPage);
    },
    changePage(n) {
      this.currentPage = n;
      this.updateVisibleProducts();
    },
    applyFilters(filters) {
      this.filters = filters;
      this.fetchProducts();
    },
    toggleWishlist(product) {},
    addToCart(product) {},
  },
  mounted() {
    this.fetchProducts();
    window.addEventListener('resize', () => {
      // на мобілці завжди модалка, на десктопі бокова панель
      this.filterVisible = false;
    });
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

.title-kyiv {
  font-family: 'KyivType Titling Black2', sans-serif;
  font-size: 30px;
  color: #000;
  text-align: center;
}
</style>
