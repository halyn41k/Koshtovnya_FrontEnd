<template>
  <div
    class="flex flex-col font-montserrat text-[14px]
           bg-white/80 dark:bg-gray-800/80
           rounded-lg shadow-md p-6 transition-all"
  >
    <!-- Кроки оформлення -->
    <section class="mb-5">
      <div class="font-bold text-[20px] leading-[1.3] text-gray-600 dark:text-gray-300">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex flex-col gap-3 mt-4"
        >
          <!-- Роздільник між кроками -->
          <div v-if="index !== 0" class="w-full h-px bg-gray-300 dark:bg-gray-600 my-2"></div>

          <!-- Заголовок кроку -->
          <div
            class="flex items-center gap-3 cursor-pointer p-3 rounded-md transition
                   hover:bg-gray-100 dark:hover:bg-gray-700"
            :class="{
              // активний крок
              'bg-red-50 dark:bg-red-900 border-l-4 border-red-700': index === currentStep,
              // пройдений крок (completed) але не активний
              'bg-gray-100 dark:bg-gray-700': step.completed && index !== currentStep
            }"
            @click="toggleStep(index)"
          >
            <span
              :class="[
                step.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100',
                'font-bold'
              ]"
            >
              {{ index + 1 }}. {{ $t(step.titleKey) }}
            </span>

            <!-- Іконка завершеного кроку -->
            <img
              v-if="step.completed"
              src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/142a83ede010f318e450c11b423feee035ee7a5315eb7e3159f36ffbf44c3d8d"
              alt="Completed"
              class="w-6 h-6"
            />
            <!-- Іконка поточного кроку -->
            <img
              v-else-if="index === currentStep"
              src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/ad917f73e2782cc1776c785f1fdafd9a8f21a73bb1ca3ab9d8e4a7a54ba3df3e"
              alt="Current"
              class="w-6 h-6"
            />
          </div>

          <!-- Вміст поточного кроку -->
          <div
            v-if="index === currentStep && step.isExpanded"
            class="mt-3 transition-all duration-300 ease-in-out"
          >
            <component
              :is="getStepComponent(step.titleKey)"
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

            <!-- Кнопка “Далі” для кроків 0 та 1 -->
            <button
              v-if="(canProceedToNextStep || isStorePickupSelected) && currentStep < steps.length - 1"
              @click="validateAndProceed"
              class="mt-4 w-fit px-5 py-2 
                     bg-red-700 hover:bg-red-600 text-white text-[14px] font-semibold 
                     rounded-lg shadow-sm transition-all duration-300 ease-in-out"
            >
              {{ $t('payment.steps.next') }}
            </button>

            <!-- Кнопка “Завершити” для останнього кроку -->

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
  props: {
    // Очікується v-model="formData" у батьківському
    modelValue: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      // Кроки з ключами для перекладу
      steps: [
        { titleKey: "payment.steps.personalInfo", completed: false, validated: false, isExpanded: true },
        { titleKey: "payment.steps.delivery",    completed: false, validated: false, isExpanded: false },
        { titleKey: "payment.steps.payment",     completed: false, validated: false, isExpanded: false },
      ],
      currentStep: 0,
      tempUserAddress: null,
      selectedDeliveryCategory: "",
      errors: {},
      cities: [],
      streets: [],
      warehouses: [],
      deliveryOptions: [], // комбінований список тип + спосіб
      cartItems: [],
      deliveryCost: 0,
    };
  },
  computed: {
    formData: {
      get() {
        return this.modelValue || {}; // захист від undefined
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    isStorePickupSelected() {
      // Для перекладу, якщо назва порівнюється з перекладом:
      // Припустимо, у перекладах: payment.storeCity та payment.storeAddress
      // Але тут просто приклад: перевіряємо назву способу доставки
      return this.formData.deliveryType?.name === this.$t("payment.storeAddress");
    },
    filteredDeliveryOptions() {
      if (!this.selectedDeliveryCategory) return this.deliveryOptions;
      return this.deliveryOptions.filter(opt => opt.value === this.selectedDeliveryCategory);
    },
    canProceedToNextStep() {
      if (this.currentStep === 0) {
        return this.validatePersonalInfo();
      } else if (this.currentStep === 1) {
        return this.validatePostalInfo();
      } else if (this.currentStep === 2) {
        // Третій крок завжди доступний для натискання “Next”/“Finish”
        return true;
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
    getStepComponent(titleKey) {
      // Повертає ім'я компонента залежно від ключа заголовка
      switch (titleKey) {
        case "payment.steps.personalInfo":
          return "PersonalInfo";
        case "payment.steps.delivery":
          return "PostalInfo";
        case "payment.steps.payment":
          return "PaymentInfo";
        default:
          console.warn("Невідомий крок:", titleKey);
          return "div"; // заглушка
      }
    },
    toggleStep(index) {
      if (this.currentStep !== index) {
        // Закриваємо попередній
        this.steps[this.currentStep].isExpanded = false;
        this.currentStep = index;
        // Відкриваємо новий
        this.steps[this.currentStep].isExpanded = true;
      }
    },
    updateDeliveryOptions() {
      const deliveryData = {
        courier: [
          { id: 5, name: "Кур'єр Нової Пошти", value: 'courier', label: this.$t("payment.courier") || 'Кур’єр' },
          { id: 6, name: "Кур'єр УКРПОШТИ", value: 'courier', label: this.$t("payment.courier") || 'Кур’єр' }
        ],
        pickup: [
          { id: 1, name: this.$t("payment.storeAddress") || "Самовивіз з наших магазинів", value: 'pickup', label: this.$t("payment.pickup") || 'Самовивіз' },
          { id: 2, name: "Поштомат Нової Пошти", value: 'pickup', label: this.$t("payment.pickup") || 'Самовивіз' },
          { id: 3, name: "Відділення Нової Пошти", value: 'pickup', label: this.$t("payment.pickup") || 'Самовивіз' },
          { id: 4, name: "Відділення УКРПОШТИ", value: 'pickup', label: this.$t("payment.pickup") || 'Самовивіз' }
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
          // Якщо не вибрано спосіб оплати — питаємо підтвердження
          if (!this.formData.paymentMethod) {
            const confirmSkip = window.confirm(
              this.$t("payment.errors.paymentMethodRequired") || 
              'Ви не обрали спосіб оплати. Продовжити без вибору?'
            );
            if (confirmSkip) {
              isValid = true;
              delete this.errors.paymentMethod;
            } else {
              isValid = false;
              // Використовуємо ключ перекладу
              this.errors.paymentMethod = this.$t("payment.errors.paymentMethodRequired") || "Оберіть спосіб оплати або підтвердіть пропуск";
            }
          } else {
            isValid = true;
            delete this.errors.paymentMethod;
          }
          break;
      }

      if (!isValid) {
        // Позначаємо крок як валідований, але не завершений
        this.steps[this.currentStep].validated = true;
        this.steps[this.currentStep].completed = false;
        // Емітимо, що загальне completed змінилося
        const allDoneFalse = this.steps.every(s => s.completed);
        this.$emit('steps-completed-change', allDoneFalse);
        return;
      }

      // Оновлюємо дані користувача у Vuex/store
      this.updateCustomerData(this.formData);

      // Позначаємо цей крок як завершений
      this.steps[this.currentStep].validated = true;
      this.steps[this.currentStep].completed = true;
      this.steps[this.currentStep].isExpanded = false;

      // Емітимо зміни загальної завершеності
      const allDone = this.steps.every(s => s.completed);
      this.$emit('steps-completed-change', allDone);

      // Переходимо до наступного або завершуємо
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        this.steps[this.currentStep].isExpanded = true;
      } else {
        // Останній крок завершений
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

    // Ім'я
    if (!this.formData.firstName) {
      if (!silent) {
        this.errors.firstName = this.$t("payment.errors.required", {
          fieldsValid: this.$t("payment.fieldsValid.firstName.label")
        });
      }
      valid = false;
    }

    // Прізвище
    if (!this.formData.lastName) {
      if (!silent) {
        this.errors.lastName = this.$t("payment.errors.required", {
          fieldsValid: this.$t("payment.fieldsValid.lastName.label")
        });
      }
      valid = false;
    }

    // По батькові
    if (!this.formData.secondName) {
      if (!silent) {
        this.errors.secondName = this.$t("payment.errors.required", {
          fieldsValid: this.$t("payment.fieldsValid.secondName.label")
        });
      }
      valid = false;
    }

   const phoneLabel = this.$t("payment.fieldsValid.phone.label");
    const phone = this.formData.phone;
    const phoneRegex = /^[0-9]{10}$/;  // будь-які 10 цифр від 0 до 9

    if (!phone) {
      if (!silent) {
        this.errors.phone = this.$t("payment.errors.required", {
          fieldsValid: phoneLabel
        });
      }
      valid = false;
    }
    else if (!phoneRegex.test(phone)) {
      if (!silent) {
        this.errors.phone = this.$t("payment.errors.invalid", {
          fieldsValid: phoneLabel
        });
      }
      valid = false;
    }


    return valid;
  },

  validatePostalInfo(silent = false) {
    if (!silent) this.errors = {};
    let valid = true;

    // Спосіб доставки
    if (!this.formData.deliveryType || !this.formData.deliveryType.name) {
      if (!silent) {
        this.errors.deliveryType = this.$t("payment.errors.required", {
          fieldsValid: this.$t("payment.fieldsValid.deliveryType.label")
        });
      }
      valid = false;
    }

    if (!this.isStorePickupSelected) {
      // Місто
      if (!this.formData.city) {
        if (!silent) {
          this.errors.city = this.$t("payment.errors.required", {
            fieldsValid: this.$t("payment.fieldsValid.city.label")
          });
        }
        valid = false;
      }

      // Кур'єрська доставка
      if (this.selectedDeliveryCategory === "courier") {
        // Вулиця
        if (!this.formData.street) {
          if (!silent) {
            this.errors.street = this.$t("payment.errors.select", {
              fieldsValid: this.$t("payment.fieldsValid.street.label")
            });
          }
          valid = false;
        }
        // Номер будинку
        if (!this.formData.houseNumber) {
          if (!silent) {
            this.errors.houseNumber = this.$t("payment.errors.enter", {
              fieldsValid: this.$t("payment.fieldsValid.houseNumber.label")
            });
          }
          valid = false;
        }
      }

      // Відділення
      if (this.selectedDeliveryCategory === "pickup") {
        if (!this.formData.warehouse) {
          if (!silent) {
            this.errors.warehouse = this.$t("payment.errors.select", {
              fieldsValid: this.$t("payment.fieldsValid.warehouse.label")
            });
          }
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
    async fetchDeliveryTypes() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(this.$t("auth.loginRequired") || "Будь ласка, увійдіть у свій обліковий запис.");
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
        alert(this.$t("payment.errors.deliveryFetch") || "Помилка отримання типів доставки");
      }
    },
    async fetchCartItems() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert(this.$t("auth.loginRequired") || "Будь ласка, увійдіть.");
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
            // Спроба розбору “вулиця + номер”
            const addressMatch = fullAddress.match(/^(.*?)(?:[, ]+)?((\d+[^\s]*)|(\d+\/\d+)|(\d+\s?[^\s]+))$/);
            if (addressMatch) {
              const [, streetOnly, numberOnly] = addressMatch;
              this.formData.streetSearch = streetOnly.trim();
              this.formData.street = streetOnly.trim();
              this.formData.houseNumber = numberOnly.trim();
            } else {
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

          this.updateDeliveryOptions();

          this.$nextTick(async () => {
            // Встановлюємо deliveryType за назвою
            const match = this.deliveryOptions.find(
              opt => opt.name === addressData.delivery_name
            );
            if (match) {
              this.formData.deliveryType = match;
            } else {
              console.warn("Не знайдено deliveryType для", addressData.delivery_name);
            }

            // Завантажуємо відділення
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

            // Розбір ПІБ
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
              Ref: cityRef,
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
      // Перевіряємо валідацію та оновлюємо completed
      const personal = this.steps.find(s => s.titleKey === 'payment.steps.personalInfo');
      if (personal?.validated) {
        personal.completed = this.validatePersonalInfo(true);
      }
      const postal = this.steps.find(s => s.titleKey === 'payment.steps.delivery');
      if (postal?.validated) {
        postal.completed = this.validatePostalInfo(true);
      }
      const payment = this.steps.find(s => s.titleKey === 'payment.steps.payment');
      if (payment?.validated) {
        // За потреби: якщо хочете не блокувати крок, завжди true
        payment.completed = !!this.formData.paymentMethod;
      }
      // Емітимо стан завершеності
      const allDoneNow = this.steps.every(s => s.completed);
      this.$emit('steps-completed-change', allDoneNow);
    },
  },
  watch: {
    formData: {
      handler() {
        this.revalidateSteps();
      },
      deep: true
    },
    'formData.paymentMethod'(val) {
      // Якщо обрали paymentMethod — очищуємо помилку
      if (val && this.errors.paymentMethod) {
        delete this.errors.paymentMethod;
      }
      this.revalidateSteps();
    },
    'formData.phone'(val) {
      this.revalidateSteps();
    },
    currentStep() {
      this.revalidateSteps();
    },
    tempUserAddress: {
      handler() {
        // якщо потрібно щось робити при оновленні тимчасової адреси
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.updateDeliveryOptions();
    // Якщо треба за завантаженням сторінки підхопити адресу або інші дані:
    this.fetchUserAddress().then(() => {
      this.fetchDeliveryTypes();
    });
  },
  mounted() {
    this.revalidateSteps();
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap');

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

</style>
