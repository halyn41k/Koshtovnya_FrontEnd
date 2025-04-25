<template>
  <div class="flex flex-col relative w-screen overflow-x-hidden pt-12">
    <!-- Фон -->
    <div class="absolute inset-0 bg-[url('@/assets/logins.png')] bg-cover bg-center -z-10"></div>

    <!-- Хедер: лінія зверху -->
    <header class="z-10 flex w-full">
      <div class="h-[2px] bg-stroke w-full"></div>
    </header>

    <!-- Заголовок -->
    <h1 class="mt-[180px] text-center font-heading text-h1 text-primary font-black">
      Вхід
    </h1>

    <!-- Основний контейнер форми -->
    <main class="relative z-20 flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-6 py-12 bg-body-4 border border-stroke rounded-lg">
      <form @submit.prevent="submitLogin" class="w-full space-y-6">
        <!-- Email -->
        <div class="flex flex-col">
          <label for="email" class="mb-2 text-label font-base text-semantic-secondary">
            Email:
          </label>
          <div class="relative">
            <input
              id="email"
              type="email"
              v-model="email"
              @input="validateEmail"
              placeholder="Введіть ваш email"
              aria-label="Email"
              required
              class="w-full h-10 rounded-lg border border-semantic-secondary bg-card px-3 text-input focus:outline-none"
            />
            <span v-if="emailError" class="absolute top-full left-0 mt-1 text-error-main text-input">
              {{ emailError }}
            </span>
          </div>
        </div>

        <!-- Password -->
        <div class="flex flex-col">
          <label for="password" class="mb-2 text-label font-base text-semantic-secondary">
            Пароль:
          </label>
          <div class="relative">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              @input="validatePassword"
              placeholder="Введіть пароль"
              aria-label="Пароль"
              required
              class="w-full h-10 rounded-lg border border-semantic-secondary bg-card px-3 text-input focus:outline-none"
            />
            <button type="button" @click="togglePasswordVisibility" class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none">
              <img :src="showPassword ? eyeOpenIcon : eyeClosedIcon" alt="Toggle" class="w-5 h-5 object-contain" />
            </button>
            <span v-if="passwordError" class="absolute top-full left-0 mt-1 text-error-main text-input">
              {{ passwordError }}
            </span>
          </div>
        </div>

        <!-- Посилання реєстрації та відновлення -->
        <p class="text-center text-input text-semantic-secondary">
          Немає облікового запису?
          <router-link to="/registration" class="font-semibold text-primary hover:text-primary-hover">
            Створіть його тут
          </router-link>
          |
          <router-link to="/reset-password" class="font-semibold text-primary hover:text-primary-hover">
            Забули пароль?
          </router-link>
        </p>

        <!-- Кнопка входу -->
        <div class="flex justify-center">
          <button
  type="submit"
  class="bg-[#6B1F1F] hover:bg-[#A01212] active:bg-[#A01212] text-white text-[16px] leading-[140%] px-5 py-2 rounded-[8px] transition-colors duration-200 w-full"
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
