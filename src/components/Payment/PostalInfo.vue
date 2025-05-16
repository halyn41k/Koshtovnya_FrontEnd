<template>
  <div class="postal-info font-montserrat text-[14px]">
    <div class="flex flex-col gap-4 w-[520px]">

      <!-- Спосіб доставки -->
      <div class="relative">
        <label class="block mb-1 text-sm font-medium text-gray-700">Спосіб доставки:</label>
        <Multiselect
          v-model="localData.deliveryType"
          :options="deliveryOptions"
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
      <div v-if="!isStorePickup" class="relative">
        <label class="block mb-1 text-sm font-medium text-gray-700">Місто:</label>
        <input
          v-model="localData.city"
          @input="onCityInput"
          placeholder="Введіть місто"
          class="block w-full p-2 border border-gray-300 rounded-md text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <span v-if="errors.city" class="text-red-500 text-xs absolute top-full mt-1">{{ errors.city }}</span>
        <ul v-if="citiesLocal.length" class="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg w-full mt-1 max-h-48 overflow-y-auto">
          <li v-for="city in citiesLocal" :key="city.Ref" @click="selectCity(city)" class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            {{ city.city }}
          </li>
        </ul>
      </div>

      <!-- Вулиця -->
      <div v-if="isCourier" class="mt-4">
        <label class="block mb-1 text-sm font-medium text-gray-700">Вулиця:</label>
        <input
          v-model="localData.streetSearch"
          @input="onStreetSearch"
          placeholder="Введіть назву вулиці"
          class="block w-full p-2 border border-gray-300 rounded-md text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <span v-if="errors.street" class="text-red-500 text-xs absolute top-full mt-1">{{ errors.street }}</span>
        <ul v-if="streetsLocal.length" class="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg w-full mt-1 max-h-48 overflow-y-auto">
          <li v-for="(street, idx) in streetsLocal" :key="idx" @click="selectStreet(street)" class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            {{ street.street || street.Name }}
          </li>
        </ul>
        <div v-if="localData.street" class="mt-4">
          <label class="block mb-1 text-sm font-medium text-gray-700">Номер будинку:</label>
          <input
            v-model="localData.houseNumber"
            @input="updateData"
            placeholder="Номер будинку"
            class="block w-full p-2 border border-gray-300 rounded-md text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span v-if="errors.houseNumber" class="text-red-500 text-xs">{{ errors.houseNumber }}</span>
        </div>
      </div>

      <!-- Відділення / Поштомат -->
      <div v-if="showWarehouse" class="mt-4 relative">
        <label class="block mb-1 text-sm font-medium text-gray-700">{{ isPostomat ? 'Поштомат' : 'Відділення' }}:</label>
        <Multiselect
          v-model="localData.warehouse"
          :options="warehousesLocal"
          :label="'name'"
          :track-by="'id'"
          :placeholder="`Оберіть ${isPostomat ? 'поштомат' : 'відділення'}`"

          :searchable="true"
          :allow-empty="false"
          @input="updateData"
        />
        <span v-if="errors.warehouse" class="text-red-500 text-xs absolute top-full mt-1">{{ errors.warehouse }}</span>
      </div>

      <!-- Адреса магазину -->
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

export default {
  name: 'PostalInfo',
  components: { Multiselect },
  props: {
    modelValue: { type: Object, required: true },
    errors: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      localData: { ...this.modelValue },
      deliveryOptions: [],
      citiesLocal: [],
      streetsLocal: [],
      warehousesLocal: [],
      streetSearchTimeout: null
    };
  },
  computed: {
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
    modelValue: { handler(val) { this.localData = { ...val }; }, deep: true }
  },
  created() {
    this.fetchDeliveryTypes();
  },
  methods: {
    updateData() {
      this.$emit('update:modelValue', this.localData);
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
      } else {
        this.localData.city = '';
        this.localData.street = '';
        this.localData.houseNumber = '';
        this.localData.warehouse = null;
      }
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
  }
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
</style>
