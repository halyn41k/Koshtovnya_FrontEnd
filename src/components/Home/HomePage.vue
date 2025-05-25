<template>
  <div class="container mx-auto mt-[150px] flex flex-col overflow-hidden">
    <!-- Hero Banner -->
    <div
      class="w-full h-[510px] bg-cover bg-center relative mb-6 lg:mb-8"
      :style="{ backgroundImage: `url(${require('@/assets/welcome.png')})` }"
    >
      <!-- Hero Text: центр на мобілці, ліворуч на десктопі -->
      <div class="absolute inset-0 flex flex-col items-center lg:items-start justify-center text-center lg:text-left px-4 lg:px-24 space-y-4">
        <div class="text-white font-kyivtype font-bold text-[32px] lg:text-[45px]">
          {{ $t('home.handmadeProducts') }}
        </div>
        <div class="text-white font-kyivtype font-bold text-[20px] lg:text-[30px]">
          {{ $t('home.exclusiveJewelry') }}
        </div>
        <router-link
          to="/allproducts"
          class="view-products-button mt-4 lg:mt-6"
        >
          {{ $t('home.viewProducts') }}
        </router-link>
      </div>
    </div>

    <!-- Popular & New Arrivals Sections -->
    <section class="px-4 sm:px-6 lg:px-8">
      <PopularProducts :products="visibleProducts" />
    </section>
    <section class="mt-4 px-4 sm:px-6 lg:px-8">
      <NewArrivals :arrivals="visibleNewArrivals" />
    </section>

    <!-- Instagram Embed -->
    <div class="mt-24 px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-8">
        <!-- Text Left on Desktop -->
        <div class="flex-1 text-center lg:text-left">
         <p class="font-montserrat font-semibold text-3xl lg:text-4xl leading-tight">
  {{ $t('home.followInsta') }}<br />
  {{ $t('home.dontMissTheMost') }}
</p>
          <a
  href="https://www.instagram.com/koshtovnya_jewelry/"
  target="_blank"
  class="font-montserrat text-2xl lg:text-3xl underline mt-4 inline-block"
>
  @koshtovnya_jewelry
</a>
        </div>
        <!-- Pattern Image Right on Desktop -->
        <div class="flex-1 flex justify-center lg:justify-end">
          <img
            src="@/assets/instapattern.png"
            alt="Instagram pattern"
            class="w-[300px] sm:w-[400px] lg:w-[680px] h-auto"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div
          v-for="n in 8"
          :key="n"
          class="overflow-hidden rounded-lg"
        >
          <img
            :src="getInstagramImage(n)"
            :alt="`Instagram Image ${n}`"
            class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
      </div>
    </div>

    <TopLatest />

    <!-- Categories -->
    <CategoryProduct class="mt-20 px-4 sm:px-6 lg:px-8" />
  </div>
</template>

<script>
// eslint-disable-next-line 
import PopularProducts from "./PopularProducts.vue";
// eslint-disable-next-line 
import NewArrivals from "./NewArrivals.vue";
// eslint-disable-next-line 
import CategoryProduct from "./CategoryProduct.vue";
import TopLatest from './TopLatest.vue';
import api from '@/services/api';

export default {
  name: 'HomePage',
  components: {
    PopularProducts,
    NewArrivals,
    CategoryProduct,
    TopLatest,
  },
  data() {
    return {
      products: [],
      newArrivals: [],
      visibleProducts: [],
      visibleNewArrivals: [],
      currentPage: 0,
      newArrivalsPage: 0,
      productsPerPage: 3,
      testPopularProducts: [
        { id: 1, name: "Браслет", price: 250, image_url: require('@/assets/testpicture.png'), bead_producer_name: "Чешський бісер" },
        { id: 2, name: "Гердан", price: 450, image_url: require('@/assets/testpicture.png'), bead_producer_name: "Чешський бісер" },
        { id: 3, name: "Сережки", price: 200, image_url: require('@/assets/testpicture.png'), bead_producer_name: "Чешський бісер" },
      ],
      testNewArrivals: [
        { id: 4, name: "Силянка", price: 300, image_url: require('@/assets/testpicture.png'), bead_producer_name: "Чешський бісер" },
        { id: 5, name: "Дукати", price: 550, image_url: require('@/assets/testpicture.png'), bead_producer_name: "Чешський бісер" },
        { id: 6, name: "Пояс", price: 600, image_url: require('@/assets/testpicture.png'), bead_producer_name: "Чешський бісер" },
      ],
    };
  },
  mounted() {
    this.fetchPopularProducts();
    this.fetchNewArrivals();
    this.observeElements();
    document.title = "Головна";
  },
  methods: {
    observeElements() {
      const elements = document.querySelectorAll('.fade-in');
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('show');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      elements.forEach(el => observer.observe(el));
    },

    getInstagramImage(n) {
      try {
        return require(`@/assets/pic${n}.png`);
      } catch (e) {
        console.error('Error loading image', e);
        return '';
      }
    },

    async fetchPopularProducts() {
      try {
        const response = await api.getPopularProducts();
        const items = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        this.products = items.map(product => ({
          ...product,
          name: product.name.trim(),
          image_url: product.image_url.trim(),
        }));
      } catch (error) {
        console.error('Помилка при отриманні популярних товарів:', error);
        this.products = this.testPopularProducts;
      } finally {
        this.updateVisibleProducts();
      }
    },

    async fetchNewArrivals() {
      try {
        const response = await api.getNewArrivals();
        const items = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        this.newArrivals = items;
      } catch (error) {
        console.error('Помилка при отриманні новинок:', error);
        this.newArrivals = this.testNewArrivals;
      } finally {
        this.updateVisibleNewArrivals();
      }
    },

    updateVisibleProducts() {
      const start = this.currentPage * this.productsPerPage;
      const end = start + this.productsPerPage;
      this.visibleProducts = this.products.slice(start, end);
    },

    updateVisibleNewArrivals() {
      const start = this.newArrivalsPage * this.productsPerPage;
      const end = start + this.productsPerPage;
      this.visibleNewArrivals = this.newArrivals.slice(start, end);
    },
  },
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap');
@font-face {
  font-family: 'KyivType';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

.font-kyivtype {
  font-family: 'KyivType', sans-serif;
}

.view-products-button {
  background-color: #6B1F1F;
  padding: 0.75rem 2.5rem; /* matches px-10 py-3 */
  border-radius: 0.5rem;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.view-products-button:hover {
  background-color: #A01212;
}
</style>
