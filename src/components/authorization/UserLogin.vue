<template>
  <div class="flex flex-col relative w-screen overflow-x-hidden pt-[200px] pb-[100px] font-montserrat">
    <!-- Фон -->
    <div class="absolute inset-0 bg-[url('@/assets/logins.png')] bg-cover bg-center -z-10"></div>

    <!-- Заголовок з лініями -->
    <header class="relative z-10 flex items-center justify-center mb-10 w-full">
      <div class="hidden md:flex flex-1 h-[2px] bg-gray-300"></div>
      <h1 class="px-4 title-kyiv">
        Вхід
      </h1>
      <div class="hidden md:flex flex-1 h-[2px] bg-gray-300"></div>
    </header>

    <!-- Основний контейнер форми -->
    <main
      class="relative z-20 flex flex-col items-center justify-center w-full md:max-w-xl mx-auto px-6 py-8 bg-white bg-opacity-90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md"
    >
      <form @submit.prevent="submitLogin" class="w-full space-y-5">
        <!-- Email -->
        <div class="flex flex-col">
          <label for="email" class="mb-1 text-sm font-medium text-gray-600">
            Email
          </label>
          <div class="relative">
            <input
              id="email"
              type="email"
              v-model="email"
              @input="validateEmail"
              placeholder="Введіть ваш email"
              required
              class="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-800 placeholder-gray-400
                     hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
            />
            <span v-if="emailError" class="absolute top-full left-0 mt-1 text-xs text-red-600">
              {{ emailError }}
            </span>
          </div>
        </div>

        <!-- Password -->
        <div class="flex flex-col">
          <label for="password" class="mb-1 text-sm font-medium text-gray-600">
            Пароль
          </label>
          <div class="relative">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              @input="validatePassword"
              placeholder="Введіть пароль"
              required
              class="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-800 placeholder-gray-400
                     hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
            />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none"
            >
              <img
                :src="showPassword ? eyeClosedIcon : eyeOpenIcon"
                alt="Toggle"
                class="w-5 h-5 object-contain transition-transform duration-200 hover:scale-110"
              />
            </button>
            <span v-if="passwordError" class="absolute top-full left-0 mt-1 text-xs text-red-600">
              {{ passwordError }}
            </span>
          </div>
        </div>

        <!-- Посилання реєстрації та відновлення -->
        <p class="text-center text-xs text-gray-500">
          Немає облікового запису?
          <router-link
            to="/registration"
            class="font-medium text-[#6B1F1F] hover:text-[#A01212] transition-colors duration-200"
          >
            Створіть тут
          </router-link>
          |
          <router-link
            to="/reset-password"
            class="font-medium text-[#6B1F1F] hover:text-[#A01212] transition-colors duration-200"
          >
            Забули пароль?
          </router-link>
        </p>

        <!-- Кнопка входу -->
        <div class="flex justify-center">
          <button
            type="submit"
            class="w-full h-12 flex items-center justify-center bg-[#6B1F1F] hover:bg-[#A01212] active:bg-[#A01212]
                   text-white text-base font-semibold rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Увійти
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
  name: 'LoginComponent',
  data() {
    return {
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      showPassword: false,
      eyeOpenIcon,
      eyeClosedIcon,
    };
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = emailRegex.test(this.email) ? '' : 'Введіть дійсний email.';
    },
    validatePassword() {
      const hasSpaces = /\s/.test(this.password);
      if (this.password.length < 8) {
        this.passwordError = 'Пароль повинен містити мінімум 8 символів.';
      } else if (hasSpaces) {
        this.passwordError = 'Пароль не повинен містити пробілів.';
      } else {
        this.passwordError = '';
      }
    },
    async submitLogin() {
      if (this.emailError || this.passwordError) {
        alert('Виправте помилки у формі.');
        return;
      }
      try {
        const data = await api.login({ email: this.email, password: this.password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Вхід успішний!');
        this.$router.push('/account');
      } catch (error) {
        console.error('Помилка авторизації:', error);
        alert(error.response?.data?.message || 'Сталася помилка. Спробуйте ще раз.');
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
  },
  mounted() {
    document.title = 'Вхід';
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
