<template>
  <div class="font-sans min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="text-center mt-[170px] mb-8">
      <h1 class="flex items-center justify-center">
        <div class="flex-1 h-px bg-gray-400 mx-4"></div>
        <span class="text-3xl font-black tracking-tight text-gray-800">
          Ваш аккаунт
        </span>
        <div class="flex-1 h-px bg-gray-400 mx-4"></div>
      </h1>
    </header>

    <main
      class="flex flex-col lg:flex-row mx-auto max-w-[1300px] h-[650px]
             bg-[#FFF7F6] rounded-lg shadow-md bg-no-repeat bg-right bg-[length:50%] overflow-hidden"
      style="background-image:url('@/assets/accountpattern.png')"
    >
      <!-- Sidebar -->
      <aside class="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-300 p-6">
        <nav>
          <ul class="flex flex-col space-y-4">
            <li
              v-for="(item, i) in menuItems"
              :key="i"
              @click="selectTab(i)"
              :class="[
                'flex items-center p-2 rounded-lg cursor-pointer transition-colors',
                activeTab === i ? 'bg-[#F6E7E7]' : 'hover:bg-[#F6E7E7]'
              ]"
            >
              <img
                :src="item.icon"
                :alt="item.title"
                class="w-6 h-6 mr-3"
              />
              <span class="text-base font-medium text-gray-900">
                {{ item.title }}
              </span>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Content -->
      <section class="flex-1 p-6 overflow-auto">
        <component
          :is="activeTabContent"
          :userId="userId"
          :first_name="first_name"
          :last_name="last_name"
          :second_name="second_name"
          :email="email"
        />
      </section>
    </main>

    <!-- Message -->
    <div
      v-if="message"
      class="fixed top-4 right-4 px-4 py-2 rounded shadow text-sm font-medium"
      :class="messageType === 'error'
        ? 'bg-red-100 text-red-700'
        : 'bg-green-100 text-green-700'"
    >
      {{ message }}
    </div>
  </div>
</template>

<script>
import PersonalInfo from './PersonalInfo.vue';
import Addresses from './UserAddresses.vue';
import OrderHistory from './OrderHistory.vue';
import Wishlist from './UserWishlist.vue';

export default {
  name: 'AccountInfo',
  components: { PersonalInfo, Addresses, OrderHistory, Wishlist },
  data() {
    return {
      activeTab: 0,
      userId: null,
      first_name: '',
      last_name: '',
      second_name: '',
      email: '',
      menuItems: [
        { title: 'Інформація', icon: require('@/assets/icons/user_icon.svg') },
        { title: 'Адреси', icon: require('@/assets/location.png') },
        { title: 'Історія замовлень', icon: require('@/assets/history.png') },
        { title: 'Список бажаного', icon: require('@/assets/icons/heart.svg') },
        { title: 'Вийти', icon: require('@/assets/exit.png') },
      ],
      message: '',
      messageType: '',
    };
  },
  computed: {
    activeTabContent() {
      switch (this.activeTab) {
        case 0: return PersonalInfo;
        case 1: return Addresses;
        case 2: return OrderHistory;
        case 3: return Wishlist;
        default: return null;
      }
    },
  },
  methods: {
    async fetchProfile() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.setMessage('Ви не авторизовані. Увійдіть у систему.', 'error');
        return;
      }
      try {
        const res = await fetch('https://koshtovnya.api-dev.bmax-edu.website/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw res;
        const { user } = await res.json();
        this.userId = user.id;
        this.first_name = user.first_name || '';
        this.last_name = user.last_name || '';
        this.second_name = user.second_name || '';
        this.email = user.email || '';
      } catch {
        this.setMessage('Не вдалося завантажити профіль.', 'error');
      }
    },
    async selectTab(i) {
      if (i === 4) {
        try {
          const res = await fetch('https://koshtovnya.api-dev.bmax-edu.website/api/logout', {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            localStorage.removeItem('token');
            this.$router.push({ name: 'Login' });
            this.setMessage('Вихід успішний.', 'success');
          } else {
            this.setMessage('Не вдалося вийти. Спробуйте пізніше.', 'error');
          }
        } catch {
          this.setMessage('Не вдалося вийти. Спробуйте пізніше.', 'error');
        }
      } else {
        this.activeTab = i;
      }
    },
    setMessage(text, type) {
      this.message = text;
      this.messageType = type;
      setTimeout(() => (this.message = this.messageType = ''), 5000);
    }
  },
  mounted() {
    const tab = this.$route.query.tab;
    if (tab === 'wishlist') this.activeTab = 3;
    this.fetchProfile();
  },
  watch: {
    '$route.query.tab'(t) { if (t === 'wishlist') this.activeTab = 3; }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
.font-sans { font-family: 'Montserrat', sans-serif; }
</style>
