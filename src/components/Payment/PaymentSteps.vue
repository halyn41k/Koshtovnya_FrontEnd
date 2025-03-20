<template>
  <div class="payment-columns">
    <!-- Кроки оформлення -->
    <section class="payment-steps">
      <div class="delivery-steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step"
          :class="{ completed: step.completed }"
        >
          <div v-if="index !== 0" class="step-divider"></div>
          <div class="step-header" @click="toggleStep(index)">
            <span class="step-text">{{ index + 1 }}. {{ step.title }}</span>
            <img
              v-if="step.completed"
              src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/142a83ede010f318e450c11b423feee035ee7a5315eb7e3159f36ffbf44c3d8d"
              alt="Completed step icon"
              class="step-icon"
            />
            <img
              v-else-if="index === currentStep"
              src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/ad917f73e2782cc1776c785f1fdafd9a8f21a73bb1ca3ab9d8e4a7a54ba3df3e"
              alt="Current step icon"
              class="step-icon"
            />
          </div>

          <div v-if="index === currentStep && step.isExpanded" class="step-content">
            <!-- Крок "Особиста інформація" -->
            <template v-if="step.title === 'Особиста інформація'">
              <div class="input-container">
                <input
                  class="input-field"
                  v-model="formData.firstName"
                  placeholder="Ім'я"
                />
                <span v-if="errors.firstName" class="error">{{ errors.firstName }}</span>

                <input
                  class="input-field"
                  v-model="formData.lastName"
                  placeholder="Прізвище"
                />
                <span v-if="errors.lastName" class="error">{{ errors.lastName }}</span>

                <input
                  class="input-field"
                  v-model="formData.secondName"
                  placeholder="По батькові"
                />
                <span v-if="errors.secondName" class="error">{{ errors.secondName }}</span>

                <input
                  class="input-field"
                  v-model="formData.phone"
                  placeholder="Номер телефону"
                />
                <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
              </div>
            </template>

            <!-- Крок "Поштове відділення" -->
            <template v-else-if="step.title === 'Поштове відділення'">
              <div class="input-container">
                <!-- Вибір типу доставки -->
                <select
                  v-model="selectedDeliveryCategory"
                  @change="updateDeliveryOptions"
                  class="input-field"
                >
                  <option disabled value="">Оберіть тип доставки</option>
                  <option value="courier">Кур'єр</option>
                  <option value="pickup">Самовивіз</option>
                </select>

                <!-- Вибір конкретного способу доставки -->
                <select
                  v-model="formData.deliveryType"
                  class="input-field"
                  :disabled="!selectedDeliveryCategory"
                >
                  <option disabled value="">Оберіть спосіб доставки</option>
                  <option
                    v-for="option in filteredDeliveryOptions"
                    :key="option.id"
                    :value="option.name"
                  >
                    {{ option.name }}
                  </option>
                </select>
                <span v-if="!filteredDeliveryOptions.length" class="error">
                  Способи доставки не доступні
                </span>

                <!-- Якщо обрана доставка, що потребує введення міста -->
                <div v-if="formData.deliveryType && formData.deliveryType !== 'Самовивіз з наших магазинів'">
                  <input
                    class="input-field"
                    v-model="formData.city"
                    placeholder="Введіть місто"
                    @input="handleCityInput"
                  />
                  <div v-if="cities.length > 0" class="city-suggestions">
                    <ul>
                      <li v-for="city in cities" :key="city.Ref" @click="selectCity(city)">
                        {{ city.city }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Якщо обрана доставка «Кур'єр» -->
                <div
                  v-if="
                    formData.city &&
                    formData.deliveryType &&
                    formData.deliveryType.includes('Кур\'єр')
                  "
                >
                  <input
                    class="input-field"
                    v-model="formData.streetSearch"
                    placeholder="Введіть назву вулиці"
                    @input="handleStreetSearch"
                  />
                  <div v-if="streets.length > 0" class="street-suggestions">
                    <ul>
                      <li
                        v-for="(street, idx) in streets"
                        :key="idx"
                        @click="selectStreet(street)"
                      >
                        {{ street.street || street.Name }}
                      </li>
                    </ul>
                  </div>
                  <div v-else-if="formData.streetSearch">
                    <p>Немає вулиць для цього запиту.</p>
                  </div>
                  <span v-if="errors.street" class="error">{{ errors.street }}</span>
                </div>

                <!-- Введення номера будинку -->
                <div v-if="formData.street">
                  <input
                    class="input-field"
                    v-model="formData.houseNumber"
                    placeholder="Введіть номер будинку"
                  />
                  <span v-if="errors.houseNumber" class="error">{{ errors.houseNumber }}</span>
                </div>

                <!-- Вибір відділення для самовивозу -->
                <div v-if="formData.deliveryType === 'Самовивіз з наших магазинів'">
                  <select v-model="formData.warehouse" class="input-field">
                    <option disabled value="">Оберіть магазин</option>
                    <option value="Степана Бандери 22">Степана Бандери 22</option>
                  </select>
                  <span v-if="errors.warehouse" class="error">{{ errors.warehouse }}</span>
                </div>
              </div>
            </template>

            <!-- Крок "Оплата" -->
            <template v-else-if="step.title === 'Оплата'">
              <div class="payment-options">
                <div
                  v-for="(option, idx) in paymentOptions"
                  :key="idx"
                  class="payment-option"
                >
                  <input
                    type="radio"
                    :id="`payment-${idx}`"
                    :value="option"
                    v-model="formData.selectedPaymentOption"
                    class="radio-input"
                  />
                  <label :for="`payment-${idx}`" class="payment-label">
                    {{ option }}
                  </label>
                </div>
                <span v-if="errors.paymentOption" class="error">{{ errors.paymentOption }}</span>
              </div>
              <button
                :disabled="!formData.selectedPaymentOption"
                @click="validateAndProceed"
                class="next-button"
              >
                Далі
              </button>
            </template>

            <!-- Універсальна кнопка "Далі" для кроків, окрім останнього -->
            <button
              v-if="canProceedToNextStep && currentStep < steps.length - 1 && step.title !== 'Оплата'"
              @click="validateAndProceed"
              class="next-button"
            >
              Далі
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Підсумковий блок – PaymentSummary (відображається після завершення всіх кроків) -->
    <PaymentSummary v-if="steps.every(step => step.completed)" />

    <!-- Компонент адреси доставки (якщо необхідно) -->
    <DeliveryAddress v-if="showDeliveryAddress" :customerData="formData" />
  </div>
</template>

<script>
import axios from "axios";
import PaymentSummary from "./PaymentSummary.vue";
import DeliveryAddress from "./DeliveryAddress.vue";
import { mapActions } from "vuex";

export default {
  name: "PaymentSteps",
  components: {
    PaymentSummary,
    DeliveryAddress,
  },
  data() {
    return {
      steps: [
        { title: "Особиста інформація", completed: false, isExpanded: true },
        { title: "Поштове відділення", completed: false, isExpanded: false },
        { title: "Оплата", completed: false, isExpanded: false },
      ],
      paymentOptions: ["Післяоплата", "Оплата картою"],
      currentStep: 0,
      formData: {
        selectedPaymentOption: "",
        firstName: "",
        lastName: "",
        secondName: "",
        phone: "",
        city: "",
        streetSearch: "",
        cityRef: "",
        deliveryType: "",
        street: "",
        houseNumber: "",
        warehouse: "",
        typeOfCard: "",
      },
      errors: {},
      cities: [],
      streets: [],
      warehouses: [],
      selectedDeliveryCategory: "",
      deliveryOptions: [],
      filteredDeliveryOptions: [],
      deliveryData: {
        courier: [
          { id: 5, name: "Кур'єр Нової Пошти", delivery_type: "courier" },
          { id: 6, name: "Кур'єр УКРПОШТИ", delivery_type: "courier" },
        ],
        pickup: [
          { id: 1, name: "Самовивіз з наших магазинів", delivery_type: "pickup" },
          { id: 2, name: "Самовивіз з поштоматів Нової Пошти", delivery_type: "pickup" },
          { id: 3, name: "Самовивіз з Нової Пошти", delivery_type: "pickup" },
          { id: 4, name: "Самовивіз з УКРПОШТИ", delivery_type: "pickup" },
        ],
      },
      cartItems: [], // При потребі, дані кошика можна також завантажувати у Vuex
      deliveryCost: 0,
    };
  },
  computed: {
    clonedFormData() {
      return JSON.parse(JSON.stringify(this.formData));
    },
    canProceedToNextStep() {
      if (this.currentStep === 0) {
        return this.validatePersonalInfo();
      } else if (this.currentStep === 1) {
        return this.validatePostalInfo();
      } else if (this.currentStep === 2) {
        return !!this.formData.selectedPaymentOption;
      }
      return false;
    },
    showDeliveryAddress() {
      return this.steps.every((step) => step.completed);
    },
    cartTotalAmount() {
      return this.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
  },
  methods: {
    ...mapActions("order", ["updateCustomerData", "updateCartItems", "updateDeliveryCost"]),
    toggleStep(index) {
      if (this.currentStep !== index) {
        this.steps[this.currentStep].isExpanded = false;
        this.currentStep = index;
        this.steps[this.currentStep].isExpanded = true;
      }
    },
    updateDeliveryOptions() {
      if (this.selectedDeliveryCategory) {
        this.filteredDeliveryOptions =
          this.deliveryData[this.selectedDeliveryCategory];
      } else {
        this.filteredDeliveryOptions = [];
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
          headers: { Authorization: `Bearer ${token}` },
        });
        this.deliveryOptions = response.data.data;
      } catch (error) {
        console.error("Помилка отримання типів доставки", error);
        alert("Помилка отримання типів доставки");
      }
    },
    handleCityInput() {
      if (this.formData.city.length >= 3) {
        this.fetchCities();
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
          this.cities = [];
        }
      } catch (error) {
        console.error("Помилка отримання міст", error);
      }
    },
    selectCity(city) {
      this.formData.city = city.city;
      this.formData.cityRef = city.Ref;
      this.cities = [];
      this.fetchWarehouses();
    },
    handleStreetSearch() {
      clearTimeout(this.streetSearchTimeout);
      this.streetSearchTimeout = setTimeout(() => {
        this.fetchStreets();
      }, 300);
    },
    async fetchStreets() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Ви не авторизовані. Будь ласка, увійдіть.");
        this.$router.push("/login");
        return;
      }
      if (this.formData.streetSearch.length >= 3) {
        try {
          const response = await axios.get("http://26.235.139.202:8080/api/nova-poshta/streets", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              Ref: this.formData.cityRef,
              street: this.formData.streetSearch,
            },
          });
          if (response.data && Array.isArray(response.data.data)) {
            this.streets = response.data.data;
          } else {
            this.streets = [];
          }
        } catch (error) {
          console.error("Помилка отримання вулиць", error);
        }
      }
    },
    selectStreet(street) {
      const streetName = street.street || street.Name;
      this.formData.street = streetName;
      this.formData.streetSearch = streetName;
      this.streets = [];
    },
    async fetchWarehouses() {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://26.235.139.202:8080/api/nova-poshta/ware-houses", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            city: this.formData.city,
            Ref: this.formData.cityRef,
            delivery_type: this.formData.deliveryType,
          },
        });
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          this.warehouses = response.data.data.map((item, index) => ({
            id: index + 1,
            name: item.warehouse,
          }));
        }
      } catch (error) {
        console.error("Помилка отримання відділень", error);
      }
    },
    validateAndProceed() {
      let isValid = false;
      if (this.currentStep === 0) {
        isValid = this.validatePersonalInfo();
      } else if (this.currentStep === 1) {
        isValid = this.validatePostalInfo();
      } else if (this.currentStep === 2) {
        isValid = !!this.formData.selectedPaymentOption;
        if (!isValid) {
          this.errors.paymentOption = "Оберіть спосіб оплати";
        }
      }
      if (isValid) {
        // Оновлюємо дані замовлення у Vuex перед переходом
        this.updateCustomerData(this.formData);
        this.completeStep();
      }
    },
    validatePersonalInfo() {
      this.errors = {};
      let valid = true;
      if (!this.formData.firstName) {
        this.errors.firstName = "Ім'я обов'язкове";
        valid = false;
      }
      if (!this.formData.lastName) {
        this.errors.lastName = "Прізвище обов'язкове";
        valid = false;
      }
      if (!this.formData.secondName) {
        this.errors.secondName = "По батькові обов'язкове";
        valid = false;
      }
      if (!this.formData.phone) {
        this.errors.phone = "Номер телефону обов'язковий";
        valid = false;
      }
      return valid;
    },
    validatePostalInfo() {
      this.errors = {};
      let valid = true;
      if (!this.formData.city) {
        this.errors.city = "Місто обов'язкове";
        valid = false;
      }
      if (!this.formData.deliveryType) {
        this.errors.deliveryType = "Тип доставки обов'язковий";
        valid = false;
      }
      if (this.selectedDeliveryCategory === "courier") {
        if (!this.formData.street) {
          this.errors.street = "Виберіть вулицю";
          valid = false;
        }
        if (!this.formData.houseNumber) {
          this.errors.houseNumber = "Введіть номер будинку";
          valid = false;
        }
      }
      if (this.selectedDeliveryCategory === "pickup") {
        if (!this.formData.warehouse) {
          this.errors.warehouse = "Відділення обов'язкове";
          valid = false;
        }
      }
      return valid;
    },
    completeStep() {
      this.steps[this.currentStep].completed = true;
      this.steps[this.currentStep].isExpanded = false;
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        this.steps[this.currentStep].isExpanded = true;
      } else {
        // Після завершення всіх кроків перераховуємо вартість доставки
        this.calculateDeliveryCost();
      }
    },
  
    async fetchProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await axios.get("http://26.235.139.202:8080/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data.user;
        this.formData.firstName = user.first_name || "";
        this.formData.lastName = user.last_name || "";
        this.formData.secondName = user.second_name || "";
      } catch (error) {
        console.error("Помилка завантаження профілю", error);
      }
    },
    async fetchUserAddress() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await axios.get("http://26.235.139.202:8080/api/user-address", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data && response.data.data && response.data.data.address) {
          const address = response.data.data.address;
          if (address.phone_number) {
            this.formData.phone = address.phone_number;
          }
          if (address.city) {
            this.formData.city = address.city;
          }
          if (address.delivery_address) {
            this.formData.warehouse = address.delivery_address;
          }
          if (address.delivery_type) {
            this.selectedDeliveryCategory =
              address.delivery_type === "courier" ? "courier" : "pickup";
            this.$nextTick(() => {
              this.updateDeliveryOptions();
              if (address.delivery_name) {
                this.formData.deliveryType = address.delivery_name;
              }
            });
          }
          if (!this.formData.cityRef && this.formData.city) {
            try {
              const cityResponse = await axios.get("http://26.235.139.202:8080/api/nova-poshta/cities", {
                headers: { Authorization: `Bearer ${token}` },
                params: { city: this.formData.city, delivery_type: this.formData.deliveryType },
              });
              if (
                cityResponse.data.success &&
                Array.isArray(cityResponse.data.data) &&
                cityResponse.data.data.length > 0
              ) {
                this.formData.cityRef = cityResponse.data.data[0].Ref;
              }
            } catch (err) {
              console.error("Помилка встановлення cityRef", err);
            }
          }
        }
      } catch (error) {
        console.error("Помилка отримання адреси користувача", error);
      }
    },
    async calculateDeliveryCost() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Будь ласка, увійдіть у свій обліковий запис.");
    this.$router.push("/login");
    return;
  }
  
  // Якщо cityRef не встановлено, отримуємо його через API
  if (!this.formData.cityRef && this.formData.city) {
    try {
      const cityResponse = await axios.get("http://26.235.139.202:8080/api/nova-poshta/cities", {
        headers: { Authorization: `Bearer ${token}` },
        params: { city: this.formData.city, delivery_type: this.formData.deliveryType },
      });
      if (cityResponse.data.success && Array.isArray(cityResponse.data.data) && cityResponse.data.data.length > 0) {
        this.formData.cityRef = cityResponse.data.data[0].Ref;
      }
    } catch (err) {
      console.error("Помилка встановлення cityRef", err);
    }
  }
  
  const serviceType = this.formData.deliveryType === "Поштове відділення" 
                        ? "WarehouseWarehouse" 
                        : "WarehouseDoors";
  const productIds = this.cartItems.map(item => item.id);
  
  console.log("Параметри для розрахунку доставки:", {
    CityRecipient: this.formData.cityRef,
    ServiceType: serviceType,
    product_ids: productIds
  });
  
  try {
    const response = await axios.get("http://26.235.139.202:8080/api/nova-poshta/delivery/cost", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        CityRecipient: this.formData.cityRef,
        ServiceType: serviceType,
        product_ids: productIds
      },
    });
    
    // Оновлюємо локальну змінну та стан у Vuex
    this.deliveryCost = response.data.deliveryCost;
    this.updateDeliveryCost(response.data.deliveryCost); // Виклик Vuex action
  } catch (error) {
    console.error("Помилка розрахунку вартості доставки", error);
    alert("Сталася помилка при розрахунку вартості доставки.");
  }
},

  },
  mounted() {
    console.log("PaymentSteps mounted. Customer data:", this.formData);
  },
  created() {
    this.fetchProfile();
    this.fetchDeliveryTypes();
    this.fetchUserAddress();
  },
};
</script>


<style scoped>
@media (max-width: 991px) {

  .payment-columns {
    flex-direction: column;
  }
}

.order-items {
  max-height: 500px;
  /* Встановлюємо максимальну висоту */
  overflow-y: auto;
  /* Додаємо вертикальний скрол */
  margin-top: 20px;
  /* Відступ зверху */
  padding-right: 10px;
  /* Для естетики скролбару */
}

/* Налаштування для скролбару */
.order-items::-webkit-scrollbar {
  width: 8px;
}

.order-items::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.order-items::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Для стилізації елементів у секції */
.order-items .item {
  display: flex;
  gap: 20px;
  background-color: #f5f5f5;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
}

.order-items .item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.order-items .item-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.order-items .item-title {
  font-size: 18px;
  font-weight: 600;
}

.order-items .item-price,
.order-items .item-quantity {
  font-size: 16px;
  color: #555;
}

.payment-header {
  margin-top: 200px;
  display: flex;
  align-items: center;
  gap: 26.67px;
  font: 840 26.67px/1.3 'KyivType Titling', -apple-system, Roboto, Helvetica, sans-serif;
  letter-spacing: -1.33px;
}


.header-line {
  flex: 1;
  height: 2px;
  background-color: grey;
  margin: 0 10px;
}

.main-title {
  font-family: 'KyivType Titling', sans-serif;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: -1.2px;
  text-shadow: 0 2px 3px rgba(99, 2, 2, 0.22);
  text-align: center;
}

.payment-content {
  background-image: url('@/assets/paymentpattern.png');
  background-attachment: fixed;
  background-size: cover;
  padding: 0 46.67px;
  margin-top: 28px;
}

.payment-notice {
  font: 700 16.67px/22px Merriweather, sans-serif;
  margin: 148.67px 0 0 18.67px;
}

.order-details {
  gap: 13px;
  margin: 10px 0 0 18.67px;
  max-width: 1108px;
}


@media (max-width: 991px) {

  .payment-steps,
  .payment-summary,
  .order-items,
  .delivery-address {
    width: 100%;
  }


}

.delivery-steps {
  font: 700 20px/1.3 Merriweather, sans-serif;
  color: #9d9292;
}

.step {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.step.completed .step-text {
  color: #a6a6a6;
}

.step-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 10px;
}

.step-text {
  font-weight: bold;
  color: #040404;
}

.step-icon {
  width: 34px;
  height: 32px;
}

.step-divider {
  width: 300px;
  height: 1px;
  background-color: #9d9292;
  margin: 10px 0;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 200px;
}

.input-field {
  border: 1px solid #9D9292;
  padding: 8px;
  color: #6B1F1F;
  font-family: 'Montserrat', sans-serif;
  border-radius: 4px;
}

.payment-option {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.payment-label {
  color: #040404;
  font-weight: bold;
  cursor: pointer;
}

.radio-input {
  display: none;
}

.radio-input+.payment-label::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 10px;
  border: 5px solid #9D9292;
  border-radius: 30%;
  background-color: transparent;
}

/* Стиль обраного радіо-доту */
.radio-input:checked+.payment-label::before {
  background-color: #6B1F1F;
  border: 4.5px solid #9D9292;
}

.next-button {
  padding: 10px 20px;
  background-color: #6B1F1F;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  font-family: 'Montserrat', sans-serif;
}

.order-summary {
  position: absolute;
  top: 300px;
  right: 100px;
  z-index: 100;
  width: 300px;
  padding: 20px;
  border-radius: 16px;
  background-color: rgba(255, 247, 246, 1);
  border: 1px solid rgba(230, 230, 230, 1);
  max-height: 400px;
  overflow-y: auto;
  transition: position 0.3s ease;
  z-index: 10;
}

.order-summary.sticky {
  position: absolute;
  top: auto;
  bottom: 00px;
}

.summary-title {
  color: #000;
  font: 700 20px/1.3 Merriweather, sans-serif;
  margin-bottom: 16px;
}

.summary-details {
  font: 400 14px/1.3 Merriweather, sans-serif;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.price {
  color: rgba(160, 18, 18, 1);
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 14px;
}

.total {
  font-size: 18px;
  margin-top: 16px;
}

.payment-button {
  border-radius: 8px;
  background-color: rgba(107, 31, 31, 1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font: 700 12px/1.3 Merriweather, sans-serif;
  padding: 6px 15px;
  margin-top: 10px;
  width: 100%;
  border: none;
  cursor: pointer;
}

.button-icon {
  width: 24px;
  height: 24px;
}

@media (max-width: 991px) {
  .order-summary {
    max-width: 100%;
    margin-top: 20px;
    padding: 15px;
  }
}

.order-items {
  border: 1px solid rgba(0, 0, 0, 0.5);
  padding: 21px 25px;
  background-color: #fff;
  width: 750px;
  margin-left: 50px;
}

.item {
  display: flex;
  gap: 13px;
  border-radius: 16px;
  background-color: rgba(255, 247, 246, 1);
  padding: 13px;
  border: 1.33px solid rgba(230, 230, 230, 1);
  margin-bottom: 25px;
  width: 700px;
  margin-top: 20px;
}

.item-image {
  width: 115px;
  height: 106px;
  object-fit: contain;
}

.item-details {
  font: 700 13.33px/1.3 Merriweather, sans-serif;
}

.item-title {
  color: var(--Grays-Black, #000);
  margin-bottom: 2.67px;
}

.item-price {
  color: rgba(160, 18, 18, 1);
  font-family: Inter, sans-serif;
  font-weight: 600;
  margin-bottom: 17.33px;
}

.item-quantity {
  color: rgba(160, 18, 18, 0.5);
}


@media (max-width: 991px) {
  .order-items {
    max-width: 100%;
    padding: 20px;
  }

  .item {
    flex-direction: column;
  }

  .item-image {
    width: 100%;
    height: auto;
  }
}

.delivery-address {
  padding: 23.33px 0;
  font: 16.67px/1.3 Merriweather, sans-serif;
}

.address-title {
  margin-left: 25.33px;
}

.address-divider {
  margin-top: 13.33px;
}

.address-details {
  margin: 10.67px 0 0 25.33px;
}


@media (max-width: 991px) {
  .delivery-address {
    max-width: 100%;
    margin-top: 40px;
  }

  .address-title,
  .address-details {
    margin-left: 10px;
  }
}

.delivery-address {
  padding: 20px;
  font: 16px/1.3 Merriweather, sans-serif;
  margin-top: 20px;
}

.address-title {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.address-box {
  background-color: #fff;
  border: 1px solid #d3d3d3;
  border-radius: 8px;
  padding: 20px;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.address-box p {
  margin: 5px 0;
}

@media (max-width: 991px) {
  .delivery-address {
    max-width: 100%;
    margin-top: 20px;
  }

  .address-title,
  .address-details {
    margin-left: 10px;
  }
}

.city-dropdown {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  z-index: 10;
}

.city-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.city-dropdown li {
  padding: 8px 12px;
  cursor: pointer;
}

.city-dropdown li:hover {
  background-color: #f0f0f0;
}

.office-suggestions {
  position: absolute;
  z-index: 1000;
  background-color: white;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.office-suggestions ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.office-suggestions li {
  padding: 10px;
  cursor: pointer;
}

.office-suggestions li:hover {
  background-color: #f0f0f0;
}

.input-container {
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
}

.error {
  color: red;
  font-size: 12px;
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

.radio-input {
  display: none;
}

.radio-input+.payment-label::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 10px;
  border: 2px solid #9D9292;
  border-radius: 50%;
  background-color: transparent;
}

/* Стиль обраного радіо-доту */
.radio-input:checked+.payment-label::before {
  background-color: #6B1F1F;
}
</style>