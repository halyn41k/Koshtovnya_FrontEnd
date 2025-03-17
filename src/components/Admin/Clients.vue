<template>
  <main class="client-list">
    <h1 class="client-list__title">Клієнти</h1>
    <div class="client-list__controls">
      <div class="controls-left">
        <div class="filter">
          <span class="filter__text">Фільтр</span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/4b09284ab367fa70a05a4a4f59e91721443ad7e8e783dfd2c26fb681ebacd30f?apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="Filter icon"
            class="filter__icon"
          />
        </div>
        <div class="search-form">
          <input
            class="search-input"
            type="text"
            placeholder="Пошук за ім'ям"
            v-model="searchQuery"
            @input="onSearch"
          />
        </div>
      </div>
      <div class="controls-right">
        <button class="add-button" @click="openAddModal">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/a27ea7f8a293148ec591123dc3120b25f531a1f574adc4774e1503c5d2772fcb?apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="Add icon"
            class="add-button__icon"
          />
          <span class="add-button__text">Додати</span>
        </button>
      </div>
    </div>

    <div class="client-table-container">
      <header class="client-table__header">
        <span>ID</span>
        <span>Ім'я</span>
        <span>Email</span>
        <span>№ Замовлення</span>
        <span>Телефон</span>
        <span>Додано</span>
        <span>Керування</span>
      </header>
      <ul class="client-list__items">
        <li v-for="(client, index) in clients" :key="client.id" class="client-item">
          <span class="client-item__id">{{ index + 1 }}</span>
          <span class="client-item__name">{{ client.first_name }} {{ client.last_name }}</span>
          <span class="client-item__email">{{ client.email }}</span>
          <span class="client-item__order">{{ client.order_id ? client.order_id : '—' }}</span>
          <span class="client-item__phone">{{ client.phone_number }}</span>
          <span class="client-item__date">{{ client.date }}</span>
          <div class="client-item__actions">
            <button class="action-button action-button--orders" @click="openOrdersModal(client)">
              <img src="https://via.placeholder.com/16" alt="Orders icon" class="action-button__icon" />
              <span class="action-button__text">Замовлення</span>
            </button>
            <button class="action-button action-button--update" @click="openUpdateModal(client)">
              <img src="https://via.placeholder.com/16" alt="Update icon" class="action-button__icon" />
              <span class="action-button__text">Оновити</span>
            </button>
            <button class="action-button action-button--delete" @click="deleteUser(client.id)">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/ba078f16c37c9f7f4a38bffc3903a0783959b7a0f9fc95368926f1c2df1ef2a7?apiKey=c3e46d0a629546c7a48302a5db3297d5"
                alt="Delete icon"
                class="action-button__icon"
              />
              <span class="action-button__text">Видалити</span>
            </button>
          </div>
        </li>
      </ul>
    </div>

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
              <!-- Заблоковано для оновлення: якщо не режим додавання, поле email недоступне -->
              <input id="email" v-model="form.email" type="email" placeholder="Email" required :disabled="!isAddMode" />
            </div>
            <!-- Поле role показується завжди, для можливості змінити роль -->
            <div class="form-group">
              <label for="role">Роль:</label>
              <select id="role" v-model="form.role" required>
                <option disabled value="">Оберіть роль</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="superadmin">Superadmin</option>
                <option value="user">User</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div class="form-group">
              <label for="phone_number">Телефон:</label>
              <input id="phone_number" v-model="form.phone_number" type="text" placeholder="Телефон" required />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Зберегти</button>
              <button type="button" class="btn-secondary" @click="closeModal">Відміна</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Модальне вікно для перегляду замовлень користувача -->
    <div v-if="showOrdersModal" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header">
          <h2>Замовлення користувача: {{ selectedUser.first_name }} {{ selectedUser.last_name }}</h2>
          <button class="close-button" @click="closeOrdersModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="orders.length">
            <ul class="orders-list">
              <li v-for="order in orders" :key="order.id" class="order-item">
                <span>Замовлення ID: {{ order.id }}</span>
                <span>Сума: {{ order.total_amount }}₴</span>
                <span>Статус: {{ order.status }}</span>
                <button @click="viewOrder(order)">Деталі</button>
              </li>
            </ul>
          </div>
          <div v-else>
            <p>Замовлень не знайдено.</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import axios from "axios";

export default {
  name: "ClientList",
  data() {
    return {
      clients: [],
      searchQuery: "",
      searchRole: "user",
      showModal: false,
      isAddMode: true,
      modalTitle: "",
      form: {
        id: null,
        first_name: "",
        second_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        role: ""
      },
      originalEmail: "", // Зберігаємо початковий email для порівняння
      showOrdersModal: false,
      orders: [],
      selectedUser: {}
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get("http://26.235.139.202:8080/api/admin/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json"
          },
          params: { role: "user" }
        });
        this.clients = response.data.data;
      } catch (error) {
        console.error("Помилка отримання користувачів:", error);
      }
    },
    async onSearch() {
      if (this.searchQuery.trim() === "") {
        this.fetchUsers();
        return;
      }
      try {
        const response = await axios.get(
          `http://26.235.139.202:8080/api/admin/users/search/${this.searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json"
            },
            params: { role: this.searchRole }
          }
        );
        this.clients = response.data.data;
      } catch (error) {
        console.error("Помилка пошуку:", error);
      }
    },
    async addUser() {
      try {
        const response = await axios.post(
          "http://26.235.139.202:8080/api/admin/user",
          {
            first_name: this.form.first_name,
            second_name: this.form.second_name,
            last_name: this.form.last_name,
            email: this.form.email,
            phone_number: this.form.phone_number,
            role: this.form.role
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json"
            }
          }
        );
        console.log("Користувача додано:", response.data);
        this.fetchUsers();
        this.closeModal();
      } catch (error) {
        console.error("Помилка додавання користувача:", error);
      }
    },
    async updateUser() {
      try {
        // Формуємо payload з можливістю оновлення role
        const payload = {
          first_name: this.form.first_name,
          second_name: this.form.second_name,
          last_name: this.form.last_name,
          phone_number: this.form.phone_number,
          role: this.form.role
        };
        if (this.form.email !== this.originalEmail) {
          payload.email = this.form.email;
        }
        const response = await axios.patch(
          `http://26.235.139.202:8080/api/admin/user/${this.form.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json"
            }
          }
        );
        console.log("Дані користувача оновлено:", response.data);
        this.fetchUsers();
        this.closeModal();
      } catch (error) {
        console.error("Помилка оновлення користувача:", error);
      }
    },
    async deleteUser(id) {
      try {
        const response = await axios.delete(
          `http://26.235.139.202:8080/api/admin/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json"
            }
          }
        );
        console.log("Користувача видалено:", response.data);
        this.fetchUsers();
      } catch (error) {
        console.error("Помилка видалення користувача:", error);
      }
    },
    openAddModal() {
      this.isAddMode = true;
      this.modalTitle = "Додати користувача";
      this.form = {
        id: null,
        first_name: "",
        second_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        role: ""
      };
      this.showModal = true;
    },
    openUpdateModal(client) {
      this.isAddMode = false;
      this.modalTitle = "Оновити дані користувача";
      this.form = { ...client };
      this.originalEmail = client.email;
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
    async openOrdersModal(client) {
      this.selectedUser = client;
      try {
        const response = await axios.get(
          `http://26.235.139.202:8080/api/admin/users/${client.id}/orders`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json"
            }
          }
        );
        this.orders = response.data.data;
        this.showOrdersModal = true;
      } catch (error) {
        console.error("Помилка отримання замовлень користувача:", error);
      }
    },
    closeOrdersModal() {
      this.showOrdersModal = false;
    },
    async viewOrder(order) {
      try {
        const response = await axios.get(
          `http://26.235.139.202:8080/api/admin/orders/${order.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json"
            }
          }
        );
        console.log("Деталі замовлення:", response.data);
        alert(`Деталі замовлення:\n${JSON.stringify(response.data, null, 2)}`);
      } catch (error) {
        console.error("Помилка отримання деталей замовлення:", error);
      }
    },
    async onSearchUsers() {
      try {
        const response = await axios.get(
          `http://26.235.139.202:8080/api/admin/users/search/${this.searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json"
            },
            params: { role: this.searchRole }
          }
        );
        this.clients = response.data.data;
      } catch (error) {
        console.error("Помилка пошуку:", error);
      }
    }
  }
};
</script>



<style scoped>
.client-list {
  max-width: 1200px;
  margin: 20px auto;
  font-family: Montserrat, sans-serif;
  padding: 0 20px;
}
.client-list__title {
  color: #000;
  font-size: 32px;
  font-weight: 700;
}
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
.filter {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-form {
  display: flex;
  gap: 10px;
  align-items: center;
}
.search-input {
  border: none;
  background: #F1E9E9;
  font-size: 16px;
  color: #000;
  outline: none;
  padding: 8px;
  border-radius: 8px;
}
.search-select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
.controls-right {}
.add-button {
  display: flex;
  align-items: center;
  gap: 10px;
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
.client-table-container {
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
}
.client-table__header {
  display: grid;
  grid-template-columns: 5% 15% 20% 10% 15% 15% 20%;
  gap: 16px;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background-color: #FFF7F6;
  border: 2px solid #E6E6E6;
  font-size: 16px;
  color: #000;
  font-weight: 600;
  min-width: 800px;
}
.client-list__items {
  list-style: none;
  padding: 0;
  margin: 0;
}
.client-item {
  display: grid;
  grid-template-columns: 5% 15% 20% 10% 15% 15% 20%;
  gap: 16px;
  align-items: center;
  padding: 16px;
  margin-top: 12px;
  border-radius: 12px;
  background-color: #FFF7F6;
  border: 2px solid #E6E6E6;
  min-width: 800px;
}
.client-item__id {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  text-align: center;
}
.client-item__name {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}
.client-item__email,
.client-item__order,
.client-item__phone,
.client-item__date {
  font-size: 14px;
  color: #000;
}
.client-item__actions {
  display: flex;
  gap: 6px;
}
.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 8px;
  background-color: #C4AEAC;
  font-size: 14px;
  color: #000;
  border: none;
  cursor: pointer;
}
.action-button__icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
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
