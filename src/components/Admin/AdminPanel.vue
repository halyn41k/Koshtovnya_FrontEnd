<template>
  <main class="admin-panel">
    <aside class="sidebar">
      <h1 class="sidebar-title">Адмін панель</h1>
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item" v-for="(menuItem, index) in menuItems" :key="index" @click="selectTab(index)"
            :class="{ active: activeTab === index }">
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
import WelcomeAdmin from './WelcomeAdmin.vue'; // Компонент вітального екрану
import ProductList from './ProductList.vue'; // Компонент списку товарів
import Employees from './Employees.vue'; // Компонент працівників
import Orders from './Orders.vue'; // Компонент замовлень
import Reports from './Reports.vue'; // Компонент звітів
import Clients from './Clients.vue'; // Компонент клієнтів
import Settings from './Settings.vue'; // Компонент налаштувань

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
      activeTab: -1, // Активна вкладка (-1 для вітального екрану)
      menuItems: [
        { title: 'Товари', icon: require('@/assets/arrowadmin.png') },
        { title: 'Працівники', icon: require('@/assets/arrowadmin.png') },
        { title: 'Замовлення', icon: require('@/assets/arrowadmin.png') },
        { title: 'Звіти', icon: require('@/assets/arrowadmin.png') },
        { title: 'Клієнти', icon: require('@/assets/arrowadmin.png') },
        { title: 'Налаштування', icon: require('@/assets/arrowadmin.png') },
      ],
    };
  },
  computed: {
    activeComponent() {
      // Визначає, який компонент відображати на основі активної вкладки
      if (this.activeTab === -1) return 'WelcomeAdmin';
      switch (this.activeTab) {
        case 0: return 'ProductList';
        case 1: return 'Employees';
        case 2: return 'Orders';
        case 3: return 'Reports';
        case 4: return 'Clients';
        case 5: return 'Settings';
        default: return 'ProductList';
      }
    },
  },
  methods: {
    selectTab(index) {
      this.activeTab = index; // Встановлює активну вкладку
    },
  },
  mounted() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !['superadmin', 'admin', 'manager'].includes(user.role)) {
    this.$router.push({ name: 'Home' });
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
  position: relative;
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

/* Content section styling */
.content {
  margin-left: 20%;
  /* Offset by sidebar width */
  padding: 40px;
  width: 80%;
  overflow-y: auto;
}
</style>
