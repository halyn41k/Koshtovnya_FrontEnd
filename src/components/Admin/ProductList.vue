<template>
  <main class="product-list">
    <!-- Шапка з заголовком та кнопкою "Додати" -->
    <div class="header-container">
      <h1 class="product-list__title">Товари</h1>
      <button class="add-button" @click="openAddModal">
        <img src="@/assets/icons/plus.svg" alt="Add icon" class="add-button__icon" />
        <span class="add-button__text">Додати</span>
      </button>
    </div>

    <!-- Поле пошуку -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <input
          class="search-input"
          type="text"
          placeholder="Пошук"
          v-model="searchQuery"
          @input="handleSearch"
        />
        <img src="@/assets/icons/search.svg" alt="Search icon" class="search-icon" />
      </div>
    </div>

    <!-- Таблиця з товарами -->
    <div class="client-table-container">
      <header class="client-table__header">
        <span class="sortable-header" @click="cycleSort('id')">
          ID
          <img :src="getSortIcon(sortState.id)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('name')">
          Назва
          <img :src="getSortIcon(sortState.name)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('price')">
          Ціна
          <img :src="getSortIcon(sortState.price)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('date')">
          Додано
          <img :src="getSortIcon(sortState.date)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header">Дії</span>
      </header>
      <ul class="client-list__items">
        <li
          v-for="(product, index) in filteredProducts"
          :key="product.id"
          :class="['client-item', { highlighted: product.id === highlightedProductId }]"
        >
          <span class="client-item__id">{{ index + 1 }}</span>
          <span class="client-item__first-name">{{ product.name }}</span>
          <span class="client-item__last-name">{{ product.price }} грн</span>
          <span class="client-item__email">{{ product.dateAdded }}</span>
          <div class="client-item__actions">
            <button class="action-button" @click="openUpdateModal(product)">
              <img src="@/assets/icons/edit.svg" alt="Update icon" class="action-button__icon" />
            </button>
            <button class="action-button" @click="deleteProduct(product.id)">
              <img src="@/assets/icons/delete.svg" alt="Delete icon" class="action-button__icon" />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Пагінація -->
    <div class="pagination-container">
      <button
        class="pagination-arrow"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <img src="@/assets/icons/arrow_left.svg" alt="Arrow Left" class="arrow-icon" />
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="['pagination-button', { active: currentPage === page }]"
      >
        {{ page }}
      </button>
      <button
        class="pagination-arrow"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <img src="@/assets/icons/arrow_right.svg" alt="Arrow Right" class="arrow-icon" />
      </button>
    </div>

    <!-- Компонент модального вікна -->
    <ProductModal
      v-if="showProductModal"
      :key="modalKey"
      :title="modalTitle"
      @close="closeModal"
      @productSubmit="handleProductSubmit"
    />

    <!-- Toast повідомлення -->
    <div v-if="showToast" class="toast">
      <img src="@/assets/icons/success.svg" alt="Success" class="toast-icon" />
      <span class="toast-text">{{ toastMessage }}</span>
    </div>
  </main>
</template>

<script>
import axios from "axios";
import ProductModal from "./ProductModal.vue";

export default {
  name: "ProductList",
  components: {
    ProductModal,
  },
  data() {
    return {
      products: [],
      searchQuery: "",
      showProductModal: false,
      modalTitle: "",
      modalKey: 0,
      // Пагінація
      currentPage: 1,
      totalPages: 1,
      // Стан сортування
      sortState: {
        id: "none",
        name: "none",
        price: "none",
        date: "none",
      },
      // Toast та підсвічування
      showToast: false,
      toastMessage: "",
      highlightedProductId: null,
    };
  },
  computed: {
    filteredProducts() {
      return this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts(page = 1) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://26.235.139.202:8080/api/admin/products", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          params: { page },
        });
        this.products = response.data.data;
        this.totalPages = response.data.meta.last_page || 1;
        this.currentPage = response.data.meta.current_page || 1;
      } catch (error) {
        console.error("Помилка отримання товарів:", error);
      }
    },
    handleSearch() {
      // Перезапит при введенні запиту пошуку
      this.fetchProducts(1);
    },
    async addProduct(productData) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://26.235.139.202:8080/api/admin/product",
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        console.log("Товар додано:", response.data);
        const newProductId = response.data.data.id;
        this.highlightedProductId = newProductId;
        this.fetchProducts();
        this.showToastMessage("Товар створено");
        setTimeout(() => {
          this.highlightedProductId = null;
        }, 3000);
      } catch (error) {
        console.error("Помилка додавання товару:", error);
      }
    },
    async updateProduct(productData) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.patch(
          `http://26.235.139.202:8080/api/admin/product/${productData.id}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        console.log("Товар оновлено:", response.data);
        this.fetchProducts();
      } catch (error) {
        console.error("Помилка оновлення товару:", error);
      }
    },
    deleteProduct(id) {
      const token = localStorage.getItem("token");
      axios
        .delete(`http://26.235.139.202:8080/api/admin/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })
        .then((response) => {
          console.log("Товар видалено:", response.data);
          this.fetchProducts();
        })
        .catch((error) => {
          console.error("Помилка видалення товару:", error);
        });
    },
    openAddModal() {
      this.modalTitle = "Створити товар";
      this.modalKey = Date.now();
      this.showProductModal = true;
    },
    openUpdateModal(product) {
      this.modalTitle = "Оновити дані товару";
      this.modalKey = Date.now();
      this.showProductModal = true;
      // Можна передати дані товару через props, якщо потрібно
    },
    closeModal() {
      this.showProductModal = false;
    },
    handleProductSubmit(productData) {
      if (productData.id) {
        this.updateProduct(productData);
      } else {
        this.addProduct(productData);
      }
      this.closeModal();
    },
    showToastMessage(message) {
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
    goToPage(page) {
      if (page > 0 && page <= this.totalPages) {
        this.fetchProducts(page);
      }
    },
    cycleSort(column) {
      if (this.sortState[column] === "none") {
        this.sortState[column] = "asc";
      } else if (this.sortState[column] === "asc") {
        this.sortState[column] = "desc";
      } else {
        this.sortState[column] = "none";
      }
      console.log(`Сортування для ${column}: ${this.sortState[column]}`);
      // Додатково реалізуйте сортування, якщо потрібно
    },
    getSortIcon(state) {
      if (state === "asc") {
        return require("@/assets/icons/asc.svg");
      } else if (state === "desc") {
        return require("@/assets/icons/desc.svg");
      } else {
        return require("@/assets/icons/none_sorted.svg");
      }
    },
  },
};
</script>

<style scoped>
/* Загальні налаштування */
.product-list {
  max-width: 1200px;
  margin: 0 auto;
  font-family: Montserrat, sans-serif;
  padding: 20px 20px 40px;
  color: #000;
}

/* Шапка */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.product-list__title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.add-button {
  width: 126px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 4px;
  background-color: #6b1f1f;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #fff;
  transition: background-color 0.3s, border 0.3s;
}
.add-button__icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.add-button__text {
  font-size: 14px;
  font-weight: 600;
  font-family: Montserrat, sans-serif;
}
.add-button:hover {
  background-color: #a01212;
}
.add-button:active {
  border: 1px solid #1d1d1d;
}

/* Поле пошуку */
.search-container {
  margin-bottom: 20px;
}
.search-input-wrapper {
  display: flex;
  align-items: center;
  width: 262px;
  height: 30px;
  background-color: #f6e7e7;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid transparent;
  transition: border 0.3s;
}
.search-input-wrapper:focus-within {
  border: 1px solid #1d1d1d;
}
.search-input {
  flex: 1;
  height: 100%;
  padding: 8px 12px;
  border: none;
  background-color: transparent;
  color: #898989;
  font-size: 14px;
  outline: none;
}
.search-icon {
  width: 16px;
  height: 16px;
  margin-right: 12px;
  pointer-events: none;
}

/* Таблиця */
.client-table-container {
  margin-top: 0;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}
.client-table__header {
  display: grid;
  grid-template-columns: 5% 30% 20% 20% 25%;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #F6E7E7;
  font-size: 14px;
  font-weight: 600;
  color: #48484b;
}
.sortable-header {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}
.sort-icon {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  object-fit: contain;
}
.client-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
}
.client-item {
  display: grid;
  grid-template-columns: 5% 30% 20% 20% 25%;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  font-size: 14px;
  color: #000;
  transition: background-color 0.3s;
}
.client-item.highlighted {
  background-color: #E4F2E7 !important;
}
.client-item__actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.action-button {
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  padding: 0;
}
.action-button__icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Пагінація */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin-top: 20px;
  gap: 8px;
}
.pagination-button {
  width: 35px;
  height: 35px;
  border: none;
  background-color: #fff;
  border-radius: 6px;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, background-color 0.3s, box-shadow 0.3s;
}
.pagination-button:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}
.pagination-button.active {
  background-color: #6b1f1f;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.pagination-arrow {
  width: 35px;
  height: 35px;
  border: none;
  background-color: #fff;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, background-color 0.3s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pagination-arrow:hover:not(:disabled) {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}
.pagination-arrow:disabled {
  background-color: #aeaeae;
  cursor: not-allowed;
  box-shadow: none;
}
.arrow-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 300px;
  height: 44px;
  background-color: #E4F2E7;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 2000;
}
.toast-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
.toast-text {
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  color: #000;
}
</style>
