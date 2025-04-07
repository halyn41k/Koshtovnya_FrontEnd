<template>
  <div class="password-change-container">
    <header class="password-change-header">
      <div class="header-line"></div>
    </header>
    <h1 class="password-change-title-container">
      <div class="line"></div>
      <span class="password-change-title">Зміна паролю</span>
      <div class="line"></div>
    </h1>

    <main class="password-change-main">
      <div class="password-change-background-image"></div>
      <form class="password-change-form" @submit.prevent="submitPasswordChange">
        <div class="form-group">
          <div class="form-labels">
            <label for="currentPassword" class="form-label">Поточний пароль:</label>
            <label for="newPassword" class="form-label">Новий пароль:</label>
            <label for="confirmPassword" class="form-label">Підтвердьте новий пароль:</label>
          </div>
          <div class="form-inputs">
            <div class="password-input-container">
              <input :type="showCurrentPassword ? 'text' : 'password'" id="currentPassword" class="form-input"
                v-model="currentPassword" aria-label="Поточний пароль" placeholder="Введіть ваш поточний пароль"
                required />
              <button type="button" @click="toggleCurrentPasswordVisibility" class="toggle-password-button">
                <span v-html="showCurrentPassword ? eyeOpenIcon : eyeClosedIcon"></span>
              </button>
            </div>
            <div class="password-input-container">
              <input :type="showNewPassword ? 'text' : 'password'" id="newPassword" class="form-input"
                v-model="newPassword" aria-label="Новий пароль" placeholder="Введіть новий пароль" required />
              <button type="button" @click="toggleNewPasswordVisibility" class="toggle-password-button">
                <span v-html="showNewPassword ? eyeOpenIcon : eyeClosedIcon"></span>
              </button>
            </div>
            <div class="password-input-container">
              <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword" class="form-input"
                v-model="confirmPassword" aria-label="Підтвердьте новий пароль" placeholder="Підтвердіть новий пароль"
                required />
              <button type="button" @click="toggleConfirmPasswordVisibility" class="toggle-password-button">
                <span v-html="showConfirmPassword ? eyeOpenIcon : eyeClosedIcon"></span>
              </button>
            </div>
          </div>
        </div>
        <button type="submit" class="password-change-button">
          <span>Змінити пароль</span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/436b738744905f60c6a542e2cd314f5694db20045d36b8991f8dab9a31b316a0?placeholderIfAbsent=true&apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="" class="password-change-icon" />
        </button>
      </form>
    </main>
  </div>
</template>

<script>
export default {
  // Об'єкт data містить дані компонента
  data() {
    return {
      currentPassword: '', // Поточний пароль
      newPassword: '', // Новий пароль
      confirmPassword: '', // Підтвердження нового пароля
      showCurrentPassword: false, // Видимість поточного пароля
      showNewPassword: false, // Видимість нового пароля
      showConfirmPassword: false, // Видимість підтвердження пароля
      // SVG-іконки для кнопок показу/приховування пароля
      eyeOpenIcon: `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5z" stroke="#555" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#555"/>
          </svg>`, // Іконка "око відкрите"
      eyeClosedIcon: `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 2L22 22M12 4.5C7 4.5 2.73 7.61 1 12c1.23 2.9 3.37 5.15 6.13 6.3m5.87-2.8c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5m0 0l6.57 6.57M16.87 16.87c1.9-1.02 3.37-2.77 4.13-4.87-1.73-4.39-6-7.5-11-7.5-1.08 0-2.13.14-3.13.4" stroke="#555" stroke-width="2"/>
          </svg>` // Іконка "око закрите"
    };
  },
  methods: {
    async submitPasswordChange() {
      if (this.newPassword === this.confirmPassword) {
        try {
          const response = await fetch('http://26.235.139.202:8080/api/change-password', {
            method: 'PATCH', // Зміна методу на PATCH
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`, // Токен для авторизації, якщо потрібен
            },
            body: JSON.stringify({
              current_password: this.currentPassword,
              new_password: this.newPassword,
              new_password_confirmation: this.confirmPassword,
            }),
          });


          if (response.ok) {
            const data = await response.json();
            alert('Пароль успішно змінено!');
            this.$router.push('/account'); // Перенаправлення після успішної зміни
          } else {
            const errorData = await response.json();
            alert(`Помилка: ${errorData.message || 'Щось пішло не так.'}`);
          }
        } catch (error) {
          console.error('Помилка при зміні паролю:', error);
          alert('Помилка під час з\'єднання з сервером. Спробуйте ще раз.');
        }
      } else {
        alert('Новий пароль і підтвердження пароля не збігаються.');
      }
    },
    // Метод для переключення видимості поточного пароля
    toggleCurrentPasswordVisibility() {
      this.showCurrentPassword = !this.showCurrentPassword;
    },
    // Метод для переключення видимості нового пароля
    toggleNewPasswordVisibility() {
      this.showNewPassword = !this.showNewPassword;
    },
    // Метод для переключення видимості підтвердження пароля
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
};
</script>

<style scoped>
.password-change-container {
  display: flex;
  flex-direction: column;
  position: relative;
  max-width: 100vw;
  overflow-x: hidden;
}

.password-change-background-image {
  background-image: url('@/assets/logins.png');
  background-size: cover;
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.password-change-header {
  z-index: 10;
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-end;
  padding: 63px 80px 0;
}

.password-change-title-container {
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

.password-change-title {
  color: #333;
  font-family: 'KyivType Titling', sans-serif;
  font-weight: 900;
  text-shadow: 0 4px 4px rgba(99, 2, 2, 0.22);
  letter-spacing: -2px;
  text-align: center;
  margin-top: 150px;
  font-size: 30px;
  margin-bottom: 40px;
}

.password-change-main {
  background-color: rgba(255, 247, 246, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 96px 80px;
  width: 100%;
  max-width: 1640px;
  border: 1px solid rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 2;
}

.password-change-form {
  display: flex;
  width: 100%;
  max-width: 1200px;
  flex-direction: column;
  align-items: center;
}

.form-group {
  display: flex;
  width: 100%;
  gap: 20px;
}

.form-labels {
  display: flex;
  flex-direction: column;
  gap: 30px;
  color: var(--Grays-Black, #000);
  font: 400 18px/1.3 Merriweather, sans-serif;
  flex: 1;
  align-items: flex-end;
  padding-right: 20px;
  text-align: left;
}

.form-inputs {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 2;
}

.form-input {
  border-radius: 8px;
  border: 1px solid var(--Grays-Black, #000);
  background-color: #E6D7D7;
  height: 35px;
  width: 100%;
  font-size: 18px;
  transition: background-color 0.3s ease;
}

.password-input-container {
  position: relative;
}

.toggle-password-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
}

.password-change-button {
  background-color: #6b1f1f;
  border-radius: 8px;
  border: none;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  min-height: 50px;
  width: 290px;
  padding: 0 20px;
  font: 400 18px/1.3 Merriweather, sans-serif;
  transition: background-color 0.3s ease;
}

.password-change-button:hover {
  background-color: #a01212;
}

.password-change-icon {
  margin-left: 10px;
}
</style>