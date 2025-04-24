<template>
  <div class="main-container">
    <div class="welcome-image fade-in"></div>

    <div class="text-container">
      <div class="handmade-beaded-products fade-in">
        {{ $t('handmadeProducts') }}
      </div>
      <div class="exclusive-necklaces-bracelets-earrings fade-in">
        {{ $t('exclusiveJewelry') }}
      </div>
      <router-link
        to="/allproduct"
        class="view-products-button fade-in"
      >
        {{ $t('viewProducts') }}
      </router-link>
    </div>

    <div class="content-container fade-in">
      <div class="left-image-container fade-in">
        <div class="girl-image fade-in"></div>
        <div class="pattern-image"></div>
      </div>
      <div class="right-text-container fade-in">
        <div class="quote-text fade-in">
          <span class="ukrainian-heritage fade-in">
            {{ $t('quoteText') }}
          </span>
        </div>
        <span class="gnat-khotkevich fade-in">{{ $t('gnatKhotkevich') }}</span>
      </div>
    </div>

    <section>
      <PopularProducts class="fade-in" :products="visibleProducts" />
    </section>

    <section>
      <NewArrivals class="fade-in" :arrivals="visibleNewArrivals" />
    </section>

    <div class="instagram-section fade-in">
      <div class="instagram-text-container fade-in">
        <img src="@/assets/instapattern.png" alt="Instagram pattern" class="insta-pattern-image fade-in" />
        <p class="follow-text">
          {{ $t('followInsta') }}<br />
          {{ $t('dontMissTheMost') }}
        </p>
        <p class="instagram-handle fade-in">
          <a
            href="https://www.instagram.com/koshtovnya_jewelry/"
            class="instagram-handle-link fade-in"
            target="_blank"
            style="text-decoration: none;"
          >
            @koshtovnya_jewelry
          </a>
        </p>
      </div>

      <div class="instagram-grid fade-in">
        <div class="instagram-image" v-for="n in 8" :key="n">
          <img :src="getInstagramImage(n)" :alt="'Instagram Image ' + n" />
        </div>
      </div>
    </div>

    <CategoryProduct class="fade-in" />
  </div>
</template>

<script>
import PopularProducts from "./PopularProducts.vue";
import NewArrivals from "./NewArrivals.vue";
import CategoryProduct from "./CategoryProduct.vue";
import api from '@/services/api';

export default {
  name: 'HomePage',
  components: {
    PopularProducts,
    NewArrivals,
    CategoryProduct,
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
      // Динамічний імпорт зображень
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
@import url('https://fonts.googleapis.com/css2?family=Podkova:wght@400..800&family=Inter:wght@600&display=swap');

@font-face {
  font-family: 'KyivType Titling';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Heavy2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
}

.main-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1920px;
  margin: 0 auto;
  overflow: hidden;
  margin-top: 180px;
}

.welcome-image {
  width: 100%;
  height: 510px;
  background: url(@/assets/welcome.png) no-repeat center;
  background-size: cover;
}

.text-container {
  position: relative;
  margin-top: -450px;
  padding: 100px;
  text-align: left;
}

.handmade-beaded-products,
.exclusive-necklaces-bracelets-earrings {
  color: #F6F8F6;
  font-family: 'KyivType Titling', sans-serif;
  font-weight: 840;
  line-height: 1.2;
  text-align: left;
}

.handmade-beaded-products {
  font-size: 45px;
  margin-top: -50px;
}

.exclusive-necklaces-bracelets-earrings {
  font-size: 30px;
  margin-top: 30px;
}

.button-container {
  margin-top: 550px;
}

.content-container {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  align-items: center;
}

.left-image-container {
  display: flex;
  align-items: center;
}

.girl-image {
  width: 350px;
  height: 450px;
  background: url(@/assets/girl.png) no-repeat left;
  background-size: cover;
  border-radius: 140px;
  margin-left: 200px;
  margin-top: 150px;
  z-index: 1;
}

.pattern-image {
  width: 200px;
  height: 450px;
  background: url(@/assets/patern_ethno.png) no-repeat center;
  background-size: cover;
  opacity: 0.5;
  margin-left: -100px;
  margin-top: 150px;
}

.right-text-container {
  max-width: 600px;
  margin-top: 100px;
  margin-right: 150px;
}

.quote-text {
  text-align: left;
  margin-left: -50px;
}

.ukrainian-heritage {
  font-family: 'Podkova', sans-serif;
  font-size: 28px;
  font-weight: 400;
  line-height: 1.3;
  color: #000;
}

.gnat-khotkevich {
  font-family: 'Podkova', sans-serif;
  font-size: 30px;
  font-weight: 700;
  margin-top: 20px;
  color: #000;
  margin-left: 350px;
}

.view-products-button {
  display: inline-block;        /* Ensures margin/padding work nicely */
  margin-top: 50px;             /* Increase or decrease to move down */
  text-decoration: none;        /* Removes the hyperlink underline */
  font-family: 'Merriweather', sans-serif;
  color: #fff;
  background-color: #6B1F1F;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.view-products-button:hover {
  background-color: #a01212;
  text-decoration: none; /* Keep it off on hover as well */
}


.view-products-button:hover {
  background-color: #a01212;
}

.instagram-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 100px;
  margin-left: 150px;
}

.instagram-text-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 20px;
}

.follow-text {
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  font-size: 30px;
  gap: 10px;
}

.instagram-handle {
  font-family: 'Montserrat', sans-serif;
  font-size: 25px;
  color: #000;
  margin-top: -20px;
}

.insta-pattern-image {
  width: 680px;
  height: 90px;
  margin-left: 560px;
  margin-bottom: -130px;
}

.instagram-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: flex-start;
}

.instagram-handle-link {
  font-size: 25px;
  font-family: 'Montserrat', sans-serif;
  color: black;
  position: relative;
  cursor: pointer;
  transition: color 0.3s ease;
}

.instagram-handle-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  height: 2px;
  width: 0;
  background-color: #333;
  transition: width 0.3s ease;
}

.instagram-handle-link:hover::after {
  width: 100%;
}

.instagram-handle-link:hover {
  color: #333;
}

.instagram-image {
  width: 300px;
  height: 300px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.instagram-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.instagram-image:hover img {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}


@media (max-width: 991px) {
  .product-row {
    flex-direction: column;
  }

  .product-column {
    width: 100%;
  }

  .product-card {
    margin-top: 15px;
  }
}

.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.fade-in.show {
  opacity: 1;
  transform: translateY(0);
}
</style>