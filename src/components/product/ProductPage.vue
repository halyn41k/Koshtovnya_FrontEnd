<template>
  <main class="mt-40 font-montserrat mx-auto max-w-7xl p-4 space-y-8">
    <!-- PRODUCT SECTION -->
    <section class="flex flex-col lg:flex-row gap-8">
      <!-- IMAGE & ZOOM -->
      <div class="relative lg:w-1/2">
        <img
          loading="lazy"
          :src="product.image_url"
          alt="Фото товару"
          class="w-full h-80 object-cover rounded-md shadow-lg"
        />
        <button
          @click="openModal"
          class="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:bg-gray-100"
        >
          <img src="@/assets/size_change.png" alt="Змінити розмір" class="w-6 h-6" />
        </button>
      </div>

      <!-- INFO CARD -->
      <div class="lg:w-1/2 bg-pink-50 p-6 rounded-2xl shadow-lg flex flex-col space-y-4">
        <!-- TITLE & PRICE -->
        <div class="text-center space-y-2">
          <h1 class="text-2xl font-bold text-gray-900">{{ product.name }}</h1>
          <hr class="border-gray-300 mx-auto w-24" />
          <p class="text-2xl font-semibold text-red-700">{{ product.price }}₴</p>
          <span
            class="inline-block px-4 py-1 rounded-md text-sm text-white"
            :class="isAvailable ? 'bg-green-600' : 'bg-red-700'"
          >{{ isAvailable ? 'В наявності' : 'Немає в наявності' }}</span>
        </div>

        <!-- RATING -->
        <div class="flex items-center justify-center space-x-2">
          <div class="flex space-x-1">
            <template v-for="i in 5" :key="i">
              <span
                class="text-xl not-italic"
                :class="i <= Math.floor(product.average_rating) ? 'text-yellow-400' : 'text-gray-300'"
              >★</span>
            </template>
          </div>
          <span class="text-sm text-gray-600">({{ product.review_count }})</span>
        </div>

        <hr class="border-gray-200" />
        <p class="text-center text-sm text-gray-500">Приблизний час доставки: 1–7 днів</p>

        <!-- SIZE SELECTOR -->
        <div class="space-y-1">
          <label for="size-select" class="block text-base font-medium text-gray-700">Розмір</label>
          <select
            id="size-select"
            v-model="selectedSize"
            class="w-full h-10 bg-pink-100 rounded-md px-3 focus:outline-none"
          >
            <option
              v-for="v in product.variants"
              :key="v.size"
              :value="v.size"
              :disabled="!v.is_available"
            >
              {{ v.size }} см {{ !v.is_available ? '(немає)' : '' }}
            </option>
          </select>
        </div>

        <!-- QUANTITY & ACTIONS -->
        <div class="flex items-center space-x-4 pt-4">
          <div class="flex items-center border border-gray-300 rounded-md">
            <button @click="decreaseQuantity" :disabled="quantity <= 1" class="px-3 disabled:opacity-50">-</button>
            <span class="px-4">{{ quantity }}</span>
            <button
              @click="increaseQuantity"
              :disabled="!selectedVariant || quantity >= selectedVariant.quantity"
              class="px-3 disabled:opacity-50"
            >+</button>
          </div>
          <button
              v-if="isAvailable"
              @click="addToCart"
              :disabled="!selectedVariant"
              class="flex-1 flex items-center justify-center space-x-2 bg-[#6B1F1F] text-white py-2 rounded-lg shadow hover:bg-[#A01212] disabled:opacity-50"
            >
              <span>Купити</span>
              <img src="@/assets/miniarrow.png" alt="" class="w-4 h-3" />
            </button>
            <button
              v-else
              @click="notifyWhenAvailable"
              class="flex-1 bg-red-600 text-white py-2 rounded-lg shadow hover:bg-red-700"
            >
              Повідомити про наявність
            </button>


          <button @click="toggleWishlist(product)" class="p-2">
            <svg
              v-if="wishlist.includes(product.id)"
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-red-600"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3
                   c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3
                   19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
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
        <hr class="flex-grow border-t-2 border-gray-300" />
      <h2 class="mx-4 text-2xl font-bold text-gray-900">Характеристики</h2>
      <hr class="flex-grow border-t-2 border-gray-300" />
      </div>
      <h2 class="md:hidden text-2xl font-bold text-gray-900 text-center mb-4">Характеристики</h2>
      <div class="w-full">
        <div
          v-for="(val, key) in formattedCharacteristics"
          :key="key"
          class="grid grid-cols-2 gap-4 py-2 border-b border-gray-200"
        >
          <dt class="font-medium">{{ key }}</dt>
          <dd class="text-gray-700">{{ val }}</dd>
        </div>
      </div>
    </section>

    <!-- REVIEWS & RELATED -->
    <Suspense>
      <template #default>
        <ProductReviews v-if="productId" :productId="productId" />
      </template>
      <template #fallback>
        <div class="text-center text-gray-500">Завантаження відгуків…</div>
      </template>
    </Suspense>
    <Suspense>
      <template #default>
        <ViewOtherProduct />
      </template>
      <template #fallback>
        <div class="text-center text-gray-500">Завантаження схожих товарів…</div>
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
        alt="Збільшене фото"
        class="max-w-full max-h-full object-contain"
        @click.stop
      />
    </div>
  </main>
</template>

<script>
import { defineAsyncComponent } from "vue";
import api from "@/services/api";

const ProductReviews = defineAsyncComponent(() => import("./ProductReviews.vue"));
const ViewOtherProduct = defineAsyncComponent(() => import("./ViewOtherProduct.vue"));

export default {
  components: { ProductReviews, ViewOtherProduct },
  data() {
    return {
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
    async fetchProduct() {
      try {
        const resp = await api.getProduct(this.productId);
        // resp.data — це { ...fields... }
        this.product = resp.data;
        // присвоїмо рейтинг, кількість відгуків
        this.product.average_rating = resp.data.rating;
        this.product.review_count   = resp.data.review_count;
        const first = this.product.variants.find(v => v.is_available);
        if (first) this.selectedSize = first.size;
      } catch (e) {
        console.error("Product load error:", e);
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
    async toggleWishlist() {
      const id = this.product.id;
      if (this.wishlist.includes(id)) {
        await api.deleteWishlistItem(id);
        this.wishlist = this.wishlist.filter(x => x !== id);
      } else {
        await api.addToWishlist({ product_id: id });
        this.wishlist.push(id);
      }
    },
    async addToCart() {
      await api.addToCart({
        product_id: this.product.id,
        quantity: this.quantity,
        size: this.selectedSize
      });
    },
    async notifyWhenAvailable() {
      await api.sendNotification({ product_id: this.productId });
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
    this.productId = this.$route.params.id;
    await this.fetchProduct();
    await this.fetchWishlist();
  },
  mounted() {
    document.title = "Сторінка товару";
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
