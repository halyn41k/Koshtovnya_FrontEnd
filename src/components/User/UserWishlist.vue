<template>
  <div class="max-w-3xl p-5 overflow-y-auto h-[90vh] font-sans">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Список бажань</h2>

    <!-- Loader while loading -->
    <Loader v-if="loading" class="mx-auto my-10" />

    <!-- Empty state -->
    <div v-else-if="items.length === 0" class="text-center text-lg text-gray-500 mt-8">
      Ваш список бажань порожній :(
    </div>

    <!-- Wishlist items -->
    <div v-else class="space-y-6 overflow-y-auto h-[70vh] pr-4">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="relative bg-gray-100 p-5 rounded-2xl transform transition hover:scale-[1.02]"
      >
        <router-link
          :to="`/productpage/${item.id}`"
          class="flex items-center gap-4 no-underline text-gray-900"
        >
          <span class="text-xl font-semibold">{{ index + 1 }}.</span>
          <img
            :src="item.imageSrc"
            alt="Product Image"
            class="w-24 h-24 object-cover rounded-lg"
          />
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-800">{{ item.title }}</h3>
            <p class="text-sm text-gray-600">{{ item.price }}₴</p>
          </div>
        </router-link>

        <!-- Add to cart button -->
        <button
          class="absolute bottom-2 right-2 px-3 py-1 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] transition text-sm"
          :disabled="item.loading"
          @click.prevent="addToCart(item)"
        >
          {{ item.loading ? "..." : "Купити" }}
        </button>

        <!-- Remove button -->
        <button
          class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-[#6B1F1F] text-white rounded-sm hover:bg-[#A01212] transition text-xs"
          @click.stop="removeItem(index)"
          aria-label="Remove item"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Loader from '../home/Loader.vue';

export default {
  name: "UserWishlist",
  components: { Loader },
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
        const response = await axios.get(
          "https://koshtovnya.api-dev.bmax-edu.website/api/wishlist",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.items = response.data.products.map(item => ({
          id: item.id,
          title: item.name,
          price: item.price,
          imageSrc: item.image_url || "default_image_path",
          loading: false,
        }));
      } catch (error) {
        console.error("Помилка завантаження списку бажань:", error);
        alert("Не вдалося завантажити ваш список бажаного.");
      } finally {
        this.loading = false;
      }
    },
    async addToCart(item) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Будь ласка, увійдіть у свій обліковий запис.');
        this.$router.push('/login');
        return;
      }

      item.loading = true;
      try {
        const cartData = { product_id: item.id, quantity: 1 };
        const response = await axios.post(
          'https://koshtovnya.api-dev.bmax-edu.website/api/cart',
          cartData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.message === 'Product added to cart') {
          alert('Товар успішно додано до кошика.');
        } else {
          console.error('Товар не був доданий:', response.data);
          alert('Не вдалося додати товар до кошика.');
        }
      } catch (error) {
        console.error('Помилка додавання товару до кошика:', error);
        alert('Не вдалося додати товар до кошика.');
      } finally {
        item.loading = false;
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
        const response = await axios.delete(
          `https://koshtovnya.api-dev.bmax-edu.website/api/wishlist/${itemId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.status === 200) {
          this.items.splice(index, 1);
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
