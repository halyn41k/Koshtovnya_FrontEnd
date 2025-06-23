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
      <p class="text-gray-800 dark:text-gray-100"><strong>{{ $t('user.deliveryType') }}:</strong> {{ displayDeliveryName }}</p>

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
      savedDeliveryName: '',
      savedDeliveryType: '',
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
  async created() {
  await this.fetchDeliveryTypes();
  await this.fetchUserAddress();
  
  if (!this.addressAvailable) {
    this.fetchUserPhoneNumber();
    
    
  }
  
  this.debouncedFetchCities = this.debounce(this.fetchCities.bind(this), 300);
},
  methods: {

    isStorePickupByName(name) {
  if (!name || typeof name !== 'string') return false;
  
  const nameLower = name.toLowerCase().trim();
  
  // Exact matches for store pickup
  const storePickupPatterns = [
    'pickup from our stores',
    'store pickup', 
    'самовивіз з наших магазинів',
    'pickup from stores',
    'our stores pickup',
    'магазин самовивіз'
  ];
  
  // Direct exact match
  if (storePickupPatterns.includes(nameLower)) {
    return true;
  }
  
  // Pattern matching for store pickup
  const storePickupRegexes = [
    /^pickup.*our.*stores?$/i,
    /^store.*pickup$/i,
    /^самовивіз.*наш.*магазин/i,
    /^our.*stores?.*pickup$/i,
    /магазин.*самовивіз/i,
    /самовивіз.*магазин/i
  ];
  
  return storePickupRegexes.some(regex => regex.test(nameLower));
},
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
    
findDeliveryTypeByName(deliveryName) {
  if (!deliveryName) return null;
  
  const nameLower = deliveryName.trim().toLowerCase();
  
  // EXACT MATCH first (case-insensitive)
  let foundType = this.deliveryOptions.find(opt =>
    opt.name.trim().toLowerCase() === nameLower
  );
  
  if (foundType) {
    console.log('[findDeliveryTypeByName] exact match found:', foundType);
    return foundType;
  }
  
  // Enhanced store pickup detection
  if (this.isStorePickupByName(deliveryName)) {
    foundType = this.deliveryOptions.find(opt => 
      opt.isStorePickup === true || this.isStorePickupByName(opt.name)
    );
    if (foundType) {
      console.log('[findDeliveryTypeByName] store pickup match:', foundType);
      return foundType;
    }
  }
  
  // ВИПРАВЛЕННЯ: Покращена логіка пошуку з правильним маппінгом
  const searchPatterns = [
    // Кур'єр patterns - Ukrainian to standard
    { 
      pattern: /^кур.*пошт/i, 
      finder: () => this.deliveryOptions.find(opt => opt.value === 'courier')
    },
    { 
      pattern: /courier.*nova/i, 
      finder: () => this.deliveryOptions.find(opt => opt.value === 'courier')
    },
    
    // Pickup patterns with better specificity
    { 
      exact: 'самовивіз з нової пошти', 
      finder: () => this.deliveryOptions.find(opt => 
        opt.value === 'pickup' && 
        !this.isStorePickupByName(opt.name) &&
        (opt.name.toLowerCase().includes('nova poshta') || 
         opt.name.toLowerCase().includes('нов') ||
         opt.name.toLowerCase().includes('pickup'))
      )
    },
    
    // Postomat patterns
    { 
      pattern: /поштомат|postomat|post office/i, 
      finder: () => this.deliveryOptions.find(opt => {
        const optName = opt.name.toLowerCase();
        return optName.includes('postomat') || 
               optName.includes('post office') || 
               optName.includes('поштомат');
      })
    },
    
    // Ukrposhta patterns
    { 
      pattern: /укрпошт|ukrpost/i, 
      finder: () => this.deliveryOptions.find(opt => {
        const optName = opt.name.toLowerCase();
        return optName.includes('укрпошт') || optName.includes('ukrpost');
      })
    }
  ];
  
  // Перевіряємо patterns
  for (const { exact, pattern, finder } of searchPatterns) {
    if (exact && nameLower === exact) {
      foundType = finder();
      if (foundType) {
        console.log('[findDeliveryTypeByName] exact pattern match:', foundType);
        return foundType;
      }
    }
    
    if (pattern && pattern.test(nameLower)) {
      foundType = finder();
      if (foundType) {
        console.log('[findDeliveryTypeByName] pattern match:', foundType);
        return foundType;
      }
    }
  }
  
  // Partial search as final fallback
  foundType = this.deliveryOptions.find(opt => 
    opt.name.toLowerCase().includes(nameLower) ||
    nameLower.includes(opt.name.toLowerCase())
  );
  
  if (foundType) {
    console.log('[findDeliveryTypeByName] partial match:', foundType);
  }
  
  return foundType;
},

    updateDeliveryOptions() {
  const value = this.formData.deliveryType?.value;
  
  console.log('[updateDeliveryOptions] called with value:', value);
  console.log('[updateDeliveryOptions] current city:', this.formData.city);
  console.log('[updateDeliveryOptions] isEditingExisting:', this.isEditingExisting);

  // ВИПРАВЛЕННЯ: При редагуванні НЕ очищуємо дані!
  if (!this.isEditingExisting && !this.addressAvailable) {
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

  // Спецвипадок: самовивіз з наших магазинів
  if (this.isStorePickup) {
    // ВИПРАВЛЕННЯ: При store pickup ЗАВЖДИ встановлюємо Коломию
    this.formData.city = "Коломия";
    this.formData.cityRef = "db5c891f-391c-11dd-90d9-001a92567626";
    this.selectedCity = { city: "Коломия", Ref: "db5c891f-391c-11dd-90d9-001a92567626" };
    console.log('[updateDeliveryOptions] Set Kolomyia for store pickup');
    return;
  }

  // Завантажуємо дані для інших типів доставки
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

      // Зберігаємо оригінальні дані
      this.savedDeliveryAddress = address.delivery_address || '';
      this.savedDeliveryName = address.delivery_name || '';
      this.savedDeliveryType = address.delivery_type || '';
      this.phoneNumber = address.phone_number || "";
      this.addressId = address.id;

      // ВИПРАВЛЕННЯ: Спочатку очищуємо formData
      this.formData = {
        city: "",
        cityRef: "",
        deliveryType: null,
        selectedDeliveryMethod: null,
        deliveryName: "",
        streetSearch: ""
      };
      this.deliveryAddress = { street: "", number: "", branch: "", postomat: "", warehouse: "" };
      this.selectedCity = null;
      this.selectedStreet = null;

      // Знаходимо відповідний deliveryType
      let foundType = null;
      
      if (address.delivery_name) {
        foundType = this.findDeliveryTypeByName(address.delivery_name);
        console.log('[fetchUserAddress] found by name:', foundType);
      }
      
      if (!foundType && address.delivery_type) {
        foundType = this.deliveryOptions.find(opt => opt.value === address.delivery_type);
        console.log('[fetchUserAddress] found by value:', foundType);
      }
      
      if (!foundType && (address.delivery_type || address.delivery_name)) {
        console.warn('[fetchUserAddress] Could not find delivery type, creating fallback');
        foundType = {
          id: 'fallback',
          value: address.delivery_type || 'unknown',
          name: address.delivery_name || 'Невідомий тип доставки',
          label: address.delivery_type === 'pickup' ? this.$t('payment.delivery') : this.$t('payment.courier'),
          isStorePickup: this.isStorePickupByName(address.delivery_name)
        };
      }
      
      // КРИТИЧНЕ ВИПРАВЛЕННЯ: Встановлюємо deliveryType ПІСЛЯ того як знайшли
      if (foundType) {
        this.formData.deliveryType = foundType;
        this.formData.selectedDeliveryMethod = foundType;
        this.formData.deliveryName = foundType.name;
      }

      // ВИПРАВЛЕННЯ: Встановлюємо місто ПІСЛЯ deliveryType
      if (address.city) {
        this.formData.city = address.city;
      }
      if (address.city_ref) {
        this.formData.cityRef = address.city_ref;
        // ВАЖЛИВО: Створюємо selectedCity після встановлення formData.city
        this.selectedCity = { 
          city: address.city || this.formData.city, 
          Ref: address.city_ref 
        };
      }

      // Обробляємо адресу залежно від типу доставки
      if (address.delivery_type === "pickup") {
        const deliveryAddr = address.delivery_address || '';
        const deliveryName = address.delivery_name || '';
        
        // Перевіряємо чи це store pickup
        if (this.isStorePickupByName(deliveryName) || this.isStorePickupByName(foundType?.name)) {
          // ВИПРАВЛЕННЯ: Для store pickup ЗАВЖДИ встановлюємо Коломию
          this.formData.city = 'Коломия';
          this.formData.cityRef = 'db5c891f-391c-11dd-90d9-001a92567626';
          this.selectedCity = { city: 'Коломия', Ref: 'db5c891f-391c-11dd-90d9-001a92567626' };
        } else {
          // Для інших pickup завантажуємо warehouses
          if (this.formData.cityRef) {
            await this.fetchWarehouses();
            
            const isPostomat = deliveryAddr.toLowerCase().includes('поштомат') || 
                              deliveryAddr.toLowerCase().includes('postomat') || 
                              deliveryAddr.toLowerCase().includes('post office') ||
                              deliveryName.toLowerCase().includes('postomat') ||
                              deliveryName.toLowerCase().includes('поштомат');
            
            if (isPostomat) {
              this.deliveryAddress.postomat = deliveryAddr;
            } else {
              this.deliveryAddress.branch = deliveryAddr;
            }
          }
        }
      } else if (address.delivery_type === "courier") {
        // Обробка кур'єрської доставки
        if (this.formData.cityRef) {
          await this.fetchStreets();
        }
        
        const fullAddress = address.delivery_address || '';
        if (fullAddress.includes(' ')) {
          const parts = fullAddress.trim().split(' ');
          const numberPart = parts.pop();
          const streetPart = parts.join(' ');
          
          this.deliveryAddress.street = streetPart;
          this.deliveryAddress.number = numberPart;
          this.formData.streetSearch = streetPart;
          
          const matchStreet = this.streets.find(s => {
            const name = s.street || s.Name;
            return name === streetPart;
          });
          
          if (matchStreet) {
            this.selectedStreet = matchStreet;
          } else {
            this.selectedStreet = { street: streetPart };
          }
        }
      }

      this.addressAvailable = true;
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
  value: item.delivery_type,
  name: item.name,
  label,
  isStorePickup: this.isStorePickupByName(item.name) // нова функція
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
    toast.error(this.$t('user.fillRequiredFields') || 'Будь ласка, заповніть усі обов\'язкові поля');
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
  
  // ВИПРАВЛЕННЯ: Правильно формуємо назву доставки
  let deliveryName;
  if (this.formData.deliveryType?.value === "courier") {
    deliveryName = "Кур'єр Нової Пошти";
  } else {
    // Для pickup використовуємо оригінальну назву з опцій
    deliveryName = this.formData.deliveryType?.name;
  }
  
  const postData = {
    phone_number: this.phoneNumber?.trim(),
    city: this.formData.city?.trim(),
    city_ref: this.formData.cityRef,
    delivery_type: this.formData.deliveryType?.value,
    delivery_name: deliveryName?.trim(),
    delivery_address: deliveryAddressValue?.trim()
  };
  
  console.log('[submitAddress] Sending data:', postData);
  
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
    
    // ВИПРАВЛЕННЯ: Оновлюємо дані після збереження
    this.showForm = false;
    await this.fetchUserAddress(); // Це оновить всі дані з сервера
    
  } catch (error) {
    console.error('Error saving address:', error);
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
 async editAddress() {
  this.showForm = true;
  this.isEditingExisting = true;
  
  // ВИПРАВЛЕННЯ: НЕ очищуємо formData при редагуванні!
  // Дані вже встановлені в fetchUserAddress
  
  console.log('[editAddress] Current formData:', this.formData);
  console.log('[editAddress] Current selectedCity:', this.selectedCity);
  console.log('[editAddress] Current deliveryType:', this.formData.deliveryType);
  
  // Встановлюємо selectedDeliveryMethod
  if (this.formData.deliveryType) {
    this.formData.selectedDeliveryMethod = this.formData.deliveryType;
  }
  
  const deliveryType = this.formData.deliveryType?.value;
  
  // ВИПРАВЛЕННЯ: Переконуємося що selectedCity встановлено
  if (this.formData.city && this.formData.cityRef && !this.selectedCity) {
    this.selectedCity = { city: this.formData.city, Ref: this.formData.cityRef };
  }
  
  // Завантажуємо необхідні дані асинхронно
  this.$nextTick(async () => {
    // Спочатку оновлюємо опції доставки
    await this.updateDeliveryOptions();
    
    // Завантажуємо дані залежно від типу доставки
    if (deliveryType === 'courier' && this.formData.cityRef) {
      await this.fetchStreets();
    }
    
    if (deliveryType === 'pickup' && !this.isStorePickup && this.formData.cityRef) {
      await this.fetchWarehouses();
    }
    
    // Переконуємося що всі значення встановлені правильно
    this.$nextTick(() => {
      console.log('[editAddress] After async loading:');
      console.log('- formData.city:', this.formData.city);
      console.log('- selectedCity:', this.selectedCity);
      console.log('- deliveryType:', this.formData.deliveryType);
      console.log('- isStorePickup:', this.isStorePickup);
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
     isPostomatPickup() {
    const currentName = (this.formData.deliveryType?.name || '').toLowerCase();
    const savedName = (this.savedDeliveryName || '').toLowerCase();
    
    // ВИПРАВЛЕННЯ: Перевіряємо також поточну адресу
    const currentAddress = (this.deliveryAddress.postomat || '').toLowerCase();
    const savedAddress = (this.savedDeliveryAddress || '').toLowerCase();
    
    return currentName.includes('поштомат') ||
           currentName.includes('postomat') ||
           currentName.includes('post office') ||
           savedName.includes('поштомат') ||
           savedName.includes('postomat') ||
           savedName.includes('post office') ||
           currentAddress.includes('поштомат') ||
           currentAddress.includes('postomat') ||
           savedAddress.includes('поштомат') ||
           savedAddress.includes('postomat');
  },
  
  isStorePickup() {
    if (this.formData.deliveryType?.value !== 'pickup') return false;
    
    return this.formData.deliveryType.isStorePickup === true ||
           this.isStorePickupByName(this.formData.deliveryType?.name) ||
           this.isStorePickupByName(this.savedDeliveryName);
  },
  
  displayDeliveryName() {
    // ВИПРАВЛЕННЯ: Використовуємо актуальні дані з formData
    const currentType = this.formData.deliveryType;
    const deliveryType = currentType?.value || this.savedDeliveryType;
    
    if (deliveryType === 'courier') {
      return this.$t('user.delivery.courierNovaPoshta') || 'Кур\'єр Нової Пошти';
    }
    
    if (deliveryType === 'pickup') {
      const currentName = currentType?.name;
      const savedName = this.savedDeliveryName;
      
      // Перевіряємо store pickup
      if (this.isStorePickup) {
        return this.$t('user.delivery.storePickup') || 'Самовивіз з наших магазинів';
      }
      
      // Перевіряємо postomat
      if (this.isPostomatPickup) {
        return this.$t('user.delivery.postomat') || 'Поштомат';
      }
      
      // Повертаємо поточну назву або збережену
      return currentName || savedName || this.$t('payment.delivery');
    }
    
    return currentType?.name || this.savedDeliveryName || '(тип доставки не вказано)';
  },
  
  displayAddress() {
    if (this.formData.deliveryType?.value === 'courier') {
      return this.deliveryAddress.street && this.deliveryAddress.number
        ? `${this.deliveryAddress.street} ${this.deliveryAddress.number}`
        : this.savedDeliveryAddress || '(не вказано)';
    }
    
    if (this.formData.deliveryType?.value === 'pickup') {
      if (this.isStorePickup) {
        return this.$t('user.pickupAddress') || 'вул. Степана Бандери 22, Коломия';
      }
      
      // ВИПРАВЛЕННЯ: Правильно показуємо відповідну адресу
      if (this.isPostomatPickup) {
        return this.deliveryAddress.postomat || this.savedDeliveryAddress || '(не вказано)';
      } else {
        return this.deliveryAddress.branch || this.savedDeliveryAddress || '(не вказано)';
      }
    }
    
    return this.savedDeliveryAddress || '(не вказано)';
  },

   isBranchPickup() {
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
