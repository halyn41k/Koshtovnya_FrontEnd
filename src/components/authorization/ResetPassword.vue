<template>
  <div class="flex flex-col relative w-screen overflow-x-hidden pt-[200px] pb-[100px] font-montserrat">
    <!-- Фон -->
    <div class="absolute inset-0 bg-[url('@/assets/logins.png')] bg-cover bg-center -z-10"></div>

    <!-- Заголовок з лініями -->
    <header class="relative z-10 flex items-center justify-center mb-10 w-full">
      <div class="hidden md:flex flex-1 h-[2px] bg-gray-300"></div>
      <h1 class="px-4 title-kyiv">{{ $t('authorization.title') }}</h1>
      <div class="hidden md:flex flex-1 h-[2px] bg-gray-300"></div>
    </header>

    <!-- Основний контейнер форми -->
    <main class="relative z-20 flex flex-col items-center justify-center w-full md:max-w-xl mx-auto px-6 py-8 bg-white dark:bg-gray-900 bg-opacity-90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-md">
      <!-- Крок 1 -->
      <form v-if="step === 1" @submit.prevent="sendResetCode" class="w-full space-y-5">
        <div class="flex flex-col">
          <label for="email" class="mb-1 text-sm font-medium text-gray-600">{{ $t('authorization.labels.email') }}</label>
          <input
            id="email"
            type="email"
            v-model="email"
            :placeholder="$t('authorization.inputEmail')"
            required
            class="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-gray-800 placeholder-gray-400
                   hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
          />
        </div>
        <div class="flex justify-center">
          <button type="submit" class="w-full h-12 flex items-center justify-center bg-[#6B1F1F] hover:bg-[#A01212] active:bg-[#A01212] text-white text-base font-semibold rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md">
           {{ $t('authorization.sendCode') }}

          </button>
        </div>
      </form>

      <!-- Крок 2 -->
      <form v-if="step === 2" @submit.prevent="verifyCode" class="w-full space-y-5">
        <div class="flex flex-col">
          <label for="code" class="mb-1 text-sm font-medium text-gray-600">{{ $t('authorization.codeLabel') }}</label>
          <input
            id="code"
            type="text"
            v-model="code"
            maxlength="6"
            :placeholder="$t('authorization.codePlaceholder')"
            required
            class="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-gray-800 placeholder-gray-400
                   hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
          />
        </div>
        <div class="flex justify-center">
          <button type="submit" class="w-full h-12 flex items-center justify-center bg-[#6B1F1F] hover:bg-[#A01212] active:bg-[#A01212] text-white text-base font-semibold rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md">
            {{ $t('authorization.verifyCode') }}
          </button>
        </div>
      </form>

      <!-- Крок 3 -->
      <form v-if="step === 3" @submit.prevent="resetPassword" class="w-full space-y-5">
        <div class="flex flex-col">
          <label for="newPassword" class="mb-1 text-sm font-medium text-gray-600">{{ $t('authorization.newPassword') }}</label>
          <input
            id="newPassword"
            type="password"
            v-model="newPassword"
            :placeholder="$t('authorization.newPasswordPlaceholder')"
            required
            class="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-gray-800 placeholder-gray-400
                   hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
          />
        </div>
        <div class="flex flex-col">
          <label for="confirmPassword" class="mb-1 text-sm font-medium text-gray-600">{{ $t('authorization.confirmPassword') }}</label>
          <input
            id="confirmPassword"
            type="password"
            v-model="confirmPassword"
            :placeholder="$t('authorization.confirmPasswordPlaceholder')"
            required
            class="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-gray-800 placeholder-gray-400
                   hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
          />
        </div>
        <div class="flex justify-center">
          <button type="submit" class="w-full h-12 flex items-center justify-center bg-[#6B1F1F] hover:bg-[#A01212] active:bg-[#A01212] text-white text-base font-semibold rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md">
            {{ $t('authorization.submit') }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script>
import api from '@/services/api';
export default {
  name: 'ResetPasswordComponent',
  data() {
    return {
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
      step: 1,
    };
  },
  methods: {
    async sendResetCode() {
      // Відправка запиту для отримання коду
      await api.sendResetCode(this.email);
      this.step = 2;
    },
    async verifyCode() {
      // Перевірка коду
      const response = await api.verifyResetCode({ email: this.email, code: this.code });
      if (response) this.step = 3;
    },
    async resetPassword() {
      if (this.newPassword !== this.confirmPassword) {
        alert('Паролі не співпадають');
        return;
      }
      await api.resetPassword({
        email: this.email,
        new_password: this.newPassword,
        new_password_confirmation: this.confirmPassword,
      });
      alert('Пароль успішно змінено!');
      this.$router.push('/login');
    },
  },
  mounted() {
    document.title = 'Скидання пароля';
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

.font-montserrat { font-family: 'Montserrat', sans-serif; }
.title-kyiv { font-family: 'KyivType Titling Black2', sans-serif; font-size: 30px; color: #000; }
</style>
