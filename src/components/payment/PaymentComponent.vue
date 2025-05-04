<template>
  <!-- Фон — на всю ширину -->
  <section
    class="payment py-[100px] bg-fixed bg-cover"
    :style="{ backgroundImage: `url(${require('@/assets/paymentpattern.png')})` }"
  >
    <!-- Контейнер контенту: max-w і центр -->
    <div class="w-full max-w-4xl mx-auto px-12">
      <header class="mb-8">
        <h1
          class="flex items-center justify-start mt-[40px] font-kyivBlack2 text-[34px] font-black tracking-[-1.2px] text-left"
        >
          <div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
          Оплата
          <div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
        </h1>
      </header>

      <main class="flex flex-col items-start space-y-8">
        <PaymentSteps :currentStep="currentStep" class="w-full" />

        <div class="w-full flex flex-col lg:flex-row gap-8">
          <OrderReview
            :cartItems="cartItems"
            :deliveryCost="deliveryCost"
            class="flex-1"
          />
          <PaymentSummary
            :cartItems="cartItemsFromParent"
            class="flex-1"
          />
        </div>

        <DeliveryAddress
          :formData="formData"
          class="w-full"
        />
      </main>
    </div>
  </section>
</template>


<script>
import PaymentSteps from "./PaymentSteps.vue";
import OrderReview from "./OrderReview.vue";
import DeliveryAddress from "./DeliveryAddress.vue";

export default {
  name: "PaymentComponent",
  components: {
    PaymentSteps,
    OrderReview,
    DeliveryAddress,
  },
  data() {
    return {
      cartItems: [],
      cartItemsFromParent: [],
      currentStep: 1,
      formData: {
        cityRef: "",
        deliveryType: "",
      },
      deliveryCost: 0,
      totalAmount: 0,
    };
  },
  watch: {
    cartItems: { handler: "calculateTotalAmount", deep: true },
    deliveryCost: "calculateTotalAmount",
  },
  methods: {
    calculateTotalAmount() {
      this.totalAmount =
        this.cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ) + this.deliveryCost;
    },
  },
  mounted() {
    document.title = "Оплата";
    this.calculateTotalAmount();
  },
};
</script>

<style scoped>
@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

</style>