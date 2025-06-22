<template>
  <div class="flex flex-col relative w-screen overflow-x-hidden pt-[200px] pb-[100px] font-montserrat">
    <div class="absolute inset-0 bg-[url('@/assets/logins.png')] bg-cover bg-center -z-10"></div>

    <header class="relative z-10 flex items-center justify-center mb-10 w-full">
      <div class="hidden md:flex flex-1 h-[2px] bg-gray-300 dark:bg-gray-600"></div>
      <h1 class="px-4 title-kyiv dark:text-white">
        {{ $t('authorization.titleLogin') }}
      </h1>
      <div class="hidden md:flex flex-1 h-[2px] bg-gray-300 dark:bg-gray-600"></div>
    </header>

<main class="relative z-20 flex flex-col items-center justify-center w-full md:max-w-xl mx-auto px-6 py-8
             rounded-2xl shadow-md border border-gray-200 dark:border-gray-700
             bg-white/90 dark:bg-[#1f2a3a]/90 backdrop-blur-md">
      <form @submit.prevent="submitLogin" class="w-full space-y-5">
        <!-- Email -->
        <div class="flex flex-col">
          <label for="email" class="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            {{ $t('authorization.emailLabel') }}
          </label>
          <div class="relative">
            <input
              id="email"
              type="email"
              v-model="email"
              @input="validateEmail"
              :placeholder="$t('authorization.emailPlaceholder')"
              required
              class="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                     hover:shadow-md focus:outline-none focus:border-[#6B1F1F] focus:shadow-lg transition-all duration-200"
            />
            <span v-if="emailError" class="absolute top-full left-0 mt-1 text-xs text-red-600 dark:text-red-400">
              {{ $t('authorization.emailInvalid') }}
            </span>
          </div>
        </div>

        <!-- Password -->
        <div class="flex flex-col">
          <label for="password" class="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            {{ $t('authorization.passwordLabel') }}
          </label>
          <div class="relative">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              @input="validatePassword"
              :placeholder="$t('authorization.passwordPlaceholder')"
              required
              class="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
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
                class="w-5 h-5 object-contain transition-transform duration-200 hover:scale-110 dark:invert"
              />
            </button>
            <span v-if="passwordError" class="absolute top-full left-0 mt-1 text-xs text-red-600 dark:text-red-400">
              {{ passwordError }}
            </span>
          </div>
        </div>

        <!-- Links -->
        <p class="text-center text-xs text-gray-500 dark:text-gray-300">
          {{ $t('authorization.noAccount') }}
          <router-link to="/registration" class="font-medium text-[#6B1F1F] hover:text-[#A01212] transition-colors duration-200">
            {{ $t('authorization.createHere') }}
          </router-link>
          |
          <router-link to="/reset-password" class="font-medium text-[#6B1F1F] hover:text-[#A01212] transition-colors duration-200">
            {{ $t('authorization.forgotPassword') }}
          </router-link>
        </p>

        <!-- Buttons -->
        <div class="flex flex-col gap-4 w-full mt-4">
          <button
            type="submit"
            class="w-full h-12 flex items-center justify-center bg-[#6B1F1F] hover:bg-[#A01212] active:bg-[#A01212]
                   text-white text-base font-semibold rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            {{ $t('authorization.loginButton') }}
          </button>

          <p class="text-sm text-gray-500 dark:text-gray-300 text-center">{{ $t('authorization.or') }}</p>

          <button
            type="button"
            @click="redirectToGoogle"
            class="w-full h-12 flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-shadow shadow-sm hover:shadow-md"
          >
            <img src="@/assets/icons/google.svg" alt="Google" class="w-5 h-5 dark:invert" />
            <span class="text-sm font-medium">{{ $t('authorization.googleLogin') }}</span>
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
import bus from '@/eventBus';

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
    redirectToGoogle() {
      window.location.href = "http://koshtovnya.api-dev.bmax-edu.website/auth/google/redirect";
    },
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = emailRegex.test(this.email) ? '' : this.$t('authorization.emailInvalid');
    },
    validatePassword() {
      const hasSpaces = /\s/.test(this.password);
      if (this.password.length < 8) {
        this.passwordError = this.$t('authorization.passwordShort');
      } else if (hasSpaces) {
        this.passwordError = this.$t('authorization.passwordSpace');
      } else {
        this.passwordError = '';
      }
    },
    async submitLogin() {
  if (this.emailError || this.passwordError) {
    alert(this.$t('authorization.formError'));
    return;
  }
  try {
    const data = await api.login({ email: this.email, password: this.password });

    // 🔐 перевірка бану
    if (data?.user?.is_banned) {
      alert(this.$t('authorization.bannedMessage') || 'Ваш акаунт заблоковано.');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    alert(this.$t('authorization.success'));

    this.$router.push('/account');
  } catch (error) {
    console.error('Помилка авторизації:', error);

    const message = error.response?.data?.message?.toLowerCase() || '';

    if (message.includes('banned')) {
      alert(this.$t('authorization.bannedMessage') || 'Ваш акаунт заблоковано.');
    } else {
      alert(error.response?.data?.message || this.$t('authorization.errorFallback'));
    }
  }
},
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
  },
  
  mounted() {
  localStorage.removeItem('token'); // очистка при відкритті логіну
    bus.emit('cart-updated'); 
  document.title = this.$t('authorization.titleLogin');
  const query = new URLSearchParams(window.location.search);
  const token = query.get('token');
  const userJson = query.get('user');

  if (token && userJson) {
    try {
      const user = JSON.parse(decodeURIComponent(userJson));

      if (user?.is_banned) {
        alert(this.$t('authorization.bannedMessage') || 'Ваш акаунт заблоковано.');
        this.$router.replace('/login');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const role = user?.role;
      if (['admin', 'superadmin', 'manager'].includes(role)) {
        this.$router.push('/admin');
      } else {
        this.$router.push('/account');
      }
    } catch (e) {
      console.error('❌ Помилка парсингу user:', e);
      alert(this.$t('authorization.googleError'));
      this.$router.replace('/login');
    }
  }
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

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

.title-kyiv {
  font-family: 'KyivType Titling Black2', sans-serif;
  font-size: 30px;
  color: #000;
}

input[type="password"]::-ms-reveal {
  display: none;
}
</style>
