<template>
  <div>
    <div v-if="isVisible" class="search-results" @mousedown.stop>
      <h2>Результати пошуку:</h2>

      <!-- Лоадер з анімацією крапок -->
      <div v-if="loading" class="loader">
        Завантаження<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
      </div>

      <!-- Якщо пошук завершено, але нічого не знайдено -->
      <div v-else-if="results.length === 0">
        <p>Нічого не знайдено.</p>
      </div>

      <!-- Якщо є результати -->
      <ul v-else>
        <li v-for="product in highlightedResults" :key="product.id" class="search-result-item">
          <router-link :to="`/productpage/${product.id}`" class="product-link">
            <img :src="product.image_url" alt="Product Image" />
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
import axios from "axios";

export default {
  props: {
    query: {
      type: String,
      required: false,
      default: "",
    },
  },
  data() {
    return {
      results: [],
      isVisible: false,
      loading: false,
    };
  },
  computed: {
    highlightedResults() {
      const query = this.query.trim();
      if (!query) return this.results;

      const regex = new RegExp(`(${query})`, "gi");
      return this.results.map((product) => ({
        ...product,
        highlightedName: product.name.replace(regex, '<span class="highlight">$1</span>'),
      }));
    },
  },
  watch: {
    query(newQuery) {
      if (newQuery.trim()) {
        this.search(newQuery);
      } else {
        this.results = [];
        this.isVisible = false;
      }
    },
  },
  methods: {
    search(query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    this.results = [];
    this.isVisible = false;
    return;
  }
  const apiUrl = `http://26.235.139.202:8080/api/products/search/${encodeURIComponent(trimmedQuery)}`;
  this.loading = true;
  this.isVisible = true;
  axios
    .get(apiUrl)
    .then((response) => {
      this.results = response.data.data;
    })
    .catch((error) => {
      console.error("Error fetching search results:", error);
      this.results = [];
      this.isVisible = false;
    })
    .finally(() => {
      this.loading = false;
    });
},
    handleOutsideClick(event) {
      if (!this.$el.contains(event.target)) {
        this.isVisible = false;
      }
    },
  },
  mounted() {
    document.addEventListener("mousedown", this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener("mousedown", this.handleOutsideClick);
  },
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
