<template>
  <main class="order-list">
    <h1 class="order-list__title">Замовлення</h1>

    <!-- Блок із фільтрами (пошук) -->
    <div class="order-list__controls">
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
            placeholder="Пошук"
            v-model="searchQuery"
            @input="onSearch"
          />
        </div>
      </div>
      <div class="controls-right">
        <!-- Якщо потрібне додавання замовлень, можна розкоментувати -->
        <!-- <button class="add-button" @click="openAddModal">
          <img src="..." alt="Add icon" class="add-button__icon" />
          <span class="add-button__text">Додати</span>
        </button> -->
      </div>
    </div>

    <!-- Контейнер для таблиці замовлень з горизонтальним скролом -->
    <div class="order-table-container">
      <!-- Заголовок таблиці (7 колонок) -->
      <header class="order-table__header">
        <span>ID</span>
        <span>Дата</span>
        <span>Статус</span>
        <span>Вартість</span>
        <span>Оплата</span>
        <span>Доставка</span>
        <span>Дії</span>
      </header>

      <!-- Список замовлень -->
      <ul class="order-list__items">
        <li
          v-for="(orderItem) in filteredOrders"
          :key="orderItem.order.id"
          class="order-item"
        >
          <span class="order-item__id">{{ orderItem.order.id }}</span>
          <span class="order-item__date">{{ orderItem.order.order_date }}</span>
          <span class="order-item__status">{{ orderItem.order.status }}</span>
          <span class="order-item__total">{{ orderItem.total_cost }}</span>
          <span class="order-item__payment">{{ orderItem.payment_method }}</span>
          <span class="order-item__delivery">{{ orderItem.delivery.delivery_name }}</span>
          <div class="order-item__actions">
            <button
              class="action-button detail-button"
              @click="showOrderDetails(orderItem.order.id)"
            >
              <span>Деталі</span>
            </button>
            <button
              class="action-button delete-button"
              @click="deleteOrder(orderItem.order.id)"
            >
              <span>Видалити</span>
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Модальне вікно з деталями замовлення -->
    <div v-if="showDetailsModal" class="modal-overlay">
      <div class="modal-dialog">
        <div class="modal-header">
          <h2>Деталі замовлення #{{ orderDetails.order.id }}</h2>
          <button class="close-button" @click="closeDetailsModal">&times;</button>
        </div>
        <div class="modal-body">
          <p><strong>Дата:</strong> {{ orderDetails.order.order_date }}</p>
          <p><strong>Статус:</strong> {{ orderDetails.order.status }}</p>
          <p><strong>Вартість:</strong> {{ orderDetails.total_cost }}</p>
          <p><strong>Метод оплати:</strong> {{ orderDetails.payment_method }}</p>
          <h3>Доставка</h3>
          <p><strong>Спосіб доставки:</strong> {{ orderDetails.delivery.delivery_name }}</p>
          <p><strong>Адреса:</strong> {{ orderDetails.delivery.delivery_address }}</p>
          <p><strong>Вартість доставки:</strong> {{ orderDetails.delivery.delivery_cost }}</p>
          <p><strong>Користувач:</strong> {{ orderDetails.delivery.user }}</p>
          <p><strong>Телефон:</strong> {{ orderDetails.delivery.phone_number }}</p>
          <h3>Продукти</h3>
          <ul>
            <li
              v-for="product in orderDetails.order.products"
              :key="product.id"
            >
              {{ product.name }} – {{ product.quantity }} шт. по {{ product.price }} грн.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import axios from 'axios';

export default {
  name: 'OrderList',
  data() {
    return {
      orders: [], // Список замовлень із API
      searchQuery: '',
      showDetailsModal: false,
      orderDetails: {} // Деталі одного замовлення
    };
  },
  computed: {
    // Фільтруємо замовлення за пошуковим запитом (пошук за ID, датою або статусом)
    filteredOrders() {
      const query = this.searchQuery.toLowerCase();
      return this.orders.filter(orderItem => {
        return (
          orderItem.order.id.toString().includes(query) ||
          orderItem.order.order_date.toLowerCase().includes(query) ||
          orderItem.order.status.toLowerCase().includes(query)
        );
      });
    }
  },
  mounted() {
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await axios.get(
          'http://26.235.139.202:8080/api/admin/orders',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              Accept: 'application/json'
            }
          }
        );
        // Припускаємо, що API повертає масив замовлень у response.data.data
        this.orders = response.data.data;
      } catch (error) {
        console.error('Помилка отримання замовлень:', error);
      }
    },
    async showOrderDetails(orderId) {
      try {
        const response = await axios.get(
          `http://26.235.139.202:8080/api/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              Accept: 'application/json'
            }
          }
        );
        // Припускаємо, що деталі замовлення знаходяться в response.data.data
        this.orderDetails = response.data.data;
        this.showDetailsModal = true;
      } catch (error) {
        console.error('Помилка отримання деталей замовлення:', error);
      }
    },
    async deleteOrder(orderId) {
      try {
        const response = await axios.delete(
          `http://26.235.139.202:8080/api/admin/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              Accept: 'application/json'
            }
          }
        );
        console.log('Замовлення видалено:', response.data);
        this.fetchOrders();
      } catch (error) {
        console.error('Помилка видалення замовлення:', error);
      }
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.orderDetails = {};
    },
    onSearch() {
      console.log('Пошук:', this.searchQuery);
      // Додаткова логіка пошуку, якщо потрібно
    }
  }
};
</script>

<style scoped>
/* Загальний контейнер */
.order-list {
  max-width: 1200px;
  margin: 20px auto;
  font-family: Montserrat, sans-serif;
  padding: 0 20px;
}

.order-list__title {
  color: #000;
  font-size: 32px;
  font-weight: 700;
}

/* Блок із фільтрами */
.order-list__controls {
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
  background-color: #F1E9E9;
  border-radius: 8px;
  padding: 8px 20px;
}
.search-input {
  border: none;
  background: transparent;
  font-size: 16px;
  color: #000;
  outline: none;
}
.controls-right {}

/* Контейнер таблиці з горизонтальним скролом */
.order-table-container {
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
}

/* Заголовок таблиці (7 колонок) */
.order-table__header {
  display: grid;
  grid-template-columns: 5% 15% 15% 15% 15% 15% 20%;
  column-gap: 16px;
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

/* Список замовлень */
.order-list__items {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Кожен рядок замовлення (7 колонок) */
.order-item {
  display: grid;
  grid-template-columns: 5% 15% 15% 15% 15% 15% 20%;
  column-gap: 16px;
  align-items: center;
  padding: 16px;
  margin-top: 12px;
  border-radius: 12px;
  background-color: #FFF7F6;
  border: 2px solid #E6E6E6;
  min-width: 800px;
}

/* Стилі для колонок */
.order-item__id {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}
.order-item__date,
.order-item__status,
.order-item__total,
.order-item__payment,
.order-item__delivery {
  font-size: 14px;
  color: #000;
}

/* Колонка з діями */
.order-item__actions {
  display: flex;
  gap: 6px;
  justify-content: flex-start;
}

/* Кнопки дій */
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
  transition: background-color 0.2s ease;
}
.action-button:hover {
  background-color: #b19694;
}

/* Модальне вікно */
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
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
