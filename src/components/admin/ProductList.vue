<template> 
  <main class="w-full p-4 space-y-6 relative">
    <!-- Заголовок та кнопки -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-gray-800">{{ $t('admin.products.title') }}</h1>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white px-4 py-2 rounded text-sm transition"
      >
        <img src="@/assets/icons/plus.svg" alt="Add" class="w-5 h-5" />
        <span>{{ $t('admin.products.add') }}</span>
      </button>
    </div>

    <!-- Панель управління: Фільтр + Пошук -->
    <div class="flex items-center gap-2 mt-3">
      <button
        @click="openFilter"
        class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-200 transition"
      >
        <span class="text-sm font-semibold text-gray-700">{{ $t('admin.products.filter') }}</span>
        <img src="@/assets/icons/filter.svg" alt="Filter icon" class="w-4 h-4" />
      </button>


      <div v-if="activeTags.length" class="flex flex-wrap gap-2 mt-4">
  <button
    v-for="tag in activeTags"
    :key="tag.key + tag.value"
    @click="removeTag(tag)"
    class="px-3 py-1 bg-gray-200 rounded-full flex items-center space-x-1"
  >
    <span>{{ tag.label }}</span>
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  </button>
  <button
    @click="clearAllFilters"
    class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
  >
    {{ $t('admin.products.clearAll') }}
  </button>
</div>

      <div class="w-64 ml-auto">
        <div
          class="flex items-center h-8 bg-red-50 rounded-md border border-transparent focus-within:border-black transition overflow-hidden"
        >
          <input
            v-model="searchQuery"
            @input="onSearch"
            type="text"
            :placeholder="$t('admin.products.search')"
            class="flex-1 px-3 py-1 bg-transparent outline-none text-red-900 text-sm"
          />
          <img src="@/assets/icons/search.svg" alt="Search icon" class="w-4 h-4 mr-3 pointer-events-none" />
        </div>
      </div>
    </div>

    <!-- В ProductList.vue -->
<div
  v-if="showFilter"
  class="fixed inset-0 z-[9998]"
  @click.self="closeFilter"
>
  <!-- Замість FilterProduct просто переконайся що є подія applyFilters -->
<FilterProduct
  v-if="showFilter"
  class="fixed top-0 right-0 bottom-0 z-[9999] bg-[#fff7f6] w-[350px] shadow-xl"
  :initialFilters="currentFilters"
  @applyFilters="applyFilters"
  @closeFilter="closeFilter"
/>




</div>


    <div v-if="products.length" class="space-y-5 mt-5">
      <div
        v-for="product in products"
          @click="openProductDetails(product.id)"

        :key="product.id"
        
        :class="[
  'border border-[#E0E0E0] rounded-lg p-3 bg-white cursor-pointer transition transform hover:scale-[1.01] hover:shadow-md',
  product.is_deleted ? 'opacity-50' : ''
]"

      >
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-bold">{{ product.name }}</h2>
          <div class="flex gap-3">
  <button
    v-if="!product.is_deleted"
  @click.stop="openUpdateModal(product)"
    class="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
    aria-label="Редагувати"
  >
    <img src="@/assets/icons/edit.svg" alt="Edit" class="w-7 h-7 sm:w-8 sm:h-8" />

  </button>
  <button
    v-if="!product.is_deleted"
  @click.stop="deleteProduct(product.id)"
    class="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 transition"
    aria-label="Видалити"
  >
    <img src="@/assets/icons/delete.svg" alt="Delete" class="w-7 h-7 sm:w-8 sm:h-8" />
  </button>
  <button
    v-if="product.is_deleted"
  @click.stop="restoreProduct(product.id)"
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
  <ProductDetailModal
  v-if="showDetailModal && productDetails"
  :product="productDetails"
  :visible="showDetailModal"
  @close="showDetailModal = false"
  @edit="openUpdateModal"
  @delete="deleteProduct"
  @restore="restoreProduct"
/>

  </main>
</template>

<script>
import axios from 'axios'
import FilterProduct from './FilterProduct.vue'
import AddProductModal from './AddProductModal.vue'
import EditProductModal from './EditProductModal.vue'
import DeleteProductModal from './DeleteProductModal.vue'
import ProductDetailModal from './ProductDetailModal.vue'


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
    // 🔥 Шукаємо товар у списку, щоб дістати is_deleted
    const base = this.products.find(p => p.id === productId)
    const res = await axios.get(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/products/${productId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    // 👇 вручну додаємо is_deleted із попереднього запиту
    this.productDetails = { ...res.data.data, is_deleted: base?.is_deleted ?? false }

    this.showDetailModal = true
  } catch (e) {
    console.error('❌ Помилка отримання деталей товару:', e)
  }
},

    goToPage(url) {
      if (!url || this.searchQuery.trim()) return;
      this.fetchProducts(url);
    },
    fetchFilteredProducts(filters) {
  const endpoint = 'https://koshtovnya.api-dev.bmax-edu.website/api/admin/products';

  const params = new URLSearchParams();

  console.log('%c🚀 fetchFilteredProducts():', 'color: orange;', filters);

  Object.entries(filters).forEach(([key, val]) => {
  if (Array.isArray(val)) {
    val.forEach(v => params.append(`${key}[]`, v)); 
  } else {
    params.append(key, val);
  }
});


  const url = `${endpoint}?${params.toString()}`;
  console.log('%c🌐 URL запиту:', 'color: blue;', url);

  axios.get(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
    .then(res => {
      console.log('%c✅ Отримано товари:', 'color: green;', res.data);
      this.products = res.data.data || [];
      this.meta = null;
    })
    .catch(err => {
      console.error('❌ Помилка запиту товарів:', err);
      this.products = [];
      this.meta = null;
    });
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
    applyFilters(rawFilters) {
  const adapted = {};
  console.log('🎯 Вихідні фільтри:', rawFilters);

  if (rawFilters.availability?.length) {
    const map = {
      'В наявності': 1,
      'Немає в наявності': 0
    };
    adapted.is_available = rawFilters.availability.map(a => map[a]).filter(v => v !== undefined);
  }

  if (rawFilters.rating?.length) adapted.rating = rawFilters.rating;
  if (rawFilters.color) adapted.color = rawFilters.color;

  // 💥 ось тут додаємо обидва варіанти
  if (rawFilters.producers?.length) adapted.bead_producer = rawFilters.producers;
  else if (rawFilters.bead_producer?.length) adapted.bead_producer = rawFilters.bead_producer;

  if (rawFilters.beadTypes?.length) adapted.type_of_bead = rawFilters.beadTypes;
  if (rawFilters.category?.length) adapted.category = rawFilters.category;

  if (rawFilters.size && Array.isArray(rawFilters.size)) {
    adapted.size_from = rawFilters.size[0];
    adapted.size_to = rawFilters.size[1];
  }

  if (rawFilters.weight && Array.isArray(rawFilters.weight)) {
    adapted.weight_from = rawFilters.weight[0];
    adapted.weight_to = rawFilters.weight[1];
  }

  if (rawFilters.price && Array.isArray(rawFilters.price)) {
    adapted.price_from = rawFilters.price[0];
    adapted.price_to = rawFilters.price[1];
  }

  console.log('📦 Адаптовані фільтри:', adapted);

  this.currentFilters = adapted;
  sessionStorage.setItem('admin-filters', JSON.stringify(adapted));
  this.fetchFilteredProducts(adapted);
  this.closeFilter();
},

removeTag(tag) {
  const nf = { ...this.currentFilters };
  const val = nf[tag.key];
  if (Array.isArray(val)) {
    if (val.length === 2 && typeof val[0] === 'number') delete nf[tag.key];
    else nf[tag.key] = val.filter(v => v !== tag.value);
  } else {
    delete nf[tag.key];
  }
  this.applyFilters(nf);
},


clearAllFilters() {
  this.currentFilters = {};
  this.filtersKey++; // для оновлення FilterComponent
  sessionStorage.removeItem('admin-filters');
  this.fetchProducts(); // завантажити всі товари
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
  document.title = 'Товари';
  const stored = sessionStorage.getItem('admin-filters');
  if (stored) {
    this.currentFilters = JSON.parse(stored);
    this.fetchFilteredProducts(this.currentFilters);
  } else {
    this.fetchProducts();
  }
},

  computed: {
  activeTags() {
    const tags = [];
    for (const [key, val] of Object.entries(this.currentFilters)) {
      if (Array.isArray(val)) {
        if (val.length === 2 && typeof val[0] === 'number') {
          tags.push({ key, value: val, label: `${val[0]} – ${val[1]}` });
        } else {
          tags.push(...val.map(v => ({ key, value: v, label: `${v}` })));
        }
      } else if (val) {
        tags.push({ key, value: val, label: `${val}` });
      }
    }
    return tags;
  }
},
}
</script>
