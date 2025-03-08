<template>
  <main class="client-list">
    <h1 class="client-list__title">Клієнти</h1>
    <div class="client-list__controls">
      <div class="controls-left">
        <div class="filter">
          <span class="filter__text">Фільтр</span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/4b09284ab367fa70a05a4a4f59e91721443ad7e8e783dfd2c26fb681ebacd30f?apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="Filter icon" class="filter__icon" />
        </div>
        <div class="search-form">
          <input
            class="search-input"
            type="text"
            placeholder="Пошук"
            v-model="searchQuery"
            @input="onSearch" />
        </div>
      </div>
      <div class="controls-right">
        <button class="add-button" @click="openAddModal">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/a27ea7f8a293148ec591123dc3120b25f531a1f574adc4774e1503c5d2772fcb?apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="Add icon" class="add-button__icon" />
          <span class="add-button__text">Додати</span>
        </button>
      </div>
    </div>
    <section class="client-table">
      <header class="client-table__header">
        <div class="client-table__header-left">
          <span class="client-table__header-id">ID</span>
          <span class="client-table__header-name">Ім'я/Email</span>
        </div>
        <div class="client-table__header-right">
          <span class="client-table__header-order">№ Замовлення</span>
          <span class="client-table__header-phone">Телефон</span>
          <span class="client-table__header-date">Додано</span>
          <span class="client-table__header-actions">Керування</span>
        </div>
      </header>
      <ul class="client-list__items">
        <li v-for="(client, index) in clients" :key="client.id" class="client-item">
          <div class="client-item__info">
            <div class="client-item__main">
              <span class="client-item__id">{{ index + 1 }}.</span>
              <div class="client-item__name-email">
                <span class="client-item__name">{{ client.first_name }} {{ client.last_name }}</span>
                <span class="client-item__email">{{ client.email }}</span>
              </div>
            </div>
            <div class="client-item__details">
              <span class="client-item__order">{{ client.order ? client.order : '—' }}</span>
              <span class="client-item__phone">{{ client.phone_number }}</span>
              <span class="client-item__date">{{ client.created_at }}</span>
            </div>
          </div>
          <div class="client-item__actions">
            <button class="action-button action-button--delete" @click="deleteUser(client.id)">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/ba078f16c37c9f7f4a38bffc3903a0783959b7a0f9fc95368926f1c2df1ef2a7?apiKey=c3e46d0a629546c7a48302a5db3297d5"
                alt="Delete icon" class="action-button__icon" />
              <span class="action-button__text">Видалити</span>
            </button>
            <button class="action-button action-button--update" @click="openUpdateModal(client)">
              <img
                src="https://via.placeholder.com/24"
                alt="Update icon" class="action-button__icon" />
              <span class="action-button__text">Оновити</span>
            </button>
          </div>
        </li>
      </ul>
    </section>

    <!-- Модальне вікно для додавання/оновлення користувача -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header">
          <h2>{{ modalTitle }}</h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitForm" class="user-form">
            <div class="form-group">
              <label for="first_name">Ім'я:</label>
              <input id="first_name" v-model="form.first_name" type="text" placeholder="Ім'я" required />
            </div>
            <div class="form-group">
              <label for="second_name">По-батькові:</label>
              <input id="second_name" v-model="form.second_name" type="text" placeholder="По-батькові" required />
            </div>
            <div class="form-group">
              <label for="last_name">Прізвище:</label>
              <input id="last_name" v-model="form.last_name" type="text" placeholder="Прізвище" required />
            </div>
            <div class="form-group">
              <label for="email">Email:</label>
              <input id="email" v-model="form.email" type="email" placeholder="Email" required />
            </div>
            <div class="form-group">
              <label for="phone_number">Телефон:</label>
              <input id="phone_number" v-model="form.phone_number" type="text" placeholder="Телефон" required />
            </div>
            <div class="form-group" v-if="isAddMode">
              <label for="role">Роль:</label>
              <select id="role" v-model="form.role" required>
                <option disabled value="">Оберіть роль</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="superadmin">Superadmin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Зберегти</button>
              <button type="button" class="btn-secondary" @click="closeModal">Відміна</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ClientList',
  data() {
    return {
      clients: [],
      searchQuery: '',
      showModal: false,
      isAddMode: true,
      modalTitle: '',
      form: {
        id: null,
        first_name: '',
        second_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: ''
      }
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get('http://26.235.139.202:8080/api/admin/users', {
          params: { role: 'user' }
        });
        this.clients = response.data;
      } catch (error) {
        console.error('Помилка отримання користувачів:', error);
      }
    },
    async addUser() {
      try {
        const response = await axios.post('http://26.235.139.202:8080/api/admin/user', {
          first_name: this.form.first_name,
          second_name: this.form.second_name,
          last_name: this.form.last_name,
          email: this.form.email,
          phone_number: this.form.phone_number,
          role: this.form.role
        });
        console.log('Користувача додано:', response.data);
        this.fetchUsers();
        this.closeModal();
      } catch (error) {
        console.error('Помилка додавання користувача:', error);
      }
    },
    async updateUser() {
      try {
        const response = await axios.patch(`http://26.235.139.202:8080/api/admin/user/${this.form.id}`, {
          first_name: this.form.first_name,
          second_name: this.form.second_name,
          last_name: this.form.last_name,
          email: this.form.email,
          phone_number: this.form.phone_number
        });
        console.log('Дані користувача оновлено:', response.data);
        this.fetchUsers();
        this.closeModal();
      } catch (error) {
        console.error('Помилка оновлення користувача:', error);
      }
    },
    async deleteUser(id) {
      try {
        const response = await axios.delete(`http://26.235.139.202:8080/api/admin/users/${id}`);
        console.log('Користувача видалено:', response.data);
        this.fetchUsers();
      } catch (error) {
        console.error('Помилка видалення користувача:', error);
      }
    },
    openAddModal() {
      this.isAddMode = true;
      this.modalTitle = 'Додати користувача';
      this.form = {
        id: null,
        first_name: '',
        second_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: ''
      };
      this.showModal = true;
    },
    openUpdateModal(client) {
      this.isAddMode = false;
      this.modalTitle = 'Оновити дані користувача';
      this.form = { ...client };
      this.showModal = true;
    },
    submitForm() {
      if (this.isAddMode) {
        this.addUser();
      } else {
        this.updateUser();
      }
    },
    closeModal() {
      this.showModal = false;
    },
    onSearch() {
      console.log('Пошук:', this.searchQuery);
    }
  }
};
</script>

<style scoped>
/* Загальні стилі */
.client-list {
  transform: scale(0.9);
  transform-origin: top left;
  font-family: Montserrat, sans-serif;
  width: 1200px;
  margin-left: 20px;
}

.client-list__title {
  color: #000;
  font-size: 40px;
  font-weight: 700;
}

/* Контролери розбиті на ліву та праву частини */
.client-list__controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
}
.controls-left {
  display: flex;
  gap: 20px;
  align-items: center;
}
.search-form {
  background-color: #F1E9E9;
  border-radius: 8px;
  padding: 8px 20px;
  border: 1px solid transparent;
}
.search-input {
  border: none;
  background: transparent;
  font-size: 17px;
  color: #000;
  outline: none;
}
.controls-right {
  /* окремий блок для кнопки "Додати" */
}
.add-button {
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 8px 15px;
  border-radius: 12px;
  background-color: #C4AEAC;
  font-size: 16px;
  color: #000;
  border: none;
  cursor: pointer;
}
.add-button__icon {
  width: 24px;
  height: 29px;
  object-fit: contain;
}

.client-table {
  margin-top: 22px;
}

.client-table__header {
  display: flex;
  justify-content: space-between;
  padding: 26px 35px;
  border-radius: 24px;
  background-color: #FFF7F6;
  border: 2px solid #E6E6E6;
  font-size: 20px;
  color: #000;
}

.client-table__header-left,
.client-table__header-right {
  display: flex;
  gap: 130px;
}

.client-list__items {
  list-style-type: none;
  padding: 0;
}

.client-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 27px 28px;
  border-radius: 24px;
  background-color: #FFF7F6;
  border: 2px solid #E6E6E6;
  margin-top: 22px;
}

.client-item__info {
  display: flex;
  gap: 78px;
}

.client-item__main {
  display: flex;
  align-items: center;
  gap: 44px;
}

.client-item__id {
  color: #000;
  font-size: 50px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -2.5px;
  text-shadow: 0px 4px 4px rgba(99, 2, 2, 0.22);
}

.client-item__name-email {
  display: flex;
  flex-direction: column;
}

.client-item__name {
  color: #000;
  font-size: 24px;
  font-weight: 700;
}

.client-item__email {
  color: #000;
  font-size: 20px;
  margin-top: 18px;
}

.client-item__details {
  display: flex;
  gap: 80px;
  font-size: 20px;
  color: #000;
}

.client-item__actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background-color: #C4AEAC;
  font-size: 16px;
  color: #000;
  border: none;
  cursor: pointer;
}

.action-button__icon {
  width: 24px;
  height: 29px;
  object-fit: contain;
}

/* Стилі модального вікна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-dialog {
  background: #fff;
  border-radius: 8px;
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

.close-button {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.user-form .form-group {
  margin-bottom: 15px;
}

.user-form .form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.user-form .form-group input,
.user-form .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  background-color: #C4AEAC;
  border: none;
  padding: 8px 16px;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #aaa;
  border: none;
  padding: 8px 16px;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Media query для адаптивності */
@media (max-width: 991px) {
  .client-item__id {
    font-size: 40px;
  }
  .client-table__header,
  .client-item {
    padding-left: 20px;
    padding-right: 20px;
  }
  .client-item__info,
  .client-item__details {
    flex-wrap: wrap;
  }
}
</style>
