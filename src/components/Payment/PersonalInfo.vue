<template>
  <div class="personal-info">
    <div class="flex flex-col gap-4 w-[200px]">
      <div v-for="(field, key) in fields" :key="key" class="flex flex-col gap-1">
        <label :for="key" class="text-sm text-gray-700 font-medium">
          {{ getLabel(key) }}
        </label>
        <input
          :id="key"
          :type="field.type"
          v-model="localData[key]"
          :placeholder="field.placeholder"
          @input="updateData"
          class="border border-gray-400 p-2 rounded text-black text-[14px] w-full montserrat"
        />
        <span v-if="errors[key]" class="text-red-500 text-xs">
          {{ errors[key] }}
        </span>
      </div>
    </div>
  </div>
</template>


<script>
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
        lastName: { type: 'text', placeholder: 'Введіть прізвище' },
        secondName: { type: 'text', placeholder: 'Введіть по батькові' },
        phone:      { type: 'tel',  placeholder: 'Введдіть номер телефону' },
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
  getLabel(key) {
    const labels = {
      firstName: "Ім'я",
      lastName: "Прізвище",
      secondName: "По батькові",
      phone: "Номер телефону",
    };
    return labels[key] || key;
  },
},

};
</script>

<style scoped>
/* Імпортуємо Montserrat Medium */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap');

/* Применяємо до полей */
.montserrat {
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
}
</style>
