<template>
    <div class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button class="close-button" @click="$emit('close')">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="user-form">
            <div class="form-group">
              <label for="first_name">Ім'я:</label>
              <input
                id="first_name"
                v-model="form.first_name"
                type="text"
                required
                placeholder="Введіть ім'я"
              />
            </div>
            <div class="form-group">
              <label for="second_name">По‑батькові:</label>
              <input
                id="second_name"
                v-model="form.second_name"
                type="text"
                required
                placeholder="Введіть по‑батькові"
              />
            </div>
            <div class="form-group">
              <label for="last_name">Прізвище:</label>
              <input
                id="last_name"
                v-model="form.last_name"
                type="text"
                required
                placeholder="Введіть прізвище"
              />
            </div>
            <div class="form-group">
              <label for="email">Email:</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                placeholder="Введіть email"
              />
            </div>
            <div class="form-group">
              <label for="role">Роль:</label>
              <select id="role" v-model="form.role" required>
                <option disabled value="">Оберіть роль</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="superadmin">Superadmin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div class="form-group">
              <label for="phone_number">Телефон:</label>
              <input
                id="phone_number"
                v-model="form.phone_number"
                type="text"
                required
                placeholder="Введіть телефон"
              />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Створити</button>
              <button type="button" class="btn-secondary" @click="$emit('close')">
                Відміна
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UserModal',
    props: {
      title: {
        type: String,
        default: 'Додати користувача'
      },
      initialForm: {
        type: Object,
        default: () => ({
          first_name: "",
          second_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          role: ""
        })
      }
    },
    data() {
      return {
        form: { ...this.initialForm }
      };
    },
    methods: {
      handleSubmit() {
        console.log("Дані форми в модалці:", this.form);
        // Використовуємо унікальну подію, щоб не плутати з нативною submit-подією
        this.$emit('userSubmit', this.form);
      }
    }
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap');
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-dialog {
    background-color: #FFF7F6;
    border-radius: 10px;
    width: 400px;
    max-width: 90%;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    animation: fadeIn 0.3s ease-out;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  
  .modal-header h2 {
    font-family: Montserrat, sans-serif;
    font-weight: bold;
    font-size: 20px;
    margin: 0;
  }
  
  .close-button {
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
  
  .user-form .form-group {
    margin-bottom: 15px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  
  .btn-primary {
    background-color: #6B1F1F;
    border: none;
    padding: 16px 20px;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    font-family: Montserrat, sans-serif;
  }
  
  .btn-secondary {
    background-color: #aaa;
    border: none;
    padding: 8px 16px;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    font-family: Montserrat, sans-serif;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>
  