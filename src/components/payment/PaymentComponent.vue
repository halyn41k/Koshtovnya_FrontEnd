<template>
  <!-- Фон — на всю ширину -->
  <section
    class="payment py-[150px] bg-fixed bg-cover"
    :style="{ backgroundImage: `url(${require('@/assets/paymentpattern.png')})` }"
  >
    <!-- Контейнер контенту: max-w і центр -->
    <div class="w-full max-w-7xl mx-auto px-4 lg:px-12">

      <header class="mb-8">
        <h1 class="flex items-center justify-center mt-[40px]
                   font-kyivBlack2 text-[34px] font-black tracking-[-1.2px]
                   text-center">
          <div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
      {{ $t('payment.paymentTitle') }}  
<div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
        </h1>
      </header>

<main class="flex flex-col lg:flex-row lg:items-start gap-10 relative min-h-[900px]">
<div class="flex-1 flex flex-col space-y-6">
<PaymentSteps
  ref="paymentSteps"
  @steps-completed-change="stepsCompleted = $event"
  @steps-complete="stepsCompleted = true"
  v-model="formData"
/>


  <OrderReview
    :cartItems="cartItems"
    :deliveryCost="deliveryCost"
  />

  <DeliveryAddress
    v-if="stepsCompleted"
    :customerData="formData"
  />
</div>

<!-- ВСЕРЕДИНІ <main> -->
<div class="w-full lg:w-[360px] shrink-0 lg:ml-[60px] mt-6 lg:mt-0">
  <div class="sticky top-[100px] z-10">
   
<PaymentSummary
  :cart-items="cartItems"
  :city-ref="formData.cityRef"
  :delivery-type="formData.deliveryType"
  :steps-completed="stepsCompleted"
/>
  </div>
</div>





      </main>
    </div>
  </section>
</template>

<script>
import PaymentSteps from "./PaymentSteps.vue";
import OrderReview from "./OrderReview.vue";
import DeliveryAddress from "./DeliveryAddress.vue";
import PaymentSummary from "./PaymentSummary.vue";

export default {
  name: "PaymentComponent",
  components: {
    PaymentSteps,
    OrderReview,
    DeliveryAddress,
    PaymentSummary,
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
    errors: {},
    cities: [],
    streets: [],
    warehouses: [],
    deliveryOptions: [],
    hasTriedSubmit: false,
    cartItems: [],
    deliveryCost: 0,

    stepsCompleted: false,

    formData: {
      paymentMethod: "",
      typeOfCard: "",
      firstName: "",
      lastName: "",
      secondName: "",
      phone: "",
      city: "",
      cityRef: "",
      street: "",
      streetSearch: "",
      houseNumber: "",
      warehouse: "",
      deliveryType: "",
    },

    totalAmount: 0,
  };
},

  watch: {
    cartItems: { handler: "calculateTotalAmount", deep: true },
    deliveryCost: "calculateTotalAmount",
    currentStep() {
    this.checkStepsCompletion();
  }
  },
  methods: {
    calculateTotalAmount() {
      this.totalAmount =
        this.cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ) + this.deliveryCost;
    },
    checkStepsCompletion() {
    // Якщо PaymentSteps доступні як компонент або пропс
    const allCompleted = this.$refs.paymentSteps?.steps?.every(s => s.completed);
    this.stepsCompleted = allCompleted === true;
  },
  },
  mounted() {
    document.title = "Оплата";
    this.calculateTotalAmount();
  },
};
</script>

<style scoped>
/* Google-шрифт Montserrat */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

/* Ваш кастомний шрифт */
@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

/* Класи для шрифтів */
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
.font-kyivBlack2 {
  font-family: 'KyivType Titling Black2', sans-serif;
}

</style>