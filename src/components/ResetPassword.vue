<template>
    <div class="reset-password-container">
      <header class="reset-password-header">
        <div class="header-line"></div>
      </header>
      <h1 class="reset-password-title-container">
        <div class="line"></div>
        <span class="reset-password-title">Скидання пароля</span>
        <div class="line"></div>
      </h1>
  
      <main class="reset-password-main">
        <div class="reset-password-background-image"></div>
        
        <!-- Крок 1: Відправка коду -->
        <div v-if="step === 1">
          <form @submit.prevent="sendResetCode" class="reset-password-form">
            <div class="form-group">
              <label for="email" class="form-label">Email:</label>
              <input type="email" id="email" class="form-input" v-model="email" placeholder="Введіть email" required />
            </div>
            <button type="submit" class="reset-password-button">Надіслати код</button>
          </form>
        </div>
        
        <!-- Крок 2: Перевірка коду -->
        <div v-if="step === 2">
          <form @submit.prevent="verifyCode" class="reset-password-form">
            <div class="form-group">
              <label for="code" class="form-label">Код підтвердження:</label>
              <input type="text" id="code" class="form-input" v-model="code" placeholder="Введіть код" maxlength="6" required />
            </div>
            <button type="submit" class="reset-password-button">Перевірити код</button>
          </form>
        </div>
        
        <!-- Крок 3: Скидання пароля -->
        <div v-if="step === 3">
          <form @submit.prevent="resetPassword" class="reset-password-form">
            <div class="form-group">
              <label for="new_password" class="form-label">Новий пароль:</label>
              <input type="password" id="new_password" class="form-input" v-model="newPassword" placeholder="Введіть новий пароль" required />
            </div>
            <div class="form-group">
              <label for="confirm_password" class="form-label">Підтвердіть пароль:</label>
              <input type="password" id="confirm_password" class="form-input" v-model="confirmPassword" placeholder="Підтвердіть пароль" required />
            </div>
            <button type="submit" class="reset-password-button">Скинути пароль</button>
          </form>
        </div>
      </main>
    </div>
  </template>
  
  <script>
  export default {
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
        await fetch('http://26.235.139.202:8080/api/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email })
        });
        this.step = 2;
      },
      async verifyCode() {
        // Перевірка коду
        const response = await fetch('http://26.235.139.202:8080/api/verify-reset-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, code: this.code })
        });
        if (response.ok) {
          this.step = 3;
        }
      },
      async resetPassword() {
        // Перевірка відповідності паролів
        if (this.newPassword !== this.confirmPassword) {
          alert('Паролі не співпадають');
          return;
        }
        await fetch('http://26.235.139.202:8080/api/reset-password', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.email,
            new_password: this.newPassword,
            new_password_confirmation: this.confirmPassword
          })
        });
        alert('Пароль успішно змінено!');
        this.$router.push('/login');
      }
    }
  };
  </script>
  
  <style scoped>
  .reset-password-container {
    display: flex;
    flex-direction: column;
    position: relative;
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  .reset-password-header {
    z-index: 10;
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-end;
    padding: 63px 80px 0;
  }
  
  .header-line {
    width: 100%;
    height: 2px;
    background-color: grey;
  }
  
  .reset-password-title-container {
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
  
  .reset-password-title {
    color: #333;
    font-family: 'KyivType Titling', sans-serif;
    font-weight: 900;
    text-shadow: 0 4px 4px rgba(99, 2, 2, 0.22);
    letter-spacing: -2px;
    text-align: center;
    margin-top: 120px;
    font-size: 30px;
    margin-bottom: 0;
  }
  
  .reset-password-main {
    background-color: rgba(255, 247, 246, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 96px 80px;
    border: 1px solid rgba(0, 0, 0, 0.5);
    position: relative;
    z-index: 2;
    width: 100%;
    box-sizing: border-box;
  }
  
  .reset-password-background-image {
    background-image: url('@/assets/logins.png');
    background-size: cover;
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  
  .reset-password-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 800px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 20px;
  }
  
  .form-label {
    font: 400 18px/1.3 Merriweather, sans-serif;
    color: #000;
    margin-bottom: 5px;
  }
  
  .form-input {
    border-radius: 8px;
    border: 1px solid #000;
    background-color: #E6D7D7;
    height: 35px;
    padding: 0 10px;
    font-size: 18px;
    transition: background-color 0.3s ease;
  }
  
  .form-input:focus {
    background-color: #E6D7D7;
    outline: none;
  }
  
  .reset-password-button {
    background-color: #6b1f1f;
    border-radius: 8px;
    border: none;
    color: white;
    min-height: 50px;
    width: 290px;
    max-width: 100%;
    padding: 0 20px;
    font: 400 18px/1.3 Merriweather, sans-serif;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 10px;
  }
  
  .reset-password-button:hover {
    background-color: #a01212;
  }
  </style>
  