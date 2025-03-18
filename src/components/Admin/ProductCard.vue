<template>
  <article class="product-card" :class="{ deleted: product.is_deleted }">
    <div class="image-container" v-if="hasValidImage">
      <img 
        :src="imageUrl" 
        :alt="product.name" 
        class="product-image" 
        @error="handleImageError"
      />
    </div>
    <div class="product-details">
      <h2 class="product-name">{{ product.name }}</h2>
      <p class="product-price">{{ product.price }} грн</p>
      <p class="product-material">{{ product.material }}</p>
      <div class="product-actions">
        <button
          v-if="!product.is_deleted"
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
        <button
          v-else
          class="action-button restore-button"
          @click="$emit('restore-product', product.id)"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/restore-icon-placeholder.png"
            alt="Restore icon"
            class="action-icon"
          />
          <span>Відновити</span>
        </button>
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
  },
  computed: {
    // Перевірка, чи існує коректний URL у product.image або product.image_url
    hasValidImage() {
      return (
        (this.product.image && typeof this.product.image === 'string' && this.product.image.trim() !== '') ||
        (this.product.image_url && typeof this.product.image_url === 'string' && this.product.image_url.trim() !== '')
      );
    },
    // Повертає product.image, якщо воно існує, інакше product.image_url
    imageUrl() {
      if (this.product.image && typeof this.product.image === 'string' && this.product.image.trim() !== '') {
        return this.product.image;
      } else if (this.product.image_url && typeof this.product.image_url === 'string' && this.product.image_url.trim() !== '') {
        return this.product.image_url;
      }
      return '';
    }
  },
  methods: {
    handleImageError(event) {
      console.error(
        `Не вдалося завантажити зображення для product ID ${this.product.id}. URL: ${this.imageUrl}`,
        event
      );
    }
  },
  mounted() {
    if (!this.hasValidImage) {
      console.error(
        `Product ID ${this.product.id}: Відсутнє поле image або image_url. Серверна відповідь:`,
        this.product
      );
    }
  }
};
</script>

<style scoped>
.product-card {
  border-radius: 16px;
  background-color: #FFF7F6;
  border: 1px solid #E6E6E6;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin: 16px;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

/* Стиль для видалених товарів */
.product-card.deleted {
  opacity: 0.5;
  filter: grayscale(100%);
}

.image-container {
  width: 395px;
  height: 303px;
  overflow: hidden;
  margin: 0 auto;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-details {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-name {
  font-family: 'Merriweather', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  line-height: 1.2;
}

.product-price {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #A01212;
  margin: 0;
}

.product-material {
  font-family: 'Merriweather', serif;
  font-size: 1rem;
  color: #6D6D6D;
  margin: 0;
}

.product-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #C4AEAC;
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.9rem;
  color: #161616;
  transition: background-color 0.2s ease;
}

.action-button:hover {
  background-color: #b19694;
}

.delete-button {
  /* Стилізація для кнопки видалення, якщо потрібно */
}

.restore-button {
  background-color: #27ae60;
  color: #fff;
}

.update-button {
  /* Стилізація для кнопки оновлення, якщо потрібно */
}

.action-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .image-container {
    width: 100%;
    height: auto;
    aspect-ratio: 395 / 303;
  }
  .product-card {
    margin: 12px;
  }
  .product-details {
    padding: 12px;
  }
  .product-name {
    font-size: 1.1rem;
  }
  .product-price {
    font-size: 1rem;
  }
  .product-material {
    font-size: 0.9rem;
  }
  .action-button {
    font-size: 0.8rem;
    padding: 6px;
  }
  .action-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
