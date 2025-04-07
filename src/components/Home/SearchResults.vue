<template>
  <div>
    <div v-if="isVisible" class="search-results" @mousedown.stop>
      <h2>Результати пошуку:</h2>
      <ul>
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
import axios from "axios"; // Імпортуємо бібліотеку axios для запитів до API.

export default {
  props: {
    query: { // Властивість для запиту пошуку.
      type: String,
      required: false,
      default: "", // За замовчуванням порожній рядок.
    },
  },
  data() {
    return {
      results: [], // Масив для збереження результатів пошуку.
      isVisible: false, // Прапорець для відображення результатів.
    };
  },
  computed: {
    // Виділяємо збіги в результатах пошуку.
    highlightedResults() {
      const query = this.query.trim(); // Очищаємо запит від пробілів.
      if (!query) return this.results; // Якщо запит порожній — повертаємо всі результати.

      // Створюємо регулярний вираз для виділення частин тексту.
      const regex = new RegExp(`(${query})`, "gi");
      return this.results.map((product) => ({
        ...product,
        highlightedName: product.name.replace(
          regex,
          '<span class="highlight">$1</span>' // Виділяємо знайдені частини.
        ),
      }));
    },
  },
  watch: {
    // Стежимо за змінами в query і виконуємо пошук.
    query(newQuery) {
      if (newQuery.trim()) {
        this.search(newQuery); // Якщо запит не порожній, виконуємо пошук.
      } else {
        this.results = []; // Якщо запит порожній, очищуємо результати.
        this.isVisible = false; // Сховуємо блок з результатами.
      }
    },
  },
  methods: {
    // Пошук товарів через API.
    search(query) {
      const apiUrl = `http://26.235.139.202:8080/api/products/search/${query}`; // Формуємо URL.
      axios
        .get(apiUrl) // Запит до API.
        .then((response) => {
          this.results = response.data.data; // Оновлюємо результати.
          this.isVisible = true; // Показуємо блок з результатами.
        })
        .catch((error) => {
          console.error("Error fetching search results:", error); // Логуємо помилки.
          this.results = []; // Очищаємо результати у разі помилки.
          this.isVisible = false; // Сховуємо блок з результатами.
        });
    },
    // Обробка кліків за межами компонента.
    handleOutsideClick(event) {
      if (!this.$el.contains(event.target)) {
        this.isVisible = false; // Сховуємо результати, якщо клікнули поза.
      }
    },
  },
  mounted() {
    // Додаємо слухача на клік миші по всьому документу.
    document.addEventListener("mousedown", this.handleOutsideClick);
  },
  beforeUnmount() {
    // Видаляємо слухача перед знищенням компонента.
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

.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 5px;
}
</style>