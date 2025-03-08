<template>
  <div class="address-container">
    <Loader v-if="loading" />

    <!-- No address available state -->
    <div v-if="!addressAvailable && !loading" class="no-address">
      <p class="no-address-text">Немає адреси доставки. Додайте або створіть нову адресу!</p>
      <button class="add-address-button" @click="showForm = true">
        <span class="plus-icon">+</span> Створити нову адресу
      </button>
    </div>

    <!-- Address Form -->
    <div v-if="showForm" class="address-form">
      <h2>{{ addressAvailable ? 'Оновити адресу' : 'Додати нову адресу' }}</h2>
      <form @submit.prevent="submitAddress">
        <!-- Телефон -->
        <label>
          <span>Телефон:</span>
          <input type="tel" v-model="phoneNumber" :class="{ 'input-error': errors.phoneNumber }" required />
          <span v-if="errors.phoneNumber" class="error-message">{{ errors.phoneNumber }}</span>
        </label>

        <!-- Тип доставки -->
        <label>
          <span>Тип доставки:</span>
          <select v-model="formData.deliveryType" @change="updateDeliveryOptions"
            :class="{ 'input-error': errors.deliveryType }" required>
            <option disabled value="">Оберіть тип доставки</option>
            <option value="courier">Кур'єр</option>
            <option value="pickup">Самовивіз</option>
          </select>
          <span v-if="errors.deliveryType" class="error-message">{{ errors.deliveryType }}</span>
        </label>

        <!-- Спосіб доставки -->
        <label>
          <span>Спосіб доставки:</span>
          <select v-model="formData.selectedDeliveryMethod" @change="onDeliveryMethodChange"
            :disabled="!formData.deliveryType">
            <option disabled value="">Оберіть спосіб доставки</option>
            <option v-for="option in filteredDeliveryOptions" :key="option.id" :value="option">
              {{ option.name }}
            </option>
          </select>
        </label>

        <!-- Поля для міста/відділення або магазину -->
        <template v-if="!isStorePickup">
          <label>
            <span>Місто:</span>
            <input type="text" v-model="formData.city" @input="fetchCities" placeholder="Введіть назву міста"
              :class="{ 'input-error': errors.city }" required />
            <div v-if="cities.length > 0" class="city-suggestions">
              <ul>
                <li v-for="city in cities" :key="city.Ref" @click="selectCity(city)">
                  {{ city.city }}
                </li>
              </ul>
            </div>
            <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
          </label>
          <template v-if="formData.deliveryType === 'pickup'">
            <label>
              <span>Відділення:</span>
              <select v-model="deliveryAddress.warehouse" :class="{ 'input-error': errors.warehouse }">
                <option disabled value="">Оберіть відділення</option>
                <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.name">
                  {{ warehouse.name }}
                </option>
              </select>
              <span v-if="errors.warehouse" class="error-message">{{ errors.warehouse }}</span>
            </label>
          </template>
        </template>
        <template v-else>
          <label>
            <span>Магазин:</span>
            <input type="text" v-model="deliveryAddress.warehouse" disabled />
          </label>
        </template>

        <!-- Поля для кур'єрської доставки -->
        <template v-if="formData.deliveryType === 'courier'">
          <label>
            <span>Вулиця:</span>
            <select v-model="deliveryAddress.street" :class="{ 'input-error': errors.street }"
              :disabled="!formData.selectedDeliveryMethod">
              <option disabled value="">Оберіть вулицю</option>
              <option v-for="street in streets" :key="street" :value="street">
                {{ street }}
              </option>
            </select>
            <span v-if="errors.street" class="error-message">{{ errors.street }}</span>
          </label>
          <label>
            <span>Будинок/Квартира:</span>
            <input type="text" v-model="deliveryAddress.number" :class="{ 'input-error': errors.number }"
              :disabled="!deliveryAddress.street" required />
            <span v-if="errors.number" class="error-message">{{ errors.number }}</span>
          </label>
        </template>

        <div class="form-actions">
          <button type="submit" class="save-button">Зберегти</button>
          <button type="button" class="cancel-button" @click="cancelEdit">Скасувати</button>
        </div>
      </form>
    </div>

    <!-- Address Card -->
    <div v-else-if="addressAvailable && !loading" class="address-card">
      <h2 class="card-title">Ваша адреса доставки</h2>
      <p><strong>Телефон:</strong> {{ phoneNumber }}</p>
      <p><strong>Тип доставки:</strong> {{ formData.deliveryType }}</p>
      <p v-if="formData.deliveryType === 'courier'">
        <strong>Адреса:</strong> {{ deliveryAddress.street }} {{ deliveryAddress.number }}
      </p>
      <p v-if="formData.deliveryType === 'pickup'">
        <strong v-if="isStorePickup">Магазин:</strong>
        <strong v-else>Відділення:</strong>
        {{ isStorePickup ? 'вул. Степана Бандери 22, Коломия' : deliveryAddress.warehouse }}
      </p>
      <p><strong>Місто:</strong> {{ formData.city }}</p>
      <div class="button-group">
        <button class="update-button" @click="editAddress">Оновити</button>
        <button class="delete-button" @click="deleteAddress">Видалити</button>
      </div>
    </div>
  </div>
</template>

<script>
import Loader from '../Loader.vue';
import axios from "axios";

export default {
  name: 'UserAddresses',
  components: { Loader },
  data() {
    return {
      addressAvailable: false,
      showForm: false,
      phoneNumber: '',
      formData: {
        city: '',
        deliveryType: '',
        streetSearch: '',
        cityRef: '',
        selectedDeliveryMethod: null,
      },
      deliveryAddress: {
        street: '',
        number: '',
        warehouse: ''
      },
      deliveryOptions: {},
      filteredDeliveryOptions: [],
      cities: [],
      streets: [],
      warehouses: [],
      errors: {},
      loading: true
    };
  },
  computed: {
    // Якщо обрана опція має прапорець is_store, то це самовивіз із магазину
    isStorePickup() {
      return this.formData.selectedDeliveryMethod && this.formData.selectedDeliveryMethod.is_store;
    }
  },
  created() {
    this.fetchUserAddress();
    this.fetchDeliveryTypes();
  },
  methods: {
    onDeliveryMethodChange() {
      console.log("Спосіб доставки змінено:", this.formData.selectedDeliveryMethod);
      if (this.isStorePickup) {
        this.formData.city = 'Коломия';
        // Встановлюємо адресу магазину автоматично
        this.deliveryAddress.warehouse = 'вул. Степана Бандери 22, Коломия';
      } else {
        // Якщо змінюється на інший спосіб доставки – очищаємо дані
        this.formData.city = '';
        this.deliveryAddress.warehouse = '';
      }
    },
    updateDeliveryOptions() {
      this.formData.selectedDeliveryMethod = null;
      this.filteredDeliveryOptions = [];

      if (this.formData.deliveryType) {
        // Припускаємо, що сервер повертає різні опції доставки,
        // де для самовивозу встановлено is_store = true
        this.filteredDeliveryOptions = this.deliveryOptions[this.formData.deliveryType] || [];
      }

      // Скидання даних адреси
      this.deliveryAddress = {
        street: '',
        number: '',
        warehouse: ''
      };
    },
    selectCity(city) {
      this.formData.city = city.city;
      this.formData.cityRef = city.Ref;
      this.cities = [];
      // Очищення налаштувань при виборі міста
      this.formData.deliveryType = '';
      this.filteredDeliveryOptions = [];
      this.deliveryAddress = {
        street: '',
        number: '',
        warehouse: ''
      };
    },
    async fetchWarehouses() {
      if (this.isStorePickup) {
        // Для самовивозу відділення не потрібні
        this.warehouses = [];
        return;
      }
      try {
        const response = await axios.get(
          "http://26.235.139.202:8080/api/nova-poshta/ware-houses",
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            params: {
              city: this.formData.city,
              Ref: this.formData.cityRef,
              delivery_type: this.formData.deliveryType,
            },
          }
        );
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          this.warehouses = response.data.data.map((item, index) => ({
            id: index + 1,
            name: item.warehouse,
          }));
        } else {
          console.error("No data returned or invalid format");
          this.warehouses = [];
        }
      } catch (error) {
        console.error("Error fetching warehouses:", error.response?.data || error.message);
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
        const response = await axios.get('http://26.235.139.202:8080/api/user-address', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data) {
          const { phone_number, city, delivery_name, delivery_address, id } = response.data;
          this.phoneNumber = phone_number || '';
          this.formData.city = city || '';
          this.formData.deliveryType = delivery_name || '';
          this.addressId = id;
          if (delivery_name === 'courier') {
            const [street, number] = delivery_address.split(' ');
            this.deliveryAddress.street = street;
            this.deliveryAddress.number = number;
          } else if (delivery_name === 'pickup') {
            this.deliveryAddress.warehouse = delivery_address;
          }
          this.addressAvailable = true;
        }
      } catch (error) {
        console.error('Помилка отримання адреси:', error);
      } finally {
        this.loading = false;
      }
    },
    async fetchUserPhoneNumber() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await axios.get('http://26.235.139.202:8080/api/user/phone-number', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data !== null) {
          this.phoneNumber = response.data;
        }
      } catch (error) {
        console.error('Помилка отримання номера телефону:', error);
      }
    },
    async fetchDeliveryTypes() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }
      this.loading = true;
      try {
        const response = await axios.get("http://26.235.139.202:8080/api/delivery-types", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.deliveryOptions = response.data.data;
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchCities() {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://26.235.139.202:8080/api/nova-poshta/cities", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            city: this.formData.city,
            delivery_type: this.formData.deliveryType,
          },
        });
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
    async submitAddress() {
      if (!this.validateForm()) return;
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
        return;
      }
      const deliveryAddress = this.isStorePickup
        ? 'вул. Степана Бандери 22, Коломия'
        : this.deliveryAddress.warehouse;
      try {
        await axios.post(
          "http://26.235.139.202:8080/api/user-address",
          {
            phone_number: this.phoneNumber,
            city: this.formData.city,
            delivery_name: this.formData.deliveryType,
            delivery_address: deliveryAddress,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.$toast.success("Адресу успішно збережено!");
        this.fetchUserAddress();
        this.showForm = false;
      } catch (error) {
        console.error("Помилка збереження адреси:", error);
        this.$toast.error(error.response?.data?.message || "Не вдалося зберегти адресу");
      }
    },
    resetAddressForm() {
      this.phoneNumber = '';
      this.formData.city = '';
      this.formData.deliveryType = '';
      this.deliveryAddress = { street: '', number: '', warehouse: '' };
      this.addressId = null;
    },
    validateForm() {
      const errors = {};
      if (!this.phoneNumber) {
        errors.phoneNumber = 'Номер телефону є обов\'язковим';
      }
      if (!this.formData.city) {
        errors.city = 'Місто є обов\'язковим';
      }
      if (!this.formData.deliveryType) {
        errors.deliveryType = 'Оберіть тип доставки';
      }
      if (this.formData.deliveryType === 'courier') {
        if (!this.deliveryAddress.street) {
          errors.street = 'Оберіть вулицю';
        }
        if (!this.deliveryAddress.number) {
          errors.number = 'Введіть номер будинку/квартири';
        }
      }
      if (this.formData.deliveryType === 'pickup' && !this.isStorePickup) {
        if (!this.deliveryAddress.warehouse) {
          errors.warehouse = 'Оберіть відділення';
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
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Адресу успішно видалено');
        this.addressAvailable = false;
        this.resetAddressForm();
      } catch (error) {
        console.error('Помилка видалення адреси:', error);
        alert(error.response?.data?.message || 'Не вдалося видалити адресу');
      }
    },
    editAddress() {
      this.showForm = true;
    },
    cancelEdit() {
      this.showForm = false;
    }
  }
};
</script>



<style scoped>
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
</style>
