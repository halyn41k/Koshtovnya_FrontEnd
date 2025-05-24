<template>
  <section class="relative z-[5]">
    <div
  class="
    w-full
    p-4 lg:p-5
    bg-[#FFF7F6] border border-[#E6E6E6] rounded-lg
    transition-all duration-300
      "
      style="font-family: 'Montserrat', sans-serif;"
    >
     

      <!-- Заголовок -->
      <h2 class="text-black font-bold text-[20px] leading-[1.3] mb-4">
        Сума до оплати
      </h2>

      <!-- Деталі замовлення -->
      <div class="font-normal text-[14px] leading-[1.3]">
        <!-- Товари в кошику -->
        <div
          v-for="item in safeCartItems"
          :key="item.id"
          class="flex justify-between mb-2.5"
        >
          <span>{{ item.name }}</span>
          <!-- Буде: -->
<span class="text-[#A01212] font-semibold text-[14px]">
  {{ formatCurrencyIntl(item.price * item.quantity, item.currency) }}
</span>
        </div>

        <!-- Вартість доставки -->
        <div class="flex justify-between mb-2.5">
          <span>Доставка</span>
          <span class="text-[#A01212] font-semibold text-[14px]">
  {{ formatCurrencyIntl(deliveryCost, detectedCurrency) }}
</span>
        </div>

        <!-- Загальна сума -->
        <div class="flex justify-between text-[18px] mt-4">
          <span>Загальна сума</span>
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
           border border-[#6B1F1F]"
    :class="{
      'bg-[#6B1F1F] text-white hover:bg-[#A01212] cursor-pointer': !isButtonDisabled,
      'bg-gray-300 text-gray-500 cursor-not-allowed': isButtonDisabled
    }"
  >
    <span>Оформити замовлення</span>
    <img
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/436b738744905f60c6a542e2cd314f5694db20045d36b8991f8dab9a31b316a0"
      alt="Order icon"
      class="w-6 h-6"
    />
  </button>

  <!-- Тултіп -->
  <div
    v-if="isButtonDisabled"
    class="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black text-white text-[12px]
           px-3 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
  >
    Заповніть усі кроки оформлення
  </div>
    </div>
  </section>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "PaymentSummary",
  props: {
  cityRef: { type: String, default: "" },
  deliveryType: { type: [String, Object], default: "" },
  stepsCompleted: { type: Boolean, default: false } // ← ДОДАЙ ЦЕ
},

  computed: {
    isButtonDisabled() {
  return !this.stepsCompleted;
},
  detectedCurrency() {
    return (
      this.safeCartItems.find(i => i.currency)?.currency ||
      localStorage.getItem("currency") ||
      "UAH"
    ).toUpperCase();
  },

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
      return this.safeCartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      );
    },
    totalWithDelivery() {
      return this.cartTotalAmount + this.deliveryCost;
    }
  },
  watch: {
    effectiveCityRef(newVal) {
      if (newVal && this.effectiveDeliveryType) {
        this.calculateDeliveryCost();
      }
    },
    effectiveDeliveryType(newVal) {
      if (newVal && this.effectiveCityRef) {
        this.calculateDeliveryCost();
      }
    }
  },
  methods: {
    formatCurrencyIntl(amount, currency) {
    const finalCurrency = (currency || this.detectedCurrency).toUpperCase();
    const locale = finalCurrency === 'USD' ? 'en-US' : 'uk-UA';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: finalCurrency,
    }).format(Number(amount));
  },
    ...mapActions("order", ["updateCartItems", "updateDeliveryCost"]),
    async fetchCartItems() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/cart", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.updateCartItems(response.data.products || []);
      } catch (error) {
        console.error("[fetchCartItems] Помилка:", error);
      }
    },
    async calculateDeliveryCost() {
      const token = localStorage.getItem("token");
      if (!token || !this.effectiveCityRef || !this.effectiveDeliveryType) return 0;
      const serviceType = this.effectiveDeliveryType.toLowerCase().includes("кур'єр")
        ? "WarehouseDoors"
        : "WarehouseWarehouse";
      const productIds = this.safeCartItems.map(item => item.id);
      try {
        const currency = localStorage.getItem('currency')?.toLowerCase() || 'uah';

const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/delivery/cost", {
  headers: { Authorization: `Bearer ${token}` },
  params: {
    CityRecipient: this.effectiveCityRef,
    ServiceType: serviceType,
    product_ids: productIds,
    currency // ← передати валюту
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
      const token = localStorage.getItem("token");
      if (!token || !this.safeCartItems.length) return;
      const currentDeliveryCost = await this.calculateDeliveryCost();
      const customer = this.customerData;
      const currency = localStorage.getItem('currency')?.toLowerCase() || 'uah';

      const orderData = {
        currency,
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
            currency,
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
},

  },
  async mounted() {
    await this.fetchCartItems();
    if (this.effectiveCityRef && this.effectiveDeliveryType && this.safeCartItems.length) {
      await this.calculateDeliveryCost();
    }
  }
};
</script>
