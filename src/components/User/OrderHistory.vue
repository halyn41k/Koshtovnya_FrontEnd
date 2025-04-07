<template> 
  <div class="order-history">
    <h2 class="order-history-title">Історія замовлень</h2>

    <!-- Loader при завантаженні -->
    <Loader v-if="loading" />

    <!-- Повідомлення, якщо замовлень немає -->
    <div v-else-if="orders.length === 0" class="no-orders">
      Ви не розмістили жодного замовлення :(
    </div>

    <!-- Відображення списку замовлень у прокручуваному контейнері -->
    <div v-else class="orders-container">
      <div class="order-item" v-for="order in orders" :key="order.id">
        <div class="order-header">
          <span class="order-number">Замовлення №{{ order.id }}</span>
          <span class="order-status">Статус: {{ order.status }}</span>
        </div>
        <div class="order-details">
          <div v-for="(item, i) in order.items" :key="i" class="order-product">
            <img :src="item.image_url" alt="Product Image" class="order-product-image" />
            <div class="order-product-info">
              <h3 v-if="!item.is_deleted">{{ item.title }}</h3>
              <h3 v-else class="deleted-product">Товар видалено</h3>
              <p>Кількість: {{ item.quantity }}</p>
              <p>Ціна: {{ item.price }}₴</p>
            </div>
          </div>
        </div>
        <button class="details-btn" @click="openOrderDetails(order)">
          Деталі замовлення
        </button>
      </div>
    </div>

    <!-- Модальне вікно з деталями замовлення -->
    <OrderDetailModal
      v-if="showModal"
      :order="selectedOrder"
      @close="closeModal"
    />
  </div>
</template>

<script>
import axios from "axios";
import Loader from '../Home/Loader.vue'
import OrderDetailModal from "./OrderDetailModal.vue";

export default {
  name: "OrderHistory",
  components: {
    Loader,
    OrderDetailModal,
  },
  data() {
    return {
      orders: [],
      loading: true,
      showModal: false,
      selectedOrder: null,
    };
  },
  methods: {
    async fetchOrders() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }

      try {
        const response = await axios.get("http://26.235.139.202:8080/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Припустимо, що API повертає об'єкт з полем "orders"
        this.orders = (response.data.orders || []).map((order) => ({
          id: order.id,
          status: order.status,
          // Якщо API повертає товари в полі "products"
          items: (order.products || []).map((item) => ({
            id: item.id,
            title: item.name, // або item.title, якщо так
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url || "default_image_path",
            is_deleted: item.is_deleted,
          })),
        }));
      } catch (error) {
        console.error("Помилка завантаження замовлень:", error);
        alert("Не вдалося завантажити ваші замовлення.");
      } finally {
        this.loading = false;
      }
    },
    openOrderDetails(order) {
      this.selectedOrder = order;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedOrder = null;
    },
  },
  mounted() {
    document.title = "Історія замовлень";
    this.fetchOrders();
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Merriweather:wght@400;700&family=Montserrat:wght@600&display=swap');

* {
  font-family: 'Merriweather', serif;
  box-sizing: border-box;
}

.order-history {
  margin: 0 auto;
  padding: 20px;
  max-height: 90vh; /* Максимальна висота контейнера для всього компонента */
  overflow-y: auto; /* Вертикальна прокрутка для всього компонента */
}

.order-history-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 20px;
  text-align: left;
}

.no-orders {
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-top: 30px;
}

/* Прокручуваний контейнер для списку замовлень */
.orders-container {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px; /* Додаємо відступ для прокрутки */
}

.order-item {
  background-color: #F5EAE9;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  transition: transform 0.3s;
}

.order-item:hover {
  transform: scale(1.02);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.order-number {
  font-family: 'Montserrat', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.order-status {
  font-size: 20px;
  font-family: 'Merriweather', serif;
  color: #555;
}

.order-details {
  margin-bottom: 15px;
}

.order-product {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.order-product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.order-product-info {
  display: flex;
  flex-direction: column;
}

.deleted-product {
  color: red;
  font-style: italic;
}

.details-btn {
  background-color: #6b1f1f;
  color: #fff;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
}
</style>
