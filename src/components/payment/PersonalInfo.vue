<template>
  <div class="personal-info">
    <div
      class="flex flex-col gap-4 w-full max-w-full sm:max-w-[400px] min-w-0"
    >
      <div
        v-for="(field, key) in fields"
        :key="key"
        class="flex flex-col gap-1 min-w-0"
      >
        <label
          :for="key"
          class="text-sm text-gray-700 dark:text-gray-300 font-medium"
        >
          {{ $t(`payment.fields.${key}.label`) }}
        </label>

        <!-- Phone input with icon + digit-only logic -->
        <div v-if="key === 'phone'" class="relative min-w-0">
          <img
            src="@/assets/icons/phone.svg"
            alt="Telephone icon"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 filter dark:invert"
          />
          <input
            id="phone"
            type="text"
            inputmode="numeric"
            maxlength="10"
            v-model="localData.phone"
            @input="onPhoneInput"
            :placeholder="$t(`payment.fields.${key}.placeholder`)"
            class="border border-gray-400 dark:border-gray-600 p-2 pl-10 rounded
                   text-black dark:text-white bg-white dark:bg-gray-800
                   placeholder-gray-500 dark:placeholder-gray-400
                   text-[14px] w-full montserrat focus:outline-none focus:ring-2 focus:ring-red-500 min-w-0"
          />
        </div>

        <!-- Інші поля -->
        <input
          v-else
          :id="key"
          :type="field.type"
          v-model="localData[key]"
          @input="updateData"
          :placeholder="$t(`payment.fields.${key}.placeholder`)"
          class="border border-gray-400 dark:border-gray-600 p-2 rounded
                 text-black dark:text-white bg-white dark:bg-gray-800
                 placeholder-gray-500 dark:placeholder-gray-400
                 text-[14px] w-full montserrat focus:outline-none focus:ring-2 focus:ring-red-500 min-w-0"
        />

        <span
          v-if="errors[key]"
          class="text-red-500 dark:text-gray-100 text-xs"
        >
          {{ errors[key] }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  name: 'PersonalInfo',
  props: {
    modelValue: { type: Object, required: true },
    errors:     { type: Object, default: () => ({}) },
  },
  data() {
    return {
      localData: { ...this.modelValue },
      fields: {
        firstName:  { type: 'text', placeholder: "Введіть ім'я" },
        lastName:   { type: 'text', placeholder: 'Введіть прізвище' },
        secondName: { type: 'text', placeholder: 'Введіть по батькові' },
        phone:      { type: 'tel',  placeholder: 'Введіть номер телефону' },
      },
    };
  },
  watch: {
    modelValue: {
      handler(val) { this.localData = { ...val }; },
      deep: true,
    },
  },
  methods: {
    updateData() {
      this.$emit('update:modelValue', this.localData);
    },
    onPhoneInput(event) {
      // Фільтруємо: залишаємо тільки цифри, обмежуємо довжину 10
      let digits = event.target.value.replace(/\D/g, '').slice(0, 10);
      this.localData.phone = digits;
      this.$emit('update:modelValue', this.localData);
    },
  },
};
</script>

<style scoped>
/* Імпортуємо Montserrat Medium */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap');

/* Застосовуємо до полів */
.montserrat {
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
}
</style>
