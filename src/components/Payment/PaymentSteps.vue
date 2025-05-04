<template>
  <div class="flex flex-col font-montserrat text-[14px]">
    <!-- Кроки оформлення -->
    <section class="mb-5">
      <div class="font-bold text-[20px] leading-[1.3] text-gray-400">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex flex-col gap-3 mt-4"
        >
          <div v-if="index !== 0" class="w-full h-px bg-gray-300 my-2"></div>

          <div
            class="flex items-center gap-3 cursor-pointer"
            @click="toggleStep(index)"
          >
            <span
              :class="[
                step.completed ? 'text-gray-400' : 'text-gray-900',
                'font-bold'
              ]"
            >
              {{ index + 1 }}. {{ step.title }}
            </span>
            <img
              v-if="step.completed"
              src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/142a83ede010f318e450c11b423feee035ee7a5315eb7e3159f36ffbf44c3d8d"
              alt="Completed"
              class="w-6 h-6"
            />
            <img
              v-else-if="index === currentStep"
              src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/ad917f73e2782cc1776c785f1fdafd9a8f21a73bb1ca3ab9d8e4a7a54ba3df3e"
              alt="Current"
              class="w-6 h-6"
            />
          </div>

          <div v-if="index === currentStep && step.isExpanded" class="mt-3">
            <component
              :is="getStepComponent(step.title)"
              v-model="formData"
              :errors="errors"
              :cities="cities"
              :streets="streets"
              :warehouses="warehouses"
              :selected-delivery-category="selectedDeliveryCategory"
              :delivery-options="filteredDeliveryOptions"
              @update-delivery-options="updateDeliveryOptions"
              @update-cities="setCities"
              @update-streets="setStreets"
              @update-warehouses="setWarehouses"
              @validate="validateAndProceed"
            />

            <button
              v-if="canProceedToNextStep && currentStep < steps.length - 1"
              @click="validateAndProceed"
              class="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-[14px] font-medium rounded transition"
            >
              Далі
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Підсумковий блок -->
    <PaymentSummary
      v-if="steps.every(step => step.completed)"
      :cart-items="cartItems"
      :city-ref="formData.cityRef"
      :delivery-type="formData.deliveryType"
      class="mt-6"
    />

    <!-- Адреса доставки -->
    <DeliveryAddress
      v-if="steps.every(step => step.completed)"
      :customer-data="formData"
      class="mt-6"
    />
  </div>
</template>

<script>
import axios from "axios";
import { mapActions } from "vuex";
import PaymentSummary from "./PaymentSummary.vue";
import DeliveryAddress from "./DeliveryAddress.vue";
import PersonalInfo from "./PersonalInfo.vue";
import PostalInfo from "./PostalInfo.vue";
import PaymentInfo from "./PaymentInfo.vue";

export default {
  name: "PaymentSteps",
  components: {
    PaymentSummary,
    DeliveryAddress,
    PersonalInfo,
    PostalInfo,
    PaymentInfo,
  },
  data() {
    return {
      steps: [
        { title: "Особиста інформація", completed: false, isExpanded: true },
        { title: "Поштове відділення", completed: false, isExpanded: false },
        { title: "Оплата", completed: false, isExpanded: false },
      ],
      currentStep: 0,
      formData: {
        paymentMethod: "",
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
      filteredDeliveryOptions: [],
      cartItems: [],
      deliveryCost: 0,
    };
  },
  computed: {
    canProceedToNextStep() {
      if (this.currentStep === 0) {
        return this.validatePersonalInfo();
      } else if (this.currentStep === 1) {
        return this.validatePostalInfo();
      } else if (this.currentStep === 2) {
        return !!this.formData.paymentMethod;
      }
      return false;
    },
  },
  methods: {
    ...mapActions("order", [
      "updateCustomerData",
      "updateCartItems",
      "updateDeliveryCost",
    ]),
    getStepComponent(title) {
      switch (title) {
        case "Особиста інформація":
          return "PersonalInfo";
        case "Поштове відділення":
          return "PostalInfo";
        case "Оплата":
          return "PaymentInfo";
        default:
          return "div";
      }
    },
    toggleStep(index) {
      if (this.currentStep !== index) {
        this.steps[this.currentStep].isExpanded = false;
        this.currentStep = index;
        this.steps[this.currentStep].isExpanded = true;
      }
    },
    updateDeliveryOptions(selectedCategory) {
      this.selectedDeliveryCategory = selectedCategory;
      const deliveryData = {
        courier: [
          { id: 5, name: "Кур'єр Нової Пошти" },
          { id: 6, name: "Кур'єр УКРПОШТИ" },
        ],
        pickup: [
          { id: 1, name: "Самовивіз з наших магазинів" },
          { id: 2, name: "Самовивіз з поштоматів Нової Пошти" },
          { id: 3, name: "Самовивіз з Нової Пошти" },
          { id: 4, name: "Самовивіз з УКРПОШТИ" },
        ],
      };
      this.filteredDeliveryOptions = deliveryData[selectedCategory] || [];
    },
    validateAndProceed() {
      if (this.canProceedToNextStep) {
        this.updateCustomerData(this.formData);
        this.completeStep();
      }
    },
    completeStep() {
      this.steps[this.currentStep].completed = true;
      this.steps[this.currentStep].isExpanded = false;
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        this.steps[this.currentStep].isExpanded = true;
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
    setCities(newCities) {
      this.cities = newCities;
    },
    setStreets(newStreets) {
      this.streets = newStreets;
    },
    setWarehouses(newWarehouses) {
      this.warehouses = newWarehouses;
    },
    async fetchDeliveryTypes() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }
      try {
        await axios.get(
          "https://koshtovnya.api-dev.bmax-edu.website/api/delivery-types",
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Помилка отримання типів доставки", error);
        alert("Помилка отримання типів доставки");
      }
    },
    async fetchCartItems() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть.");
        this.$router.push("/login");
        return [];
      }
      try {
        const response = await axios.get(
          "https://koshtovnya.api-dev.bmax-edu.website/api/cart",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const cartData = response.data.data || [];
        this.cartItems = JSON.parse(JSON.stringify(cartData));
        this.updateCartItems(this.cartItems);
        return this.cartItems;
      } catch (error) {
        console.error("Помилка завантаження кошика", error);
        return [];
      }
    },
    async fetchProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await axios.get(
          "https://koshtovnya.api-dev.bmax-edu.website/api/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
        const response = await axios.get(
          "https://koshtovnya.api-dev.bmax-edu.website/api/user-address",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const addressData = response.data.data;
        if (addressData) {
          this.formData.phone = addressData.phone_number || "";
          this.formData.city = addressData.city || "";
          this.formData.cityRef = addressData.Ref || "";
          this.formData.warehouse = addressData.delivery_address || "";
          this.selectedDeliveryCategory =
            addressData.delivery_type === "courier" ? "courier" : "pickup";
          this.$nextTick(() => {
            this.updateDeliveryOptions(this.selectedDeliveryCategory);
            this.formData.deliveryType = addressData.delivery_name || "";
            [
              this.formData.lastName,
              this.formData.firstName,
              this.formData.secondName,
            ] = addressData.user ? addressData.user.split(' ') : ["", "", ""];
          });
        }
      } catch (error) {
        console.error("Помилка отримання адреси користувача", error);
      }
    },
  },
  created() {
    this.fetchDeliveryTypes();
    this.fetchUserAddress();
    this.fetchCartItems().then(() => {
      this.updateCartItems(this.cartItems);
    });
    this.fetchProfile();
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap');
</style>
