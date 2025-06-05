<template>
  <div class="flex flex-col font-montserrat text-[14px] bg-white/80 rounded-lg shadow-md p-6 transition-all">
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
            class="flex items-center gap-3 cursor-pointer p-3 rounded-md transition hover:bg-gray-100"
            :class="{
              'bg-[#FFF0F0] border-l-4 border-[#6B1F1F]': index === currentStep,
              'bg-[#F8F8F8]': step.completed && index !== currentStep
            }"
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

            <!-- Іконка -->
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
          </div>
        </div>
      </div>
    </section>

  </div>
</template>


<script>
import axios from "axios";
import { mapActions } from "vuex";
import DeliveryAddress from "./DeliveryAddress.vue";
import PersonalInfo from "./PersonalInfo.vue";
import PostalInfo from "./PostalInfo.vue";
import PaymentInfo from "./PaymentInfo.vue";


export default {
  name: "PaymentSteps",
  components: {
    DeliveryAddress,
    PersonalInfo,
    PostalInfo,
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
      selectedDeliveryCategory: '',
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
      deliveryOptions: [], // комбінований список тип + спосіб
      hasTriedSubmit: false,
      cartItems: [],
      deliveryCost: 0,
    };
  },
  computed: {
    isStorePickupSelected() {
  return this.formData.deliveryType?.name === 'Самовивіз з наших магазинів';
},
 filteredDeliveryOptions() {
    if (!this.selectedDeliveryCategory) return this.deliveryOptions;
    return this.deliveryOptions.filter(
      opt => opt.value === this.selectedDeliveryCategory
    );
  },


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
  // Якщо натискаєш на той самий крок — просто перемикаєш isExpanded
  if (this.currentStep === index) {
    this.steps[index].isExpanded = !this.steps[index].isExpanded;
  } else {
    // Інакше — звична логіка переходу
    this.steps[this.currentStep].isExpanded = false;
    this.currentStep = index;
    this.steps[this.currentStep].isExpanded = true;
  }
},
    updateDeliveryOptions() {
  const deliveryData = {
    courier: [
      { id: 5, name: "Кур'єр Нової Пошти", value: 'courier', label: 'Курʼєр', delivery_type: 'courier' },
      { id: 6, name: "Кур'єр УКРПОШТИ", value: 'courier', label: 'Курʼєр', delivery_type: 'courier' }
    ],
    pickup: [
      { id: 1, name: "Самовивіз з наших магазинів", value: 'pickup', label: 'Самовивіз', delivery_type: 'pickup' },
      { id: 2, name: "Самовивіз з поштоматів Нової Пошти", value: 'pickup', label: 'Самовивіз', delivery_type: 'pickup' },
      { id: 3, name: "Самовивіз з Нової Пошти", value: 'pickup', label: 'Самовивіз', delivery_type: 'pickup' },
      { id: 4, name: "Самовивіз з УКРПОШТИ", value: 'pickup', label: 'Самовивіз', delivery_type: 'pickup' }
    ]
  };

  this.deliveryOptions = [...deliveryData.courier, ...deliveryData.pickup];
},
    validateAndProceed() {
  let isValid = false;

  switch (this.currentStep) {
    case 0:
      isValid = this.validatePersonalInfo();
      break;
    case 1:
      isValid = this.validatePostalInfo();
      break;
    case 2:
      isValid = !!this.formData.paymentMethod;
      if (!isValid) this.errors.paymentMethod = "Оберіть спосіб оплати";
      break;
  }

  if (!isValid) {
    this.steps[this.currentStep].validated = true;
    this.steps[this.currentStep].completed = false;
    return;
  }

  // ✅ ОНОВИТИ ДАНІ КОРИСТУВАЧА В СТЕЙТІ
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
validateCurrentStep() {
  switch (this.currentStep) {
    case 0:
      return this.validatePersonalInfo(true);
    case 1:
      return this.validatePostalInfo(true);
    case 2:
      return !!this.formData.paymentMethod;
    default:
      return false;
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

    if (addressData.delivery_type === "courier") {
  const fullAddress = addressData.delivery_address || "";

  // Спробуємо знайти останнє число з текстом як номер будинку
  const addressMatch = fullAddress.match(/^(.*?)(?:[, ]+)?((\d+[^\s]*)|(\d+\/\d+)|(\d+\s?[а-яА-ЯіІїЇєЄa-zA-Z-]+))$/);

  if (addressMatch) {
    const [, streetOnly, numberOnly] = addressMatch;
    this.formData.streetSearch = streetOnly.trim();
    this.formData.street = streetOnly.trim();
    this.formData.houseNumber = numberOnly.trim();
  } else {
    // якщо не змогли розбити — як fallback
    this.formData.streetSearch = fullAddress;
    this.formData.street = fullAddress;
    this.formData.houseNumber = addressData.house_number || '';
  }
}



      this.tempUserAddress = {
        phone: addressData.phone_number || '',
        city: addressData.city || '',
        cityRef: addressData.Ref || '',
        street: addressData.delivery_address || '',
        streetSearch: addressData.delivery_address || '',
        houseNumber: addressData.house_number || '',
        warehouseName: addressData.delivery_address,
        deliveryTypeName: addressData.delivery_name,
        deliveryCategory: addressData.delivery_type,
        userName: addressData.user || ''
      };

      this.selectedDeliveryCategory =
        addressData.delivery_type === "courier" ? "courier" : "pickup";

      this.updateDeliveryOptions(this.selectedDeliveryCategory);

      this.$nextTick(async () => {
        const match = this.deliveryOptions.find(
          opt => opt.name === addressData.delivery_name
        );
        if (match) {
          this.formData.deliveryType = match;
        } else {
          console.warn("Не знайдено deliveryType для", addressData.delivery_name);
        }

        // Завантажити відділення
        this.warehouses = await this.fetchWarehouses(
          addressData.city,
          addressData.Ref,
          addressData.delivery_name
        );

        const warehouseMatch = this.warehouses.find(
          w => w.name === addressData.delivery_address
        );
        if (warehouseMatch) {
          this.formData.warehouse = warehouseMatch;
        }

        // ПІБ
        const [last, first, second] = addressData.user
          ? addressData.user.split(" ")
          : ["", "", ""];
        this.formData.lastName = last;
        this.formData.firstName = first;
        this.formData.secondName = second;
      });
    }
  } catch (error) {
    console.error("Помилка отримання адреси користувача", error);
  }
},
async fetchWarehouses(city, cityRef, deliveryName) {
  const token = localStorage.getItem("token");
  if (!token || !city || !cityRef) return [];

  try {
    const response = await axios.get(
      "https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/ware-houses",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          city,
          city_ref: cityRef,
          delivery_type: deliveryName || '',
        }
      }
    );
    return Array.isArray(response.data.data)
      ? response.data.data.map((item, i) => ({ id: i + 1, name: item.warehouse }))
      : [];
  } catch (e) {
    console.error("Помилка отримання відділень", e);
    return [];
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

  validatePostalInfo(silent = false) {
  console.log('formData.houseNumber', this.formData.houseNumber); // 👉 додай це

    if (!silent) this.errors = {};
    let valid = true;

    if (!this.formData.deliveryType || this.formData.deliveryType.name === '') {
      if (!silent) this.errors.deliveryType = "Спосіб доставки обов'язковий";
      valid = false;
    }

    if (!this.isStorePickupSelected) {
      if (!this.formData.city) {
        if (!silent) this.errors.city = "Місто обов'язкове";
        valid = false;
      }

      if (this.selectedDeliveryCategory === "courier") {
        if (!this.formData.street) {
          if (!silent) this.errors.street = "Виберіть вулицю";
          valid = false;
        }
        if (!this.formData.houseNumber) {
          if (!silent) this.errors.houseNumber = "Введіть номер будинку";
          valid = false;
        }
      }

      if (this.selectedDeliveryCategory === "pickup") {
        if (!this.formData.warehouse) {
          if (!silent) this.errors.warehouse = "Відділення обов'язкове";
          valid = false;
        }
      }
    }

    return valid;
  },

  },
  created() {
  this.updateDeliveryOptions();

  this.fetchUserAddress().then(() => {
    this.fetchDeliveryTypes().then(() => {
     
      
    });
  });
},


  watch: {
  formData: {
    handler() {
      this.revalidateSteps();
    },
    deep: true
  },
  'formData.paymentMethod'(val) {
    this.revalidateSteps();
  },
  'formData.phone'(val) {
    this.revalidateSteps();
  },
  'formData.deliveryType'(val) {
    this.selectedDeliveryCategory = val?.delivery_type || val?.value || ''
    this.revalidateSteps()
  },
  'formData.cityRef'(val) {
    if (
      val &&
      this.selectedDeliveryCategory === 'pickup' &&
      !this.isStorePickupSelected &&
      this.formData.city
    ) {
      this.fetchWarehouses(
        this.formData.city,
        this.formData.cityRef,
        this.formData.deliveryType?.name
      ).then(ws => {
        this.warehouses = ws
      })
    }
  },
  currentStep() {
    this.revalidateSteps(); // це обовʼязково! перевіряє при перемиканні кроку
  },
},
mounted() {
  this.revalidateSteps(); // одразу після завантаження
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