<template>
  <main class="product-list">
    <header class="product-header">
      <div class="header-left">
        <h1 class="product-title">Товари</h1>
        <!-- Тригер для відкриття фільтру -->
        <button class="filter-toggle-button" @click="toggleFilter">
          Фільтр
        </button>
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

    <!-- Оверлей фільтра, який відкривається зліва -->
    <div v-if="showFilter" class="filter-overlay">
      <!-- Компонент фільтру, який ми створили раніше.
           Передаємо метод fetchProducts та очікуємо подію close -->
      <FilterComponent :fetchProducts="fetchProducts" @close="toggleFilter" />
    </div>

    <!-- Основний вміст: список товарів або інший активний компонент -->
    <div v-if="!currentComponent">
      <section class="product-grid">
        <ProductCard 
          v-for="product in filteredProducts" 
          :key="product.id" 
          :product="product"
          @update-product="showUpdateOrders" 
          @delete-product="handleDelete" 
          @restore-product="handleRestore"
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
import FilterComponent from './FilterProduct.vue'; // імпорт компонента фільтра
import axios from 'axios';

export default {
  name: 'ProductList',
  components: {
    ProductCard,
    AddProduct,
    ProductUpdate,
    FilterComponent,
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
      showFilter: false, // прапорець для показу/приховування оверлею фільтра
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
    async handleDelete(productId) {
      const token = localStorage.getItem("token");
      try {
        await axios.delete(`http://26.235.139.202:8080/api/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const product = this.products.find(p => p.id === productId);
        if (product) product.is_deleted = true;
      } catch (error) {
        console.error('Помилка видалення товару:', error.response || error);
      }
    },
    async handleRestore(productId) {
      const token = localStorage.getItem("token");
      try {
        await axios.post(`http://26.235.139.202:8080/api/admin/products/${productId}/restore`, null, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const product = this.products.find(p => p.id === productId);
        if (product) product.is_deleted = false;
      } catch (error) {
        console.error('Помилка відновлення товару:', error.response || error);
      }
    },
    resetComponent() {
      this.currentComponent = null;
      this.currentProps = {};
    },
    showAddProduct() {
      this.currentComponent = 'AddProduct';
    },
    showUpdateOrders(product) {
      this.currentComponent = 'ProductUpdate';
      this.currentProps = { productId: product.id };
    },
    toggleFilter() {
      // Перемикаємо прапорець показу фільтру
      this.showFilter = !this.showFilter;
    }
  },
  created() {
    this.fetchProducts();
  },
};
</script>

<style scoped>
/* Стилі для основного контейнера товарів */
.product-list {
  position: relative;
  padding: 20px;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.product-title {
  margin-right: 20px;
  font-size: 28px;
  font-weight: bold;
}

.filter-toggle-button {
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  background: none;
  border: none;
  color: #6B1F1F;
  cursor: pointer;
  margin-right: 20px;
  padding: 8px 12px;
  transition: background-color 0.3s ease;
}

.filter-toggle-button:hover {
  background-color: #f0f0f0;
}

.search-form {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-button {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 8px;
}

.add-product-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #6b1f1f;
  color: #fff;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  transition: background-color 0.3s ease;
}

.add-product-button:hover {
  background-color: #a01212;
}

/* Стилі для сітки товарів */
.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  margin: 0 5px;
  padding: 8px 12px;
  border: none;
  background-color: #ddd;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination button.active,
.pagination button:hover {
  background-color: #6b1f1f;
  color: #fff;
}

/* Стилі для оверлею фільтра */
.filter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 600px; /* ширина панелі фільтра, змінюйте за потребою */
  height: 100%;
  background-color: #fff7f6;
  z-index: 1000;
  overflow-y: auto;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;
}

/* Анімація відкриття */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

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
.header-right {}
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
