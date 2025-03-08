<template>
  <main class="product-list">
    <header class="product-header">
      <div class="product-title-container">
        <h1 class="product-title">Товари</h1>
        <div class="filter-container">
          <span class="filter-text">Фільтр</span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/4b09284ab367fa70a05a4a4f59e91721443ad7e8e783dfd2c26fb681ebacd30f?apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="Filter icon" class="filter-icon" />
        </div>
        <form class="search-form" @submit.prevent="handleSearch">
          <label for="searchInput" class="visually-hidden">Пошук</label>
          <input type="text" v-model="searchQuery" id="searchInput" class="search-input" placeholder="Пошук" />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/d5c4873b11c69bccf0067abe1ce038edad573eb5f56d874777e45978e309d1df?apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="Search icon" class="search-icon" />
        </form>
      </div>
      <button class="add-product-button" @click="showAddProduct">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/b16e6ab49c38393f90f82fabc8bc836adcc3b48eb08a452c5ccea5d5a207d0ea?apiKey=c3e46d0a629546c7a48302a5db3297d5"
          alt="Add icon" class="add-icon" />
        <span>Додати</span>
      </button>
    </header>

    <section v-if="!currentComponent" class="product-grid">
      <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product"
        @update-product="showUpdateOrders" @delete-product="handleDelete" />
    </section>
    <p v-else-if="!products.length">Товари не знайдено.</p>

    <!-- Динамічний рендер компонентів -->
    <component v-if="currentComponent" :is="currentComponent" v-bind="currentProps" @close="resetComponent" />

    <div class="pagination" v-if="totalPages > 1">
      <button v-for="page in totalPages" :key="page" @click="changePage(page)"
        :class="{ active: currentPage === page }">
        {{ page }}
      </button>
    </div>
  </main>
</template>

<script>
import ProductCard from './ProductCard.vue';
import AddProduct from './AddProduct.vue';
import UpdateOrders from './UpdateOrders.vue';
import axios from 'axios';

export default {
  name: 'ProductList',
  components: {
    ProductCard,
    AddProduct,
    UpdateOrders,
  },
  data() {
    return {
      searchQuery: '',
      products: [],
      currentPage: 1,
      totalPages: 1,
      filters: {},
      currentComponent: null, // Поточний компонент для відображення
      currentProps: {}, // Пропси для компонента
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  methods: {


    async fetchProducts(page = 1) {
      const params = { page, ...this.filters };
      try {
        const response = await axios.get(
          'http://26.235.139.202:8080/api/products',
          { params }
        );
        this.products = response.data.data || [];
        this.totalPages = response.data.meta.last_page || 1;
        this.currentPage = response.data.meta.current_page || 1;
      } catch (error) {
        console.error('Помилка запиту продуктів:', error.response || error);
      }
    },
    changePage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.fetchProducts(page);
      }
    },
    handleSearch() {
      this.fetchProducts(1);
    },
    handleDelete(productId) {
      this.products = this.products.filter(product => product.id !== productId);
    },
    resetComponent() {
      this.currentComponent = null;
      this.currentProps = {};
    },
    showAddProduct() {
      this.currentComponent = 'AddProduct';
    },
    showUpdateOrders(product) {
      this.currentComponent = 'UpdateOrders';
      this.currentProps = { product }; // Передача даних продукту
    },
  },
  created() {
    this.fetchProducts();
  },
};
</script>



<style scoped>
.product-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.product-title-container {
  flex: 1;
}

.product-title {
  font-family: Montserrat, sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #000;
  margin-bottom: 16px;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  align-items: center;
  background-color: #F1E9E9;
  border-radius: 8px;
  padding: 8px 20px;
  border: 1px solid transparent;
  width: 400px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: Montserrat, sans-serif;
  font-size: 17px;
  color: #000;
  outline: none;
}

.search-icon {
  width: 30px;
  height: 30px;
  margin-left: 8px;
}

.add-product-button {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #C4AEAC;
  border: none;
  border-radius: 13px;
  padding: 12px 18px;
  cursor: pointer;
  font-family: Montserrat, sans-serif;
  font-size: 15px;
  color: #000;
  width: 150px;
  height: 45px;
  margin-right: 440px;
  margin-top: 155px;
}

.filter-text {
  font-size: 25px;
}

.add-icon {
  width: 36px;
  height: 36px;
}

.product-grid {
  margin-top: -100px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
}

.visually-hidden {
  position: absolute;
  width: 30px;
  height: 100px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 991px) {
  .product-header {
    flex-direction: column;
  }

  .add-product-button {
    margin-top: 24px;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 767px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}


.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pagination button {
  padding: 5px 10px;
  border: 2px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  border-radius: 6px;
  margin-top: 20px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  transition: all 0.3s ease;
}

.pagination button:hover {
  background-color: #6b1f1f;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.pagination button.active {
  background-color: #6b1f1f;
  color: white;
}
</style>