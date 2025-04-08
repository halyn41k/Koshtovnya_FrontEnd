<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <h2 class="modal-title">Додати товар</h2>
        <form @submit.prevent="submitForm">
          <!-- Назва та ціна -->
          <div class="form-group">
            <label>Назва</label>
            <input type="text" v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Ціна</label>
            <input type="number" v-model="form.price" required />
          </div>
          <!-- Селекти з даними форми -->
          <div class="form-group">
            <label>Категорія</label>
            <select v-model="form.category" required>
              <option value="">Оберіть категорію</option>
              <option v-for="item in formData.categories" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Бісер виробник</label>
            <select v-model="form.bead_producer" required>
              <option value="">Оберіть виробника</option>
              <option v-for="item in formData.bead_producers" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Країна виробництва</label>
            <select v-model="form.country_of_manufacture" required>
              <option value="">Оберіть країну</option>
              <option v-for="item in formData.countries_of_manufacture" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Тип бісеру</label>
            <select v-model="form.type_of_bead" required>
              <option value="">Оберіть тип</option>
              <option v-for="item in formData.type_of_bead" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
          <!-- Вага та колір -->
          <div class="form-group">
            <label>Вага</label>
            <input type="number" v-model="form.weight" required />
          </div>
          <div class="form-group">
            <label>Кольори</label>
            <div class="colors-container">
              <div
                v-for="color in formData.colors"
                :key="color"
                class="color-option"
                :class="{ selected: form.colors.includes(color) }"
                @click="toggleColor(color)"
              >
                <div class="color-circle" :style="{ backgroundColor: colorMap[color] || '#fff' }">
                  <!-- Галочка, показується тільки в .selected -->
                  <svg v-if="form.colors.includes(color)" class="check-icon" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" fill="none" stroke="#fff" stroke-width="2"/>
                  </svg>
                </div>
                <span class="color-label">{{ color }}</span>
              </div>


            </div>
          </div>

          <!-- Динамічні поля для розмірів -->
          <div class="form-group">
            <label>Розміри</label>
            <div v-for="(sizeItem, index) in form.sizes" :key="index" class="dynamic-field">
              <input type="text" v-model="sizeItem.size" placeholder="Розмір" required />
              <input type="number" v-model="sizeItem.quantity" placeholder="Кількість" min="1" required />
              <button type="button" @click="removeSize(index)">Видалити</button>
            </div>
            <button type="button" @click="addSize">Додати розмір</button>
          </div>
          <!-- Динамічні поля для фурнітури -->
          <div class="form-group">
            <label>Фурнітура</label>
            <div v-for="(fitItem, index) in form.fittings" :key="index" class="dynamic-field">
              <select v-model="fitItem.fitting" required>
                <option value="">Оберіть фурнітуру</option>
                <option v-for="item in formData.fittings" :key="item" :value="item">{{ item }}</option>
              </select>
              <select v-model="fitItem.material" required>
                <option value="">Оберіть матеріал</option>
                <option v-for="item in formData.materials" :key="item" :value="item">{{ item }}</option>
              </select>
              <input type="number" v-model="fitItem.quantity" placeholder="Кількість" min="1" required />
              <button type="button" @click="removeFitting(index)">Видалити</button>
            </div>
            <button type="button" @click="addFitting">Додати фурнітуру</button>
          </div>
          <!-- Зображення -->
          <div class="form-group">
            <label>Зображення</label>
            <input type="file" @change="handleFileChange" accept="image/jpeg,image/png,image/jpg" />
          </div>
          <!-- Дії -->
          <div class="modal-actions">
            <button type="button" class="modal-button cancel" @click="close">Скасувати</button>
            <button type="submit" class="modal-button submit">Додати</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  export default {
    name: 'AddProductModal',
    data() {
    return {
      colorMap: {
  'Чорний': '#000000',
  'Червоний': '#FF0000',
  'Білий': '#FFFFFF',
  'Зелений': '#008000',
  'Синій': '#0000FF',
  'Жовтий': '#FFFF00',
  'Помаранчевий': '#FFA500',
  'Фіолетовий': '#800080',
  'Коричневий': '#8B4513',
  'Сірий': '#808080',
  'Рожевий': '#FFC0CB',
  'Блакитний': '#87CEEB',
  'Бежевий': '#F5F5DC',
  'Золотий': '#FFD700',
  'Сріблястий': '#C0C0C0'
},

      form: {
        name: '',
        price: '',
        category: '',
        bead_producer: '',
        country_of_manufacture: '',
        type_of_bead: '',
        weight: '',
        // Замість color робимо colors як масив
        colors: [],
        sizes: [],
        fittings: [],
        image: null,
      },
      formData: {
        categories: [],
        bead_producers: [],
        countries_of_manufacture: [],
        type_of_bead: [],
        colors: [], // тут очікуємо перелік кольорів (наприклад, 'red', 'blue', 'green' або їхні значення)
        fittings: [],
        materials: [],
      }
      };
    },
    mounted() {
      axios
        .get('http://26.235.139.202:8080/api/admin/products/form-data', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
        .then(response => {
          const data = response.data.data;
          this.formData.categories = data.categories || [];
          this.formData.bead_producers = data.bead_producers || [];
          this.formData.countries_of_manufacture = data.countries_of_manufacture || [];
          this.formData.type_of_bead = data.type_of_bead || [];
          this.formData.colors = data.colors || [];
          this.formData.fittings = data.fittings || [];
          this.formData.materials = data.materials || [];
        })
        .catch(err => {
          console.error("Error fetching form data", err);
        });
    },
    methods: {
      handleFileChange(e) {
        const file = e.target.files[0];
        this.form.image = file;
      },
      addSize() {
        this.form.sizes.push({ size: '', quantity: 1 });
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

    toggleColor(color) {
      const index = this.form.colors.indexOf(color);
      if (index === -1) {
        this.form.colors.push(color);
      } else {
        this.form.colors.splice(index, 1);
      }
    },
    // ... інші методи (handleFileChange, addSize, submitForm тощо)
    submitForm() {
      const fd = new FormData();
      if (this.form.image) {
        fd.append('image', this.form.image);
      }
      fd.append('name', this.form.name);
      fd.append('price', this.form.price);
      fd.append('category', this.form.category);
      fd.append('bead_producer', this.form.bead_producer);
      fd.append('country_of_manufacture', this.form.country_of_manufacture);
      fd.append('type_of_bead', this.form.type_of_bead);
      fd.append('weight', this.form.weight);
      
      // Відправляємо кольори як масив
      this.form.colors.forEach(color => {
        fd.append('colors[]', color);
      });
      
      // Додаємо розміри як вкладені поля:
      this.form.sizes.forEach((item, index) => {
        fd.append(`sizes[${index}][size]`, item.size);
        fd.append(`sizes[${index}][quantity]`, item.quantity);
      });
      
      // Додаємо фурнітуру як вкладені поля:
      this.form.fittings.forEach((item, index) => {
        fd.append(`fittings[${index}][fitting]`, item.fitting);
        fd.append(`fittings[${index}][material]`, item.material);
        fd.append(`fittings[${index}][quantity]`, item.quantity);
      });
  
      axios
        .post('http://26.235.139.202:8080/api/admin/products', fd, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(response => {
          this.$emit('product-added', response.data.data);
        })
        .catch(error => {
          console.error("Error adding product", error);
        });
    },

      close() {
        this.$emit('close');
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  .modal-container {
    background-color: #fff;
    padding: 20px;
    border-radius: 6px;
    width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    font-family: Montserrat, sans-serif;
  }
  .modal-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 20px;
    text-align: center;
  }
  .form-group {
    margin-bottom: 15px;
  }
  .form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
  }
  .form-group input[type="text"],
  .form-group input[type="number"],
  .form-group select,
  .form-group input[type="file"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .dynamic-field {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  .dynamic-field input,
  .dynamic-field select {
    flex: 1;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .modal-button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }
  .modal-button.cancel {
    background-color: #ccc;
    color: #000;
  }
  .modal-button.submit {
    background-color: #6b1f1f;
    color: #fff;
  }
  .modal-button.submit:hover {
    background-color: #a01212;
  }

  .colors-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.color-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #ccc;
  margin-right: 6px;
  position: relative;
  transition: transform 0.2s ease, border-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.color-option:hover .color-circle {
  transform: scale(1.1);
}

.color-option.selected .color-circle {
  transform: scale(1.2);
  border-color: #333;
  animation: pulse 0.5s ease-out;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0,0,0,0.3);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(0,0,0,0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0,0,0,0);
  }
}

/* Іконка галочки */
.check-icon {
  width: 16px;
  height: 16px;
}



  </style>
  