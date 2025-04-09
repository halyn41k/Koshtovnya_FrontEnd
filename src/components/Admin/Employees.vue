<template>
  <main class="employee-list">
    <h1 class="employee-list__title">Працівники</h1>

    <!-- Пошук і кнопка "Додати" -->
    <div class="employee-list__controls">
      <div class="controls-left">
        <div class="filter-search-row">
          <!-- Фільтр -->
          <div class="filter-button" @click="openFilter">
            <span class="filter__text">Фільтр</span>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/4b09284ab367fa70a05a4a4f59e91721443ad7e8e783dfd2c26fb681ebacd30f?apiKey=c3e46d0a629546c7a48302a5db3297d5"
              alt="Filter icon"
              class="filter__icon"
            />
          </div>
          <!-- Пошук із фіксованою шириною -->
          <div class="search-container">
            <div class="search-input-wrapper">
              <input
                class="search-input"
                type="text"
                placeholder="Пошук"
                v-model="searchQuery"
                @input="onSearch"
              />
              <img
                src="@/assets/icons/search.svg"
                alt="Search icon"
                class="search-icon"
              />
            </div>
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

    <!-- Оверлей фільтра -->
    <div v-if="showFilter" class="filter-overlay">
      <h2>Фільтр за роллю</h2>
      <div class="filter-options">
        <!-- Використовуємо чекбокси, але дозволяємо вибір лише однієї ролі -->
        <div v-for="role in availableRoles" :key="role" class="filter-option">
          <input
            type="checkbox"
            :id="role"
            :value="role"
            :checked="selectedRole === role"
            @change="selectRole(role)"
          />
          <label :for="role">{{ role }}</label>
        </div>
      </div>
      <div class="filter-actions">
        <button @click="applyFilter">Застосувати</button>
        <button @click="closeFilter">Скасувати</button>
      </div>
    </div>

    <!-- Таблиця з працівниками -->
    <div v-if="users.length > 0" class="employee-table-container">
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
      <ul class="employee-list__items">
        <li v-for="(employee, index) in users" :key="employee.id" class="employee-item">
          <span class="employee-item__id">{{ index + 1 }}</span>
          <span class="employee-item__name">
            {{ employee.first_name }} {{ employee.last_name }}
          </span>
          <span class="employee-item__email">{{ employee.email }}</span>
          <span class="employee-item__phone">{{ employee.phone_number }}</span>
          <span class="employee-item__date">{{ employee.date }}</span>
          <span class="employee-item__role">{{ employee.role }}</span>
          <div class="employee-item__actions">
            <button class="action-button" @click="deleteEmployee(employee.id)">
              <img src="@/assets/icons/delete.svg" alt="Delete icon" class="action-button__icon" />
            </button>
            <button class="action-button" @click="openUpdateModal(employee)">
              <img src="@/assets/icons/edit.svg" alt="Edit icon" class="action-button__icon" />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Якщо немає працівників і не було пошуку -->
    <div v-else-if="!searchQuery" class="empty-state">
      Поки що не було додано жодного працівника.
    </div>

    <!-- Якщо пошук повернув порожній результат -->
    <div v-else class="empty-state">
      За запитом «<strong>{{ searchQuery }}</strong>» нічого не знайдено.
    </div>

    <!-- Пагінація -->
    <div class="pagination-container" v-if="users.length > 0">
      <button
        class="pagination-arrow"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <img src="@/assets/icons/arrow_left.svg" alt="Arrow Left" class="arrow-icon" />
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
        @click="goToPage(currentPage + 1)"
      >
        <img src="@/assets/icons/arrow_right.svg" alt="Arrow Right" class="arrow-icon" />
      </button>
    </div>

    <!-- Модальне вікно для додавання/оновлення -->
    <UserModal
      v-if="showModal"
      :title="modalTitle"
      :initialForm="form"
      :key="modalKey"
      @close="closeModal"
      @userSubmit="submitForm"
    />
  </main>
</template>

<script>
import axios from "axios";
import UserModal from "./UserModal.vue"; // скоригуйте шлях за потреби

export default {
  name: "EmployeeList",
  components: { UserModal },
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
      currentPage: 1,
      totalPages: 3,
      sortState: {
        id: "none",
        first_name: "none",
        email: "none",
        phone_number: "none",
        date: "none",
        role: "none"
      },
      showFilter: false,
      availableRoles: ["admin", "superadmin", "manager"],
      selectedRole: "employee"
    };
  },
  computed: {
    // Для перевантаження модального вікна при кожному відкритті залежно від режиму
    modalKey() {
      return this.isAddMode
        ? `add-employee`
        : `edit-employee-${this.form.id}`;
    }
  },
  mounted() {
    this.fetchUsers();
    document.title = "Працівники";
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
      // Реалізацію сортування можна додати тут
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
    // Додавання працівника
    async addUser() {
      try {
        await axios.post(
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
        console.log("Працівника додано");
        this.fetchUsers();
        this.closeModal();
      } catch (error) {
        console.error("Помилка додавання працівника:", error);
      }
    },
    // Оновлення даних працівника
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
        await axios.patch(
          `http://26.235.139.202:8080/api/admin/user/${this.form.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json"
            }
          }
        );
        console.log("Дані працівника оновлено");
        this.fetchUsers();
        this.closeModal();
      } catch (error) {
        console.error("Помилка оновлення працівника:", error);
      }
    },
    async deleteEmployee(id) {
      try {
        await axios.delete(
          `http://26.235.139.202:8080/api/admin/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json"
            }
          }
        );
        console.log("Працівника видалено");
        this.fetchUsers();
      } catch (error) {
        console.error("Помилка видалення працівника:", error);
      }
    },
    // Відкриття модального вікна для додавання
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
    // Відкриття модального вікна для редагування
    openUpdateModal(employee) {
      this.isAddMode = false;
      this.modalTitle = "Оновити дані працівника";
      this.form = { ...employee };
      this.originalEmail = employee.email;
      this.showModal = true;
    },
    // Обробка даних з модального вікна (отримуємо об'єкт з форми)
    submitForm(formData) {
      this.form = { ...formData };
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
      // Реалізуйте логіку завантаження даних певної сторінки, якщо потрібно
    },
    // Методи для роботи з фільтром
    openFilter() {
      this.selectedRole = this.searchRole;
      this.showFilter = true;
    },
    closeFilter() {
      this.showFilter = false;
    },
    selectRole(role) {
      // Дозволяємо вибір лише однієї ролі
      this.selectedRole = role;
    },
    applyFilter() {
      this.searchRole = this.selectedRole;
      this.fetchUsers();
      this.closeFilter();
    }
  }
};
</script>


<style scoped>
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

/* Контролли */
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


/* Рядок для пошуку та фільтра */
.filter-search-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.filter-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.filter-button:hover {
  background-color: #e0e0e0;
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

/* Фіксована ширина для пошуку */
.search-container {
  width: 250px;
}
.search-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
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
  background: transparent;
  color: #6b1f1f;
  font-size: 14px;
  outline: none;
}
.search-icon {
  width: 16px;
  height: 16px;
  margin-right: 12px;
  pointer-events: none;
}

/* Оверлей для фільтра */
.filter-overlay {
  position: absolute;
  top: 60px;
  left: 20px;
  width: 350px;
  background-color: #fff7f6;
  border: 1px solid #ccc;
  border-radius: 8px;
  z-index: 1000;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.filter-overlay h2 {
  margin-top: 0;
  font-size: 18px;
  font-weight: 600;
}
.filter-options {
  margin: 15px 0;
}
.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.filter-option input {
  width: 16px;
  height: 16px;
}
.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.filter-actions button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.filter-actions button:first-child {
  background-color: #6b1f1f;
  color: #fff;
}
.filter-actions button:last-child {
  background-color: #ccc;
}

/* Таблиця */
.employee-table-container {
  margin-top: 0;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}
.employee-table__header,
.employee-item {
  display: grid;
  grid-template-columns: 50px 200px 300px 150px 120px 150px 120px;
  align-items: center;
  text-align: left;
  padding: 12px 16px;
  column-gap: 10px;
}
.employee-table__header {
  border-bottom: 1px solid #e0e0e0;
  background-color: #f6e7e7;
  font-size: 14px;
  font-weight: 600;
  color: #48484b;
}
.sortable-header {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  gap: 4px;
}
.sort-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* Рядки */
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

/* Дії */
.employee-item__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Стилізація для контейнера чекбокса */
.option {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  font-family: Montserrat, sans-serif;
  color: #333;
}

/* Збільшення розміру чекбокса та відступу */
input[type="checkbox"] {
  accent-color: #996666;
  width: 20px;   /* збільшено для кращої видимості */
  height: 20px;
  margin-right: 10px; /* відступ між чекбоксом і текстом */
}

/* Загальний стиль для кнопок */
button {
  font-family: Montserrat, sans-serif;
  font-size: 16px;
  padding: 10px 20px; /* більший падінг для кращого вигляду */
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s, transform 0.3s;
}

/* Приклад для кнопки "Додати" */
.add-button {
  width: auto;  /* даємо можливість кнопці розширюватись за контентом */
  height: auto;
  background-color: #6b1f1f;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
}
.add-button:hover {
  background-color: #a01212;
}
.add-button:active {
  transform: scale(0.98);
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

/* Порожній стан */
.empty-state {
  width: 1124px;
  height: 199px;
  margin: 40px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fafafa;
  text-align: center;
}
</style>
