<template>
  <div class="max-w-3xl p-5 overflow-y-auto h-[90vh] font-sans">
    <!-- Loader -->
    <div v-if="loading" class="flex justify-center py-10">
      <Loader />
    </div>

    <!-- No address block -->
    <div
      v-if="!addressAvailable && !loading && !showForm"
      class="text-center space-y-4"
    >
      <p class="text-lg text-gray-700">
        Немає адреси доставки. Додайте або створіть нову адресу!
      </p>
      <button
        @click="openForm"
        class="inline-flex items-center bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition"
      >
        <span class="text-2xl mr-2">+</span> Створити нову адресу
      </button>
    </div>

    <!-- Address form -->
    <div v-if="showForm" class="bg-white p-6 rounded-lg shadow space-y-6">
      <h2 class="text-xl font-semibold">
        {{ addressAvailable ? 'Оновити адресу' : 'Додати нову адресу' }}
      </h2>
      <form @submit.prevent="submitAddress" class="space-y-4">
        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium mb-1">Телефон:</label>
          <input
            type="tel"
            v-model="phoneNumber"
            placeholder="+380XXXXXXXXX"
            :class="[
              'w-full border rounded-lg px-3 py-2',
              errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
            ]"
          />
          <p v-if="errors.phoneNumber" class="text-red-500 text-sm mt-1">
            {{ errors.phoneNumber }}
          </p>
        </div>

        <!-- Delivery type -->
        <div>
          <label class="block text-sm font-medium mb-1">Тип доставки:</label>
          <select
            v-model="formData.deliveryType"
            @change="updateDeliveryOptions"
            :class="[
              'w-full border rounded-lg px-3 py-2',
              errors.deliveryType ? 'border-red-500' : 'border-gray-300'
            ]"
          >
            <option disabled value="">Оберіть тип доставки</option>
            <option value="courier">Кур'єр</option>
            <option value="pickup">Самовивіз</option>
          </select>
          <p v-if="errors.deliveryType" class="text-red-500 text-sm mt-1">
            {{ errors.deliveryType }}
          </p>
        </div>

        <!-- Courier fields -->
        <div v-if="formData.deliveryType === 'courier'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Спосіб доставки:</label>
            <input
              type="text"
              value="Кур'єр Нової Пошти"
              readonly
              class="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 cursor-not-allowed"
            />
          </div>
          <div class="relative">
            <label class="block text-sm font-medium mb-1">Місто:</label>
            <input
              type="text"
              v-model="formData.city"
              @input="onCityInput"
              @focus="showCityDropdown = true"
              placeholder="Введіть назву міста"
              :class="[
                'w-full border rounded-lg px-3 py-2',
                errors.city ? 'border-red-500' : 'border-gray-300'
              ]"
            />
            <ul
              v-if="showCityDropdown && cities.length"
              class="absolute z-10 left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow max-h-48 overflow-auto"
            >
              <li
                v-for="city in cities"
                :key="city.Ref"
                @mousedown.prevent="selectCity(city)"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {{ city.city }}
              </li>
            </ul>
            <p v-if="errors.city" class="text-red-500 text-sm mt-1">{{ errors.city }}</p>
          </div>
          <div class="relative">
            <label class="block text-sm font-medium mb-1">Вулиця:</label>
            <input
              v-model="formData.streetSearch"
              @input="handleStreetSearch"
              placeholder="Введіть назву вулиці"
              class="w-full border rounded-lg px-3 py-2"
            />
            <ul
              v-if="streets.length"
              class="absolute z-10 left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow max-h-48 overflow-auto"
            >
              <li
                v-for="(street, idx) in streets"
                :key="idx"
                @click="selectStreet(street)"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {{ street.street || street.Name }}
              </li>
            </ul>
            <p v-if="errors.street" class="text-red-500 text-sm mt-1">{{ errors.street }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Будинок/Квартира:</label>
            <input
              type="text"
              v-model="deliveryAddress.number"
              :class="[
                'w-full border rounded-lg px-3 py-2',
                errors.number ? 'border-red-500' : 'border-gray-300'
              ]"
            />
            <p v-if="errors.number" class="text-red-500 text-sm mt-1">{{ errors.number }}</p>
          </div>
        </div>

        <!-- Pickup fields -->
        <div v-if="formData.deliveryType === 'pickup'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Спосіб доставки:</label>
            <select
              v-model="formData.selectedDeliveryMethod"
              @change="onDeliveryMethodChange"
              class="w-full border rounded-lg px-3 py-2"
            >
              <option disabled value="">Оберіть спосіб доставки</option>
              <option
                v-for="opt in pickupOptions"
                :key="opt.id"
                :value="opt"
              >
                {{ opt.name }}
              </option>
            </select>
            <p
              v-if="errors.selectedDeliveryMethod"
              class="text-red-500 text-sm mt-1"
            >{{ errors.selectedDeliveryMethod }}</p>
          </div>

          <template v-if="formData.selectedDeliveryMethod?.is_store">
            <p><strong>Адреса:</strong> вул. Степана Бандери 22, Коломия</p>
          </template>

          <template v-else>
            <div class="relative">
              <label class="block text-sm font-medium mb-1">Місто:</label>
              <input
                v-model="formData.city"
                @input="onCityInput"
                @focus="showCityDropdown = true"
                placeholder="Введіть місто"
                class="w-full border rounded-lg px-3 py-2"
              />
              <ul
                v-if="showCityDropdown && cities.length"
                class="absolute z-10 left-0 right-0 bg-white border border-t-0 rounded-b-lg shadow max-h-48 overflow-auto"
              >
                <li
                  v-for="city in cities"
                  :key="city.Ref"
                  @mousedown.prevent="selectCity(city)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {{ city.city }}
                </li>
              </ul>
              <p v-if="errors.city" class="text-red-500 text-sm mt-1">{{ errors.city }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Відділення / Поштомат:</label>
              <select
                v-model="selectedWarehouse"
                class="w-full border rounded-lg px-3 py-2"
              >
                <option disabled value="">Оберіть</option>
                <option
                  v-for="wh in warehouses"
                  :key="wh.id"
                  :value="wh.name"
                >
                  {{ wh.name }}
                </option>
              </select>
              <p
                v-if="errors.branch || errors.postomat"
                class="text-red-500 text-sm mt-1"
              >
                {{ errors.branch || errors.postomat }}
              </p>
            </div>
          </template>
        </div>

        <!-- Form actions -->
        <div class="flex space-x-4 pt-4">
          <button
            type="submit"
            class="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition"
          >Зберегти</button>
          <button
            type="button"
            @click="cancelEdit"
            class="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          >Скасувати</button>
        </div>
      </form>
    </div>

    <!-- Address card -->
    <div
      v-else-if="addressAvailable && !loading && !showForm"
      class="bg-white p-6 rounded-lg shadow space-y-3"
    >
      <h2 class="text-xl font-semibold">Ваша адреса доставки</h2>
      <p><strong>Телефон:</strong> {{ phoneNumber }}</p>
      <p><strong>Тип доставки:</strong> {{ formData.deliveryName }}</p>

      <template v-if="formData.deliveryType === 'courier'">
        <p><strong>Місто:</strong> {{ formData.city }}</p>
        <p><strong>Адреса:</strong> {{ deliveryAddress.street }} {{ deliveryAddress.number }}</p>
      </template>

      <template v-else>
        <template v-if="formData.selectedDeliveryMethod.is_store">
          <p><strong>Адреса:</strong> вул. Степана Бандери 22, Коломия</p>
        </template>
        <template v-else>
          <p><strong>Місто:</strong> {{ formData.city }}</p>
          <p><strong>Відділення/Поштомат:</strong> {{ selectedWarehouse }}</p>
        </template>
      </template>

      <div class="flex space-x-4 pt-4">
        <button
          @click="editAddress"
          class="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition"
        >Оновити</button>
        <button
          @click="deleteAddress"
          class="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition"
        >Видалити</button>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from '../home/Loader.vue';
import api from '@/services/api';
import { debounce } from 'lodash';

export default {
  name: "UserAddresses",
  components: { Loader },
  data() {
    return {
      addressAvailable: false,
      showForm: false,
      loading: true,
      phoneNumber: "",
      formData: {
        city: "",
        cityRef: "",
        deliveryType: "",
        selectedDeliveryMethod: null,
        deliveryName: "",
        streetSearch: ""
      },
      deliveryAddress: {
        street: "",
        number: "",
        branch: "",
        postomat: ""
      },
      streets: [],
      warehouses: [],
      cities: [],
      showCityDropdown: false,
      errors: {},
      addressId: null
    };
  },
  computed: {
    pickupOptions() {
      return [
        { id: 1, name: "Самовивіз з нашого магазину", is_store: true },
        { id: 2, name: "Самовивіз з Нової Пошти" },
        { id: 3, name: "Самовивіз з поштоматів Нової Пошти" }
      ];
    },
    selectedWarehouse: {
      get() {
        return this.deliveryAddress.branch || this.deliveryAddress.postomat;
      },
      set(val) {
        if (this.formData.selectedDeliveryMethod?.name.includes('поштомат')) {
          this.deliveryAddress.postomat = val;
          this.deliveryAddress.branch = "";
        } else {
          this.deliveryAddress.branch = val;
          this.deliveryAddress.postomat = "";
        }
      }
    }
  },
  created() {
    this.debouncedFetchCities = debounce(this.fetchCities, 300);
    this.fetchUserAddress();
    this.fetchDeliveryTypes();
  },
  methods: {
    async fetchUserAddress() {
      this.loading = true;
      try {
        const res = await api.getUserAddress();
        // support both { data: { … } } and direct {...}
        const payload = res.data?.data ?? res.data ?? {};
        this.phoneNumber = payload.phone_number ?? "";
        this.formData.city = payload.city ?? "";
        this.formData.deliveryType = payload.delivery_type ?? "";
        this.formData.deliveryName = payload.delivery_name ?? "";
        this.addressId = payload.id ?? null;
        if (payload.delivery_type === "courier") {
          const [street, ...num] = (payload.delivery_address ?? "").split(" ");
          this.deliveryAddress.street = street || "";
          this.deliveryAddress.number = num.join(" ") || "";
        } else {
          this.deliveryAddress.branch = payload.delivery_address ?? "";
        }
        this.addressAvailable = !!payload.id;
      } catch (e) {
        console.error('fetchUserAddress error', e);
        this.addressAvailable = false;
      } finally {
        this.loading = false;
      }
    },
    async fetchDeliveryTypes() {
      try {
        const res = await api.getDeliveryTypes();
        const types = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        const match = types.find(d => d.id === this.formData.deliveryType);
        this.formData.deliveryName = match?.name ?? "";
      } catch (e) {
        console.error('fetchDeliveryTypes error', e);
      }
    },
    updateDeliveryOptions() {
      this.formData.selectedDeliveryMethod = null;
      this.deliveryAddress = { street: "", number: "", branch: "", postomat: "" };
      this.warehouses = [];
    },
    onDeliveryMethodChange() {
      if (this.formData.selectedDeliveryMethod?.is_store) {
        this.formData.city = "Коломия";
        this.deliveryAddress.branch = "";
        this.deliveryAddress.postomat = "";
      }
    },
    onCityInput() {
      if (this.formData.city.trim().length >= 2) {
        this.debouncedFetchCities();
        this.showCityDropdown = true;
      } else {
        this.cities = [];
        this.showCityDropdown = false;
      }
    },
    async fetchCities() {
      try {
        const res = await api.getNovaPoshtaCities({
          city: this.formData.city,
          delivery_type: this.formData.deliveryType === 'courier'
            ? "Кур'єр Нової Пошти"
            : this.formData.selectedDeliveryMethod?.name
        });
        this.cities = res.data?.data || [];
      } catch (e) {
        console.error('fetchCities error', e);
      }
    },
    selectCity(city) {
      this.formData.city = city.city;
      this.formData.cityRef = city.Ref;
      this.showCityDropdown = false;
      if (this.formData.deliveryType === 'pickup') this.fetchWarehouses();
    },
    async fetchWarehouses() {
      try {
        const res = await api.getNovaPoshtaWarehouses({
          city: this.formData.city,
          Ref: this.formData.cityRef,
          delivery_type: this.formData.deliveryType
        });
        this.warehouses = (res.data?.data || []).map((w, i) => ({ id: i+1, name: w.warehouse }));
      } catch (e) {
        console.error('fetchWarehouses error', e);
      }
    },
    async fetchStreets() {
      try {
        const res = await api.getNovaPoshtaStreets({
          city: this.formData.city,
          Ref: this.formData.cityRef,
          street: this.formData.streetSearch
        });
        this.streets = res.data?.data || [];
      } catch (e) {
        console.error('fetchStreets error', e);
      }
    },
    handleStreetSearch() {
      if (this.formData.streetSearch.trim().length >= 2) {
        this.fetchStreets();
      } else {
        this.streets = [];
      }
    },
    selectStreet(street) {
      this.deliveryAddress.street = street.street || street.Name;
      this.formData.streetSearch = this.deliveryAddress.street;
      this.streets = [];
    },
    validateForm() {
      const e = {};
      if (!/^\+380\d{9}$/.test(this.phoneNumber)) {
        e.phoneNumber = "Невірний формат номера телефону";
      }
      if (this.formData.deliveryType === 'courier') {
        if (!this.formData.city) e.city = "Місто потрібне";
        if (!this.deliveryAddress.street) e.street = "Вулиця потрібна";
        if (!this.deliveryAddress.number) e.number = "Номер потрібен";
      } else {
        if (!this.formData.selectedDeliveryMethod) e.selectedDeliveryMethod = "Оберіть спосіб";
        if (!this.formData.city) e.city = "Місто потрібне";
        if (!this.deliveryAddress.branch && !this.deliveryAddress.postomat) {
          e.branch = "Оберіть відділення чи поштомат";
        }
      }
      this.errors = e;
      return !Object.keys(e).length;
    },
    async submitAddress() {
      if (!this.validateForm()) return;
      const data = {
        phone_number: this.phoneNumber,
        city: this.formData.city,
        city_ref: this.formData.cityRef,
        delivery_name: this.formData.deliveryType === 'courier'
          ? "Кур'єр Нової Пошти"
          : this.formData.selectedDeliveryMethod?.name,
        delivery_address: this.formData.deliveryType === 'courier'
          ? `${this.deliveryAddress.street} ${this.deliveryAddress.number}`
          : this.selectedWarehouse
      };
      try {
        if (this.addressAvailable) {
          await api.updateUserAddress(this.addressId, data);
        } else {
          await api.createUserAddress(data);
        }
        this.fetchUserAddress();
        this.showForm = false;
      } catch (e) {
        console.error('submitAddress error', e);
      }
    },
    editAddress() { this.showForm = true },
    openForm() {
      if (!this.phoneNumber) this.fetchUserAddress();
      this.showForm = true;
    },
    cancelEdit() {
      this.showForm = false;
      this.errors = {};
    },
    async deleteAddress() {
      try {
        await api.deleteUserAddress(this.addressId);
      } catch (e) {
        console.error('deleteAddress error', e);
      }
      this.addressAvailable = false;
      this.showForm = false;
    }
  },
  mounted() {
    document.title = "Ваша адреса";
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
.font-sans { font-family: 'Montserrat', sans-serif; }
</style>
