<template>
  <div class="postal-info font-montserrat text-[14px]">
    <div class="flex flex-col gap-4 w-[250px]">
      <!-- Category dropdown -->
      <div class="relative">
        <select
          v-model="localDeliveryCategory"
          @change="onDeliveryCategoryChange"
          class="block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 font-normal pr-8 appearance-none"
        >
          <option disabled value="">Оберіть тип доставки</option>
          <option value="courier">Кур'єр</option>
          <option value="pickup">Самовивіз</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <!-- Delivery type dropdown -->
      <div class="relative">
        <select
          v-model="localData.deliveryType"
          @change="onDeliveryTypeChange"
          class="block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 font-normal pr-8 appearance-none"
        >
          <option disabled value="">Оберіть спосіб доставки</option>
          <option
            v-for="option in deliveryOptions"
            :key="option.id"
            :value="option.name"
          >
            {{ option.name }}
          </option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <span v-if="errors.deliveryType" class="text-red-500 text-xs">{{ errors.deliveryType }}</span>

      <!-- City autocomplete dropdown -->
      <div class="relative">
        <input
          v-model="localData.city"
          @input="onCityInput"
          placeholder="Введіть місто"
          class="block w-full p-2 border border-gray-300 rounded-md text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <span v-if="errors.city" class="text-red-500 text-xs absolute top-full mt-1">{{ errors.city }}</span>
        <ul
          v-if="citiesLocal.length"
          class="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg w-full mt-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          <li
            v-for="city in citiesLocal"
            :key="city.Ref"
            @click="selectCity(city)"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            {{ city.city }}
          </li>
        </ul>
      </div>

      <!-- Courier street search -->
      <div v-if="isCourier" class="mt-4">
        <div class="relative">
          <input
            v-model="localData.streetSearch"
            @input="onStreetSearch"
            placeholder="Введіть назву вулиці"
            class="block w-full p-2 border border-gray-300 rounded-md text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span v-if="errors.street" class="text-red-500 text-xs absolute top-full mt-1">{{ errors.street }}</span>
          <ul
            v-if="streetsLocal.length"
            class="absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg w-full mt-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          >
            <li
              v-for="(street, idx) in streetsLocal"
              :key="idx"
              @click="selectStreet(street)"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {{ street.street || street.Name }}
            </li>
          </ul>
          <p v-else-if="localData.streetSearch" class="text-gray-500 mt-1">Немає вулиць для цього запиту.</p>
        </div>

        <div v-if="localData.street" class="mt-4">
          <input
            v-model="localData.houseNumber"
            @input="updateData"
            placeholder="Номер будинку"
            class="block w-full p-2 border border-gray-300 rounded-md text-gray-900 font-normal focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <span v-if="errors.houseNumber" class="text-red-500 text-xs">{{ errors.houseNumber }}</span>
        </div>
      </div>

      <!-- Pickup warehouse dropdown -->
      <div v-if="isPickup" class="mt-4 relative">
        <select
          v-model="localData.warehouse"
          @change="updateData"
          class="block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 font-normal pr-8 appearance-none"
        >
          <option disabled value="">Оберіть відділення</option>
          <option
            v-for="warehouse in warehousesLocal"
            :key="warehouse.id"
            :value="warehouse.name"
          >
            {{ warehouse.name }}
          </option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <span v-if="errors.warehouse" class="text-red-500 text-xs absolute top-full mt-1">{{ errors.warehouse }}</span>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
export default {
  name: 'PostalInfo',
  props: {
    modelValue:               { type: Object, required: true },
    errors:                   { type: Object, default: () => ({}) },
    cities:                   { type: Array, default: () => [] },
    streets:                  { type: Array, default: () => [] },
    warehouses:               { type: Array, default: () => [] },
    selectedDeliveryCategory: { type: String, default: '' },
    deliveryOptions:          { type: Array, default: () => [] }
  },
  data() {
    return {
      localData:            { ...this.modelValue },
      localDeliveryCategory: this.selectedDeliveryCategory,
      citiesLocal:          [...this.cities],
      streetsLocal:         [...this.streets],
      warehousesLocal:      [...this.warehouses],
      streetSearchTimeout:  null
    };
  },
  computed: {
    isCourier() { return this.localDeliveryCategory === 'courier' && this.localData.deliveryType; },
    isPickup()  { return this.localDeliveryCategory === 'pickup'  && this.localData.deliveryType; }
  },
  watch: {
    modelValue: { handler(val) { this.localData = { ...val }; }, deep: true },
    cities:     { handler(newVal) { this.citiesLocal = [...newVal]; }, deep: true },
    streets:    { handler(newVal) { this.streetsLocal = [...newVal]; }, deep: true },
    warehouses: { handler(newVal) { this.warehousesLocal = [...newVal]; }, deep: true }
  },
  methods: {
    updateData() { this.$emit('update:modelValue', this.localData); },
    onDeliveryCategoryChange() {
      this.$emit('update-delivery-options', this.localDeliveryCategory);
      this.updateData();
    },
    onDeliveryTypeChange() {
      this.updateData();
      if (this.localData.city) this.fetchWarehouses();
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
          { headers: { Authorization: `Bearer ${token}` }, params: { city: this.localData.city, delivery_type: this.localData.deliveryType } }
        );
        this.citiesLocal = data.success && Array.isArray(data.data) ? data.data : [];
        this.$emit('update-cities', this.citiesLocal);
      } catch (e) { console.error('Помилка отримання міст', e); }
    },
    onStreetSearch() {
      clearTimeout(this.streetSearchTimeout);
      this.streetSearchTimeout = setTimeout(this.fetchStreets, 300);
      this.updateData();
    },
    async fetchStreets() {
      const token = localStorage.getItem('token'); if (!token) return this.$router.push('/login');
      if (this.localData.streetSearch.length < 3) return;
      try {
        const { data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/streets',
          { headers: { Authorization: `Bearer ${token}` }, params: { Ref: this.localData.cityRef, street: this.localData.streetSearch } }
        );
        this.streetsLocal = Array.isArray(data.data) ? data.data : [];
        this.$emit('update-streets', this.streetsLocal);
      } catch (e) { console.error('Помилка отримання вулиць', e); }
    },
    selectCity(city) {
      this.localData.city = city.city;
      this.localData.cityRef = city.Ref;
      this.citiesLocal = [];
      this.$emit('update-cities', []);
      this.fetchWarehouses();
      this.updateData();
    },
    selectStreet(street) {
      const name = street.street || street.Name;
      this.localData.street = name;
      this.localData.streetSearch = name;
      this.streetsLocal = [];
      this.$emit('update-streets', []);
      this.updateData();
    },
    async fetchWarehouses() {
      const token = localStorage.getItem('token');
      try {
        const { status, data } = await axios.get(
          'https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/ware-houses',
          { headers: { Authorization: `Bearer ${token}`}, params: { city: this.localData.city, Ref: this.localData.cityRef, delivery_type: this.localData.deliveryType } }
        );
        this.warehousesLocal = status === 200 && Array.isArray(data.data)
          ? data.data.map((item,i) => ({ id: i+1, name: item.warehouse }))
          : [];
        this.$emit('update-warehouses', this.warehousesLocal);
      } catch (e) { console.error('Помилка отримання відділень', e); }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&display=swap');

.font-montserrat { font-family: 'Montserrat', sans-serif; }
</style>