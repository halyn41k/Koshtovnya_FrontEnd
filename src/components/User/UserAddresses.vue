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
            <div class="city-dropdown-wrapper">
              <input
                type="text"
                v-model="formData.city"
                @input="onCityInput"
                @focus="showCityDropdown = true"
                @blur="hideCityDropdown"
                placeholder="Введіть назву міста"
                :class="{ 'input-error': errors.city }"
                required
              />
              <ul v-if="showCityDropdown" class="city-dropdown">
                <li v-if="cityLoading" class="loading-item">Пошук...</li>
                <li v-else-if="!cityLoading && cities.length === 0">Нічого не знайдено</li>
                <li
                  v-for="city in cities"
                  :key="city.Ref"
                  @mousedown.prevent="selectCity(city)"
                >
                  {{ city.Description }}
                </li>
              </ul>
            </div>
            <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
          </label>
          <label>
            <span>Вулиця:</span>
            <select
              v-model="deliveryAddress.street"
              :class="{ 'input-error': errors.street }"
              required
            >
              <option disabled value="">Оберіть вулицю</option>
              <option v-for="street in streets" :key="street" :value="street">
                {{ street }}
              </option>
            </select>
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

          <!-- Якщо вибрано "Самовивіз з нової пошти" -->
          <template v-else-if="formData.selectedDeliveryMethod && formData.selectedDeliveryMethod.name === 'Самовивіз з нової пошти'">
            <label>
              <span>Місто:</span>
              <div class="city-dropdown-wrapper">
                <input
                  type="text"
                  v-model="formData.city"
                  @input="onCityInput"
                  @focus="showCityDropdown = true"
                  @blur="hideCityDropdown"
                  placeholder="Введіть місто"
                  :class="{ 'input-error': errors.city }"
                  required
                />
                <ul v-if="showCityDropdown" class="city-dropdown">
                  <li v-if="cityLoading" class="loading-item">Пошук...</li>
                  <li v-else-if="!cityLoading && cities.length === 0">Нічого не знайдено</li>
                  <li
                    v-for="city in cities"
                    :key="city.Ref"
                    @mousedown.prevent="selectCity(city)"
                  >
                    {{ city.Description }}
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

          <!-- Якщо вибрано "Самовивіз з поштоматів нової пошти" -->
          <template v-else-if="formData.selectedDeliveryMethod && formData.selectedDeliveryMethod.name === 'Самовивіз з поштоматів нової пошти'">
            <label>
              <span>Місто:</span>
              <div class="city-dropdown-wrapper">
                <input
                  type="text"
                  v-model="formData.city"
                  @input="onCityInput"
                  @focus="showCityDropdown = true"
                  @blur="hideCityDropdown"
                  placeholder="Введіть місто"
                  :class="{ 'input-error': errors.city }"
                  required
                />
                <ul v-if="showCityDropdown" class="city-dropdown">
                  <li v-if="cityLoading" class="loading-item">Пошук...</li>
                  <li v-else-if="!cityLoading && cities.length === 0">Нічого не знайдено</li>
                  <li
                    v-for="city in cities"
                    :key="city.Ref"
                    @mousedown.prevent="selectCity(city)"
                  >
                    {{ city.Description }}
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
import Loader from "../Loader.vue";
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
        deliveryName: ""
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
        { id: 2, name: "Самовивіз з нової пошти" },
        { id: 3, name: "Самовивіз з поштоматів нової пошти" }
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
      // Виконуємо пошук міст лише якщо введено не менше 2 символів
      if (this.formData.city.trim().length < 2) {
        this.cities = [];
        this.showCityDropdown = false;
        return;
      }
      // Для courier або pickup (не наш магазин) запускаємо пошук
      if (this.formData.deliveryType === "courier" || this.formData.deliveryType === "pickup") {
        this.debouncedFetchCities();
        this.showCityDropdown = true;
      } else {
        this.cities = [];
        this.showCityDropdown = false;
      }
    },
    async fetchCities() {
  const token = localStorage.getItem("token"); // Define token here
  console.log("Fetching cities with:", {
    city: this.formData.city,
    delivery_type: this.formData.deliveryType,
  });

  try {
    const response = await axios.get(
      "http://26.235.139.202:8080/api/nova-poshta/cities",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          city: this.formData.city,
          delivery_type: this.formData.deliveryType,
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
      }, 200);
    },
    selectCity(city) {
      this.formData.city = city.Description;
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
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://26.235.139.202:8080/api/nova-poshta/streets", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            city: this.formData.city,
            Ref: this.formData.cityRef
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
        if (response.data && response.data.data && response.data.data.address) {
          const { phone_number, city, delivery_type, delivery_name, delivery_address, id } = response.data.data.address;
          this.phoneNumber = phone_number || "";
          this.formData.city = city || "";
          this.formData.deliveryType = delivery_type || "";
          this.formData.deliveryName = delivery_name || "";
          this.addressId = id;
          if (delivery_type === "courier") {
            const parts = delivery_address.split(" ");
            this.deliveryAddress.street = parts[0];
            this.deliveryAddress.number = parts.slice(1).join(" ");
          } else if (delivery_type === "pickup") {
            this.deliveryAddress.branch = delivery_address;
          }
          this.addressAvailable = true;
        }
      } catch (error) {
        console.error("Помилка отримання адреси:", error);
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
          this.phoneNumber = response.data;
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
    async submitAddress() {
      if (!this.validateForm()) return;
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
      if (
        this.formData.deliveryType === "pickup" &&
        this.formData.selectedDeliveryMethod &&
        this.formData.selectedDeliveryMethod.is_store &&
        !this.formData.city
      ) {
        this.formData.city = "Коломия";
      }
      let deliveryAddressValue = "";
      if (this.formData.deliveryType === "courier") {
        deliveryAddressValue = `${this.deliveryAddress.street} ${this.deliveryAddress.number}`;
      } else if (this.formData.deliveryType === "pickup") {
        if (this.formData.selectedDeliveryMethod.is_store) {
          deliveryAddressValue = "вул. Степана Бандери 22, Коломия";
        } else if (this.formData.selectedDeliveryMethod.name === "Самовивіз з нової пошти") {
          deliveryAddressValue = this.deliveryAddress.branch;
        } else if (this.formData.selectedDeliveryMethod.name === "Самовивіз з поштоматів нової пошти") {
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
        phone_number: this.phoneNumber,
        city: this.formData.city,
        delivery_name: deliveryName,
        delivery_address: deliveryAddressValue
      };
      console.log("Submit address data:", postData);
      try {
        const response = await axios.post(
          "http://26.235.139.202:8080/api/user-address",
          postData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
      this.deliveryAddress = { street: "", number: "", branch: "", postomat: "", warehouse: "" };
      this.addressId = null;
    },
    validateForm() {
      const errors = {};
      const ukrPhoneRegex = /^\+380\d{9}$/;
      if (!this.phoneNumber) {
        errors.phoneNumber = "Номер телефону є обов'язковим";
      } else if (!ukrPhoneRegex.test(this.phoneNumber)) {
        errors.phoneNumber = "Невірний формат номера телефону. Приклад: +380XXXXXXXXX";
      }
      if (this.formData.deliveryType === "courier") {
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
        if (!this.formData.selectedDeliveryMethod) {
          errors.selectedDeliveryMethod = "Оберіть спосіб доставки";
        } else if (!this.formData.selectedDeliveryMethod.is_store) {
          if (!this.formData.city) {
            errors.city = "Місто є обов'язковим";
          }
          if (this.formData.selectedDeliveryMethod.name === "Самовивіз з нової пошти") {
            if (!this.deliveryAddress.branch) {
              errors.branch = "Введіть номер відділення";
            }
          } else if (this.formData.selectedDeliveryMethod.name === "Самовивіз з поштоматів нової пошти") {
            if (!this.deliveryAddress.postomat) {
              errors.postomat = "Введіть номер поштомута";
            }
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
  }
};
</script>



<style scoped>
/* Стилі для кастомного випадаючого списку міст */
.city-dropdown-wrapper {
  position: relative;
}
.city-dropdown {
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
  margin-top: -1px;
  padding: 0;
}
.city-dropdown li {
  list-style: none;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.city-dropdown li:hover,
.city-dropdown li.active {
  background-color: #f2f2f2;
}

.city-dropdown {
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
  margin-top: -1px;
  padding: 0;
}
.city-dropdown li {
  list-style: none;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.city-dropdown li:hover,
.city-dropdown li.active {
  background-color: #f2f2f2;
}

.address-container {
  padding: 20px;
}

.no-address {
  margin-bottom: 20px;
}

.add-address-button {
  background-color: #6b1f1f;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}

.address-form,
.address-card {
  margin-top: 20px;
}


.address-container {
  padding: 20px;
}

.no-address {
  margin-bottom: 20px;
}

.add-address-button {
  background-color: #6b1f1f;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}

.address-form,
.address-card {
  margin-top: 20px;
}

.loader {
  /* Loader styling here */
  width: 100px;
  height: 100px;
  background-color: #6b1f1f;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}


.address-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  margin-left: -10px;
}

.no-address {
  align-self: flex-start;
  font-family: 'Merriweather', sans-serif;
  color: #555;
  font-size: 18px;
}

.add-address-button,
.save-button,
.cancel-button,
.update-button,
.delete-button {
  font-family: 'Merriweather', sans-serif;
}

.add-address-button {
  background: none;
  border: 2px solid #6b1f1f;
  border-radius: 8px;
  color: #6b1f1f;
  font-size: 18px;
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.plus-icon {
  font-size: 24px;
  margin-right: 8px;
}

.address-form form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.address-form label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  color: #555;
  margin-bottom: 15px;
}

.address-form label span {
  flex-basis: 30%;
}

.address-form input {
  width: 65%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.save-button,
.cancel-button {
  width: 100%;
  background: #6b1f1f;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

.save-button:hover {
  background: #4f1414;
}

.cancel-button {
  background: #888;
}

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
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.update-button:hover,
.delete-button:hover {
  background-color: #6b1f1f;
  color: white;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.error-message {
  color: red;
  font-size: 14px;
}

.error {
  border-color: red;
}

.city-suggestions {
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
}

.city-suggestions ul {
  list-style-type: none;
  padding: 0;
}

.city-suggestions li {
  padding: 5px;
  cursor: pointer;
}

.city-suggestions li:hover {
  background-color: #f0f0f0;
}

.city-suggestions ul,
.street-suggestions ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  border: 1px solid #ddd;
  background-color: #fff;
  max-height: 150px;
  overflow-y: auto;
}

.city-suggestions li,
.street-suggestions li {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #ddd;
}

.city-suggestions li:hover,
.street-suggestions li:hover {
  background-color: #f0f0f0;
}

select {
  font-family: 'Merriweather', sans-serif;
  font-size: 15px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  width: 548px;
  box-sizing: border-box;
}

select:focus {
  outline: none;
  border-color: #4a90e2;
}

label span {
  font-size: 16px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

/* Контейнер для випадаючого списку */
.city-dropdown {
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
  margin-top: -1px; /* для злиття з полем вводу */
}

/* Список варіантів */
.city-dropdown li {
  list-style: none;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* Підсвічування при наведенні */
.city-dropdown li:hover,
.city-dropdown li.active {
  background-color: #f2f2f2;
}

/* Приховування списку, коли він не потрібен */
.city-dropdown.hidden {
  display: none;
}

</style>
