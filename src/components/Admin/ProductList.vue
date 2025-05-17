<template> 
  <main class="w-full p-4 space-y-6 relative">
    <!-- Заголовок та кнопки -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-gray-800">Товари</h1>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white px-4 py-2 rounded text-sm transition"
      >
        <img src="@/assets/icons/plus.svg" alt="Add" class="w-5 h-5" />
        <span>Додати</span>
      </button>
    </div>

    <!-- Панель управління: Фільтр + Пошук -->
    <div class="flex items-center gap-2 mt-3">
      <button
        @click="openFilter"
        class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-200 transition"
      >
        <span class="text-sm font-semibold text-gray-700">Фільтр</span>
        <img src="@/assets/icons/filter.svg" alt="Filter icon" class="w-4 h-4" />
      </button>
      <div class="w-64 ml-auto">
        <div
          class="flex items-center h-8 bg-red-50 rounded-md border border-transparent focus-within:border-black transition overflow-hidden"
        >
          <input
            v-model="searchQuery"
            @input="onSearch"
            type="text"
            placeholder="Пошук"
            class="flex-1 px-3 py-1 bg-transparent outline-none text-red-900 text-sm"
          />
          <img src="@/assets/icons/search.svg" alt="Search icon" class="w-4 h-4 mr-3 pointer-events-none" />
        </div>
      </div>
    </div>

    <FilterProduct
      v-if="showFilter"
      class="fixed top-0 left-0 bottom-0 z-[9999]"
      :initialFilters="currentFilters"
      @applyFilters="applyFilters"
      @closeFilter="closeFilter"
    />

    <div v-if="products.length" class="space-y-5 mt-5">
      <div
        v-for="product in products"
        :key="product.id"
        :class="[
          'border border-[#E0E0E0] rounded-lg p-3 bg-white',
          product.is_deleted ? 'opacity-50' : ''
        ]"
      >
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-bold">{{ product.name }}</h2>
          <div class="flex gap-3">
  <button
    v-if="!product.is_deleted"
    @click="openUpdateModal(product)"
    class="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
    aria-label="Редагувати"
  >
    <img src="@/assets/icons/edit.svg" alt="Edit" class="w-7 h-7 sm:w-8 sm:h-8" />

  </button>
  <button
    v-if="!product.is_deleted"
    @click="deleteProduct(product.id)"
    class="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
    aria-label="Видалити"
  >
    <img src="@/assets/icons/delete.svg" alt="Delete" class="w-7 h-7 sm:w-8 sm:h-8" />
  </button>
  <button
    v-if="product.is_deleted"
    @click="restoreProduct(product.id)"
    class="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
    aria-label="Відновити"
  >
    <img src="@/assets/icons/restore.svg" alt="Restore" class="w-7 h-7 sm:w-8 sm:h-8" />
  </button>
</div>

        </div>
        <div class="flex items-center gap-5">
          <div class="p-2">
            <img :src="product.image_url" alt="Product image" class="w-26 h-14 object-cover rounded-md" />
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-base font-semibold text-red-900">{{ product.price }} грн</div>
            <div class="text-sm text-gray-700">{{ product.bead_producer_name }}</div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!searchQuery"
      class="flex items-center justify-center border border-[#E0E0E0] bg-gray-50 rounded-lg mt-10 h-48 font-semibold text-sm"
    >
      Поки що не було додано жодного товару.
    </div>
    <div
      v-else
      class="flex items-center justify-center border border-[#E0E0E0] bg-gray-50 rounded-lg mt-10 h-48 font-semibold text-sm"
    >
      За запитом «<strong>{{ searchQuery }}</strong>» нічого не знайдено.
    </div>

<div v-if="meta && paginationLinks().length" class="flex justify-center items-center gap-2 mt-5 h-12">
  <!-- Стрілка вліво -->
  <button
    @click="changePage(meta.current_page - 1)"
    :disabled="meta.current_page === 1"
    class="w-9 h-9 rounded-md text-sm shadow bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed transition"
  >
    &lt;
  </button>

  <!-- Номери сторінок -->
  <button
    v-for="(link, index) in paginationLinks()"
    :key="index"
    @click="changePage(link.page)"
    :class="[
      'w-9 h-9 rounded-md text-sm shadow transition',
      link.active
        ? 'bg-[#6B1F1F] text-white shadow-lg'
        : 'bg-white text-gray-700 hover:bg-gray-100'
    ]"
  >
    {{ link.label }}
  </button>

  <!-- Стрілка вправо -->
  <button
    @click="changePage(meta.current_page + 1)"
    :disabled="meta.current_page === meta.last_page"
    class="w-9 h-9 rounded-md text-sm shadow bg-white hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed transition"
  >
    &gt;
  </button>
</div>


    <AddProductModal v-if="showAddModal" @close="closeAddModal" @product-added="onProductAdded" />
    <EditProductModal v-if="showEditModal" :product="selectedProduct" @close="closeEditModal" @product-updated="onProductUpdated" />
    <DeleteProductModal v-if="showDeleteModal" :product="selectedProduct" @close="closeDeleteModal" @product-deleted="onProductDeleted" />
  </main>
</template>

<script>
import axios from 'axios'
import FilterProduct from './FilterProduct.vue'
import AddProductModal from './AddProductModal.vue'
import EditProductModal from './EditProductModal.vue'
import DeleteProductModal from './DeleteProductModal.vue'

export default {
  name: 'ProductList',
  components: {
    FilterProduct,
    AddProductModal,
    EditProductModal,
    DeleteProductModal
  },
  data() {
    return {
      products: [],
      searchQuery: '',
      meta: null,
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      selectedProduct: null,
      showFilter: false,
      currentFilters: {}
    }
  },
 
  methods: {
    goToPage(url) {
      if (!url || this.searchQuery.trim()) return;
      this.fetchProducts(url);
    },
    fetchProducts(url = null, page = 1) {
  const endpoint = url || 'https://koshtovnya.api-dev.bmax-edu.website/api/admin/products'
  const params = new URLSearchParams()

  Object.entries(this.currentFilters).forEach(([key, val]) => {
    Array.isArray(val)
      ? val.forEach(v => params.append(key, v))
      : params.append(key, val)
  })

  if (this.searchQuery.trim()) {
    params.append('search', this.searchQuery.trim())
  }

  params.append('page', page)

  const fullUrl = `${endpoint}?${params.toString()}`

  axios.get(fullUrl, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
    .then(response => {
      this.products = response.data.data || []
      this.meta = this.searchQuery.trim() ? null : (response.data.meta || null)
    })
    .catch(error => {
      console.error('❌ Помилка завантаження товарів:', error)
      this.products = []
      this.meta = null
    })
},
changePage(page) {
  if (page < 1 || page > this.meta.last_page) return
  this.fetchProducts(null, page)
},

    onSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        if (this.searchQuery.trim()) {
          this.fetchSearchedProducts(this.searchQuery)
        } else {
          this.fetchProducts()
        }
      }, 400);
    },
    fetchSearchedProducts(query) {
      const search = query.trim();
      if (!search) return this.fetchProducts();
      axios.get(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/products/search/${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(response => {
this.products = (response.data.data || []).sort((a, b) => b.id - a.id);
        this.meta = null;
      })
      .catch(error => {
        console.error('❌ Помилка пошуку товарів:', error);
        this.products = [];
        this.meta = null;
      });
    },
    paginationLinks() {
  if (!this.meta || this.meta.last_page <= 1) return []
  return Array.from({ length: this.meta.last_page }, (_, i) => ({
    label: (i + 1).toString(),
    page: i + 1,
    active: this.meta.current_page === i + 1
  }))
},
    restoreProduct(id) {
      axios.post(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/products/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then(() => {
        this.fetchProducts();
      })
      .catch(err => {
        console.error('❌ Помилка відновлення товару:', err);
      });
    },
    openFilter() { this.showFilter = true },
    closeFilter() { this.showFilter = false },
    applyFilters(filters) {
      this.currentFilters = filters;
      this.fetchProducts();
      this.closeFilter();
    },
    openAddModal() { this.showAddModal = true },
    closeAddModal() { this.showAddModal = false },
    openUpdateModal(p) { this.selectedProduct = p; this.showEditModal = true },
    closeEditModal() { this.showEditModal = false; this.selectedProduct = null },
    deleteProduct(id) { this.selectedProduct = this.products.find(p => p.id === id); this.showDeleteModal = true },
    closeDeleteModal() { this.showDeleteModal = false; this.selectedProduct = null },
    onProductAdded(p) { this.products.unshift(p); this.closeAddModal() },
    onProductUpdated(u) {
      const i = this.products.findIndex(p => p.id === u.id);
      if (i !== -1) this.products[i] = u;
      this.closeEditModal();
    },
    onProductDeleted(id) {
      this.products = this.products.filter(p => p.id !== id);
      this.closeDeleteModal();
    },
  },
  mounted() {
    this.fetchProducts();
    document.title = 'Товари';
  }
}
</script>
