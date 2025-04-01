<template>
  <div id="app">
    <!-- Рендеримо хедер, якщо маршрут не веде до адмін-панелі -->
    <HeaderComponent v-if="!isAdminRoute" />
    <router-view />
    <!-- Рендеримо футер, якщо маршрут не веде до адмін-панелі -->
    <FooterComponent v-if="!isAdminRoute" />
  </div>
</template>

<script>
import HeaderComponent from './components/HeaderComponent.vue';
import FooterComponent from './components/FooterComponent.vue';

export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent,
  },
  computed: {
    // Перевірка, чи маршрут веде до адмін-панелі
    isAdminRoute() {
      return this.$route.path.startsWith('/admin');
    },
  },
  mounted() {
    const token = localStorage.getItem('token');
    if (!token && this.$route.name !== 'Login') {
      this.$router.push({ name: 'Login' });
    }
  },
  watch: {
    // Слідкуємо за змінами маршруту для коректного рендерингу Header та Footer
    '$route'(to, from) {
      // Це забезпечує реактивність computed властивості isAdminRoute при зміні маршруту
    }
  }
};
</script>
