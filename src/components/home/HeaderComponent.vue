<template>
  <div>
    <!-- Header -->
    <header
      ref="headerEl"
      class="fixed top-0 w-full bg-[#fafafa] shadow z-50 md:px-[50px] font-base text-body3 leading-[18px]"
    >
      <!-- Top bar -->
      <div class="flex justify-between items-center pt-4 pb-2 px-4 md:px-0">
        <!-- Про нас / Про доставку (desktop only) -->
        <ul class="hidden md:flex space-x-6">
          <li>
            <router-link
              to="/aboutus"
              class="relative text-semantic-secondary transition-colors
                     before:content-[''] before:absolute before:left-0 before:right-0
                     before:bottom-0 before:h-[2px] before:bg-black before:scale-x-0
                     hover:before:scale-x-100 before:origin-left before:transition-transform"
            >
              {{ $t('home.aboutUs') }}
            </router-link>
          </li>
          <li>
            <router-link
              to="/aboutdelivery"
              class="relative text-semantic-secondary transition-colors
                     before:content-[''] before:absolute before:left-0 before:right-0
                     before:bottom-0 before:h-[2px] before:bg-black before:scale-x-0
                     hover:before:scale-x-100 before:origin-left before:transition-transform"
            >
            {{ $t('home.aboutDelivery') }}
            </router-link>
          </li>
        </ul>

        <div class="flex items-center space-x-6">
          <!-- Language selector -->
          <div class="relative z-50">
            <button
              @click="toggleLanguageDropdown"
              class="flex items-center space-x-2 p-2 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              <img
                :src="currentFlag"
                :alt="selectedLanguage + ' flag'"
                class="w-5 h-4 rounded-sm shadow-sm"
              />
              <span>{{ selectedLanguage === 'uk' ? 'Українська' : 'English' }}</span>
              <svg
                :class="{ 'rotate-180': isLanguageDropdownOpen }"
                class="w-4 h-4 transform transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul
              v-if="isLanguageDropdownOpen"
              class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-stroke rounded-lg shadow-lg overflow-hidden z-50"
            >
              <li>
                <button
                  @click="changeLanguage('uk')"
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 transition-all duration-200 rounded-lg"
                >
                  Українська
                </button>
              </li>
              <li>
                <button
                  @click="changeLanguage('en')"
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 transition-all duration-200 rounded-lg"
                >
                  English
                </button>
              </li>
            </ul>
          </div>

          <!-- Theme toggle -->
          <div class="flex items-center">
            <span class="text-xl">☀️</span>
            <button
              @click="toggleDarkMode"
              class="mx-2 w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full relative transition-colors duration-300"
            >
              <span
                class="absolute left-0 top-0 w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow transform transition-transform duration-300"
                :class="{ 'translate-x-5': isDark }"
              ></span>
            </button>
            <span class="text-xl">🌙</span>
          </div>

          <!-- Currency selector -->
          <div class="relative z-50">
            <button
              @click="toggleCurrencyDropdown"
              class="flex items-center space-x-1 p-2 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              <span>{{ selectedCurrency }}</span>
              <svg
                :class="{ 'rotate-180': isCurrencyDropdownOpen }"
                class="w-4 h-4 transform transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul
              v-if="isCurrencyDropdownOpen"
              class="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 border border-stroke rounded-lg shadow-lg overflow-hidden z-50"
            >
              <li>
                <button
                  @click="changeCurrency('UAH')"
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 transition-all duration-200 rounded-lg"
                >
                  UAH ₴
                </button>
              </li>
              <li>
                <button
                  @click="changeCurrency('USD')"
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 transition-all duration-200 rounded-lg"
                >
                  USD $
                </button>
              </li>
            </ul>
          </div>

          <!-- Wishlist (desktop only) -->
          <router-link
            :to="{ path: '/account', query: { tab: 'wishlist' } }"
            class="hidden md:inline-block relative text-semantic-secondary transition-colors
                   before:content-[''] before:absolute before:left-0 before:right-0
                   before:bottom-0 before:h-[2px] before:bg-black before:scale-x-0
                   hover:before:scale-x-100 before:origin-left before:transition-transform"
          >
            {{ $t('home.wishlist') }}
          </router-link>
        </div>
      </div>

      <div class="h-px bg-[#e5e5e5]"></div>

      <!-- Main: Search, Logo, Controls -->
      <div class="flex items-center justify-between py-3 px-4 md:px-0">
        <!-- Desktop search + results -->
        <div
          class="hidden md:flex items-center bg-[#F2E8E8] rounded-lg focus-within:border focus-within:border-stroke
                 transition-all duration-200 relative w-full max-w-sm"
        >
          <input
            v-model="searchQuery"
            @keyup.enter="startSearch"
            :placeholder="$t('home.searchPlaceholder')"

            class="flex-1 px-3 py-2 bg-transparent border-none focus:outline-none text-input
                   transition-all duration-200"
          />
          <button @click="startSearch" class="px-3 flex-shrink-0">
            <img src="@/assets/magnifying-glass-svgrepo-com.svg" alt="Search" class="w-5 h-5"/>
          </button>

          <!-- Search results dropdown -->
          <div
            v-if="isVisible"
            class="absolute top-full left-0 w-full bg-[#F6E7E7] rounded-lg shadow-lg z-50
                   max-h-[400px] overflow-y-auto"
          >
            <div v-if="loading" class="p-4 text-center text-gray-600">
              Завантаження<span class="loading-dots"></span>
            </div>
            <div v-else>
              <div v-if="results.length === 0" class="p-4 text-center text-gray-500">
                Нічого не знайдено
              </div>
              <ul v-else>
                <li
                  v-for="item in results"
                  :key="item.id"
                  @click="goToProduct(item.id)"
                  class="flex items-center p-2 hover:bg-gray-100 transition cursor-pointer"
                  style="max-height: 100px;"
                >
                  <img
                    :src="item.image_url"
                    alt=""
                    class="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0"
                  />
                  <div class="flex-1">
                    <div class="font-semibold truncate">{{ item.name }}</div>
                    <div class="text-sm price-color">{{ formatPrice(item.price) }}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Logo -->
        <router-link to="/" class="relative flex items-center space-x-2 md:left-[-150px]">
          <img :src="siteSettings.site_logo" alt="Logo" class="w-14 h-12"/>
          <h1 class="font-heading text-h3 text-semantic-primary font-black">{{ $t('home.siteName') }}</h1>
        </router-link>

        <!-- User / Cart / Mobile Search / Burger -->
        <div class="flex items-center space-x-4">
          <router-link to="/account" class="hover:text-primary transition">
            <img src="@/assets/icons/user_icon.svg" alt="User" class="w-6 h-6"/>
          </router-link>
          <button @click="toggleMobileSearch" class="md:hidden">
            <img src="@/assets/icons/search1.svg" alt="Mobile Search" class="w-6 h-6"/>
          </button>
          <router-link to="/cart" class="relative hover:text-primary transition">
            <img src="@/assets/icons/cart.svg" alt="Cart" class="w-6 h-6"/>
            <span
              v-if="cartCount"
              class="absolute -top-1 -right-2 bg-[#A01212] text-white font-semibold text-[10px]
                     rounded-full w-4 h-4 flex items-center justify-center animate-bounce"
            >
              {{ cartCount }}
            </span>
          </router-link>
          <button @click="toggleBurger" class="md:hidden ml-4 focus:outline-none">
            <img src="@/assets/icons/burger.svg" alt="Menu" class="w-6 h-6"/>
          </button>
        </div>
      </div>

      <!-- Desktop categories -->
      <nav class="hidden md:block bg-[#F6E7E7] md:-mx-[50px]">
        <ul class="flex justify-center space-x-1 py-1 px-4 md:px-0 font-base">
          <li
  v-for="cat in categories"
  :key="cat.link || cat.name"

  @click="handleCategoryClick(cat.link)"
>
  <span
    :class="[
      'relative inline-block px-2 py-1 cursor-pointer transition-colors duration-300',
      $route.path === cat.link
        ? 'text-[#6B1F1F] font-semibold before:scale-x-100'
        : 'text-[#6B1F1F] hover:bg-[#fafafa] hover:text-[#6B1F1F] before:scale-x-0',
      'before:content-[\'\'] before:absolute before:left-0 before:right-0 before:bottom-0 before:h-[2px] before:bg-[#6B1F1F] before:origin-left before:transition-transform before:duration-300'
    ]"
  >
    {{ $t(cat.name) }}
  </span>
</li>

        </ul>
      </nav>

      <transition name="slide-fade">
  <div
    v-if="isBurgerOpen"
    class="md:hidden bg-[#FFF7F6] border-t border-stroke z-40"
  >
    <ul class="px-4 py-2 space-y-2">
      <li>
        <button
          @click="toggleCategories"
          class="w-full flex justify-between items-center px-4 py-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          Категорії
          <svg
            :class="{ 'rotate-180': isCategoriesOpen }"
            class="w-4 h-4 transform transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <ul v-if="isCategoriesOpen" class="mt-2 pl-4 space-y-1">
          <li v-for="cat in categories" :key="cat.link">
  <a
    @click.prevent="navigateToCategory(cat.link)"
    class="block px-4 py-2 hover:bg-gray-100 rounded-lg transition-all duration-200 cursor-pointer"
  >
    {{ $t(cat.name) }}
  </a>
</li>

        </ul>
      </li>
      <li>
        <router-link
  to="/account"
  :query="{ tab: 'wishlist' }"
  class="block px-4 py-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
  @click="isBurgerOpen = false"
>
  {{ $t('home.wishlist') }}
</router-link>

<router-link
  to="/aboutus"
  class="block px-4 py-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
  @click="isBurgerOpen = false"
>
  {{ $t('home.aboutUs') }}
</router-link>

<router-link
  to="/aboutdelivery"
  class="block px-4 py-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
  @click="isBurgerOpen = false"
>
{{ $t('home.aboutDelivery') }}
</router-link>

      </li>
    </ul>
  </div>
</transition>
</header>


    <!-- Mobile search dropdown + results -->
    <transition name="slide-down">
      <div
        v-if="mobileSearchActive"
        class="fixed left-0 right-0 bg-[#FAFAFA] px-4 py-2 border-b border-stroke md:hidden z-40"
        :style="{ top: headerHeight + 'px' }"
      >
        <div class="flex items-center bg-card rounded-lg overflow-hidden">
          <input
            v-model="searchQuery"
            @keyup.enter="startSearch"
:placeholder="$t('home.searchPlaceholder')"
            class="flex-1 px-3 py-2 bg-[#F2E8E8] border-none focus:outline-none text-input"
          />
          <button @click="startSearch" class="px-3">
            <img src="@/assets/magnifying-glass-svgrepo-com.svg" alt="Search" class="w-5 h-5"/>
          </button>
        </div>

        <div
          v-if="isVisible"
          class="mt-2 bg-[#F6E7E7] rounded-lg shadow-lg z-50 max-h-[300px] overflow-y-auto"
        >
          <div v-if="loading" class="p-4 text-center text-gray-600">
            Завантаження<span class="loading-dots"></span>
          </div>
          <div v-else>
            <div v-if="results.length === 0" class="p-4 text-center text-gray-500">
              Нічого не знайдено
            </div>
            <ul v-else>
              <li
                v-for="item in results"
                :key="item.id"
                @click="goToProduct(item.id)"
                class="flex items-center p-2 hover:bg-gray-100 transition cursor-pointer"
                style="max-height: 100px;"
              >
                <img
                  :src="item.image_url"
                  alt=""
                  class="w-16 h-16 object-cover rounded-lg mr-4 flex-shrink-0"
                />
                <div class="flex-1">
                  <div class="font-semibold truncate">{{ item.name }}</div>
                  <div class="text-sm price-color">{{ formatPrice(item.price) }}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { debounce } from 'lodash';
import api from '@/services/api';
import bus from '@/eventBus';
import { useDarkMode } from '@/composables/useDarkMode';

export default {
  name: 'HeaderComponent',
  setup() {
    const { isDark, toggleDarkMode } = useDarkMode()
    return { isDark, toggleDarkMode }
  },
  data() {
    return {
      categories: [],
      selectedLanguage: 'uk',
      selectedCurrency: 'UAH',
      cartCount: 0,
      searchQuery: '',
      results: [],
      isVisible: false,
      loading: false,
      isLanguageDropdownOpen: false,
      isCurrencyDropdownOpen: false,
      isBurgerOpen: false,
      isCategoriesOpen: false,
      mobileSearchActive: false,
      headerHeight: 0,
      siteSettings: { site_logo: '' },
    };
  },
  computed: {
    currentFlag() {
      return this.selectedLanguage === 'uk'
        ? 'https://flagcdn.com/w320/ua.png'
        : 'https://flagcdn.com/w320/gb.png';
    },
  },
  watch: {
    '$route'(to, from) {
    // перевірка, чи змінилась категорія
    if (to.path.startsWith('/category/')) {
      this.fetchCategories(); // або зробити принудовий ререндер
    }
  },
    searchQuery: debounce(async function(q) {
      const t = q.trim();
      if (t) {
        this.loading = true;
        this.isVisible = true;
        try {
          const resp = await api.searchProducts(encodeURIComponent(t));
          this.results = Array.isArray(resp.data)
            ? resp.data
            : resp.data?.data || [];
        } catch {
          this.results = [];
        } finally {
          this.loading = false;
        }
      } else {
        this.resetResults();
      }
    }, 300),
  },
  methods: {
    handleCategoryClick(link) {
  if (this.$route.path === link) {
    this.isBurgerOpen = false;
    this.$router.replace('/').then(() => this.$router.push(link));
  } else {
    this.$router.push(link);
    this.isBurgerOpen = false;
  }
},
navigateToCategory(link) {
    this.isBurgerOpen = false;
    this.$router.push(link);
  },

    toggleLanguageDropdown() { this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen; },
changeLanguage(lang) {
  this.selectedLanguage = lang;
  this.$i18n.locale = lang;
  localStorage.setItem('language', lang);
  this.isLanguageDropdownOpen = false;
  this.isBurgerOpen = false;
},
    toggleCurrencyDropdown() { this.isCurrencyDropdownOpen = !this.isCurrencyDropdownOpen; },
changeCurrency(curr) {
  this.selectedCurrency = curr;
  localStorage.setItem('currency', curr.toLowerCase());
  this.isCurrencyDropdownOpen = false;
  this.isBurgerOpen = false;
  window.location.reload(); // або emit, якщо хочеш без reload
},
    toggleBurger() { this.isBurgerOpen = !this.isBurgerOpen; if (!this.isBurgerOpen) this.isCategoriesOpen = false; },
    toggleCategories() { this.isCategoriesOpen = !this.isCategoriesOpen; },
    toggleMobileSearch() { this.mobileSearchActive = !this.mobileSearchActive; },
    fetchCartCount() { api.getCartCount().then(r => this.cartCount = r.cart_count || 0).catch(() => {}); },
    fetchSiteSettings() {
      api.getSiteSettings().then(r =>
        (r.data || []).forEach(({ setting_key, setting_value }) => {
          if (setting_key === 'site_logo') this.siteSettings.site_logo = setting_value;
        })
      ).catch(() => {});
    },
    async fetchCategories() {
  try {
    const res = await api.getCategories();
    this.categories = res.data.map(cat => ({
      name: cat.name,
      link: `/category/${cat.id}`,
    }));
  } catch (e) {
    console.error('Не вдалося завантажити категорії:', e);
  }
},
    startSearch() {},
    resetResults() { this.results = []; this.isVisible = false; this.loading = false; },
    goToProduct(id) { this.$router.push(`/productpage/${id}`); this.resetResults(); this.isBurgerOpen = false;},
    formatPrice(price) {
  const val = Number(price);
  const curr = this.selectedCurrency?.toUpperCase?.() || 'UAH';
  const locale = curr === 'USD' ? 'en-US' : 'uk-UA';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
  }).format(val);
},
    handleOutsideClick(e) { if (!this.$el.contains(e.target)) this.resetResults(); }
  },
  mounted() {
  this.$nextTick(() => this.headerHeight = this.$refs.headerEl?.offsetHeight || 64);
  document.addEventListener('mousedown', this.handleOutsideClick);
  this.fetchCartCount();
  this.fetchSiteSettings();
  this.fetchCategories();
  bus.on('cart-updated', this.fetchCartCount);

  // --- АВТОМАТИЧНА УСТАНОВКА МОВИ ТА ВАЛЮТИ ---
  const savedLang = localStorage.getItem('language');
  const savedCurr = localStorage.getItem('currency');

  if (!savedLang && !savedCurr) {
    const browserLang = navigator.language || navigator.userLanguage;
    const isUkrainian = browserLang.startsWith('uk');

    if (!isUkrainian) {
      this.selectedLanguage = 'en';
      this.$i18n.locale = 'en';
      localStorage.setItem('language', 'en');

      this.selectedCurrency = 'USD';
      localStorage.setItem('currency', 'usd');

      // Якщо потрібно одразу оновити, то можна:
      // window.location.reload();
    } else {
      this.selectedLanguage = 'uk';
      this.$i18n.locale = 'uk';
      localStorage.setItem('language', 'uk');
    }
  } else {
    this.selectedLanguage = savedLang || 'uk';
    this.$i18n.locale = this.selectedLanguage;
    this.selectedCurrency = savedCurr?.toUpperCase() || 'UAH';
  }
},
  beforeUnmount() {
    document.removeEventListener('mousedown', this.handleOutsideClick);
    bus.off('cart-updated', this.fetchCartCount);
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900; font-style: normal; font-display: swap;
}
.font-base { font-family: 'Montserrat', sans-serif; font-weight: 600; }
.font-heading { font-family: 'KyivType Titling Black2', sans-serif; }
.text-body3 { font-size: 14px; line-height: 18px; font-weight: 500; }
.text-h3    { font-size: 18px; line-height: 32px; }
.price-color { color: #6B1F1F; }

/* loading-dots animation */
.loading-dots::after {
  content: '';
  animation: dots 1s steps(4, end) infinite;
}
@keyframes dots {
  0%   { content: ''; }
  33%  { content: '.'; }
  66%  { content: '..'; }
  100% { content: '...'; }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease, max-height 0.3s ease;
  overflow: hidden;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 600px; /* або що завгодно досить велике */
}


</style>
