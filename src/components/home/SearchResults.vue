<template>
  <div>
    <div v-if="isVisible" class="search-results" @mousedown.stop>
      <h2>Результати пошуку:</h2>

      <!-- Loader animation -->
      <div v-if="loading" class="loader">
        Завантаження<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
      </div>

      <!-- No results found -->
      <div v-else-if="!loading && results.length === 0">
        <p>Нічого не знайдено.</p>
      </div>

      <!-- Display results -->
      <ul v-else>
        <li
          v-for="product in highlightedResults"
          :key="product.id"
          class="search-result-item"
        >
          <router-link
            :to="`/productpage/${product.id}`"
            class="product-link"
          >
            <img :src="product.image_url" :alt="product.name" />
            <div class="product-details">
              <h3 v-html="product.highlightedName"></h3>
              <p>Ціна: {{ product.price }} ₴</p>
            </div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash';
import api from '@/services/api';

export default {
  name: 'SearchResults',
  props: {
    query: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      results: [],
      isVisible: false,
      loading: false
    };
  },
  computed: {
    highlightedResults() {
      const q = this.query.trim();
      if (!q) return this.results;
      const regex = new RegExp(`(${q})`, 'gi');
      return this.results.map(p => ({
        ...p,
        highlightedName: p.name.replace(regex, '<span class="highlight">$1</span>')
      }));
    }
  },
  watch: {
    query: debounce(async function (newQuery) {
      const trimmed = newQuery.trim();
      if (trimmed) {
        await this.performSearch(trimmed);
      } else {
        this.resetResults();
      }
    }, 300)
  },
  methods: {
    async performSearch(text) {
      this.loading = true;
      this.isVisible = true;
      try {
        const resp = await api.searchProducts(encodeURIComponent(text));
        const items = Array.isArray(resp.data) ? resp.data : resp.data?.data || [];
        this.results = items;
      } catch (error) {
        console.error('Search error:', error);
        this.results = [];
      } finally {
        this.loading = false;
      }
    },
    resetResults() {
      this.results = [];
      this.isVisible = false;
      this.loading = false;
    },
    handleOutsideClick(event) {
      if (!this.$el.contains(event.target)) {
        this.isVisible = false;
      }
    }
  },
  mounted() {
    document.addEventListener('mousedown', this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('mousedown', this.handleOutsideClick);
  }
};
</script>

<style scoped>
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 250px;
  background-color: #fff7f6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
}

.search-results h2 {
  margin: 0 0 10px;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  font-size: 18px;
}

.search-results ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eaeaea;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-results img {
  width: 50px;
  height: auto;
  margin-right: 10px;
}

.product-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}

.product-details {
  flex-grow: 1;
  text-align: left;
}

.product-details h3 {
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  margin: 0;
  font-size: 15px;
}

.product-details p {
  font-family: 'Montserrat', sans-serif;
  margin: 0;
  font-size: 12px;
}

.highlight {
  color: gray;
  font-weight: bold;
  font-size: 14px;
}

/* Лоадер з анімацією крапок */
.loader {
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #6b1f1f;
  padding: 10px 0;
}

.loader .dot {
  opacity: 0;
  animation: blink 1.5s infinite;
  font-weight: bold;
}

.loader .dot:nth-child(2) {
  animation-delay: 0.5s;
}

.loader .dot:nth-child(3) {
  animation-delay: 1s;
}

@keyframes blink {
  0%, 20%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 5px;
}
</style>
