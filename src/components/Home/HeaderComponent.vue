<template>
  <div>
    <!-- Header -->
    <header
      ref="headerEl"
      class="fixed top-0 w-full bg-[#fafafa] shadow z-50 md:px-[50px] font-base text-body3 leading-[18px]"
    >
      <!-- Top bar -->
      <div class="flex justify-between items-center pt-4 pb-2 px-4 md:px-0">
        <!-- Про нас / Про доставку -->
        <ul class="flex space-x-6">
          <li>
            <router-link
              to="/aboutus"
              class="relative text-semantic-secondary transition-colors before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:h-[2px] before:bg-black before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform"
            >
              {{ $t('aboutUs') }}
            </router-link>
          </li>
          <li>
            <router-link
              to="/aboutdelivery"
              class="relative text-semantic-secondary transition-colors before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:h-[2px] before:bg-black before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform"
            >
              {{ $t('aboutDelivery') }}
            </router-link>
          </li>
        </ul>

        <div class="flex items-center space-x-6">
          <!-- Language -->
          <div class="relative">
            <button @click="toggleLanguageDropdown" class="flex items-center space-x-2">
              <img :src="currentFlag" :alt="selectedLanguage + ' Flag'" class="w-5 h-4 rounded-sm shadow-sm"/>
              <span>{{ selectedLanguage === 'uk' ? 'Українська' : 'English' }}</span>
              <svg
                :class="{ 'rotate-180': isLanguageDropdownOpen }"
                class="w-4 h-4 transform transition-transform"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul
              v-if="isLanguageDropdownOpen"
              class="absolute right-0 mt-2 w-40 bg-white border border-stroke rounded-lg shadow-lg overflow-hidden"
            >
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

          <!-- Currency -->
          <div class="relative">
            <button @click="toggleCurrencyDropdown" class="flex items-center space-x-1">
              <span>{{ selectedCurrency }}</span>
              <svg
                :class="{ 'rotate-180': isCurrencyDropdownOpen }"
                class="w-4 h-4 transform transition-transform"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul
              v-if="isCurrencyDropdownOpen"
              class="absolute right-0 mt-2 w-32 bg-white border border-stroke rounded-lg shadow-lg overflow-hidden"
            >
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

          <!-- Wishlist -->
          <router-link
            :to="{ path: '/account', query: { tab: 'wishlist' } }"
            class="relative text-semantic-secondary transition-colors before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:h-[2px] before:bg-black before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform"
          >
            {{ $t('wishlist') }}
          </router-link>
        </div>
      </div>

      <div class="h-px bg-[#e5e5e5]"></div>


      <!-- Main: Search, Logo, Controls -->
      <div class="flex items-center justify-between py-3 px-4 md:px-0">
        <!-- Desktop search: відкриває рамку тільки на фокусі -->
              <div
          class="hidden md:flex items-center bg-[#F2E8E8] rounded-lg overflow-hidden
                focus-within:border focus-within:border-stroke transition"
        >
          <input
            v-model="searchQuery"
            @keyup.enter="startSearch"
            :placeholder="$t('searchPlaceholder')"
            class="w-70 px-3 py-2 bg-transparent border-none focus:outline-none text-input"
          />
          <button @click="startSearch" class="px-3 flex-shrink-0">
            <img src="@/assets/magnifying-glass-svgrepo-com.svg" alt="Search" class="w-5 h-5"/>
          </button>
          <SearchResults v-if="searchQuery" :query="searchQuery" class="absolute top-full left-0 mt-1"/>
        </div>


        <!-- Logo -->
        <router-link to="/" class="relative flex items-center space-x-2 md:left-[-100px]">
          <img :src="siteSettings.site_logo" alt="Logo" class="w-14 h-12"/>
          <h1 class="font-heading text-h3 text-semantic-primary font-black">Коштовня</h1>
        </router-link>

        <!-- User / Cart / Burger -->
        <div class="flex items-center space-x-4">
          <router-link to="/account" class="hover:text-primary transition">
            <img src="@/assets/user-svgrepo-com (1).svg" alt="User" class="w-6 h-6"/>
          </router-link>

          <!-- Mobile search button -->
          <button @click="toggleMobileSearch" class="md:hidden">
            <img src="@/assets/icons/search1.svg" alt="Mobile Search" class="w-6 h-6"/>
          </button>

          <!-- Cart -->
          <router-link to="/cart" class="relative hover:text-primary transition">
            <img src="@/assets/cart-svgrepo-com.svg" alt="Cart" class="w-6 h-6"/>
            <span
              v-if="cartCount"
              class="absolute -top-1 -right-2 bg-[#A01212] text-white font-semibold text-[10px]
                     rounded-full w-4 h-4 flex items-center justify-center animate-bounce"
            >
              {{ cartCount }}
            </span>
          </router-link>

          <!-- Burger -->
          <button @click="toggleBurger" class="md:hidden ml-4 focus:outline-none">
            <img src="@/assets/icons/burger.svg" alt="Menu" class="w-6 h-6"/>
          </button>
        </div>
      </div>

      <!-- Desktop categories -->
<nav class="hidden md:block bg-[#F6E7E7] md:-mx-[50px]">
  <ul class="flex justify-center space-x-1 py-1 px-4 md:px-0 font-base">
    <li v-for="cat in categories" :key="cat.link">
      <router-link
        :to="cat.link"
        class="relative inline-block px-2 py-1 text-[#6B1F1F] transition-colors duration-300 ease-in-out
               hover:bg-[#fafafa] hover:text-[#6B1F1F]
               before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0
               before:h-[2px] before:bg-[#6B1F1F] before:scale-x-0 hover:before:scale-x-100
               before:origin-left before:transition-transform before:duration-300"
      >
        {{ $t(cat.name) }}
      </router-link>
    </li>
  </ul>
</nav>



      <!-- Mobile categories -->
      <div v-if="isBurgerOpen" class="md:hidden bg-[#FFF7F6] border-t border-stroke">
        <ul class="px-4 py-2 space-y-2">
          <li>
            <button @click="toggleCategories" class="w-full flex justify-between items-center">
              Категорії
              <svg
                :class="{ 'rotate-180': isCategoriesOpen }"
                class="w-4 h-4 transform transition-transform"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <ul v-if="isCategoriesOpen" class="mt-2 pl-4 space-y-1">
              <li v-for="cat in categories" :key="cat.link">
                <router-link :to="cat.link">{{ $t(cat.name) }}</router-link>
              </li>
            </ul>
          </li>
          <li><router-link to="/aboutus">{{ $t('aboutUs') }}</router-link></li>
          <li><router-link to="/aboutdelivery">{{ $t('aboutDelivery') }}</router-link></li>
        </ul>
      </div>
    </header>

    <!-- Mobile search dropdown -->
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
            :placeholder="$t('searchPlaceholder')"
            class="flex-1 px-3 py-2 bg-[#F2E8E8] border-none focus:outline-none text-input"
          />
          <button @click="startSearch" class="px-3">
            <img src="@/assets/magnifying-glass-svgrepo-com.svg" alt="Search" class="w-5 h-5"/>
          </button>
        </div>
      </div>
    </transition>
  </div>
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
      categories: [
        { name: 'bracelets', link: '/bracelets' },
        { name: 'herdany',   link: '/herdany'   },
        { name: 'dukats',    link: '/dukats'    },
        { name: 'earrings',  link: '/earrings'  },
        { name: 'sylyanky',  link: '/sylyanky'  },
        { name: 'belts',     link: '/belts'     }
      ],
      selectedLanguage: 'uk',
      selectedCurrency: 'UAH',
      cartCount: 0,
      searchQuery: '',
      isLanguageDropdownOpen: false,
      isCurrencyDropdownOpen: false,
      isBurgerOpen: false,
      isCategoriesOpen: false,
      mobileSearchActive: false,
      headerHeight: 0,
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
  mounted() {
    this.$nextTick(() => {
      const h = this.$refs.headerEl;
      this.headerHeight = h ? h.offsetHeight : 64;
    });
    this.fetchCartCount();
    this.fetchSiteSettings();
  },
  methods: {
    toggleLanguageDropdown() {
      this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    },
    changeLanguage(lang) {
      this.selectedLanguage = lang;
      this.$i18n.locale = lang;
      this.isLanguageDropdownOpen = false;
    },
    toggleCurrencyDropdown() {
      this.isCurrencyDropdownOpen = !this.isCurrencyDropdownOpen;
    },
    changeCurrency(curr) {
      this.selectedCurrency = curr;
      this.isCurrencyDropdownOpen = false;
    },
    toggleBurger() {
      this.isBurgerOpen = !this.isBurgerOpen;
      if (!this.isBurgerOpen) this.isCategoriesOpen = false;
    },
    toggleCategories() {
      this.isCategoriesOpen = !this.isCategoriesOpen;
    },
    toggleMobileSearch() {
      this.mobileSearchActive = !this.mobileSearchActive;
    },
    async fetchCartCount() {
      try {
        const res = await api.getCartCount();
        this.cartCount = res.cart_count || 0;
      } catch (e) {
        console.error(e);
      }
    },
    async fetchSiteSettings() {
      try {
        const res = await api.getSiteSettings();
        (res.data || []).forEach(({ setting_key, setting_value }) => {
          if (setting_key === 'site_logo') {
            this.siteSettings.site_logo = setting_value;
          }
        });
      } catch (e) {
        console.error(e);
      }
    },
    startSearch() {
      // логіка пошуку
    }
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

/* Slide-down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>

