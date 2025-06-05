<template>
    <div class="flex flex-col relative w-screen overflow-x-hidden pt-[200px] pb-[100px] font-montserrat">
      <!-- Фон -->
      <div class="absolute inset-0 bg-[url('@/assets/logins.png')] bg-cover bg-center -z-10"></div>
  
      <!-- Заголовок з лініями -->
      <header class="relative z-10 flex items-center justify-center mb-10 w-full">
        <div class="hidden md:flex flex-1 h-[2px] bg-gray-300"></div>
        {{ $t('authorization.verification.title') }}
        <div class="hidden md:flex flex-1 h-[2px] bg-gray-300"></div>
      </header>
  
      <!-- Основний контейнер форми -->
      <main class="relative z-20 flex flex-col items-center justify-center w-full md:max-w-xl mx-auto px-6 py-8 bg-white dark:bg-gray-900 bg-opacity-90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md">
        <form @submit.prevent="submitVerification" class="w-full space-y-5">
          <!-- Email та Код -->
          <div class="grid grid-cols-1 gap-4">
            <!-- Email -->
            <div class="flex flex-col relative">
              <label for="email" class="mb-1 text-sm font-medium text-gray-600">{{ $t('authorization.verification.labels.email') }}</label>
              <input
                id="email"
                type="email"
                v-model="email"
                @input="validateEmail"
               :placeholder="$t('authorization.verification.placeholders.email')"
                required
                class="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-gray-800 placeholder-gray-400 hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
              />
              <span v-if="emailError" class="absolute top-full left-0 mt-1 text-xs text-red-600 dark:text-gray-100">{{ emailError }}</span>
            </div>
            <!-- Код підтвердження -->
            <div class="flex flex-col relative">
              <label for="code" class="mb-1 text-sm font-medium text-gray-600">{{ $t('authorization.verification.labels.code') }}</label>
              <input
                id="code"
                type="text"
                maxlength="6"
                v-model="code"
                @input="validateCode"
                :placeholder="$t('authorization.verification.placeholders.code')"
                required
                class="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-gray-800 placeholder-gray-400 hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
              />
              <span v-if="codeError" class="absolute top-full left-0 mt-1 text-xs text-red-600 dark:text-gray-100">{{ codeError }}</span>
            </div>
          </div>
  
          <!-- Дії -->
          <div class="flex justify-between text-sm text-gray-500">
            <router-link to="/registration" class="hover:underline text-[#6B1F1F]">{{ $t('authorization.verification.actions.changeEmail') }}</router-link>
            <button type="button" @click="resendCode" class="hover:underline text-[#6B1F1F]">{{ $t('authorization.verification.actions.resendCode') }}</button>
          </div>
  
          <!-- Кнопка підтвердження -->
          <div class="flex justify-center">
            <button
              type="submit"
              class="w-full h-12 flex items-center justify-center bg-[#6B1F1F] hover:bg-[#A01212] active:bg-[#A01212] text-white text-base font-semibold rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              {{ $t('authorization.verification.actions.submit') }}
            </button>
          </div>
        </form>
      </main>
    </div>
  </template>
  
  <script>
  import api from '@/services/api';
  export default {
    name: 'VerificationComponent',
    data() {
      return {
        email: this.$route.query.email || '',
        code: '',
        emailError: '',
        codeError: '',
      };
    },
    methods: {
      validateEmail() {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.emailError = re.test(this.email) ? '' : 'Введіть дійсний email.';
      },
      validateCode() {
        this.codeError = this.code.trim() ? '' : 'Код не може бути порожнім.';
      },
      async submitVerification() {
        this.validateEmail();
        this.validateCode();
        if (this.emailError || this.codeError) return;
        try {
          await api.verifyAccount({ email: this.email, code: this.code });
          alert('Акаунт успішно підтверджено!');
          this.$router.push('/login');
        } catch (err) {
          console.error('Помилка верифікації:', err);
          alert('Помилка підтвердження. Спробуйте ще раз.');
        }
      },
      async resendCode() {
        if (!this.email) { this.emailError = 'Введіть email.'; return; }
        try {
          await api.resendVerificationCode({ email: this.email });
          alert('Код надіслано ще раз.');
        } catch (err) {
          console.error('Помилка повторної відправки:', err);
          alert('Не вдалося надіслати код.');
        }
      }
    },
    mounted() {
      document.title = 'Підтвердження акаунту';
    }
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
  
  .font-montserrat { font-family: 'Montserrat', sans-serif; }
  .title-kyiv { font-family: 'KyivType Titling Black2', sans-serif; font-size: 30px; color: #000; }
  </style>