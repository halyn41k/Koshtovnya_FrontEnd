<template>
  <main class="order-list">
    <!-- Шапка з заголовком -->
    <div class="order-header">
      <h1 class="order-list__title">Замовлення</h1>
      <!-- Кнопку додавання можна додати за потреби -->
      <!-- <button class="order-add-button" @click="openAddModal">
        <img src="@/assets/icons/plus.svg" alt="Add icon" class="order-add-button__icon" />
        <span class="order-add-button__text">Додати</span>
      </button> -->
    </div>

    <!-- Поле пошуку -->
    <div class="order-search-container">
      <div class="order-search-input-wrapper">
        <input
          class="order-search-input"
          type="text"
          placeholder="Пошук"
          v-model="searchQuery"
          @input="onSearch"
        />
        <img src="@/assets/icons/search.svg" alt="Search icon" class="order-search-icon" />
      </div>
    </div>

    <!-- 1) Є замовлення -->
    <div v-if="orders.length > 0" class="order-table-container">
      <header class="order-table__header">
        <span class="order-sortable-header" @click="cycleSort('id')">
          ID
          <img :src="getSortIcon(sortState.id)" alt="Sort Icon" class="order-sort-icon" />
        </span>
        <span class="order-sortable-header" @click="cycleSort('order_date')">
          Дата
          <img :src="getSortIcon(sortState.order_date)" alt="Sort Icon" class="order-sort-icon" />
        </span>
        <span class="order-sortable-header" @click="cycleSort('status')">
          Статус
          <img :src="getSortIcon(sortState.status)" alt="Sort Icon" class="order-sort-icon" />
        </span>
        <span class="order-sortable-header" @click="cycleSort('phone_number')">
          Телефон
          <img :src="getSortIcon(sortState.phone_number)" alt="Sort Icon" class="order-sort-icon" />
        </span>
        <span class="order-sortable-header" @click="cycleSort('products')">
          Продукти
          <img :src="getSortIcon(sortState.products)" alt="Sort Icon" class="order-sort-icon" />
        </span>
        <span>Дії</span>
      </header>
      <ul class="order-list__items">
        <li
          v-for="order in filteredOrders"
          :key="order.id"
          :class="['order-item', { highlighted: order.id === highlightedOrderId }]"
        >
          <span class="order-item__id">{{ order.id }}</span>
          <span class="order-item__date">{{ order.order_date }}</span>
          <span class="order-item__status">{{ order.status }}</span>
          <span class="order-item__phone">{{ order.phone_number }}</span>
          <span class="order-item__products">
            {{ order.products.join(', ') }}
          </span>
          <div class="order-item__actions">
            <button class="order-action-button" @click="showOrderDetails(order.id)">
              <img
                src="@/assets/icons/edit.svg"
                alt="Detail icon"
                class="order-action-button__icon"
              />
            </button>
            <!-- Видалення прибрано, бо замовлення не можна видаляти -->
            <!--
            <button class="order-action-button" @click="deleteOrder(order.id)">
              <img
                src="@/assets/icons/delete.svg"
                alt="Delete icon"
                class="order-action-button__icon"
              />
            </button>
            -->
          </div>
        </li>
      </ul>
    </div>

    <!-- 2) Немає замовлень і пошук не проводився -->
    <div v-else-if="!searchQuery" class="empty-state">
      Поки що не було додано жодного замовлення.
    </div>

    <!-- 3) Немає результатів пошуку -->
    <div v-else class="empty-state">
      За запитом «<strong>{{ searchQuery }}</strong>» нічого не знайдено.
    </div>

    <!-- Пагінація -->
    <div class="order-pagination-container" v-if="orders.length > 0">
      <button
        class="order-pagination-arrow"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <img src="@/assets/icons/arrow_left.svg" alt="Arrow Left" class="order-arrow-icon" />
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="['order-pagination-button', { active: currentPage === page }]"
      >
        {{ page }}
      </button>
      <button
        class="order-pagination-arrow"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <img src="@/assets/icons/arrow_right.svg" alt="Arrow Right" class="order-arrow-icon" />
      </button>
    </div>

    <!-- Модальне вікно з деталями замовлення -->
    <div v-if="showDetailsModal" class="order-modal-overlay">
      <div class="order-modal-dialog">
        <div class="order-modal-header">
          <h2>Деталі замовлення #{{ orderDetails.id }}</h2>
          <button class="order-close-button" @click="closeDetailsModal">&times;</button>
        </div>
        <div class="order-modal-body">
          <p><strong>Дата:</strong> {{ orderDetails.order_date }}</p>
          <p><strong>Статус:</strong> {{ orderDetails.status }}</p>
          <p><strong>Телефон:</strong> {{ orderDetails.phone_number }}</p>
          <p><strong>Продукти:</strong> {{ orderDetails.products.join(', ') }}</p>
        </div>
      </div>
    </div>

    <!-- Toast повідомлення -->
    <div v-if="showToast" class="order-toast">
      <img src="@/assets/icons/success.svg" alt="Success" class="order-toast__icon" />
      <span class="order-toast__text">Замовлення оновлено</span>
    </div>
  </main>
</template>

<script>
import axios from "axios";

export default {
  name: "OrderList",
  data() {
    return {
      orders: [],
      searchQuery: "",
      currentPage: 1,
      totalPages: 3,
      sortState: {
        id: "none",
        order_date: "none",
        status: "none",
        phone_number: "none",
        products: "none"
      },
      highlightedOrderId: null,
      showDetailsModal: false,
      orderDetails: {},
      showToast: false
    };
  },
  computed: {
    filteredOrders() {
      const query = this.searchQuery.toLowerCase();
      return this.orders.filter(order => {
        return (
          order.id.toString().includes(query) ||
          order.order_date.toLowerCase().includes(query) ||
          order.status.toLowerCase().includes(query) ||
          order.phone_number.includes(query)
        );
      });
    }
  },
  mounted() {
    this.fetchOrders();
    document.title = "Замовлення";
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/admin/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json"
          }
        });
        // Припустимо, що API повертає список замовлень у response.data.orders
        this.orders = response.data.orders;
      } catch (error) {
        console.error("Помилка отримання замовлень:", error);
      }
    },
    async showOrderDetails(orderId) {
      try {
        const response = await axios.get(`https://koshtovnya.api-dev.bmax-edu.website/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json"
          }
        });
        this.orderDetails = response.data.data;
        this.showDetailsModal = true;
      } catch (error) {
        console.error("Помилка отримання деталей замовлення:", error);
      }
    },
    // Видалення прибрано, оскільки замовлення не можна видаляти
    /*
    async deleteOrder(orderId) {
      try {
        await axios.delete(`https://koshtovnya.api-dev.bmax-edu.website/api/admin/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json"
          }
        });
        this.fetchOrders();
        this.showToastMessage("Замовлення видалено");
      } catch (error) {
        console.error("Помилка видалення замовлення:", error);
      }
    },
    */
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.orderDetails = {};
    },
    onSearch() {
      console.log("Пошук:", this.searchQuery);
    },
    goToPage(page) {
      this.currentPage = page;
      // Логіка пагінації при потребі
    },
    cycleSort(column) {
      if (this.sortState[column] === "none") {
        this.sortState[column] = "asc";
      } else if (this.sortState[column] === "asc") {
        this.sortState[column] = "desc";
      } else {
        this.sortState[column] = "none";
      }
      console.log(`Сортування ${column}: ${this.sortState[column]}`);
      // Реалізуйте локальне сортування або виклик API тут
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
    showToastMessage(message) {
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    }
  }
};
</script>

<style scoped>
/* Основний контейнер */
.order-list {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  font-family: Montserrat, sans-serif;
  color: #000;
}

/* Шапка */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.order-list__title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}
.order-add-button {
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
.order-add-button__icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
.order-add-button__text {
  font-size: 14px;
  font-weight: 600;
  font-family: Montserrat, sans-serif;
}
.order-add-button:hover {
  background-color: #a01212;
}
.order-add-button:active {
  border: 1px solid #1d1d1d;
}

/* Пошук */
.order-search-container {
  margin-bottom: 20px;
}
.order-search-input-wrapper {
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
.order-search-input-wrapper:focus-within {
  border: 1px solid #1d1d1d;
}
.order-search-input {
  flex: 1;
  height: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #6b1f1f;
  font-size: 14px;
  outline: none;
}
.order-search-icon {
  width: 16px;
  height: 16px;
  margin-right: 12px;
  pointer-events: none;
}

/* Таблиця замовлень */
.order-table-container {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}
.order-table__header {
  display: grid;
  grid-template-columns: 100px 150px 150px 150px 500px 100px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f6e7e7;
  font-size: 14px;
  font-weight: 600;
  color: #48484b;
  text-align: left;
}
.order-sortable-header {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.order-sort-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* Список замовлень */
.order-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
}
.order-item {
  display: grid;
  grid-template-columns: 100px 150px 150px 150px 500px 100px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fff;
  font-size: 14px;
  transition: background-color 0.3s;
  text-align: left;
}
.order-item:hover {
  background-color: #f9f9f9;
}
.order-item.highlighted {
  background-color: #e4f2e7 !important;
}

/* Поля таблиці */
.order-item__id,
.order-item__date,
.order-item__status,
.order-item__phone,
.order-item__products {
  padding-right: 8px;
  white-space: nowrap;
}

.order-item__products {
  max-width: 600px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


/* Дії */
.order-item__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}
.order-action-button {
  width: 32px;
  height: 32px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  padding: 0;
}
.order-action-button__icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Пагінація */
.order-pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin-top: 20px;
  gap: 8px;
}
.order-pagination-button {
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
.order-pagination-button:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}
.order-pagination-button.active {
  background-color: #6b1f1f;
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.order-pagination-arrow {
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
.order-pagination-arrow:hover:not(:disabled) {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}
.order-pagination-arrow:disabled {
  background-color: #aeaeae;
  cursor: not-allowed;
  box-shadow: none;
}
.order-arrow-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

/* Empty state */
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

/* Модальне вікно */
.order-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.order-modal-dialog {
  background: #fff;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  animation: fadeIn 0.3s ease-out;
}
.order-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.order-close-button {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
.order-modal-body p {
  font-size: 16px;
  margin: 8px 0;
}

/* Toast повідомлення */
.order-toast {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 300px;
  height: 44px;
  background-color: #e4f2e7;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 2000;
}
.order-toast__icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
.order-toast__text {
  font-family: Montserrat, sans-serif;
  font-size: 14px;
  color: #000;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
