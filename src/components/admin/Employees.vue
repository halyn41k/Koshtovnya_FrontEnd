<template>
  <main class="w-full p-4 space-y-6 relative">
    <!-- Заголовок та кнопка Додати -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-black dark:text-white">{{ $t('admin.employees.title') }}</h1>
      <button
        @click="openAddModal"
        class="flex items-center gap-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white px-4 py-2 rounded"
      >
        <img src="@/assets/icons/plus.svg" alt="{{ $t('admin.employees.add') }}" class="w-5 h-5" />
        <span class="font-medium">{{ $t('admin.employees.add') }}</span>
      </button>
    </div>

    <!-- Пошук -->
    <div class="mb-6">
      <div class="relative w-80">
        <input
          v-model="searchQuery"
          @input="onSearch"
          type="text"
          :placeholder="$t('admin.employees.search')"
          class="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] dark:border-[#303b59] dark:bg-[#17223b] dark:text-white rounded focus:outline-none focus:ring focus:ring-pink-200"
        />
        <img
          src="@/assets/icons/search.svg"
          alt="{{ $t('admin.employees.search') }}"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none dark:invert"
        />
      </div>
    </div>

    <!-- Таблиця -->
    <div v-if="employees.length" class="overflow-x-auto">
      <div class="inline-block min-w-full border border-[#E0E0E0] dark:border-[#303b59] rounded-md overflow-hidden">
        <table class="min-w-full bg-white dark:bg-[#17223b] divide-y divide-[#E0E0E0] dark:divide-[#303b59]">
          <thead class="bg-[#F6E7E7] dark:bg-[#1f2a42]">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 text-left cursor-pointer select-none"
                @click="cycleSort(col.key)"
              >
                <div class="inline-flex items-center gap-2">
                  {{ $t(`admin.employees.columns.${col.key}`) }}
                  <img
                    v-if="col.sortable"
                    :src="getSortIcon(sortState[col.key])"
                    class="w-4 h-4 invert dark:invert-0"
                    alt=""
                  />
                </div>
              </th>
              <th class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 text-left">{{ $t('admin.employees.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="emp in employees"
              :key="emp.id"
              :class="['border-b border-[#E0E0E0] dark:border-[#303b59]', emp.id === highlightedEmployeeId ? 'bg-green-50 dark:bg-green-900/40' : 'dark:bg-[#17223b]']"
            >
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ emp.id }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ emp.first_name }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ emp.email }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ emp.phone_number || '—' }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ emp.date }}</td>
              <td class="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{{ emp.role }}</td>
              <td class="px-4 py-2 flex gap-2">
                <button @click="openUpdateModal(emp)" class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a354e] rounded">
                  <img src="@/assets/icons/edit.svg" class="w-5 h-5 dark:invert" alt="{{ $t('admin.employees.edit') }}" />
                </button>
                <button @click="deleteEmployee(emp.id)" class="p-1 hover:bg-gray-100 dark:hover:bg-[#2a354e] rounded">
                  <img src="@/assets/icons/delete.svg" class="w-5 h-5 dark:invert" alt="{{ $t('admin.employees.delete') }}" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Пустий стан -->
    <div v-else class="py-20 text-center text-gray-500 dark:text-gray-400">
      <p v-if="!searchQuery">{{ $t('admin.employees.noEmployees') }}</p>
      <p v-else>{{ $t('admin.employees.noResults', { query: searchQuery }) }}</p>
    </div>

    <!-- Пагінація -->
    <div v-if="meta.last_page > 1" class="flex justify-center items-center gap-2 mt-6">
      <button
        @click="goToPage(meta.prev)"
        :disabled="!meta.prev"
        class="px-3 py-1 rounded bg-white dark:bg-[#1e273e] border border-[#E0E0E0] dark:border-[#303b59] hover:bg-gray-100 dark:hover:bg-[#2a354e] disabled:opacity-50"
      >&lt;</button>

      <button
        v-for="link in meta.links"
        :key="link.label"
        @click="link.url && goToPage(link.url)"
        :class="['px-3 py-1 rounded border border-[#E0E0E0]', link.active ? 'bg-[#6B1F1F] text-white' : 'bg-white dark:bg-[#1e273e] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#2a354e]']"
        v-html="link.label"
      ></button>

      <button
        @click="goToPage(meta.next)"
        :disabled="!meta.next"
        class="px-3 py-1 rounded bg-white dark:bg-[#1e273e] border border-[#E0E0E0] dark:border-[#303b59] hover:bg-gray-100 dark:hover:bg-[#2a354e] disabled:opacity-50"
      >&gt;</button>
    </div>

    <!-- Toast -->
    <div
      v-if="showToast"
      class="fixed bottom-6 left-6 bg-green-100 dark:bg-green-800/20 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 px-4 py-2 rounded shadow"
    >
      {{ $t('admin.employees.toastMessage', { action: toastAction }) }}
    </div>
      <EmployeeModal
      v-if="showEmployeeModal"
      :key="modalKey"
      :employee="modalEmployee"
      :title="modalTitle"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </main>

</template>

<script>
import axios from 'axios'
import EmployeeModal from './EmployeeModal.vue'
import { createToastInterface } from 'vue-toastification'
const toast = createToastInterface()

export default {
  name: 'EmployeeList',
  components: { EmployeeModal },
  data() {
    return {
      employees: [],
      searchQuery: '',
      searchRole: 'employee',
      meta: { links: [], current_page: 1, last_page: 1, prev: null, next: null },
      sortState: {
        id: 'none',
        first_name: 'none',
        email: 'none',
        phone_number: 'none',
        hire_date: 'none',
        role: 'none'
      },
      showEmployeeModal: false,
      modalTitle: '',
      modalKey: 0,
      modalEmployee: null,
      highlightedEmployeeId: null,
      showToast: false,
      toastAction: '',
      searchDebounce: null,
      columns: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'first_name', label: 'Ім’я', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'phone_number', label: 'Телефон', sortable: true },
        { key: 'date',      label: 'Дата працевлаштування', sortable: true },
        { key: 'role', label: 'Роль', sortable: true }
      ]
    }
  },
  mounted() {
    this.fetchEmployees()
    document.title = 'Працівники'
  },
  methods: {
    async fetchEmployees(url = null) {
      let endpoint, params

      if (url) {
        endpoint = url
        params = {}
      } else if (this.searchQuery.trim()) {
        endpoint = `https://koshtovnya.api-dev.bmax-edu.website/api/admin/users/search/${encodeURIComponent(this.searchQuery)}`
        params = { role: this.searchRole }
      } else {
        endpoint = 'https://koshtovnya.api-dev.bmax-edu.website/api/admin/users'
        params = { role: this.searchRole }
      }

      const sorted = Object.entries(this.sortState).find(([, v]) => v !== 'none')
      if (sorted) {
        params.sort_by = sorted[0]
        params.sort_order = sorted[1]
      }

      try {
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params
        })
        this.employees = res.data.data
        const m = res.data.meta
        if (m) {
          this.meta = {
            links: m.links,
            current_page: m.current_page,
            last_page: m.last_page,
            prev: m.links.find(l => l.label.includes('Previous'))?.url,
            next: m.links.find(l => l.label.includes('Next'))?.url
          }
        } else {
          this.meta = { links: [], current_page: 1, last_page: 1, prev: null, next: null }
        }
      } catch (e) {
        console.error('Error fetching employees:', e)
      }
    },

    onSearch() {
      clearTimeout(this.searchDebounce)
      this.searchDebounce = setTimeout(() => {
        this.fetchEmployees()
      }, 400)
    },

    cycleSort(col) {
      const order = this.sortState[col]
      Object.keys(this.sortState).forEach(k => (this.sortState[k] = 'none'))
      this.sortState[col] = order === 'none' ? 'asc' : order === 'asc' ? 'desc' : 'none'
      this.fetchEmployees()
    },

    getSortIcon(state) {
      if (state === 'asc') return require('@/assets/icons/asc.svg')
      if (state === 'desc') return require('@/assets/icons/desc.svg')
      return require('@/assets/icons/none_sorted.svg')
    },

    goToPage(url) {
      if (!url) return
      this.fetchEmployees(url)
    },

     openAddModal() {
    this.modalTitle = this.$t('admin.employeeModal.createTitle')
    this.modalKey   = Date.now()
    this.modalEmployee = null
    this.showEmployeeModal = true
  },

  openUpdateModal(emp) {
    this.modalTitle = this.$t('admin.employeeModal.updateTitle')
    this.modalKey   = Date.now()
    this.modalEmployee = emp
    this.showEmployeeModal = true
  },

    closeModal() {
      this.showEmployeeModal = false
    },

    async handleSubmit(emp) {
      const isUpd = !!emp.id
      const url = isUpd
        ? `https://koshtovnya.api-dev.bmax-edu.website/api/admin/user/${emp.id}`
        : 'https://koshtovnya.api-dev.bmax-edu.website/api/admin/user'
      const method = isUpd ? 'patch' : 'post'

      try {
        const r = await axios[method](url, emp, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })

        this.toastAction = isUpd ? 'оновлено' : 'створено'
        this.highlightedEmployeeId = r?.data?.data?.id || emp.id || null

        this.fetchEmployees()
        this.closeModal()

        toast.success(`Працівника успішно ${this.toastAction}!`, { timeout: 3000 })
        setTimeout(() => (this.highlightedEmployeeId = null), 3000)
      } catch (e) {
        console.error('❌ Error saving employee:', e?.response?.data || e)
        toast.error('Помилка при збереженні працівника', { timeout: 3000 })
      }
    },

    deleteEmployee(id) {
      axios
        .delete(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(() => {
          this.toastAction = 'видалено'
          this.highlightedEmployeeId = id
          this.fetchEmployees()
          toast.success('Працівника успішно видалено!', { timeout: 3000 })
          setTimeout(() => (this.highlightedEmployeeId = null), 3000)
        })
        .catch(e => {
          console.error('❌ Error deleting employee:', e?.response?.data || e)
          toast.error('Помилка при видаленні працівника', { timeout: 3000 })
        })
    }
  }
}
</script>
