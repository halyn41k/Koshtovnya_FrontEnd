<template>
  <div class="font-sans min-h-screen bg-gray-50">
    <!-- Header -->
   <header class=" mt-[200px] mb-8">

  <h1
    class="flex items-center justify-center mt-[80px] font-kyivBlack2 text-[34px] font-black tracking-[-1.2px] text-center"
  >
      <div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
  {{ $t('user.title') }}
  <div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
</h1>
</header>


    <main
  class="flex flex-col lg:flex-row mx-auto max-w-[1300px] min-h-[500px]
         bg-[#FFF7F6] rounded-lg shadow-md bg-no-repeat bg-right bg-[length:50%] overflow-hidden"
  style="background-image:url('@/assets/accountpattern.png')"
>



      <!-- Sidebar -->
      <!-- Mobile-friendly sidebar -->
      <aside class="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-300 p-4">
  <ul class="flex flex-col divide-y divide-gray-300">
    <li
  v-for="(item, i) in menuItems"
  :key="i"
  class="py-3"
>
  <button
    @click="toggleAccordion(i)"
    :class="[
      'flex items-center justify-between w-full p-2 rounded-lg cursor-pointer transition-colors duration-200',
      activeTab === i ? 'bg-[#F6E7E7] text-[#6B1F1F]' : 'hover:bg-[#F2E8E8] text-gray-800'
    ]"
  >
    <div class="flex items-center">
      <img :src="item.icon" :alt="item.title" class="w-5 h-5 mr-2" />
      <span class="font-semibold text-base">
  {{ $t(item.title) }}
</span>

    </div>

    <svg
      v-if="i !== 4"
      class="w-4 h-4 transition-transform duration-200 lg:hidden"
      :class="{ 'rotate-90': openedAccordions.includes(i) }"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5l7 7-7 7" />
    </svg>
  </button>

  <!-- Mobile only accordion content -->
  <div
    v-if="openedAccordions.includes(i) && i !== 4"
    class="mt-3 block lg:hidden"
  >
    <component
      :is="getTabComponent(i)"
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




<!-- Content: only shown on desktop -->
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
import api from '@/services/api';


export default {
  name: 'AccountInfo',
  components: { PersonalInfo, Addresses, OrderHistory, Wishlist },
  data() {
    return {
      activeTab: 0,
      openedAccordions: [0],
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
    },
  },
  methods: {
    toggleAccordion(i) {
  if (i === 4) {
    this.selectTab(i);
    return;
  }

  if (this.openedAccordions.includes(i)) {
    this.openedAccordions = this.openedAccordions.filter(idx => idx !== i);
  } else {
    this.openedAccordions.push(i);
  }

  // Паралельно оновлюємо активну вкладку для десктопу
  this.activeTab = i;
},

getTabComponent(i) {
  switch (i) {
    case 0: return 'PersonalInfo';
    case 1: return 'Addresses';
    case 2: return 'OrderHistory';
    case 3: return 'Wishlist';
    default: return null;
  }
},

    async fetchProfile() {
  try {
    const { user } = await api.getProfile();
    this.userId = user.id;
    this.first_name = user.first_name || '';
    this.last_name = user.last_name || '';
    this.second_name = user.second_name || '';
    this.email = user.email || '';
  } catch (error) {
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
.font-kyivBlack2 {
  font-family: 'KyivType Titling Black2', sans-serif;
}

@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

.font-sans {
  font-family: 'Montserrat', sans-serif;
}

</style>
