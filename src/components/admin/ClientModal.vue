<template>
  <div class="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center">
    <div class="bg-white dark:bg-[#1f2a42] rounded-xl w-full max-w-md p-6 shadow-lg animate-fade-in">
      <!-- Header -->
      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
        <h2 class="text-xl font-bold text-black dark:invert">{{ title }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
      </div>
      <!-- Form -->
      <form @submit.prevent="onSubmit" class="space-y-4">
        <!-- Ім'я -->
        <div>
          <label class="block mb-1">{{ $t('admin.userModal.firstName') }}</label>
          <input
            v-model.trim="form.first_name"
            type="text"
            :placeholder="$t('admin.userModal.firstNamePlaceholder')"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] text-black dark:text-black"
          />
          <p v-if="errors.first_name" class="text-red-600 text-sm mt-1">{{ errors.first_name }}</p>
        </div>
        <!-- По батькові -->
        <div>
          <label class="block mb-1">{{ $t('admin.userModal.secondName') }}</label>
          <input
            v-model.trim="form.second_name"
            type="text"
            :placeholder="$t('admin.userModal.secondNamePlaceholder')"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] text-black dark:text-black"
          />
          <p v-if="errors.second_name" class="text-red-600 text-sm mt-1">{{ errors.second_name }}</p>
        </div>
        <!-- Прізвище -->
        <div>
          <label class="block mb-1">{{ $t('admin.userModal.lastName') }}</label>
          <input
            v-model.trim="form.last_name"
            type="text"
            :placeholder="$t('admin.userModal.lastNamePlaceholder')"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] text-black dark:text-black"
          />
          <p v-if="errors.last_name" class="text-red-600 text-sm mt-1">{{ errors.last_name }}</p>
        </div>
        <!-- Email -->
        <div>
          <label class="block mb-1">{{ $t('admin.userModal.email') }}</label>
          <input
            v-model.trim="form.email"
            type="email"
            :placeholder="$t('admin.userModal.emailPlaceholder')"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] text-black dark:text-black"
          />
          <p v-if="errors.email" class="text-red-600 text-sm mt-1">{{ errors.email }}</p>
        </div>
        <!-- Телефон -->
        <div>
          <label class="block mb-1">{{ $t('admin.userModal.phone') }}</label>
          <input
            v-model="form.phone_number"
            @input="form.phone_number = form.phone_number.replace(/\D/g, '').slice(0, 10)"
            type="tel"
            :placeholder="$t('admin.userModal.phonePlaceholder')"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] text-black dark:text-black"
          />
          <p v-if="errors.phone_number" class="text-red-600 text-sm mt-1">{{ errors.phone_number }}</p>
        </div>
        <!-- Роль -->
        <div>
          <label class="block mb-1">{{ $t('admin.userModal.role') }}</label>
          <multiselect
            v-model="form.role"
            :options="roles"
            :placeholder="$t('admin.userModal.rolePlaceholder')"
            class="custom-multiselect text-black dark:text-black"
          />
          <p v-if="errors.role" class="text-red-600 text-sm mt-1">{{ errors.role }}</p>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-2 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
          >{{ $t('admin.userModal.cancel') }}</button>
          <button
            type="submit"
            :disabled="!isValid"
            class="px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded disabled:opacity-50"
          >
            {{ form.id ? $t('admin.userModal.update') : $t('admin.userModal.create') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  name: 'ClientModal',
  components: { Multiselect },
  emits: ['save'],
  props: {
    title: { type: String, default: '' },
    user: {
      type: Object,
      default: () => ({
        id: null,
        first_name: '',
        second_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: ''
      })
    }
  },
  data() {
    return {
      form: { ...this.user },
      roles: ['admin', 'manager', 'superadmin', 'user'],
      errors: {}
    }
  },
  watch: {
    user: {
      handler(u) { this.form = { ...u } },
      immediate: true,
      deep: true
    }
  },
  computed: {
    isValid() {
      return (
        this.validateEmail() &&
        this.validatePhone() &&
        this.form.first_name.trim() &&
        this.form.last_name.trim() &&
        this.form.role
      )
    }
  },
  methods: {
    validateEmail() {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!this.form.email) {
        this.errors.email = this.$t('admin.userModal.errors.emailRequired')
        return false
      }
      if (!re.test(this.form.email)) {
        this.errors.email = this.$t('admin.userModal.errors.emailInvalid')
        return false
      }
      this.errors.email = null
      return true
    },
    validatePhone() {
      const re = /^\d{10}$/
      if (!this.form.phone_number) {
        this.errors.phone_number = this.$t('admin.userModal.errors.phoneRequired')
        return false
      }
      if (!re.test(this.form.phone_number)) {
        this.errors.phone_number = this.$t('admin.userModal.errors.phoneInvalid')
        return false
      }
      this.errors.phone_number = null
      return true
    },
    onSubmit() {
      this.errors = {}
      this.validateEmail()
      this.validatePhone()
      if (!this.form.first_name.trim())   this.errors.first_name = this.$t('admin.userModal.errors.firstNameRequired')
      if (!this.form.second_name.trim())  this.errors.second_name = this.$t('admin.userModal.errors.secondNameRequired')
      if (!this.form.last_name.trim())    this.errors.last_name = this.$t('admin.userModal.errors.lastNameRequired')
      if (!this.form.role)                this.errors.role = this.$t('admin.userModal.errors.roleRequired')

      if (Object.values(this.errors).some(v => v)) return
      this.$emit('save', { ...this.form })
    }
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
.animate-fade-in { animation: fade-in 0.2s ease-out; }

/* Multiselect styling */
.custom-multiselect .multiselect__option--highlight {
  background: #F3F4F6 !important;
  color: #6B1F1F !important;
}
.multiselect__option--selected::after {
  content: 'Обрано' !important;
  color: #9CA3AF;
  font-size: 0.75rem;
  font-weight: 500;
  float: right;
  margin-right: 1rem;
}
</style>