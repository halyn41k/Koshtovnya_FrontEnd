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
          <input v-model="phoneNumber" @input="formatPhoneNumber"
            :placeholder="$t('user.enterPhone')"
            maxlength="10" inputmode="numeric" pattern="[0-9]*"
            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50"
            :class="errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'" />
          <p v-if="errors.phoneNumber" class="text-red-500 dark:text-gray-100 text-sm mt-1">{{ errors.phoneNumber }}</p>
        </div>

        <!-- Delivery Type -->
        <div>
          <label class="block text-gray-800 dark:text-gray-100 mb-1">{{ $t('user.deliveryType') }}:</label>
          <Multiselect v-model="formData.deliveryType" :options="deliveryOptions"
            :custom-label="opt => `${opt.label} — ${opt.name}`" :track-by="'id'"
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
        <template v-if="formData.deliveryType?.name === 'Самовивіз з наших магазинів'">
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

          <div v-if="isNovaPoshtaPickup || isUkrposhtaPickup">
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
import Multiselect from 'vue-multiselect'
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/vue'
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
      selectedCity: null,
      selectedStreet: null,

      addressAvailable: false,
      showForm: false,
      dropdownTop: 0,
      dropdownLeft: 0,
      dropdownWidth: 0,
      savedDeliveryAddress: '',

      phoneNumber: "",
      formData: {
        city: "",
        cityRef: "",
        deliveryType: "",
        selectedDeliveryMethod: null,
        deliveryName: "",
        streetSearch: ""
      },
      dropdownOpen: {
        deliveryType: false,
        deliveryMethod: false,
        branch: false,
        postomat: false
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
      cityLoading: false,
      showCityDropdown: false,
      errors: {},
      loading: true,
      addressId: null,
      deliveryOptions: []

    };
  },

  created() {
    this.fetchDeliveryTypes().then(() => {
      this.fetchUserAddress();
    });

    if (!this.addressAvailable) {
      this.fetchUserPhoneNumber();
    }
    // Прив'язуємо fetchCities до контексту компонента з дебаунсом
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
  const name = this.formData.deliveryType?.name?.toLowerCase();
  const value = this.formData.deliveryType?.value;

  // 🧹 Очищаємо тільки якщо це нова адреса (тобто не редагування)
  if (!this.addressAvailable) {
    this.formData.selectedDeliveryMethod = this.formData.deliveryType;
    this.formData.cityRef = '';
    this.formData.streetSearch = '';
    this.selectedCity = null;
    this.selectedStreet = null;

    this.deliveryAddress = {
      street: '',
      number: '',
      branch: '',
      postomat: '',
      warehouse: ''
    };

    this.streets = [];
    this.cities = [];
    this.warehouses = [];
  }

  // Спецвипадок: самовивіз з магазину
  if (value === 'pickup' && name.includes('самовивіз з наших магазинів')) {
    this.formData.city = "Коломия";
    this.formData.cityRef = "db5c891f-391c-11dd-90d9-001a92567626";
    return;
  }

  // Якщо є дані — фетчимо
  if (this.formData.city && this.formData.cityRef) {
    if (value === 'pickup') this.fetchWarehouses();
    if (value === 'courier') this.fetchStreets();
  }

  // Якщо нема міста — підтягуємо список міст
  if (!this.formData.city && value === 'pickup') {
    this.fetchCities();
  }
},
    updateDropdownPosition() {
      this.$nextTick(() => {
        const input = this.$refs.cityInput;
        if (input) {
          const rect = input.getBoundingClientRect();
          this.dropdownTop = rect.bottom + window.scrollY;
          this.dropdownLeft = rect.left + window.scrollX;
          this.dropdownWidth = rect.width;
        }
      });
    },

    onDeliveryMethodChange() {
      if (
        this.formData.deliveryType?.value === "pickup" &&
        this.formData.selectedDeliveryMethod &&
        this.formData.selectedDeliveryMethod.is_store
      ) {
        if (this.formData.deliveryType?.name === "Самовивіз з наших магазинів")
          this.formData.city = "Коломия";
        this.deliveryAddress.branch = "";
        this.deliveryAddress.postomat = "";

      } else {
        this.formData.city = "";
        this.formData.cityRef = "";
      }
    },
    handleClickOutsideDropdown(event) {
      const wrapper = this.$refs.cityFieldWrapper;
      if (wrapper && !wrapper.contains(event.target)) {
        this.showCityDropdown = false;
      }
    },

    onCityInput() {
      if (this.formData.city.trim().length < 2) {
        this.cities = [];
        this.showCityDropdown = false;
        return;
      }
      if (this.formData.deliveryType?.value === "courier" || this.formData.deliveryType?.value === "pickup") {
        this.debouncedFetchCities();
        this.showCityDropdown = true;
      } else {
        this.cities = [];
        this.showCityDropdown = false;
      }
    },
    async fetchCities() {
  const token = localStorage.getItem("token");
  let deliveryTypeParam = "";

  if (this.formData.deliveryType?.value === "courier") {
    deliveryTypeParam = "Кур'єр Нової Пошти";
  } else if (this.formData.deliveryType?.value === "pickup") {
    deliveryTypeParam = this.formData.deliveryType?.name || "Самовивіз з Нової Пошти";
  }

  if (!this.formData.city) return;

  try {
    const response = await axios.get(
      "https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/cities",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          city: this.formData.city,
          delivery_type: deliveryTypeParam,
        },
      }
    );

    if (response.data.success && Array.isArray(response.data.data)) {
      this.cities = response.data.data;
    } else {
      this.cities = [];
    }
  } catch (error) {
    console.error("Error fetching cities:", error.response?.data || error.message);
    this.cities = [];
  }
},
    hideCityDropdown() {
      setTimeout(() => {
        this.showCityDropdown = false;
      }, 300);
    },

    async fetchWarehouses() {
  if (!this.formData.cityRef) {
    console.error("CityRef is required.");
    return;
  }
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/ware-houses", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        city: this.formData.city,
        Ref: this.formData.cityRef,
        delivery_type: this.formData.deliveryType?.value
      }
    });

    if (response.status === 200 && Array.isArray(response.data?.data)) {
      const deliveryName = this.formData.deliveryType?.name?.toLowerCase() || '';
      const isPostomatMode = deliveryName.includes('поштомат');

      // 🛠️ Нове: фільтруємо чітко
      const filtered = response.data.data.filter((w) => {
        const name = (w.warehouse || '').toLowerCase();

        if (isPostomatMode) {
          return name.includes('поштомат');
        } else {
          // ❗ Відсікаємо всі поштомати, залишаємо тільки відділення
          return !name.includes('поштомат') && (
            name.includes('відділення') ||
            name.includes('нова пошта') ||
            name.includes('укрпошта')
          );
        }
      });

      this.warehouses = filtered.map((item, index) => ({
        id: index + 1,
        name: item.warehouse
      }));
    } else {
      this.warehouses = [];
    }
  } catch (error) {
    console.error("Error fetching warehouses:", error.response?.data || error.message);
    this.warehouses = [];
  }
},

  onCitySearch(query) {
  this.formData.city = query;

  if (query.length < 2) {
    this.cities = [];
    return;
  }

  const deliveryTypeParam =
    this.formData.selectedDeliveryMethod?.name || this.formData.deliveryType?.name || 'Самовивіз з Нової Пошти';

  const token = localStorage.getItem("token");

  axios
    .get("https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/cities", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        city: query,
        delivery_type: deliveryTypeParam,
      },
    })
    .then((response) => {
      if (response.data.success && Array.isArray(response.data.data)) {
        this.cities = response.data.data;
      } else {
        this.cities = [];
      }
    })
    .catch((error) => {
      console.error("Error fetching cities:", error);
      this.cities = [];
    });
},

    async fetchStreets() {
      // Якщо місто не обране, припиняємо запит
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
            street: this.formData.streetSearch // передаємо запит для пошуку
          }
        });
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          this.streets = response.data.data;
        } else {
          this.streets = [];
        }
      } catch (error) {
        console.error("Error fetching streets:", error.response?.data || error.message);
        this.streets = [];
      }
    },
    // Метод, що викликається при введенні в полі пошуку вулиць
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
      console.log("Вибрана вулиця:", this.deliveryAddress.street);
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

    if (response.data && response.data.data) {
      const address = response.data.data;
      this.savedDeliveryAddress = address.delivery_address || '';


      this.phoneNumber = address.phone_number || "";
      this.formData.city = address.city || "";
      this.formData.cityRef = address.city_ref || "";
      this.selectedCity = {
        city: address.city,
        Ref: address.city_ref
      };

      const foundType = this.deliveryOptions.find(opt =>
        opt.value === address.delivery_type && opt.name === address.delivery_name
      );
      this.formData.deliveryType = foundType || null;
this.formData.selectedDeliveryMethod = foundType || null;

this.$nextTick(() => {
  this.updateDeliveryOptions();
});

      this.formData.deliveryName = address.delivery_name || "";
      this.addressId = address.id;

      this.deliveryAddress = {
        street: "",
        number: "",
        branch: "",
        postomat: "",
        warehouse: ""
      };

     if (address.delivery_type === "courier") {
  const full = address.delivery_address || '';
  let streetPart = '', numberPart = '';

  // Якщо починається на "вул." — стандартна розбивка
  if (full.includes(' ')) {
    const split = full.trim().split(' ');
    streetPart = split.slice(0, -1).join(' ');
    numberPart = split.slice(-1)[0];
  } else {
    // Якщо не можемо розбити — записуємо все в вулицю
    streetPart = full;
  }

  this.deliveryAddress.street = streetPart;
  this.deliveryAddress.number = numberPart;
  this.formData.streetSearch = streetPart;
  this.selectedStreet = { street: streetPart };

  await this.fetchStreets();
}

       else if (address.delivery_type === "pickup") {
        const lowerAddr = (address.delivery_address || '').toLowerCase();

        if (lowerAddr.includes("поштомат")) {
          this.deliveryAddress.postomat = address.delivery_address;
        } else if (lowerAddr.includes("вул. степана бандери")) {
          // Самовивіз з магазину — нічого не змінюємо
        } else if (lowerAddr.includes("відділення")) {
          this.deliveryAddress.branch = address.delivery_address;
        } else {
          // Якщо не вдалося ідентифікувати — все одно зберігаємо у branch
          this.deliveryAddress.branch = address.delivery_address;
        }
      }

      this.addressAvailable = true;
    } else {
      this.addressAvailable = false;
    }

  } catch (error) {
    console.error("Помилка отримання адреси:", error);
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
      } catch (error) {
        console.error("Помилка отримання номера телефону:", error);
      }
    },
    async fetchDeliveryTypes() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Будь ласка, увійдіть у свій обліковий запис.");
    this.$router.push("/login");
    return;
  }
  try {
    const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/delivery-types", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = [];
    const data = response.data.data;

    for (const typeKey in data) {
      const label = typeKey === 'courier' ? "Кур'єр" : "Самовивіз";

      data[typeKey].forEach(option => {
        result.push({
          label,
          value: typeKey,
          name: option.name,
          id: option.id,
          is_store: option.name === "Самовивіз з наших магазинів" // 💥 ось тут
        });
      });
    }

    this.deliveryOptions = result;
  } catch (error) {
    console.error("Error fetching delivery types:", error);
  }
},
    handleCityInput() {
      console.log("Введене місто:", this.formData.city);
      if (this.formData.city.length >= 3) {
        this.fetchCities();
      }
    },
    async submitAddress() {
  if (!this.validateForm()) {
    toast.error('Будь ласка, заповніть усі обовʼязкові поля');
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
    if (method?.is_store) {
      deliveryAddressValue = "вул. Степана Бандери 22, Коломия";
    } else if (method?.name?.toLowerCase().includes("поштомат")) {
      deliveryAddressValue = this.deliveryAddress.postomat;
    } else {
      deliveryAddressValue = this.deliveryAddress.branch;
    }
  }

  const deliveryName =
    this.formData.deliveryType?.value === "courier"
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

  console.log("postData:", postData);

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

    console.log("Response data:", response.data);
    toast.success('Адресу успішно збережено');
    this.fetchUserAddress();
    this.showForm = false;
  } catch (error) {
    console.error("Помилка збереження адреси:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
    }
    toast.error('Не вдалося зберегти адресу');
  }
},
    resetAddressForm() {
      this.phoneNumber = "";
      this.formData.city = "";
      this.formData.cityRef = "";
      this.formData.deliveryType = null; // ✅ не порожній рядок!
      this.formData.streetSearch = "";
      this.deliveryAddress = { street: "", number: "", branch: "", postomat: "", warehouse: "" };
      this.addressId = null;
    }
    ,
    validateForm() {
  const errors = {};

  // ✅ Перевірка номера телефону
  if (!this.phoneNumber || this.phoneNumber.length !== 10) {
    errors.phoneNumber = "Введіть коректний номер телефону (10 цифр)";
  }

  if (this.formData.deliveryType?.value === "courier") {
    if (!this.deliveryAddress.street) {
      errors.street = "Оберіть вулицю";
    }
    if (!this.deliveryAddress.number) {
      errors.number = "Введіть номер будинку/квартири";
    }
  }

  if (this.formData.deliveryType?.value === "pickup") {
  if (!this.formData.city) {
    errors.city = "Місто є обов'язковим";
  }

  // НЕ перевіряємо нічого для самовивозу з наших магазинів
  if (this.isStorePickup) {
    // нічого не перевіряємо
  } else if (this.isPostomatPickup) {
    if (!this.deliveryAddress.postomat) {
      errors.postomat = "Оберіть поштомат";
    }
  } else {
    if (!this.deliveryAddress.branch) {
      errors.branch = "Оберіть відділення";
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
        alert("Адресу успішно видалено");
        this.addressAvailable = false;
        this.resetAddressForm();
      } catch (error) {
        console.error("Помилка видалення адреси:", error);
        toast.error('Не вдалося зберегти адресу');

        alert(error.response?.data?.message || "Не вдалося видалити адресу");
      }
    },
   editAddress() {
  this.showForm = true;
  this.formData.selectedDeliveryMethod = this.formData.deliveryType;

  const deliveryType = this.formData.deliveryType?.value;

  if (this.formData.city && this.formData.cityRef) {
    this.selectedCity = {
      city: this.formData.city,
      Ref: this.formData.cityRef
    };
  }

  if (deliveryType === 'courier') {
    // жорстко встановлюємо всі потрібні поля
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
    } else if (lower.includes('поштомат')) {
      this.deliveryAddress.postomat = this.savedDeliveryAddress;
    } else if (lower.includes('відділення')) {
      this.deliveryAddress.branch = this.savedDeliveryAddress;
    } else {
      this.deliveryAddress.branch = this.savedDeliveryAddress;
    }
  }

  this.$nextTick(async () => {
    await this.updateDeliveryOptions(); // не очищає, бо addressAvailable = true
    this.formData.selectedDeliveryMethod = this.formData.deliveryType;

    if (deliveryType === 'courier') {
      await this.fetchStreets();
    }

    if (deliveryType === 'pickup') {
      await this.fetchWarehouses();
    }

    // 💥 додатково форсуємо оновлення в Combobox (Vue буває тупий)
    this.$nextTick(() => {
      this.selectedCity = { city: this.formData.city, Ref: this.formData.cityRef };
      if (this.deliveryAddress.street) {
        this.selectedStreet = { street: this.deliveryAddress.street };
      }
    });
  });
},


    openForm() {
      if (!this.phoneNumber) {
        this.fetchUserPhoneNumber();
      }
      this.showForm = true;
    },
    cancelEdit() {
      this.showForm = false;
    }
  },
  mounted() {
    document.title = "Ваша адреса";
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
    formattedDeliveryAddress() {
    // Якщо тип pickup і нічого не зайшло — fallback
    return this.deliveryAddress.branch ||
           this.deliveryAddress.postomat ||
           this.formData?.delivery_address ||
           '';
  },
  isStorePickup() {
    return this.formData.deliveryType?.name === 'Самовивіз з наших магазинів';
  },
  isPostomatPickup() {
    return this.formData.deliveryType?.name?.toLowerCase().includes('поштомат');
  },
  isNovaPoshtaPickup() {
    return this.formData.deliveryType?.name === 'Самовивіз з Нової Пошти';
  },
  isUkrposhtaPickup() {
    return this.formData.deliveryType?.name?.toLowerCase().includes('укрпошта');
  },
  fallbackDeliveryAddress() {
    return this.deliveryAddress.branch || this.deliveryAddress.postomat || '';
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
      this.warehouses = []; // обовʼязково очищаємо перед фетчем
      this.fetchWarehouses();
    }
  }
}
};
</script>

<style>
.custom-multiselect .multiselect__option--highlight::after {
  display: none !important;
}

.multiselect__option--highlight {
  background: #F3F4F6 !important;
  /* Ніжно-рожевий */
  color: #6B1F1F !important;
  /* Головний колір тексту */
}

.multiselect__option--selected {
  font-weight: 600 !important;
  /* semibold */
}

.multiselect__option--selected::after {
  content: 'Обрано' !important;
  color: #9CA3AF;
  /* світло-сірий */
  font-size: 0.75rem;
  /* text-sm */
  font-weight: 500;
  float: right;
  margin-right: 1rem;
}

.multiselect__option--highlight::after {
  display: none !important;
}

</style>