<template>
  <article class="product-card">
    <img :src="product.image" :alt="product.name" class="product-image" />
    <div class="product-details">
      <h2 class="product-name">{{ product.name }}</h2>
      <p class="product-price">{{ product.price }}</p>
      <p class="product-material">{{ product.material }}</p>
      <div class="product-actions">
        <button
          class="action-button update-button"
          @click="$emit('update-product', product)"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/d62ecd6a0ba33c8e03dea9a0e01ed58597cdbb804851ef4c6c5cb5302696985b?apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="Update icon"
            class="action-icon"
          />
          <span>Оновити</span>
        </button>
        <button
          class="action-button delete-button"
          @click="$emit('delete-product', product.id)"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/ba078f16c37c9f7f4a38bffc3903a0783959b7a0f9fc95368926f1c2df1ef2a7?apiKey=c3e46d0a629546c7a48302a5db3297d5"
            alt="Delete icon"
            class="action-icon"
          />
          <span>Видалити</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  }
};
</script>

<style scoped>
/* Загальний стиль картки */
.product-card {
  border-radius: 16px;
  background-color: #FFF7F6;
  border: 2px solid #E6E6E6;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
}

/* Ховер-ефект */
.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Зображення в картці */
.product-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}

/* Деталі товару */
.product-details {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Назва товару */
.product-name {
  font-family: Merriweather, serif;
  font-size: 20px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

/* Ціна товару */
.product-price {
  font-family: Inter, sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #A01212;
  margin: 0;
}

/* Матеріал */
.product-material {
  font-family: Merriweather, serif;
  font-size: 16px;
  color: #6D6D6D;
  margin: 0;
}

/* Контейнер для кнопок */
.product-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

/* Кнопки */
.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #C4AEAC;
  border: none;
  border-radius: 12px;
  padding: 8px 15px;
  cursor: pointer;
  font-family: Montserrat, sans-serif;
  font-size: 16px;
  color: #000;
  transition: background-color 0.2s ease;
}

/* Ховер-ефект для кнопок */
.action-button:hover {
  background-color: #b19694;
}

/* Іконки кнопок */
.action-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style>
