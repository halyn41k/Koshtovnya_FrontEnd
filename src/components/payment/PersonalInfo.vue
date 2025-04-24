<template>
    <div class="personal-info">
      <div class="input-container">
        <input
          class="input-field"
          v-model="localData.firstName"
          placeholder="Ім'я"
          @input="updateData"
        />
        <span v-if="errors.firstName" class="error">{{ errors.firstName }}</span>
  
        <input
          class="input-field"
          v-model="localData.lastName"
          placeholder="Прізвище"
          @input="updateData"
        />
        <span v-if="errors.lastName" class="error">{{ errors.lastName }}</span>
  
        <input
          class="input-field"
          v-model="localData.secondName"
          placeholder="По батькові"
          @input="updateData"
        />
        <span v-if="errors.secondName" class="error">{{ errors.secondName }}</span>
  
        <input
          class="input-field"
          v-model="localData.phone"
          placeholder="Номер телефону"
          @input="updateData"
        />
        <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "PersonalInfo",
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
    },
  };
  </script>
  
  <style scoped>
  .input-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 200px;
  }
  .input-field {
    border: 1px solid #9d9292;
    padding: 8px;
    color: #6b1f1f;
    font-family: 'Montserrat', sans-serif;
    border-radius: 4px;
  }
  .error {
    color: red;
    font-size: 12px;
  }
  </style>
  