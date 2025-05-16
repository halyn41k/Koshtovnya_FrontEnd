<template>
  <div class="max-w-3xl p-4 sm:p-6 overflow-y-auto h-[90vh] font-sans">
    <!-- Loader -->
    <Loader v-if="loading" class="mx-auto my-16" />

    <!-- No Address Block -->
    <div v-if="!addressAvailable && !loading && !showForm" class="text-center mb-6">
      <p class="text-gray-500 text-lg mb-4">
        Немає адреси доставки. Створіть нову адресу!
      </p>
      <button
        class="inline-flex items-center mx-auto px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded-lg transition"
        @click="openForm">
        <span class="text-2xl mr-2">+</span>
        <span>Створити нову адресу</span>
      </button>
    </div>

    <!-- Address Form -->
    <div v-if="showForm" class="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <h2 class="text-2xl font-semibold text-gray-800">
        {{ addressAvailable ? 'Оновити адресу' : 'Додати нову адресу' }}
      </h2>
      <form @submit.prevent="submitAddress" class="space-y-4">
        <!-- Phone -->
        <div>
          <label class="block text-gray-700 mb-1">Телефон:</label>
          <input v-model="phoneNumber" @input="formatPhoneNumber" placeholder="Введіть номер телефону (тільки цифри)"
            maxlength="10" inputmode="numeric" pattern="[0-9]*"
            class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50"
            :class="errors.phoneNumber ? 'border-red-500' : 'border-gray-300'" />




          <p v-if="errors.phoneNumber" class="text-red-500 text-sm mt-1">{{ errors.phoneNumber }}</p>
        </div>
        <!-- Delivery Type (Multiselect) -->
        <div>
          <label class="block text-gray-700 mb-1">Тип доставки:</label>
          <Multiselect v-model="formData.deliveryType" :options="deliveryOptions"
            :custom-label="opt => `${opt.label} — ${opt.name}`" :track-by="'id'" placeholder="Оберіть тип доставки"
            @input="updateDeliveryOptions" />





          <p v-if="errors.deliveryType" class="text-red-500 text-sm mt-1">{{ errors.deliveryType }}</p>
        </div>


        <!-- Courier Fields -->
        <template v-if="formData.deliveryType?.value === 'courier'">
          <div>
            <label class="block text-gray-700 mb-1">Спосіб доставки:</label>
            <input type="text" readonly value="Кур'єр Нової Пошти"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
          </div>

          <div ref="cityWrapper" class="relative w-full">

            <Combobox v-model="selectedCity" as="div" class="relative">
              <div class="relative">
                <label class="block text-gray-700 mb-1">Місто:</label>

                <ComboboxInput
                
  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50"

                   @input="event => onCitySearch(event.target.value)" :displayValue="city => city?.city || city"
                  placeholder="Введіть місто" />
                <ComboboxOptions v-if="cities.length"
                  class="absolute z-50 w-full mt-1 max-h-48 overflow-auto rounded bg-white border shadow-lg">
                  <ComboboxOption v-for="city in cities" :key="city.Ref" :value="city"
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    {{ city.city }}
                  </ComboboxOption>
                </ComboboxOptions>
              </div>
            </Combobox>
          </div>
          <div>
            <label class="block text-gray-700 mb-1">Вулиця:</label>
            <div class="relative">
             <Combobox v-model="selectedStreet"
  @update:modelValue="selectStreet"
 as="div" class="relative">
  <ComboboxInput
    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50"
    @input="handleStreetSearch"
    :displayValue="s => s?.street || s"
    placeholder="Введіть назву вулиці"
  />
  <ComboboxOptions v-if="streets.length" class="absolute z-50 w-full mt-1 max-h-48 overflow-auto rounded bg-white border shadow-lg">
    <ComboboxOption
      v-for="street in streets"
      :key="street.Ref || street.Name"
      :value="street"
      class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
    >
      {{ street.street || street.Name }}
    </ComboboxOption>
  </ComboboxOptions>
</Combobox>

            </div>
          </div>
          <div>
            <label class="block text-gray-700 mb-1">Будинок/Квартира:</label>
            <input v-model="deliveryAddress.number" required placeholder="Введіть номер будинку або квартири"
              :class="['w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50', errors.number ? 'border-red-500' : 'border-gray-300']" />

            <p v-if="errors.number" class="text-red-500 text-sm mt-1">{{ errors.number }}</p>
          </div>
        </template>

        <template v-if="formData.deliveryType?.value === 'pickup'">
  <!-- Самовивіз з наших магазинів -->
  <template v-if="isStorePickup">
    <p class="text-gray-700"><strong>Місто:</strong> Коломия</p>
    <p class="text-gray-700"><strong>Адреса:</strong> вул. Степана Бандери 22, Коломия</p>
  </template>

          <!-- Самовивіз з поштоматів -->
  <template v-else-if="isPostomatPickup">
    <div>
      <label class="block text-gray-700 mb-1">Місто:</label>
      <Combobox v-model="selectedCity" as="div" class="relative">
        <div class="relative">
          <ComboboxInput
                
  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50"

                   @input="event => onCitySearch(event.target.value)" :displayValue="city => city?.city || city"
                  placeholder="Введіть місто" />
          <ComboboxOptions v-if="cities.length"
            class="absolute z-50 w-full mt-1 max-h-48 overflow-auto rounded bg-white border shadow-lg">
            <ComboboxOption v-for="city in cities" :key="city.Ref" :value="city"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              {{ city.city }}
            </ComboboxOption>
          </ComboboxOptions>
        </div>
      </Combobox>
      <p v-if="errors.city" class="text-red-500 text-sm mt-1">{{ errors.city }}</p>
    </div>

    <div>
      <label class="block text-gray-700 mb-1">Поштомат:</label>
      <Multiselect v-model="deliveryAddress.postomat" :options="warehouses.map(w => w.name)"
        placeholder="Оберіть поштомат" :searchable="true" :allow-empty="false"
        class="w-full mt-2"
        :class="{ 'border border-red-500 rounded-md': errors.postomat }" />
      <p v-if="errors.postomat" class="text-red-500 text-sm mt-1">{{ errors.postomat }}</p>
    </div>
  </template>

  <!-- Самовивіз з НП або Укрпошти -->
  <template v-else-if="isNovaPoshtaPickup || isUkrposhtaPickup">
    <div>
      <label class="block text-gray-700 mb-1">Місто:</label>
      <Combobox v-model="selectedCity" as="div" class="relative">
        <div class="relative">
          <ComboboxInput
                
  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50"

                   @input="event => onCitySearch(event.target.value)" :displayValue="city => city?.city || city"
                  placeholder="Введіть місто" />
          <ComboboxOptions v-if="cities.length"
            class="absolute z-50 w-full mt-1 max-h-48 overflow-auto rounded bg-white border shadow-lg">
            <ComboboxOption v-for="city in cities" :key="city.Ref" :value="city"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer">
              {{ city.city }}
            </ComboboxOption>
          </ComboboxOptions>
        </div>
      </Combobox>
      <p v-if="errors.city" class="text-red-500 text-sm mt-1">{{ errors.city }}</p>
    </div>

    <div>
      <label class="block text-gray-700 mb-1">Відділення:</label>
      <Multiselect :key="formData.deliveryType?.name" v-model="deliveryAddress.branch" :options="warehouses.map(w => w.name)"
        placeholder="Оберіть відділення" :searchable="true" :allow-empty="false"
        class="w-full mt-2"
        :class="{ 'border border-red-500 rounded-md': errors.branch }" />
      <p v-if="errors.branch" class="text-red-500 text-sm mt-1">{{ errors.branch }}</p>
    </div>
  </template>
</template>


        <div class="flex flex-wrap gap-4 mt-4">
          <button type="submit" class="px-5 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded-lg transition">
            Зберегти
          </button>
          <button type="button" @click="cancelEdit"
            class="px-5 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition">
            Скасувати
          </button>
        </div>
      </form>
    </div>

    <!-- Saved Address Card -->
    <div v-else-if="addressAvailable && !loading && !showForm" class="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 class="text-2xl font-semibold text-gray-800">Ваша адреса доставки</h2>
      <p class="text-gray-700"><strong>Телефон:</strong> {{ phoneNumber }}</p>
      <p class="text-gray-700"><strong>Тип доставки:</strong> {{ formData.deliveryName }}</p>

      <template v-if="formData.deliveryType?.value === 'courier'">
        <p class="text-gray-700 whitespace-nowrap"><strong>Місто:</strong> {{ formData.city }}</p>
        <p class="text-gray-700"><strong>Адреса:</strong> {{ deliveryAddress.street }} {{ deliveryAddress.number }}</p>
      </template>

      <!-- Якщо самовивіз з наших магазинів -->
<template v-if="formData.deliveryType?.name === 'Самовивіз з наших магазинів'">
  <p class="text-gray-700">
    <strong>Адреса:</strong> вул. Степана Бандери 22, Коломия
  </p>
</template>

<!-- Інакше (всі інші варіанти pickup) -->
<template v-else>
  <p class="text-gray-700">
    <strong>Місто:</strong> {{ formData.city }}<br />
    <strong>Відділення/Поштомат:</strong> {{ deliveryAddress.branch || deliveryAddress.postomat }}
  </p>
</template>


      <div class="flex gap-4 mt-4">
        <button @click="editAddress"
          class="px-5 py-2 border-2 border-[#6B1F1F] text-[#6B1F1F] rounded-lg hover:bg-[#6B1F1F] hover:text-white transition">
          Оновити
        </button>
        <button @click="deleteAddress"
          class="px-5 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition">
          Видалити
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

  // Скидаємо всі змінні
  this.formData.selectedDeliveryMethod = this.formData.deliveryType;
  this.formData.cityRef = '';
  this.formData.streetSearch = '';
  this.selectedCity = null;
  this.selectedStreet = null;

  // 🧹 Очищення адрес
  this.deliveryAddress = {
    street: '',
    number: '',
    branch: '',
    postomat: '',
    warehouse: ''
  };

  // 🧹 Очищення списків
  this.streets = [];
  this.cities = [];
  this.warehouses = [];

  // Якщо тип доставки — з магазину
  if (value === 'pickup' && name.includes('самовивіз з наших магазинів')) {
    this.formData.city = "Коломия";
    return;
  }

  // Якщо вже обране місто — одразу підтягуємо відділення/поштомати
  if (this.formData.city && this.formData.cityRef) {
    this.fetchWarehouses();
  }

  // Якщо ще нема міста — пропонуємо його знайти
  if (!this.formData.city && value === 'pickup') {
    this.fetchCities();
  }

  // Якщо курʼєр — підтягуємо вулиці
  if (value === 'courier') {
    this.fetchStreets();
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
        console.log("Отримана адреса:", response.data);

        // Ось тут зміни
        if (response.data && response.data.data) {
          const address = response.data.data;
          // Підставляємо ключі з address
          this.phoneNumber = address.phone_number || "";
          this.formData.city = address.city || "";
          this.selectedCity = {
            city: address.city,
            Ref: address.city_ref
          };

          const foundType = this.deliveryOptions.find(opt => opt.value === address.delivery_type);
          this.formData.deliveryType = foundType ? foundType : null;
          this.formData.selectedDeliveryMethod = foundType ? foundType : null;


          this.formData.deliveryName = address.delivery_name || "";
          this.addressId = address.id;

          // Логіка розділення адреси на "street" і "number", якщо потрібно
          if (address.delivery_type === "courier") {
            const parts = address.delivery_address.split(" ");
            this.deliveryAddress.street = parts[0];
            this.deliveryAddress.number = parts.slice(1).join(" ");
          } else if (address.delivery_type === "pickup") {
            this.deliveryAddress.branch = address.delivery_address;
          }

          if (address.delivery_type === "courier") {
  const parts = address.delivery_address.split(" ");
  this.deliveryAddress.street = parts[0];
  this.deliveryAddress.number = parts.slice(1).join(" ");
  this.deliveryAddress.branch = "";
  this.deliveryAddress.postomat = "";
} else if (address.delivery_type === "pickup") {
  this.deliveryAddress.branch = address.delivery_address;
  this.deliveryAddress.street = "";
  this.deliveryAddress.number = "";
  this.deliveryAddress.postomat = address.delivery_address.toLowerCase().includes("поштомат")
    ? address.delivery_address
    : "";
}


          // Якщо дані були знайдені, встановлюємо addressAvailable = true
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
              label: label,             // "Кур'єр" або "Самовивіз"
              value: typeKey,           // 'courier' або 'pickup'
              name: option.name,        // повна назва ("Кур'єр Укрпошти")
              id: option.id             // для збереження
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
      if (!this.validateForm()) return;
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }

      // Формуємо дані для збереження адреси
      let deliveryAddressValue = "";
      if (this.formData.deliveryType?.value === "courier") {
        deliveryAddressValue = `${this.deliveryAddress.street} ${this.deliveryAddress.number}`;
      } else if (this.formData.deliveryType?.value === "pickup") {
        if (!this.formData.selectedDeliveryMethod) {
  this.formData.selectedDeliveryMethod = this.formData.deliveryType;
}console.log('selectedDeliveryMethod:', this.formData.selectedDeliveryMethod);
console.log('branch:', this.deliveryAddress.branch);
console.log('postomat:', this.deliveryAddress.postomat);


        if (this.formData.selectedDeliveryMethod?.is_store) {
  deliveryAddressValue = "вул. Степана Бандери 22, Коломия";
} else if (this.formData.selectedDeliveryMethod?.name === "Самовивіз з Нової Пошти") {
  deliveryAddressValue = this.deliveryAddress.branch;
} else if (this.formData.selectedDeliveryMethod?.name === "Самовивіз з поштоматів Нової Пошти") {
  deliveryAddressValue = this.deliveryAddress.postomat;
}

      }

      let deliveryName = "";
      if (this.formData.deliveryType?.value === "courier") {
        deliveryName = "Кур'єр Нової Пошти";
      } else if (this.formData.deliveryType?.value === "pickup") {
        deliveryName = this.formData.deliveryType.name;
      }
      if (!this.formData.deliveryType) {
        this.errors.deliveryType = "Оберіть тип доставки";
        return;
      }

const postData = {
  phone_number: this.phoneNumber?.trim(),
  city: this.formData.city?.trim(),
  city_ref: this.formData.cityRef,
  delivery_type: this.formData.deliveryType?.value,
  delivery_name: deliveryName?.trim(),
  delivery_address: deliveryAddressValue?.trim()
};

      console.log("Отправляемые данные:", postData);


      try {
        let response;
        if (this.addressAvailable) {
          // Якщо адреса вже існує, викликаємо метод оновлення (наприклад, PUT або PATCH)
          response = await axios.patch(
            `https://koshtovnya.api-dev.bmax-edu.website/api/user-address/${this.addressId}`,
            postData,
            { headers: { Authorization: `Bearer ${token}` } }
          );

        } else {
          console.log("deliveryName:", deliveryName);
console.log("deliveryAddressValue:", deliveryAddressValue);

          // Якщо адреса відсутня – викликаємо створення нової адреси
          response = await axios.post(
            "https://koshtovnya.api-dev.bmax-edu.website/api/user-address",
            postData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        console.log("Response data:", response.data);
        console.log("Адресу успішно збережено!");
        this.fetchUserAddress();
        this.showForm = false;
      } catch (error) {
        console.error("Помилка збереження адреси:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
        }
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
    if (this.formData.deliveryType?.name?.includes('поштомат') && !this.deliveryAddress.postomat) {
      errors.postomat = "Оберіть поштомат";
    }
    if (!this.formData.deliveryType?.name?.includes('поштомат') && !this.deliveryAddress.branch) {
      errors.branch = "Оберіть відділення";
    }

    // Якщо обраний спосіб доставки не з магазину – перевіряємо відділення або поштомат
    if (this.formData.selectedDeliveryMethod) {
      if (this.formData.deliveryType?.name?.includes('поштомат') && !this.deliveryAddress.postomat) {
        errors.postomat = "Введіть номер поштомата";
      }
      if (!this.formData.deliveryType?.name?.includes('поштомат') && !this.deliveryAddress.branch) {
        errors.branch = "Введіть номер відділення";
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
        alert(error.response?.data?.message || "Не вдалося видалити адресу");
      }
    },
    editAddress() {
      this.showForm = true;
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
