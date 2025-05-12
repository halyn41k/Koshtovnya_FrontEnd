<template> 
  <div class="max-w-3xl p-4 sm:p-6 overflow-y-auto h-[90vh] font-sans">
    <h2 class="text-2xl font-bold text-gray-800 mb-5">Список бажаного</h2>

    <Loader v-if="loading" class="mx-auto my-16" />

    <div v-else-if="items.length === 0" class="text-center text-lg text-gray-500 mt-10">
      Ваш список бажаного порожній :(  
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="relative bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col sm:flex-row gap-4 sm:gap-6"
      >
        <router-link
          :to="`/productpage/${item.id}`"
          class="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 no-underline text-gray-900"
        >
          <span class="text-lg sm:text-xl font-semibold text-gray-600 w-6 text-center">{{ index + 1 }}.</span>
          <img
            :src="item.imageSrc"
            alt="Product Image"
            class="w-full sm:w-28 h-48 sm:h-28 object-cover rounded-lg flex-shrink-0"
          />
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">{{ item.title }}</h3>
            <p class="text-base font-medium text-gray-600">{{ item.price }}₴</p>
          </div>
        </router-link>

        <div class="flex items-center justify-end space-x-2 mt-4 sm:mt-0 sm:absolute sm:top-4 sm:right-4">
         <!-- Якщо є в наявності -->
<!-- Якщо є в наявності -->
<button
  v-if="item.has_available_variant"
  class="flex items-center px-4 py-2 bg-[#6B1F1F] text-white text-sm font-medium rounded-lg hover:bg-[#A01212] transition"
  :disabled="item.loading"
  @click.prevent="addToCart(item)"
>
  <span v-if="!item.loading">Купити</span>
  <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
  </svg>
</button>

<!-- Якщо немає в наявності -->
<button
  v-else
  class="flex items-center px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg cursor-not-allowed"
  disabled
>
  Немає в наявності
</button>


          <button
            class="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
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
  imageSrc: item.image_url || 'default_image_path',
  loading: false,
  is_in_cart: item.is_in_cart,
  has_available_variant: (item.variants || []).some(v => v.is_available) // ← перевірка
}));

      } catch (error) {
        console.error("Помилка завантаження списку бажань:", error);
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
