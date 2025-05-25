<template>
  <section class="flex flex-col items-center bg-[#fff7f6] py-12">
    <!-- Section title -->
    <h2
      class="text-[#333] text-[32px] font-black font-kyivtype text-center mb-12"
    >
      {{ $t('home.shopByCategory') }}
    </h2>

    <!-- Categories grid -->
    <div class="w-full max-w-screen-lg px-4">
      <div class="grid grid-cols-1 gap-y-12 gap-x-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-24">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="category.url"
          class="group block"
        >
          <!-- Контейнер для квадратиків + зображення -->
          <div class="relative w-72 h-72 mt-5 mx-auto">
            <!-- Світлий квадрат -->
            <div
              class="absolute -left-4 -top-4 w-72 h-72 bg-[#EADCDB]
                     transform transition-transform duration-500 ease-out
                     group-hover:-translate-x-2 group-hover:-translate-y-2 z-0"
            ></div>
            <!-- Темний квадрат -->
            <div
              class="absolute -right-3 top-3 w-72 h-72 bg-[#C4AEAC]
                     transform transition-transform duration-500 ease-out
                     group-hover:translate-x-2 group-hover:translate-y-2 z-0"
            ></div>
            <!-- Зображення -->
            <img
              loading="lazy"
              :src="category.image_url"
              :alt="category.name"
              class="relative z-10 w-full h-full object-cover"
            />
          </div>

          <!-- Підпис категорії трохи нижче -->
          <div
            class="mt-12 flex items-center justify-center text-[1.5rem] font-black text-[#6B1F1F] font-kyivtype letter-tight"
          >
            <h3>{{ $t(category.name) }}</h3>
            <span
              class="ml-2 text-2xl transform transition-transform duration-300 ease-out group-hover:translate-x-2"
            >
              →
            </span>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'BuyByCategory',
  data() {
    return {
      categories: [],
      fallbackCategories: [
        { id: 1, name: 'Браслети', url: '/bracelets', image_url: require('@/assets/testpicture.png') },
        { id: 2, name: 'Гердани', url: '/herdany', image_url: require('@/assets/testpicture.png') },
        { id: 3, name: 'Силянки', url: '/sylyanky', image_url: require('@/assets/testpicture.png') },
        { id: 4, name: 'Дукати', url: '/dukats', image_url: require('@/assets/testpicture.png') },
        { id: 5, name: 'Сережки', url: '/earrings', image_url: require('@/assets/testpicture.png') },
        { id: 6, name: 'Пояси', url: '/belts', image_url: require('@/assets/testpicture.png') },
      ],
    };
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await api.getCategories();
        const items = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        const fixedUrls = [
          '/bracelets', '/herdany', '/sylyanky',
          '/dukats', '/earrings', '/belts'
        ];
        this.categories = items.map((cat, idx) => ({
          id: cat.id,
          name: cat.name,
          image_url: cat.image_url,
          url: fixedUrls[idx] || `/category/${cat.id}`
        }));
      } catch (err) {
        console.error('Помилка отримання категорій:', err);
        this.categories = this.fallbackCategories;
      }
    },
  },
  mounted() {
    this.fetchCategories();
  },
};
</script>

<style scoped>
@font-face {
  font-family: 'KyivType';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

.font-kyivtype {
  font-family: 'KyivType', sans-serif;
}

.letter-tight {
  letter-spacing: -0.025em;
}
</style>