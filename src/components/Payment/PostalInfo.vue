<template>
  <div class="postal-info font-montserrat text-[14px]">
    <div class="flex flex-col gap-4 w-[520px]">

      <!-- Спосіб доставки -->
      <div class="relative">
        <label class="block mb-1 text-sm font-medium text-gray-700">Спосіб доставки:</label>
        <Multiselect
          v-model="localData.deliveryType"
          :options="deliveryOptions || []"
          :custom-label="opt => `${opt.label} — ${opt.name}`"
          :track-by="'id'"
          placeholder="Оберіть спосіб доставки"
          :searchable="true"
          :allow-empty="false"
          @input="onDeliveryTypeChange"
        />
        <span v-if="errors.deliveryType" class="text-red-500 text-xs">{{ errors.deliveryType }}</span>
      </div>

     <!-- Місто -->
<div v-if="localData.deliveryType && !isStorePickup">
  <label class="block mb-1 text-sm font-medium text-gray-700">Місто:</label>
  <Combobox v-model="selectedCity" as="div" class="relative">
    <div class="relative">
      <ComboboxInput
        class="block w-full p-2 border border-gray-300 rounded-md text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-red-500"
        :class="{ 'border-red-500': errors.city }"
        @input="handleCitySearch"
        :displayValue="city => city?.city || city"
        placeholder="Введіть місто"
      />
      <ComboboxOptions
        v-if="citiesLocal.length"
        class="absolute z-50 w-full mt-1 max-h-48 overflow-auto rounded bg-white border shadow-lg"
      >
        <ComboboxOption
          v-for="city in citiesLocal"
          :key="city.Ref"
          :value="city"
          class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
        >
          {{ city.city }}
        </ComboboxOption>
      </ComboboxOptions>
    </div>
  </Combobox>
  <p v-if="errors.city" class="text-red-500 text-xs mt-1">{{ errors.city }}</p>
</div>


      <!-- Вулиця -->
      <div v-if="isCourier">
        <label class="block mb-1 text-sm font-medium text-gray-700">Вулиця:</label>
        <Combobox v-model="selectedStreet" as="div" class="relative">
          <div class="relative">
            <ComboboxInput
  class="block w-full p-2 border border-gray-300 rounded-md text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-red-500"
              :class="{ 'border-red-500': errors.street }"
              @input="handleStreetSearch"

              :displayValue="street => street?.Name || street"
              placeholder="Введіть вулицю"
            />
            <ComboboxOptions v-if="streetsLocal.length"
              class="absolute z-50 w-full mt-1 max-h-48 ovehandleStreetSearchrflow-auto rounded bg-white border shadow-lg">
              <ComboboxOption v-for="(street, idx) in streetsLocal" :key="idx" :value="street"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                {{ street.Name || street.street }}
              </ComboboxOption>
            </ComboboxOptions>
          </div>
        </Combobox>
        <p v-if="errors.street" class="text-red-500 text-xs mt-1">{{ errors.street }}</p>

        <div class="mt-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Номер будинку:</label>
          <input   v-model="houseNumberProxy"
 

class="block w-full p-2 border border-gray-300 rounded-md text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-red-500"
            :class="{ 'border-red-500': errors.houseNumber }"
            @input="updateData"
            placeholder="Номер будинку"
          />
          <p v-if="errors.houseNumber" class="text-red-500 text-xs mt-1">{{ errors.houseNumber }}</p>
        </div>
      </div>

      <!-- Відділення / Поштомат -->
      <div v-if="showWarehouse">
        <label class="block mb-1 text-sm font-medium text-gray-700">{{ isPostomat ? 'Поштомат' : 'Відділення' }}:</label>
        <Multiselect
          v-model="localData.warehouse"
          :options="warehousesLocal || []"
          :label="'name'"
          :track-by="'id'"
          placeholder="Оберіть відділення"
          :searchable="true"
          :allow-empty="false"
          @input="updateData"
        />
        <span v-if="errors.warehouse" class="text-red-500 text-xs mt-1">{{ errors.warehouse }}</span>
      </div>

      <!-- Магазин -->
      <div v-if="isStorePickup" class="text-sm text-gray-800">
        <p><strong>Місто:</strong> Коломия</p>
        <p><strong>Адреса:</strong> вул. Степана Бандери 22</p>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import Multiselect from 'vue-multiselect';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/vue'

export default {
  name: 'PostalInfo',
  components: { Multiselect, Combobox,
    ComboboxInput,
    ComboboxOptions,
    ComboboxOption, },
  props: {
  modelValue: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) }, // ← ДОДАЙ КОМУ
  tempUserAddress: { type: Object, default: null },
},

  data() {
    return {
      selectedCity: null,

      localData: { ...this.modelValue },
      deliveryOptions: [],
      citiesLocal: [],
      streetsLocal: [],
      warehousesLocal: [],
      streetSearchTimeout: null
    };
  },
  computed: {
    houseNumberProxy: {
  get() {
    return this.localData.houseNumber || '';
  },
  set(value) {
    this.localData.houseNumber = value;
    this.updateData();
  }
},
    isCourier() {
      return this.localData.deliveryType?.delivery_type === 'courier';
    },
    isPickup() {
      return this.localData.deliveryType?.delivery_type === 'pickup';
    },
    isStorePickup() {
      return this.localData.deliveryType?.name === 'Самовивіз з наших магазинів';
    },
    isPostomat() {
      return this.localData.deliveryType?.name?.toLowerCase().includes('поштомат');
    },
    showWarehouse() {
      return this.isPickup && !this.isStorePickup;
    }
  },
  watch: {
   modelValue: {
    handler(val) {
      console.log('watch.modelValue updated', val);
      this.localData = { ...val }; // видаляємо houseNumber з localData повністю

      this.selectedCity = val.city && val.cityRef ? { city: val.city, Ref: val.cityRef } : null;
      this.selectedStreet = val.street ? { Name: val.street } : null;

      // 🛑 ❌ видалити це:
      // if (val.houseNumber) {
      //   this.localData.houseNumber = val.houseNumber;
      // }
    },
    deep: true,
    immediate: true
  },
  houseNumberWatcher: {
  handler(val) {
    if (val && val !== this.localData.houseNumber) {
      this.localData.houseNumber = val;
    }
  },
  immediate: true
},

  selectedStreet(val) {
  if (val?.Name || val?.street) {
    this.selectStreet(val);
  }
},

tempUserAddress: {
  handler(address) {
    if (!address || !Array.isArray(this.deliveryOptions)) return;
    this.handleTempAddress(address);
  },
  immediate: true,
  deep: true
}


  },
 async created() {
  await this.fetchDeliveryTypes();

  if (this.tempUserAddress && Array.isArray(this.deliveryOptions)) {
    this.handleTempAddress(this.tempUserAddress);
  }

  },
  methods: {
    handleCitySearch(event) {
  const value = event.target.value;
  this.selectedCity = value; // Це важливо
  this.localData.city = value;
  this.updateData();
  if (value.length >= 3) {
    this.fetchCities();
  }
},
handleTempAddress(address) {
  if (!address || !Array.isArray(this.deliveryOptions)) return;

  const {
    city,
    cityRef,
    street,
    streetSearch,
    houseNumber,
    warehouseName,
    deliveryTypeName,
    deliveryCategory
  } = address;

  this.selectedDeliveryCategory = deliveryCategory;

  const matched = this.deliveryOptions.find(opt => opt.name === deliveryTypeName);
  if (matched) {
    this.localData.deliveryType = matched;
  }

  this.localData.city = city || '';
  this.localData.cityRef = cityRef || '';
  this.selectedCity = city && cityRef ? { city, Ref: cityRef } : null;

  if (deliveryCategory === 'courier') {
  const addressMatch = street?.match(/(.+?)\s+(\d+\w*)$/);

  if (addressMatch) {
    const [, streetOnly, numberOnly] = addressMatch;
    this.localData.street = streetOnly.trim();
    this.localData.streetSearch = streetOnly.trim();
    // ❌ не this.localData.houseNumber
    this.$emit('update:modelValue', {
      ...this.modelValue,
      street: streetOnly.trim(),
      streetSearch: streetOnly.trim(),
      houseNumber: numberOnly.trim()
    });
  } else {
    this.$emit('update:modelValue', {
      ...this.modelValue,
      street: street || '',
      streetSearch: street || '',
      houseNumber: houseNumber || ''
    });
  }
}


  if (deliveryCategory === 'pickup' && city && cityRef && deliveryTypeName) {
    this.fetchWarehouses(city, cityRef, deliveryTypeName).then(warehouses => {
      this.warehousesLocal = Array.isArray(warehouses) ? warehouses : [];
      const match = this.warehousesLocal.find(w => w.name === warehouseName);
      if (match) {
        this.localData.warehouse = match;
      }
      this.$emit('update:modelValue', { ...this.localData });
    });
  } else {
    this.$emit('update:modelValue', { ...this.localData });
  }
},



   updateData() {
  this.$emit('update:modelValue', {
    ...this.modelValue,
    ...this.localData
  });
},

    async fetchDeliveryTypes() {
      const token = localStorage.getItem('token');
      try {
        const { data } = await axios.get('https://koshtovnya.api-dev.bmax-edu.website/api/delivery-types', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = [];
        for (const type in data.data) {
          data.data[type].forEach(option => {
            result.push({
              id: option.id,
              name: option.name,
              delivery_type: type,
              label: type === 'pickup' ? 'Самовивіз' : 'Кур’єр'
            });
          });
        }
        this.deliveryOptions = result;
      } catch (error) {
        console.error('Помилка отримання способів доставки', error);
        this.deliveryOptions = [];
      }
    },
   onDeliveryTypeChange() {
  if (this.isStorePickup) {
    this.localData.city = 'Коломия';
    this.localData.street = 'вул. Степана Бандери 22';
    this.localData.houseNumber = '';
    this.localData.warehouse = null;
    this.updateData();
    return;
  }

  this.localData.city = '';
  this.localData.street = '';
  this.localData.houseNumber = '';
  this.localData.warehouse = null;
  this.updateData();
},
  



    onCityInput() {
      this.updateData();
      if (this.localData.city.length >= 3) this.fetchCities();
    },
    async fetchCities() {
      const token = localStorage.getItem('token');
      try {
        const { data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/cities',
          { headers: { Authorization: `Bearer ${token}` }, params: {
            city: this.localData.city,
            delivery_type: this.localData.deliveryType?.name || ''
          } }
        );
        this.citiesLocal = data.success && Array.isArray(data.data) ? data.data : [];
      } catch (e) { console.error('Помилка отримання міст', e); }
    },
    onStreetSearch() {
      clearTimeout(this.streetSearchTimeout);
      this.streetSearchTimeout = setTimeout(this.fetchStreets, 300);
      this.updateData();
    },
    async fetchStreets() {
      const token = localStorage.getItem('token');
      if (!token || this.localData.streetSearch.length < 3) return;
      try {
        const { data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/streets',
          { headers: { Authorization: `Bearer ${token}` }, params: { Ref: this.localData.cityRef, street: this.localData.streetSearch } }
        );
        this.streetsLocal = Array.isArray(data.data) ? data.data : [];
      } catch (e) { console.error('Помилка отримання вулиць', e); }
    },
    handleStreetSearch(event) {
  const value = event.target.value;
  this.selectedStreet = value;
  this.localData.streetSearch = value;
  this.updateData();
  if (value.length >= 3) {
    this.fetchStreets();
  }
},

    selectCity(city) {
      this.localData.city = city.city;
      this.localData.cityRef = city.Ref;
      this.citiesLocal = [];
      this.fetchWarehouses();
      this.updateData();
    },
    selectStreet(street) {
      const name = street.street || street.Name;
      this.localData.street = name;
      this.localData.streetSearch = name;
      this.streetsLocal = [];
      this.updateData();
    },
    async fetchWarehouses() {
      const token = localStorage.getItem('token');
      try {
        const { status, data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/ware-houses',
          { headers: { Authorization: `Bearer ${token}`}, params: {
            city: this.localData.city,
            Ref: this.localData.cityRef,
            delivery_type: this.localData.deliveryType?.name || ''
          } }
        );
        this.warehousesLocal = status === 200 && Array.isArray(data.data)
          ? data.data.map((item,i) => ({ id: i+1, name: item.warehouse }))
          : [];
      } catch (e) { console.error('Помилка отримання відділень', e); }
    }
  },

  

};
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
