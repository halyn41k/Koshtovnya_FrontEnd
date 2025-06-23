<template>
  <main class="w-full p-4 space-y-6 relative">
    <!-- Заголовок та кнопка -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">{{ $t('admin.products.title') }}</h1>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white px-4 py-2 rounded text-sm transition"
      >
        <img src="@/assets/icons/plus.svg" alt="Add" class="w-5 h-5" />
        <span>{{ $t('admin.products.add') }}</span>
      </button>
    </div>

    <!-- Фільтр і пошук -->
    <div class="flex items-center gap-2 mt-3">
      <button
        @click="openFilter"
        class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-[#333] transition"
      >
        <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ $t('admin.products.filter') }}</span>
        <img src="@/assets/icons/filter.svg" alt="Filter icon" class="w-4 h-4 dark:invert" />
      </button>

      <!-- Активні теги -->
      <div v-if="activeTags.length" class="flex flex-wrap gap-2 mt-4">
        <button
          v-for="tag in activeTags"
          :key="tag.key + tag.value"
          @click="removeTag(tag)"
          class="px-3 py-1 bg-gray-200 dark:bg-[#333] rounded-full flex items-center space-x-1 text-sm text-black dark:text-white"
        >
          <span>{{ tag.label }}</span>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <button
          @click="clearAllFilters"
          class="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-full text-sm"
        >
          {{ $t('admin.products.clearAll') }}
        </button>
      </div>

      <!-- Поле пошуку -->
      <div class="relative w-80 ml-auto">
        <input
          v-model="searchQuery"
          @input="onSearch"
          type="text"
          :placeholder="$t('admin.products.search')"
          class="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] dark:border-[#303b59] dark:bg-[#17223b] dark:text-white rounded focus:outline-none focus:ring focus:ring-pink-200 text-sm"
        />

        <img
          src="@/assets/icons/search.svg"
          alt="Search"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none dark:invert"
        />
      </div>
    </div>

    <!-- Фільтр праворуч -->
    <div v-if="showFilter" class="fixed inset-0 z-[9998]" @click.self="closeFilter">
      <FilterProduct
        class="fixed top-0 right-0 bottom-0 z-[9999] bg-[#fff7f6] dark:bg-[#17223b] text-black dark:text-white w-[350px] shadow-xl"
        :initialFilters="currentFilters"
        @applyFilters="applyFilters"
        @closeFilter="closeFilter"
      />
    </div>

    <!-- Список товарів -->
    <div v-if="products.length" class="space-y-5 mt-5">
      <div
        v-for="product in products"
        :key="product.id"
        @click="openProductDetails(product.id)"
        :class="[
          'border rounded-lg p-3 bg-white dark:bg-[#303b59] dark:border-[#444] cursor-pointer transition transform hover:scale-[1.01] hover:shadow-md',
          product.is_deleted ? 'opacity-50' : ''
        ]"
      >
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-bold text-black dark:text-white">{{ product.name }}</h2>
          <div class="flex gap-3">
            <button
              v-if="!product.is_deleted"
              @click.stop="openUpdateModal(product)"
              class="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-[#333] transition"
              aria-label="Редагувати"
            >
              <img src="@/assets/icons/edit.svg" alt="Edit" class="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
            <button
              v-if="!product.is_deleted"
              @click.stop="deleteProduct(product.id)"
              class="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-[#333] transition"
              aria-label="Видалити"
            >
              <img src="@/assets/icons/delete.svg" alt="Delete" class="w-7 h-7 sm:w-8 sm:h-8" />
            </button>
            <button
              v-if="product.is_deleted"
              @click.stop="restoreProduct(product.id)"
              class="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-[#333] transition"
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
            <div class="text-base font-semibold text-red-900 dark:text-red-200">
              {{ formatPrice(product.price, product.currency) }}
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-400">{{ product.bead_producer_name }}</div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="!searchQuery"
      class="flex items-center justify-center border border-[#E0E0E0] dark:border-[#444] bg-gray-50 dark:bg-[#2a2a2a] rounded-lg mt-10 h-48 font-semibold text-sm text-gray-700 dark:text-gray-300"
    >
      {{ $t('admin.products.noProducts') }}
    </div>
    <div
      v-else
      class="flex items-center justify-center border border-[#E0E0E0] dark:border-[#444] bg-gray-50 dark:bg-[#2a2a2a] rounded-lg mt-10 h-48 font-semibold text-sm text-gray-700 dark:text-gray-300"
    >
      {{ $t('admin.products.noResults', { query: searchQuery }) }}
    </div>

    <!-- Пагінація -->
    <div v-if="meta && paginationLinks().length" class="flex justify-center items-center gap-2 mt-5 h-12">
      <button
        @click="changePage(meta.current_page - 1)"
        :disabled="meta.current_page === 1"
        class="w-9 h-9 rounded-md text-sm shadow bg-white dark:bg-[#2c2c2c] hover:bg-gray-100 dark:hover:bg-[#3a3a3a] disabled:bg-gray-200 disabled:cursor-not-allowed transition"
      >
        &lt;
      </button>
      <button
        v-for="(link, index) in paginationLinks()"
        :key="index"
        @click="changePage(link.page)"
        :class="[
          'w-9 h-9 rounded-md text-sm shadow transition',
          link.active
            ? 'bg-[#6B1F1F] text-white shadow-lg'
            : 'bg-white dark:bg-[#2c2c2c] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3a3a]'
        ]"
      >
        {{ link.label }}
      </button>
      <button
        @click="changePage(meta.current_page + 1)"
        :disabled="meta.current_page === meta.last_page"
        class="w-9 h-9 rounded-md text-sm shadow bg-white dark:bg-[#2c2c2c] hover:bg-gray-100 dark:hover:bg-[#3a3a3a] disabled:bg-gray-200 disabled:cursor-not-allowed transition"
      >
        &gt;
      </button>
    </div>
  </main>

  <!-- Модалки -->
  <AddProductModal v-if="showAddModal" @close="closeAddModal" @product-added="onProductAdded" />
  <EditProductModal v-if="showEditModal" :product="selectedProduct" @close="closeEditModal" @product-updated="onProductUpdated" />
  <DeleteProductModal v-if="showDeleteModal" :product="selectedProduct" @close="closeDeleteModal" @product-deleted="onProductDeleted" />
  <ProductDetailModal
    v-if="showDetailModal && productDetails"
    :product="productDetails"
    :visible="showDetailModal"
    @close="showDetailModal = false"
    @edit="openUpdateModal"
    @delete="deleteProduct"
    @restore="restoreProduct"
  />
</template>

<script>
import FilterProduct from './FilterProduct.vue'
import AddProductModal from './AddProductModal.vue'
import EditProductModal from './EditProductModal.vue'
import DeleteProductModal from './DeleteProductModal.vue'
import ProductDetailModal from './ProductDetailModal.vue'
import api from '@/services/api';

export default {
  name: 'ProductList',
  components: {
    ProductDetailModal,
    FilterProduct,
    AddProductModal,
    EditProductModal,
    DeleteProductModal
  },
  data() {
    return {
      filtersKey: 0,
      products: [],
      rawFilters: {},
      showDetailModal: false,
      productDetails: null,
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
    async openProductDetails(productId) {
      try {
        const base = this.products.find(p => p.id === productId)
        const detail = await api.getProductDetail(productId)
        this.productDetails = { ...detail, is_deleted: base?.is_deleted ?? false }
        this.showDetailModal = true
      } catch (e) {
        console.error('❌ Помилка отримання деталей товару:', e)
      }
    },

    goToPage(url) {
      if (!url || this.searchQuery.trim()) return;
      this.fetchProducts(url, null)
    },

    async fetchFilteredProducts(filters) {
      try {
        const resp = await api.getAdminProducts({ params: filters })
        this.products = resp.data || []
        this.meta = resp.meta || null
      } catch (err) {
        console.error('❌ Помилка запиту товарів:', err)
        this.products = []
        this.meta = null
      }
    },

    async fetchProducts(url = null, page = 1) {
      try {
        const paramsObj = { ...this.currentFilters }
        if (this.searchQuery.trim()) paramsObj.search = this.searchQuery.trim()
        if (page != null) paramsObj.page = page

        let resp
        if (url) {
          try {
            const u = new URL(url)
            const relative = u.pathname + u.search
            resp = await api.getAdminProducts({ url: relative, params: paramsObj })
          } catch {
            resp = await api.getAdminProducts({ url, params: paramsObj })
          }
        } else {
          resp = await api.getAdminProducts({ params: paramsObj })
        }

        this.products = resp.data || []
        this.meta = this.searchQuery.trim() ? null : (resp.meta || null)
      } catch (error) {
        console.error('❌ Помилка завантаження товарів:', error)
        this.products = []
        this.meta = null
      }
    },

    changePage(page) {
      if (!this.meta) return
      if (page < 1 || page > this.meta.last_page) return
      this.fetchProducts(null, page)
    },

    onSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        if (this.searchQuery.trim()) this.fetchSearchedProducts(this.searchQuery)
        else this.fetchProducts()
      }, 400);
    },

    async fetchSearchedProducts(query) {
      const search = query.trim()
      if (!search) return this.fetchProducts()
      try {
        const resp = await api.searchProducts(search)
        const list = Array.isArray(resp) ? resp : (Array.isArray(resp.data) ? resp.data : [])
        this.products = list.sort((a, b) => b.id - a.id)
        this.meta = null
      } catch (error) {
        console.error('❌ Помилка пошуку товарів:', error)
        this.products = []
        this.meta = null
      }
    },

    formatPrice(price, currency) {
      const val = Number(price)
      const curr = (currency || 'UAH').toUpperCase()
      const locale = curr === 'USD' ? 'en-US' : 'uk-UA'
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: curr
      }).format(val)
    },

    paginationLinks() {
      if (!this.meta || this.meta.last_page <= 1) return []
      return Array.from({ length: this.meta.last_page }, (_, i) => ({
        label: (i + 1).toString(),
        page: i + 1,
        active: this.meta.current_page === i + 1
      }))
    },

    async restoreProduct(id) {
      try {
        await api.restoreProduct(id)
        await this.fetchProducts()
      } catch (err) {
        console.error('❌ Помилка відновлення товару:', err)
      }
    },

    openFilter() { this.showFilter = true },
    closeFilter() { this.showFilter = false },

   applyFilters(rawFilters) {
    const adapted = {}
    this.rawFilters = { ...rawFilters }

    // Ось тут ми дивимося на вже числові 0/1 в rawFilters.availability
    if (Array.isArray(rawFilters.availability) && rawFilters.availability.length) {
      // Laravel чекає масив рядків, тому toString()
      adapted.is_available = rawFilters.availability.map(v => v.toString())
    }

    // Інші фільтри
    if (rawFilters.rating?.length)    adapted.rating        = rawFilters.rating
    if (rawFilters.color)             adapted.color         = rawFilters.color
    if (rawFilters.producers?.length) adapted.bead_producer = rawFilters.producers
    if (rawFilters.type_of_bead?.length) adapted.type_of_bead = rawFilters.type_of_bead
    if (rawFilters.category?.length)  adapted.category      = rawFilters.category

    // Діапазони
    if (rawFilters.size) {
      adapted.size_from = rawFilters.size[0]
      adapted.size_to   = rawFilters.size[1]
    }
    if (rawFilters.weight) {
      adapted.weight_from = rawFilters.weight[0]
      adapted.weight_to   = rawFilters.weight[1]
    }
    if (rawFilters.price) {
      adapted.price_from = rawFilters.price[0]
      adapted.price_to   = rawFilters.price[1]
    }

    console.log('🔎 Payload to API:', adapted)
    this.currentFilters = adapted
    sessionStorage.setItem('admin-filters', JSON.stringify(adapted))
    this.fetchFilteredProducts(adapted)
    this.closeFilter()
  },



    removeTag(tag) {
      const nf = { ...this.rawFilters }
      if (['size','weight','price'].includes(tag.key)) {
        delete nf[tag.key]
      } else if (Array. isArray(nf[tag.key])) {
        nf[tag.key] = nf[tag.key].filter(v => v !== tag.value)
        if (nf[tag.key].length === 0) delete nf[tag.key]
      } else {
        delete nf[tag.key]
      }
      this.applyFilters(nf)
    },

    clearAllFilters() {
      this.rawFilters = {}
      this.currentFilters = {}
      this.filtersKey++
      this.applyFilters({})
    },

    openAddModal() { this.showAddModal = true },
    closeAddModal() { this.showAddModal = false },
    openUpdateModal(p) { this.selectedProduct = p; this.showEditModal = true },
    closeEditModal() { this.showEditModal = false; this.selectedProduct = null },
    deleteProduct(id) { this.selectedProduct = this.products.find(p => p.id === id); this.showDeleteModal = true },
    closeDeleteModal() { this.showDeleteModal = false; this.selectedProduct = null },

    async onProductAdded(p) {
     this.closeAddModal()
     // перезавантажуємо список — тоді точно будуть всі поля
     await this.fetchProducts()
   },
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
  async mounted() {
    document.title = 'Товари'
    const stored = sessionStorage.getItem('admin-filters')
    if (stored) {
      this.currentFilters = JSON.parse(stored)
      await this.fetchFilteredProducts(this.currentFilters)
    } else {
      await this.fetchProducts()
    }
    
  },
  computed: {
     activeTags() {
    const tags = []
    for (const [key, val] of Object.entries(this.rawFilters)) {
      // пропустити, якщо ніби базова категорія
      if (key === 'category' || key === 'category_id') continue

      if (Array.isArray(val)) {
        // Повзунки: один тег "мін–макс"
        if (['size','weight','price'].includes(key) && val.length === 2) {
          tags.push({ key, value: val, label: `${val[0]} – ${val[1]}` })
        }
        // чекбокси: по одному тегу на кожен елемент
        else {
          val.forEach(v => {
            tags.push({ key, value: v, label: String(v) })
          })
        }
      }
      // одиночні значення
      else if (val !== '' && val != null) {
        tags.push({ key, value: val, label: String(val) })
      }
    }
    return tags
  }

}  
}

</script>
