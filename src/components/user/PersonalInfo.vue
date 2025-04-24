<template>
  <div class="personal-info-card">
    <h2 class="info-title">Ваша особиста інформація</h2>
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
      <label for="email">Email:</label>
      <input id="email" type="email" v-model="localEmail" readonly />
    </div>
    <div class="button-group">
      <button class="update-button" @click="updateUser">Оновити інформацію</button>
      <button class="change-password-button" @click="changePassword">Змінити пароль</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "PersonalInfoCard",
  props: {
    userId: {
      type: [String, Number],
      required: true
    },
    first_name: {
      type: String,
      default: "Ім’я"
    },
    last_name: {
      type: String,
      default: "Прізвище"
    },
    second_name: {
      type: String,
      default: "По батькові"
    },
    email: {
      type: String,
      default: "email@example.com"
    }
  },
  data() {
    return {
      localFirstName: this.first_name,
      localLastName: this.last_name,
      localSecondName: this.second_name,
      localEmail: this.email
    };
  },
  watch: {
    first_name(newVal) {
      this.localFirstName = newVal;
    },
    last_name(newVal) {
      this.localLastName = newVal;
    },
    second_name(newVal) {
      this.localSecondName = newVal;
    },
    email(newVal) {
      this.localEmail = newVal;
    }
  },
  methods: {
    async updateUser() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Ви не авторизовані. Увійдіть у систему.');
        return;
      }
      
      const updateData = {
        first_name: this.localFirstName,
        last_name: this.localLastName,
        second_name: this.localSecondName
      };
      
      try {
        const response = await fetch(`https://koshtovnya.api-dev.bmax-edu.website/api/user/${this.userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });
        if (!response.ok) {
          alert('Помилка оновлення даних');
        } else {
          alert('Дані успішно оновлено');
        }
      } catch (error) {
        console.error(error);
        alert('Сталася помилка');
      }
    },
    changePassword() {
      this.$router.push("/changepassword");
    }
  },
  mounted(){
    document.title = "Ваша особиста інформація";
  }
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
  width: 487px;
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

.update-button, .change-password-button {
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
  background-color: #6b1f1f;
  color: white;
}

.update-button:hover {
  background-color: #A01212;
}

.change-password-button:hover {
  background-color: #a01212;
}
</style>
