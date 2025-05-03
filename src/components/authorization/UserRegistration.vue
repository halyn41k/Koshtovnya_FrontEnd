<template>
  <div class="flex flex-col relative w-screen overflow-x-hidden pt-[200px] pb-[100px] font-montserrat">
    <!-- Фон -->
    <div class="absolute inset-0 bg-[url('@/assets/logins.png')] bg-cover bg-center -z-10"></div>

    <!-- Заголовок з лініями -->
    <header class="relative z-10 flex items-center justify-center mb-10 w-full">
      <div class="hidden md:flex flex-1 h-[2px] bg-gray-300"></div>
      <h1 class="px-4 title-kyiv">Реєстрація</h1>
      <div class="hidden md:flex flex-1 h-[2px] bg-gray-300"></div>
    </header>

    <!-- Основний контейнер форми -->
    <main class="relative z-20 flex flex-col items-center justify-center w-full md:max-w-xl mx-auto px-6 py-8 bg-white bg-opacity-90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md">
      <form @submit.prevent="submitRegistration" class="w-full space-y-5">
        <!-- Ім'я та Прізвище та По батькові -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Ім'я -->
          <div class="flex flex-col">
            <label for="first_name" class="mb-1 text-sm font-medium text-gray-600">Ім'я</label>
            <input
              id="first_name"
              type="text"
              v-model="first_name"
              @input="validateName"
              placeholder="Введіть ім'я"
              required
              :class="['w-full h-12 rounded-lg border px-4 placeholder-gray-400 hover:shadow-md transition-all duration-200',
                        nameError ? 'border-red-600 focus:border-red-600' : 'border-gray-300 focus:border-[#6B1F1F]']"
            />
            <span v-if="nameError" class="mt-1 text-xs text-red-600">{{ nameError }}</span>
          </div>

          <!-- Прізвище -->
          <div class="flex flex-col">
            <label for="last_name" class="mb-1 text-sm font-medium text-gray-600">Прізвище</label>
            <input
              id="last_name"
              type="text"
              v-model="last_name"
              @input="validateLastName"
              placeholder="Введіть прізвище"
              required
              :class="['w-full h-12 rounded-lg border px-4 placeholder-gray-400 hover:shadow-md transition-all duration-200',
                        lastNameError ? 'border-red-600 focus:border-red-600' : 'border-gray-300 focus:border-[#6B1F1F]']"
            />
            <span v-if="lastNameError" class="mt-1 text-xs text-red-600">{{ lastNameError }}</span>
          </div>

          <!-- По батькові -->
          <div class="flex flex-col sm:col-span-2">
            <label for="second_name" class="mb-1 text-sm font-medium text-gray-600">По батькові</label>
            <input
              id="second_name"
              type="text"
              v-model="second_name"
              @input="validateSecondName"
              placeholder="Введіть по батькові"
              required
              :class="['w-full h-12 rounded-lg border px-4 placeholder-gray-400 hover:shadow-md transition-all duration-200',
                        secondNameError ? 'border-red-600 focus:border-red-600' : 'border-gray-300 focus:border-[#6B1F1F]']"
            />
            <span v-if="secondNameError" class="mt-1 text-xs text-red-600">{{ secondNameError }}</span>
          </div>
        </div>

        <!-- Email -->
        <div class="flex flex-col">
          <label for="email" class="mb-1 text-sm font-medium text-gray-600">Email</label>
          <input
            id="email"
            type="email"
            v-model="email"
            @input="validateEmail"
            placeholder="Введіть email"
            required
            :class="['w-full h-12 rounded-lg border px-4 placeholder-gray-400 hover:shadow-md transition-all duration-200',
                      emailError ? 'border-red-600 focus:border-red-600' : 'border-gray-300 focus:border-[#6B1F1F]']"
          />
          <span v-if="emailError" class="mt-1 text-xs text-red-600">{{ emailError }}</span>
        </div>

        <!-- Пароль -->
        <div class="flex flex-col">
          <label for="password" class="mb-1 text-sm font-medium text-gray-600">Пароль</label>
          <div class="relative">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              @input="validatePassword"
              placeholder="Введіть пароль"
              required
              :class="['w-full h-12 rounded-lg border px-4 placeholder-gray-400 hover:shadow-md transition-all duration-200',
                        passwordError ? 'border-red-600 focus:border-red-600' : 'border-gray-300 focus:border-[#6B1F1F]']"
            />
            <button type="button" @click="togglePasswordVisibility" class="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none">
              <img
                :src="showPassword ? eyeClosedIcon : eyeOpenIcon"
                alt="Toggle password"
                class="w-5 h-5 object-contain hover:scale-110 transition-transform duration-200"
              />
            </button>
          </div>
          <span v-if="passwordError" class="mt-1 text-xs text-red-600">{{ passwordError }}</span>
        </div>

        <!-- Посилання на вхід -->
        <p class="text-center text-xs text-gray-500">
          Вже маєте обліковий запис?
          <router-link to="/login" class="font-medium text-[#6B1F1F] hover:text-[#A01212] transition-colors duration-200">Увійти</router-link>
        </p>

        <!-- Кнопка реєстрації -->
        <div class="flex justify-center">
          <button
            type="submit"
            class="w-full h-12 flex items-center justify-center bg-[#6B1F1F] hover:bg-[#A01212] active:bg-[#A01212] text-white text-base font-semibold rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Зареєструватися
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script>
import eyeOpenIcon from "@/assets/eye-hide-svgrepo-com.svg";
import eyeClosedIcon from "@/assets/eye-1-svgrepo-com.svg";
import api from '@/services/api';

export default {
  name: 'RegistrationComponent',
  data() {
    return {
      first_name: '',
      last_name: '',
      second_name: '',
      email: '',
      password: '',
      nameError: '',
      lastNameError: '',
      secondNameError: '',
      emailError: '',
      passwordError: '',
      showPassword: false,
      eyeOpenIcon,
      eyeClosedIcon,
    };
  },
  methods: {
    validateName() {
      this.nameError = !this.first_name.trim()
        ? "Ім'я не може бути порожнім."
        : /\d/.test(this.first_name)
        ? "Ім'я не може містити цифри."
        : '';
    },
    validateLastName() {
      this.lastNameError = !this.last_name.trim()
        ? "Прізвище не може бути порожнім."
        : /\d/.test(this.last_name)
        ? "Прізвище не може містити цифри."
        : '';
    },
    validateSecondName() {
      this.secondNameError = !this.second_name.trim()
        ? "По батькові не може бути порожнім."
        : /\d/.test(this.second_name)
        ? "По батькові не може містити цифри."
        : '';
    },
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = emailRegex.test(this.email) ? '' : 'Введіть дійсний email.';
    },
    validatePassword() {
      const hasSpaces = /\s/.test(this.password);
      if (this.password.length < 8) {
        this.passwordError = 'Пароль повинен містити щонайменше 8 символів.';
      } else if (hasSpaces) {
        this.passwordError = 'Пароль не повинен містити пробілів.';
      } else {
        this.passwordError = '';
      }
    },
    async submitRegistration() {
      this.validateName();
      this.validateLastName();
      this.validateSecondName();
      this.validateEmail();
      this.validatePassword();

      if (this.nameError || this.lastNameError || this.secondNameError || this.emailError || this.passwordError) {
        alert('Будь ласка, виправте помилки.');
        return;
      }

      try {
        const data = await api.register({
          first_name: this.first_name,
          last_name: this.last_name,
          second_name: this.second_name,
          email: this.email,
          password: this.password,
        });
        this.$router.push({ name: 'Verify', query: { email: this.email } });
      } catch (error) {
        console.error('Помилка реєстрації:', error);
        alert(error.response?.data?.message || 'Помилка реєстрації.');
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
  },
  mounted() {
    document.title = 'Реєстрація';
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

.title-kyiv {
  font-family: 'KyivType Titling Black2', sans-serif;
  font-size: 30px;
  color: #000;
}
</style>