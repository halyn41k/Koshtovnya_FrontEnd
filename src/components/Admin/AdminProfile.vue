<template>
    <div class="personal-info-card">
      <h2 class="info-title">Профіль адміністратора</h2>
  
      <div class="info-field">
        <label for="first_name">Ім’я:</label>
        <input id="first_name" type="text" v-model="localFirstName" />
      </div>
  
      <div class="info-field">
        <label for="last_name">Прізвище:</label>
        <input id="last_name" type="text" v-model="localLastName" />
      </div>
  
      <div class="info-field">
        <label for="second_name">По батькові:</label>
        <input id="second_name" type="text" v-model="localSecondName" />
      </div>
  
      <div class="info-field">
        <label for="role">Роль:</label>
        <input id="role" type="text" v-model="localRole" readonly />
      </div>
  
      <div class="info-field">
        <label for="email">Email:</label>
        <input id="email" type="email" v-model="localEmail" readonly />
      </div>
  
      <div class="button-group">
        <button class="update-button" @click="updateAdmin">
          Оновити інформацію
        </button>
        <button class="change-password-button" @click="changePassword">
          Змінити пароль
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "AdminProfileCard",
    data() {
      return {
        localFirstName: "",
        localLastName: "",
        localSecondName: "",
        localRole: "",
        localEmail: "",
      };
    },
    methods: {
      async fetchAdminProfile() {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Ви не авторизовані. Увійдіть у систему.");
          return;
        }
        try {
          const res = await fetch(
            "https://koshtovnya.api-dev.bmax-edu.website/api/admin/profile",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
          const json = await res.json();
          // API повертає { message: "...", user: { ... } }
          const profile = json.user;
          if (!profile) {
            console.error("Немає поля user у відповіді:", json);
            throw new Error("Невірний формат відповіді");
          }
  
          this.localFirstName  = profile.first_name  || "";
          this.localLastName   = profile.last_name   || "";
          this.localSecondName = profile.second_name || "";
          this.localRole       = profile.role        || "";
          this.localEmail      = profile.email       || "";
        } catch (err) {
          console.error("Не вдалося завантажити профіль адміна:", err);
          // Якщо API не повернув роль, можна взяти її з localStorage:
          const stored = localStorage.getItem("user");
          if (stored) {
            try {
              const u = JSON.parse(stored);
              this.localRole = u.role || "";
            } catch (error) {
                console.error(error);
                }
          }
          alert("Помилка при завантаженні профілю.");
        }
      },
  
      async updateAdmin() {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Ви не авторизовані. Увійдіть у систему.");
          return;
        }
        const payload = {
          first_name:  this.localFirstName,
          last_name:   this.localLastName,
          second_name: this.localSecondName,
          // роль ми не відправляємо — вона readonly
        };
        try {
          const res = await fetch(
            "https://koshtovnya.api-dev.bmax-edu.website/api/admin/profile",
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            }
          );
          if (!res.ok) {
            const errText = await res.text();
            console.error("Update error:", errText);
            alert("Помилка оновлення даних.");
          } else {
            alert("Дані успішно оновлено.");
            // Підтягуємо ще раз, щоб оновити форму
            this.fetchAdminProfile();
          }
        } catch (err) {
          console.error("Сталася помилка при оновленні:", err);
          alert("Сталася помилка при оновленні.");
        }
      },
  
      changePassword() {
        // Перехід на вашу сторінку зміни паролю
        this.$router.push({ name: "ChangePassword" });
      },
    },
  
    mounted() {
      document.title = "Профіль адміністратора";
      this.fetchAdminProfile();
    },
  };
  </script>
  
  <style scoped>
  .personal-info-card {
    padding: 20px;
    border-radius: 8px;
    font-family: 'Merriweather', sans-serif;
  }
  
  .info-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
    text-align: left;
  }
  
  .info-field {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
  }
  
  .info-field label {
    width: 150px;
    font-weight: bold;
    margin-right: 10px;
    text-align: left;
  }
  
  .info-field input {
    flex: 1;
    height: 30px;
    background-color: #EBDBDA;
    border: 1px solid #000;
    border-radius: 8px;
    padding: 0 10px;
    font-size: 16px;
  }
  
  .button-group {
    display: flex;
    gap: 20px;
    margin-top: 20px;
  }
  
  .update-button,
  .change-password-button {
    width: 200px;
    height: 40px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Merriweather', sans-serif;
  }
  
  .update-button {
    background-color: #6B1F1F;
    color: white;
  }
  
  .change-password-button {
    background-color: #6B1F1F;
    color: white;
  }
  
  .update-button:hover,
  .change-password-button:hover {
    background-color: #A01212;
  }
  </style>
  