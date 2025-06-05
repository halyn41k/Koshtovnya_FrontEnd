<template>
  <div id="app" class="relative bg-white dark:bg-gray-900 text-black dark:text-white min-h-screen">
    <!-- Хедер -->
    <HeaderComponent v-if="!isAdminRoute" />

    <!-- Основний контент -->
    <router-view />

    <!-- Футер -->
    <FooterComponent v-if="!isAdminRoute" />

    <!-- Кнопка “вгору” -->
    <button
      v-show="showScrollTop"
      @click="scrollToTop"
      aria-label="Повернутись догори"
      class="fixed bottom-6 right-6 z-50 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg transition-opacity duration-300"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  </div>
</template>

<script>
import HeaderComponent from '@/components/home/HeaderComponent.vue';
import FooterComponent from '@/components/home/FooterComponent.vue';

export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent,
  },
  data() {
    return {
      showScrollTop: false,
    };
  },
  computed: {
    isAdminRoute() {
      return this.$route.path.startsWith('/admin');
    },
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);

    // Автоматичний скрол вгору при переході (запасний варіант)
    this.$router.afterEach(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Автоматичний редирект, якщо нема токена (крім Login/Registration)
    const publicRoutes = ['Login', 'Registration', 'ResetPassword', 'Verify'];
    const token = localStorage.getItem('token');
    if (!token && !publicRoutes.includes(this.$route.name)) {
      this.$router.push({ name: 'Login' });
    }
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  watch: {
    '$route'(to, from) {
      // очищення body класів (якщо раптом щось залишилось після модалок)
      document.body.classList.remove('overflow-hidden');
    }
  },
  methods: {
    handleScroll() {
      this.showScrollTop = window.scrollY > 400;
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  },
};
</script>

<style scoped>
button[aria-label="Повернутись догори"] {
  transition: transform 0.3s ease;
}
button[aria-label="Повернутись догори"]:hover {
  transform: scale(1.1);
}
</style>
