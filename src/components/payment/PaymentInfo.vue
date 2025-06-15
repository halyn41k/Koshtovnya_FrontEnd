<template>
  <div class="payment-info montserrat">
    <div class="flex flex-col gap-2.5">
      <!-- Заголовок -->
      <label class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
        Спосіб оплати:
      </label>

      <div
        v-for="(option, idx) in paymentOptions"
        :key="idx"
        class="flex items-center"
      >
        <input
          type="radio"
          :id="`payment-${idx}`"
          :value="option"
          v-model="localData.paymentMethod"
          @change="updateData"
          class="peer sr-only"
        />
        <label
          :for="`payment-${idx}`"
          class="relative pl-6 text-[14px] font-medium text-gray-800 dark:text-gray-100 cursor-pointer
                 before:content-[''] before:absolute before:left-0 before:top-1/2
                 before:-translate-y-1/2 before:w-3 before:h-3 before:border-2
                 before:border-gray-400 dark:before:border-gray-300 before:rounded-full
                 peer-checked:before:bg-[#6b1f1f] peer-checked:before:border-[#6b1f1f]
                 transition-colors duration-200"
        >
          {{ option }}
        </label>
      </div>

      <span
        v-if="errors.paymentMethod"
        class="text-red-500 dark:text-red-300 text-xs montserrat"
      >
        {{ errors.paymentMethod }}
      </span>
    </div>
    <!-- Кнопка тепер прибрана: батько керує кнопкою «Завершити» для останнього кроку -->
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
      paymentOptions: ["Післяоплата", "Оплата картою"],
    };
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
      this.$emit("update:modelValue", this.localData);
      // очищаємо помилку при виборі
      if (this.localData.paymentMethod && this.errors.paymentMethod) {
        this.$emit("clear-error", "paymentMethod");
      }
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
