<template>
  <div class="flex flex-col h-screen font-['Montserrat',sans-serif]">
    <!-- Міні-хедер -->
<header class="fixed top-0 left-0 right-0 h-12 bg-white border-b border-gray-200 z-50 flex justify-end items-center px-4 shadow-sm">
  <div class="flex items-center space-x-6">
    <div @click="showProfile = true" class="cursor-pointer">
      <img src="@/assets/icons/user_icon.svg" alt="User Icon" class="w-5 h-5" />
    </div>
      <div class="flex items-center space-x-2">
    <img
      :src="currentFlag"
      :alt="selectedLanguage + ' Flag'"
      class="w-5 h-4 rounded-sm object-cover"
    />
    <Multiselect
  v-model="selectedLanguage"
  :options="languageOptions"
  :custom-label="opt => opt.name"
  :track-by="'code'"
  placeholder="Оберіть мову"
  class="w-36 custom-multiselect"
/>


  </div>
  </div>
</header>




    <AdminProfileCard v-if="showProfile" @close="showProfile = false" />

    <main :class="['flex flex-1 relative pt-12', showProfile ? 'filter blur-sm' : '']">

      <aside
        :class="[
          'bg-[#F6E7E7] flex flex-col justify-between transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-64'
        ]"
      >
        <div>
          <div class="flex items-center justify-between mt-5 px-4">
            <div class="flex items-center" v-if="!sidebarCollapsed">
              <img :src="siteSettings.site_logo" alt="Logo" class="w-12 h-11" />
              <span
                class="text-sm font-black ml-2"
                style="font-family:'KyivType Titling Black2';"
              >Коштовня</span>
            </div>
            <button @click="sidebarCollapsed = !sidebarCollapsed" class="p-1 ml-auto">
              <img
                :src="sidebarCollapsed ? require('@/assets/icons/arrow_right.svg') : require('@/assets/icons/arrow_left.svg')"
                class="w-5 h-5"
              />
            </button>
          </div>

          <div class="mt-2 mb-4 h-5 ml-6 text-sm font-bold transition-opacity duration-200"
               :class="{ 'opacity-0': sidebarCollapsed, 'opacity-100': !sidebarCollapsed }">
            {{ panelSubtitle }}
          </div>

          <ul class="space-y-2 sticky top-0 px-2">
            <li
              v-for="(menuItem, index) in computedMenuItems"
              :key="index"
              @click="selectTab(index)"
              :class="[
                'flex items-center h-9 rounded-[4px] cursor-pointer px-2',
                activeTab === index
                  ? 'bg-[#F2D8D8] border-l-4 border-[#6B1F1F]'
                  : 'hover:bg-[#D1ABAB]'
              ]"
            >
              <img :src="menuItem.icon" alt="" class="w-5 h-5 mr-2" />
              <span v-if="!sidebarCollapsed">{{ menuItem.title }}</span>
            </li>
          </ul>
        </div>

        <div @click="$router.push({ name: 'Home' })" class="px-2 mb-2">
          <div class="flex items-center h-9 px-3 rounded-[4px] cursor-pointer hover:bg-[#D1ABAB] transition">
            <img src="@/assets/icons/home.svg" alt="Home Icon" class="w-5 h-5 mr-2" />
            <span v-if="!sidebarCollapsed">На головну</span>
          </div>
        </div>

        <div class="px-2">
          <div
            @click="logout"
            class="flex items-center h-9 px-3 rounded-[4px] cursor-pointer hover:bg-[#D1ABAB] transition"
          >
            <img src="@/assets/exit.png" alt="Exit Icon" class="w-5 h-5 mr-2" />
            <span v-if="!sidebarCollapsed">Вийти</span>
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
import Multiselect from 'vue-multiselect'

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
    Multiselect
  },
  data() {
    return {
      showProfile: false,
      activeTab: -1,
      user: null,
         selectedLanguage: { code: 'uk', name: 'Українська', flag: 'https://flagcdn.com/w320/ua.png' },
    languageOptions: [
      { code: 'uk', name: 'Українська', flag: 'https://flagcdn.com/w320/ua.png' },
      { code: 'en', name: 'English', flag: 'https://flagcdn.com/w320/gb.png' }
    ],
      siteSettings: { site_logo: '' },
      sidebarCollapsed: false
    }
  },
  computed: {
    activeComponent() {
      if (this.activeTab === -1) return 'WelcomeAdmin';
      const item = this.computedMenuItems[this.activeTab];
      return item ? item.component : 'WelcomeAdmin';
    },
    currentFlag() {
  return this.selectedLanguage?.flag || 'https://flagcdn.com/w320/ua.png';
},

    panelSubtitle() {
      if (!this.user) return '';
      const map = {
        superadmin: 'SUPER ADMIN PANEL',
        admin: 'ADMIN PANEL',
        manager: 'MANAGER PANEL'
      };
      return map[this.user.role] || '';
    },
    computedMenuItems() {
      if (!this.user) return [];
      const items = {
        superadmin: [
          ['Статистика', 'DashboardView', 'stats'],
          ['Користувачі', Clients, 'people'],
          ['Працівники', Employees, 'people'],
          ['Товари', ProductList, 'goods'],
          ['Замовлення', Orders, 'orders'],
          ['Звіти', Reports, 'reports'],
          ['Налаштування', Settings, 'settings'],
        
        ],
        admin: [
          ['Статистика', 'DashboardView', 'stats'],
          ['Користувачі', Clients, 'people'],
          ['Працівники', Employees, 'people'],
          ['Товари', ProductList, 'goods'],
          ['Замовлення', Orders, 'orders'],
          ['Права доступу', Settings, 'settings'],
          ['Налаштування сайту', Settings, 'settings']
        ],
        manager: [
          ['Статистика', 'DashboardView', 'stats'],
          ['Користувачі', Clients, 'people'],
          ['Товари', ProductList, 'goods'],
          ['Замовлення', Orders, 'orders']
        ]
      };
      return items[this.user.role].map(([title, comp, icon]) => ({
        title,
        component: comp,
        icon: require(`@/assets/icons/${icon}.svg`)
      }));
    }
  },
  methods: {
    selectTab(idx) {
      this.activeTab = idx;
    },
    logout() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.$router.push({ name: 'Login' });
    },
    changeLanguage() {
      this.$i18n.locale = this.selectedLanguage;
    },
    async fetchSiteSettings() {
      try {
        const { data } = await this.$axios.get('https://koshtovnya.api-dev.bmax-edu.website/api/site-settings');
        data.data.forEach(s => {
          if (s.setting_key === 'site_logo') {
            this.siteSettings.site_logo = s.setting_value;
          }
        });
      } catch (err) {
        console.error('Помилка завантаження логотипу:', err);
      }
    }
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !['superadmin', 'admin', 'manager'].includes(user.role)) {
      this.$router.push({ name: 'Home' });
    } else {
      this.user = user;
    }
    this.fetchSiteSettings();
  }
}
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