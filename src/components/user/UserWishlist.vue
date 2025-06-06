<template> 
  <div class="max-w-3xl p-4 sm:p-6 overflow-y-auto h-[90vh] font-sans">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-5">{{ $t('user.wishlistTitle') }}</h2>

    <Loader v-if="loading" class="mx-auto my-16" />

    <div v-else-if="items.length === 0" class="text-center text-lg text-gray-500 dark:text-gray-300 mt-10">
      {{ $t('user.wishlistEmpty') }}
    </div>

    <div v-else class="space-y-6">
      <!-- 🔴 Кнопка "Очистити список" -->
      <div class="flex justify-end mb-4">
        <button
          @click="clearWishlist"
          class="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition"
        >
          {{ $t('user.clearWishlist') }}
        </button>
      </div>

      <!-- 🔁 Список товарів -->
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="relative bg-white dark:bg-[#17223b] border border-gray-200 dark:border-[#303b59] p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col sm:flex-row gap-4 sm:gap-6"
      >
        <router-link
          :to="`/productpage/${item.id}`"
          class="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 no-underline text-gray-900 dark:text-gray-100"
        >
          <span class="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300 w-6 text-center">
            {{ index + 1 }}.
          </span>
          <img
            :src="item.imageSrc"
            alt="Product Image"
            class="w-full sm:w-28 h-48 sm:h-28 object-cover rounded-lg flex-shrink-0"
          />
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2">
              {{ item.title }}
            </h3>
            <p class="text-base font-medium text-gray-600 dark:text-gray-300">
              {{ formatCurrencyIntl(item.price, item.currency) }}
            </p>
          </div>
        </router-link>

        <div class="flex items-center justify-end space-x-2 mt-4 sm:mt-0 sm:absolute sm:top-4 sm:right-4">
          <!-- Якщо є в наявності -->
          <button
            v-if="item.has_available_variant"
            class="flex items-center px-4 py-2 bg-[#6B1F1F] text-white text-sm font-medium rounded-lg hover:bg-[#A01212] transition"
            :disabled="item.loading"
            @click.prevent="addToCart(item)"
          >
            <span v-if="!item.loading">{{ $t('user.buy') }}</span>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </button>

          <!-- Якщо немає в наявності -->
          <button
            v-else
            class="flex items-center px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg cursor-not-allowed"
            disabled
          >
            {{ $t('user.notAvailable') }}
          </button>

          <!-- Кнопка видалення -->
          <button
            class="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            @click.stop="removeItem(index)"
            aria-label="Remove item"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import Loader from '../home/Loader.vue';
import api from '@/services/api';
import bus from '@/eventBus';

export default {
  name: "UserWishlist",
  components: { Loader },
  data() {
    return { items: [], loading: false };
  },
  methods: {
    async fetchWishlist() {
  this.loading = true;
  try {
    const data = await api.getWishlist();
    this.items = data.products.map(item => ({
      id: item.id,
      title: item.name,
      price: item.price,
      currency: item.currency,
      imageSrc: item.image_url || 'default_image_path',
      loading: false,
      is_in_cart: item.is_in_cart,
      has_available_variant: item.is_available, // ← оце ключове
    }));
  } catch (error) {
    console.error("Помилка завантаження списку бажань:", error);
  } finally {
    this.loading = false;
  }
},
async clearWishlist() {
  if (!confirm("Ви впевнені, що хочете очистити список бажаного?")) return;
  try {
    this.loading = true;

    const deletePromises = this.items.map(item =>
      api.deleteWishlistItem(item.id)
    );

    await Promise.all(deletePromises);
    this.items = [];

  } catch (error) {
    console.error("Помилка при очищенні списку бажаного:", error);
  } finally {
    this.loading = false;
  }
},

   async addToCart(item) {
  item.loading = true;
  try {
    const { data } = await api.getProduct(item.id);
    const available = data.variants?.find(v => v.is_available);
    if (!available) return;

    await api.addToCart({
      product_id: item.id,
      quantity: 1,
      size: available.size,
    });

    // Після додавання перевіряємо, чи ще є доступні варіанти
    const refreshed = await api.getProduct(item.id);
    const stillAvailable = refreshed.data.variants?.some(v => v.is_available);
    item.has_available_variant = stillAvailable;

    item.is_in_cart = true;
    bus.emit("cart-updated");

  } catch (error) {
    console.error("Помилка додавання товару до кошика:", error);
  } finally {
    item.loading = false;
  }
},
formatCurrencyIntl(price, currency) {
  const fallbackCurrency = (localStorage.getItem('currency') || 'UAH').toUpperCase();
  const finalCurrency = (currency || fallbackCurrency).toUpperCase();
  const locale = finalCurrency === 'USD' ? 'en-US' : 'uk-UA';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: finalCurrency,
  }).format(Number(price));
},

    async removeItem(index) {
      try {
        const { id } = this.items[index];
        await api.deleteWishlistItem(id);
        this.items.splice(index, 1);
      } catch (error) {
        console.error("Помилка при видаленні товару:", error);
      }
    },
  },
  mounted() {
    this.fetchWishlist();
    document.title = "Список бажаного";
  },
};
</script>
