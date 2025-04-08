<template>
  <div class="address-container">
    <Loader v-if="loading" />

    <!-- Блок відсутності адреси -->
    <div v-if="!addressAvailable && !loading && !showForm" class="no-address">
      <p class="no-address-text">
        Немає адреси доставки. Додайте або створіть нову адресу!
      </p>
      <button class="add-address-button" @click="openForm">
        <span class="plus-icon">+</span> Створити нову адресу
      </button>
    </div>

    <!-- Форма для додавання/оновлення адреси -->
    <div v-if="showForm" class="address-form">
      <h2>{{ addressAvailable ? "Оновити адресу" : "Додати нову адресу" }}</h2>
      <form @submit.prevent="submitAddress">
        <!-- Телефон -->
        <label>
          <span>Телефон:</span>
          <input
            type="tel"
            v-model="phoneNumber"
            :class="{ 'input-error': errors.phoneNumber }"
            placeholder="+380XXXXXXXXX"
            required
          />
          <span v-if="errors.phoneNumber" class="error-message">{{ errors.phoneNumber }}</span>
        </label>

        <!-- Тип доставки -->
        <label>
          <span>Тип доставки:</span>
          <select
            v-model="formData.deliveryType"
            @change="updateDeliveryOptions"
            :class="{ 'input-error': errors.deliveryType }"
            required
          >
            <option disabled value="">Оберіть тип доставки</option>
            <option value="courier">Кур'єр</option>
            <option value="pickup">Самовивіз</option>
          </select>
          <span v-if="errors.deliveryType" class="error-message">{{ errors.deliveryType }}</span>
        </label>

        <!-- Для кур'єра -->
        <template v-if="formData.deliveryType === 'courier'">
          <label>
            <span>Спосіб доставки:</span>
            <input type="text" value="Кур'єр Нової Пошти" readonly />
          </label>
          <label>
            <span>Місто:</span>
            <div class="city-dropdown-wrapper" style="position: relative;">
              <input
                type="text"
                v-model="formData.city"
                @input="onCityInput"
                @focus="showCityDropdown = true"
                placeholder="Введіть назву міста"
                :class="{ 'input-error': errors.city }"
                required
              />
              <ul v-if="showCityDropdown && cities.length" class="city-dropdown">
                <li
                  v-for="city in cities"
                  :key="city.Ref"
                  @mousedown.prevent="selectCity(city)"
                >
                  {{ city.city }}
                </li>
              </ul>
            </div>
            <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
          </label>
          <label>
            <span>Вулиця:</span>
            <input
              class="input-field"
              v-model="formData.streetSearch"
              placeholder="Введіть назву вулиці"
              @input="handleStreetSearch"
            />
            <!-- Street Suggestions -->
            <div v-if="streets.length > 0" class="street-suggestions">
              <ul>
                <li v-for="(street, index) in streets" :key="index" @click="selectStreet(street)">
                  {{ street.street || street.Name }}
                </li>
              </ul>
            </div>
            <div v-else-if="formData.streetSearch">
              <p>Немає вулиць для цього запиту.</p>
            </div>
            <span v-if="errors.street" class="error-message">{{ errors.street }}</span>
          </label>
          <label>
            <span>Будинок/Квартира:</span>
            <input
              type="text"
              v-model="deliveryAddress.number"
              :class="{ 'input-error': errors.number }"
              required
            />
            <span v-if="errors.number" class="error-message">{{ errors.number }}</span>
          </label>
        </template>

        <!-- Для самовивозу -->
        <template v-if="formData.deliveryType === 'pickup'">
          <label>
            <span>Спосіб доставки:</span>
            <select
              v-model="formData.selectedDeliveryMethod"
              @change="onDeliveryMethodChange"
              required
            >
              <option disabled value="">Оберіть спосіб доставки</option>
              <option
                v-for="option in pickupOptions"
                :key="option.id"
                :value="option"
              >
                {{ option.name }}
              </option>
            </select>
            <span v-if="errors.selectedDeliveryMethod" class="error-message">{{ errors.selectedDeliveryMethod }}</span>
          </label>

          <!-- Якщо вибрано "Самовивіз з нашого магазину" -->
          <template v-if="formData.selectedDeliveryMethod && formData.selectedDeliveryMethod.is_store">
            <p><strong>Місто:</strong> Коломия</p>
            <p><strong>Адреса:</strong> вул. Степана Бандери 22, Коломия</p>
          </template>

          <!-- Якщо вибрано "Самовивіз з Нової Пошти" -->
          <template v-else-if="formData.selectedDeliveryMethod && formData.selectedDeliveryMethod.name === 'Самовивіз з Нової Пошти'">
            <label>
              <span>Місто:</span>
              <div class="city-dropdown-wrapper" style="position: relative;">
                <input
                  class="input-field"
                  v-model="formData.city"
                  placeholder="Введіть місто"
                  @input="handleCityInput"
                  @focus="showCityDropdown = true"
                  required
                />
                <ul v-if="showCityDropdown && cities.length" class="city-dropdown">
                  <li
                    v-for="city in cities"
                    :key="city.Ref"
                    @mousedown.prevent="selectCity(city)"
                  >
                    {{ city.city }}
                  </li>
                </ul>
              </div>
              <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
            </label>
            <label>
              <span>Відділення:</span>
              <select v-model="deliveryAddress.branch" :class="{ 'input-error': errors.branch }" required>
                <option disabled value="">Оберіть відділення</option>
                <option
                  v-for="warehouse in warehouses"
                  :key="warehouse.id"
                  :value="warehouse.name"
                >
                  {{ warehouse.name }}
                </option>
              </select>
              <span v-if="errors.branch" class="error-message">{{ errors.branch }}</span>
            </label>
          </template>

          <!-- Якщо вибрано "Самовивіз з поштоматів Нової Пошти" -->
          <template v-else-if="formData.selectedDeliveryMethod && formData.selectedDeliveryMethod.name === 'Самовивіз з поштоматів Нової Пошти'">
            <label>
              <span>Місто:</span>
              <div class="city-dropdown-wrapper" style="position: relative;">
                <input
                  class="input-field"
                  v-model="formData.city"
                  placeholder="Введіть місто"
                  @input="handleCityInput"
                  @focus="showCityDropdown = true"
                  required
                />
                <ul v-if="showCityDropdown && cities.length" class="city-dropdown">
                  <li
                    v-for="city in cities"
                    :key="city.Ref"
                    @mousedown.prevent="selectCity(city)"
                  >
                    {{ city.city }}
                  </li>
                </ul>
              </div>
              <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
            </label>
            <label>
              <span>Поштомат:</span>
              <select v-model="deliveryAddress.postomat" :class="{ 'input-error': errors.postomat }" required>
                <option disabled value="">Оберіть поштомат</option>
                <option
                  v-for="warehouse in warehouses"
                  :key="warehouse.id"
                  :value="warehouse.name"
                >
                  {{ warehouse.name }}
                </option>
              </select>
              <span v-if="errors.postomat" class="error-message">{{ errors.postomat }}</span>
            </label>
          </template>
        </template>

        <div class="form-actions">
          <button type="submit" class="save-button">Зберегти</button>
          <button type="button" class="cancel-button" @click="cancelEdit">Скасувати</button>
        </div>
      </form>
    </div>

    <!-- Відображення збереженої адреси -->
    <div v-else-if="addressAvailable && !loading && !showForm" class="address-card">
      <h2 class="card-title">Ваша адреса доставки</h2>
      <p><strong>Телефон:</strong> {{ phoneNumber }}</p>


      <p><strong>Тип доставки:</strong> {{ formData.deliveryName }}</p>
      <template v-if="formData.deliveryType === 'courier'">
        <p><strong>Місто:</strong> {{ formData.city }}</p>
        <p><strong>Адреса:</strong> {{ deliveryAddress.street }} {{ deliveryAddress.number }}</p>
      </template>
      <template v-else-if="formData.deliveryType === 'pickup'">
        <p v-if="formData.selectedDeliveryMethod && formData.selectedDeliveryMethod.is_store">
          <strong>Адреса:</strong> вул. Степана Бандери 22, Коломия
        </p>
        <p v-else>
          <strong>Місто:</strong> {{ formData.city }}<br />
          <strong>Відділення/Поштомат:</strong> {{ deliveryAddress.branch || deliveryAddress.postomat }}
        </p>
      </template>
      <div class="button-group">
        <button class="update-button" @click="editAddress">Оновити</button>
        <button class="delete-button" @click="deleteAddress">Видалити</button>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from '../Home/Loader.vue';
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
          "http://26.235.139.202:8080/api/nova-poshta/cities",
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
        const response = await axios.get("http://26.235.139.202:8080/api/nova-poshta/ware-houses", {
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
        const response = await axios.get("http://26.235.139.202:8080/api/nova-poshta/streets", {
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
    const response = await axios.get("http://26.235.139.202:8080/api/user-address", {
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
        const response = await axios.get("http://26.235.139.202:8080/api/user/phone-number", {
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
        const response = await axios.get("http://26.235.139.202:8080/api/delivery-types", {
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
  
  // Дані для запиту
  const postData = {
    phone_number: this.phoneNumber,
    city: this.formData.city,
    city_ref: this.formData.cityRef,
    delivery_name: deliveryName,
    delivery_address: deliveryAddressValue
  };
  
  console.log("Submit address data:", postData);
  
  try {
    let response;
    if (this.addressAvailable) {
      // Якщо адреса вже існує, викликаємо метод оновлення (наприклад, PUT або PATCH)
      response = await axios.patch(
          `http://26.235.139.202:8080/api/user-address/${this.addressId}`,
          postData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

    } else {
      // Якщо адреса відсутня – викликаємо створення нової адреси
      response = await axios.post(
        "http://26.235.139.202:8080/api/user-address",
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
        await axios.delete(`http://26.235.139.202:8080/api/user-address/${this.addressId}`, {
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

<style scoped>
  /* Контейнер для форми та збереженої адреси */
  .address-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    margin-left: -10px;
  }

  /* Стилізація блоку, коли адреса відсутня */
  .no-address {
    margin-bottom: 20px;
    font-family: 'Merriweather', sans-serif;
    color: #555;
    font-size: 18px;
    margin-left: -10px;
  }

  .add-address-button {
    background-color: #6b1f1f;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    margin-bottom: 20px;
    font-family: 'Merriweather', sans-serif;
  }

  .plus-icon {
    font-size: 24px;
    margin-right: 8px;
  }

  /* Стилізація форми адреси */
  .address-form form {
    display: flex;
    flex-direction: column;
    gap: 15px; /* Відстань між рядками форми */
  }

  .address-form label {
    display: grid;
    grid-template-columns: 30% 70%;
    align-items: center;
  }

  .address-form input,
  .address-form select {
    width: 100%;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .save-button,
  .cancel-button {
    width: 50%;
    gap: 10px;
    background-color: #6b1f1f;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
    font-family: 'Merriweather', sans-serif;
  }

  .save-button:hover {
    background-color: #4f1414;
  }

  .cancel-button {
    background-color: #888;
  }

  /* Стилізація кнопок оновлення та видалення */
  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  .update-button,
  .delete-button {
    background: none;
    border: 2px solid #6b1f1f;
    border-radius: 8px;
    color: #6b1f1f;
    font-size: 16px;
    padding: 10px 20px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    transition: background-color 0.3s ease, color 0.3s ease;
    font-family: 'Merriweather', sans-serif;
  }

  .update-button:hover,
  .delete-button:hover {
    background-color: #6b1f1f;
    color: white;
  }

  /* Стилізація збереженої адреси */
  .address-card p {
    margin-bottom: 10px;
  }

  /* Стилізація лоадера */
  .loader {
    width: 100px;
    height: 100px;
    background-color: #6b1f1f;
    animation: spin 1s infinite linear;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Списки для випадаючих підказок (міста, вулиці) */
  .city-dropdown,
  .city-suggestions ul,
  .street-suggestions ul {
    position: absolute;
    z-index: 1000;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background-color: #fff;
    border: 1px solid #ccc;
    border-top: none;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    margin-top: -1px; /* Злиття з полем вводу */
    list-style: none;
    padding: 0;
  }

  .city-dropdown li,
  .street-suggestions li,
  .city-suggestions li {
    padding: 8px 12px;
    cursor: pointer;
  }

  .city-dropdown li:hover,
  .street-suggestions li:hover,
  .city-suggestions li:hover,
  .city-dropdown li.active {
    background-color: #f2f2f2;
  }

  /* Додаткові стилі для помилок */
  .error-message {
    color: red;
    font-size: 14px;
  }

  .input-error {
    border-color: red;
  }
</style>