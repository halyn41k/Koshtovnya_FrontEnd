<template>
    <div class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>Деталі замовлення №{{ order.id }}</h3>
        <p>Статус: {{ order.status }}</p>
        <div v-if="order.items && order.items.length">
          <div v-for="(item, index) in order.items" :key="index" class="order-product">
            <img :src="item.image_url" alt="Product Image" class="order-product-image" />
            <div class="order-product-info">
              <h4 v-if="!item.is_deleted">{{ item.title }}</h4>
              <h4 v-else class="deleted-product">Товар видалено</h4>
              <p>Кількість: {{ item.quantity }}</p>
              <p>Ціна: {{ item.price }}₴</p>
            </div>
          </div>
        </div>
        <button @click="closeModal" class="close-btn">Закрити</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "OrderDetailModal",
    props: {
      order: {
        type: Object,
        required: true,
      },
    },
    methods: {
      closeModal() {
        this.$emit("close");
      },
    },
  };
  </script>
  

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Merriweather:wght@400;700&family=Montserrat:wght@600&display=swap');

* {
  font-family: 'Merriweather', serif;
  box-sizing: border-box;
}
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: #fff;
    padding: 20px;
    width: 90%;
    max-width: 600px;
    border-radius: 8px;
  }
  
  .order-product {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
  }
  
  .order-product-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .deleted-product {
    color: red;
    font-style: italic;
  }
  
  .close-btn {
    background-color: #6b1f1f;
    color: #fff;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 18px;
  }
  </style>
  