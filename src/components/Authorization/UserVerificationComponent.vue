<template>
    <div class="verification-container">
        <header class="verification-header">
            <div class="header-line"></div>
        </header>
        <h1 class="verification-title-container">
            <div class="line"></div>
            <span class="verification-title">Підтвердження акаунту</span>
            <div class="line"></div>
        </h1>

        <main class="verification-main">
            <div class="verification-background-image"></div>
            <form class="verification-form" @submit.prevent="submitVerification">
                <div class="form-group">
                    <div class="form-labels">
                        <label for="email" class="form-label">Email:</label>
                        <label for="verification-code" class="form-label">Код:</label>
                    </div>
                    <div class="form-inputs">
                        <div class="form-input-container">
                            <input type="email" id="email" class="form-input" v-model="email" @input="validateEmail"
                                placeholder="Введіть ваш email" required />
                            <transition name="fade">
                                <small v-if="emailError" class="error-message">{{ emailError }}</small>
                            </transition>
                        </div>
                        <div class="form-input-container">
                            <input type="text" id="verification-code" class="form-input" v-model="code"
                                @input="validateCode" placeholder="Введіть код підтвердження" maxlength="6" required />
                            <transition name="fade">
                                <small v-if="codeError" class="error-message">{{ codeError }}</small>
                            </transition>
                        </div>
                    </div>
                </div>

                <div class="action-links">
                    <router-link to="/registration" class="action-link">Змінити email</router-link>
                    <a @click="resendCode" class="action-link">Надіслати код ще раз</a>
                </div>

                <button type="submit" class="verification-button">
                    <span>Підтвердити</span>
                    <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/436b738744905f60c6a542e2cd314f5694db20045d36b8991f8dab9a31b316a0?placeholderIfAbsent=true&apiKey=c3e46d0a629546c7a48302a5db3297d5"
                        alt="" class="verification-icon" />
                </button>
            </form>
        </main>
    </div>
</template>

<script>
export default {
    data() {
        return {
            email: "",
            code: "",
            emailError: "",
            codeError: "",
        };
    },
    created() {
        if (this.$route.query.email) {
            this.email = this.$route.query.email;
        }
    },
    methods: {
        validateEmail() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            this.emailError = emailRegex.test(this.email)
                ? ""
                : "Введіть дійсний email.";
        },
        validateCode() {
            this.codeError = this.code.trim()
                ? ""
                : "Код підтвердження не може бути порожнім.";
        },
        async submitVerification() {
  console.log("Відправка коду підтвердження...");
  this.validateEmail();
  this.validateCode();

  if (this.emailError || this.codeError) {
    alert("Будь ласка, виправте помилки.");
    return;
  }

  try {
    const response = await fetch("http://26.235.139.202:8080/api/verify-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: this.email,
        code: this.code,
      }),
    });

    const data = await response.json();
    console.log("Відповідь API:", data);

    if (!response.ok) {
      throw new Error(data.message || "Неправильний код підтвердження.");
    }

    alert("Реєстрація успішна! Тепер ви можете увійти.");
    this.$router.push({ name: "Login" }); // Перенаправлення на сторінку входу
  } catch (error) {
    console.error("Помилка верифікації:", error);
    alert(`Помилка верифікації: ${error.message}`);
  }
},
        async resendCode() {
            if (!this.email) {
                alert("Будь ласка, введіть email перед повторним надсиланням коду.");
                return;
            }

            try {
                const response = await fetch("http://26.235.139.202:8080/api/resend-code", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: this.email,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Не вдалося надіслати код.");
                }

                alert(data.message || "Новий код підтвердження надіслано на вашу пошту.");
            } catch (error) {
                console.error("Помилка надсилання коду:", error);
                alert(`Помилка надсилання коду: ${error.message}`);
            }
        },
    },
};

</script>

<style scoped>
.verification-container {
    display: flex;
    flex-direction: column;
    position: relative;
    max-width: 100vw;
    overflow-x: hidden;
}

.verification-background-image {
    background-image: url('@/assets/logins.png');
    background-size: cover;
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}

.verification-header {
    z-index: 10;
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-end;
    padding: 63px 80px 0;
}

.verification-title-container {
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

.verification-title {
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

.verification-main {
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

.verification-form {
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

.action-links {
    display: flex;
    gap: 20px;
    margin: 10px 0;
}

.action-link {
    color: #852221;
    font: 400 18px/1.3 Merriweather, sans-serif;
    text-decoration: none;
    cursor: pointer;
}

.action-link:hover {
    text-decoration: underline;
}

.verification-button {
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

.verification-button:hover {
    background-color: #a01212;
}

.error-message {
    color: red;
    font-size: 0.8rem;
    position: absolute;
    top: 100%;
    left: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.form-input-container {
    position: relative;
    margin-bottom: 1.5rem;
}
</style>