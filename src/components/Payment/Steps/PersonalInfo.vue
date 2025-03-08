<template>
  <div class="step-content">
    <div class="form-group">
      <input
        v-model="localFormData.firstName"
        type="text"
        placeholder="Ім'я"
        @blur="validateField('firstName')"
      />
      <span class="error" v-if="errors.firstName">{{ errors.firstName }}</span>
    </div>

    <div class="form-group">
      <input
        v-model="localFormData.lastName"
        type="text"
        placeholder="Прізвище"
        @blur="validateField('lastName')"
      />
      <span class="error" v-if="errors.lastName">{{ errors.lastName }}</span>
    </div>

    <div class="form-group">
      <input
        v-model="localFormData.secondName"
        type="text"
        placeholder="По батькові"
        @blur="validateField('secondName')"
      />
      <span class="error" v-if="errors.secondName">{{ errors.secondName }}</span>
    </div>

    <div class="form-group">
      <input
        v-model="localFormData.phone"
        type="tel"
        placeholder="Телефон"
        @blur="validateField('phone')"
      />
      <span class="error" v-if="errors.phone">{{ errors.phone }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, defineExpose } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:form-data'])

const localFormData = ref({ ...props.formData })

watch(localFormData, (newValue) => {
  emit('update:form-data', newValue)
}, { deep: true })

const validateField = (field) => {
  let isValid = true
  const value = localFormData.value[field]

  switch (field) {
    case 'firstName':
    case 'lastName':
    case 'secondName': {
      if (!value || value.length < 2) {
        emit('update:errors', {
          ...props.errors,
          [field]: "Поле повинно містити мінімум 2 символи"
        })
        isValid = false
      }
      break
    }
    case 'phone': {
      const phoneRegex = /^\+?\d{10,12}$/
      if (!phoneRegex.test(value)) {
        emit('update:errors', {
          ...props.errors,
          [field]: "Невірний формат телефону"
        })
        isValid = false
      }
      break
    }
  }
  return isValid
}

const validateStep = () => {
  return validateField('firstName') &&
         validateField('lastName') &&
         validateField('secondName') &&
         validateField('phone')
}

defineExpose({ validateStep })
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error {
  color: red;
  font-size: 0.8rem;
  margin-top: 4px;
}
</style>

import { useStore } from 'vuex'

const store = useStore()
