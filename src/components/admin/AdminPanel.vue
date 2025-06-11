<template>
<div class="flex flex-col min-h-screen font-['Montserrat',sans-serif] bg-white dark:bg-gray-900">
    <!-- Міні-хедер -->
<header
  class="fixed top-0 left-0 right-0 h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50 flex justify-end items-center px-4 shadow-sm"
>
  <div class="flex items-center space-x-6">
    <div @click="showProfile = true" class="cursor-pointer">
<img
  src="@/assets/icons/user_icon.svg"
  alt="User Icon"
  class="w-5 h-5 dark:invert"
/>    </div>
      
        <div class="flex items-center space-x-6">

            <div class="flex items-center">
  <div class="relative w-6 h-6">
    <!-- Сонце -->
    <img
      src="@/assets/icons/sun.svg"
      alt="sun"
      class="absolute w-6 h-6 transition-opacity duration-500"
      :class="{ 'opacity-0': isDarkMode, 'opacity-100': !isDarkMode }"
    />
    <!-- Місяць -->
    <img
      src="@/assets/icons/moon.svg"
      alt="moon"
      class="absolute w-6 h-6 transition-opacity duration-500"
      :class="{ 'opacity-100': isDarkMode, 'opacity-0': !isDarkMode }"
    />
  </div>

  <button
    @click="toggleDarkMode"
    class="mx-2 w-12 h-6 rounded-full relative bg-gray-300 dark:bg-gray-600 transition-colors duration-500"
  >
    <span
      class="absolute top-0 left-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-500"
      :class="isDarkMode ? 'translate-x-6' : 'translate-x-0'"
    ></span>
  </button>
</div>
          <!-- Language selector -->
          <div class="relative z-50">
            <button
              @click="toggleLanguageDropdown"
              class="flex items-center space-x-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <img
                :src="currentFlag"
                :alt="state.language + ' flag'"
                class="w-5 h-4 rounded-sm shadow-sm"
              />
              <span>{{ state.language === 'uk' ? 'Українська' : 'English' }}</span>
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
              class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-stroke dark:border-gray-600 rounded-lg shadow-lg overflow-hidden z-50"
            >
              <li>
                <button
                  @click="changeLanguage('uk')"
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 rounded-lg"
                >
                  Українська
                </button>
              </li>
              <li>
                <button
                  @click="changeLanguage('en')"
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 rounded-lg"
                >
                  English
                </button>
              </li>
            </ul>
          </div>

   


          <!-- Currency selector -->
          <div class="relative z-50">
            <button
              @click="toggleCurrencyDropdown"
              class="flex items-center space-x-1 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <span>{{ state.currency }}</span>
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
              class="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-stroke dark:border-gray-600 rounded-lg shadow-lg overflow-hidden z-50"
            >
              <li>
                <button
                  @click="changeCurrency('UAH')"
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 rounded-lg"
                >
                  UAH ₴
                </button>
              </li>
              <li>
                <button
                  @click="changeCurrency('USD')"
                  class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 rounded-lg"
                >
                  USD $
                </button>
              </li>
            </ul>
          </div>


  </div>
  </div>
</header>




    <AdminProfileCard v-if="showProfile" @close="showProfile = false" />

    <main :class="['flex flex-1 relative pt-12', showProfile ? 'filter blur-sm' : '']">

      <aside
  :class="[
    'bg-[#F6E7E7] dark:bg-[#17223b] text-black dark:text-white flex flex-col justify-between transition-all duration-300 ease-in-out',
    sidebarCollapsed ? 'w-16' : 'w-64'
  ]"
>

        <div>
          <div class="flex items-center justify-between mt-5 px-4">
            <div class="flex items-center" v-if="!sidebarCollapsed">
              <img :src="siteSettings.site_logo" alt="Logo" class="w-12 h-11" />
              <span
  class="text-sm font-black ml-2 text-black dark:text-white"
  style="font-family:'KyivType Titling Black2';"
>

              {{ $t('admin.panel.siteName') }}</span>
            </div>
            <button @click="sidebarCollapsed = !sidebarCollapsed" class="p-1 ml-auto">
             <img
  :src="sidebarCollapsed ? require('@/assets/icons/arrow_right.svg') : require('@/assets/icons/arrow_left.svg')"
  class="w-5 h-5 dark:invert"
/>

            </button>
          </div>

<div
  class="mt-2 mb-4 h-5 ml-6 text-sm font-bold text-gray-700 dark:text-gray-300 transition-opacity duration-200"
               :class="{ 'opacity-0': sidebarCollapsed, 'opacity-100': !sidebarCollapsed }">
            {{ panelSubtitle }}
          </div>

<ul class="space-y-2 sticky top-0 px-2 text-black dark:text-white">
            <li
              v-for="(menuItem, index) in computedMenuItems"
              :key="index"
              @click="selectTab(index)"
              :class="[
  'flex items-center h-9 rounded-[4px] cursor-pointer px-2 transition',
  activeTab === index
    ? 'bg-[#F2D8D8] dark:bg-[#303b59] border-l-4 border-[#6B1F1F]'
    : 'hover:bg-[#D1ABAB] dark:hover:bg-[#303b59]'
]">

<img
  :src="menuItem.icon"
  alt=""
  class="w-5 h-5 mr-2 dark:invert"
/>
              <span v-if="!sidebarCollapsed">{{ $t('admin.menu.' + menuItem.title) }}</span>
            </li>
          </ul>
        </div>

        <div @click="$router.push({ name: 'Home' })" class="px-2 mb-2">
  <div class="flex items-center h-9 px-3 rounded-[4px] cursor-pointer hover:bg-[#D1ABAB] dark:hover:bg-[#303b59] transition">

<img
  src="@/assets/icons/home.svg"
  alt="Home Icon"
  class="w-5 h-5 mr-2 dark:invert"
/>
            <span v-if="!sidebarCollapsed">{{ $t('admin.menu.goHome') }}</span>
          </div>
        </div>

        <div class="px-2">
          <div
            @click="logout"
            class="flex items-center h-9 px-3 rounded-[4px] cursor-pointer hover:bg-[#D1ABAB] transition"
          >
<img
  src="@/assets/exit.png"
  alt="Exit Icon"
  class="w-5 h-5 mr-2 dark:invert"
/>
            <span v-if="!sidebarCollapsed">{{ $t('admin.menu.logout') }}</span>
          </div>
        </div>
      </aside>

      <section class="flex-1 p-5 overflow-y-auto">
  <div class="w-full max-w-[1600px] mx-auto">
    <component :is="activeComponent" v-if="activeComponent" />
  </div>
</section>

    </main>
  </div>
</template>
<script>
import AdminProfileCard from './AdminProfile.vue';
import WelcomeAdmin from './WelcomeAdmin.vue';
import Clients from './Clients.vue';
import Employees from './Employees.vue';
import ProductList from './ProductList.vue';
import Orders from './Orders.vue';
import Reports from './Reports.vue';
import Settings from './Settings.vue';
import DashboardView from './dashboard/Dashboard.vue';
import Multiselect from 'vue-multiselect';
import { useHeaderStore } from '@/store/modules/headerStore';
import api from '@/services/api';
import { toggleTheme } from '@/composables/useDarkMode';

export default {
  name: 'AdminPanel',
  components: {
    AdminProfileCard,
    WelcomeAdmin,
    Clients,
    Employees,
    ProductList,
    Orders,
    Reports,
    Settings,
    DashboardView,
    Multiselect,
  },
  setup() {
    const state = useHeaderStore();
    return { state };
  },
  data() {
    return {
      showProfile: false,
      activeTab: -1,
      user: null,
      isLanguageDropdownOpen: false,
      isCurrencyDropdownOpen: false,
      siteSettings: { site_logo: '' },
      sidebarCollapsed: false,
    };
  },
  computed: {
    // лише геттери, без сайд-ефектів
    activeComponent() {
      if (this.activeTab === -1) return 'WelcomeAdmin';
      const item = this.computedMenuItems[this.activeTab];
      return item ? item.component : 'WelcomeAdmin';
    },
    currentFlag() {
      return this.state.language === 'uk'
        ? 'https://flagcdn.com/w320/ua.png'
        : 'https://flagcdn.com/w320/gb.png';
    },
    isDarkMode() {
      return this.state.isDarkMode;
    },
    panelSubtitle() {
      if (!this.user) return '';
      const map = {
        superadmin: 'SUPER ADMIN PANEL',
        admin: 'ADMIN PANEL',
        manager: 'MANAGER PANEL',
      };
      return map[this.user.role] || '';
    },
    computedMenuItems() {
      if (!this.user) return [];
      const items = {
        superadmin: [
          ['statistics', 'DashboardView', 'stats'],
          ['users', Clients, 'people'],
          ['employees', Employees, 'people'],
          ['products', ProductList, 'goods'],
          ['orders', Orders, 'orders'],
          ['reports', Reports, 'reports'],
          ['settings', Settings, 'settings'],
        ],
        admin: [
          ['statistics', 'DashboardView', 'stats'],
          ['users', Clients, 'people'],
          ['employees', Employees, 'people'],
          ['products', ProductList, 'goods'],
          ['orders', Orders, 'orders'],
          ['accessRights', Settings, 'settings'],
          ['siteSettings', Settings, 'settings'],
        ],
        manager: [
          ['statistics', 'DashboardView', 'stats'],
          ['users', Clients, 'people'],
          ['products', ProductList, 'goods'],
          ['orders', Orders, 'orders'],
        ],
      };
      return items[this.user.role].map(([title, comp, icon]) => ({
        title,
        component: comp,
        icon: require(`@/assets/icons/${icon}.svg`),
      }));
    },
  },
  methods: {
    toggleDarkMode() {
      toggleTheme();
      this.state.isDarkMode = !this.state.isDarkMode;
    },
    toggleLanguageDropdown() {
      this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    },
    toggleCurrencyDropdown() {
      this.isCurrencyDropdownOpen = !this.isCurrencyDropdownOpen;
    },
    selectTab(idx) {
      this.activeTab = idx;
    },
    logout() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.$router.push({ name: 'Login' });
    },
    changeLanguage(lang) {
      this.state.language = lang;
      this.$i18n.locale = lang;
      window.location.reload();
    },
    changeCurrency(curr) {
      this.state.currency = curr;
      window.location.reload();
    },
    async fetchSiteSettings() {
      try {
        const response = await api.getSiteSettings();
        const settingsArray = response.data.data || response.data;
        settingsArray.forEach(s => {
          if (s.setting_key === 'site_logo') {
            this.siteSettings.site_logo = s.setting_value;
          }
        });
      } catch (err) {
        console.error('Помилка завантаження логотипу:', err);
      }
    },
  },
  mounted() {
      this.state.isDarkMode = document.documentElement.classList.contains('dark');

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !['superadmin', 'admin', 'manager'].includes(user.role)) {
      this.$router.push({ name: 'Home' });
    } else {
      this.user = user;
    }
    this.fetchSiteSettings();
    this.$i18n.locale = this.state.language;
  },
};
</script>

<style scoped>
@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

.custom-multiselect .multiselect__option--highlight::after {
  display: none !important;
}

.multiselect__option--highlight {
  background: #F3F4F6 !important; /* Ніжно-рожевий */
  color: #6B1F1F !important; /* Головний колір тексту */
}
.multiselect__option--selected {
  font-weight: 600 !important; /* semibold */
}

.multiselect__option--selected::after {
  content: 'Обрано' !important;
  color: #9CA3AF; /* світло-сірий */
  font-size: 0.75rem; /* text-sm */
  font-weight: 500;
  float: right;
  margin-right: 1rem;
}


</style>