<template>
  <div class="flex flex-col relative w-screen overflow-x-hidden pt-[200px] pb-[100px] font-montserrat">
    <!-- Фон -->
    <div class="absolute inset-0 bg-[url('@/assets/logins.png')] bg-cover bg-center -z-10"></div>

    <!-- Заголовок з лініями -->
    <header class="relative z-10 flex items-center justify-center mb-10 w-full">
      <div class="hidden md:flex flex-1 h-[2px] bg-gray-300 dark:bg-gray-600"></div>
      <h1 class="px-4 title-kyiv dark:text-white">
        {{ $t('authorization.changePassword.title') }}
      </h1>
      <div class="hidden md:flex flex-1 h-[1px] bg-gray-300 dark:bg-gray-600"></div>
    </header>

    <!-- Контейнер -->
    <main class="relative z-20 flex flex-col items-center justify-center w-full md:max-w-xl mx-auto px-6 py-8
                 bg-white/90 dark:bg-[#1f2a3a]/90 backdrop-blur-md border border-gray-200 dark:border-gray-700
                 rounded-2xl shadow-md transition-all duration-300">
      <form @submit.prevent="submitPasswordChange" class="w-full space-y-6">

        <!-- Поточний пароль -->
        <div class="flex flex-col">
          <label for="currentPassword" class="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            {{ $t('authorization.changePassword.labels.current') }}
          </label>
          <div class="relative">
            <input
              id="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              v-model="currentPassword"
              :placeholder="$t('authorization.changePassword.placeholders.current')"
              required
              class="w-full h-12 rounded-lg border px-4 placeholder-gray-400
                     border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-gray-800 dark:text-white
                     hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
            />
            <button type="button" @click="toggleCurrentPasswordVisibility"
              class="absolute inset-y-0 right-4 flex items-center justify-center focus:outline-none">
              <img :src="showCurrentPassword ? eyeClosedIcon : eyeOpenIcon" alt="Toggle password visibility" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Новий пароль -->
        <div class="flex flex-col">
          <label for="newPassword" class="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            {{ $t('authorization.changePassword.labels.new') }}
          </label>
          <div class="relative">
            <input
              id="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              v-model="newPassword"
              :placeholder="$t('authorization.changePassword.placeholders.new')"
              required
              class="w-full h-12 rounded-lg border px-4 placeholder-gray-400
                     border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-gray-800 dark:text-white
                     hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
            />
            <button type="button" @click="toggleNewPasswordVisibility"
              class="absolute inset-y-0 right-4 flex items-center justify-center focus:outline-none">
              <img :src="showNewPassword ? eyeClosedIcon : eyeOpenIcon" alt="Toggle password visibility" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Підтвердження пароля -->
        <div class="flex flex-col">
          <label for="confirmPassword" class="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            {{ $t('authorization.changePassword.labels.confirm') }}
          </label>
          <div class="relative">
            <input
              id="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              :placeholder="$t('authorization.changePassword.placeholders.confirm')"
              required
              class="w-full h-12 rounded-lg border px-4 placeholder-gray-400
                     border-gray-300 dark:border-gray-600 dark:bg-gray-900 text-gray-800 dark:text-white
                     hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
            />
            <button type="button" @click="toggleConfirmPasswordVisibility"
              class="absolute inset-y-0 right-4 flex items-center justify-center focus:outline-none">
              <img :src="showConfirmPassword ? eyeClosedIcon : eyeOpenIcon" alt="Toggle password visibility" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Кнопка -->
        <div class="flex justify-center">
          <button
            type="submit"
            class="w-full h-12 flex items-center justify-center bg-[#6B1F1F] hover:bg-[#A01212] active:bg-[#A01212]
                   text-white text-base font-semibold rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            {{ $t('authorization.changePassword.button') }}
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
  name: 'PasswordChangeComponent',
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      eyeOpenIcon,
      eyeClosedIcon,
    };
  },
  methods: {
    async submitPasswordChange() {
      if (this.newPassword !== this.confirmPassword) {
        alert('Новий пароль і підтвердження не збігаються.');
        return;
      }
      if (this.newPassword === this.currentPassword) {
        alert('Поточний та новий пароль збігаються.');
        return;
      }
      try {
        const response = await api.changePassword({
          current_password: this.currentPassword,
          new_password: this.newPassword,
          new_password_confirmation: this.confirmPassword
        });
        if (response) {
          alert('Пароль успішно змінено!');
          this.$router.push('/account');
        } else {
          let message = 'Спробуйте ще раз.';
          try {
            const errorData = await response.json();
            message = errorData.message || message;
            if (
              response.status === 400 &&
              message.toLowerCase().includes('поточ')
            ) {
              message = 'Поточний пароль введено не коректно.';
            }
          } catch (e) {
            console.error('Помилка обробки помилки:', e);
            alert("Помилка під час з'єднання з сервером. Спробуйте ще раз.");
            return;
          }
          alert(`Помилка: ${message}`);
        }
      } catch (error) {
        console.error('Помилка при зміні паролю:', error);
        alert("Помилка з'єднання з сервером.");
      }
    },
    toggleCurrentPasswordVisibility() {
      this.showCurrentPassword = !this.showCurrentPassword;
    },
    toggleNewPasswordVisibility() {
      this.showNewPassword = !this.showNewPassword;
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  },
  mounted() {
    document.title = 'Зміна паролю';
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