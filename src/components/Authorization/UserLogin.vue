<template>
  <div class="login-container">
    <header class="login-header">
      <div class="header-line"></div>
    </header>
    <h1 class="section-title-container">
      <div class="line"></div>
      <span class="section-title">Вхід</span>
      <div class="line"></div>
    </h1>
    <main class="login-main">
      <div class="login-background-image"></div>
      <form class="login-form" @submit.prevent="submitLogin">
        <div class="form-group">
          <div class="form-labels">
            <label for="email" class="form-label">Email:</label>
          </div>
          <div class="form-inputs">
            <input type="email" id="email" class="form-input" v-model="email" @input="validateEmail" aria-label="Email"
              placeholder="Введіть ваш email" required />
            <span v-if="emailError" class="error-message email-error">{{ emailError }}</span>
          </div>
        </div>

        <div class="form-group">
          <div class="form-labels">
            <label for="password" class="form-label">Пароль:</label>
          </div>
          <div class="form-inputs">
            <div class="password-input-container">
              <input :type="showPassword ? 'text' : 'password'" id="password" class="form-input" v-model="password"
                @input="validatePassword" aria-label="Пароль" placeholder="Введіть пароль" required />
              <span v-if="passwordError" class="error-message password-error">{{ passwordError }}</span>
              <button type="button" @click="togglePasswordVisibility" class="toggle-password-button">
                <img :src="showPassword ? eyeOpenIcon : eyeClosedIcon" alt="Toggle Password Visibility" />
              </button>
            </div>
          </div>
        </div>

        <p class="signup-prompt">
          Немає облікового запису?
          <router-link to="/registration" class="signup-link">Створіть його тут</router-link>
          |
          <router-link to="/reset-password" class="signup-link">Забули пароль?</router-link>
        </p>

        <button type="submit" class="login-button">
          <span>Увійти</span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/436b738744905f60c6a542e2cd314f5694db20045d36b8991f8dab9a31b316a0?placeholderIfAbsent=true&apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="" class="login-icon" />
        </button>
      </form>
    </main>
  </div>
</template>

<script>
import eyeOpenIcon from "@/assets/eye-hide-svgrepo-com.svg";
import eyeClosedIcon from "@/assets/eye-1-svgrepo-com.svg";
import api from '../../services/api';


export default {
  data() {
    return {
      email: "",
      password: "",
      emailError: "",
      passwordError: "",
      showPassword: false,
      eyeOpenIcon,
      eyeClosedIcon,
    };
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = emailRegex.test(this.email)
        ? ""
        : "Введіть дійсний email.";
    },
    validatePassword() {
      const hasSpaces = /\s/.test(this.password);
      this.passwordError =
        this.password.length < 8
          ? "Пароль повинен містити мінімум 8 символів."
          : hasSpaces
            ? "Пароль не повинен містити пробілів."
            : "";
    },
    async submitLogin() {
      try {
        if (this.emailError || this.passwordError) {
          alert("Виправте помилки у формі.");
          return;
        }

        // Викликаємо метод login з api.js
        const data = await api.login({ email: this.email, password: this.password });

        // Зберігаємо токен та інформацію про користувача
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert("Вхід успішний!");
        this.$router.push('/account');
      } catch (error) {
        console.error('Помилка авторизації:', error);
        alert(error.response?.data?.message || "Сталася помилка. Спробуйте ще раз.");
      }
    },

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
  },
  mounted() {
    document.title = "Вхід";
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  font-size: 0.8rem;
  position: absolute;
  top: 100%;
  left: 0;
  transform: translateY(5px);
  /* Додаємо невеликий відступ від поля */
  width: 100%;
  /* Робимо ширину рівною ширині поля вводу */
  box-sizing: border-box;
  /* Враховуємо padding */
}

.form-inputs {
  position: relative;
  /* Додаємо relative позицію до контейнера для коректного розташування повідомлень */
}

.error-field input {
  border-color: red;
}

.signup-prompt {
  color: var(--Schemes-On-Error-Container, #852221);
  margin-top: -20px;
  /* Встановлюємо невеликий відступ для коректного розташування */
}

.error-field input {
  border-color: red;
}

.login-container {
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 100vw;
  overflow-x: hidden;
}


.login-background-image {
  background-image: url('@/assets/logins.png');
  background-size: cover;
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.login-header {
  z-index: 10;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-end;
  padding: 63px 80px 0;
}

.section-title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 150px;
}

.line {
  flex: 1;
  height: 2px;
  background-color: grey;
  margin: 0 10px;
}

.section-title {
  color: #333;
  font-family: 'KyivType Titling', sans-serif;
  font-weight: 900;
  text-shadow: 0 4px 4px rgba(99, 2, 2, 0.22);
  letter-spacing: -2px;
  text-align: center;
  font-size: 30px;
  margin: 0 20px;
}

.section-title::before,
.section-title::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 150px;
  height: 1px;
  background-color: black;
}

.section-title::before {
  left: -170px;
}

.section-title::after {
  right: -170px;
}


.login-main {
  background-color: rgba(255, 247, 246, 0.9);
  display: flex;
  margin-top: 0px;
  width: 1440px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96px 80px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 2;
}

.login-form {
  display: flex;
  margin-bottom: -32px;
  width: 1159px;
  max-width: 100%;
  flex-direction: column;
  align-items: center;
}

.form-group {
  align-self: stretch;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
}

.form-labels {
  display: flex;
  gap: 30px;
  flex-direction: column;
  color: var(--Grays-Black, #000);
  white-space: nowrap;
  margin: auto 0;
  padding: 0 1px 6px;
  font: 400 18px/1.3 Merriweather, sans-serif;
  margin-left: 100px;
}

.form-input {
  border-radius: 8px;
  border: 1px solid var(--Grays-Black, #000);
  background-color: #E6D7D7;
  display: flex;
  height: 35px;
  width: 800px;
  gap: 10px;
  font-size: 18px;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;
}

.form-input:focus {
  background-color: #E6D7D7;
  outline: none;
}

.form-input:not(:placeholder-shown) {
  background-color: #E6D7D7;
}

.password-input-container {
  position: relative;
  width: 100%;
}

.toggle-password-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  /* Ширина кнопки */
  height: 30px;
  /* Висота кнопки */
}

.toggle-password-button img {
  width: 20px;
  /* Ширина іконки */
  height: 20px;
  /* Висота іконки */
  object-fit: contain;
  /* Запобігає спотворенню зображення */
}


.signup-prompt {
  color: var(--Schemes-On-Error-Container, #852221);
  margin-top: -10px;
  margin-left: -100px;
  font: 400 20px/1.3 Merriweather, sans-serif;
}

.signup-link {
  font-weight: 700;
  color: #852221;
}

.google-login-button {
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  display: flex;
  margin-top: 43px;
  margin-left: -100px;
  min-height: 50px;
  width: 290px;
  max-width: 100%;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  color: var(--Grays-Black, #111111);
  justify-content: flex-start;
  padding: 10px 0 10px 10px;
  font: 400 18px/1.3 Merriweather, sans-serif;
  transition: background-color 0.3s ease;
}

.google-login-button:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.login-button {
  background-color: #6b1f1f;
  border-radius: 8px;
  border: none;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  min-height: 50px;
  width: 290px;
  max-width: 100%;
  padding: 0 10px;
  font: 400 18px/1.3 Merriweather, sans-serif;
  transition: background-color 0.3s ease;
  margin-left: -100px;
}


.login-button:hover {
  background-color: #a01212;
}
</style>