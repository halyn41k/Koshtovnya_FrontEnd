<template>
  <div class="flex flex-col font-montserrat text-[14px] bg-white/80 dark:bg-gray-800/80 text-black dark:text-white rounded-lg shadow-md p-6 transition-all">
    <!-- Кроки оформлення -->
    <section class="mb-5">
      <div class="font-bold text-[20px] leading-[1.3] text-gray-400 dark:text-gray-300">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex flex-col gap-3 mt-4"
        >
          <div v-if="index !== 0" class="w-full h-px bg-gray-300 dark:bg-gray-600 my-2"></div>
          <div
            class="flex items-center gap-3 cursor-pointer p-3 rounded-md transition hover:bg-gray-100 dark:hover:bg-gray-700"
            :class="{
              'bg-[#FFF0F0] dark:bg-[#301c1c] border-l-4 border-[#6B1F1F]': index === currentStep,
              'bg-[#F8F8F8] dark:bg-[#2a2a2a]': step.completed && index !== currentStep
            }"
            @click="toggleStep(index)"
          >
            <span
              :class="[step.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white', 'font-bold']"
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
          <div
            v-if="index === currentStep && step.isExpanded"
            class="mt-3 transition-all duration-300 ease-in-out"
          >
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
              :temp-user-address="tempUserAddress"
            />
            <button
              v-if="(canProceedToNextStep || isStorePickupSelected) && currentStep < steps.length - 1"
              @click="validateAndProceed"
              class="mt-4 w-fit px-5 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white text-[14px] font-semibold rounded-lg shadow-sm transition-all duration-300 ease-in-out"
            >
              Далі
            </button>
            <pre class="mt-4 p-4 bg-gray-100 dark:bg-gray-700 text-xs rounded">
  {{ formData }}
  canProceed: {{ canProceedToNextStep }}
</pre>

          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import api from '@/services/api';
import { mapActions } from "vuex";
import PersonalInfo from "./PersonalInfo.vue";
import PostalInfo from "./PostalInfo.vue";
import PostalInfoManually from "./PostalInfoManually.vue";
import PaymentInfo from "./PaymentInfo.vue";

export default {
  name: "PaymentSteps",
  components: {
    PersonalInfo,
    PostalInfo,
    PostalInfoManually,
    PaymentInfo,
  },
  data() {
    return {
      steps: [
        { title: "Особиста інформація", completed: false, validated: false, isExpanded: true },
        { title: "Поштове відділення", completed: false, validated: false, isExpanded: false },
        { title: "Оплата", completed: false, validated: false, isExpanded: false },
      ],
      currentStep: 0,
      tempUserAddress: null,
      showManualForm: false,
      selectedDeliveryCategory: '',
      formData: {
        paymentMethod: "",
        firstName: "",
        lastName: "",
        secondName: "",
        phone: "",
        city: "",
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
      deliveryOptions: [],
      cartItems: [],
      deliveryCost: 0,
    };
  },
  computed: {
        isStorePickupSelected() {
      // Наприклад, окремо для “Самовивіз з наших магазинів”
      return this.formData.deliveryType?.delivery_type === 'pickup'
        && this.formData.deliveryType?.name?.includes('наших магазинів');
    },
    filteredDeliveryOptions() {
      if (!this.selectedDeliveryCategory) return this.deliveryOptions;
      return this.deliveryOptions.filter(
        opt => opt.delivery_type === this.selectedDeliveryCategory
      );
    },
   canProceedToNextStep() {
    if (this.currentStep === 0) {
       return this.validatePersonalInfo(true);
     } else if (this.currentStep === 1) {
       return this.validatePostalInfo(true);
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
      if (title === "Особиста інформація") {
        return "PersonalInfo";
      }
      if (title === "Поштове відділення") {
        return this.showManualForm ? "PostalInfoManually" : "PostalInfo";
      }
      if (title === "Оплата") {
        return "PaymentInfo";
      }
      return "div";
    },
    toggleStep(index) {
      if (this.currentStep === index) {
        this.steps[index].isExpanded = !this.steps[index].isExpanded;
      } else {
        this.steps[this.currentStep].isExpanded = false;
        this.currentStep = index;
        this.steps[this.currentStep].isExpanded = true;
      }
    },
    updateDeliveryOptions() {
      const deliveryData = {
        courier: [
          { id: 5, name: "Кур'єр Нової Пошти", delivery_type: 'courier', label: 'Курʼєр' },
          { id: 6, name: "Кур'єр УКРПОШТИ", delivery_type: 'courier', label: 'Курʼєр' }
        ],
        pickup: [
          { id: 1, name: "Самовивіз з наших магазинів", delivery_type: 'pickup', label: 'Самовивіз' },
          { id: 2, name: "Самовивіз з поштоматів Нової Пошти", delivery_type: 'pickup', label: 'Самовивіз' },
          { id: 3, name: "Самовивіз з Нової Пошти", delivery_type: 'pickup', label: 'Самовивіз' },
          { id: 4, name: "Самовивіз з УКРПОШТИ", delivery_type: 'pickup', label: 'Самовивіз' }
        ]
      };
      this.deliveryOptions = [...deliveryData.courier, ...deliveryData.pickup];
    },
    validateAndProceed() {
      let isValid = false;
      if (this.currentStep === 0) {
        isValid = this.validatePersonalInfo();
      } else if (this.currentStep === 1) {
        isValid = this.validatePostalInfo();
      } else if (this.currentStep === 2) {
        isValid = !!this.formData.paymentMethod;
        if (!isValid) this.errors.paymentMethod = "Оберіть спосіб оплати";
      }
      if (!isValid) {
        this.steps[this.currentStep].validated = true;
        this.steps[this.currentStep].completed = false;
        return;
      }
      this.updateCustomerData(this.formData);
      this.steps[this.currentStep].validated = true;
      this.steps[this.currentStep].completed = true;
      this.steps[this.currentStep].isExpanded = false;
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        this.steps[this.currentStep].isExpanded = true;
      } else {
        this.$emit("steps-complete", true);
      }
    },
    validatePersonalInfo(silent = false) {
      if (!silent) this.errors = {};
      let valid = true;
      if (!this.formData.firstName) {
        if (!silent) this.errors.firstName = "Ім'я обов'язкове";
        valid = false;
      }
      if (!this.formData.lastName) {
        if (!silent) this.errors.lastName = "Прізвище обов'язкове";
        valid = false;
      }
      if (!this.formData.secondName) {
        if (!silent) this.errors.secondName = "По батькові обов'язкове";
        valid = false;
      }
      if (!this.formData.phone) {
        if (!silent) this.errors.phone = "Номер телефону обов'язковий";
        valid = false;
      }
      return valid;
    },


   validatePostalInfo(silent = false) {
   if (!silent) this.errors = {};
      let valid = true;
   const dt = this.formData.deliveryType;
   if (!dt) {
     if (!silent) this.errors.deliveryType = "Спосіб доставки обов'язковий";
     valid = false;
   }
   if (!this.isStorePickupSelected) {
    if (!this.formData.city) {
       if (!silent) this.errors.city = "Місто обов'язкове";
       valid = false;
     }
     if (dt?.delivery_type === "courier") {
       if (!this.formData.street) {
         if (!silent) this.errors.street = "Виберіть вулицю";
         valid = false;
       }
       if (!this.formData.houseNumber) {
         if (!silent) this.errors.houseNumber = "Введіть номер будинку";
         valid = false;
       }
     }
     if (dt?.delivery_type === 'pickup') {
       // якщо ще не обрано склад - валідиться лише після вибору
       if (!this.formData.warehouse?.name) {
         if (!silent) this.errors.warehouse = "Відділення обов'язкове";
         valid = false;
       }
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
    async fetchUserAddress() {
      try {
        const response = await api.getUserAddress();
        const addressData = response.data?.data ?? response.data;
        if (addressData) {
          this.formData.phone = addressData.phone_number || "";
          if (addressData.user) {
            const parts = addressData.user.split(" ");
            this.formData.lastName = parts[0] || '';
            this.formData.firstName = parts[1] || '';
            this.formData.secondName = parts[2] || '';
          }
          this.showManualForm = false;
          this.tempUserAddress = {
            phone: addressData.phone_number,
            city: addressData.city,
            cityRef: addressData.Ref,
            delivery_address: addressData.delivery_address,
            houseNumber: addressData.house_number,
            deliveryTypeName: addressData.delivery_name,
            deliveryCategory: addressData.delivery_type,
            userName: addressData.user,
          };
          await this.loadDeliveryOptionsAndAutoFill(addressData);
        } else {
          this.showManualForm = true;
        }
      } catch (error) {
        console.error("Помилка отримання адреси користувача", error.response?.data || error);
        this.showManualForm = true;
      }
    },
    async loadDeliveryOptionsAndAutoFill(addressData) {
      this.updateDeliveryOptions();
      let match = this.deliveryOptions.find(opt => opt.name === addressData.delivery_name);
      if (!match) {
        match = this.deliveryOptions.find(opt =>
          opt.delivery_type === addressData.delivery_type &&
          opt.name.toLowerCase().includes(
            String(addressData.delivery_name).toLowerCase().split('нова пошта')[0].trim()
          )
        );
      }
      if (!match) {
        match = this.deliveryOptions.find(opt => opt.delivery_type === addressData.delivery_type);
      }
      if (match) {
        this.formData.deliveryType = match;
        this.selectedDeliveryCategory = match.delivery_type;
      }
      try {
        const citiesResp = await api.getNPCities({ city: addressData.city });
        const citiesList = citiesResp.data.success ? citiesResp.data.data : [];
        this.cities = citiesList;
        const foundCity = citiesList.find(c =>
          c.Ref === addressData.Ref ||
          String(c.city).toLowerCase() === String(addressData.city).toLowerCase()
        );
        if (foundCity) {
          this.formData.city = foundCity;
          this.formData.cityRef = foundCity.Ref;
        } else {
          this.formData.city = addressData.city;
          this.formData.cityRef = addressData.Ref;
        }
      } catch (e) {
        console.error("Помилка fetchCities під час автопідстановки", e);
        this.formData.city = addressData.city;
        this.formData.cityRef = addressData.Ref;
      }
      if (this.formData.deliveryType?.delivery_type === 'courier') {
        try {
          const streetsResp = await api.getNPStreets({
            Ref: this.formData.cityRef,
            street: addressData.delivery_address
          });
          const streetsList = streetsResp.data.data || [];
          this.streets = streetsList;
          const raw = addressData.delivery_address || '';
          const parts = raw.split(/\s+/);
          const namePart = parts.slice(0, parts.length - 1).join(' ');
          const foundStreet = streetsList.find(s =>
            String(s.Name).toLowerCase() === namePart.toLowerCase()
          );
          if (foundStreet) {
            this.formData.street = foundStreet;
          } else {
            this.formData.street = namePart;
          }
          this.formData.houseNumber = addressData.house_number || '';
        } catch (e) {
          console.error("Помилка fetchStreets під час автопідстановки", e);
          this.formData.street = addressData.delivery_address || '';
          this.formData.houseNumber = addressData.house_number || '';
        }
      } else if (this.formData.deliveryType?.delivery_type === 'pickup') {
        try {
          const whResp = await api.getNPWarehouses({
            city: typeof this.formData.city === 'object' ? this.formData.city.city : this.formData.city,
            Ref: this.formData.cityRef,
            delivery_type: addressData.delivery_name
          });
          const whList = Array.isArray(whResp.data.data)
            ? whResp.data.data.map((item, i) => ({ id: i+1, name: item.warehouse }))
            : [];
          this.warehouses = whList;
          const target = String(addressData.delivery_address).toLowerCase().replace(/\s+/g,' ').trim();
          const foundW = whList.find(w =>
            w.name.toLowerCase().replace(/\s+/g,' ').includes(target) ||
            target.includes(w.name.toLowerCase().replace(/\s+/g,' '))
          );
          if (foundW) {
            this.formData.warehouse = foundW;
          }
        } catch (e) {
          console.error("Помилка fetchWarehouses під час автопідстановки", e);
        }
      }
    },
    revalidateSteps() {
      const personal = this.steps.find(s => s.title === 'Особиста інформація');
      if (personal?.validated) {
        personal.completed = this.validatePersonalInfo(true);
      }
      const postal = this.steps.find(s => s.title === 'Поштове відділення');
      if (postal?.validated) {
        postal.completed = this.validatePostalInfo(true);
      }
      const payment = this.steps.find(s => s.title === 'Оплата');
      if (payment?.validated) {
        payment.completed = !!this.formData.paymentMethod;
      }
    },
  },
  created() {
    this.updateDeliveryOptions();
    this.fetchUserAddress();
  },
  watch: {
    formData: {
    deep: true,
    handler(val) {
      console.log('formData:', val, 'canProceed:', this.canProceedToNextStep);
      this.revalidateSteps();
    }
  },
    'formData.paymentMethod'(val) {
      this.revalidateSteps();
    },
    'formData.phone'(val) {
      this.revalidateSteps();
    },
    currentStep() {
      this.revalidateSteps();
    },
  },
  mounted() {
    this.revalidateSteps();
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap');
@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
.font-kyiv {
  font-family: 'KyivType Titling Black2', sans-serif;
}
</style>
