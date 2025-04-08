<template>
  <main class="client-list">
    <!-- Шапка з заголовком та кнопкою "Додати" -->
    <div class="header-container">
      <h1 class="client-list__title">Користувачі</h1>
      <button class="add-button" @click="openAddModal">
        <img src="@/assets/icons/plus.svg" alt="Add icon" class="add-button__icon" />
        <span class="add-button__text">Додати</span>
      </button>
    </div>

    <!-- Поле пошуку -->
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

    <!-- 1) Є клієнти -->
    <div v-if="clients.length > 0" class="client-table-container">
      <header class="client-table__header">
        <span class="sortable-header" @click="cycleSort('id')">
          ID
          <img :src="getSortIcon(sortState.id)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('first_name')">
          Ім’я
          <img :src="getSortIcon(sortState.first_name)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('last_name')">
          Прізвище
          <img :src="getSortIcon(sortState.last_name)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('email')">
          Електронна пошта
          <img :src="getSortIcon(sortState.email)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('order')">
          № Замовлення
          <img :src="getSortIcon(sortState.order)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header" @click="cycleSort('date')">
          Додано
          <img :src="getSortIcon(sortState.date)" alt="Sort Icon" class="sort-icon" />
        </span>
        <span class="sortable-header">Дії</span>
      </header>
      <ul class="client-list__items">
        <li
          v-for="(client, index) in clients"
          :key="client.id"
          :class="['client-item', { highlighted: client.id === highlightedUserId }]"
        >
          <span class="client-item__id">{{ index + 1 }}</span>
          <span class="client-item__first-name">{{ client.first_name }}</span>
          <span class="client-item__last-name">{{ client.last_name }}</span>
          <span class="client-item__email">{{ client.email }}</span>
          <span class="client-item__order">{{ client.order_id || '—' }}</span>
          <span class="client-item__date">{{ client.date }}</span>
          <div class="client-item__actions">
            <button class="action-button" @click="openUpdateModal(client)">
              <img src="@/assets/icons/edit.svg" alt="Update icon" class="action-button__icon" />
            </button>
            <button class="action-button" @click="deleteUser(client.id)">
              <img src="@/assets/icons/delete.svg" alt="Delete icon" class="action-button__icon" />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- 2) Немає клієнтів і не було пошуку -->
    <div v-else-if="!searchQuery" class="empty-state">
      Поки що не було додано жодного користувача.
    </div>

    <!-- 3) Немає результатів пошуку -->
    <div v-else class="empty-state">
      За запитом «<strong>{{ searchQuery }}</strong>» нічого не знайдено.
    </div>

    <!-- Пагінація -->
    <div class="pagination-container" v-if="clients.length > 0">
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

    <!-- Модальне вікно -->
    <UserModal
      v-if="showUserModal"
      :key="modalKey"
      :title="modalTitle"
      @close="closeUserModal"
      @userSubmit="handleUserSubmit"
    />

    <!-- Toast повідомлення -->
    <div v-if="showToast" class="toast">
      <img src="@/assets/icons/success.svg" alt="Success" class="toast-icon" />
      <span class="toast-text">Користувач створений</span>
    </div>
  </main>
</template>



<script>
import axios from "axios";
import UserModal from "./UserModal.vue";

export default {
  name: "ClientList",
  components: {
    UserModal
  },
  data() {
    return {
      clients: [],
      searchQuery: "",
      searchRole: "user",
      showUserModal: false,
      modalTitle: "",
      modalKey: 0,
      // Пагінація
      currentPage: 1,
      totalPages: 3,
      // Стан сортування
      sortState: {
        id: "none",
        first_name: "none",
        last_name: "none",
        email: "none",
        order: "none",
        date: "none",
        actions: "none"
      },
      // Toast та підсвічування
      showToast: false,
      highlightedUserId: null
    };
  },
  mounted() {
    this.fetchUsers();
    document.title = "Користувачі";
  },
  methods: {
    async fetchUsers() {
  try {
    const response = await axios.get(
      "http://26.235.139.202:8080/api/admin/users",
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
    console.error("Помилка отримання:", error);
  }
},
async onSearch() {
  if (this.searchQuery.trim() === "") {
    return this.fetchUsers();
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
    this.clients = []; // на випадок помилки
  }
},
    async addUser(userData) {
      try {
        const response = await axios.post(
          "http://26.235.139.202:8080/api/admin/user",
          {
            first_name: userData.first_name,
            second_name: userData.second_name,
            last_name: userData.last_name,
            email: userData.email,
            phone_number: userData.phone_number,
            role: userData.role
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Accept: "application/json"
            }
          }
        );
        console.log("Користувача додано:", response.data);
        const newUserId = response.data.data.id;
        this.highlightedUserId = newUserId;
        this.fetchUsers();
        this.showToastMessage();
        setTimeout(() => {
          this.highlightedUserId = null;
        }, 3000);
      } catch (error) {
        console.error("Помилка додавання користувача:", error);
      }
    },
    async updateUser(userData) {
      try {
        const payload = {
          first_name: userData.first_name,
          second_name: userData.second_name,
          last_name: userData.last_name,
          role: userData.role,
          phone_number: userData.phone_number
        };
        if (userData.email !== userData.originalEmail) {
          payload.email = userData.email;
        }
        const response = await axios.patch(
          `http://26.235.139.202:8080/api/admin/user/${userData.id}`,
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
      } catch (error) {
        console.error("Помилка оновлення користувача:", error);
      }
    },
    deleteUser(id) {
      axios
        .delete(`http://26.235.139.202:8080/api/admin/users/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json"
          }
        })
        .then((response) => {
          console.log("Користувача видалено:", response.data);
          this.fetchUsers();
        })
        .catch((error) => {
          console.error("Помилка видалення користувача:", error);
        });
    },
    openAddModal() {
      this.modalTitle = "Створити користувача";
      // Оновлюємо ключ, щоб компонент модалки ініціалізувався заново
      this.modalKey = Date.now();
      this.showUserModal = true;
    },
    openUpdateModal(client) {
      this.modalTitle = "Оновити дані користувача";
      this.modalKey = Date.now();
      // Можна передати дані клієнта через props, якщо потрібно
      this.showUserModal = true;
    },
    closeUserModal() {
      this.showUserModal = false;
    },
    handleUserSubmit(userData) {
      console.log("Дані, отримані від модалки:", userData);
      if (userData.id) {
        this.updateUser(userData);
      } else {
        this.addUser(userData);
      }
      this.closeUserModal();
    },
    showToastMessage() {
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },
    goToPage(page) {
      this.currentPage = page;
      // Реалізуйте логіку пагінації, якщо потрібно
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
    }
  }
};
</script>

<style scoped>
/* Загальні налаштування */
.client-list {
  max-width: 1200px;
  margin: 0 auto;
  font-family: Montserrat, sans-serif;
  padding: 20px 20px 40px;
  color: #000;
}

/* Шапка */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.client-list__title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
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
  font-family: Montserrat, sans-serif;
}
.add-button:hover {
  background-color: #a01212;
}
.add-button:active {
  border: 1px solid #1d1d1d;
}

.search-container {
  margin-bottom: 20px;
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

/* Таблиця */
.client-table-container {
  margin-top: 0;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}
.client-table__header {
  display: grid;
  grid-template-columns: 5% 15% 15% 25% 15% 15% 10%;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #F6E7E7;
  font-size: 14px;
  font-weight: 600;
  color: #48484b;
}
.sortable-header {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}
.sort-icon {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  object-fit: contain;
}
.client-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
}
.client-item {
  display: grid;
  grid-template-columns: 5% 15% 15% 25% 15% 15% 10%;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  font-size: 14px;
  color: #000;
  transition: background-color 0.3s;
}
.client-item.highlighted {
  background-color: #E4F2E7 !important;
}
.client-item__actions {
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
  font-family: Montserrat, sans-serif;
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
  transition: transform 0.3s, background-color 0.3s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Toast */
.toast {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 300px;
  height: 44px;
  background-color: #E4F2E7;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 2000;
}
.toast-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
.toast-text {
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  color: #000;
}

.empty-state {
  width: 1124px;
  height: 199px;
  margin: 40px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: #000;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fafafa;
  text-align: center;
}

</style>
