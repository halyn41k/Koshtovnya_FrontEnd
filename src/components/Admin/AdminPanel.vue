<template>
  <div class="admin-container">
    <!-- Міні хедер -->
    <header class="mini-header">
      <div class="mini-header-content">
        <div class="user-controls">
          <div class="user-icon" @click="showProfile = true">
            <img src="@/assets/icons/user.svg" alt="User Icon" />
          </div>
          <div class="language-switcher">
            <img :src="currentFlag" :alt="selectedLanguage + ' Flag'" class="flag" />
            <select v-model="selectedLanguage" @change="changeLanguage" class="language-select">
              <option value="uk">Українська</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </header>

    <!-- Модал профілю адміністратора -->
    <div
      v-if="showProfile"
      class="profile-modal-backdrop"
      @click.self="showProfile = false"
    >
      <div class="profile-modal">
        <button class="close-btn" @click="showProfile = false">✕</button>
        <AdminProfile />
      </div>
    </div>

    <!-- Основна частина адмін-панелі -->
    <main class="admin-panel" :class="{ blurred: showProfile }">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-wrapper">
            <img :src="siteSettings.site_logo" alt="Коштовня Лого" class="logo" />
            <div class="admin-title">Коштовня</div>
          </div>
          <div class="admin-subtitle">{{ panelSubtitle }}</div>
        </div>
        <nav class="sidebar-nav">
          <ul class="nav-list">
            <li
              class="nav-item"
              v-for="(menuItem, index) in computedMenuItems"
              :key="index"
              @click="selectTab(index)"
              :class="{ active: activeTab === index }"
            >
              <img :src="menuItem.icon" alt="" class="nav-icon" />
              <span class="nav-text">{{ menuItem.title }}</span>
            </li>
          </ul>
        </nav>
        <div class="logout" @click="logout">
          <img src="@/assets/exit.png" alt="Exit Icon" class="logout-icon" />
          <span class="logout-text">Вийти</span>
        </div>
      </aside>
      <section class="content">
        <component :is="activeComponent" />
      </section>
    </main>
  </div>
</template>

<script>
import WelcomeAdmin from './WelcomeAdmin.vue';
import Clients from './Clients.vue';
import Employees from './Employees.vue';
import ProductList from './ProductList.vue';
import Orders from './Orders.vue';
import Reports from './Reports.vue';
import Settings from './Settings.vue';
import AdminProfile from './AdminProfile.vue';

export default {
  name: 'AdminPanel',
  components: {
    WelcomeAdmin,
    Clients,
    Employees,
    ProductList,
    Orders,
    Reports,
    Settings,
    AdminProfile
  },
  data() {
    return {
      showProfile: false,
      activeTab: -1,
      user: null,
      selectedLanguage: 'uk',
      siteSettings: {
        site_logo: ''
      }
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
      switch (this.user.role) {
        case 'superadmin': return 'SUPER ADMIN PANEL';
        case 'admin':      return 'ADMIN PANEL';
        case 'manager':    return 'MANAGER PANEL';
        default:           return '';
      }
    },
    computedMenuItems() {
      if (!this.user) return [];
      if (this.user.role === 'superadmin') {
        return [
          { title: 'Користувачі',      icon: require('@/assets/icons/user.svg'),    component: 'Clients' },
          { title: 'Працівники',       icon: require('@/assets/icons/user.svg'),    component: 'Employees' },
          { title: 'Товари',           icon: require('@/assets/icons/goods.svg'),   component: 'ProductList' },
          { title: 'Замовлення',       icon: require('@/assets/icons/orders.svg'),  component: 'Orders' },
          { title: 'Звіти',            icon: require('@/assets/icons/reports.svg'), component: 'Reports' },
          { title: 'Налаштування',     icon: require('@/assets/icons/settings.svg'),component: 'Settings' }
        ];
      } else if (this.user.role === 'admin') {
        return [
          { title: 'Користувачі',      icon: require('@/assets/icons/user.svg'),    component: 'Clients' },
          { title: 'Працівники',       icon: require('@/assets/icons/user.svg'),    component: 'Employees' },
          { title: 'Товари',           icon: require('@/assets/icons/goods.svg'),   component: 'ProductList' },
          { title: 'Замовлення',       icon: require('@/assets/icons/orders.svg'),  component: 'Orders' },
          { title: 'Права доступу',    icon: require('@/assets/icons/settings.svg'),component: 'Settings' },
          { title: 'Налаштування сайту',icon: require('@/assets/icons/settings.svg'),component: 'Settings' }
        ];
      } else if (this.user.role === 'manager') {
        return [
          { title: 'Користувачі',      icon: require('@/assets/icons/user.svg'),    component: 'Clients' },
          { title: 'Товари',           icon: require('@/assets/icons/goods.svg'),   component: 'ProductList' },
          { title: 'Замовлення',       icon: require('@/assets/icons/orders.svg'),  component: 'Orders' }
        ];
      }
      return [];
    }
  },
  methods: {
    selectTab(index) {
      this.activeTab = index;
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
        const response = await this.$axios.get('http://26.235.139.202:8080/api/site-settings');
        const settings = response.data.data;
        settings.forEach(s => {
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
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

@font-face {
  font-family: 'KyivType Titling';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
}

.admin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Міні хедер */
.mini-header {
  height: 48px;
  width: 100%;
  border-bottom: 1px solid #E0E0E0;
  background-color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box;
}
.mini-header-content {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
.user-controls {
  display: flex;
  align-items: center;
  gap: 30px;
}
.user-icon img {
  width: 24px;
  height: 24px;
  cursor: pointer;
}
.language-switcher {
  display: flex;
  align-items: center;
  gap: 5px;
}
.flag {
  width: 20px;
  height: 15px;
  border-radius: 2px;
  object-fit: cover;
}
.language-select {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 400;
  border: none;
  background: transparent;
  outline: none;
  cursor: pointer;
  transition: font-weight 0.3s ease;
}
.language-select:hover,
.language-select:focus {
  font-weight: 600;
}

/* Основна частина */
.admin-panel {
  display: flex;
  flex: 1;
  position: relative;
}
.blurred {
  filter: blur(2px);
}

/* Сайдбар */
.sidebar {
  width: 250px;
  background-color: #F6E7E7;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  box-sizing: border-box;
}
.sidebar-header {
  margin-bottom: 20px;
}
.logo-wrapper {
  display: flex;
  align-items: center;
  margin-top: 20px;
  margin-left: 27px;
}
.logo {
  width: 50px;
  height: 45px;
}
.admin-title {
  font-family: 'KyivType Titling', sans-serif;
  font-size: 15px;
  font-weight: 900;
  margin-left: 10px;
}
.admin-subtitle {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 700;
  margin-top: 10px;
  margin-left: 27px;
}
.sidebar-nav .nav-list {
  list-style: none;
  padding: 0;
  position: sticky;
  top: 0;
}
.nav-item {
  display: flex;
  align-items: center;
  width: 183px;
  height: 36px;
  padding: 0 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 400;
}
.nav-item:hover {
  background-color: #D1ABAB;
  font-weight: 600;
}
.nav-item.active {
  background-color: #F2D8D8;
  border-left: 4px solid #6B1F1F;
  font-weight: 700;
}
.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
.logout {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
  width: 183px;
  transition: background-color 0.3s ease;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 400;
}
.logout:hover {
  background-color: #D1ABAB;
}
.logout-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* Модалка */
.profile-modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.profile-modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 10px; right: 10px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}
</style>
