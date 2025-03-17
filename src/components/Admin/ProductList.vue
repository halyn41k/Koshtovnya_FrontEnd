<template>  
  <main class="product-list">
    <header class="product-header">
      <div class="header-left">
        <h1 class="product-title">Товари</h1>
        <form class="search-form" @submit.prevent="handleSearch">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Пошук" 
            class="search-input" 
          />
          <button type="submit" class="search-button">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/d5c4873b11c69bccf0067abe1ce038edad573eb5f56d874777e45978e309d1df?apiKey=c3e46d0a629546c7a48302a5db3297d5" 
              alt="Search icon" 
              class="search-icon" 
            />
          </button>
        </form>
      </div>
      <div class="header-right">
        <button class="add-product-button" @click="showAddProduct">
          <img 
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/b16e6ab49c38393f90f82fabc8bc836adcc3b48eb08a452c5ccea5d5a207d0ea?apiKey=c3e46d0a629546c7a48302a5db3297d5" 
            alt="Add icon" 
            class="add-icon" 
          />
          <span>Додати</span>
        </button>
      </div>
    </header>

    <!-- Якщо currentComponent не встановлено, показуємо список товарів із пагінацією -->
    <div v-if="!currentComponent">
      <section class="product-grid">
        <ProductCard 
          v-for="product in filteredProducts" 
          :key="product.id" 
          :product="product"
          @update-product="showUpdateOrders" 
          @delete-product="handleDelete" 
        />
      </section>
      <div class="pagination" v-if="totalPages > 1">
        <button 
          v-for="page in totalPages" 
          :key="page" 
          @click="changePage(page)"
          :class="{ active: currentPage === page }"
        >
          {{ page }}
        </button>
      </div>
    </div>

    <!-- Якщо currentComponent встановлено, замінюємо список товарів -->
    <div v-else>
      <component 
        :is="currentComponent" 
        v-bind="currentProps" 
        @close="resetComponent" 
      />
    </div>
  </main>
</template>

<script>
import ProductCard from './ProductCard.vue';
import AddProduct from './AddProduct.vue';
import ProductUpdate from './ProductUpdate.vue';
import axios from 'axios';

export default {
  name: 'ProductList',
  components: {
    ProductCard,
    AddProduct,
    ProductUpdate,
  },
  data() {
    return {
      searchQuery: '',
      products: [],
      currentPage: 1,
      totalPages: 1,
      filters: {},
      currentComponent: null,
      currentProps: {},
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
      const token = localStorage.getItem("token");
      const params = { page, ...this.filters };
      try {
        const response = await axios.get('http://26.235.139.202:8080/api/admin/products', {
          params,
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Відповідь сервера:', response.data);
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
      // Замінюємо список товарів компонентом AddProduct
      this.currentComponent = 'AddProduct';
    },
    showUpdateOrders(product) {
  this.currentComponent = 'ProductUpdate';
  this.currentProps = { productId: product.id };
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

/* Header */
.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.product-title {
  font-family: Montserrat, sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #000;
  margin: 0;
}
.search-form {
  display: flex;
  align-items: center;
  background-color: #F1E9E9;
  border-radius: 8px;
  padding: 8px 10px;
  border: 1px solid transparent;
}
.search-input {
  border: none;
  background: transparent;
  font-family: Montserrat, sans-serif;
  font-size: 17px;
  color: #000;
  outline: none;
}
.search-button {
  background: none;
  border: none;
  cursor: pointer;
}
.search-icon {
  width: 30px;
  height: 30px;
}
.header-right {
  /* Кнопка "Додати" розташована праворуч */
}
.add-product-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #C4AEAC;
  border: none;
  border-radius: 13px;
  padding: 10px 16px;
  cursor: pointer;
  font-family: Montserrat, sans-serif;
  font-size: 15px;
  color: #fff;
  transition: background-color 0.3s ease;
}
.add-product-button:hover {
  background-color: #b19694;
}
.add-icon {
  width: 36px;
  height: 36px;
}

/* Product grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}
.pagination button {
  padding: 5px 10px;
  border: 2px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  border-radius: 6px;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .product-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .search-form {
    width: 100%;
  }
  .add-product-button {
    align-self: flex-end;
  }
}
</style>
