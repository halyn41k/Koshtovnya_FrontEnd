<template>
  <article class="cart-item">
    <div class="item-number">{{ itemNumber }}.</div>
    <div class="item-content">
      <img :src="imageSrc" :alt="title" class="item-image" />
      <div class="item-details">
        <div class="item-header">
          <div class="item-info">
            <h3 class="item-title">{{ title }}</h3>
            <p class="item-price">
              {{ price }}₴ / за штуку
            </p>
            <div class="size-selector">
              <label for="size-select" class="size-label">Розмір:</label>
              <select id="size-select" class="size-dropdown" v-model="selectedVariant.size" @change="updateSize">
                <option v-for="variant in variants" :key="variant.size" :value="variant.size"
                  :disabled="!variant.isAvailable" :class="{ 'disabled-option': !variant.isAvailable }">
                  {{ variant.size }}
                </option>
              </select>
            </div>
          </div>
          <button @click="removeItem" class="remove-button" aria-label="Видалити товар">Х</button>
        </div>
        <div class="item-controls">
          <p class="item-quantity">Кількість: {{ quantity }}</p>
          <div class="quantity-controls">
            <!-- Increase and Decrease buttons are disabled if the item is unavailable -->
            <button class="quantity-button increase" @click="increaseQuantity" :disabled="!isAvailable">+</button>
            <button class="quantity-button decrease" @click="decreaseQuantity" :disabled="!isAvailable">-</button>
          </div>
          <p class="item-total">Загальна: {{ totalPrice }}₴</p>

          <!-- Error message if the product is unavailable -->
          <p v-if="!isAvailable" class="error-message">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'CartItem',
  type: String,
  props: {
    id: { type: String, required: true },
    itemNumber: { type: Number, required: true },
    imageSrc: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true }, // Added isAvailable prop
    errorMessage: { type: String, default: '' }, // Added errorMessage prop
    selectedSize: { type: String, required: true },
    variants: { type: Array, required: true },
  },
  data() {
    return {
      selectedQuantity: 1, // Початкове значення кількості
    };
  },
  computed: {
    selectedVariant() {
      if (!this.selectedSize && this.variants.length) {
        this.$emit('change-size', { id: this.id, size: this.variants[0].size });
      }
      return this.variants.find((variant) => variant.size === this.selectedSize) || {};
    },
    totalPrice() {
      return this.price * this.quantity;
    },
  },
  methods: {
    increaseQuantity() {
      if (this.isAvailable) {
        this.$emit('change-quantity', { id: this.id, quantity: this.quantity + 1, operation: 'increase' });
      }
    },
    decreaseQuantity() {
      if (this.isAvailable && this.quantity > 1) {
        this.$emit('change-quantity', { id: this.id, quantity: this.quantity - 1, operation: 'decrease' });
      }
    },
    removeItem() {
      this.$emit('remove-item', this.id);
    },
    updateSize() {
      if (this.selectedVariant.size) {
        this.$emit('change-size', { id: this.id, size: this.selectedVariant.size });
      }
    }

  }
};
</script>


<style scoped>
/* Controls */
.size-selector {
  margin-top: 20px;
}

.size-dropdown option:disabled,
.size-dropdown option.disabled-option {
  color: #A0A0A0;
  /* Сірий колір для недоступних варіантів */
  background-color: #F6E7E7;
  /* Основний фон */
}



.size-dropdown {
  width: 170px;
  height: 35px;
  background-color: #F6E7E7;
  /* основний колір фону */
  border: none;
  margin-left: 5px;
  font-family: 'Montserrat', sans-serif;
  padding-right: 20px;
  background-image: url('data:image/svg+xml;base64,...');
  background-position: calc(100% - 10px) center;
  background-repeat: no-repeat;

}

.size-dropdown option {
  background-color: #F6E7E7;
  /* основний колір */
  color: #171717;
  /* колір тексту */
}

.size-dropdown option:hover {
  background-color: #D8B3B3;
  /* темніший колір, коли наведено */
}

.cart-item {
  display: flex;
  border-radius: 16px;
  background-color: rgba(255, 247, 246, 1);
  border: 1px solid rgba(230, 230, 230, 1);
  overflow: hidden;
  margin-bottom: 40px;
  padding: 15px;
  height: auto;
  max-width: 800px;
  margin-left: 100px;
}

.item-number {
  font-feature-settings: "liga" off, "clig" off;
  color: #333;
  font: 600 32px/1.3 Montserrat, sans-serif;
  padding: 20px;
  margin: 0;
  margin-top: 60px;
}

.item-content {
  display: flex;
  flex-grow: 1;
  padding: 10px;
  align-items: center;
}

.item-image {
  width: 150px;
  /* Збільшено на 3px */
  height: 150px;
  /* Збільшено на 3px */
  object-fit: cover;
  border-radius: 8px;
  margin-right: 15px;
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}


.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-title {
  color: #000;
  font-family: Merriweather, sans-serif;
  font-weight: 700;
  font-size: 20px;
  /* Збільшено на 5px */
}

.item-price {
  color: rgba(160, 18, 18, 1);
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 16px;
}

.remove-button {
  border-radius: 5px;
  background-color: rgba(107, 31, 31, 1);
  color: #fff;
  padding: 5px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  position: relative;
  top: -35px;
  /* Піднято на 15px */
}

.item-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.size-label {
  .size-label {
    font-size: 20px !important;
  }

}

.item-quantity {
  color: rgba(121, 16, 16, 0.5);
  font-size: 17px;
}

.quantity-controls {
  display: flex;
  gap: 8px;
}

.quantity-button {
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 18px;
  border: none;
  cursor: pointer;
}

.increase {
  background-color: rgba(107, 31, 31, 1);
  color: #fff;
}

.decrease {
  background-color: rgba(230, 230, 230, 1);
  color: rgba(107, 31, 31, 1);
}

.item-total {
  color: rgba(160, 18, 18, 1);
  font-size: 16px;
  font-family: Inter, sans-serif;
  font-weight: 600;
}

@media (max-width: 991px) {
  .cart-item {
    flex-direction: column;
    padding: 10px;
    margin-left: 20px;
    max-width: 100%;
  }

  .item-number {
    font-size: 24px;
    padding: 10px 0;
  }

  .item-content {
    flex-direction: column;
    align-items: center;
    padding: 10px 0;
  }

  .item-image {
    margin: 10px 0;
  }

  .item-details {
    margin: 0;
    text-align: center;
  }
}
</style>
