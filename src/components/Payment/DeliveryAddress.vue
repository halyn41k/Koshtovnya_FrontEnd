<template>
  <div class="delivery-address">
    <h2>Дані для доставки</h2>
    <!-- Поля особистої інформації -->
    <div class="form-group">
      <label for="firstName">Ім'я:</label>
      <input type="text" id="firstName" v-model="firstName" placeholder="Введіть ім'я" />
    </div>
    <div class="form-group">
      <label for="lastName">Прізвище:</label>
      <input type="text" id="lastName" v-model="lastName" placeholder="Введіть прізвище" />
    </div>
    <div class="form-group">
      <label for="secondName">По батькові:</label>
      <input type="text" id="secondName" v-model="secondName" placeholder="Введіть по батькові" />
    </div>
    <div class="form-group">
      <label for="phone">Номер телефону:</label>
      <input type="text" id="phone" v-model="phone" placeholder="Введіть номер телефону" />
    </div>
    <!-- Поля доставки -->
    <div class="form-group">
      <label for="deliveryCategory">Тип доставки:</label>
      <select id="deliveryCategory" v-model="selectedDeliveryCategory" @change="updateDeliveryOptions">
        <option disabled value="">Оберіть тип доставки</option>
        <option value="courier">Кур'єр</option>
        <option value="pickup">Самовивіз</option>
      </select>
    </div>
    <div class="form-group" v-if="selectedDeliveryCategory">
      <label for="deliveryType">Спосіб доставки:</label>
      <select id="deliveryType" v-model="deliveryType">
        <option disabled value="">Оберіть спосіб доставки</option>
        <option v-for="option in filteredDeliveryOptions" :key="option.id" :value="option.name">
          {{ option.name }}
        </option>
      </select>
    </div>
    <div class="form-group" v-if="deliveryType && deliveryType !== 'Самовивіз з наших магазинів'">
      <label for="city">Місто:</label>
      <input type="text" id="city" v-model="city" placeholder="Введіть місто" @input="handleCityInput" />
      <div class="suggestions" v-if="citySuggestions.length">
        <ul>
          <li v-for="item in citySuggestions" :key="item.Ref" @click="selectCity(item)">
            {{ item.city }}
          </li>
        </ul>
      </div>
    </div>
    <div class="form-group" v-if="city">
      <label for="street">Вулиця:</label>
      <input type="text" id="street" v-model="street" placeholder="Введіть вулицю" @input="handleStreetInput" />
      <div class="suggestions" v-if="streetSuggestions.length">
        <ul>
          <li v-for="(item, index) in streetSuggestions" :key="index" @click="selectStreet(item)">
            {{ item.name }}
          </li>
        </ul>
      </div>
    </div>
    <div class="form-group" v-if="street">
      <label for="houseNumber">Номер будинку:</label>
      <input type="text" id="houseNumber" v-model="houseNumber" placeholder="Введіть номер будинку" />
    </div>
    <button @click="submitDeliveryAddress">Продовжити</button>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  name: "DeliveryAddress",
  data() {
    return {
      filteredDeliveryOptions: [],
      citySuggestions: [],
      streetSuggestions: []
    };
  },
  computed: {
    ...mapState("payment", [
      "firstName",
      "lastName",
      "secondName",
      "phone",
      "selectedDeliveryCategory",
      "deliveryType",
      "city",
      "street",
      "houseNumber"
    ])
  },
  methods: {
    ...mapMutations("payment", {
      setFirstName: "setFirstName",
      setLastName: "setLastName",
      setSecondName: "setSecondName",
      setPhone: "setPhone",
      setSelectedDeliveryCategory: "setSelectedDeliveryCategory",
      setDeliveryType: "setDeliveryType",
      setCity: "setCity",
      setStreet: "setStreet",
      setHouseNumber: "setHouseNumber",
      setCityRef: "setCityRef"
    }),
    updateDeliveryOptions() {
      if (this.selectedDeliveryCategory === "courier") {
        this.filteredDeliveryOptions = [
          { id: 5, name: "Кур'єр Нової Пошти" },
          { id: 6, name: "Кур'єр УКРПОШТИ" }
        ];
      } else if (this.selectedDeliveryCategory === "pickup") {
        this.filteredDeliveryOptions = [
          { id: 1, name: "Самовивіз з наших магазинів" },
          { id: 2, name: "Самовивіз з поштоматів Нової Пошти" },
          { id: 3, name: "Самовивіз з Нової Пошти" }
        ];
      }
    }
  }
};
</script>

<style scoped>
.delivery-address {
  padding: 20px;
  font: 16px/1.3 Merriweather, sans-serif;
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #d3d3d3;
  border-radius: 4px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.suggestions {
  border: 1px solid #d3d3d3;
  border-top: none;
  max-height: 150px;
  overflow-y: auto;
}

.suggestions ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.suggestions li {
  padding: 8px;
  cursor: pointer;
}

.suggestions li:hover {
  background-color: #f1f1f1;
}
</style>