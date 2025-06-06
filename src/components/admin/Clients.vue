<template>
  <main class="w-full p-4 space-y-6 relative">
    <!-- Заголовок та кнопка -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">{{ $t('admin.clients.title') }}</h1>
      <button
  @click="openAddModal"
  class="flex items-center gap-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white px-4 py-2 rounded"
>
  <img src="@/assets/icons/plus.svg" alt="Add" class="w-5 h-5 invert dark:invert-0" />
  <span class="font-medium">{{ $t('admin.clients.add') }}</span>
</button>

    </div>

   <div class="relative w-80">
  <input
  v-model="searchQuery"
  @input="onSearch"
  type="text"
  placeholder="Пошук"
  class="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] dark:border-[#303b59] dark:bg-[#17223b] dark:text-white rounded focus:outline-none focus:ring focus:ring-pink-200"
/>
<img
  src="@/assets/icons/search.svg"
  alt="Search"
  class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none dark:invert"
/>

</div>


    <!-- Таблиця -->
    <div v-if="clients.length" class="overflow-x-auto">
     <div class="inline-block min-w-full border border-[#E0E0E0] dark:border-gray-700 rounded-md overflow-hidden">
<table class="min-w-full bg-white dark:bg-[#17223b] divide-y divide-[#E0E0E0] dark:divide-[#303b59]">
<thead class="bg-[#F6E7E7] dark:bg-[#1f2a42]">
      <tr>
        <th
  v-for="col in columns"
  :key="col.key"
  class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 text-left cursor-pointer select-none"
>

          <div class="inline-flex items-center gap-2">
            {{ col.label }}
            <img
              v-if="col.sortable"
              :src="getSortIcon(sortState[col.key])"
              class="w-4 h-4 invert dark:invert-0"
              alt=""
            />
          </div>
        </th>
        <th class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 text-left">
          {{ $t('admin.clients.status') }}
        </th>
        <th class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 text-left">
          {{ $t('admin.clients.actions') }}
        </th>
      </tr>
    </thead>

    <tbody class="bg-white dark:bg-[#17223B]">
      <tr
        v-for="client in clients"

        
        :key="client.id"
        :class="client.id === highlightedUserId ?   'border-b border-[#E0E0E0] dark:border-[#303b59]' : ''"
      >
        <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-gray-700 text-sm text-gray-800 dark:text-white">
          {{ client.id }}
        </td>
        <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-gray-700 text-sm text-gray-800 dark:text-white">
          {{ client.first_name }}
        </td>
        <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-gray-700 text-sm text-gray-800 dark:text-white">
          {{ client.last_name }}
        </td>
        <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-gray-700 text-sm text-gray-800 dark:text-white">
          {{ client.email }}
        </td>
        <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-gray-700 text-sm text-gray-800 dark:text-white">
          {{ client.order_id || '—' }}
        </td>
        <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-gray-700 text-sm text-gray-800 dark:text-white">
          {{ client.date }}
        </td>
        <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-gray-700 text-sm">
          <span :class="client.is_banned ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-green-600 dark:text-green-400 font-semibold'">
            {{ client.is_banned ? $t('admin.clients.banned') : $t('admin.clients.active') }}
          </span>
        </td>
        <td class="px-4 py-2 border-b border-[#E0E0E0] dark:border-gray-700 flex gap-2">
          <button @click="openUpdateModal(user)" class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a354e] rounded">
  <img src="@/assets/icons/edit.svg" class="w-5 h-5 dark:invert" alt="Edit" />
</button>
<button @click="deleteUser(user.id)" class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a354e] rounded">
  <img src="@/assets/icons/delete.svg" class="w-5 h-5 dark:invert" alt="Delete" />
</button>

          <button
            @click="client.is_banned ? unbanUser(client.id) : banUser(client.id)"
            class="p-1 hover:bg-gray-100 dark:hover:bg-[#333] rounded"
            :title="client.is_banned ? 'Розбанити' : 'Забанити'"
          >
            <img
              :src="client.is_banned ? require('@/assets/icons/unban.svg') : require('@/assets/icons/ban.svg')"
              class="w-5 h-5 invert dark:invert-0"
              alt="Ban"
            />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

    </div>

    <!-- Пустий стан -->
<div v-else class="py-20 text-center text-gray-500 dark:text-gray-400">
      <p v-if="!searchQuery">{{ $t('admin.clients.noUsers') }}</p>
      <p v-else>{{ $t('admin.clients.noResults', { query: searchQuery }) }}</p>
    </div>

    <!-- Пагінація -->
    <div v-if="meta.last_page > 1" class="flex justify-center items-center gap-2 mt-6">
      <button
        @click="goToPageFromUrl(meta.prev)"
        :disabled="!meta.prev"
  class="px-3 py-1 rounded bg-white dark:bg-[#1e273e] border border-[#E0E0E0] dark:border-[#303b59] hover:bg-gray-100 dark:hover:bg-[#2a354e] disabled:opacity-50"
      >&lt;</button>

      <button
        v-for="link in meta.links"
        :key="link.label"
        @click="link.url && goToPageFromUrl(link.url)"
        :class="[
          'px-3 py-1 rounded border border-[#E0E0E0] hover:bg-gray-100',
          link.active ? 'bg-[#6B1F1F] text-white' : 'bg-white'
        ]"
        v-html="link.label"
      ></button>

      <button
        @click="goToPageFromUrl(meta.next)"
        :disabled="!meta.next"
        class="px-3 py-1 rounded bg-white border border-[#E0E0E0] hover:bg-gray-100 disabled:opacity-50"
      >&gt;</button>
    </div>

    <!-- Модал -->
    <UserModal
      v-if="showUserModal"
      :user="modalClient"
      :key="modalKey"
      :title="modalTitle"
      @close="closeUserModal"
      @userSubmit="handleUserSubmit"
    />

    <!-- Toast -->
    <div
      v-if="showToast"
      class="fixed bottom-6 left-6 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded shadow"
    >
      Користувач успішно {{ toastAction }}!
    </div>
  </main>
</template>


<script>
import axios from 'axios'
import UserModal from './UserModal.vue'
import { createToastInterface } from 'vue-toastification'
const toast = createToastInterface()

export default {
  name: 'ClientList',
  components: { UserModal },
  data() {
    return {
      clients: [],
      searchQuery: '',
      searchRole: 'user',
      meta: { links: [], current_page: 1, last_page: 1, prev: null, next: null },
      sortState: { id: 'none', first_name: 'none', last_name: 'none', email: 'none', order_id: 'none', date: 'none' },
      showUserModal: false,
      modalTitle: '',
      modalKey: 0,
      modalClient: null,
      searchDebounce: null,

      showToast: false,
      toastAction: '',
      highlightedUserId: null,
      columns: [
        { key: 'id', label: this.$t('admin.orders.id'), sortable: true },
        { key: 'first_name', label: this.$t('admin.profile.firstName'), sortable: true },
        { key: 'last_name', label: this.$t('admin.profile.lastName'), sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'order_id', label: this.$t('admin.orders.id'), sortable: true },
        { key: 'date', label: this.$t('admin.orders.date'), sortable: true },

      ]
    }
  },
  mounted() {
    this.fetchUsers()
    document.title = 'Користувачі'
  },
  methods: {
   async fetchUsers(url = null) {
  try {
    const token = localStorage.getItem('token');
    const isSearch = this.searchQuery.trim().length > 0;
    const headers = { Authorization: `Bearer ${token}` };

    // Параметри для обох варіантів
    const params = {
      role: this.searchRole
    };

    // Додаємо сортування, якщо є
    const sorted = Object.entries(this.sortState).find(([, value]) => value !== 'none');
    if (sorted) {
      params.sort_by = sorted[0];
      params.sort_order = sorted[1];
    }

    // Вибір URL
    let res;
    if (isSearch) {
      res = await axios.get(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/users/search/${encodeURIComponent(this.searchQuery)}`, {
        headers,
        params
      });
    } else {
      res = await axios.get(url || `https://koshtovnya.api-dev.bmax-edu.website/api/admin/users`, {
        headers,
        params
      });
    }

    // Записуємо дані
this.clients = res.data.data;
console.log('⬅️ Юзери з API:', this.clients);
    const m = res.data.meta || {};
    this.meta = {
      links: m.links || [],
      current_page: m.current_page || 1,
      last_page: m.last_page || 1,
      prev: m.links?.find(l => l.label.includes('Previous'))?.url || null,
      next: m.links?.find(l => l.label.includes('Next'))?.url || null
    };
  } catch (e) {
    console.error('❌ Помилка при завантаженні користувачів:', e?.response?.data || e);
  }
},

    onSearch() {
  clearTimeout(this.searchDebounce);
  this.searchDebounce = setTimeout(() => {
    this.fetchUsers();
  }, 400);
},

    cycleSort(col) {
      const order = this.sortState[col]
      this.sortState = Object.fromEntries(Object.keys(this.sortState).map(k => [k, 'none']))
      this.sortState[col] = order === 'none' ? 'asc' : order === 'asc' ? 'desc' : 'none'
      this.fetchUsers()
    },
    getSortIcon(s) {
      if (s === 'asc') return require('@/assets/icons/asc.svg')
      if (s === 'desc') return require('@/assets/icons/desc.svg')
      return require('@/assets/icons/none_sorted.svg')
    },
    goToPageFromUrl(url) {
      if (!url) return
      this.fetchUsers(url)
    },
    openAddModal() {
      this.modalTitle = 'Створити користувача'
      this.modalKey = Date.now()
      this.modalClient = null
      this.showUserModal = true
    },
    openUpdateModal(client) {
  this.modalTitle = 'Оновити користувача'
  this.modalKey = Date.now()
  this.modalClient = { ...client }
  this.showUserModal = true
},
banUser(id) {
  axios.post(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/users/${id}/ban`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(() => {
    toast.success('Користувача забанено');
    const user = this.clients.find(c => c.id === id);
    if (user) user.is_banned = true;
  })
  .catch((e) => {
    console.error('❌ Помилка при бані:', e?.response?.data || e);
    toast.error('Не вдалося забанити користувача');
  });
},

unbanUser(id) {
  axios.post(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/users/${id}/unban`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(() => {
    toast.success('Користувача розбанено');
    const user = this.clients.find(c => c.id === id);
    if (user) user.is_banned = false;
  })
  .catch((e) => {
    console.error('❌ Помилка при розбані:', e?.response?.data || e);
    toast.error('Не вдалося розбанити користувача');
  });
},


    closeUserModal() {
      this.showUserModal = false
    },
    handleUserSubmit(u) {
  if (!u || typeof u !== 'object') {
    console.error('handleUserSubmit отримав невалідний обʼєкт:', u)
    return
  }

  const isUpdate = !!u.id
  const url = isUpdate
    ? `https://koshtovnya.api-dev.bmax-edu.website/api/admin/user/${u.id}`
    : 'https://koshtovnya.api-dev.bmax-edu.website/api/admin/user'

  const method = isUpdate ? 'patch' : 'post'

  axios[method](url, u, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then((r) => {
      this.toastAction = isUpdate ? 'оновлено' : 'створено'
      this.highlightedUserId = r?.data?.data?.id
setTimeout(() => (this.highlightedUserId = null), 3000)


      this.fetchUsers()
      this.closeUserModal() // ← важливо

      toast.success(`Користувача успішно ${this.toastAction}!`, { timeout: 3000 })

      setTimeout(() => (this.showToast = false), 3000)
    })
    .catch((e) => {
      console.error('❌ Помилка при збереженні користувача:', e?.response?.data || e)
    })
},
    deleteUser(id) {
  axios
    .delete(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(() => {
      this.toastAction = 'видалено'
      this.highlightedUserId = id
      this.fetchUsers()
      toast.success('Користувача успішно видалено!', { timeout: 3000 })
      setTimeout(() => (this.highlightedUserId = null), 3000)
    })
    .catch((e) => {
      console.error('❌ Помилка при видаленні користувача:', e?.response?.data || e)
      toast.error('Помилка при видаленні користувача', { timeout: 3000 })
    })
}

  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
.font-montserrat { font-family: 'Montserrat', sans-serif; }
</style>
