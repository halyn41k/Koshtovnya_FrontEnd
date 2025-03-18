<template>
  <main class="admin-panel">
    <aside class="sidebar">
      <h1 class="sidebar-title">Адмін панель</h1>
      <nav class="sidebar-nav" v-if="menuItems.length">
        <ul class="nav-list">
          <li 
            class="nav-item" 
            v-for="(menuItem, index) in menuItems" 
            :key="index" 
            @click="selectTab(index)"
            :class="{ active: activeTab === index }"
          >
            <img :src="menuItem.icon" alt="" class="nav-icon" />
            <span class="nav-text">{{ menuItem.title }}</span>
          </li>
        </ul>
      </nav>
    </aside>
    <section class="content">
      <component :is="activeComponent" />
    </section>
  </main>
</template>

<script>
import WelcomeAdmin from './WelcomeAdmin.vue';
import ProductList from './ProductList.vue';
import Employees from './Employees.vue';
import Orders from './Orders.vue';
import Reports from './Reports.vue';
import Clients from './Clients.vue';
import Settings from './Settings.vue';

export default {
  name: 'AdminPanel',
  components: {
    WelcomeAdmin,
    ProductList,
    Employees,
    Orders,
    Reports,
    Clients,
    Settings,
  },
  data() {
    return {
      activeTab: -1, // -1 означає вітальний екран
      user: null
    };
  },
  computed: {
    // Формуємо список меню залежно від ролі користувача
    menuItems() {
      if (!this.user) return [];
      if (this.user.role === 'manager') {
        return [
          { title: 'Користувачі', icon: require('@/assets/arrowadmin.png'), component: 'Clients' },
          { title: 'Товари', icon: require('@/assets/arrowadmin.png'), component: 'ProductList' },
          { title: 'Замовлення', icon: require('@/assets/arrowadmin.png'), component: 'Orders' }
        ];
      } else if (this.user.role === 'admin') {
        return [
          { title: 'Користувачі', icon: require('@/assets/arrowadmin.png'), component: 'Clients' },
          { title: 'Працівники', icon: require('@/assets/arrowadmin.png'), component: 'Employees' },
          { title: 'Товари', icon: require('@/assets/arrowadmin.png'), component: 'ProductList' },
          { title: 'Замовлення', icon: require('@/assets/arrowadmin.png'), component: 'Orders' }
        ];
      } else if (this.user.role === 'superadmin') {
        return [
          { title: 'Користувачі', icon: require('@/assets/arrowadmin.png'), component: 'Clients' },
          { title: 'Працівники', icon: require('@/assets/arrowadmin.png'), component: 'Employees' },
          { title: 'Товари', icon: require('@/assets/arrowadmin.png'), component: 'ProductList' },
          { title: 'Замовлення', icon: require('@/assets/arrowadmin.png'), component: 'Orders' },
          { title: 'Налаштування', icon: require('@/assets/arrowadmin.png'), component: 'Settings' },
        ];
      } else {
        return [];
      }
    },
    // Визначає активний компонент залежно від вибраної вкладки
    activeComponent() {
      if (this.activeTab === -1) return 'WelcomeAdmin';
      return this.menuItems[this.activeTab].component;
    }
  },
  methods: {
    selectTab(index) {
      this.activeTab = index;
    }
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !['superadmin', 'admin', 'manager'].includes(user.role)) {
      this.$router.push({ name: 'Home' });
    } else {
      this.user = user;
    }
  }
};
</script>

<style scoped>
.admin-panel {
  font-family: 'Montserrat', sans-serif;
  display: flex;
  margin-top: 180px;
}

.sidebar {
  background-color: #fff7f6;
  display: flex;
  flex-direction: column;
  padding: 40px 20px;
  width: 20%;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  margin-top: 180px;
  z-index: 1;
}

.sidebar-title {
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 20px;
  margin-left: 45px;
}

.nav-list {
  list-style-type: none;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
  transition: color 0.3s ease;
  margin-left: 15px;
}

.nav-item:hover {
  color: #333;
}

.nav-item.active {
  background-color: #EADCDC;
  border-radius: 8px;
  height: 35px;
}

.nav-icon {
  width: 16px;
  height: 20px;
}

.content {
  margin-left: 20%;
  padding: 40px;
  width: 80%;
  overflow-y: auto;
}
</style>
