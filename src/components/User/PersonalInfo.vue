<template>
  <div class="font-sans p-5 rounded-lg">
    <h2 class="text-2xl font-bold text-gray-800 mb-5">Ваша особиста інформація</h2>

    <div class="mb-5 flex items-center">
      <label for="first_name" class="w-[150px] font-bold mr-3">Ім’я:</label>
      <input
        id="first_name"
        type="text"
        v-model="localFirstName"
        class="w-[487px] h-8 bg-[#EBDBDA] border border-black rounded-lg px-3 text-base"
      />
    </div>

    <div class="mb-5 flex items-center">
      <label for="last_name" class="w-[150px] font-bold mr-3">Прізвище:</label>
      <input
        id="last_name"
        type="text"
        v-model="localLastName"
        class="w-[487px] h-8 bg-[#EBDBDA] border border-black rounded-lg px-3 text-base"
      />
    </div>

    <div class="mb-5 flex items-center">
      <label for="second_name" class="w-[150px] font-bold mr-3">По батькові:</label>
      <input
        id="second_name"
        type="text"
        v-model="localSecondName"
        class="w-[487px] h-8 bg-[#EBDBDA] border border-black rounded-lg px-3 text-base"
      />
    </div>

    <div class="mb-5 flex items-center">
      <label for="email" class="w-[150px] font-bold mr-3">Email:</label>
      <input
        id="email"
        type="email"
        v-model="localEmail"
        readonly
        class="w-[487px] h-8 bg-[#EBDBDA] border border-black rounded-lg px-3 text-base cursor-not-allowed"
      />
    </div>

    <div class="flex gap-5 mt-6">
      <button
        @click="updateUser"
        class="w-[200px] h-[40px] bg-[#6B1F1F] text-white text-base font-medium rounded-lg hover:bg-[#A01212] transition-colors"
      >
        Оновити інформацію
      </button>
      <button
        @click="changePassword"
        class="w-[200px] h-[40px] bg-[#6B1F1F] text-white text-base font-medium rounded-lg hover:bg-[#A01212] transition-colors"
      >
        Змінити пароль
      </button>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: "PersonalInfoCard",
  props: {
    userId: { type: [String, Number], required: true },
    first_name: { type: String, default: "Ім’я" },
    last_name: { type: String, default: "Прізвище" },
    second_name: { type: String, default: "По батькові" },
    email: { type: String, default: "email@example.com" }
  },
  data() {
    return {
      localFirstName: this.first_name,
      localLastName: this.last_name,
      localSecondName: this.second_name,
      localEmail: this.email
    };
  },
  watch: {
    first_name(newVal) { this.localFirstName = newVal },
    last_name(newVal) { this.localLastName = newVal },
    second_name(newVal) { this.localSecondName = newVal },
    email(newVal) { this.localEmail = newVal }
  },
  methods: {
    async updateUser() {
      try {
        await api.updateUser(this.userId, {
          first_name: this.localFirstName,
          last_name: this.localLastName,
          second_name: this.localSecondName
        });
        alert('Дані успішно оновлено');
      } catch (error) {
        console.error(error);
        alert('Помилка оновлення даних');
      }
    },
    changePassword() {
      this.$router.push("/changepassword");
    }
  },
  mounted() {
    document.title = "Ваша особиста інформація";
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
.font-sans { font-family: 'Montserrat', sans-serif; }
</style>
