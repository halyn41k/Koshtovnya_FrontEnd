<template>
  <div class="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center">
    <div class="bg-white dark:bg-[#1f2a42] rounded-xl w-full max-w-md p-6 shadow-lg animate-fade-in">
      <!-- Header -->
      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
        <h2 class="text-xl font-bold text-black dark:invert">{{ title }}</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Dynamic fields based on context -->
        <div v-for="field in visibleFields" :key="field.key">
          <label :for="field.key" class="block font-medium text-sm mb-1 text-black dark:invert">
            {{ $t(field.label) }}:
          </label>
          <component
            :is="field.component || 'input'"
            :id="field.key"
            v-model="form[field.key]"
            v-bind="field.props"
            class="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F] bg-white dark:bg-[#2a3748] text-black dark:text-black"
          />
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-2 gap-4 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="py-2 rounded bg-gray-400 hover:bg-gray-500 text-white font-semibold transition"
          >
            {{ $t('admin.userModal.cancel') }}
          </button>
          <button
            type="submit"
            class="py-2 rounded bg-[#6B1F1F] hover:bg-[#A01212] text-white font-semibold transition"
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
  name: 'UserModal',
  components: {
    Multiselect
  },
  props: {
    title: {
      type: String,
      default: 'Додати користувача'
    },
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
    },
    /**
     * Context from parent ('employee', 'client', 'admin')
     */
    context: {
      type: String,
      default: 'employee'
    }
  },
  data() {
    return {
      // Configuration for all possible fields
      fields: {
        first_name: {
          label: 'admin.userModal.firstName',
          props: {
            type: 'text',
            required: true,
            placeholder: this.$t('admin.userModal.firstNamePlaceholder')
          }
        },
        second_name: {
          label: 'admin.userModal.secondName',
          props: {
            type: 'text',
            required: true,
            placeholder: this.$t('admin.userModal.secondNamePlaceholder')
          }
        },
        last_name: {
          label: 'admin.userModal.lastName',
          props: {
            type: 'text',
            required: true,
            placeholder: this.$t('admin.userModal.lastNamePlaceholder')
          }
        },
        email: {
          label: 'admin.userModal.email',
          props: {
            type: 'email',
            inputmode: 'email',
            required: true,
            placeholder: this.$t('admin.userModal.emailPlaceholder')
          }
        },
        phone_number: {
          label: 'admin.userModal.phone',
          props: {
            type: 'tel',
            inputmode: 'numeric',
            maxlength: 12,
            required: true,
            placeholder: this.$t('admin.userModal.phonePlaceholder')
          }
        },
        role: {
          label: 'admin.userModal.role',
          component: 'Multiselect',
          props: {
            options: ['admin', 'manager', 'superadmin', 'user'],
            placeholder: this.$t('admin.userModal.rolePlaceholder')
          }
        }
      },
      form: {
        id: null,
        first_name: '',
        second_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: ''
      }
    }
  },
  computed: {
    visibleFields() {
      const mapping = {
          employee: ['first_name', 'last_name', 'email', 'phone_number', 'role'],
     user:     ['first_name', 'last_name', 'email',  'phone_number', 'role'],
        admin: ['first_name', 'second_name', 'last_name', 'email', 'role']
      }
      const keys = mapping[this.context] || mapping.employee
      return keys.map(key => ({ key, ...this.fields[key] }))
    }
  },
  watch: {
    user: {
      handler(newUser) {
        if (!newUser || typeof newUser !== 'object') return
        this.form = {
          id: newUser.id ?? null,
          first_name: newUser.first_name || '',
          second_name: newUser.second_name || '',
          last_name: newUser.last_name || '',
          email: newUser.email || '',
          phone_number: newUser.phone_number || '',
          role: newUser.role || ''
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleSubmit() {
      // Clean phone: keep only digits
      if (this.form.phone_number) {
        this.form.phone_number = this.form.phone_number.replace(/\D/g, '')
      }
      this.$emit('userSubmit', { ...this.form })
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

.custom-multiselect .multiselect__option--highlight::after {
  display: none !important;
}

.multiselect__option--highlight {
  background: #F3F4F6 !important;
  color: #6B1F1F !important;
}
.multiselect__option--selected {
  font-weight: 600 !important;
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
