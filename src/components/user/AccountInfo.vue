<template>
  <div class="font-sans min-h-screen bg-gray-50 dark:bg-[#121212] text-black dark:text-white transition-colors duration-300">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="flex items-center justify-center mt-[80px] font-kyivBlack2 text-[34px] font-black tracking-[-1.2px] text-center">
        <div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
        {{ $t('user.title') }}
        <div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
      </h1>
    </header>

    <main
      class="flex flex-col lg:flex-row mx-auto max-w-[1300px] min-h-[500px]
             bg-[#FFF7F6] dark:bg-[#17223b] rounded-lg shadow-md overflow-hidden transition-all duration-300 mt-[100px]"
    >
      <!-- Sidebar -->
      <aside class="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-300 dark:border-gray-600 p-4">
        <ul class="flex flex-col divide-y divide-gray-300 dark:divide-gray-600">
          <li v-for="(item, i) in menuItems" :key="i" class="py-3">
            <button
              @click="onMenuItemClick(i)"
              :class="[
                'flex items-center justify-between w-full p-2 rounded-lg cursor-pointer transition-colors duration-200',
                activeTab === i
                  ? 'bg-[#F6E7E7] dark:bg-[#26314a] text-[#6B1F1F] dark:text-white'
                  : 'hover:bg-[#F2E8E8] dark:hover:bg-[#2e3a52] text-gray-800 dark:text-gray-300'
              ]"
            >
              <div class="flex items-center">
                <img :src="item.icon" :alt="item.title" class="w-5 h-5 mr-2 transition-all duration-300 dark:invert" />
                <span class="font-semibold text-base">{{ $t(item.title) }}</span>
              </div>
              <!-- Arrow only on mobile for non-logout items -->
              <svg
                v-if="i !== 4"
                class="w-4 h-4 ml-2 transition-transform duration-300 ease-in-out lg:hidden"
                :class="{
                  'rotate-90 text-[#6B1F1F] dark:text-white': openedAccordions.includes(i),
                  'text-gray-500 dark:text-gray-400': !openedAccordions.includes(i)
                }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <!-- Mobile content: accordion -->
            <div v-if="openedAccordions.includes(i) && i !== 4" class="mt-3 block lg:hidden">
              <component
                :is="activeTab === i ? activeTabContent : getTabComponent(i)"
                :userId="userId"
                :first_name="first_name"
                :last_name="last_name"
                :second_name="second_name"
                :email="email"
              />
            </div>
          </li>
        </ul>
      </aside>

      <!-- Desktop content -->
      <section class="hidden lg:block flex-1 p-6 overflow-y-auto max-h-full">
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

    <!-- Toast -->
    <div
      v-if="message"
      class="fixed top-4 right-4 px-4 py-2 rounded shadow text-sm font-medium transition-colors duration-300"
      :class="messageType === 'error'
        ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-white'
        : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-white'"
    >
      {{ message }}
    </div>
  </div>
</template>

<script>
import bus from '@/eventBus';
import PersonalInfo from './PersonalInfo.vue';
import Addresses from './UserAddresses.vue';
import OrderHistory from './OrderHistory.vue';
import Wishlist from './UserWishlist.vue';
import api from '@/services/api';

export default {
  name: 'AccountInfo',
  components: { PersonalInfo, Addresses, OrderHistory, Wishlist },
  data() {
    return {
      activeTab: 0,
      openedAccordions: [],
      userId: null,
      first_name: '',
      last_name: '',
      second_name: '',
      email: '',
      menuItems: [
        { title: 'user.info', icon: require('@/assets/icons/user2.svg') },
        { title: 'user.addresses', icon: require('@/assets/location.png') },
        { title: 'user.orderHistory', icon: require('@/assets/history.png') },
        { title: 'user.wishlist', icon: require('@/assets/icons/heart.svg') },
        { title: 'user.logout', icon: require('@/assets/exit.png') },
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
    }
  },
  methods: {
    async onMenuItemClick(i) {
      if (i === 4) {
         try {
          
        await api.logout();            // якщо є ендпоінт на бекенді
        
      } catch (e) {
        console.warn('Помилка logout:', e);
      }
      localStorage.removeItem('token'); // прибираємо токен
      // будь-які інші чистки стору/стейту
      this.$router.push('/login');     // переходимо на сторінку входу
      return;
      } else {
        // desktop: switch content
        if (window.innerWidth >= 1024) {
          this.activeTab = i;
        }
        // mobile: toggle accordion
        if (window.innerWidth < 1024) {
          this.openedAccordions = this.openedAccordions.includes(i)
            ? []
            : [i];
          this.activeTab = i;
        }
        // update query for deep linking
        const tabMap = ['personalinfo', 'addresses', 'orderhistory', 'wishlist'];
        this.$router.replace({ query: { tab: tabMap[i] } });
      }
    },
    getTabComponent(i) {
      return [PersonalInfo, Addresses, OrderHistory, Wishlist][i] || null;
    },
    setMessage(text, type) {
      this.message = text;
      this.messageType = type;
      setTimeout(() => (this.message = this.messageType = ''), 5000);
    },
    async fetchProfile() {
      try {
        const { user } = await api.getProfile();
        bus.emit('cart-updated');
        this.userId = user.id;
        this.first_name = user.first_name || '';
        this.last_name = user.last_name || '';
        this.second_name = user.second_name || '';
        this.email = user.email || '';
      } catch {
        this.setMessage('Не вдалося завантажити профіль.', 'error');
      }
    }
  },
  watch: {
    '$route.query.tab'(newTab) {
      const map = { personalinfo:0, addresses:1, orderhistory:2, wishlist:3 };
      const idx = map[newTab] ?? 0;
      this.activeTab = idx;
      this.openedAccordions = [idx];
    }
  },
  mounted() {
    const q = this.$route.query.tab;
    const map = { personalinfo:0, addresses:1, orderhistory:2, wishlist:3 };
    this.activeTab = map[q] ?? 0;
    this.openedAccordions = [this.activeTab];
    this.fetchProfile();
  }
};
</script>

<style scoped>
.font-kyivBlack2 { font-family: 'KyivType Titling Black2', sans-serif; }
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
.font-sans { font-family: 'Montserrat', sans-serif; }
</style>
