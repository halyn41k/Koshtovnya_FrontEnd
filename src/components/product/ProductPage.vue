<template>
  <div>
    <!-- SKELETON LOADER -->
   <template v-if="loading">
  <section class="mt-40 mx-auto max-w-7xl p-4 space-y-8 animate-pulse">
    <div class="flex flex-col lg:flex-row gap-8">
      <div class="w-full lg:w-1/2 h-80 bg-gray-400 dark:bg-gray-800 rounded-md"></div>
      <div class="lg:w-1/2 space-y-4">
        <div class="h-6 bg-gray-400 dark:bg-gray-800 rounded w-3/5 mx-auto"></div>
        <div class="h-6 bg-gray-400 dark:bg-gray-800 rounded w-1/4 mx-auto"></div>
        <div class="h-4 bg-gray-400 dark:bg-gray-800 rounded w-1/3 mx-auto"></div>
        <div class="h-10 bg-gray-400 dark:bg-gray-800 rounded w-full"></div>
        <div class="h-40 bg-gray-400 dark:bg-gray-800 rounded"></div>
      </div>
    </div>
    <div class="space-y-2">
      <div class="h-4 bg-gray-400 dark:bg-gray-800 rounded w-1/2"></div>
      <div class="h-4 bg-gray-400 dark:bg-gray-800 rounded w-3/4"></div>
      <div class="h-4 bg-gray-400 dark:bg-gray-800 rounded w-1/4"></div>
    </div>
  </section>
</template>

    <!-- REAL CONTENT -->
    <template v-else>
      <main class="mt-40 font-montserrat mx-auto max-w-7xl p-4 space-y-8">
        <!-- PRODUCT SECTION -->
        <section class="flex flex-col lg:flex-row gap-8">
          <!-- IMAGE & ZOOM -->
          <div class="relative lg:w-1/2">
            <img
              loading="lazy"
              :src="product.image_url"
              :alt="$t('product.photoAlt')"
              class="w-full h-80 object-cover rounded-md shadow-lg"
            />
            <button
              @click="openModal"
              class="absolute top-4 right-4 bg-white dark:bg-gray-900/90 p-2 rounded-full shadow-md hover:bg-white dark:bg-gray-900/100 transition-colors duration-200"
            >
              <img
                src="@/assets/size_change.png"
                :alt="$t('product.changeSize')"
                class="w-6 h-6"
              />
            </button>
          </div>

          <!-- INFO CARD -->
          <div class="lg:w-1/2 bg-[#fff7f6] dark:bg-[#17223b] border-2 border-gray-200 dark:border-[#303b59] p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-500 ease-in-out flex flex-col space-y-4">
            <!-- TITLE & PRICE -->
            <div class="text-center space-y-2">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ product.name }}
              </h1>
              <hr class="border-gray-300 dark:border-gray-600 mx-auto w-24" />
              <p
                v-if="product.price && product.currency"
                class="text-2xl font-semibold text-red-700 dark:text-gray-100"
              >
                {{ formatCurrencyIntl(product.price, product.currency) }}
              </p>
              <p
                v-else
                class="text-2xl font-semibold text-red-700 dark:text-gray-100"
              >
                {{ $t('product.priceNotSpecified') }}
              </p>
              <span
                class="inline-block px-4 py-1 rounded-md text-sm text-white"
                :class="isAvailable ? 'bg-green-600' : 'bg-red-700'"
              >
                {{ isAvailable ? $t('product.inStock') : $t('product.outOfStock') }}
              </span>
            </div>

            <!-- RATING -->
            <div class="flex items-center justify-center space-x-2">
              <div class="flex space-x-1">
                <template v-for="i in 5" :key="i">
                  <span
                    class="text-xl not-italic"
                    :class="i <= Math.round(product.average_rating) ? 'text-yellow-400' : 'text-gray-300'"
                  >★</span>
                </template>
             </div>
              <span class="text-sm text-gray-600">({{ product.review_count }})</span>
            </div>

            <hr class="border-gray-200 dark:border-gray-600" />
            <p class="text-center text-sm text-gray-500 dark:text-gray-300">
              {{ $t('product.approxDelivery') }}
            </p>

            <!-- SIZE SELECTOR -->
            <div class="space-y-1">
              <label for="size-select" class="block text-base font-medium text-gray-700 dark:text-gray-300">
                {{ $t('product.sizeLabel') }}
              </label>
              <select
                id="size-select"
                v-model="selectedSize"
                class="w-full h-10 bg-[#F6E7E7] dark:bg-[#3c465f] dark:text-white rounded-md px-3 focus:outline-none"
              >
                <option
                  v-for="v in product.variants"
                  :key="v.size"
                  :value="v.size"
                  :disabled="!v.is_available"
                >
                  {{ v.size }} {{ $t('product.sizeUnit') }} {{ !v.is_available ? '(' + $t('product.notAvailable') + ')' : '' }}
                </option>
              </select>
            </div>

            <!-- QUANTITY & ACTIONS -->
            <div class="flex items-center space-x-4 pt-4">
              <div class="min-w-[120px] flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                <button @click="decreaseQuantity" :disabled="quantity <= 1" class="px-3 disabled:opacity-50">
                  -
                </button>
                <span class="px-4">{{ quantity }}</span>
                <button
                  @click="increaseQuantity"
                  :disabled="!selectedVariant || quantity >= selectedVariant.quantity"
                  class="px-3 disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <button
                v-if="isAvailable"
                @click="addToCart"
                :disabled="!selectedVariant"
                class="flex-1 flex items-center justify-center space-x-2 bg-[#6B1F1F] hover:bg-[#861818] dark:bg-[#A01212] dark:hover:bg-[#c42e2e] text-white font-montserrat font-semibold py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out disabled:opacity-50"
              >
                <span>{{ $t('product.buy') }}</span>
                <img src="@/assets/miniarrow.png" alt="" class="w-4 h-3" />
              </button>
              <button
                v-else
                @click="notifyWhenAvailable"
                class="flex-1 bg-gray-300 text-gray-700 dark:bg-[#3c465f] dark:text-gray-200 font-montserrat font-semibold py-2 rounded-lg shadow-md hover:bg-red-700 transition-all duration-300"
              >
                {{ $t('product.notifyAvailability') }}
              </button>

              <button @click="toggleWishlist(product)" class="p-2">
                <svg v-if="product.is_in_wishlist" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-500 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                   <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3
                   c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3
                   19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-500 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06
                   a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84
                   a5.5 5.5 0 000-7.78z"
              />
                </svg>
              </button>
            </div>
          </div>
        </section>

         <!-- SPECIFICATIONS -->
    <section>
      <div class="hidden md:flex items-center mb-4">
        <hr class="flex-grow border-t-2 border-gray-300 dark:border-gray-600" />
      <h2 class="mx-4 text-2xl font-bold text-gray-900 dark:invert">Характеристики</h2>
      <hr class="flex-grow border-t-2 border-gray-300 dark:border-gray-600" />
      </div>
      <h2 class="md:hidden text-2xl font-bold text-gray-900 text-center mb-4 dark:invert">Характеристики</h2>
      <div class="w-full">
        <div
          v-for="(val, key) in formattedCharacteristics"
          :key="key"
          class="grid grid-cols-2 gap-4 py-2 border-b border-gray-200"
        >
          <dt class="font-medium">{{ key }}</dt>
<dd class="text-gray-700 dark:text-gray-300">{{ val }}</dd>
        </div>
      </div>
    </section>

        <!-- REVIEWS & RELATED -->
    <Suspense>
      <template #default>
        <ProductReviews v-if="productId" :productId="productId" />
      </template>
      <template #fallback>
        <div class="text-center text-gray-500 dark:text-gray-300">
          {{ $t('product.loadingReviews') }}
        </div>
      </template>
    </Suspense>
    <Suspense>
      <template #default>
        <ViewOtherProduct />
      </template>
      <template #fallback>
        <div class="text-center text-gray-500 dark:text-gray-300">
          {{ $t('product.loadingRelated') }}
        </div>
      </template>
    </Suspense>

    <!-- MODAL -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      @click="closeModal"
    >
      <img
        :src="product.image_url"
        :alt="$t('product.photoAlt')"
        class="max-w-full max-h-full object-contain"
        @click.stop
      />
    </div>

    <Suspense>
      <template #default>
        <RecentlyViewed />
      </template>
      <template #fallback>
        <div class="text-center text-gray-500 dark:text-gray-300">
          {{ $t('product.loadingRecentlyViewed') }}
        </div>
      </template>
    </Suspense>
  </main>
  </template>   
  </div>      
</template>    

<script>
import { defineAsyncComponent } from "vue";
import bus from '@/eventBus';
import api from "@/services/api";
// eslint-disable-next-line 
const ProductReviews = defineAsyncComponent(() => import("./ProductReviews.vue"));
// eslint-disable-next-line 
const ViewOtherProduct = defineAsyncComponent(() => import("./ViewOtherProduct.vue"));
const RecentlyViewed = defineAsyncComponent(() => import('@/components/home/RecentlyViewed.vue'));


export default {
  components: { ProductReviews, ViewOtherProduct, RecentlyViewed },
  data() {
    return {
      loading: true,
      isModalOpen: false,
      product: { review_count: 0, average_rating: 0, variants: [], colors: [] },
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
        size: "Розміри"
      }
    };
  },
  computed: {
    isAvailable() {
      return this.product.variants.some(v => v.is_available);
    },
    selectedVariant() {
      return this.product.variants.find(v => v.size === this.selectedSize) || null;
    },
    formattedCharacteristics() {
      const r = {};
      if (this.product.country_of_manufacture) {
        r[this.translations.country_of_manufacture] = this.product.country_of_manufacture;
      }
      if (this.product.material) {
        r[this.translations.material] = this.product.material;
      }
      if (Array.isArray(this.product.type_of_fitting)) {
        r[this.translations.type_of_fitting] = this.product.type_of_fitting.join(", ") || "Немає";
      }
      if (this.product.type_of_bead) {
        r[this.translations.type_of_bead] = this.product.type_of_bead;
      }
      if (this.product.weight) {
        r[this.translations.weight] = this.product.weight;
      }
      if (this.product.variants.length) {
        r[this.translations.size] = this.product.variants.map(v => v.size).join(", ");
      }
      if (this.product.colors.length) {
        r[this.translations.colors] = this.product.colors.join(", ");
      }
      if (this.product.bead_producer_name) {
        r[this.translations.bead_producer_name] = this.product.bead_producer_name;
      }
      return r;
    }
  },
  methods: {
   formatCurrencyIntl(price, currency) {
  const val = Number(price);
  const validCurrency = currency?.toUpperCase?.() || 'UAH';
  const locale = validCurrency === 'USD' ? 'en-US' : 'uk-UA';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: validCurrency
  }).format(val);
},

   async fetchProduct(id) {
  try {
    const resp = await api.getProduct(id);
    this.product = resp.data;
    this.product.average_rating = resp.data.rating;
    this.product.review_count = resp.data.review_count;

    const first = this.product.variants.find(v => v.is_available);
    if (first) this.selectedSize = first.size;

    this.productId = id;

    // ✅ Додати в localStorage тільки після завантаження продукту
    const productToSave = {
      id: this.product.id,
      name: this.product.name,
      image_url: this.product.image_url,
      price: this.product.price,
      rating: this.product.average_rating,
      review_count: this.product.review_count,
      bead_producer_name: this.product.bead_producer_name
    };

    const history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const exists = history.find(p => p.id === productToSave.id);
    if (!exists) {
      history.unshift(productToSave);
      localStorage.setItem('recentlyViewed', JSON.stringify(history.slice(0, 12)));
    }

 } catch (e) {
        console.error("Product load error:", e);
      } finally {
        this.loading = false;
      }
    },
    async fetchWishlist() {
      try {
        const { data } = await api.getWishlist();
        this.wishlist = (data.products || []).map(p => p.id);
      } catch (e) {
        console.error("Wishlist load error:", e);
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

    // 🔁 ОБОВʼЯЗКОВО онови локальний список після зміни
    await this.fetchWishlist?.(); // якщо є або emit на батька
  } catch (error) {
    console.error('Помилка оновлення списку бажаного:', error);
  }
},
    async addToCart() {
      await api.addToCart({
        product_id: this.product.id,
        quantity: this.quantity,
        size: this.selectedSize
      });
      bus.emit('cart-updated');

    },
    async notifyWhenAvailable() {
  try {
    await api.sendNotification({ product_id: this.productId });
  } catch (error) {
    // нічого не робимо тут — api.js вже показує toast
  }
},
    openModal() { this.isModalOpen = true; },
    closeModal() { this.isModalOpen = false; },
    increaseQuantity() {
      if (this.selectedVariant && this.quantity < this.selectedVariant.quantity) {
        this.quantity++;
      }
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    }
  },
  async created() {
  const id = this.$route.params.id;
  await this.fetchProduct(id);
  await this.fetchWishlist();
},
mounted() {
  document.title = "Сторінка товару";
  




  },
  watch: {
  '$route.params.id': {
    immediate: true,
    handler(newId) {
      if (newId) {
        this.fetchProduct(newId); // або як називається твоя функція
        window.scrollTo({ top: 0, behavior: 'smooth' }); // автоматичний скрол вгору
      }
    }
  }
}

};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
