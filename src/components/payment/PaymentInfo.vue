<template>
    <div class="payment-info">
      <div class="payment-options">
        <div
          v-for="(option, idx) in paymentOptions"
          :key="idx"
          class="payment-option"
        >
          <input
            type="radio"
            :id="`payment-${idx}`"
            :value="option"
            v-model="localData.paymentMethod"
            class="radio-input"
            @change="updateData"
          />
          <label :for="`payment-${idx}`" class="payment-label">
            {{ option }}
          </label>
        </div>
        <span v-if="errors.paymentOption" class="error">{{ errors.paymentOption }}</span>
      </div>
      <button
        :disabled="!localData.paymentMethod"
        @click="validateAndProceed"
        class="next-button"
      >
        Далі
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
      },
      validateAndProceed() {
        if (this.localData.paymentMethod) {
          this.updateData();
          // Для кроку оплати логіка валідації може бути виконана тут,
          // або викликана через батьківський компонент
          this.$emit("validate");
        } else {
          // Якщо не обрано спосіб оплати, можна додати повідомлення про помилку
          this.$emit("update-errors", { paymentOption: "Оберіть спосіб оплати" });
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .payment-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .payment-option {
    display: flex;
    align-items: center;
    margin-top: 10px;
  }
  .radio-input {
    display: none;
  }
  .radio-input + .payment-label::before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 10px;
    border: 2px solid #9d9292;
    border-radius: 50%;
    background-color: transparent;
  }
  .radio-input:checked + .payment-label::before {
    background-color: #6b1f1f;
  }
  .payment-label {
    color: #040404;
    font-weight: bold;
    cursor: pointer;
  }
  .error {
    color: red;
    font-size: 12px;
  }
  .next-button {
    padding: 10px 20px;
    background-color: #6b1f1f;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 10px;
  }
  </style>
  