<template>
  <section class="buy-by-category">
    <h2 class="section-title">{{ $t('shopByCategory') }}</h2>
    <div class="category-container">
      <div class="category-grid">
        <router-link v-for="(category, index) in categories" :key="category.id" :to="category.url"
          class="category-item with-squares">
          <template v-if="index === 0 || index === 2 || index === 4">
            <div class="square light-square"></div>
            <div class="square dark-square"></div>
          </template>
          <div class="image-wrapper">
            <img loading="lazy" :src="category.image_url" :alt="category.name" class="category-image" />
          </div>
          <div class="category-title-wrapper">
            <h2 class="category-title">{{ $t(category.name) }}</h2>
            <span class="arrow">→</span>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>


<script>
export default {
  data() {
    return {
      // Масив для зберігання категорій, отриманих із API
      categories: [],

      // Запасний масив категорій, якщо API недоступне
      fallbackCategories: [
        {
          id: 1,
          name: 'Браслети',
          url: '/bracelets', // Фіксована URL-адреса
          image_url: require('@/assets/testpicture.png'),
        },
        {
          id: 2,
          name: 'Гердани',
          url: '/herdany', // Фіксована URL-адреса
          image_url: require('@/assets/testpicture.png'),
        },
        {
          id: 3,
          name: 'Силянки',
          url: '/sylyanky', // Фіксована URL-адреса
          image_url: require('@/assets/testpicture.png'),
        },
        {
          id: 4,
          name: 'Дукати',
          url: '/dukats', // Фіксована URL-адреса
          image_url: require('@/assets/testpicture.png'),
        },
        {
          id: 5,
          name: 'Сережки',
          url: '/earrings', // Фіксована URL-адреса
          image_url: require('@/assets/testpicture.png'),
        },
        {
          id: 6,
          name: 'Пояси',
          url: '/belts', // Фіксована URL-адреса
          image_url: require('@/assets/testpicture.png'),
        },
      ],
    };
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await fetch("http://26.235.139.202:8080/api/categories");

        if (!response.ok) {
          throw new Error(`HTTP помилка: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data.data)) {
          throw new Error("Очікував масив категорій з API");
        }

        const fixedUrls = [
          '/bracelets',
          '/herdany',
          '/sylyanky',
          '/dukats',
          '/earrings',
          '/belts',
        ];

        this.categories = data.data.map((category, index) => ({
          id: category.id,
          name: category.name,
          image_url: category.image_url,
          url: fixedUrls[index] || '#',
        }));
      } catch (error) {
        console.error("Помилка при отриманні категорій:", error.message);
        this.categories = this.fallbackCategories;
      }
    },

  },
  // Викликаємо fetchCategories одразу після монтуння компонента
  mounted() {
    this.fetchCategories();
  },
};
</script>


<style scoped>
@font-face {
  font-family: 'KyivType Titling';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Bold3.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
}

@font-face {
  font-family: 'KyivType Titling Heavy';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Heavy2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
}

.section-title {
  color: #333;
  font-family: 'KyivType Titling Heavy', sans-serif;
  font-weight: 900;
  text-shadow: 0 4px 4px rgba(99, 2, 2, 0.22);
  letter-spacing: -2px;
  text-align: center;
  margin-top: 50px;
  font-size: 30px;
  margin-bottom: 40px;
}

.buy-by-category {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  background-color: #fff7f6;
  margin-top: 20px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 100px;
  width: 100%;
  max-width: 1200px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  text-decoration: none;
  color: inherit;
}

.category-item:hover {
  text-decoration: none;
}

.image-wrapper {
  position: relative;
  width: 300px;
  height: 300px;
  overflow: hidden;
  margin-top: 20px;
}

.category-title-wrapper {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  letter-spacing: -1px;
  color: rgb(107, 31, 31);
  margin-top: 10px;
  font-family: 'KyivType Titling', sans-serif;
}

.category-title {
  font-family: 'KyivType Titling';
  font-weight: 900;
  margin-right: 10px;
}

.square {
  position: absolute;
  width: 300px;
  height: 340px;
  z-index: 1;
  pointer-events: none;
  transition: transform 0.5s ease;
}

.light-square {
  background-color: #EADCDB;
  top: -20px;
  left: -50px;
}

.dark-square {
  background-color: #C4AEAC;
  top: 20px;
  right: -50px;
}

.category-item:hover .light-square {
  transform: translate(-10px, -10px);
}

.category-item:hover .dark-square {
  transform: translate(10px, 10px);
}

.category-grid .category-item:nth-child(1) .light-square,
.category-grid .category-item:nth-child(1) .dark-square,
.category-grid .category-item:nth-child(3) .light-square,
.category-grid .category-item:nth-child(3) .dark-square,
.category-grid .category-item:nth-child(5) .light-square,
.category-grid .category-item:nth-child(5) .dark-square {
  display: block;
}

.category-item .light-square,
.category-item .dark-square {
  display: none;
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 2;
}

.arrow {
  font-size: 24px;
  transition: transform 0.3s ease;
}

.category-item:hover .arrow {
  transform: translateX(10px);
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>