<template>
  <main class="p-6 max-w-7xl mx-auto font-montserrat">
    <!-- Заголовок та кнопка Додати -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">Користувачі</h1>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white px-4 py-2 rounded"
      >
        <img src="@/assets/icons/plus.svg" alt="Add" class="w-5 h-5"/>
        <span class="font-medium">Додати</span>
      </button>
    </div>

    <!-- Пошук -->
    <div class="mb-6">
      <div class="relative w-80">
        <input
          v-model="searchQuery"
          @input="onSearch"
          type="text"
          placeholder="Пошук"
          class="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] rounded focus:outline-none focus:ring focus:ring-pink-200"
        />
        <img
          src="@/assets/icons/search.svg"
          alt="Search"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
        />
      </div>
    </div>

    <!-- Таблиця -->
    <div v-if="clients.length" class="overflow-x-auto">
      <!-- Обгортка з border-radius -->
      <div class="inline-block min-w-full border border-[#E0E0E0] rounded-md overflow-hidden">
        <table class="min-w-full bg-white divide-y divide-[#E0E0E0]">
          <thead class="bg-[#F6E7E7]">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                @click="cycleSort(col.key)"
                class="px-4 py-2 text-sm font-medium text-gray-600 text-left cursor-pointer select-none"
              >
                <div class="inline-flex items-center gap-2">
                  {{ col.label }}
                  <img
                    v-if="col.sortable"
                    :src="getSortIcon(sortState[col.key])"
                    class="w-4 h-4"
                    alt=""
                  />
                </div>
              </th>
              <th class="px-4 py-2 text-sm font-medium text-gray-600 text-left">Дії</th>
            </tr>
          </thead>
          <tbody class="bg-white">
            <tr
              v-for="client in clients"
              :key="client.id"
              :class="client.id === highlightedUserId ? 'bg-green-50' : ''"
            >
              <td class="px-4 py-2 border-b border-[#E0E0E0] text-sm text-gray-800 text-left">{{ client.id }}</td>
              <td class="px-4 py-2 border-b border-[#E0E0E0] text-sm text-gray-800 text-left">{{ client.first_name }}</td>
              <td class="px-4 py-2 border-b border-[#E0E0E0] text-sm text-gray-800 text-left">{{ client.last_name }}</td>
              <td class="px-4 py-2 border-b border-[#E0E0E0] text-sm text-gray-800 text-left">{{ client.email }}</td>
              <td class="px-4 py-2 border-b border-[#E0E0E0] text-sm text-gray-800 text-left">{{ client.order_id || '—' }}</td>
              <td class="px-4 py-2 border-b border-[#E0E0E0] text-sm text-gray-800 text-left">{{ client.date }}</td>
              <td class="px-4 py-2 border-b border-[#E0E0E0] flex gap-2">
                <button @click="openUpdateModal(client)" class="p-1 hover:bg-gray-100 rounded">
                  <img src="@/assets/icons/edit.svg" class="w-5 h-5" alt="Edit"/>
                </button>
                <button @click="deleteUser(client.id)" class="p-1 hover:bg-gray-100 rounded">
                  <img src="@/assets/icons/delete.svg" class="w-5 h-5" alt="Delete"/>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Пустий стан -->
    <div v-else class="py-20 text-center text-gray-500">
      <p v-if="!searchQuery">Поки що не було додано жодного користувача.</p>
      <p v-else>За запитом «<strong>{{ searchQuery }}</strong>» нічого не знайдено.</p>
    </div>

    <!-- Пагінація -->
    <div v-if="meta.last_page > 1" class="flex justify-center items-center gap-2 mt-6">
      <button
        @click="goToPageFromUrl(meta.prev)"
        :disabled="!meta.prev"
        class="px-3 py-1 rounded bg-white border border-[#E0E0E0] hover:bg-gray-100 disabled:opacity-50"
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

    <!-- Модал користувача -->
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
      showToast: false,
      toastAction: '',
      highlightedUserId: null,
      columns: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'first_name', label: 'Ім’я', sortable: true },
        { key: 'last_name', label: 'Прізвище', sortable: true },
        { key: 'email', label: 'Електронна пошта', sortable: true },
        { key: 'order_id', label: '№ Замовлення', sortable: true },
        { key: 'date', label: 'Додано', sortable: true }
      ]
    }
  },
  mounted() {
    this.fetchUsers()
    document.title = 'Користувачі'
  },
  methods: {
    async fetchUsers(url = null) {
      const endpoint = url || 'https://koshtovnya.api-dev.bmax-edu.website/api/admin/users'
      const params = url ? {} : { role: this.searchRole, search: this.searchQuery }
      const sorted = Object.entries(this.sortState).find(([, v]) => v !== 'none')
      if (sorted) {
        params.sort_by = sorted[0]
        params.sort_order = sorted[1]
      }
      try {
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: { ...params, ...(url ? {} : { search: this.searchQuery }) }
        })
        this.clients = res.data.data
        const m = res.data.meta
        this.meta = {
          links: m.links,
          current_page: m.current_page,
          last_page: m.last_page,
          prev: m.links.find(l => l.label.includes('Previous'))?.url,
          next: m.links.find(l => l.label.includes('Next'))?.url
        }
      } catch (e) {
        console.error(e)
      }
    },
    onSearch() {
      if (!this.searchQuery.trim()) return this.fetchUsers()
      this.fetchUsers()
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
        this.modalClient = { ...client } // обʼєкт повний з id

      this.showUserModal = true
    },
    closeUserModal() {
      this.showUserModal = false
    },
    async handleUserSubmit(u) {
  if (!u) {
    console.error('handleUserSubmit отримав undefined');
    return;
  }

  const isUpd = !!u.id;
  if (isUpd && typeof u.id !== 'number') {
    console.warn('u.id не число або некоректне значення:', u.id, u);
  }

  const url = isUpd
    ? `https://koshtovnya.api-dev.bmax-edu.website/api/admin/user/${u.id}`
    : 'https://koshtovnya.api-dev.bmax-edu.website/api/admin/user';

  const method = isUpd ? 'patch' : 'post';

  try {
    const r = await axios[method](url, u, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    this.toastAction = isUpd ? 'оновлено' : 'створено';
    this.highlightedUserId = r.data.data.id;
    this.fetchUsers();
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  } catch (e) {
    console.error('Помилка при збереженні користувача:', e);
  }
},
    deleteUser(id) {
      axios
        .delete(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/user/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(() => {
          this.toastAction = 'видалено'
          this.highlightedUserId = id
          this.fetchUsers()
          this.showToast = true
          setTimeout(() => (this.showToast = false), 3000)
        })
        .catch(e => console.error(e))
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
.font-montserrat { font-family: 'Montserrat', sans-serif; }
</style>
