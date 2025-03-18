<template>
  <div class="order-history">
    <h2 class="order-history-title">Історія замовлень</h2>

    <!-- Показати Loader під час завантаження -->
    <Loader v-if="loading" />

    <!-- Повідомлення, якщо замовлень немає -->
    <div v-else-if="orders.length === 0" class="no-orders">
      Ви не розмістили жодного замовлення :(
    </div>

    <!-- Відображення списку замовлень -->
    <div v-else>
      <div class="order-item" v-for="(order, index) in orders" :key="index">
        <div class="order-header">
          <span class="order-number">Замовлення №{{ order.id }}</span>
          <span class="order-status">Статус: {{ order.status }}</span>
        </div>
        <div class="order-details">
          <div v-for="(item, i) in order.items" :key="i" class="order-product">
            <img :src="item.image_url" alt="Product Image" class="order-product-image" />
            <div class="order-product-info">
              <!-- Якщо товар не видалено, відображаємо назву товару -->
              <h3 v-if="!item.is_deleted">{{ item.title }}</h3>
              <!-- Якщо товар видалено, відображаємо повідомлення -->
              <h3 v-else class="deleted-product">Товар видалено</h3>
              <p>Кількість: {{ item.quantity }}</p>
              <p>Ціна: {{ item.price }}₴</p>
              <!-- Посилання на деталі товару, тільки якщо він не видалений -->
              <router-link 
                v-if="!item.is_deleted" 
                :to="{ name: 'ProductDetail', params: { id: item.id } }">
                Деталі товару
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Loader from '@/components/Loader.vue'; // Імпорт Loader компонента

export default {
  name: 'OrderHistory',
  components: {
    Loader,
  },
  data() {
    return {
      orders: [],
      loading: true,
    };
  },
  methods: {
    async fetchOrders() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Будь ласка, увійдіть у свій обліковий запис.');
        this.$router.push('/login');
        return;
      }

      try {
        const response = await axios.get('http://26.235.139.202:8080/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Перетворення отриманих даних для зручного використання в компоненті
        this.orders = response.data.orders.map((order) => ({
          id: order.id,
          status: order.status,
          items: order.items.map((item) => ({
            id: item.id,
            title: item.name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url || 'default_image_path',
            is_deleted: item.is_deleted, // Додаємо прапорець is_deleted
          })),
        }));
      } catch (error) {
        console.error('Помилка завантаження замовлень:', error);
        alert('Не вдалося завантажити ваші замовлення.');
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    document.title = 'Історія замовлень';
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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  margin-left: -10px;
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

.order-item {
  display: flex;
  background-color: #F5EAE9;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  position: relative;
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
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-product {
  display: flex;
  align-items: center;
  gap: 15px;
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
</style>
