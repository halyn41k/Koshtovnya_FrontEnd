<template>
  <header class="account-header">
    <h1 class="account-title-container">
      <div class="line"></div>
      <span class="account-title">Ваш аккаунт</span>
      <div class="line"></div>
    </h1>
  </header>
  <main class="account-page">
    <section class="account-content">
      <div class="account-sidebar">
        <nav class="profile-menu">
          <ul class="menu-list">
            <li 
              class="menu-item" 
              v-for="(menuItem, index) in menuItems" 
              :key="index" 
              @click="selectTab(index)"
              :class="{ active: activeTab === index }">
              <img 
                :src="menuItem.icon" 
                class="menu-icon"
                :class="{ 'user-icon': menuItem.title === 'Інформація', 'heart-icon': menuItem.title === 'Список бажаного' }"
                alt="Icon" />
              <h2 class="section-title">{{ menuItem.title }}</h2>
            </li>
            <li v-if="index < menuItems.length - 1" class="divider"></li>
          </ul>
        </nav>
      </div>

      <div class="account-details">
        <!-- Передаємо також userId, якщо він потрібен у дочірньому компоненті -->
        <component 
          :is="activeTabContent" 
          :userId="userId"
          :first_name="first_name" 
          :last_name="last_name" 
          :second_name="second_name" 
          :email="email" />
      </div>
    </section>

    <div v-if="message" class="message-container" :class="messageType">
      {{ message }}
    </div>
  </main>
</template>

<script>
import PersonalInfo from './PersonalInfo.vue';
import Addresses from './UserAddresses.vue';
import OrderHistory from './OrderHistory.vue';
import Wishlist from './UserWishlist.vue';

export default {
  name: 'AccountInfo',
  components: {
    PersonalInfo,
    Addresses,
    OrderHistory,
    Wishlist,
  },
  data() {
    return {
      activeTab: 0,
      userId: null,
      first_name: '', // Поля мають бути порожніми за замовчуванням
      last_name: '',
      second_name: '',
      email: '',
      menuItems: [
        { title: 'Інформація', icon: require('@/assets/user.png') },
        { title: 'Адреси', icon: require('@/assets/location.png') },
        { title: 'Історія замовлень', icon: require('@/assets/history.png') },
        { title: 'Список бажаного', icon: require('@/assets/heart.png') },
        { title: 'Вийти', icon: require('@/assets/exit.png') },
      ],
      message: '',
      messageType: '',
    };
  },
  computed: {
    activeTabContent() {
      switch (this.activeTab) {
        case 0:
          return PersonalInfo;
        case 1:
          return Addresses;
        case 2:
          return OrderHistory;
        case 3:
          return Wishlist;
        case 4:
          return null;
        default:
          return PersonalInfo;
      }
    },
  },
  methods: {
    async fetchProfile() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      this.setMessage('Ви не авторизовані. Увійдіть у систему.', 'error');
      return;
    }

    const response = await fetch('https://koshtovnya.api-dev.bmax-edu.website/api/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    // Перевірка статусу відповіді
    if (!response.ok) {
      // Отримуємо текстову відповідь для додаткової діагностики
      const errorText = await response.text();
      console.error(`Помилка сервера. Статус: ${response.status}`, errorText);
      if (response.status === 401) {
        this.setMessage('Токен недійсний. Увійдіть знову.', 'error');
        localStorage.removeItem('token');
        this.$router.push({ name: 'Login' });
      } else {
        this.setMessage(`Помилка: ${response.status}`, 'error');
      }
      return;
    }

    let jsonResponse;
    try {
      jsonResponse = await response.json();
    } catch (jsonError) {
      // Якщо не вдалося перетворити відповідь у JSON, отримуємо текст для налагодження
      const errorText = await response.text();
      console.error('Не вдалося розпарсити JSON:', jsonError, 'Отримано:', errorText);
      this.setMessage('Не вдалося розпарсити відповідь від сервера.', 'error');
      return;
    }

    console.log('Отриманий JSON:', jsonResponse);

    const user = jsonResponse.user;
    // Якщо id користувача присутній, зберігаємо його для подальших запитів
    this.userId = user.id;
    this.first_name = user.first_name || 'Невідоме ім’я';
    this.last_name = user.last_name || 'Невідоме прізвище';
    this.second_name = user.second_name || 'Невідоме по батькові';
    this.email = user.email || 'Невідомий email';
  } catch (error) {
    console.error('Сталася помилка при завантаженні профілю:', error);
    this.setMessage('Сталася помилка.', 'error');
  }
},

    async selectTab(index) {
      if (index === 4) {
        try {
          const response = await fetch('https://koshtovnya.api-dev.bmax-edu.website/api/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (response.ok) {
            localStorage.removeItem('token');
            this.$router.push({ name: 'Login' });
            this.setMessage('Вихід успішний.', 'success');
          } else {
            this.setMessage('Не вдалося вийти. Спробуйте пізніше.', 'error');
          }
        } catch (error) {
          this.setMessage('Не вдалося вийти. Спробуйте пізніше.', 'error');
        }
      } else {
        this.activeTab = index;
      }
    },
    setMessage(text, type) {
      this.message = text;
      this.messageType = type;
      setTimeout(() => {
        this.message = '';
        this.messageType = '';
      }, 5000);
    },
  },
  mounted() {
    const tab = this.$route.query.tab;
    if (tab === 'wishlist') {
      this.activeTab = 3;
    }
    this.fetchProfile();
  },
  watch: {
    '$route.query.tab'(newTab) {
      if (newTab === 'wishlist') {
        this.activeTab = 3;
      }
    },
  },
};
</script>



<style scoped>
@font-face {
  font-family: 'KyivType Titling';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Heavy2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
}

* {
  font-family: 'Merriweather', sans-serif;
}

.account-header {
  text-align: center;
}

.account-title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
}

.line {
  flex: 1;
  height: 2px;
  background-color: grey;
  margin: 0 10px;
  margin-top: 150px;
}

.account-title {
  color: #333;
  font-family: 'KyivType Titling', sans-serif;
  font-weight: 900;
  text-shadow: 0 4px 4px rgba(99, 2, 2, 0.22);
  letter-spacing: -2px;
  text-align: center;
  font-size: 30px;
  margin-bottom: 30px;
  margin-top: 170px;
}

.account-page {
  display: flex;
  flex-direction: column;
  max-width: 1300px;
  margin: 0 auto;
  height: 650px;
  background-color: #FFF7F6;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-image: url('@/assets/accountpattern.png');
  background-position: right;
  background-repeat: no-repeat;
  background-size: 50%;
}

.account-content {
  display: flex;
  margin-top: 20px;
}

.account-sidebar {
  border-right: 1px solid #ddd;
  padding: 20px;
  width: 250px;
}

.profile-menu {
  display: flex;
  flex-direction: column;
}

.menu-list {
  align-items: left;
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  margin: 15px 0;
  align-items: center;
  display: flex;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.menu-item.active {
  background-color: #F6E7E7;
}

.menu-item:hover {
  background-color: #F6E7E7;
}

.menu-icon {
  margin-right: 10px;
  width: 30px;
  height: 30px;
}

.user-icon {
  width: 23px;
  transform: translate(3px, 2px);
  margin-left: 3px;
}

.heart-icon {
  filter: brightness(0);
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  cursor: pointer;
  color: #040404;
}

.account-details {
  width: calc(100% - 250px);
  padding-left: 20px;
  padding-bottom: 50px;
}

.divider {
  height: 1px;
  background-color: #ddd;
  margin: 5px 0;
}


@media (max-width: 768px) {
  .account-content {
    flex-direction: column;
  }

  .account-sidebar,
  .account-details {
    width: 100%;
    padding: 0;
  }

  .account-page {
    background-size: cover;
    background-position: center;
  }
}
</style>