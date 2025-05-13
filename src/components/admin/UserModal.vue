<template>
  <div class="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center">

    <div class="bg-white rounded-xl w-full max-w-md p-6 shadow-lg animate-fade-in">
      <!-- Header -->
      <div class="flex justify-between items-center border-b pb-3 mb-4">
        <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="first_name" class="block font-medium text-sm mb-1">Ім'я:</label>
          <input
            id="first_name"
            v-model="form.first_name"
            type="text"
            required
            placeholder="Введіть ім'я"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F]"
          />
        </div>

        <div>
          <label for="second_name" class="block font-medium text-sm mb-1">По батькові:</label>
          <input
            id="second_name"
            v-model="form.second_name"
            type="text"
            required
            placeholder="Введіть по батькові"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F]"
          />
        </div>

        <div>
          <label for="last_name" class="block font-medium text-sm mb-1">Прізвище:</label>
          <input
            id="last_name"
            v-model="form.last_name"
            type="text"
            required
            placeholder="Введіть прізвище"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F]"
          />
        </div>

        <div>
          <label for="email" class="block font-medium text-sm mb-1">Email:</label>
          <input
            id="email"
            v-model="form.email"
              type="email"
  inputmode="email"
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            required
            placeholder="Введіть email"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F]"
          />
        </div>

        <div>
          <label for="role" class="block font-medium text-sm mb-1">Роль:</label>
          <select
            id="role"
            v-model="form.role"
            required
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F]"
          >
            <option disabled value="">Оберіть роль</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="superadmin">Superadmin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div>
          <label for="phone_number" class="block font-medium text-sm mb-1">Телефон:</label>
          <input
            id="phone_number"
            v-model="form.phone_number"
            type="text"
            required
            maxlength="17"
            placeholder="+38(___)___-__-__"
            @input="applyPhoneMask"
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F]"
          />
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="py-2 rounded bg-gray-400 hover:bg-gray-500 text-white font-semibold transition"
          >
            Відміна
          </button>
          <button
            type="submit"
            class="py-2 rounded bg-[#6B1F1F] hover:bg-[#A01212] text-white font-semibold transition"
          >
            {{ form.id ? 'Оновити' : 'Створити' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserModal',
  props: {
    title: {
      type: String,
      default: 'Додати користувача'
    },
    user: {
      type: Object,
      default: () => ({
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
      form: {
        first_name: '',
        second_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: '',
        id: null
      }
    }
  },
  watch: {
    user: {
      handler(newUser) {
        if (newUser) {
          this.form = {
  id: newUser.id || null, // ← це важливо!
  first_name: newUser.first_name || '',
}

        }
      },
      immediate: true
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('userSubmit', this.form)
    },
    applyPhoneMask() {
      let digits = this.form.phone_number.replace(/\D/g, '').slice(0, 12)
      let formatted = '+38('

      if (digits.length >= 3) {
        formatted += digits.slice(0, 3) + ')'
        if (digits.length >= 6) {
          formatted += digits.slice(3, 6) + '-'
          if (digits.length >= 8) {
            formatted += digits.slice(6, 8) + '-'
            formatted += digits.slice(8, 10)
          } else {
            formatted += digits.slice(6)
          }
        } else {
          formatted += digits.slice(3)
        }
      } else {
        formatted += digits
      }

      this.form.phone_number = formatted
    }
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
