<template>
  <div class="flex flex-col h-screen font-['Montserrat',sans-serif]">
    <!-- Міні-хедер -->
    <header class="h-12 w-full border-b border-gray-200 bg-white flex items-center px-5">
      <div class="ml-auto flex items-center space-x-8">
        <div @click="showProfile = true" class="cursor-pointer">
          <img src="@/assets/icons/user.svg" alt="User Icon" class="w-6 h-6"/>
        </div>
        <div class="flex items-center space-x-1">
          <img :src="currentFlag" :alt="selectedLanguage + ' Flag'" class="w-5 h-4 rounded-sm object-cover"/>
          <select
            v-model="selectedLanguage"
            @change="changeLanguage"
            class="bg-transparent outline-none cursor-pointer"
          >
            <option value="uk">Українська</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </header>

    <!-- Модалка профілю -->
    <AdminProfileCard
      v-if="showProfile"
      @close="showProfile = false"
    />

    <!-- Адмін-панель -->
    <main :class="['flex flex-1 relative', showProfile ? 'filter blur-sm' : '']">
      <!-- Сайдбар -->
      <aside class="w-64 bg-[#F6E7E7] flex flex-col justify-between p-5">
        <div>
          <div class="flex items-center mt-5 ml-7 mb-2">
            <img :src="siteSettings.site_logo" alt="Коштовня Лого" class="w-12 h-11"/>
            <span
              class="text-sm font-black ml-2"
              style="font-family:'KyivType Titling Black2';"
            >Коштовня</span>
          </div>
          <div class="text-sm font-bold ml-7 mb-5">{{ panelSubtitle }}</div>
          <ul class="space-y-2 sticky top-0">
            <li
              v-for="(menuItem, index) in computedMenuItems"
              :key="index"
              @click="selectTab(index)"
              :class="[
                'flex items-center h-9 px-2 rounded-[4px] cursor-pointer',
                activeTab === index
                  ? 'bg-[#F2D8D8] border-l-4 border-[#6B1F1F]'
                  : 'hover:bg-[#D1ABAB]'
              ]"
            >
              <img :src="menuItem.icon" alt="" class="w-5 h-5 mr-2"/>
              <span>{{ menuItem.title }}</span>
            </li>
          </ul>
        </div>
        <div
          @click="logout"
          class="flex items-center h-9 px-2 rounded-[4px] cursor-pointer hover:bg-[#D1ABAB]"
        >
          <img src="@/assets/exit.png" alt="Exit Icon" class="w-5 h-5 mr-2"/>
          <span>Вийти</span>
        </div>
      </aside>

      <!-- Контент -->
      <section class="flex-1 p-5 overflow-y-auto">
        <component :is="activeComponent" />
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
    Settings
  },
  data() {
    return {
      showProfile: false,
      activeTab: -1,
      user: null,
      selectedLanguage: 'uk',
      siteSettings: { site_logo: '' }
    };
  },
  computed: {
    activeComponent() {
      return this.activeTab === -1
        ? 'WelcomeAdmin'
        : this.computedMenuItems[this.activeTab].component;
    },
    currentFlag() {
      return this.selectedLanguage === 'uk'
        ? 'https://flagcdn.com/w320/ua.png'
        : 'https://flagcdn.com/w320/gb.png';
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
          ['Користувачі','Clients'],
          ['Працівники','Employees'],
          ['Товари','ProductList'],
          ['Замовлення','Orders'],
          ['Звіти','Reports'],
          ['Налаштування','Settings']
        ],
        admin: [
          ['Користувачі','Clients'],
          ['Працівники','Employees'],
          ['Товари','ProductList'],
          ['Замовлення','Orders'],
          ['Права доступу','Settings'],
          ['Налаштування сайту','Settings']
        ],
        manager: [
          ['Користувачі','Clients'],
          ['Товари','ProductList'],
          ['Замовлення','Orders']
        ]
      };
      return items[this.user.role].map(([title, comp]) => ({
        title,
        icon: require(`@/assets/icons/${
          title==='Товари'?'goods':
          title==='Замовлення'?'orders':'user'
        }.svg`),
        component: comp
      }));
    }
  },
  methods: {
    selectTab(idx) { this.activeTab = idx; },
    logout() {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      this.$router.push({ name: 'Login' });
    },
    changeLanguage() { this.$i18n.locale = this.selectedLanguage; },
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
    if (!user || !['superadmin','admin','manager'].includes(user.role)) {
      this.$router.push({ name: 'Home' });
    } else {
      this.user = user;
    }
    this.fetchSiteSettings();
  }
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
</style>
