<template>
  <div class="payment-columns">
    <section class="payment-steps">
      <!-- Step Navigation -->
      <div class="delivery-steps">
        <div v-for="(step, index) in steps" :key="index" class="step" :class="{ completed: index < currentStep }">
          <div class="step-header" @click="goToStep(index)">
            <span class="step-text">{{ index + 1 }}. {{ step }}</span>
          </div>
        </div>
      </div>
      <!-- Step Content -->
      <div class="step-content">
        <component :is="currentComponent"></component>
      </div>
    </section>
  </div>
</template>

<script>
import PersonalInfo from "./PersonalInfo.vue";
import DeliveryInfo from "./DeliveryInfo.vue";
import PaymentInfo from "./PaymentInfo.vue";

export default {
  name: "PaymentSteps",
  computed: {
    currentStep() {
      return this.$store.state.payment.currentStep;
    },
    steps() {
      return ["Особиста інформація", "Поштове відділення", "Оплата"];
    },
    currentComponent() {
      switch (this.currentStep) {
        case 0:
          return PersonalInfo;
        case 1:
          return DeliveryInfo;
        case 2:
          return PaymentInfo;
        default:
          return PersonalInfo;
      }
    }
  },
  methods: {
    goToStep(index) {
      // Optionally allow step navigation if validation passes.
      this.$store.commit("payment/goToStep", index);
    }
  }
}
</script>

<style scoped>
.payment-columns { display: flex; flex-direction: column; }
.delivery-steps { display: flex; gap: 20px; margin-bottom: 20px; }
.step { cursor: pointer; }
.step.completed .step-text { color: #a6a6a6; }
.step-header { display: flex; align-items: center; }
.step-content { border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
</style>
