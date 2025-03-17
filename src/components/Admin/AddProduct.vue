<template> 
  <main class="product-add">
    <header class="product-header">
      <h1 class="product-title">Додавання продукту</h1>
    </header>
    <section class="product-form-container">
      <form class="product-form" @submit.prevent="addProduct" enctype="multipart/form-data">
        <!-- Назва продукту -->
        <div class="form-group">
          <label for="productName" class="form-label">Назва продукту</label>
          <input id="productName" v-model="form.name" type="text" class="form-input" required>
        </div>
        <!-- Зображення (jpg, jpeg, png) -->
        <div class="form-group">
          <label for="productImage" class="form-label">Зображення (jpg, jpeg, png)</label>
          <input id="productImage" type="file" class="form-input" @change="onImageChange" accept=".jpg,.jpeg,.png" required>
        </div>
        <!-- Категорія -->
        <div class="form-group">
          <label for="productCategory" class="form-label">Категорія</label>
          <select id="productCategory" v-model="form.category" class="form-input" required>
            <option v-for="category in formData.categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <!-- Ціна -->
        <div class="form-group">
          <label for="productPrice" class="form-label">Ціна</label>
          <input id="productPrice" v-model.number="form.price" type="number" class="form-input" required>
        </div>
        <!-- Виробник бісеру -->
        <div class="form-group">
          <label for="beadProducer" class="form-label">Виробник бісеру</label>
          <select id="beadProducer" v-model="form.bead_producer" class="form-input" required>
            <option v-for="producer in formData.bead_producers" :key="producer" :value="producer">
              {{ producer }}
            </option>
          </select>
        </div>
        <!-- Країна виробництва -->
        <div class="form-group">
          <label for="countryOfManufacture" class="form-label">Країна виробництва</label>
          <select id="countryOfManufacture" v-model="form.country_of_manufacture" class="form-input" required>
            <option v-for="country in formData.countries" :key="country" :value="country">
              {{ country }}
            </option>
          </select>
        </div>
        <!-- Тип бісеру -->
        <div class="form-group">
          <label for="typeOfBead" class="form-label">Тип бісеру</label>
          <select id="typeOfBead" v-model="form.type_of_bead" class="form-input" required>
            <option v-for="type in formData.types_of_bead" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <!-- Вага -->
        <div class="form-group">
          <label for="productWeight" class="form-label">Вага</label>
          <input id="productWeight" v-model.number="form.weight" type="number" class="form-input" required>
        </div>
        <!-- Кольори (вибір за допомогою чекбоксів з кольоровими кружочками) -->
        <div class="form-group">
          <label class="form-label">Кольори</label>
          <div class="color-options">
            <label v-for="color in formData.colors" :key="color.name" class="color-option">
              <input type="checkbox" :value="color.name" v-model="form.colors">
              <span class="color-swatch" :style="{ backgroundColor: color.hex }"></span>
              <span class="color-label">{{ color.name }}</span>
            </label>
          </div>
        </div>
        <!-- Розміри (масив об'єктів) -->
        <div class="form-group">
          <label class="form-label">Розміри</label>
          <div v-for="(size, index) in form.sizes" :key="index" class="size-group">
            <input v-model.number="size.size" type="number" class="form-input" placeholder="Розмір" required>
            <input v-model.number="size.quantity" type="number" class="form-input" placeholder="Кількість" required>
            <button type="button" @click="removeSize(index)" class="remove-button">-</button>
          </div>
          <button type="button" @click="addSize" class="add-button">+</button>
        </div>
        <!-- Фурнітура (масив об'єктів) -->
        <div class="form-group">
          <label class="form-label">Фурнітура</label>
          <div v-for="(fitting, index) in form.fittings" :key="index" class="fitting-group">
            <select v-model="fitting.fitting" class="form-input" required>
              <option v-for="f in formData.fittings" :key="f" :value="f">
                {{ f }}
              </option>
            </select>
            <select v-model="fitting.material" class="form-input" required>
              <option v-for="material in formData.materials" :key="material" :value="material">
                {{ material }}
              </option>
            </select>
            <input v-model.number="fitting.quantity" type="number" class="form-input" placeholder="Кількість" required>
            <button type="button" @click="removeFitting(index)" class="remove-button">-</button>
          </div>
          <button type="button" @click="addFitting" class="add-button">+</button>
        </div>
        <button type="submit" class="submit-button">Додати продукт</button>
      </form>
    </section>
  </main>
</template>

<script>
export default {
  name: 'ProductAddForm',
  data() {
    return {
      form: {
        name: '',
        category: '',
        price: 0,
        bead_producer: '',
        country_of_manufacture: '',
        type_of_bead: '',
        weight: 0,
        colors: [],
        sizes: [{ size: 0, quantity: 1 }],
        fittings: [{ fitting: '', material: '', quantity: 1 }],
      },
      // Якщо API повертає інший список, його можна об'єднати з цим.
      formData: {
        categories: [],
        bead_producers: [],
        countries: [],
        types_of_bead: [],
        // Фіксований список кольорів із назвами та hex-кодами:
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
        materials: [],
      },
      image: null,
    };
  },
  methods: {
    async fetchFormData() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch('http://26.235.139.202:8080/api/admin/products/form-data', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP помилка: ${response.status}`);
        }
        const result = await response.json();
        console.log(result.data); // Перевірка отриманих даних
        // Якщо API повертає дані для інших полів, оновлюємо їх:
        this.formData.categories = result.data.categories || [];
        this.formData.bead_producers = result.data.bead_producers || [];
        this.formData.countries = result.data.countries_of_manufacture || [];
        this.formData.types_of_bead = result.data.type_of_bead || [];
        this.formData.fittings = result.data.fittings || [];
        this.formData.materials = result.data.materials || [];
        // Список кольорів залишаємо фіксованим, як визначено вище.
      } catch (error) {
        console.error('Помилка завантаження даних:', error);
        alert('Не вдалося завантажити дані форми. Перевірте зʼєднання з сервером.');
      }
    },
    onImageChange(event) {
      this.image = event.target.files[0];
    },
    addSize() {
      this.form.sizes.push({ size: 0, quantity: 1 });
    },
    removeSize(index) {
      this.form.sizes.splice(index, 1);
    },
    addFitting() {
      this.form.fittings.push({ fitting: '', material: '', quantity: 1 });
    },
    removeFitting(index) {
      this.form.fittings.splice(index, 1);
    },
    async addProduct() {
      const formData = new FormData();
      formData.append('image', this.image);
      formData.append('name', this.form.name);
      formData.append('category', this.form.category);
      formData.append('price', this.form.price);
      formData.append('bead_producer', this.form.bead_producer);
      formData.append('country_of_manufacture', this.form.country_of_manufacture);
      formData.append('type_of_bead', this.form.type_of_bead);
      formData.append('weight', this.form.weight);

      // Додаємо кольори як масив
      this.form.colors.forEach(color => {
        formData.append('colors[]', color);
      });

      // Додаємо розміри
      this.form.sizes.forEach((size, index) => {
        formData.append(`sizes[${index}][size]`, size.size);
        formData.append(`sizes[${index}][quantity]`, size.quantity);
      });

      // Додаємо фурнітуру
      this.form.fittings.forEach((fitting, index) => {
        formData.append(`fittings[${index}][fitting]`, fitting.fitting);
        formData.append(`fittings[${index}][material]`, fitting.material);
        formData.append(`fittings[${index}][quantity]`, fitting.quantity);
      });

      console.log([...formData.entries()]); // Перевірка вмісту formData

      try {
        const token = localStorage.getItem("token");
        const response = await fetch('http://26.235.139.202:8080/api/admin/products', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('Помилка сервера:', errorResponse);
          throw new Error('Не вдалося додати продукт');
        }

        const data = await response.json();
        console.log('Продукт додано:', data);
        alert('Продукт успішно додано!');
        this.resetForm();
      } catch (error) {
        console.error('Помилка при додаванні продукту:', error);
        alert('Не вдалося додати продукт. Перевірте введені дані.');
      }
    },
    resetForm() {
      this.form = {
        name: '',
        category: '',
        price: 0,
        bead_producer: '',
        country_of_manufacture: '',
        type_of_bead: '',
        weight: 0,
        colors: [],
        sizes: [{ size: 0, quantity: 1 }],
        fittings: [{ fitting: '', material: '', quantity: 1 }],
      };
      this.image = null;
    },
  },
  created() {
    this.fetchFormData();
  },
};
</script>

<style scoped>
.product-add {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.product-header {
  text-align: center;
  margin-bottom: 20px;
}
.product-title {
  font-family: Montserrat, sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #000;
}
.product-form-container {
  background-color: #FFF7F6;
  border: 1px solid #E6E6E6;
  border-radius: 8px;
  padding: 20px;
}
.product-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-label {
  font-family: Montserrat, sans-serif;
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
}
.form-input {
  padding: 10px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
/* Стилізація вибору кольорів */
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
.size-group,
.fitting-group {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.remove-button,
.add-button {
  background-color: #C4AEAC;
  border: none;
  color: #fff;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  padding: 4px 8px;
}
.remove-button:hover,
.add-button:hover {
  background-color: #b19694;
}
.submit-button {
  background-color: #6B1F1F;
  color: #fff;
  padding: 12px;
  font-size: 18px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.submit-button:hover {
  background-color: #a01212;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .product-add {
    padding: 10px;
  }
  .form-input {
    font-size: 14px;
    padding: 8px;
  }
  .form-label {
    font-size: 14px;
  }
  .submit-button {
    font-size: 16px;
    padding: 10px;
  }
}
</style>
