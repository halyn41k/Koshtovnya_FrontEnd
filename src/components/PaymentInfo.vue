<template>
  <div>
    <h2>Оплата</h2>
    <div class="payment-options">
      <div v-for="(option, idx) in paymentOptions" :key="idx" class="payment-option">
        <input type="radio" :id="`payment-${idx}`" :value="option" v-model="selectedPaymentOption" class="radio-input" />
        <label :for="`payment-${idx}`" class="payment-label">{{ option }}</label>
      </div>
      <span v-if="errors.paymentOption" class="error">{{ errors.paymentOption }}</span>
    </div>
    <button :disabled="!selectedPaymentOption" @click="proceed" class="next-button">
      Далі
    </button>
  </div>
</template>

<script>
export default {
  name: "PaymentInfo",
  computed: {
    paymentOptions() {
      return this.$store.state.payment.paymentOptions;
    },
    selectedPaymentOption: {
      get() {
        return this.$store.state.payment.selectedPaymentOption;
      },
      set(value) {
        this.$store.commit("payment/setSelectedPaymentOption", value);
      }
    },
    errors() {
      return this.$store.state.payment.errors || {};
    }
  },
  methods: {
    proceed() {
      // Validate payment option and then move to the next step.
      if (this.selectedPaymentOption) {
        this.$store.commit("payment/completeStep");
      } else {
        this.$store.commit("payment/setErrors", { paymentOption: "Оберіть спосіб оплати" });
      }
    }
  }
}
</script>

<style scoped>
.payment-option { display: flex; align-items: center; margin-bottom: 15px; }
.radio-input { display: none; }
.radio-input + .payment-label::before {
  content: "";
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 10px;
  border: 2px solid #9D9292;
  border-radius: 50%;
  background-color: transparent;
}
.radio-input:checked + .payment-label::before {
  background-color: #6B1F1F;
}
.next-button { padding: 10px 20px; background-color: #6B1F1F; color: #fff; border: none; border-radius: 5px; cursor: pointer; }
.error { color: red; font-size: 12px; }
</style>
