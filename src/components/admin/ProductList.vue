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

    <!-- FilterComponent як модальне вікно -->
    <FilterProduct
      v-if="showFilter"
      class="fixed top-0 left-0 bottom-0 z-[9999]"
      :initialFilters="currentFilters"
      @applyFilters="applyFilters"
      @closeFilter="closeFilter"
    />

    <!-- Список товарів -->
    <div v-if="filteredProducts.length" class="space-y-5 mt-5">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        :class="[
          'border border-[#E0E0E0] rounded-lg p-3 bg-white',
          product.is_deleted ? 'opacity-50' : ''
        ]"
      >
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-bold">{{ product.name }}</h2>
          <div class="flex gap-2">
            <button @click="openUpdateModal(product)" class="p-1">
              <img src="@/assets/icons/edit.svg" alt="Edit" class="w-6 h-6" />
            </button>
            <button @click="deleteProduct(product.id)" class="p-1">
              <img src="@/assets/icons/delete.svg" alt="Delete" class="w-6 h-6" />
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

    <!-- Empty states -->
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

    <!-- Пагінація -->
    <!-- Пагінація -->
<div v-if="meta && paginationLinks().length" class="flex justify-center items-center gap-2 mt-5 h-12">
  <!-- Ліва стрілка -->
  <button
    @click="goToPage(meta.links.find(l => l.label.includes('Previous'))?.url)"
    :disabled="!meta.links.find(l => l.label.includes('Previous'))?.url"
    class="w-9 h-9 rounded-md bg-white shadow hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed"
  >
    ←
  </button>

  <!-- Номери сторінок -->
  <button
   v-for="(link, index) in paginationLinks()"

    :key="index"
    @click="goToPage(link.url)"
    :class="[
      'w-9 h-9 rounded-md text-sm shadow transition',
      link.active ? 'bg-red-900 text-white shadow-lg' : 'bg-white hover:bg-gray-100'
    ]"
    v-html="link.label"
  ></button>

  <!-- Права стрілка -->
  <button
    @click="goToPage(meta.links.find(l => l.label.includes('Next'))?.url)"
    :disabled="!meta.links.find(l => l.label.includes('Next'))?.url"
    class="w-9 h-9 rounded-md bg-white shadow hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed"
  >
    →
  </button>
</div>


    <!-- Модальні вікна Додати/Редагувати/Видалити -->
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
  computed: {
    filteredProducts() {
  if (this.meta) {
    return this.products
  }

  const q = this.searchQuery.toLowerCase().trim()
  if (!q) return this.products

  return this.products.filter(p => p.name.toLowerCase().includes(q))
}


  },
  methods: {
    goToPage(url) {
  if (!url) return

  // Якщо є активний пошук — нічого не робимо
  if (this.searchQuery.trim()) return

  this.fetchProducts(url)
},

   fetchProducts(url = null) {
  const endpoint = url || 'https://koshtovnya.api-dev.bmax-edu.website/api/admin/products'
  const params = new URLSearchParams()

  // додай фільтри
  Object.entries(this.currentFilters).forEach(([key, val]) => {
    Array.isArray(val)
      ? val.forEach(v => params.append(key, v))
      : params.append(key, val)
  })

  // додай пошук
  if (this.searchQuery.trim()) {
    params.append('search', this.searchQuery.trim())
  }

  const fullUrl = `${endpoint}?${params.toString()}`

  axios.get(fullUrl, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
    .then(response => {
      this.products = response.data.data || []
      this.meta = response.data.meta || null
    })
    .catch(error => {
      console.error('❌ Помилка завантаження товарів:', error)
      this.products = []
      this.meta = null
    })
},
    onSearch() {
  clearTimeout(this.searchTimeout)
  this.searchTimeout = setTimeout(() => {
    if (this.searchQuery.trim()) {
      this.fetchSearchedProducts(this.searchQuery)
    } else {
      this.fetchProducts()
    }
  }, 400)
},
fetchAllProducts() {
  this.fetchProducts(); // Просто виклик без .then()
},

fetchSearchedProducts(query) {
  const search = query.trim()
  if (!search) {
    this.fetchProducts() // повертає всі товари + пагінацію
    return
  }

  axios.get(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/products/search/${encodeURIComponent(search)}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
    .then(response => {
      this.products = response.data.data || []
      this.meta = null // видаляє пагінацію для пошуку
    })
    .catch(error => {
      console.error('❌ Помилка пошуку товарів:', error)
      this.products = []
      this.meta = null
    })
},

    openFilter() { this.showFilter = true },
    closeFilter() { this.showFilter = false },
    applyFilters(filters) {
  this.currentFilters = filters
  this.fetchProducts()
  this.closeFilter()
},
paginationLinks() {
  if (!this.meta || !this.meta.links) return []
  return this.meta.links.filter(link => !link.label.includes('Previous') && !link.label.includes('Next'))
},

    openAddModal() { this.showAddModal = true },
    closeAddModal() { this.showAddModal = false },
    openUpdateModal(p) { this.selectedProduct = p; this.showEditModal = true },
    closeEditModal() { this.showEditModal = false; this.selectedProduct = null },
    deleteProduct(id) { this.selectedProduct = this.products.find(p => p.id === id); this.showDeleteModal = true },
    closeDeleteModal() { this.showDeleteModal = false; this.selectedProduct = null },
    onProductAdded(p) { this.products.unshift(p); this.closeAddModal() },
    onProductUpdated(u) {
      const i = this.products.findIndex(p => p.id === u.id)
if (i !== -1) this.products[i] = u
this.closeEditModal()

    },
    onProductDeleted(id) {
      this.products = this.products.filter(p => p.id !== id)
      this.closeDeleteModal()
    },
    
  },
  mounted() {
    this.fetchAllProducts(); 
    document.title = 'Товари'
  }
}
</script>
