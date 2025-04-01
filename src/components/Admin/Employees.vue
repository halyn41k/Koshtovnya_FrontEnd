<template>
  <main class="employee-list">
    <h1 class="employee-list__title">Працівники</h1>

    <!-- Блок із фільтрами та кнопкою "Додати" -->
    <div class="employee-list__controls">
      <div class="controls-left">
        <div class="filter">
          <span class="filter__text">Фільтр</span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/4b09284ab367fa70a05a4a4f59e91721443ad7e8e783dfd2c26fb681ebacd30f?apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="Filter icon"
            class="filter__icon"
          />
        </div>
        <!-- Блок пошуку аналогічно до користувачів -->
        <div class="search-container">
          <div class="search-input-wrapper">
            <input
              class="search-input"
              type="text"
              placeholder="Пошук"
              v-model="searchQuery"
              @input="onSearch"
            />
            <img src="@/assets/icons/search.svg" alt="Search icon" class="search-icon" />
          </div>
        </div>
      </div>
      <div class="controls-right">
        <button class="add-button" @click="openAddModal">
          <img src="@/assets/icons/plus.svg" alt="Add icon" class="add-button__icon" />
          <span class="add-button__text">Додати</span>
        </button>
      </div>
    </div>

    <!-- Контейнер для таблиці з горизонтальним скролом -->
    <div class="employee-table-container">
      <!-- Заголовок таблиці з сортуванням -->
      <header class="employee-table__header">
        <span class="sortable-header" @click="cycleSort('id')">
          ID
          <img :src="getSortIcon(sortState.id)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('first_name')">
          Ім'я
          <img :src="getSortIcon(sortState.first_name)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('email')">
          Email
          <img :src="getSortIcon(sortState.email)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('phone_number')">
          Телефон
          <img :src="getSortIcon(sortState.phone_number)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('date')">
          Дата
          <img :src="getSortIcon(sortState.date)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('role')">
          Роль
          <img :src="getSortIcon(sortState.role)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span>Керування</span>
      </header>

      <!-- Список працівників -->
      <ul class="employee-list__items">
        <li v-for="(employee, index) in users" :key="employee.id" class="employee-item">
          <span class="employee-item__id">{{ index + 1 }}</span>
          <span class="employee-item__name">{{ employee.first_name }} {{ employee.last_name }}</span>
          <span class="employee-item__email">{{ employee.email }}</span>
          <span class="employee-item__phone">{{ employee.phone_number }}</span>
          <span class="employee-item__date">{{ employee.date }}</span>
          <span class="employee-item__role">{{ employee.role }}</span>
          <div class="employee-item__actions">
            <button class="action-button" @click="deleteEmployee(employee.id)">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/ba078f16c37c9f7f4a38bffc3903a0783959b7a0f9fc95368926f1c2df1ef2a7?apiKey=c3e46d0a629546c7a48302a5db3297d5"
                alt="Delete icon"
                class="action-button__icon"
              />
            </button>
            <button class="action-button" @click="openUpdateModal(employee)">
              <img
                src="https://via.placeholder.com/24"
                alt="Update icon"
                class="action-button__icon"
              />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Пагінація -->
    <div class="pagination-container">
      <button
        class="pagination-arrow"
        :disabled="currentPage === 1"
        @click="currentPage > 1 && goToPage(currentPage - 1)"
      >
        <img
          src="@/assets/icons/arrow_left.svg"
          alt="Arrow Left"
          class="arrow-icon"
        />
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="['pagination-button', { active: currentPage === page }]"
      >
        {{ page }}
      </button>

      <button
        class="pagination-arrow"
        :disabled="currentPage === totalPages"
        @click="currentPage < totalPages && goToPage(currentPage + 1)"
      >
        <img
          src="@/assets/icons/arrow_right.svg"
          alt="Arrow Right"
          class="arrow-icon"
        />
      </button>
    </div>

    <!-- Модальне вікно для додавання/оновлення -->
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
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="Email"
                required
                :disabled="!isAddMode"
              />
            </div>
            <div class="form-group">
              <label for="phone_number">Телефон:</label>
              <input
                id="phone_number"
                v-model="form.phone_number"
                type="text"
                placeholder="Телефон"
                :required="isAddMode"
              />
            </div>
            <div class="form-group" v-if="isAddMode">
              <label for="role">Роль:</label>
              <select id="role" v-model="form.role" required>
                <option disabled value="">Оберіть роль</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Зберегти</button>
              <button type="button" class="btn-secondary" @click="closeModal">
                Відміна
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import axios from "axios";

export default {
  name: "EmployeeList",
  data() {
    return {
      users: [],
      searchQuery: "",
      searchRole: "employee",
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
      originalEmail: "",
      // Пагінація
      currentPage: 1,
      totalPages: 3,
      // Стан сортування для полів таблиці
      sortState: {
        id: "none",
        first_name: "none",
        email: "none",
        phone_number: "none",
        date: "none",
        role: "none"
      }
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
          params: { role: this.searchRole }
        });
        this.users = response.data.data;
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
        this.users = response.data.data;
      } catch (error) {
        console.error("Помилка пошуку:", error);
      }
    },
    cycleSort(column) {
      if (this.sortState[column] === "none") {
        this.sortState[column] = "asc";
      } else if (this.sortState[column] === "asc") {
        this.sortState[column] = "desc";
      } else {
        this.sortState[column] = "none";
      }
      console.log(`Sort for ${column}: ${this.sortState[column]}`);
      // Реалізуйте сортування, якщо потрібно
    },
    getSortIcon(state) {
      if (state === "asc") {
        return require("@/assets/icons/asc.svg");
      } else if (state === "desc") {
        return require("@/assets/icons/desc.svg");
      } else {
        return require("@/assets/icons/none_sorted.svg");
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
        console.log("Працівника додано:", response.data);
        this.fetchUsers();
        this.closeModal();
      } catch (error) {
        console.error("Помилка додавання працівника:", error);
      }
    },
    async updateUser() {
      try {
        const payload = {
          first_name: this.form.first_name,
          second_name: this.form.second_name,
          last_name: this.form.last_name,
          ...(this.form.phone_number && { phone_number: this.form.phone_number }),
          role: this.form.role
        };
        if (this.isAddMode) {
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
        console.log("Дані працівника оновлено:", response.data);
        this.fetchUsers();
        this.closeModal();
      } catch (error) {
        console.error("Помилка оновлення працівника:", error);
      }
    },
    async deleteEmployee(id) {
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
        console.log("Працівника видалено:", response.data);
        this.fetchUsers();
      } catch (error) {
        console.error("Помилка видалення працівника:", error);
      }
    },
    openAddModal() {
      this.isAddMode = true;
      this.modalTitle = "Додати працівника";
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
    openUpdateModal(employee) {
      this.isAddMode = false;
      this.modalTitle = "Оновити дані працівника";
      this.form = { ...employee };
      this.originalEmail = employee.email;
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
    goToPage(page) {
      this.currentPage = page;
      // Реалізуйте логіку завантаження даних для сторінки page
    }
  }
};
</script>


<style scoped>
/* Загальні налаштування */
.employee-list {
  max-width: 1200px;
  margin: 0 auto;
  font-family: Montserrat, sans-serif;
  padding: 20px 20px 40px;
  color: #000;
}
.employee-list__title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
}

/* Контролли: фільтр, пошук, кнопка "Додати" */
.employee-list__controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.controls-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.filter {
  display: flex;
  align-items: center;
  gap: 6px;
}
.filter__text {
  font-size: 14px;
  font-weight: 600;
  color: #48484b;
}
.filter__icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* Блок пошуку */
.search-container {
  margin-bottom: 0;
}
.search-input-wrapper {
  display: flex;
  align-items: center;
  width: 262px;
  height: 30px;
  background-color: #f6e7e7;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid transparent;
  transition: border 0.3s;
}
.search-input-wrapper:focus-within {
  border: 1px solid #1d1d1d;
}
.search-input {
  flex: 1;
  height: 100%;
  padding: 8px 12px;
  border: none;
  background-color: transparent;
  color: #898989;
  font-size: 14px;
  outline: none;
}
.search-icon {
  width: 16px;
  height: 16px;
  margin-right: 12px;
  pointer-events: none;
}

/* Кнопка "Додати" */
.add-button {
  width: 126px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 4px;
  background-color: #6b1f1f;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #fff;
  transition: background-color 0.3s, border 0.3s;
}
.add-button__icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.add-button__text {
  font-size: 14px;
  font-weight: 600;
}
.add-button:hover {
  background-color: #a01212;
}
.add-button:active {
  border: 1px solid #1d1d1d;
}

/* Таблиця: використання адаптивного розподілу колонок */
.employee-table-container {
  margin-top: 0;
  border-radius: 6px;
  overflow: hidden; /* Забираємо горизонтальний скрол, якщо всі колонки адаптуються */
  border: 1px solid #e0e0e0;
}
.employee-table__header,
.employee-item {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 7 колонок з рівною шириною */
  align-items: center; /* Центруємо контент по вертикалі */
  padding: 12px 16px;
}
.employee-table__header {
  border-bottom: 1px solid #e0e0e0;
  background-color: #F6E7E7;
  font-size: 14px;
  font-weight: 600;
  color: #48484b;
}
.sortable-header {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: 4px;
}
.sort-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* Список елементів */
.employee-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
}
.employee-item {
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  font-size: 14px;
  color: #000;
  transition: background-color 0.3s;
}
.employee-item:hover {
  background-color: #f9f9f9;
}
.employee-item__actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.action-button {
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  padding: 0;
}
.action-button__icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Пагінація */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin-top: 20px;
  gap: 8px;
}
.pagination-button {
  width: 35px;
  height: 35px;
  border: none;
  background-color: #fff;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, background-color 0.3s, box-shadow 0.3s;
}
.pagination-button:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}
.pagination-button.active {
  background-color: #6b1f1f;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.pagination-arrow {
  width: 35px;
  height: 35px;
  border: none;
  background-color: #fff;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s, background-color 0.3s, box-shadow 0.3s;
}
.pagination-arrow:hover:not(:disabled) {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}
.pagination-arrow:disabled {
  background-color: #aeaeae;
  cursor: not-allowed;
  box-shadow: none;
}
.arrow-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* Модальне вікно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.modal-dialog {
  background-color: #fff;
  width: 500px;
  border-radius: 6px;
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #F6E7E7;
  border-bottom: 1px solid #e0e0e0;
}
.modal-header h2 {
  margin: 0;
  font-size: 18px;
}
.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
.modal-body {
  padding: 16px;
}
.form-group {
  margin-bottom: 12px;
}
.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.btn-primary {
  background-color: #6b1f1f;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.btn-secondary {
  background-color: #e0e0e0;
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
