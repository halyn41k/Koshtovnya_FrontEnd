<template>
  <div class="max-w-3xl p-4 sm:p-6 overflow-y-auto h-[90vh] font-sans">
    <!-- Loader -->
    <Loader v-if="loading" class="mx-auto my-16" />

    <!-- No Address Block -->
    <div v-if="!addressAvailable && !loading && !showForm" class="text-center mb-6">
      <p class="text-gray-500 text-lg mb-4">
        {{ $t('user.noAddress') }}
      </p>
      <button
        class="inline-flex items-center mx-auto px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded-lg transition"
        @click="openForm">
        <span class="text-2xl mr-2">+</span>
        <span>{{ $t('user.createAddress') }}</span>
      </button>
    </div>

    <!-- Address Form -->
    <div v-if="showForm" class="bg-[#fff7f6] dark:bg-[#17223b] rounded-2xl shadow-lg p-6 space-y-6">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-white">
        {{ addressAvailable ? $t('user.updateAddress') : $t('user.addAddress') }}
      </h2>
      <form @submit.prevent="submitAddress" class="space-y-4">

        <!-- Phone -->
        <div>
          <label class="block text-gray-800 dark:text-gray-100 mb-1">{{ $t('user.phone') }}:</label>
          <input
            v-model="phoneNumber"
            @input="formatPhoneNumber"
            :placeholder="$t('user.enterPhone')"
            maxlength="10"
            inputmode="numeric"
            pattern="[0-9]*"
            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50
                   bg-white dark:bg-[#17223b]
                   text-gray-900 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-600"
            :class="errors.phoneNumber
              ? 'border-red-500'
              : 'border-gray-300 dark:border-gray-600'"
          />
          <p v-if="errors.phoneNumber" class="text-red-500 dark:text-gray-100 text-sm mt-1">{{ errors.phoneNumber }}</p>
        </div>

        <!-- Delivery Type -->
        <div>
          <label class="block text-gray-800 dark:text-gray-100 mb-1">{{ $t('user.deliveryType') }}:</label>
          <Multiselect v-model="formData.deliveryType" :options="deliveryOptions"
            :custom-label="opt => `${opt.label} — ${opt.name}`" track-by="id"
            :placeholder="$t('user.selectDeliveryType')" @input="updateDeliveryOptions" />
          <p v-if="errors.deliveryType" class="text-red-500 dark:text-gray-100 text-sm mt-1">{{ errors.deliveryType }}</p>
        </div>

        <!-- Courier -->
        <template v-if="formData.deliveryType?.value === 'courier'">
          <div>
            <label class="block text-gray-800 dark:text-gray-100 mb-1">{{ $t('user.deliveryMethod') }}:</label>
            <input type="text" readonly :value="$t('user.courierNovaPoshta')"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100" />
          </div>

          <div ref="cityWrapper" class="relative w-full">
            <Combobox v-model="selectedCity" as="div" class="relative">
              <div class="relative">
                <label class="block text-gray-800 dark:text-gray-100 mb-1">{{ $t('user.city') }}:</label>
                <ComboboxInput
                  class="w-full px-3 py-2 border border-gray-300 dark:border-[#303b59] rounded-lg bg-white dark:bg-[#10192e] text-black dark:text-white focus:ring focus:ring-opacity-50"
                  @input="event => onCitySearch(event.target.value)"
                  :displayValue="city => city?.city || city"
                  :placeholder="$t('user.enterCity')" />
                <ComboboxOptions v-if="cities.length"
                  class="absolute z-50 w-full mt-1 max-h-48 overflow-auto rounded bg-white dark:bg-gray-900 border shadow-lg">
                  <ComboboxOption v-for="city in cities" :key="city.Ref" :value="city"
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    {{ city.city }}
                  </ComboboxOption>
                </ComboboxOptions>
              </div>
            </Combobox>
          </div>

          <div>
            <label class="block text-gray-800 dark:text-gray-100 mb-1">{{ $t('user.street') }}:</label>
            <div class="relative">
              <Combobox v-model="selectedStreet" @update:modelValue="selectStreet" as="div" class="relative">
                <ComboboxInput
                  class="w-full px-3 py-2 border border-gray-300 dark:border-[#303b59] rounded-lg bg-white dark:bg-[#10192e] text-black dark:text-white focus:ring focus:ring-opacity-50"
                  @input="handleStreetSearch"
                  :displayValue="s => s?.street || s"
                  :placeholder="$t('user.enterStreet')" />
                <ComboboxOptions v-if="streets.length"
                  class="absolute z-50 w-full mt-1 max-h-48 overflow-auto rounded bg-white dark:bg-gray-900 border shadow-lg">
                  <ComboboxOption v-for="street in streets" :key="street.Ref || street.Name" :value="street"
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    {{ street.street || street.Name }}
                  </ComboboxOption>
                </ComboboxOptions>
              </Combobox>
            </div>
          </div>

          <div>
            <label class="block text-gray-800 dark:text-gray-100 mb-1">{{ $t('user.houseNumber') }}:</label>
            <input v-model="deliveryAddress.number" required :placeholder="$t('user.enterHouseNumber')"
              :class="['w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50', errors.number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600']" />
            <p v-if="errors.number" class="text-red-500 dark:text-gray-100 text-sm mt-1">{{ errors.number }}</p>
          </div>
        </template>

        <!-- Pickup з магазину -->
        <template v-if="isStorePickup">
          <p class="text-gray-800 dark:text-gray-100"><strong>{{ $t('user.city') }}:</strong> Коломия</p>
          <p class="text-gray-800 dark:text-gray-100"><strong>{{ $t('user.address') }}:</strong> {{ $t('user.pickupAddress') }}</p>
        </template>

        <!-- Pickup інші -->
        <template v-else-if="formData.deliveryType?.value === 'pickup'">
          <div>
            <label class="block text-gray-800 dark:text-gray-100 mb-1">{{ $t('user.city') }}:</label>
            <Combobox v-model="selectedCity" as="div" class="relative">
              <div class="relative">
                <ComboboxInput
                  class="w-full px-3 py-2 border border-gray-300 dark:border-[#303b59] rounded-lg bg-white dark:bg-[#10192e] text-black dark:text-white focus:ring focus:ring-opacity-50"
                  @input="event => onCitySearch(event.target.value)"
                  :displayValue="city => city?.city || city"
                  :placeholder="$t('user.enterCity')" />
                <ComboboxOptions v-if="cities.length"
                  class="absolute z-50 w-full mt-1 max-h-48 overflow-auto rounded bg-white dark:bg-gray-900 border shadow-lg">
                  <ComboboxOption v-for="city in cities" :key="city.Ref" :value="city"
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    {{ city.city }}
                  </ComboboxOption>
                </ComboboxOptions>
              </div>
            </Combobox>
            <p v-if="errors.city" class="text-red-500 dark:text-gray-100 text-sm mt-1">{{ errors.city }}</p>
          </div>

          <div v-if="isPostomatPickup">
            <label class="block text-gray-800 dark:text-gray-100 mb-1">{{ $t('user.pickupPostomat') }}:</label>
            <Multiselect
              v-model="deliveryAddress.postomat"
              :options="warehouses.map(w => w.name)"
              :placeholder="$t('user.selectPostomat')"
              :searchable="true"
              :allow-empty="false"
              class="w-full mt-2"
              :class="{ 'border border-red-500 rounded-md': errors.postomat }"
            >
              <template #noResult><span class="text-gray-500 px-2">{{ $t('user.listEmpty') }}</span></template>
              <template #noOptions><span class="text-gray-500 px-2">{{ $t('user.listEmpty') }}</span></template>
            </Multiselect>
            <p v-if="errors.postomat" class="text-red-500 dark:text-gray-100 text-sm mt-1">{{ errors.postomat }}</p>
          </div>

          <div v-if="isBranchPickup">
            <label class="block text-gray-800 dark:text-gray-100 mb-1">{{ $t('user.pickupBranch') }}:</label>
            <Multiselect
              v-model="deliveryAddress.branch"
              :options="warehouses.map(w => w.name)"
              :placeholder="$t('user.selectBranch')"
              :searchable="true"
              :allow-empty="false"
              class="w-full mt-2"
              :class="{ 'border border-red-500 rounded-md': errors.branch }"
            >
              <template #noResult><span class="text-gray-500 px-2">{{ $t('user.listEmpty') }}</span></template>
              <template #noOptions><span class="text-gray-500 px-2">{{ $t('user.listEmpty') }}</span></template>
            </Multiselect>
            <p v-if="errors.branch" class="text-red-500 dark:text-gray-100 text-sm mt-1">{{ errors.branch }}</p>
          </div>
        </template>

        <!-- Buttons -->
        <div class="flex gap-4 mt-4 w-full">
          <button
            type="submit"
            class="w-full text-center py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white font-montserrat font-semibold rounded-lg transition-colors"
          >
            {{ $t('user.save') }}
          </button>
          <button
            type="button"
            @click="cancelEdit"
            class="w-full text-center py-2 border border-gray-400 dark:border-gray-500 text-gray-700 dark:text-white font-montserrat font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f2a3f] transition"
          >
            {{ $t('user.cancel') }}
          </button>
        </div>
      </form>
    </div>

    <!-- Saved Address Card -->
    <div v-else-if="addressAvailable && !loading && !showForm" class="bg-[#fff7f6] dark:bg-[#17223b] rounded-2xl shadow-lg p-6 space-y-4">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-white">{{ $t('user.yourAddress') }}</h2>
      <p class="text-gray-800 dark:text-gray-100"><strong>{{ $t('user.phone') }}:</strong> {{ phoneNumber }}</p>
      <p class="text-gray-800 dark:text-gray-100"><strong>{{ $t('user.deliveryType') }}:</strong> {{ formData.deliveryName }}</p>

      <template v-if="formData.deliveryType?.value === 'courier'">
        <p class="text-gray-700 whitespace-nowrap">
          <strong>{{ $t('user.city') }}:</strong> {{ formData.city }}
        </p>
      </template>

      <template v-else-if="formData.deliveryType?.value === 'pickup'">
        <p class="text-gray-800 dark:text-gray-100">
          <strong>{{ $t('user.city') }}:</strong> {{ formData.city }}
        </p>
      </template>

      <p class="text-gray-800 dark:text-gray-100">
        <strong>{{ $t('user.address') }}:</strong> {{ displayAddress }}
      </p>

      <div class="flex gap-4 mt-4">
        <button @click="editAddress"
          class="px-5 py-2 border-2 border-[#6B1F1F] text-[#6B1F1F] dark:text-white rounded-lg hover:bg-[#6B1F1F] hover:text-white transition-colors">
          {{ $t('user.update') }}
        </button>
        <button @click="deleteAddress"
          class="px-5 py-2 border-2 border-red-600 text-red-600 dark:text-white rounded-lg hover:bg-red-600 hover:text-white transition-colors">
          {{ $t('user.delete') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from '../home/Loader.vue';
import axios from "axios";
import api from '@/services/api.js';
import Multiselect from 'vue-multiselect';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/vue';
import { useToast } from 'vue-toastification';
const toast = useToast();

export default {
  name: "UserAddresses",
  components: {
    Loader,
    Multiselect,
    Combobox,
    ComboboxInput,
    ComboboxOptions,
    ComboboxOption,
  },
  data() {
    return {
          isEditingExisting: false,

      selectedCity: null,
      selectedStreet: null,
      addressAvailable: false,
      showForm: false,
      savedDeliveryAddress: '',
      phoneNumber: "",
      formData: {
        city: "",
        cityRef: "",
        deliveryType: null,
        selectedDeliveryMethod: null,
        deliveryName: "",
        streetSearch: ""
      },
      deliveryAddress: {
        street: "",
        number: "",
        branch: "",
        postomat: "",
        warehouse: ""
      },
      streets: [],
      warehouses: [],
      cities: [],
      errors: {},
      loading: true,
      addressId: null,
      deliveryOptions: []
    };
  },
  created() {
    this.fetchDeliveryTypes().then(() => this.fetchUserAddress());
    if (!this.addressAvailable) {
      this.fetchUserPhoneNumber();
    }
    this.debouncedFetchCities = this.debounce(this.fetchCities.bind(this), 300);
  },
  methods: {
    formatPhoneNumber(e) {
      this.phoneNumber = e.target.value.replace(/\D/g, '').slice(0, 10);
    },
    debounce(func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },
    updateDeliveryOptions() {
      const nameLower = (this.formData.deliveryType?.name || '').toLowerCase();
      const value = this.formData.deliveryType?.value;

      if (!this.addressAvailable) {
        this.formData.selectedDeliveryMethod = this.formData.deliveryType;
        this.formData.cityRef = '';
        this.formData.streetSearch = '';
        this.selectedCity = null;
        this.selectedStreet = null;
        this.deliveryAddress = { street: '', number: '', branch: '', postomat: '', warehouse: '' };
        this.streets = [];
        this.cities = [];
        this.warehouses = [];
      }

      // Спецвипадок: самовивіз з наших магазинів / Pickup from our stores
      if (this.formData.deliveryType?.value === 'pickup' && this.formData.deliveryType.isStorePickup) {
  // Якщо нова адреса і користувач обрав саме “store pickup”
  if (!this.addressAvailable ) {
    this.formData.city = "Коломия";
    this.formData.cityRef = "db5c891f-391c-11dd-90d9-001a92567626";
  }
  return;
}


      if (this.formData.city && this.formData.cityRef) {
        if (value === 'pickup') this.fetchWarehouses();
        if (value === 'courier') this.fetchStreets();
      }

      if (!this.formData.city && value === 'pickup') {
        this.fetchCities();
      }
    },
    onCitySearch(query) {
      this.formData.city = query;
      if (query.length < 2) {
        this.cities = [];
        return;
      }
      const deliveryTypeParam = this.formData.selectedDeliveryMethod?.name || this.formData.deliveryType?.name || '';
      const token = localStorage.getItem("token");
      axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/cities", {
        headers: { Authorization: `Bearer ${token}` },
        params: { city: query, delivery_type: deliveryTypeParam }
      }).then(response => {
        if (response.data.success && Array.isArray(response.data.data)) {
          this.cities = response.data.data;
        } else {
          this.cities = [];
        }
      }).catch(() => {
        this.cities = [];
      });
    },
    async fetchCities() {
      const token = localStorage.getItem("token");
      if (!this.formData.city) return;
      let deliveryTypeParam = "";
      if (this.formData.deliveryType?.value === "courier") {
        deliveryTypeParam = "Кур'єр Нової Пошти";
      } else if (this.formData.deliveryType?.value === "pickup") {
        deliveryTypeParam = this.formData.deliveryType?.name || "";
      }
      try {
        const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/cities", {
          headers: { Authorization: `Bearer ${token}` },
          params: { city: this.formData.city, delivery_type: deliveryTypeParam },
        });
        if (response.data.success && Array.isArray(response.data.data)) {
          this.cities = response.data.data;
        } else {
          this.cities = [];
        }
      } catch {
        this.cities = [];
      }
    },
    async fetchStreets() {
      if (!this.formData.city || !this.formData.cityRef) {
        this.streets = [];
        return;
      }
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/streets", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            city: this.formData.city,
            Ref: this.formData.cityRef,
            street: this.formData.streetSearch
          }
        });
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          this.streets = response.data.data;
        } else {
          this.streets = [];
        }
      } catch {
        this.streets = [];
      }
    },
    handleStreetSearch(event) {
      const value = event?.target?.value || '';
      this.formData.streetSearch = value;
      if (value.trim().length < 2) {
        this.streets = [];
        return;
      }
      this.fetchStreets();
    },
    selectStreet(street) {
      this.selectedStreet = street;
      const streetName = street.street || street.Name;
      this.deliveryAddress.street = streetName;
      this.formData.streetSearch = streetName;
      this.streets = [];
    },
     async fetchWarehouses() {
    if (!this.formData.cityRef) {
      this.warehouses = [];
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/ware-houses",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            city: this.formData.city,
            Ref: this.formData.cityRef,
            delivery_type: this.formData.deliveryType?.value
          }
        }
      );
      if (response.status === 200 && Array.isArray(response.data?.data)) {
        const filtered = response.data.data.filter(w => {
          const nameLower = (w.warehouse || '').toLowerCase();
          if (this.isPostomatPickup) {
            return (
              nameLower.includes('поштомат') ||
              nameLower.includes('postomat') ||
              nameLower.includes('post office')
            );
          }
          if (this.isBranchPickup) {
            return (
              !nameLower.includes('поштомат') &&
              !nameLower.includes('postomat') &&
              !nameLower.includes('post office')
            );
          }
          return false;
        });
        this.warehouses = filtered.map((item, i) => ({
          id: i + 1,
          name: item.warehouse
        }));
      } else {
        this.warehouses = [];
      }
    } catch {
      this.warehouses = [];
    }
  },
   async fetchUserAddress() {
    const token = localStorage.getItem("token");
    if (!token) {
      this.$router.push("/login");
      return;
    }
    this.loading = true;
    try {
      const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/user-address", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[fetchUserAddress] response.data:', response.data);
      if (response.data && response.data.data) {
        const address = response.data.data;
        console.log('[fetchUserAddress] address from API:', address);

        // 1) Телефон
        this.savedDeliveryAddress = address.delivery_address || '';
        this.phoneNumber = address.phone_number || "";
        console.log('[fetchUserAddress] phoneNumber set to:', this.phoneNumber);

        // 2) DeliveryType: match по назві першочергово, потім по value
        let foundType = null;
        if (address.delivery_name) {
          const nameLower = address.delivery_name.trim().toLowerCase();
          foundType = this.deliveryOptions.find(opt =>
            opt.name.trim().toLowerCase() === nameLower
          );
          console.log('[fetchUserAddress] try match deliveryType by name:', address.delivery_name, '=>', foundType);
        }
        if (!foundType) {
          foundType = this.deliveryOptions.find(opt => opt.value === address.delivery_type);
          console.log('[fetchUserAddress] fallback match deliveryType by value:', address.delivery_type, '=>', foundType);
        }
        this.formData.deliveryType = foundType || null;
        this.formData.selectedDeliveryMethod = foundType || null;
        console.log('[fetchUserAddress] formData.deliveryType after set:', this.formData.deliveryType);

        // Після встановлення deliveryType можна викликати updateDeliveryOptions, щоб підготувати поля
        await this.$nextTick();
        console.log('[fetchUserAddress] calling updateDeliveryOptions...');
        const maybe = this.updateDeliveryOptions();
        if (maybe instanceof Promise) {
          await maybe;
        }
        console.log('[fetchUserAddress] after updateDeliveryOptions:', {
          isStore: this.isStorePickup,
          isBranch: this.isBranchPickup,
          isPostomat: this.isPostomatPickup
        });

        // 3) City / cityRef
        this.formData.city = address.city || "";
        this.addressId = address.id;
        // Якщо API повернув city_ref — використовуємо його напряму
        if (address.city_ref) {
          this.formData.cityRef = address.city_ref;
          this.selectedCity = { city: address.city, Ref: address.city_ref };
          console.log('[fetchUserAddress] using API city_ref:', address.city_ref);
        } else if (address.city) {
          // Якщо немає city_ref, пробуємо знайти по назві
          this.formData.city = address.city;
          console.log('[fetchUserAddress] city_ref empty, fetching cities by name:', address.city);
          await this.fetchCities();
          console.log('[fetchUserAddress] cities after fetchCities:', this.cities);
          const matchByName = this.cities.find(c =>
            c.city.trim().toLowerCase() === address.city.trim().toLowerCase()
          );
          if (matchByName) {
            this.selectedCity = matchByName;
            this.formData.city = matchByName.city;
            this.formData.cityRef = matchByName.Ref;
            console.log('[fetchUserAddress] matched city by name:', matchByName);
          } else {
            console.warn('[fetchUserAddress] Не знайшли місто за назвою у списку cities:', this.cities.map(c=>c.city));
            // Якщо не знайшли — залишаємо тільки рядок this.formData.city, але Combobox може не відобразити як вибір
          }
        }

        // 4) deliveryAddress
        this.deliveryAddress = { street: "", number: "", branch: "", postomat: "", warehouse: "" };

        if (address.delivery_type === "pickup") {
          // Якщо є cityRef — fetchWarehouses
          if (this.formData.cityRef) {
            console.log('[fetchUserAddress] fetching warehouses with cityRef:', this.formData.cityRef);
            await this.fetchWarehouses();
            console.log('[fetchUserAddress] warehouses:', this.warehouses);
            const addrStr = address.delivery_address || '';
            // Спробуємо точний match
            let matchWh = this.warehouses.find(w => w.name === addrStr);
            if (!matchWh) {
              // Спроба часткового match
              matchWh = this.warehouses.find(w => addrStr.includes(w.name) || w.name.includes(addrStr));
            }
            if (matchWh) {
              if (this.isPostomatPickup) {
                this.deliveryAddress.postomat = matchWh.name;
              } else {
                this.deliveryAddress.branch = matchWh.name;
              }
              console.log('[fetchUserAddress] matched warehouse entry:', matchWh);
            } else {
              console.warn('[fetchUserAddress] No matching warehouse for:', addrStr);
            }
          }
          // Якщо немає cityRef і не вдалось знайти — пропускаємо
        }
        else if (address.delivery_type === "courier") {
          // Завантажуємо вулиці
          console.log('[fetchUserAddress] courier: fetching streets...');
          await this.fetchStreets();
          console.log('[fetchUserAddress] streets after fetchStreets:', this.streets);

          // Розбиваємо address.delivery_address на street/number
          const full = address.delivery_address || '';
          let streetPart = '', numberPart = '';
          if (full.includes(' ')) {
            const parts = full.trim().split(' ');
            numberPart = parts.pop();
            streetPart = parts.join(' ');
          } else {
            streetPart = full;
          }
          console.log('[fetchUserAddress] parsed streetPart, numberPart:', streetPart, numberPart);

          // Спроба точного match в списку this.streets
          const matchStreet = this.streets.find(s => {
            const name = s.street || s.Name;
            return name === streetPart;
          });
          console.log('[fetchUserAddress] matched street:', matchStreet);
          if (matchStreet) {
            this.selectedStreet = matchStreet;
          } else {
            console.warn('[fetchUserAddress] No exact match for street; streets list names:', this.streets.map(s=>s.street||s.Name));
            // Можна створити об’єкт для відображення:
            this.selectedStreet = { street: streetPart };
          }
          this.deliveryAddress.street = streetPart;
          this.deliveryAddress.number = numberPart;
          this.formData.streetSearch = streetPart;
        }

        this.addressAvailable = true;
        console.log('[fetchUserAddress] final formData:', {
          deliveryType: this.formData.deliveryType,
          city: this.formData.city,
          cityRef: this.formData.cityRef,
          selectedCity: this.selectedCity,
          deliveryAddress: this.deliveryAddress,
          selectedStreet: this.selectedStreet
        });
      } else {
        this.addressAvailable = false;
      }
    } catch (error) {
      console.error("[fetchUserAddress] Помилка отримання адреси:", error);
      this.addressAvailable = false;
    } finally {
      this.loading = false;
    }
  },


    async fetchUserPhoneNumber() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/user/phone-number", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data !== null) {
          this.phoneNumber = response.data.phone;
        }
      } catch {
        toast.error(this.$t('user.loadPhoneNumberError'));
      }
    },
    async fetchDeliveryTypes() {
      try {
        const response = await api.getDeliveryTypes();
        const groups = response.data;
        const opts = [];
        for (const [type, items] of Object.entries(groups)) {
          const label = type === 'pickup' ? this.$t('payment.delivery') : this.$t('payment.courier');
          items.forEach(item => {
            opts.push({
  id: item.id,
  value: item.delivery_type, // 'pickup'
  name: item.name,           // наприклад 'Pickup from our stores' або інша назва
  label,
  isStorePickup: item.name === 'Pickup from our stores' // або інша умова
});
          });
        }
        this.deliveryOptions = opts;
      } catch {
        toast.error(this.$t('user.loadDeliveryError'));
      }
    },
    async submitAddress() {
      if (!this.validateForm()) {
        toast.error(this.$t('user.fillRequiredFields') || 'Будь ласка, заповніть усі обовʼязкові поля');
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
      let deliveryAddressValue = '';
      const method = this.formData.selectedDeliveryMethod || this.formData.deliveryType;
      if (this.formData.deliveryType?.value === "courier") {
        deliveryAddressValue = `${this.deliveryAddress.street} ${this.deliveryAddress.number}`;
      } else if (this.formData.deliveryType?.value === "pickup") {
        if (this.isStorePickup) {
          deliveryAddressValue = "вул. Степана Бандери 22, Коломия";
        } else if (this.isPostomatPickup) {
          deliveryAddressValue = this.deliveryAddress.postomat;
        } else {
          deliveryAddressValue = this.deliveryAddress.branch;
        }
      }
      const deliveryName = this.formData.deliveryType?.value === "courier"
        ? "Кур'єр Нової Пошти"
        : (method?.name || this.formData.deliveryType?.name);
      const postData = {
        phone_number: this.phoneNumber?.trim(),
        city: this.formData.city?.trim(),
        city_ref: this.formData.cityRef,
        delivery_type: this.formData.deliveryType?.value,
        delivery_name: deliveryName?.trim(),
        delivery_address: deliveryAddressValue?.trim()
      };
      try {
        let response;
        if (this.addressAvailable) {
          response = await axios.patch(
            `https://koshtovnya.api-dev.bmax-edu.website/api/user-address/${this.addressId}`,
            postData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          response = await axios.post(
            "https://koshtovnya.api-dev.bmax-edu.website/api/user-address",
            postData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        toast.success(this.$t('user.addressSaved') || 'Адресу успішно збережено');
        this.fetchUserAddress();
        this.showForm = false;
      } catch {
        toast.error(this.$t('user.saveAddressError') || 'Не вдалося зберегти адресу');
      }
    },
    resetAddressForm() {
      this.phoneNumber = "";
      this.formData.city = "";
      this.formData.cityRef = "";
      this.formData.deliveryType = null;
      this.formData.streetSearch = "";
      this.deliveryAddress = { street: "", number: "", branch: "", postomat: "", warehouse: "" };
      this.addressId = null;
    },
    validateForm() {
      const errors = {};
      if (!this.phoneNumber || this.phoneNumber.length !== 10) {
        errors.phoneNumber = this.$t('user.invalidPhone') || "Введіть коректний номер телефону (10 цифр)";
      }
      if (this.formData.deliveryType?.value === "courier") {
        if (!this.deliveryAddress.street) {
          errors.street = this.$t('user.selectStreet') || "Оберіть вулицю";
        }
        if (!this.deliveryAddress.number) {
          errors.number = this.$t('user.enterHouseNumber') || "Введіть номер будинку/квартири";
        }
      }
      if (this.formData.deliveryType?.value === "pickup") {
        if (!this.formData.city) {
          errors.city = this.$t('user.cityRequired') || "Місто є обов'язковим";
        }
        if (this.isStorePickup) {
          // нічого не перевіряємо
        } else if (this.isPostomatPickup) {
          if (!this.deliveryAddress.postomat) {
            errors.postomat = this.$t('user.selectPostomat') || "Оберіть поштомат";
          }
        } else {
          if (!this.deliveryAddress.branch) {
            errors.branch = this.$t('user.selectBranch') || "Оберіть відділення";
          }
        }
      }
      this.errors = errors;
      return Object.keys(errors).length === 0;
    },
    async deleteAddress() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
      try {
        await axios.delete(`https://koshtovnya.api-dev.bmax-edu.website/api/user-address/${this.addressId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(this.$t('user.addressDeleted') || "Адресу успішно видалено");
        this.addressAvailable = false;
        this.resetAddressForm();
      } catch (error) {
        toast.error(this.$t('user.deleteAddressError') || 'Не вдалося видалити адресу');
      }
    },
    editAddress() {
      this.showForm = true;
      this.formData.selectedDeliveryMethod = this.formData.deliveryType;
      const deliveryType = this.formData.deliveryType?.value;
      if (this.formData.city && this.formData.cityRef) {
        this.selectedCity = { city: this.formData.city, Ref: this.formData.cityRef };
      }
      if (deliveryType === 'courier') {
        if (this.savedDeliveryAddress) {
          const full = this.savedDeliveryAddress.trim();
          const split = full.split(' ');
          const number = split.pop();
          const street = split.join(' ');
          this.deliveryAddress.street = street;
          this.deliveryAddress.number = number;
          this.formData.streetSearch = street;
          this.selectedStreet = { street };
        }
      }
      if (deliveryType === 'pickup') {
        const lower = this.savedDeliveryAddress?.toLowerCase() || '';
        if (this.isStorePickup) {
          this.formData.city = 'Коломия';
          this.formData.cityRef = 'db5c891f-391c-11dd-90d9-001a92567626';
        } else if (lower.includes('поштомат') || lower.includes('postomat') || lower.includes('post office')) {
          this.deliveryAddress.postomat = this.savedDeliveryAddress;
        } else if (lower.includes('відділення') || lower.includes('post office')) {
          this.deliveryAddress.branch = this.savedDeliveryAddress;
        } else {
          this.deliveryAddress.branch = this.savedDeliveryAddress;
        }
      }
      this.$nextTick(async () => {
        await this.updateDeliveryOptions();
        this.formData.selectedDeliveryMethod = this.formData.deliveryType;
        if (deliveryType === 'courier') {
          await this.fetchStreets();
        }
        if (deliveryType === 'pickup') {
          await this.fetchWarehouses();
        }
        this.$nextTick(() => {
          this.selectedCity = { city: this.formData.city, Ref: this.formData.cityRef };
          if (this.deliveryAddress.street) {
            this.selectedStreet = { street: this.deliveryAddress.street };
          }
        });
      });
    },
      openForm() {
    this.isEditingExisting = false;
    this.showForm = true;
    this.resetAddressForm();
    if (!this.phoneNumber) this.fetchUserPhoneNumber();
  },

    cancelEdit() {
      this.showForm = false;
    }
  },
  computed: {
    displayAddress() {
      if (this.formData.deliveryType?.value === 'courier') {
        return this.deliveryAddress.street && this.deliveryAddress.number
          ? `${this.deliveryAddress.street} ${this.deliveryAddress.number}`
          : this.savedDeliveryAddress || '(не вказано)';
      }
      if (this.formData.deliveryType?.value === 'pickup') {
        if (this.deliveryAddress.branch) return this.deliveryAddress.branch;
        if (this.deliveryAddress.postomat) return this.deliveryAddress.postomat;
      }
      return this.savedDeliveryAddress || '(не вказано)';
    },
      isStorePickup() {
    return this.formData.deliveryType?.value === 'pickup'
      && this.formData.deliveryType.isStorePickup === true;
  },
    isPostomatPickup() {
      const name = (this.formData.deliveryType?.name || '').toLowerCase();
      return name.includes('поштомат')
          || name.includes('postomat')
          || name.includes('post office');
    },
    isBranchPickup() {
      // будь-який pickup не store та не postomat вважаємо branch
      if (this.formData.deliveryType?.value !== 'pickup') return false;
      return !this.isStorePickup && !this.isPostomatPickup;
    },
    isNovaPoshtaPickup() {
      const name = this.formData.deliveryType?.name || '';
      return name === 'Самовивіз з Нової Пошти'
          || name.toLowerCase().includes('nova poshta');
    },
    isUkrposhtaPickup() {
      const name = (this.formData.deliveryType?.name || '').toLowerCase();
      return name.includes('укрпошта')
          || name.includes('ukrposta');
    }
  },
  watch: {
    'formData.deliveryType': {
      handler() {
        this.updateDeliveryOptions();
      },
      immediate: false
    },
    selectedCity(newCity) {
      if (newCity?.Ref) {
        this.formData.city = newCity.city;
        this.formData.cityRef = newCity.Ref;
        this.warehouses = [];
        this.fetchWarehouses();
      }
    }
  },
  mounted() {
    document.title = "Ваша адреса";
  }
};
</script>

<style>
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

.multiselect__option--highlight::after {
  display: none !important;
}
</style>
