<template>
  <div class="step-content">
    <div class="delivery-options">
      <h3>Спосіб доставки:</h3>
      <div class="delivery-type">
        <h4>Кур'єрська доставка:</h4>
        <div 
          v-for="option in deliveryData.courier" 
          :key="option.id"
          class="delivery-option"
        >
          <input
            type="radio"
            :id="option.id"
            v-model="formData.deliveryType"
            :value="option.id"
            @change="validateField('deliveryType')"
          />
          <label :for="option.id">{{ option.name }}</label>
        </div>
      </div>

      <div class="delivery-type">
        <h4>Самовивіз:</h4>
        <div 
          v-for="option in deliveryData.pickup" 
          :key="option.id"
          class="delivery-option"
        >
          <input
            type="radio"
            :id="option.id"
            v-model="formData.deliveryType"
            :value="option.id"
            @change="validateField('deliveryType')"
          />
          <label :for="option.id">{{ option.name }}</label>
        </div>
      </div>
    </div>

    <div class="form-group">
      <input
        v-model="formData.city"
        type="text"
        placeholder="Місто"
        @input="handleCityInput"
        @blur="validateField('city')"
      />
      <span class="error" v-if="errors.city">{{ errors.city }}</span>
      <div class="city-suggestions" v-if="cities.length">
        <div
          v-for="city in cities"
          :key="city.ref"
          @click="selectCity(city)"
          class="city-option"
        >
          {{ city.present }}
        </div>
      </div>
    </div>

    <div class="form-group" v-if="showWarehouseSelect">
      <select
        v-model="formData.warehouse"
        @change="validateField('warehouse')"
      >
        <option value="">Виберіть відділення</option>
        <option 
          v-for="warehouse in warehouses"
          :key="warehouse.ref"
          :value="warehouse.ref"
        >
          {{ warehouse.description }}
        </option>
      </select>
      <span class="error" v-if="errors.warehouse">{{ errors.warehouse }}</span>
    </div>

    <div v-if="showAddressFields" class="address-fields">
      <div class="form-group">
        <input
          v-model="formData.street"
          type="text"
          placeholder="Вулиця"
          @input="handleStreetInput"
          @blur="validateField('street')"
        />
        <span class="error" v-if="errors.street">{{ errors.street }}</span>
      </div>

      <div class="form-group">
        <input
          v-model="formData.houseNumber"
          type="text"
          placeholder="Номер будинку"
          @blur="validateField('houseNumber')"
        />
        <span class="error" v-if="errors.houseNumber">{{ errors.houseNumber }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineExpose } from 'vue'


import { computed } from 'vue'
import { useStore } from 'vuex'
import { debounce } from 'lodash'

const store = useStore()

const formData = computed(() => store.state.payment.formData)
const errors = computed(() => store.state.payment.errors)
const deliveryData = computed(() => store.state.payment.deliveryData)
const cities = computed(() => store.state.payment.cities)
const warehouses = computed(() => store.state.payment.warehouses)

const showWarehouseSelect = computed(() => {
  const deliveryType = formData.value.deliveryType
  return deliveryType === 2 || deliveryType === 3 || deliveryType === 4
})

const showAddressFields = computed(() => {
  const deliveryType = formData.value.deliveryType
  return deliveryType === 5 || deliveryType === 6
})

const handleCityInput = debounce(async (event) => {
  if (event.target.value.length >= 2) {
    await store.dispatch('payment/fetchCities', event.target.value)
  }
}, 300)

const handleStreetInput = debounce(async (event) => {
  if (event.target.value.length >= 2) {
    await store.dispatch('payment/fetchStreets', {
      cityRef: formData.value.cityRef,
      street: event.target.value
    })
  }
}, 300)

const selectCity = (city) => {
  store.commit('payment/SET_FIELD', { field: 'city', value: city.present })
  store.commit('payment/SET_FIELD', { field: 'cityRef', value: city.ref })
  store.dispatch('payment/fetchWarehouses', city.ref)
}

const validateField = (field) => {
  let isValid = true
  const value = formData.value[field]

  switch (field) {
    case 'city':
      if (!value) {
        store.commit('payment/SET_ERROR', {
          field,
          message: "Виберіть місто"
        })
        isValid = false
      }
      break
    case 'deliveryType':
      if (!value) {
        store.commit('payment/SET_ERROR', {
          field,
          message: "Виберіть тип доставки"
        })
        isValid = false
      }
      break
    case 'warehouse':
      if (showWarehouseSelect.value && !value) {
        store.commit('payment/SET_ERROR', {
          field,
          message: "Виберіть відділення"
        })
        isValid = false
      }
      break
    case 'street':
      if (showAddressFields.value && !value) {
        store.commit('payment/SET_ERROR', {
          field,
          message: "Введіть вулицю"
        })
        isValid = false
      }
      break
    case 'houseNumber':
      if (showAddressFields.value && !value) {
        store.commit('payment/SET_ERROR', {
          field,
          message: "Введіть номер будинку"
        })
        isValid = false
      }
      break
  }
  return isValid
}

defineExpose({ validateField })
</script>