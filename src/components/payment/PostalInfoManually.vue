<template>
  <div class="postal-info font-montserrat text-[14px]">
    <div class="flex flex-col gap-4 w-[520px]">

      <!-- Спосіб доставки -->
      <div class="relative">
        <label class="block mb-1 text-sm font-medium text-gray-700">
          {{ $t('payment.deliveryMethod') }}:
        </label>
        <Multiselect
          v-model="localData.deliveryType"
          :options="deliveryOptionsLocal"
          :custom-label="opt => `${opt.label} — ${opt.name}`"
          track-by="id"
          :placeholder="$t('payment.selectDeliveryMethod')"
          searchable
          :allow-empty="false"
          @input="onDeliveryTypeChange"
        />
        <span v-if="errors.deliveryType" class="text-red-500 text-xs">
          {{ errors.deliveryType }}
        </span>
      </div>

      <!-- Місто -->
      <div v-if="localData.deliveryType && !isStorePickup">
        <label class="block mb-1 text-sm font-medium text-gray-700">
          {{ $t('payment.city') }}:
        </label>
        <Combobox as="div" v-model="selectedCity" class="relative">
          <ComboboxInput
            class="block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            :class="{ 'border-red-500': errors.city }"
            @input="handleCityInput"
            :displayValue="c => c?.city || c"
            :placeholder="$t('payment.enterCity')"
          />
          <ComboboxOptions
            v-if="citiesLocal.length"
            class="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg"
          >
            <ComboboxOption
              v-for="c in citiesLocal"
              :key="c.Ref"
              :value="c"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {{ c.city }}
            </ComboboxOption>
          </ComboboxOptions>
        </Combobox>
        <p v-if="errors.city" class="text-red-500 text-xs mt-1">
          {{ errors.city }}
        </p>
      </div>

      <!-- Вулиця + номер -->
      <div v-if="isCourier">
        <label class="block mb-1 text-sm font-medium text-gray-700">
          {{ $t('payment.street') }}:
        </label>
        <Combobox as="div" v-model="selectedStreet" class="relative">
          <ComboboxInput
            class="block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            :class="{ 'border-red-500': errors.street }"
            v-model="localData.street"
            @input="handleStreetInput"
            :displayValue="s => s?.street || s"
            :placeholder="$t('payment.enterStreet')"
          />
          <ComboboxOptions
            v-if="streetsLocal.length"
            class="absolute z-50 w-full mt-1 bg-white border rounded shadow-lg"
          >
            <ComboboxOption
              v-for="(s, i) in streetsLocal"
              :key="i"
              :value="s"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {{ s.street }}
            </ComboboxOption>
          </ComboboxOptions>
        </Combobox>
        <p v-if="errors.street" class="text-red-500 text-xs mt-1">
          {{ errors.street }}
        </p>

        <div class="mt-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">
            {{ $t('payment.houseNumber') }}:
          </label>
          <input
            v-model="localData.houseNumber"
            class="block w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            :class="{ 'border-red-500': errors.houseNumber }"
            @input="updateData"
            :placeholder="$t('payment.houseNumberPlaceholder')"
          />
          <p v-if="errors.houseNumber" class="text-red-500 text-xs mt-1">
            {{ errors.houseNumber }}
          </p>
        </div>
      </div>

      <!-- Відділення / Поштомат -->
      <div v-if="showWarehouse">
        <label class="block mb-1 text-sm font-medium text-gray-700">
          {{ isPostomat ? $t('payment.postomat') : $t('payment.warehouse') }}:
        </label>
        <Multiselect
          v-model="localData.warehouse"
          :options="warehousesLocal"
          label="name"
          track-by="id"
          :placeholder="$t('payment.selectWarehouse')"
          searchable
          :allow-empty="false"
          @input="updateData"
        />
        <span v-if="errors.warehouse" class="text-red-500 text-xs mt-1">
          {{ errors.warehouse }}
        </span>
      </div>

      <!-- Магазин -->
      <div v-if="isStorePickup" class="text-sm text-gray-800">
        <p><strong>{{ $t('payment.city') }}:</strong> {{ $t('payment.storeCity') }}</p>
        <p><strong>{{ $t('payment.address') }}:</strong> {{ $t('payment.storeAddress') }}</p>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios'
import Multiselect from 'vue-multiselect'
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption
} from '@headlessui/vue'

export default {
  name: 'PostalInfoManually',
  components: {
    Multiselect,
    Combobox,
    ComboboxInput,
    ComboboxOptions,
    ComboboxOption
  },
  props: {
    modelValue: { type: Object, required: true },
    errors:     { type: Object, default: () => ({}) }
  },
  emits: [
    'update:modelValue',
    'update-delivery-options',
    'update-cities',
    'update-streets',
    'update-warehouses',
    'validate'
  ],
  data() {
    return {
      selectedWarehouse: null, 
      localData:           { ...this.modelValue },
      deliveryOptionsLocal: [],
      citiesLocal:         [],
      streetsLocal:        [],
      warehousesLocal:     [],
      cityTimeout:         null,
      streetTimeout:       null,
      selectedCity:        null,
      selectedStreet:      null,
      isLoadingWarehouses: false,
    }
  },
  computed: {
    isCourier() {
      return this.localData.deliveryType?.delivery_type === 'courier'
    },
    isPickup() {
      return this.localData.deliveryType?.delivery_type === 'pickup'
    },
    isStorePickup() {
      // Перевірка за delivery_type або коректною частиною name
      return this.localData.deliveryType?.delivery_type === 'pickup'
        && this.localData.deliveryType?.name?.includes('наших магазинів');
    },
    isPostomat() {
      return this.localData.deliveryType?.name
        ?.toLowerCase()
        .includes('поштомат')
    },
    showWarehouse() {
      return this.isPickup && !this.isStorePickup
    }
  },
  watch: {
    modelValue: {
      deep: true,
      handler(val) {
        this.localData = { ...val }
      }
    },
    selectedCity(val) {
      if (val && val.city) this.selectCity(val)
    },
    selectedStreet(val) {
      if (val && (val.Name || val.street)) this.selectStreet(val)
    }
  },
  async created() {
    await this.fetchDeliveryTypes()
  },
  methods: {
    updateData() {
  this.$emit('update:modelValue', this.localData)
  this.$emit('validate')
  // а після оновлення warehouse
  if (this.isPickup) {
    this.$emit('validate')
  }
},
onWarehouseSelect(option) {
    this.localData.warehouse = option
    this.updateData()
  },


    async fetchDeliveryTypes() {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/delivery-types',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const list = Object.entries(data.data).flatMap(([type, arr]) =>
          arr.map(opt => ({
            id: opt.id,
            name: opt.name,
            delivery_type: type,
            label: type === 'pickup' ? 'Самовивіз' : 'Кур’єр'
          }))
        )
        this.deliveryOptionsLocal = list
        this.$emit('update-delivery-options', list)
      } catch (e) {
        console.error('Помилка fetchDeliveryTypes', e)
      }
    },

    onDeliveryTypeChange() {
      // Скидаємо поля, коли змінюється спосіб
      this.localData.city       = ''
      this.localData.cityRef    = ''
      this.localData.street     = ''
      this.localData.houseNumber = ''
      this.localData.warehouse  = null
      this.updateData()
    },

    handleCityInput(e) {
      clearTimeout(this.cityTimeout)
      this.localData.city = e.target.value
      this.updateData()
      if (this.localData.city.length < 3) return
      this.cityTimeout = setTimeout(this.fetchCities, 300)
    },

    async fetchCities() {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/cities',
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              city: this.localData.city,
              Ref: this.localData.cityRef,
              delivery_type: this.localData.deliveryType?.name || ''
            }
          }
        )
        const list = data.success ? data.data : []
        this.citiesLocal = list
        this.$emit('update-cities', list)
      } catch (e) {
        console.error('Помилка fetchCities', e)
      }
    },

 handleStreetInput(e) {
   clearTimeout(this.streetTimeout)
   // записуємо введене у localData.street
   this.localData.street = e.target.value
   this.updateData()
   // Якщо немає cityRef — чистимо список
   if (!this.localData.cityRef) {
     this.streetsLocal = []
     return
   }
   // чекаємо принаймні 3 символи
   if (!this.localData.street || this.localData.street.length < 3) return
this.streetTimeout = setTimeout(this.fetchStreets, 300)
 },

    async fetchStreets() {
  if (!this.localData.cityRef) return
  console.log('Запит вулиць, Ref=', this.localData.cityRef, 'street=', this.localData.street)
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(
      'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/streets',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          Ref: this.localData.cityRef,
          street: this.localData.street
        }
      }
    )
    console.log('Відповідь fetchStreets:', data)
    const list = data.data || []
    this.streetsLocal = list
    this.$emit('update-streets', list)
  } catch (e) {
    console.error('Помилка fetchStreets', e)
  }
},


    selectCity(city) {
      this.localData.city    = city.city
      this.localData.cityRef = city.Ref
      this.citiesLocal       = []
      this.updateData()
      this.fetchWarehouses()
    },

    selectStreet(street) {
    // записуємо правильне поле
    this.localData.street = street.street
    this.localData.streetSearch = street.street
    this.streetsLocal = []
    this.updateData()
  },


    async fetchWarehouses() {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/ware-houses',
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              city: this.localData.city,
              Ref: this.localData.cityRef,
              delivery_type: this.localData.deliveryType?.name || ''
            }
          }
        )
        const list = Array.isArray(data.data)
          ? data.data.map((item, i) => ({
              id: i + 1,
              name: item.warehouse
            }))
          : []
        this.warehousesLocal = list
        this.$emit('update-warehouses', list)
      } catch (e) {
        console.error('Помилка fetchWarehouses', e)
      }
    }
  }
}
</script>



<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&display=swap');
.font-montserrat { font-family: 'Montserrat', sans-serif; }
.multiselect__option--highlight::after { display: none !important; }
.multiselect__option--highlight { background: #F3F4F6 !important; color: #6B1F1F !important; }
.multiselect__option--selected { font-weight: 600 !important; }
.multiselect__option--selected::after {
  content: 'Обрано' !important;
  color: #9CA3AF;
  font-size: 0.75rem;
  font-weight: 500;
  float: right;
  margin-right: 1rem;
}

.multiselect__option {
  font-weight: 400 !important; /* Regular */
}

.multiselect__option--selected {
  font-weight: 400 !important; /* Забрати жирний для вибраного */
}

.multiselect__option--highlight {
  font-weight: 400 !important;
}

.multiselect__single {
  font-weight: 400 !important;
}

.multiselect__option::after {
  display: none !important; /* Забрати слово "Обрано", якщо треба */
}

</style>