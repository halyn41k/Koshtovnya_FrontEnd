<template> 
  <header
    class="fixed top-0 w-full bg-[#fafafa] shadow z-50 px-[50px] font-base text-body3 leading-[18px]"
  >
    <div class="flex justify-between items-center py-2">
      <ul class="flex space-x-6">
        <li>
          <router-link
            to="/aboutus"
            class="text-semantic-secondary hover:text-primary transition-colors"
          >
            {{ $t('aboutUs') }}
          </router-link>
        </li>
        <li>
          <router-link
            to="/aboutdelivery"
            class="text-semantic-secondary hover:text-primary transition-colors"
          >
            {{ $t('aboutDelivery') }}
          </router-link>
        </li>
      </ul>

      <div class="flex items-center space-x-6">
        <!-- Language dropdown -->
        <div class="relative">
          <button @click="toggleLanguageDropdown" class="flex items-center space-x-2">
            <img :src="currentFlag" :alt="selectedLanguage + ' Flag'" class="w-5 h-4 rounded-sm shadow-sm"/>
            <span>{{ selectedLanguage === 'uk' ? 'Українська' : 'English' }}</span>
            <svg :class="{'rotate-180': isLanguageDropdownOpen}" class="w-4 h-4 transform transition-transform"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ul v-if="isLanguageDropdownOpen"
              class="absolute right-0 mt-2 w-40 bg-white border border-stroke rounded-lg shadow-lg overflow-hidden">
            <li>
              <button @click="changeLanguage('uk')" class="w-full px-4 py-2 text-left hover:bg-action-hover transition">
                Українська
              </button>
            </li>
            <li>
              <button @click="changeLanguage('en')" class="w-full px-4 py-2 text-left hover:bg-action-hover transition">
                English
              </button>
            </li>
          </ul>
        </div>

        <!-- Currency dropdown -->
        <div class="relative">
          <button @click="toggleCurrencyDropdown" class="flex items-center space-x-1">
            <span>{{ selectedCurrency }}</span>
            <svg :class="{'rotate-180': isCurrencyDropdownOpen}" class="w-4 h-4 transform transition-transform"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ul v-if="isCurrencyDropdownOpen"
              class="absolute right-0 mt-2 w-32 bg-white border border-stroke rounded-lg shadow-lg overflow-hidden">
            <li>
              <button @click="changeCurrency('UAH')" class="w-full px-4 py-2 text-left hover:bg-action-hover transition">
                UAH ₴
              </button>
            </li>
            <li>
              <button @click="changeCurrency('USD')" class="w-full px-4 py-2 text-left hover:bg-action-hover transition">
                USD $
              </button>
            </li>
          </ul>
        </div>

        <router-link :to="{ path: '/account', query: { tab: 'wishlist' } }"
                     class="text-semantic-secondary hover:text-primary transition">
          {{ $t('wishlist') }}
        </router-link>
      </div>
    </div>

    <div class="h-px bg-stroke"></div>

    <div class="flex items-center justify-between py-3">
      <!-- Search bar desktop -->
      <div class="hidden md:flex items-center bg-card rounded-lg overflow-hidden border border-stroke">
        <input
          v-model="searchQuery"
          @keyup.enter="startSearch"
          :placeholder="$t('searchPlaceholder')"
          class="px-3 py-2 w-64 bg-[#F2E8E8] border-none focus:outline-none focus:border focus:border-primary text-input"
        />
        <button @click="startSearch" class="px-3">
          <img src="@/assets/magnifying-glass-svgrepo-com.svg" alt="Search" class="w-5 h-5"/>
        </button>
        <SearchResults v-if="searchQuery" :query="searchQuery" class="absolute top-full left-0 mt-1"/>
      </div>

      <!-- Logo -->
      <router-link to="/" class="flex items-center space-x-2">
        <img :src="siteSettings.site_logo" alt="Logo" class="w-10 h-10"/>
        <h1 class="font-heading text-h3 text-semantic-primary font-black">Коштовня</h1>
      </router-link>

      <!-- User & Cart & Burger -->
      <div class="flex items-center space-x-4">
        <router-link to="/account" class="hover:text-primary transition">
          <img src="@/assets/user-svgrepo-com (1).svg" alt="User" class="w-6 h-6"/>
        </router-link>

        <button @click="toggleMobileSearch" class="md:hidden">
          <img src="@/assets/icons/search1.svg" alt="Mobile Search" class="w-6 h-6"/>
        </button>

        <router-link to="/cart" class="relative hover:text-primary transition">
          <img src="@/assets/cart-svgrepo-com.svg" alt="Cart" class="w-6 h-6"/>
          <span
            v-if="cartCount"
            class="absolute -top-1 -right-2 bg-[#A01212] text-white font-semibold font-base text-[10px] rounded-full w-4 h-4 flex items-center justify-center animate-bounce"
          >
            {{ cartCount }}
          </span>
        </router-link>

        <button @click="toggleBurger" class="md:hidden ml-4 focus:outline-none">
          <img src="@/assets/icons/burger.svg" alt="Menu" class="w-6 h-6"/>
        </button>
      </div>
    </div>

    <!-- Desktop categories nav -->
    <nav class="hidden md:block bg-[#F6E7E7]">
      <ul class="flex justify-center space-x-6 py-2 font-medium-text-[16px] font-base text-semantic-primary">
        <li><router-link to="/bracelets" class="hover:text-primary transition">{{ $t('bracelets') }}</router-link></li>
        <li><router-link to="/herdany"   class="hover:text-primary transition">{{ $t('herdany') }}</router-link></li>
        <li><router-link to="/dukats"    class="hover:text-primary transition">{{ $t('dukats') }}</router-link></li>
        <li><router-link to="/earrings"  class="hover:text-primary transition">{{ $t('earrings') }}</router-link></li>
        <li><router-link to="/sylyanky"  class="hover:text-primary transition">{{ $t('sylyanky') }}</router-link></li>
        <li><router-link to="/belts"     class="hover:text-primary transition">{{ $t('belts') }}</router-link></li>
      </ul>
    </nav>

    <!-- Mobile search dropdown -->
    <div
      v-if="mobileSearchActive"
      class="fixed top-[64px] left-0 w-full bg-body-1 px-[50px] py-2 border-b border-stroke md:hidden"
    >
      <div class="flex items-center bg-card rounded-lg overflow-hidden border border-stroke">
        <input
          v-model="searchQuery"
          @keyup.enter="startSearch"
          :placeholder="$t('searchPlaceholder')"
          class="px-3 py-2 w-full bg-[#F2E8E8] border-none focus:outline-none focus:border focus:border-primary text-input"
        />
        <button @click="startSearch" class="px-3">
          <img src="@/assets/magnifying-glass-svgrepo-com.svg" alt="Search" class="w-5 h-5"/>
        </button>
      </div>
      <SearchResults v-if="searchQuery" :query="searchQuery" class="mt-2"/>
    </div>

    <!-- Mobile categories -->
    <div v-if="isBurgerOpen" class="md:hidden bg-[#fafafa] border-t border-stroke">
      <ul class="px-4 py-2 space-y-2">
        <li>
          <button @click="toggleCategories" class="w-full flex justify-between items-center">
            {{ $t('categories') }}
            <svg :class="{'rotate-180': isCategoriesOpen}" class="w-4 h-4 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <ul v-if="isCategoriesOpen" class="mt-2 pl-4 space-y-1">
            <li><router-link to="/bracelets">{{ $t('bracelets') }}</router-link></li>
            <li><router-link to="/herdany"   >{{ $t('herdany')   }}</router-link></li>
            <li><router-link to="/dukats"    >{{ $t('dukats')    }}</router-link></li>
            <li><router-link to="/earrings"  >{{ $t('earrings')  }}</router-link></li>
            <li><router-link to="/sylyanky"  >{{ $t('sylyanky')  }}</router-link></li>
            <li><router-link to="/belts"     >{{ $t('belts')     }}</router-link></li>
          </ul>
        </li>
        <li><router-link to="/aboutus">{{ $t('aboutUs') }}</router-link></li>
        <li><router-link to="/aboutdelivery">{{ $t('aboutDelivery') }}</router-link></li>
      </ul>
    </div>
  </header>
</template>

<script>
// eslint-disable-next-line 
import SearchResults from "./SearchResults.vue";
import api from '@/services/api';

export default {
  name: 'HeaderComponent',
  components: { SearchResults },
  data() {
    return {
      selectedLanguage: 'uk',
      selectedCurrency: 'UAH',
      cartCount: 0,
      searchQuery: '',
      isLanguageDropdownOpen: false,
      isCurrencyDropdownOpen: false,
      isBurgerOpen: false,
      isCategoriesOpen: false,
      mobileSearchActive: false,
      siteSettings: { site_logo: '' }
    };
  },
  computed: {
    currentFlag() {
      return this.selectedLanguage === 'uk'
        ? 'https://flagcdn.com/w320/ua.png'
        : 'https://flagcdn.com/w320/gb.png';
    }
  },
  methods: {
    toggleLanguageDropdown() { this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen; },
    changeLanguage(lang) {
      this.selectedLanguage = lang;
      this.$i18n.locale = lang;
      this.isLanguageDropdownOpen = false;
    },
    toggleCurrencyDropdown() { this.isCurrencyDropdownOpen = !this.isCurrencyDropdownOpen; },
    changeCurrency(curr) { this.selectedCurrency = curr; this.isCurrencyDropdownOpen = false; },
    toggleBurger() { this.isBurgerOpen = !this.isBurgerOpen; if (!this.isBurgerOpen) this.isCategoriesOpen = false; },
    toggleCategories() { this.isCategoriesOpen = !this.isCategoriesOpen; },
    toggleMobileSearch() { this.mobileSearchActive = !this.mobileSearchActive; },
    async fetchCartCount() {
      try {
        const res = await api.getCartCount();
        this.cartCount = res.cart_count || 0;
      } catch (e) { console.error(e) }
    },
    async fetchSiteSettings() {
      try {
        const res = await api.getSiteSettings();
        (res.data || []).forEach(({ setting_key, setting_value }) => {
          if (setting_key === 'site_logo') this.siteSettings.site_logo = setting_value;
        });
      } catch (e) { console.error(e) }
    },
    startSearch() {
      // логіка пошуку
    }
  },
  async mounted() {
    await Promise.all([this.fetchSiteSettings(), this.fetchCartCount()]);
  }
};
</script>

<style scoped>
/* Підключення Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

/* Оголошення локального шрифту KyivType */
@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

/* Фолбеки для Tailwind-класів font-family */
.font-base {
  font-family: 'Montserrat', sans-serif;
}
.font-heading {
  font-family: 'KyivType Titling Heavy2', sans-serif;
}

/* Фолбеки для розмірів шрифтів і міжрядкових відстаней */
.text-body3 {
  font-size: 14px;
  line-height: 18px;
}
.text-h3 {
  font-size: 24px;
  line-height: 32px;
}
</style>