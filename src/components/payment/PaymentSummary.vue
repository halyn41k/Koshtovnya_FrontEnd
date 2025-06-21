<template>
  <section class="relative z-[5]">
    <div
      class="
        w-full
        p-4 lg:p-5
        bg-[#FFF7F6] dark:bg-gray-800 border border-[#E6E6E6] dark:border-gray-600 rounded-lg
        transition-all duration-300
      "
      style="font-family: 'Montserrat', sans-serif;"
    >
      <!-- Заголовок -->
      <h2 class="text-black dark:text-white font-bold text-[20px] leading-[1.3] mb-4">
        {{ $t('payment.title') }}
      </h2>

      <!-- Сума товарів з іконкою -->
      <div class="flex items-center mb-4">
        <img
          :src="goodsIcon"
          alt="Goods"
          class="w-5 h-5 mr-2 dark:invert"
        />
        <span class="font-semibold text-[14px] text-gray-800 dark:text-gray-200">
          {{ $t('payment.itemsTotal') }}:
          <span class="text-[#A01212]">
            {{ formatCurrencyIntl(cartTotalAmount, detectedCurrency) }}
          </span>
        </span>
      </div>

      <!-- Деталі замовлення -->
      <div class="font-normal text-[14px] leading-[1.3] text-gray-900 dark:text-gray-200">
        <!-- Товари в кошику -->
        <div
          v-for="item in safeCartItems"
          :key="item.id"
          class="flex justify-between mb-2.5"
        >
          <span>{{ item.name }}</span>
          <span class="text-[#A01212] font-semibold text-[14px]">
            {{ formatCurrencyIntl(item.price * item.quantity, item.currency) }}
          </span>
        </div>

        <!-- Вартість доставки з іконкою -->
        <div class="flex justify-between mb-2.5 items-center">
          <div class="flex items-center gap-2">
            <img
              :src="deliveryIcon"
              alt="Delivery"
              class="w-5 h-5 dark:invert"
            />
            <span>{{ $t('payment.delivery') }}</span>
          </div>
          <span class="text-[#A01212] font-semibold text-[14px]">
            {{ formatCurrencyIntl(deliveryCostDisplay, detectedCurrency) }}
          </span>
        </div>

        <!-- Загальна сума -->
        <div class="flex justify-between text-[18px] mt-4">
          <span>{{ $t('payment.total') }}</span>
          <span class="text-[#A01212] font-semibold">
            {{ formatCurrencyIntl(totalWithDelivery, detectedCurrency) }}
          </span>
        </div>
      </div>

      <!-- Кнопка оформлення -->
      <button
        @click="submitOrder"
        :disabled="isButtonDisabled"
        class="w-full flex justify-between items-center font-bold text-[15px] leading-[1.3]
               rounded-[8px] py-[6px] px-[15px] mt-2.5 h-[40px] transition-colors duration-300
               border border-[#6B1F1F] group"
        :class="{
          'bg-[#6B1F1F] text-white hover:bg-[#A01212] cursor-pointer': !isButtonDisabled,
          'bg-gray-300 text-gray-500 cursor-not-allowed': isButtonDisabled
        }"
      >
        <span>{{ $t('payment.submit') }}</span>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/436b738744905f60c6a542e2cd314f5694db20045d36b8991f8dab9a31b316a0"
          alt="Order icon"
          class="w-6 h-6"
        />
      </button>

      <!-- Стильна підказка про безкоштовну доставку -->
      <div class="mt-4">
        <!-- Якщо НЕ eligible: картка з нагадуванням -->
        <div
          v-if="!freeDeliveryEligible"
          class="flex items-center gap-2 p-3 border rounded-lg
                 border-red-200 bg-red-50 text-red-700
                 dark:border-red-700 dark:bg-red-900 dark:text-red-200"
        >
          <span class="text-sm">
            {{ $t('payment.freeDeliveryHintStyled', { thresholdText }) }}
          </span>
        </div>

        <!-- Якщо eligible: картка з повідомленням про безкоштовну доставку -->
        <div
          v-else
          class="flex items-center gap-2 p-3 border rounded-lg
                 border-green-200 bg-green-50 text-green-700
                 dark:border-green-700 dark:bg-green-900 dark:text-green-200"
        >
          <!-- Іконка: галочка -->
          <svg xmlns="http://www.w3.org/2000/svg"
               class="w-5 h-5 flex-shrink-0"
               fill="none" viewBox="0 0 24 24" stroke="currentColor"
               stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-sm">
            {{ $t('payment.freeDeliveryEligibleStyled', { thresholdText }) }}
          </span>
        </div>
      </div>

      <!-- Тултіп -->
      <div
        v-if="isButtonDisabled"
        class="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-[12px]
               px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        {{ $t('payment.tooltip') }}
      </div>
    </div>
  </section>
</template>

<script>
import axios from "axios";
import bus from '@/eventBus';
import { mapGetters, mapActions } from "vuex";
// Імпортуємо іконки (шлях до assets може відрізнятись)
import deliveryIcon from '@/assets/icons/car.svg';
import goodsIcon from '@/assets/icons/goods.svg';

export default {
  name: "PaymentSummary",
  props: {
    cityRef: { type: String, default: "" },
    deliveryType: { type: [String, Object], default: "" },
    stepsCompleted: { type: Boolean, default: false }
  },
  data() {
    return {
      // Статичні пороги
      freeDeliveryThresholdUAH: 2000,
      freeDeliveryThresholdUSD: 47,
      // Іконки для template
      deliveryIcon,
      goodsIcon
    };
  },
  computed: {
    // Отримуємо валюту з Vuex-модуля settings
    ...mapGetters('settings', ['currency']),
    detectedCurrency() {
      return (this.currency || 'uah').toUpperCase();
    },

    isButtonDisabled() {
      return !this.stepsCompleted;
    },

    // Отримуємо товари, вартість доставки та дані клієнта з Vuex-модуля order
    ...mapGetters("order", ["cartItems", "deliveryCost", "customerData"]),
    safeCartItems() {
      return Array.isArray(this.cartItems) ? this.cartItems : [];
    },

    effectiveDeliveryType() {
      if (typeof this.deliveryType === 'string') return this.deliveryType;
      if (this.deliveryType && typeof this.deliveryType === 'object') {
        return this.deliveryType.delivery_type || this.deliveryType.name || '';
      }
      return '';
    },
    effectiveCityRef() {
      return this.cityRef || this.customerData?.cityRef || '';
    },

    cartTotalAmount() {
      // Припускаємо, що backend повертає ціни вже в обраній валюті (тому тут просто сума)
      return this.safeCartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      );
    },

    // Статичне визначення eligible:
    freeDeliveryEligible() {
      if (this.detectedCurrency === 'USD') {
        return this.cartTotalAmount >= this.freeDeliveryThresholdUSD;
      }
      // Якщо інші валюти або UAH:
      return this.cartTotalAmount >= this.freeDeliveryThresholdUAH;
    },

    deliveryCostDisplay() {
      return this.freeDeliveryEligible ? 0 : this.deliveryCost;
    },
    totalWithDelivery() {
      const delivery = this.freeDeliveryEligible ? 0 : this.deliveryCost;
      return this.cartTotalAmount + delivery;
    },

    // Статичний текст порога
    thresholdText() {
      if (this.detectedCurrency === 'USD') {
        // наприклад: "47 $"
        return this.formatCurrencyIntl(this.freeDeliveryThresholdUSD, 'USD');
      }
      // за умовчанням UAH
      return this.formatCurrencyIntl(this.freeDeliveryThresholdUAH, 'UAH');
    }
  },
  watch: {
    // при зміні валюти в Vuex: оновлюємо кошик та доставку
    detectedCurrency(newCur, oldCur) {
      this.fetchCartItems();
      this.calculateDeliveryCost();
    },
    effectiveCityRef(newVal) {
      if (newVal && this.effectiveDeliveryType) {
        this.calculateDeliveryCost();
      }
    },
    effectiveDeliveryType(newVal) {
      if (newVal && this.effectiveCityRef) {
        this.calculateDeliveryCost();
      }
    },
    cartTotalAmount() {
      if (this.effectiveCityRef && this.effectiveDeliveryType) {
        this.calculateDeliveryCost();
      }
    }
  },
  methods: {
    ...mapActions("order", ["updateCartItems", "updateDeliveryCost"]),

    formatCurrencyIntl(amount, currency) {
      const finalCurrency = (currency || this.detectedCurrency).toUpperCase();
      let locale = 'uk-UA';
      if (finalCurrency === 'USD') locale = 'en-US';
      else if (finalCurrency === 'EUR') locale = 'de-DE';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: finalCurrency,
        maximumFractionDigits: 2
      }).format(Number(amount));
    },

    async fetchCartItems() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        // Передаємо валюту, якщо бекенд підтримує мультивалюту
        const currencyParam = this.detectedCurrency.toLowerCase();
        const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
          params: { currency: currencyParam }
        });
        this.updateCartItems(response.data.products || []);
      } catch (error) {
        console.error("[fetchCartItems] Помилка:", error);
      }
    },

    async calculateDeliveryCost() {
      if (this.freeDeliveryEligible) {
        this.updateDeliveryCost(0);
        return 0;
      }
      const token = localStorage.getItem("token");
      if (!token || !this.effectiveCityRef || !this.effectiveDeliveryType) return 0;
      const serviceType = this.effectiveDeliveryType.toLowerCase().includes("кур'єр")
        ? "WarehouseDoors"
        : "WarehouseWarehouse";
      const productIds = this.safeCartItems.map(item => item.id);
      try {
        const currencyParam = this.detectedCurrency.toLowerCase();
        const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/delivery/cost", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            CityRecipient: this.effectiveCityRef,
            ServiceType: serviceType,
            product_ids: productIds,
            currency: currencyParam
          }
        });
        const cost = response.data?.data?.cost || 0;
        this.updateDeliveryCost(cost);
        return cost;
      } catch (error) {
        console.error("[calculateDeliveryCost] Помилка:", error);
        return 0;
      }
    },

    async submitOrder() {
      bus.emit('cart-updated');
      const token = localStorage.getItem("token");
      if (!token || !this.safeCartItems.length) return;
      const currentDeliveryCost = this.freeDeliveryEligible ? 0 : await this.calculateDeliveryCost();
      const customer = this.customerData;
      const currencyParam = this.detectedCurrency.toLowerCase();

      const orderData = {
        currency: currencyParam,
        last_name: customer.lastName,
        first_name: customer.firstName,
        second_name: customer.secondName || "",
        phone_number: customer.phone,
        city: customer.city,
        delivery_name: typeof customer.deliveryType === 'string'
          ? customer.deliveryType
          : customer.deliveryType?.name || '',
        delivery_address: this.resolveDeliveryAddress(),
        payment_method: customer.paymentMethod,
        type_of_card: customer.paymentMethod === "Післяоплата" ? "" : customer.typeOfCard,
        delivery_cost: currentDeliveryCost,
        cart_cost: this.cartTotalAmount
      };
      try {
        const orderResponse = await axios.post("https://koshtovnya.api-dev.bmax-edu.website/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orderId = orderResponse.data?.data?.order?.id;
        if (!orderId) return;
        if (customer.paymentMethod === "Післяоплата") {
          this.$router.push("/payment-confirmed");
        } else if (customer.paymentMethod === "Оплата картою") {
          const amount = this.cartTotalAmount + currentDeliveryCost;
          const paymentResponse = await axios.post("https://koshtovnya.api-dev.bmax-edu.website/api/payment", {
            amount,
            order_id: orderId,
            description: "Оплата замовлення",
            currency: currencyParam,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const liqpayFormHtml = paymentResponse.data.form;
          if (!liqpayFormHtml) return;
          const container = document.createElement("div");
          container.innerHTML = liqpayFormHtml;
          document.body.appendChild(container);
          const form = container.querySelector("form");
          if (form) form.submit();
        }
      } catch (error) {
        console.error("[submitOrder] Помилка оформлення замовлення:", error);
      }
    },

    resolveDeliveryAddress() {
      const type = this.customerData?.deliveryType;
      const name = typeof type === 'string' ? type : type?.name || '';
      const delivery_type = typeof type === 'object' ? type.delivery_type : null;

      if (name === 'Самовивіз з наших магазинів') {
        return 'вул. Степана Бандери 22, Коломия';
      }
      if (name.toLowerCase().includes('поштомат')) {
        const wh = this.customerData?.warehouse;
        return typeof wh === 'object' ? wh.name : wh || 'Поштомат не обрано';
      }
      if (delivery_type === 'pickup') {
        const wh = this.customerData?.warehouse;
        return typeof wh === 'object' ? wh.name : wh || 'Відділення не обрано';
      }
      return `${this.customerData?.street || ''} ${this.customerData?.houseNumber || ''}`.trim();
    }
  },
  async mounted() {
    // Завантажуємо кошик
    await this.fetchCartItems();
    if (this.effectiveCityRef && this.effectiveDeliveryType && this.safeCartItems.length) {
      await this.calculateDeliveryCost();
    }
  }
};
</script>

<style scoped>
/* Додаткові стилі за потреби */
</style>
