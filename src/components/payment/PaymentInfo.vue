<template>
  <div class="payment-info montserrat">
    <div class="flex flex-col gap-2.5">
      <!-- Заголовок: Спосіб оплати -->
      <div class="flex items-center mb-1">
        <img
          src="@/assets/icons/payment-card.svg"
          alt="Payment Card Icon"
          class="w-5 h-5 mr-2 filter dark:invert"
        />
        <label class="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {{ $t('payment.methodsTitle') }}
        </label>
      </div>

      <!-- Варіанти оплати -->
      <div
        v-for="(option, idx) in paymentOptions"
        :key="idx"
        class="flex items-center"
      >
        <input
          type="radio"
          :id="`payment-${idx}`"
          :value="option.value"
          v-model="localData.paymentMethod"
          @change="updateData"
          class="peer sr-only"
        />
        <label
          :for="`payment-${idx}`"
          class="relative pl-6 text-[14px] font-medium cursor-pointer
                 text-gray-900 dark:text-gray-100
                 before:content-[''] before:absolute before:left-0 before:top-1/2
                 before:-translate-y-1/2 before:w-3 before:h-3 before:border-2
                 before:border-gray-400 before:rounded-full
                 peer-checked:before:bg-[#6b1f1f]"
        >
          {{ option.label }}
        </label>
      </div>

      <!-- Помилки вибору -->
      <span
        v-if="errors.paymentMethod"
        class="text-red-500 text-xs montserrat"
      >
        {{ errors.paymentMethod }}
      </span>
    </div>

    <!-- Кнопка далі -->
    <button
      :disabled="!localData.paymentMethod"
      @click="validateAndProceed"
      class="mt-4 p-2.5 bg-[#6b1f1f] hover:bg-[#A01212] text-white rounded text-[14px]
             font-medium montserrat disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ $t('payment.steps.next') }}
    </button>
  </div>
</template>

<script>
export default {
  name: "PaymentInfo",
  props: {
    modelValue: {
      type: Object,
      required: true,
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localData: { ...this.modelValue },
    };
  },
  computed: {
    paymentOptions() {
      return [
        // Значення строго збігаються з очікуваннями бекенду
        { value: "Післяоплата",     label: this.$t("payment.paymentOptions.postPayment") },
        { value: "Оплата картою",   label: this.$t("payment.paymentOptions.cardPayment") },
      ];
    },
  },
  watch: {
    modelValue: {
      handler(newVal) {
        this.localData = { ...newVal };
      },
      deep: true,
    },
  },
  methods: {
    updateData() {
      // Відправляємо параметр як payment_method у бекенд
      this.$emit("update:modelValue", { ...this.localData, payment_method: this.localData.paymentMethod });
    },
    validateAndProceed() {
      this.updateData();
      this.$emit("validate");
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap');

.montserrat {
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
}
</style>