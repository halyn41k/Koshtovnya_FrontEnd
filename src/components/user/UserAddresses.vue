<template>
  <div class="max-w-3xl p-4 sm:p-6 overflow-y-auto h-[90vh] font-sans">
    <!-- Loader -->
    <Loader v-if="loading" class="mx-auto my-16" />

    <!-- No Address Block -->
    <div v-if="!addressAvailable && !loading && !showForm" class="text-center mb-6">
      <p class="text-gray-500 text-lg mb-4">
        Немає адреси доставки. Додайте або створіть нову адресу!
      </p>
      <button
        class="inline-flex items-center mx-auto px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded-lg transition"
        @click="openForm"
      >
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
          <input
            type="tel"
            v-model="phoneNumber"
            placeholder="+380XXXXXXXXX"
            required
            :class="['w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50', errors.phoneNumber ? 'border-red-500' : 'border-gray-300']"
          />
          <p v-if="errors.phoneNumber" class="text-red-500 text-sm mt-1">{{ errors.phoneNumber }}</p>
        </div>

        <!-- Delivery Type -->
        <div>
          <label class="block text-gray-700 mb-1">Тип доставки:</label>
          <select
            v-model="formData.deliveryType"
            @change="updateDeliveryOptions"
            required
            :class="['w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50', errors.deliveryType ? 'border-red-500' : 'border-gray-300']"
          >
            <option disabled value="">Оберіть тип доставки</option>
            <option value="courier">Кур'єр</option>
            <option value="pickup">Самовивіз</option>
          </select>
          <p v-if="errors.deliveryType" class="text-red-500 text-sm mt-1">{{ errors.deliveryType }}</p>
        </div>

        <!-- Courier Fields -->
        <template v-if="formData.deliveryType === 'courier'">
          <div>
            <label class="block text-gray-700 mb-1">Спосіб доставки:</label>
            <input
              type="text"
              readonly
              value="Кур'єр Нової Пошти"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label class="block text-gray-700 mb-1">Місто:</label>
            <div class="relative">
              <input
                v-model="formData.city"
                @input="onCityInput"
                @focus="showCityDropdown = true"
                placeholder="Введіть назву міста"
                required
                :class="['w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50', errors.city ? 'border-red-500' : 'border-gray-300']"
              />
              <ul v-if="showCityDropdown && cities.length" class="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                <li
                  v-for="city in cities"
                  :key="city.Ref"
                  @mousedown.prevent="selectCity(city)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {{ city.city }}
                </li>
              </ul>
            </div>
            <p v-if="errors.city" class="text-red-500 text-sm mt-1">{{ errors.city }}</p>
          </div>

          <div>
            <label class="block text-gray-700 mb-1">Вулиця:</label>
            <div class="relative">
              <input
                v-model="formData.streetSearch"
                @input="handleStreetSearch"
                placeholder="Введіть назву вулиці"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50"
              />
              <ul v-if="streets.length" class="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                <li
                  v-for="(street, i) in streets"
                  :key="i"
                  @click="selectStreet(street)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {{ street.street || street.Name }}
                </li>
              </ul>
            </div>
            <p v-if="errors.street" class="text-red-500 text-sm mt-1">{{ errors.street }}</p>
          </div>

          <div>
            <label class="block text-gray-700 mb-1">Будинок/Квартира:</label>
            <input
              v-model="deliveryAddress.number"
              required
              :class="['w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50', errors.number ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.number" class="text-red-500 text-sm mt-1">{{ errors.number }}</p>
          </div>
        </template>

        <!-- Pickup Fields -->
        <template v-if="formData.deliveryType === 'pickup'">
          <div>
            <label class="block text-gray-700 mb-1">Спосіб доставки:</label>
            <select
              v-model="formData.selectedDeliveryMethod"
              @change="onDeliveryMethodChange"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50"
            >
              <option disabled value="">Оберіть спосіб доставки</option>
              <option v-for="opt in pickupOptions" :key="opt.id" :value="opt">{{ opt.name }}</option>
            </select>
            <p v-if="errors.selectedDeliveryMethod" class="text-red-500 text-sm mt-1">{{ errors.selectedDeliveryMethod }}</p>
          </div>

          <!-- Store Pickup -->
          <template v-if="formData.selectedDeliveryMethod?.is_store">
            <p class="text-gray-700"><strong>Місто:</strong> Коломия</p>
            <p class="text-gray-700"><strong>Адреса:</strong> вул. Степана Бандери 22, Коломия</p>
          </template>

          <!-- NovaPoshta Pickup -->
          <template v-else-if="formData.selectedDeliveryMethod">
            <div>
              <label class="block text-gray-700 mb-1">Місто:</label>
              <div class="relative">
                <input
                  v-model="formData.city"
                  @input="handleCityInput"
                  @focus="showCityDropdown = true"
                  placeholder="Введіть місто"
                  required
                  class="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-opacity-50"
                />
                <ul v-if="showCityDropdown && cities.length" class="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                  <li
                    v-for="city in cities"
                    :key="city.Ref"
                    @mousedown.prevent="selectCity(city)"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {{ city.city }}
                  </li>
                </ul>
              </div>
              <p v-if="errors.city" class="text-red-500 text-sm mt-1">{{ errors.city }}</p>
            </div>

            <div>
              <label class="block text-gray-700 mb-1">
                {{ formData.selectedDeliveryMethod?.name.includes('поштомат') ? 'Поштомат:' : 'Відділення:' }}
              </label>
              <select
                v-if="!formData.selectedDeliveryMethod?.name.includes('поштомат')"
                v-model="deliveryAddress.branch"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50"
              >
                <option disabled value="">Оберіть відділення</option>
                <option v-for="wh in warehouses" :key="wh.id" :value="wh.name">{{ wh.name }}</option>
              </select>
              <select
                v-else
                v-model="deliveryAddress.postomat"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50 mt-2"
              >
                <option disabled value="">Оберіть поштомат</option>
                <option v-for="wh in warehouses" :key="wh.id" :value="wh.name">{{ wh.name }}</option>
              </select>
              <p v-if="!formData.selectedDeliveryMethod?.name.includes('поштомат') && errors.branch" class="text-red-500 text-sm mt-1">{{ errors.branch }}</p>
              <p v-if="formData.selectedDeliveryMethod?.name.includes('поштомат') && errors.postomat" class="text-red-500 text-sm mt-1">{{ errors.postomat }}</p>
            </div>
          </template>
        </template>

        <!-- Form Actions -->
        <div class="flex flex-wrap gap-4 mt-4">
          <button
            type="submit"
            class="px-5 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded-lg transition"
          >
            Зберегти
          </button>
          <button
            type="button"
            @click="cancelEdit"
            class="px-5 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            Скасувати
          </button>
        </div>
      </form>
    </div>

    <!-- Saved Address Card -->
    <div
      v-else-if="addressAvailable && !loading && !showForm"
      class="bg-white rounded-2xl shadow-lg p-6 space-y-4"
    >
      <h2 class="text-2xl font-semibold text-gray-800">Ваша адреса доставки</h2>
      <p class="text-gray-700"><strong>Телефон:</strong> {{ phoneNumber }}</p>
      <p class="text-gray-700"><strong>Тип доставки:</strong> {{ formData.deliveryName }}</p>

      <template v-if="formData.deliveryType === 'courier'">
        <p class="text-gray-700 whitespace-nowrap"><strong>Місто:</strong> {{ formData.city }}</p>
        <p class="text-gray-700"><strong>Адреса:</strong> {{ deliveryAddress.street }} {{ deliveryAddress.number }}</p>
      </template>
      <template v-else>
        <p v-if="formData.selectedDeliveryMethod?.is_store" class="text-gray-700">
          <strong>Адреса:</strong> вул. Степана Бандери 22, Коломия
        </p>
        <p v-else class="text-gray-700">
          <strong>Місто:</strong> {{ formData.city }}<br />
          <strong>Відділення/Поштомат:</strong> {{ deliveryAddress.branch || deliveryAddress.postomat }}
        </p>
      </template>

      <div class="flex gap-4 mt-4">
        <button
          @click="editAddress"
          class="px-5 py-2 border-2 border-[#6B1F1F] text-[#6B1F1F] rounded-lg hover:bg-[#6B1F1F] hover:text-white transition"
        >
          Оновити
        </button>
        <button
          @click="deleteAddress"
          class="px-5 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
        >
          Видалити
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from '../home/Loader.vue';
import axios from "axios";

export default {
  name: "UserAddresses",
  components: { Loader },
  data() {
    return {
      addressAvailable: false,
      showForm: false,
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
      deliveryOptions: {}
    };
  },
  computed: {
    pickupOptions() {
      return [
        { id: 1, name: "Самовивіз з нашого магазину", is_store: true },
        { id: 2, name: "Самовивіз з Нової Пошти" },
        { id: 3, name: "Самовивіз з поштоматів Нової Пошти" }
      ];
    }
  },
  created() {
    this.fetchUserAddress();
    this.fetchDeliveryTypes();
    if (!this.addressAvailable) {
      this.fetchUserPhoneNumber();
    }
    // Прив'язуємо fetchCities до контексту компонента з дебаунсом
    this.debouncedFetchCities = this.debounce(this.fetchCities.bind(this), 300);
  },
  methods: {
    debounce(func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },
    updateDeliveryOptions() {
      this.formData.selectedDeliveryMethod = null;
      this.deliveryAddress = { street: "", number: "", branch: "", postomat: "", warehouse: "" };
      if (this.formData.deliveryType === "courier") {
        this.fetchStreets();
      }
      if (this.formData.deliveryType === "pickup") {
        this.formData.city = "";
        this.formData.cityRef = "";
        this.warehouses = [];
      }
    },
    onDeliveryMethodChange() {
      if (
        this.formData.deliveryType === "pickup" &&
        this.formData.selectedDeliveryMethod &&
        this.formData.selectedDeliveryMethod.is_store
      ) {
        this.formData.city = "Коломия";
        this.deliveryAddress.branch = "";
        this.deliveryAddress.postomat = "";
      } else {
        this.formData.city = "";
        this.formData.cityRef = "";
      }
    },
    onCityInput() {
      if (this.formData.city.trim().length < 2) {
        this.cities = [];
        this.showCityDropdown = false;
        return;
      }
      if (this.formData.deliveryType === "courier" || this.formData.deliveryType === "pickup") {
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
      if (this.formData.deliveryType === "courier") {
        deliveryTypeParam = "Кур'єр Нової Пошти";
      } else if (this.formData.deliveryType === "pickup") {
        if (this.formData.selectedDeliveryMethod && this.formData.selectedDeliveryMethod.name) {
          deliveryTypeParam = this.formData.selectedDeliveryMethod.name;
        } else {
          deliveryTypeParam = "Самовивіз з Нової Пошти";
        }
      }
      
      console.log("Fetching cities with:", {
        city: this.formData.city,
        delivery_type: deliveryTypeParam,
      });
  
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
        console.log("Cities API Response:", response.data);
  
        if (response.data.success && Array.isArray(response.data.data)) {
          this.cities = response.data.data;
        } else {
          console.error("Incorrect response format:", response.data);
          this.cities = [];
        }
      } catch (error) {
        console.error("Error fetching cities:", error.response?.data || error.message);
      }
    },
    hideCityDropdown() {
      setTimeout(() => {
        this.showCityDropdown = false;
      }, 300);
    },
    selectCity(city) {
      this.formData.city = city.city;
      this.formData.cityRef = city.Ref;
      this.showCityDropdown = false;
      this.fetchWarehouses();
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
            delivery_type: this.formData.deliveryType
          }
        });
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          this.warehouses = response.data.data.map((item, index) => ({
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
    handleStreetSearch() {
      if (this.formData.streetSearch.trim().length < 2) {
        this.streets = [];
        return;
      }
      this.fetchStreets();
    },
    selectStreet(street) {
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
      this.formData.deliveryType = address.delivery_type || "";
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
        this.deliveryOptions = response.data.data;
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
  if (this.formData.deliveryType === "courier") {
    deliveryAddressValue = `${this.deliveryAddress.street} ${this.deliveryAddress.number}`;
  } else if (this.formData.deliveryType === "pickup") {
    if (this.formData.selectedDeliveryMethod.is_store) {
      deliveryAddressValue = "вул. Степана Бандери 22, Коломия";
    } else if (this.formData.selectedDeliveryMethod.name === "Самовивіз з Нової Пошти") {
      deliveryAddressValue = this.deliveryAddress.branch;
    } else if (this.formData.selectedDeliveryMethod.name === "Самовивіз з поштоматів Нової Пошти") {
      deliveryAddressValue = this.deliveryAddress.postomat;
    }
  }
  
  let deliveryName = "";
  if (this.formData.deliveryType === "courier") {
    deliveryName = "Кур'єр Нової Пошти";
  } else if (this.formData.deliveryType === "pickup") {
    deliveryName = this.formData.selectedDeliveryMethod.name;
  }
  
 const postData = {
  phone_number:     this.phoneNumber,
  city:             this.formData.city,
  city_ref:         this.formData.cityRef,
  delivery_type:    this.formData.selectedDeliveryMethod.delivery_type, // "pickup" або "courier"
  delivery_name:    this.formData.selectedDeliveryMethod.name,          // точно з бекенду
  delivery_address: deliveryAddressValue
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
      this.formData.deliveryType = "";
      this.formData.selectedDeliveryMethod = null;
      this.formData.streetSearch = "";
      this.deliveryAddress = { street: "", number: "", branch: "", postomat: "", warehouse: "" };
      this.addressId = null;
    },
    validateForm() {
  const errors = {};
  const ukrPhoneRegex = /^\+380\d{9}$/;

  // Валідація номера телефону
  if (!this.phoneNumber) {
    errors.phoneNumber = "Номер телефону є обов'язковим";
  } else if (!ukrPhoneRegex.test(this.phoneNumber)) {
    errors.phoneNumber = "Невірний формат номера телефону. Приклад: +380XXXXXXXXX";
  }

  if (this.formData.deliveryType === "courier") {
    // Валідація для доставки кур'єром
    if (!this.formData.city) {
      errors.city = "Місто є обов'язковим";
    }
    if (!this.deliveryAddress.street) {
      errors.street = "Оберіть вулицю";
    }
    if (!this.deliveryAddress.number) {
      errors.number = "Введіть номер будинку/квартири";
    }
  }

  if (this.formData.deliveryType === "pickup") {
    // Валідація для самовивозу
    if (!this.formData.selectedDeliveryMethod) {
      errors.selectedDeliveryMethod = "Оберіть спосіб доставки";
    }
    // Перевірка міста незалежно від вибору способу доставки
    if (!this.formData.city) {
      errors.city = "Місто є обов'язковим";
    }
    // Якщо обраний спосіб доставки не з магазину – перевіряємо відділення або поштомат
    if (this.formData.selectedDeliveryMethod) {
      if (this.formData.selectedDeliveryMethod.name === "Самовивіз з Нової Пошти" && !this.deliveryAddress.branch) {
        errors.branch = "Введіть номер відділення";
      }
      if (this.formData.selectedDeliveryMethod.name === "Самовивіз з поштоматів Нової Пошти" && !this.deliveryAddress.postomat) {
        errors.postomat = "Введіть номер поштомата";
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
  }
};
</script>
