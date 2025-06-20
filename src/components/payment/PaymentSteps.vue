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
              {{ index + 1 }}. {{ $t('payment.steps.' + step.title) }}
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
              :temp-user-address="tempUserAddress"
            />

            <button
              v-if="currentStep < steps.length - 1 && (canProceedToNextStep || isStorePickupSelected)"
              @click="validateAndProceed"
              class="mt-4 w-fit px-5 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white text-[14px] font-semibold rounded-lg shadow-sm transition-all duration-300 ease-in-out"
            >
              {{ $t('payment.steps.next') }}
            </button>

            <button
              v-else-if="currentStep === steps.length - 1 && canProceedToNextStep"
              @click="validateAndProceed"
              class="mt-4 w-fit px-5 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white text-[14px] font-semibold rounded-lg shadow-sm transition-all duration-300 ease-in-out"
            >
              {{ $t('payment.steps.finish') }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import api from '@/services/api';
import { mapActions } from 'vuex';
import PersonalInfo from './PersonalInfo.vue';
import PostalInfo from './PostalInfo.vue';
import PostalInfoManually from './PostalInfoManually.vue';
import PaymentInfo from './PaymentInfo.vue';

export default {
  name: 'PaymentSteps',
  components: { PersonalInfo, PostalInfo, PostalInfoManually, PaymentInfo },
  data() {
    return {
      steps: [
        { title: 'personalInfo', completed: false, validated: false, isExpanded: true },
        { title: 'delivery', completed: false, validated: false, isExpanded: false },
        { title: 'payment', completed: false, validated: false, isExpanded: false }
      ],
      currentStep: 0,
      tempUserAddress: null,
      showManualForm: false,
      selectedDeliveryCategory: '',
      formData: {
        paymentMethod: '',
        firstName: '',
        lastName: '',
        secondName: '',
        phone: '',
        city: null,
        cityRef: '',
        deliveryType: null,
        street: '',
        houseNumber: '',
        warehouse: null,
        typeOfCard: ''
      },
      errors: {},
      cities: [],
      streets: [],
      warehouses: [],
      deliveryOptions: []
    };
  },
  computed: {
    isStorePickupSelected() {
      return (
        this.formData.deliveryType?.delivery_type === 'pickup' &&
        this.formData.deliveryType?.name.includes('наших магазинів')
      );
    },
    filteredDeliveryOptions() {
      if (!this.selectedDeliveryCategory || !this.deliveryOptions.length) return [];
      return this.deliveryOptions.filter(opt => opt.delivery_type === this.selectedDeliveryCategory);
    },
    canProceedToNextStep() {
      if (this.currentStep === 0) return this.validatePersonalInfo(true);
      if (this.currentStep === 1) return true;
      if (this.currentStep === 2) return !!this.formData.paymentMethod;
      return false;
    }
  },
  methods: {
    ...mapActions('order', ['updateCustomerData', 'updateCartItems', 'updateDeliveryCost']),
    getStepComponent(title) {
      if (title === 'personalInfo') return 'PersonalInfo';
      if (title === 'delivery') return this.showManualForm ? 'PostalInfoManually' : 'PostalInfo';
      if (title === 'payment') return 'PaymentInfo';
      return 'div';
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
    async updateDeliveryOptions() {
      try {
        const result = await api.getDeliveryTypes();
        this.deliveryOptions = result.data || result;
        const categories = [...new Set(this.deliveryOptions.map(opt => opt.delivery_type))];
        if (!categories.includes(this.selectedDeliveryCategory)) {
          this.selectedDeliveryCategory = categories[0];
        }
      } catch (e) {
        console.error('Помилка delivery types:', e);
      }
    },
    validateAndProceed() {
      let isValid = false;
      if (this.currentStep === 0) isValid = this.validatePersonalInfo();
      else if (this.currentStep === 1) isValid = true;
      else if (this.currentStep === 2) {
        isValid = !!this.formData.paymentMethod;
        if (!isValid) this.errors.paymentMethod = 'Оберіть спосіб оплати';
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
        this.$emit('steps-complete', true);
      }
    },
    validatePersonalInfo(silent = false) {
      if (!silent) this.errors = {};
      let valid = true;
      if (!this.formData.firstName) { if (!silent) this.errors.firstName = "Ім'я обов'язкове"; valid = false; }
      if (!this.formData.lastName)  { if (!silent) this.errors.lastName  = "Прізвище обов'язкове"; valid = false; }
      if (!this.formData.secondName){ if (!silent) this.errors.secondName= "По батькові обов'язкове"; valid = false; }
      if (!this.formData.phone)     { if (!silent) this.errors.phone     = "Номер телефону обов'язковий"; valid = false; }
      return valid;
    },
    revalidateSteps() {
      const personal = this.steps.find(s => s.title === 'personalInfo');
      if (personal?.validated) personal.completed = this.validatePersonalInfo(true);
      const payment  = this.steps.find(s => s.title === 'payment');
      if (payment?.validated)  payment.completed  = !!this.formData.paymentMethod;
    }
  },
  created() {
    this.updateDeliveryOptions();
  },
  watch: {
    formData: { deep: true, handler() { this.revalidateSteps(); } },
    'formData.deliveryType'(val) { if (val?.delivery_type) this.selectedDeliveryCategory = val.delivery_type; this.revalidateSteps(); },
    'formData.paymentMethod'() { this.revalidateSteps(); },
    currentStep() { this.revalidateSteps(); }
  },
  mounted() { this.revalidateSteps(); }
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