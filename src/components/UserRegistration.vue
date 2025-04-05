<template>
  <div class="registration-container">
    <header class="registration-header">
      <div class="header-line"></div>
    </header>
    <h1 class="registration-title-container">
      <div class="line"></div>
      <span class="registration-title">Реєстрація</span>
      <div class="line"></div>
    </h1>

    <main class="registration-main">
      <div class="registration-background-image"></div>
      <form class="registration-form" @submit.prevent="submitRegistration">
        <div class="form-group">
          <div class="form-labels">
            <label for="first_name" class="form-label">Ім'я:</label>
            <label for="last_name" class="form-label">Прізвище:</label>
            <label for="second_name" class="form-label">По батькові:</label>
            <label for="email" class="form-label">Email:</label>
            <label for="password" class="form-label">Пароль:</label>
          </div>
          <div class="form-inputs">
            <!-- Поле Ім'я -->
            <div class="form-input-container">
              <input
                type="text"
                id="first_name"
                class="form-input"
                v-model="first_name"
                @input="validateName"
                :class="{ 'error-field': nameError }"
                placeholder="Введіть ваше ім'я"
                required
              />
              <transition name="fade">
                <small v-if="nameError" class="error-message">{{ nameError }}</small>
              </transition>
            </div>
            <!-- Поле Прізвище -->
            <div class="form-input-container">
              <input
                type="text"
                id="last_name"
                class="form-input"
                v-model="last_name"
                @input="validateLastName"
                :class="{ 'error-field': lastNameError }"
                placeholder="Введіть ваше прізвище"
                required
              />
              <transition name="fade">
                <small v-if="lastNameError" class="error-message">{{ lastNameError }}</small>
              </transition>
            </div>
            <!-- Поле По батькові -->
            <div class="form-input-container">
              <input
                type="text"
                id="second_name"
                class="form-input"
                v-model="second_name"
                @input="validateSecondName"
                :class="{ 'error-field': secondNameError }"
                placeholder="Введіть ваше по батькові"
                required
              />
              <transition name="fade">
                <small v-if="secondNameError" class="error-message">{{ secondNameError }}</small>
              </transition>
            </div>
            <!-- Поле Email -->
            <div class="form-input-container">
              <input
                type="email"
                id="email"
                class="form-input"
                v-model="email"
                @input="validateEmail"
                :class="{ 'error-field': emailError }"
                placeholder="Введіть ваш email"
                required
              />
              <transition name="fade">
                <small v-if="emailError" class="error-message">{{ emailError }}</small>
              </transition>
            </div>
            <!-- Поле Пароль -->
            <div class="form-input-container">
              <div class="password-input-container">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  class="form-input"
                  v-model="password"
                  @input="validatePassword"
                  :class="{ 'error-field': passwordError }"
                  placeholder="Введіть пароль"
                  required
                />
                <button type="button" @click="togglePasswordVisibility" class="toggle-password-button">
                  <img :src="showPassword ? eyeOpenIcon : eyeClosedIcon" alt="toggle password visibility" />
                </button>
              </div>
              <transition name="fade">
                <small v-if="passwordError" class="error-message">{{ passwordError }}</small>
              </transition>
            </div>
          </div>
        </div>

        <p class="login-prompt">
          Вже маєте обліковий запис?
          <router-link to="/login" class="login-link">Увійти</router-link>
        </p>

        <button type="submit" class="registration-button">
          <span>Зареєструватися</span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/436b738744905f60c6a542e2cd314f5694db20045d36b8991f8dab9a31b316a0?placeholderIfAbsent=true&apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt=""
            class="login-icon"
          />
        </button>
      </form>
    </main>
  </div>
</template>

<script>
import eyeOpenIcon from "@/assets/eye-hide-svgrepo-com.svg";
import eyeClosedIcon from "@/assets/eye-1-svgrepo-com.svg";

export default {
  name: "Registration",
  data() {
    return {
      first_name: "",
      last_name: "",
      second_name: "",
      email: "",
      password: "",
      nameError: "",
      lastNameError: "",
      secondNameError: "",
      emailError: "",
      passwordError: "",
      showPassword: false,
      eyeOpenIcon,
      eyeClosedIcon,
    };
  },
  methods: {
    validateName() {
      if (!this.first_name.trim()) {
        this.nameError = "Ім'я не може бути порожнім.";
      } else if (/\d/.test(this.first_name)) {
        this.nameError = "Ім'я не може містити цифри.";
      } else {
        this.nameError = "";
      }
    },
    validateLastName() {
      if (!this.last_name.trim()) {
        this.lastNameError = "Прізвище не може бути порожнім.";
      } else if (/\d/.test(this.last_name)) {
        this.lastNameError = "Прізвище не може містити цифри.";
      } else {
        this.lastNameError = "";
      }
    },
    validateSecondName() {
      if (!this.second_name.trim()) {
        this.secondNameError = "По батькові не може бути порожнім.";
      } else if (/\d/.test(this.second_name)) {
        this.secondNameError = "По батькові не може містити цифри.";
      } else {
        this.secondNameError = "";
      }
    },
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = emailRegex.test(this.email)
        ? ""
        : "Введіть дійсний email.";
    },
    validatePassword() {
      const hasSpaces = /\s/.test(this.password);
      if (this.password.length < 8) {
        this.passwordError = "Пароль повинен містити щонайменше 8 символів.";
      } else if (hasSpaces) {
        this.passwordError = "Пароль не повинен містити пробілів.";
      } else {
        this.passwordError = "";
      }
    },
    async submitRegistration() {
      // Викликаємо валідацію для всіх полів
      this.validateName();
      this.validateLastName();
      this.validateSecondName();
      this.validateEmail();
      this.validatePassword();

      if (
        this.nameError ||
        this.lastNameError ||
        this.secondNameError ||
        this.emailError ||
        this.passwordError
      ) {
        console.log("Є помилки валідації.");
        alert("Будь ласка, виправте помилки.");
        return;
      }

      try {
        console.log("Відправка запиту на сервер...");
        const response = await fetch("http://26.235.139.202:8080/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: this.first_name,
            last_name: this.last_name,
            second_name: this.second_name,
            email: this.email,
            password: this.password,
          }),
        });

        const data = await response.json();
        console.log("Відповідь API:", data);

        if (!response.ok) {
          throw new Error(data.message || "Помилка реєстрації.");
        }

        // Перенаправлення на сторінку верифікації
        this.$router.push({
          name: "Verify",
          query: { email: this.email }
        });
      } catch (error) {
        console.error("Помилка реєстрації:", error);
        alert(`Помилка реєстрації: ${error.message}`);
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  }
};
</script>

<style scoped>
/* Загальні стилі контейнера та фону */
.registration-container {
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 100vw;
  overflow-x: hidden;
}

.registration-background-image {
  background-image: url('@/assets/logins.png');
  background-size: cover;
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

/* Стилі для заголовку реєстрації */
.registration-header {
  z-index: 10;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-end;
  padding: 63px 80px 0;
}

.registration-title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
}

.line {
  flex: 1;
  height: 2px;
  background-color: grey;
  margin: 0 10px;
  margin-top: 120px;
}

.registration-title {
  color: #333;
  font-family: 'KyivType Titling', sans-serif;
  font-weight: 900;
  text-shadow: 0 4px 4px rgba(99, 2, 2, 0.22);
  letter-spacing: -2px;
  text-align: center;
  margin-top: 120px;
  font-size: 30px;
  margin-bottom: 0px;
}

/* Стилі для основного блоку реєстрації */
.registration-main {
  background-color: rgba(255, 247, 246, 0.9);
  display: flex;
  width: 1440px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96px 80px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 2;
}

.registration-form {
  display: flex;
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
  gap: 40px;
  flex-direction: column;
  color: var(--Grays-Black, #000);
  white-space: nowrap;
  margin: auto 0;
  padding: 0 1px 6px;
  font: 400 18px/1.3 Merriweather, sans-serif;
  align-items: baseline;
}

/* Стилі для інпутів та їх контейнерів */
.form-input-container {
  position: relative;
  margin-bottom: 1.5rem;
  width: 800px;
}

.form-input {
  border-radius: 8px;
  border: 1px solid var(--Grays-Black, #000);
  background-color: #E6D7D7;
  display: flex;
  height: 35px;
  width: 100%;
  gap: 10px;
  font-size: 18px;
  margin-bottom: 20px;
  transition: background-color 0.3s ease;
  padding: 0 10px;
}

.form-input:focus {
  background-color: #E6D7D7;
  outline: none;
}

.form-input:not(:placeholder-shown) {
  background-color: #E6D7D7;
}

/* Підсвічування полів з помилками */
.error-field {
  border-color: red !important;
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

/* Стилі для контейнера паролю */
.password-input-container {
  position: relative;
  width: 900px;
}

.toggle-password-button {
  position: absolute;
  right: 100px;
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
  height: 30px;
}

.toggle-password-button img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* Стилі для повідомлень про помилки */
.error-message {
  color: red;
  font-size: 0.85rem;
  margin-top: 4px;
  position: absolute;
  top: 100%;
  left: 0;
}

/* Анімація для появи/зникання повідомлень */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Стилі для підказки входу */
.login-prompt {
  color: var(--Schemes-On-Error-Container, #852221);
  margin-top: -10px;
  font: 400 20px/1.3 Merriweather, sans-serif;
}
.login-link {
  font-weight: 700;
  color: #852221;
}

/* Стилі для кнопки реєстрації */
.registration-button {
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
  padding: 0 20px;
  font: 400 18px/1.3 Merriweather, sans-serif;
  transition: background-color 0.3s ease;
}

.registration-button:hover {
  background-color: #a01212;
}

.registration-icon {
  margin-left: 10px;
}
</style>
