<template>
  <div class="font-sans p-5 rounded-lg">
    <h2 class="text-2xl font-bold text-gray-800 mb-5">Ваша особиста інформація</h2>

    <div class="mb-5 flex flex-col sm:flex-row sm:items-center">
  <label for="first_name" class="w-full sm:w-[150px] font-bold mb-2 sm:mb-0 sm:mr-3">Ім’я:</label>
  <input
    id="first_name"
    type="text"
    v-model="localFirstName"
    class="w-full sm:w-[487px] h-8 bg-[#EBDBDA] border border-black rounded-lg px-3 text-base"
  />
</div>

<div class="mb-5 flex flex-col sm:flex-row sm:items-center">
  <label for="last_name" class="w-full sm:w-[150px] font-bold mb-2 sm:mb-0 sm:mr-3">Прізвище:</label>
  <input
    id="last_name"
    type="text"
    v-model="localLastName"
    class="w-full sm:w-[487px] h-8 bg-[#EBDBDA] border border-black rounded-lg px-3 text-base"
  />
</div>

<div class="mb-5 flex flex-col sm:flex-row sm:items-center">
  <label for="second_name" class="w-full sm:w-[150px] font-bold mb-2 sm:mb-0 sm:mr-3">По батькові:</label>
  <input
    id="second_name"
    type="text"
    v-model="localSecondName"
    class="w-full sm:w-[487px] h-8 bg-[#EBDBDA] border border-black rounded-lg px-3 text-base"
  />
</div>

<div class="mb-5 flex flex-col sm:flex-row sm:items-center">
  <label for="email" class="w-full sm:w-[150px] font-bold mb-2 sm:mb-0 sm:mr-3">Email:</label>
  <input
    id="email"
    type="email"
    v-model="localEmail"
    readonly
    class="w-full sm:w-[487px] h-8 bg-[#EBDBDA] border border-black rounded-lg px-3 text-base cursor-not-allowed"
  />
</div>


    <div class="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-6">
      <div class="relative group">
  <button
    @click="updateUser"
    :disabled="isDisabled"
    class="w-full sm:w-[200px] h-[40px] text-sm sm:text-base font-medium rounded-lg transition-colors
           text-white bg-[#6B1F1F] hover:bg-[#A01212]
           disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
  >
    Оновити інформацію
  </button>

  <!-- Tooltip -->
  <div
    v-if="isDisabled"
    class="absolute top-full left-0 mt-1 w-max max-w-[250px] text-xs text-white bg-gray-800 px-3 py-2 rounded shadow-lg
           opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
  >
    Щоб оновити дані, заповніть всі обов'язкові поля: ім’я, прізвище та по батькові.
  </div>
</div>



  <button
    @click="changePassword"
    class="w-full sm:w-[200px] h-[40px] bg-[#6B1F1F] text-white text-sm sm:text-base font-medium rounded-lg hover:bg-[#A01212] transition-colors"
  >
    Змінити пароль
  </button>

  <router-link
    v-if="isAdminOrManager"
    to="/admin"
    class="w-full sm:w-[240px] h-[40px] border border-[#6B1F1F] text-black text-sm sm:text-base font-semibold rounded-lg flex items-center justify-center hover:bg-[#f9eaea] transition-colors"
  >
    Перейти в {{ role === 'manager' ? 'менеджер-панель' : 'адмін-панель' }}
  </router-link>
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
      localEmail: this.email,
      role: null // зчитується з localStorage
    };
  },
  computed: {
    isAdminOrManager() {
      return this.role === 'superadmin' || this.role === 'manager';
    },
    isDisabled() {
    return (
      !this.localFirstName?.trim() ||
      !this.localLastName?.trim() ||
      !this.localSecondName?.trim()
    );
  }
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
  } catch (error) {
    console.error(error);
  }
},
    changePassword() {
      this.$router.push("/changepassword");
    }
  },
  mounted() {
    document.title = "Ваша особиста інформація";

    // Зчитування ролі з localStorage
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      this.role = user?.role || null;
    } catch (e) {
      console.warn("Не вдалося зчитати роль користувача з localStorage", e);
    }
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
.font-sans { font-family: 'Montserrat', sans-serif; }
</style>
