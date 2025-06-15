<template>
  <div class="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center">
    <div class="bg-white dark:bg-[#1f2a42] rounded-xl w-full max-w-md p-6 shadow-lg animate-fade-in">
      <!-- Header -->
      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
        <h2 class="text-xl font-bold text-black dark:invert">{{ title }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">
          &times;
        </button>
      </div>

      <!-- Form (без submit handler на формі) -->
      <form class="space-y-4" @keydown.enter.prevent>
        <div>
          <label class="block mb-1">{{ $t('admin.userModal.firstName') }}</label>
          <input
            name="first_name"
            v-model="form.first_name"
            type="text"
            required
            :placeholder="$t('admin.userModal.firstNamePlaceholder')"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] text-black dark:text-black"
          />
        </div>

        <div>
          <label class="block mb-1">{{ $t('admin.userModal.secondName') }}</label>
          <input
            name="second_name"
            v-model="form.second_name"
            type="text"
            required
            :placeholder="$t('admin.userModal.secondNamePlaceholder')"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] text-black dark:text-black"
          />
        </div>

        <div>
          <label class="block mb-1">{{ $t('admin.userModal.lastName') }}</label>
          <input
            name="last_name"
            v-model="form.last_name"
            type="text"
            required
            :placeholder="$t('admin.userModal.lastNamePlaceholder')"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] text-black dark:text-black"
          />
        </div>

        <div>
          <label class="block mb-1">{{ $t('admin.userModal.email') }}</label>
          <input
            name="email"
            v-model="form.email"
            type="email"
            required
            :placeholder="$t('admin.userModal.emailPlaceholder')"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] text-black dark:text-black"
          />
        </div>

        <div>
          <label class="block mb-1">{{ $t('admin.userModal.phone') }}</label>
          <input
            name="phone_number"
            v-model="form.phone_number"
            type="tel"
            maxlength="12"
            required
            :placeholder="$t('admin.userModal.phonePlaceholder')"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] text-black dark:text-black"
          />
        </div>

        <div>
          <label class="block mb-1">{{ $t('admin.userModal.role') }}</label>
          <multiselect
            v-model="form.role"
            :options="roles"
            :placeholder="$t('admin.userModal.rolePlaceholder')"
            class="custom-multiselect"
          />
        </div>

        <!-- Кнопки -->
        <div class="flex justify-end gap-2 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
          >
            {{ $t('admin.userModal.cancel') }}
          </button>
          <button
            type="button"
            @click="onSubmit"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded disabled:opacity-50"
          >
            {{ isSubmitting
              ? $t('admin.userModal.saving')
              : (form.id ? $t('admin.userModal.update') : $t('admin.userModal.create')) }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  name: 'EmployeeModal',
  components: { Multiselect },
  props: {
    title: { type: String, default: '' },
    employee: {
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
      form: { ...this.employee },
      roles: ['admin', 'manager', 'superadmin', 'user'],
      isSubmitting: false
    }
  },
  watch: {
    employee: {
      handler(u) { this.form = { ...u } },
      immediate: true,
      deep: true
    }
  },
  methods: {
    onSubmit() {
      if (this.isSubmitting) return
      this.isSubmitting = true

      // чистимо номер телефону
      this.form.phone_number = this.form.phone_number.replace(/\D/g, '')

      // емісію тільки одного події
      console.log('submit payload', this.form)
      this.$emit('submit', { ...this.form })

      // закриваємо модалку
      this.$emit('close')
      this.isSubmitting = false
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
</style>
