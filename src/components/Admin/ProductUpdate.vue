<template>
  <div class="form-container">
    <h2 class="page-title">Оновлення Товару</h2>
    <form @submit.prevent="updateProduct" enctype="multipart/form-data">
      <!-- Фото -->
      <div class="form-group">
        <label for="productImage" class="form-label">Завантажити Фото</label>
        <input type="file" id="productImage" @change="handleFileUpload" accept="image/*">
      </div>
      <!-- Назва товару -->
      <div class="form-group">
        <label for="productName" class="form-label">Назва товару</label>
        <input type="text" id="productName" v-model="product.name" class="form-input" required>
      </div>
      <!-- Категорія -->
      <div class="form-group">
        <label for="productCategory" class="form-label">Категорія</label>
        <select id="productCategory" v-model="product.category" class="form-input" required>
          <option v-for="option in formOptions.categories" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <!-- Ціна -->
      <div class="form-group">
        <label for="productPrice" class="form-label">Ціна</label>
        <input type="number" id="productPrice" v-model.number="product.price" class="form-input" required>
      </div>
      <!-- Виробник бісеру -->
      <div class="form-group">
        <label for="beadProducer" class="form-label">Виробник бісеру</label>
        <select id="beadProducer" v-model="product.bead_producer" class="form-input" required>
          <option v-for="option in formOptions.beadProducers" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <!-- Країна виробництва -->
      <div class="form-group">
        <label for="countryOfManufacture" class="form-label">Країна виробництва</label>
        <select id="countryOfManufacture" v-model="product.country_of_manufacture" class="form-input" required>
          <option v-for="option in formOptions.countries" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <!-- Тип бісеру -->
      <div class="form-group">
        <label for="typeOfBead" class="form-label">Тип бісеру</label>
        <select id="typeOfBead" v-model="product.type_of_bead" class="form-input" required>
          <option v-for="option in formOptions.typesOfBead" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <!-- Вага -->
      <div class="form-group">
        <label for="productWeight" class="form-label">Вага</label>
        <input type="number" id="productWeight" v-model.number="product.weight" class="form-input" required>
      </div>
      <!-- Кольори -->
      <div class="form-group">
        <label class="form-label">Кольори</label>
        <div class="color-options">
          <label v-for="color in formOptions.colors" :key="color.name" class="color-option">
            <input type="checkbox" :value="color.name" v-model="product.colors">
            <span class="color-swatch" :style="{ backgroundColor: color.hex }"></span>
            <span class="color-label">{{ color.name }}</span>
          </label>
        </div>
      </div>
      <!-- Розміри -->
      <div class="form-group">
        <label class="form-label">Розміри</label>
        <div v-for="(size, index) in product.sizes" :key="index" class="size-group">
          <input type="number" v-model.number="size.size" class="form-input" placeholder="Розмір" required>
          <input type="number" v-model.number="size.quantity" class="form-input" placeholder="Кількість" required>
          <button type="button" @click="removeSize(index)" class="remove-button">-</button>
        </div>
        <button type="button" @click="addSize" class="add-button">+</button>
      </div>
      <!-- Фурнітура -->
      <div class="form-group">
        <label class="form-label">Фурнітура</label>
        <div v-for="(fitting, index) in product.fittings" :key="index" class="fitting-group">
          <select v-model="fitting.fitting" class="form-input" required>
            <option v-for="option in formOptions.fittings" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <select v-model="fitting.material" class="form-input" required>
            <option v-for="option in formOptions.materials" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <input type="number" v-model.number="fitting.quantity" class="form-input" placeholder="Кількість" required>
          <button type="button" @click="removeFitting(index)" class="remove-button">-</button>
        </div>
        <button type="button" @click="addFitting" class="add-button">+</button>
      </div>
      <!-- Кнопка оновлення -->
      <button type="submit" class="submit-button">Оновити Товар</button>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "ProductUpdate",
  props: {
    productId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      product: {
        id: this.productId,
        image: null,
        name: "",
        category: "",
        price: null,
        bead_producer: "",
        country_of_manufacture: "",
        type_of_bead: "",
        weight: null,
        colors: [],
        sizes: [],
        fittings: []
      },
      formOptions: {
        categories: [],
        beadProducers: [],
        countries: [],
        typesOfBead: [],
        colors: [
          { name: 'Чорний', hex: '#000000' },
          { name: 'Білий', hex: '#ffffff' },
          { name: 'Червоний', hex: '#ff0000' },
          { name: 'Зелений', hex: '#008000' },
          { name: 'Синій', hex: '#0000ff' },
          { name: 'Жовтий', hex: '#ffff00' },
          { name: 'Помаранчевий', hex: '#ffa500' },
          { name: 'Фіолетовий', hex: '#800080' },
          { name: 'Коричневий', hex: '#a52a2a' },
          { name: 'Сірий', hex: '#808080' },
          { name: 'Рожевий', hex: '#ffc0cb' },
          { name: 'Блакитний', hex: '#add8e6' },
          { name: 'Бежевий', hex: '#f5f5dc' },
          { name: 'Золотий', hex: '#ffd700' },
          { name: 'Сріблястий', hex: '#c0c0c0' }
        ],
        fittings: [],
        materials: []
      }
    };
  },
  methods: {
    async fetchFormOptions() {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://26.235.139.202:8080/api/admin/products/form-data", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Якщо API повертає дані у форматі response.data.data, замініть відповідно.
        this.formOptions.categories = response.data.categories || [];
        this.formOptions.beadProducers = response.data.beadProducers || [];
        this.formOptions.countries = response.data.countries || [];
        this.formOptions.typesOfBead = response.data.typesOfBead || [];
        this.formOptions.fittings = response.data.fittings || [];
        this.formOptions.materials = response.data.materials || [];
        // Список кольорів залишається фіксованим.
      } catch (error) {
        console.error('Помилка завантаження даних форми:', error.response || error);
      }
    },
    fetchProductDetails() {
      const token = localStorage.getItem("token");
      console.log("Fetching product details for id:", this.productId);
      axios.get(`http://26.235.139.202:8080/api/admin/products/${this.productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        const data = response.data;
        // Якщо дані повертаються у response.data.data, використовуйте data = response.data.data;
        this.product = {
          ...this.product,
          name: data.name,
          category: data.category,
          price: data.price,
          bead_producer: data.bead_producer,
          country_of_manufacture: data.country_of_manufacture,
          type_of_bead: data.type_of_bead,
          weight: data.weight,
          colors: data.colors || [],
          sizes: data.sizes || [],
          fittings: data.fittings || []
        };
      })
      .catch(error => {
        console.error('Помилка завантаження товару:', error.response || error);
      });
    },
    handleFileUpload(event) {
      this.product.image = event.target.files[0];
    },
    addSize() {
      this.product.sizes.push({ size: '', quantity: 1 });
    },
    removeSize(index) {
      this.product.sizes.splice(index, 1);
    },
    addFitting() {
      this.product.fittings.push({ fitting: '', material: '', quantity: 1 });
    },
    removeFitting(index) {
      this.product.fittings.splice(index, 1);
    },
    updateProduct() {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      
      if (this.product.image) {
        formData.append('image', this.product.image);
      }
      formData.append('name', this.product.name);
      formData.append('category', this.product.category);
      formData.append('price', this.product.price);
      formData.append('bead_producer', this.product.bead_producer);
      formData.append('country_of_manufacture', this.product.country_of_manufacture);
      formData.append('type_of_bead', this.product.type_of_bead);
      formData.append('weight', this.product.weight);
      formData.append('colors', JSON.stringify(this.product.colors));
      formData.append('sizes', JSON.stringify(this.product.sizes));
      formData.append('fittings', JSON.stringify(this.product.fittings));
      formData.append('_method', 'PATCH');

      axios.post(`http://26.235.139.202:8080/api/products/${this.productId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        console.log('Товар оновлено:', response.data);
        this.$emit('product-updated', response.data);
      })
      .catch(error => {
        console.error('Помилка оновлення товару:', error.response || error);
      });
    }
  },
  created() {
    this.fetchFormOptions();
    this.fetchProductDetails();
  }
};
</script>

<style scoped>
.page-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 20px;
}
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #F1E9E9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
.form-group {
  margin-bottom: 15px;
}
.form-label {
  display: block;
  font-weight: 600;
  color: #040404;
  margin-bottom: 5px;
}
.form-input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 10px;
}
.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.color-option {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-family: Montserrat, sans-serif;
  font-size: 14px;
}
.color-option input[type="checkbox"] {
  margin: 0;
}
.color-swatch {
  width: 20px;
  height: 20px;
  border: 1px solid #ccc;
  border-radius: 50%;
  display: inline-block;
}
.remove-button, .add-button, .submit-button {
  /* Ваші стилі для кнопок */
}
</style>
