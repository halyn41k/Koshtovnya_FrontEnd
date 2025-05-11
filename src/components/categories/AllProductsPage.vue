<template>
  <section class="font-montserrat">
    <!-- HEADER: Title + Count + Filter button + Active tags -->
    <div class="px-8 pt-[200px] pb-4">
      <h2 class="title-kyiv text-3xl mb-2">Всі товари</h2>

      <div class="flex items-center justify-between mb-2">
        <p class="text-lg font-medium">Знайдено {{ totalCount }} товарів</p>
        <button
  @click="toggleFilter"
  class="inline-flex items-center p-2 pl-3 pr-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] hover:bg-gray-100 transition lg:hidden"
>
  <img src="@/assets/icons/filter.svg" alt="Filter" class="w-5 h-5 mr-2" />
  <span class="text-base font-semibold">Фільтр</span>
</button>

      </div>
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
      <!-- FILTER SIDEBAR -->
      <div class="hidden lg:block w-[350px] mr-8">
        <FilterComponent
          :initial-filters="filters"
          :mobile-visible="false"
          @apply="applyFilters"
          @close="toggleFilter"
        />
      </div>

      <div
  v-if="filterVisible && isMobile"
  class="fixed inset-0 bg-[#00000080] z-40 transition-opacity"
  @click="toggleFilter"
>
</div>
      <div
        v-if="filterVisible && isMobile"
        class="fixed top-0 right-0 w-[350px] h-screen bg-[#fff7f6] z-50 shadow-lg transition-transform duration-300 transform"
        :class="{ 'translate-x-0': filterVisible, 'translate-x-full': !filterVisible }"
      >
        <div class="h-full overflow-y-auto px-4 py-6">
          <FilterComponent
            :initial-filters="filters"
            :mobile-visible="filterVisible"
            @apply="applyFilters"
            @close="toggleFilter"
          />
        </div>
      </div>

      <!-- PRODUCT GRID -->
<main class="flex-1">
  <div
    class="grid gap-4 transition-opacity duration-500 ease-in-out"
    :class="['grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', loadingProducts ? 'opacity-30' : 'opacity-100']"
  >
    <!-- Коли немає товарів -->
    <div
      v-if="!loadingProducts && products.length === 0"
      class="text-center text-gray-600 py-16 col-span-full animate-fade-in"
    >
      <p class="text-lg font-semibold mb-2">Нічого не знайдено за заданими фільтрами 😢</p>
      <button
        @click="clearAll"
        class="mt-4 px-6 py-2 bg-[#6B1F1F] text-white rounded-md hover:bg-[#A01212] transition"
      >
        Скинути фільтри
      </button>
    </div>

    <!-- Товари -->
    <article
      v-for="product in products"
      :key="product.id"
      class="bg-[#fff7f6] border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transform hover:-translate-y-2 transition duration-300 overflow-hidden flex flex-col"
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
                <h3 class="text-lg font-semibold line-clamp-2 h-12">{{ product.name }}</h3>
                <p class="text-xl font-semibold text-red-700 mt-1">{{ product.price }} грн</p>
              </div>
            </router-link>
            <div class="px-4 flex items-center mb-2 space-x-2">
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
          fill="none"
          stroke="#FFD700"
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
             
            <div class="px-3 mb-6 flex justify-between items-center">
            <span class="text-base font-montserrat font-medium text-gray-800">
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
                @click="addToCart(product)"
                class="w-full h-11 bg-[#6B1F1F] hover:bg-[#A01212] text-white font-semibold rounded-lg flex items-center justify-between px-4 transition duration-300"
              >
                <span>Купити</span>
                <img src="@/assets/miniarrow.png" alt="arrow" class="w-5 h-4" />
              </button>
            </div>
          </article>
  </div>

  <!-- Пагінація -->
  <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8">
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
import { toRaw } from 'vue';
import api from '@/services/api';
import FilterComponent from '../product/FilterComponent.vue';
import bus from '@/eventBus';

export default {
  name: 'AllProducts',
  components: { FilterComponent },
  data() {
    return {
      products: [],
      currentPage: 1,
      filters: {},
      totalPages: 0,
      totalCount: 0,
      filterVisible: false,
    };
  },
  computed: {
    isMobile() {
      return window.innerWidth < 640;
    },
    activeTags() {
      const tags = [];
      for (const [key, val] of Object.entries(this.filters)) {
        if (Array.isArray(val)) {
          if (
            (key === 'size' && val[0] === 0 && val[1] === 100) ||
            (key === 'weight' && val[0] === 0 && val[1] === 1000) ||
            (key === 'price' && val[0] === 0 && val[1] === 10000)
          ) continue;
          if (['size', 'weight', 'price'].includes(key)) {
            tags.push({ key, value: val, label: `${val[0]} – ${val[1]}` });
          } else {
            tags.push(...val.map(v => ({ key, value: v, label: `${v}` })));
          }
        } else if (val !== '' && val != null) {
          tags.push({ key, value: val, label: `${val}` });
        }
      }
      return tags;
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

      const raw = toRaw(filters);
      const params = { page };
      if (raw.color) params.color = raw.color;
      if (raw.type_of_bead) params.type_of_bead = raw.type_of_bead;
      if (raw.bead_producer) params.bead_producer = raw.bead_producer;
      if (raw.size) params.size = raw.size;
      if (raw.weight_from !== undefined || raw.weight_to !== undefined) {
        params.weight_from = raw.weight_from || 0;
        params.weight_to = raw.weight_to || 1000;
      }
      if (raw.price_from !== undefined || raw.price_to !== undefined) {
        params.price_from = raw.price_from || 0;
        params.price_to = raw.price_to || 10000;
      }
      if (raw.rating?.length) params.rating = raw.rating;

      try {
        const res = await api.getAllProducts({ params });
this.products = Array.isArray(res.data) ? res.data : [];
this.totalPages = res.meta?.last_page || 1;
this.totalCount = res.meta?.total || this.products.length;

        console.log('Отримані товари:', this.products);
      } catch (e) {
        console.error('Не вдалося завантажити товари:', e);
      }
    },
    changePage(n) {
      this.fetchProducts(n, this.filters);
    },
    applyFilters(filters) {
      this.fetchProducts(1, filters);
      if (this.isMobile) this.toggleFilter();
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
        await api.addToCart({ product_id: product.id, quantity: 1 });
        bus.emit('cart-updated');
      } catch (error) {
        console.error('Помилка додавання в кошик:', error.response?.data || error);
      }
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
  },
  async mounted() {
    this.filterVisible = !this.isMobile;
    document.title = 'Всі товари';
    await this.fetchProducts();
    window.addEventListener('resize', () => {
      this.filterVisible = false;
      document.body.classList.remove('overflow-hidden');
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

.translate-x-full {
  transform: translateX(100%);
}
.translate-x-0 {
  transform: translateX(0);
}
.transition-transform {
  transition: transform 0.3s ease-in-out;
}
</style>
