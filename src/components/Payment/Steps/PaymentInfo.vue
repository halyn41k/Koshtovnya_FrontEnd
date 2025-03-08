<template>
  <div class="step-content">
    <div class="payment-options">
      <h3>Спосіб оплати:</h3>
      <div class="payment-option">
        <input
          type="radio"
          id="card"
          value="card"
          v-model="formData.selectedPaymentOption"
          @change="validateField('selectedPaymentOption')"
        />
        <label for="card">Оплата картою</label>
      </div>
      <div class="payment-option">
        <input
          type="radio"
          id="cash"
          value="cash"
          v-model="formData.selectedPaymentOption"
          @change="validateField('selectedPaymentOption')"
        />
        <label for="cash">Оплата при отриманні</label>
      </div>
      <span class="error" v-if="errors.selectedPaymentOption">
        {{ errors.selectedPaymentOption }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineExpose } from 'vue'


import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const formData = computed(() => store.state.payment.formData)
const errors = computed(() => store.state.payment.errors)

const validateField = (field) => {
  let isValid = true
  const value = formData.value[field]

  if (field === 'selectedPaymentOption' && !value) {
    store.commit('payment/SET_ERROR', {
      field,
      message: "Виберіть спосіб оплати"
    })
    isValid = false
  }
  return isValid
}

defineExpose({ validateField })
</script>