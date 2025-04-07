<template> 
  <main class="product-list">
    <!-- Заголовок та блок дій -->
    <div class="header-container">
      <div class="header-top">
        <h1 class="product-list__title">Товари</h1>
        <!-- Кнопка "Додати" -->
        <div class="controls-right">
          <button class="add-button" @click="openAddModal">
            <img src="@/assets/icons/plus.svg" alt="Add icon" class="add-button__icon" />
            <span class="add-button__text">Додати</span>
          </button>
        </div>
      </div>
      <div class="filter-search-row">
        <!-- Фільтр -->
        <div class="filter-button" @click="openFilter">
          <span class="filter__text">Фільтр</span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/4b09284ab367fa70a05a4a4f59e91721443ad7e8e783dfd2c26fb681ebacd30f?apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="Filter icon"
            class="filter__icon"
          />
        </div>
        <!-- Пошук із фіксованою шириною -->
        <div class="search-container">
          <div class="search-input-wrapper">
            <input
              class="search-input"
              type="text"
              placeholder="Пошук"
              v-model="searchQuery"
              @input="onSearch"
            />
            <img
              src="@/assets/icons/search.svg"
              alt="Search icon"
              class="search-icon"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Оверлей фільтра -->
    <div v-if="showFilter" class="filter-overlay" @click.self="closeFilter">
      <FilterProduct @closeFilter="closeFilter" :fetchProducts="fetchProducts" />
    </div>

    <!-- 1) Якщо товари є -->
    <div v-if="products.length > 0" class="product-cards">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="product-card"
        :class="{ deleted: product.is_deleted }"
      >
        <div class="product-card__header">
          <h2 class="product-card__title">{{ product.name }}</h2>
          <div class="product-card__actions">
            <button class="action-button" @click="openUpdateModal(product)">
              <img
                src="@/assets/icons/edit.svg"
                alt="Edit icon"
                class="action-button__icon"
              />
            </button>
            <button class="action-button" @click="deleteProduct(product.id)">
              <img
                src="@/assets/icons/delete.svg"
                alt="Delete icon"
                class="action-button__icon"
              />
            </button>
          </div>
        </div>
        <div class="product-card__body">
          <div class="product-card__image">
            <img :src="product.image_url" alt="Product image" />
          </div>
          <div class="product-card__details">
            <div class="product-card__price">{{ product.price }} грн</div>
            <div class="product-card__extra">{{ product.bead_producer_name }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2) Якщо товари відсутні і пошук не проводився -->
    <div v-else-if="!searchQuery" class="empty-state">
      Поки що не було додано жодного товару.
    </div>

    <!-- 3) Якщо пошук активний, але товарів не знайдено -->
    <div v-else class="empty-state">
      За запитом «<strong>{{ searchQuery }}</strong>» нічого не знайдено.
    </div>

    <!-- Пагінація -->
    <div class="pagination-container" v-if="meta && meta.links">
      <button
        class="pagination-arrow"
        :disabled="!meta.links[0].url"
        @click="goToPage(meta.links[0].url)"
      >
        &laquo;
      </button>
      <button
        v-for="(link, index) in paginationLinks"
        :key="index"
        class="pagination-button"
        :class="{ active: link.active }"
        @click="goToPage(link.url)"
      >
        {{ link.label }}
      </button>
      <button
        class="pagination-arrow"
        :disabled="!meta.links[meta.links.length - 1].url"
        @click="goToPage(meta.links[meta.links.length - 1].url)"
      >
        &raquo;
      </button>
    </div>

    <!-- Модальні вікна -->
    <AddProductModal
      v-if="showAddModal"
      @close="closeAddModal"
      @product-added="onProductAdded"
    />
    <EditProductModal
      v-if="showEditModal"
      :product="selectedProduct"
      @close="closeEditModal"
      @product-updated="onProductUpdated"
    />
    <DeleteProductModal
      v-if="showDeleteModal"
      :product="selectedProduct"
      @close="closeDeleteModal"
      @product-deleted="onProductDeleted"
    />
  </main>
</template>

<script>
import axios from "axios";
import FilterProduct from "./FilterProduct.vue";
import AddProductModal from "./AddProductModal.vue";
import EditProductModal from "./EditProductModal.vue";
import DeleteProductModal from "./DeleteProductModal.vue";

export default {
  name: "ProductList",
  components: {
    FilterProduct,
    AddProductModal,
    EditProductModal,
    DeleteProductModal,
  },
  data() {
    return {
      products: [],
      searchQuery: "",
      showFilter: false,
      meta: null, // Дані пагінації
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedProduct: null,
    };
  },
  computed: {
    filteredProducts() {
      if (!this.searchQuery) return this.products;
      const query = this.searchQuery.toLowerCase();
      return this.products.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
    },
    paginationLinks() {
      if (this.meta && this.meta.links) {
        return this.meta.links.filter((link) => {
          const label = link.label.trim();
          return label !== "&laquo; Previous" && label !== "Next &raquo;";
        });
      }
      return [];
    },
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    fetchProducts(pageUrl = "http://26.235.139.202:8080/api/admin/products") {
      axios
        .get(pageUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        })
        .then((response) => {
          this.products = response.data.data;
          this.meta = response.data.meta;
        })
        .catch((error) => {
          console.error("Помилка отримання товарів:", error);
        });
    },
    onSearch() {
      console.log("Пошук:", this.searchQuery);
    },
    openFilter() {
      this.showFilter = true;
    },
    closeFilter() {
      this.showFilter = false;
    },
    openAddModal() {
      this.showAddModal = true;
    },
    closeAddModal() {
      this.showAddModal = false;
    },
    openUpdateModal(product) {
      this.selectedProduct = product;
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.selectedProduct = null;
    },
    deleteProduct(id) {
      // Замінюємо пряме видалення відкриттям модального вікна підтвердження
      const product = this.products.find((p) => p.id === id);
      if (product) {
        this.selectedProduct = product;
        this.showDeleteModal = true;
      }
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.selectedProduct = null;
    },
    goToPage(url) {
      if (url) {
        this.fetchProducts(url);
      }
    },
    // Callback після успішного додавання нового товару
    onProductAdded(newProduct) {
      this.products.push(newProduct);
      this.closeAddModal();
    },
    // Callback після успішного редагування товару
    onProductUpdated(updatedProduct) {
      const index = this.products.findIndex((p) => p.id === updatedProduct.id);
      if (index !== -1) {
        this.$set(this.products, index, updatedProduct);
      }
      this.closeEditModal();
    },
    // Callback після успішного видалення товару
    onProductDeleted(deletedProductId) {
      this.products = this.products.filter((p) => p.id !== deletedProductId);
      this.closeDeleteModal();
    },
  },
};
</script>

<style scoped>
.product-list {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  font-family: Montserrat, sans-serif;
  color: #000;
}

/* Заголовок та кнопка "Додати" */
.header-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.product-list__title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

/* Кнопка "Додати" */
.controls-right {
  display: flex;
  align-items: center;
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
}
.add-button:hover {
  background-color: #a01212;
}
.add-button:active {
  border: 1px solid #1d1d1d;
}

/* Рядок для пошуку та фільтра */
.filter-search-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.filter-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.filter-button:hover {
  background-color: #e0e0e0;
}
.filter__text {
  font-size: 14px;
  font-weight: 600;
  color: #48484b;
}
.filter__icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* Фіксована ширина для пошуку */
.search-container {
  width: 250px;
}
.search-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
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
  background: transparent;
  color: #6b1f1f;
  font-size: 14px;
  outline: none;
}
.search-icon {
  width: 16px;
  height: 16px;
  margin-right: 12px;
  pointer-events: none;
}

/* Оверлей для фільтра */
.filter-overlay {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 350px;
  background-color: transparent;
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
}

/* Карточки товарів */
.product-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}
.product-card {
  width: 1092px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 10px;
  background-color: #fff;
}
.product-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.product-card__title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.product-card__actions {
  display: flex;
  gap: 8px;
}
.action-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.action-button__icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.product-card__body {
  display: flex;
  align-items: center;
  gap: 20px;
}
.product-card__image {
  padding: 10px;
}
.product-card__image img {
  width: 104px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
}
.product-card__details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.product-card__price {
  font-size: 16px;
  font-weight: 600;
  color: #6b1f1f;
}
.product-card__extra {
  font-size: 14px;
  color: #48484b;
}

/* Empty state */
.empty-state {
  width: 1124px;
  height: 199px;
  margin: 40px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fafafa;
  text-align: center;
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s, background-color 0.3s, box-shadow 0.3s;
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
</style>
