<template>
  <section class="font-montserrat">
    <!-- HEADER: Title + Count + Filter button + Active tags -->
    <div class="px-8 pt-[200px] pb-4">
      <!-- 1. Category title -->
      <h2 class="title-kyiv text-3xl mb-2">{{ computedTitle }}</h2>

      <!-- 2. Count + Filter button -->
      <div class="flex items-center justify-between mb-2">
        <p class="text-lg font-medium">Знайдено {{ totalCount }} товарів</p>
        <button
          @click="toggleFilter"
          class="inline-flex items-center p-2 pl-3 pr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] hover:bg-gray-100 transition"
        >
          <img src="@/assets/icons/filter.svg" alt="Filter" class="w-5 h-5 mr-2" />
          <span class="text-base font-semibold">Фільтр</span>
        </button>
      </div>

      <!-- 3. Active filter tags -->
      <div v-if="activeTags.length" class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="tag in activeTags"
          :key="tag.key + tag.value"
          @click="removeTag(tag)"
          class="px-3 py-1 bg-gray-200 rounded-full flex items-center space-x-1"
        >
          <span>{{ tag.label }}</span>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <button
          @click="clearAll"
          class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
        >
          Очистити всі
        </button>
      </div>
    </div>

    <div class="flex px-8 pb-[100px]">
      <!-- MOBILE BACKDROP -->
      <div
        v-if="filterVisible && isMobile"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
        @click="toggleFilter"
      ></div>

      <!-- SIDEBAR FILTER -->
      <aside
        v-show="filterVisible"
        class="transition-all duration-300 ease-in-out bg-white z-50 flex flex-col"
        :class="isMobile
          ? 'fixed inset-0 w-full h-full overflow-hidden p-0'
          : 'relative left-0 w-[350px] pr-4 sticky top-0 h-[calc(100vh-10rem)] overflow-y-auto shadow-lg'"
      >
        <FilterComponent
          :initial-filters="filters"
          :mobile="isMobile"
          @apply="applyFilters"
          @close="toggleFilter"
        />
      </aside>

      <!-- MAIN PRODUCT GRID -->
      <main
        :class="[
          'flex-1 transition-[margin] duration-300',
          filterVisible && !isMobile ? 'ml-[350px]' : ''
        ]"
      >
        <div
          class="grid gap-4"
          :class="filterVisible && !isMobile
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'"
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
              <div class="px-4 py-3 flex-1 flex flex-col justify-between">
                <h3 class="text-lg font-semibold line-clamp-2 h-12">
                  {{ product.name }}
                </h3>
                <p class="text-xl font-semibold text-red-700 mt-1">
                  {{ product.price }} грн
                </p>
              </div>
            </router-link>

            <div class="px-4 mb-4 flex justify-between items-center">
              <span class="text-base text-gray-800">{{ product.bead_producer_name }}</span>
              <button @click.stop="toggleWishlist(product)" class="focus:outline-none hover:scale-110 transform transition duration-300">
                <svg v-if="product.is_in_wishlist" xmlns="http://www.w3.org/2000/svg" fill="#A01212" class="w-6 h-6">
                  <path d="M12 21.35..."/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" stroke="#B3B3B3" stroke-width="2" fill="none" class="w-6 h-6">
                  <path d="M20.84 4.61..."/>
                </svg>
              </button>
            </div>

            <div class="px-4 pb-4">
              <button
                @click="addToCart(product)"
                class="w-full h-12 bg-[#6B1F1F] hover:bg-[#A01212] text-white font-semibold rounded-lg flex items-center justify-between px-4 transition duration-300"
              >
                <span>Купити</span>
                <img src="@/assets/miniarrow.png" alt="arrow" class="w-5 h-4" />
              </button>
            </div>
          </article>
        </div>

        <!-- PAGINATION -->
        <div class="flex justify-center gap-2 mt-8">
          <button
            v-for="n in totalPages"
            :key="n"
            @click="changePage(n)"
            :class="[
              'px-4 py-2 rounded-lg font-semibold transition duration-200',
              currentPage === n ? 'bg-[#6B1F1F] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            {{ n }}
          </button>
        </div>
      </main>
    </div>
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
      filterVisible: false,
    };
  },
  computed: {
    computedTitle() {
      const names = { 1: 'Браслети', 2: 'Гердани', 3: 'Дукати', 4: 'Силянки', 5: 'Сережки', 6: 'Пояси' };
      return names[this.categoryId] || 'Категорія';
    },
    isMobile() {
      return window.innerWidth < 640;
    },
    totalCount() {
      return this.products.length;
    },
    activeTags() {
      return Object.entries(this.filters).flatMap(([key, val]) => {
        if (Array.isArray(val)) return val.map(v => ({ key, value: v, label: `${key}: ${v}` }));
        if (val !== '' && val != null) return [{ key, value: val, label: `${key}: ${val}` }];
        return [];
      });
    }
  },
  methods: {
    toggleFilter() {
      this.filterVisible = !this.filterVisible;
      document.body.classList.toggle('overflow-hidden', this.filterVisible && this.isMobile);
    },
    async fetchProducts(page = 1, filters = {}) {
      this.currentPage = page;
      this.filters = filters;
      try {
        const res = await api.getCategoryProducts(this.categoryId, { params: filters });
        this.products = Array.isArray(res.data) ? res.data : res.data?.data || [];
        this.updatePagination();
      } catch (e) {
        console.error(e);
      }
    },
    updatePagination() {
      this.totalPages = Math.ceil(this.products.length / this.productsPerPage);
      this.updateVisibleProducts();
    },
    updateVisibleProducts() {
      const start = (this.currentPage - 1) * this.productsPerPage;
      this.visibleProducts = this.products.slice(start, start + this.productsPerPage);
    },
    changePage(n) {
      this.fetchProducts(n, this.filters);
    },
    applyFilters(filters) {
      this.fetchProducts(1, filters);
      if (this.isMobile) this.toggleFilter();
    },
    removeTag(tag) {
      const nf = { ...this.filters };
      const val = nf[tag.key];
      if (Array.isArray(val)) {
        if (val.length === 2 && typeof val[0] === 'number') delete nf[tag.key];
        else nf[tag.key] = val.filter(v => v !== tag.value);
      } else {
        delete nf[tag.key];
      }
      this.fetchProducts(1, nf);
    },
    clearAll() {
      this.fetchProducts(1, {});
    },
    toggleWishlist(product) { /* ... */ },
    addToCart(product) { /* ... */ }
  },
  mounted() {
    this.filterVisible = !this.isMobile;
    this.fetchProducts();
    window.addEventListener('resize', () => {
      this.filterVisible = false;
      document.body.classList.remove('overflow-hidden');
    });
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&amp;display=swap');

@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif !important;
}

.title-kyiv {
  font-family: 'KyivType Titling Black2', sans-serif;
  font-size: 2rem;
  color: #000;
}

.section {
  transition: transform 0.2s;
}
.section:hover {
  transform: translateY(-2px);
}
</style>
