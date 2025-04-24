<template>
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>{{ title }}</h2>
        <form @submit.prevent="submitProduct" enctype="multipart/form-data">
          <!-- Зображення -->
          <div class="form-group">
            <label for="image">Зображення (jpg, jpeg, png):</label>
            <input type="file" id="image" accept="image/jpeg,image/jpg,image/png" @change="onFileChange" />
          </div>
  
          <!-- Назва -->
          <div class="form-group">
            <label for="name">Назва:</label>
            <input type="text" id="name" v-model="product.name" required />
          </div>
  
          <!-- Категорія -->
          <div class="form-group">
            <label for="category">Категорія:</label>
            <select id="category" v-model="product.category" required>
              <option disabled value="">Виберіть категорію</option>
              <option v-for="option in formData.category" :key="option.id" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
  
          <!-- Ціна -->
          <div class="form-group">
            <label for="price">Ціна:</label>
            <input type="number" id="price" v-model="product.price" step="0.01" required />
          </div>
  
          <!-- Bead Producer -->
          <div class="form-group">
            <label for="beadProducer">Виробник намистин:</label>
            <select id="beadProducer" v-model="product.bead_producer" required>
              <option disabled value="">Виберіть виробника</option>
              <option v-for="option in formData.bead_producer" :key="option.id" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
  
          <!-- Country of Manufacture -->
          <div class="form-group">
            <label for="country">Країна-виробник:</label>
            <select id="country" v-model="product.country_of_manufacture" required>
              <option disabled value="">Виберіть країну</option>
              <option v-for="option in formData.country_of_manufacture" :key="option.id" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
  
          <!-- Type of Bead -->
          <div class="form-group">
            <label for="typeOfBead">Тип намистин:</label>
            <select id="typeOfBead" v-model="product.type_of_bead" required>
              <option disabled value="">Виберіть тип</option>
              <option v-for="option in formData.type_of_bead" :key="option.id" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
  
          <!-- Вага -->
          <div class="form-group">
            <label for="weight">Вага:</label>
            <input type="number" id="weight" v-model="product.weight" step="0.01" required />
          </div>
  
          <!-- Colors (масив) -->
          <div class="form-group">
            <label>Кольори:</label>
            <div v-for="(color, index) in product.colors" :key="index" class="dynamic-field">
              <select v-model="product.colors[index]" required>
                <option disabled value="">Оберіть колір</option>
                <option v-for="option in formData.colors" :key="option.id" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <button type="button" @click="removeColor(index)">Видалити</button>
            </div>
            <button type="button" @click="addColor">Додати колір</button>
          </div>
  
          <!-- Sizes (масив) -->
          <div class="form-group">
            <label>Розміри:</label>
            <div v-for="(sizeItem, sIndex) in product.sizes" :key="sIndex" class="size-group">
              <div>
                <label>Розмір:</label>
                <input type="text" v-model="sizeItem.size" required />
              </div>
              <div>
                <label>Кількість:</label>
                <input type="number" v-model.number="sizeItem.quantity" min="1" required />
              </div>
              <!-- Fittings для даного розміру -->
              <div class="fittings-group">
                <label>Фурнітура:</label>
                <div v-for="(fit, fIndex) in sizeItem.fittings" :key="fIndex" class="dynamic-field">
                  <select v-model="fit.fitting" required>
                    <option disabled value="">Оберіть фурнітуру</option>
                    <option v-for="option in formData.fitting" :key="option.id" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                  <select v-model="fit.material" required>
                    <option disabled value="">Оберіть матеріал</option>
                    <option v-for="option in formData.material" :key="option.id" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                  <input type="number" v-model.number="fit.quantity" min="0" placeholder="Кількість" required />
                  <button type="button" @click="removeFitting(sIndex, fIndex)">Видалити</button>
                </div>
                <button type="button" @click="addFitting(sIndex)">Додати фурнітуру</button>
              </div>
              <button type="button" @click="removeSize(sIndex)">Видалити розмір</button>
            </div>
            <button type="button" @click="addSize">Додати розмір</button>
          </div>
  
          <!-- Кнопки -->
          <div class="form-group buttons">
            <button type="submit">Зберегти</button>
            <button type="button" @click="$emit('close')">Скасувати</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  export default {
    name: "ProductModal",
    props: {
      title: {
        type: String,
        default: "Створити продукт"
      }
    },
    data() {
      return {
        // Дані продукту
        product: {
          image: null,
          name: "",
          category: "",
          price: null,
          bead_producer: "",
          country_of_manufacture: "",
          type_of_bead: "",
          weight: null,
          colors: [],
          sizes: [] // кожен елемент: { size: '', quantity: 1, fittings: [ { fitting: '', material: '', quantity: 0 } ] }
        },
        // Дані для селектів із endpoint form-data
        formData: {
          category: [],
          bead_producer: [],
          country_of_manufacture: [],
          type_of_bead: [],
          colors: [],
          fitting: [],
          material: []
        }
      };
    },
    created() {
      this.fetchFormData();
    },
    methods: {
      onFileChange(e) {
        const file = e.target.files[0];
        if (file && /image\/(jpeg|jpg|png)/.test(file.type)) {
          this.product.image = file;
        } else {
          alert("Будь ласка, оберіть зображення формату jpg, jpeg або png.");
          e.target.value = "";
        }
      },
      async fetchFormData() {
        try {
          const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/products/form-data");
          // Припускаємо, що сервер повертає об'єкт з потрібними масивами (category, bead_producer, country_of_manufacture, type_of_bead, colors, fitting, material)
          this.formData = response.data;
        } catch (error) {
          console.error("Помилка завантаження даних для форми:", error);
        }
      },
      addColor() {
        this.product.colors.push("");
      },
      removeColor(index) {
        this.product.colors.splice(index, 1);
      },
      addSize() {
        this.product.sizes.push({
          size: "",
          quantity: 1,
          fittings: []
        });
      },
      removeSize(index) {
        this.product.sizes.splice(index, 1);
      },
      addFitting(sizeIndex) {
        this.product.sizes[sizeIndex].fittings.push({
          fitting: "",
          material: "",
          quantity: 0
        });
      },
      removeFitting(sizeIndex, fittingIndex) {
        this.product.sizes[sizeIndex].fittings.splice(fittingIndex, 1);
      },
      async submitProduct() {
        try {
          const token = localStorage.getItem("token");
          const formData = new FormData();
  
          // Додаємо файл зображення, якщо є
          if (this.product.image) {
            formData.append("image", this.product.image);
          }
          formData.append("name", this.product.name);
          formData.append("category", this.product.category);
          formData.append("price", this.product.price);
          formData.append("bead_producer", this.product.bead_producer);
          formData.append("country_of_manufacture", this.product.country_of_manufacture);
          formData.append("type_of_bead", this.product.type_of_bead);
          formData.append("weight", this.product.weight);
          // Для масивів – конвертуємо в JSON
          formData.append("colors", JSON.stringify(this.product.colors));
          formData.append("sizes", JSON.stringify(this.product.sizes));
  
          const response = await axios.post("https://koshtovnya.api-dev.bmax-edu.website/api/admin/products", formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          });
          console.log("Продукт створено:", response.data);
          this.$emit("saved", response.data);
          this.$emit("close");
        } catch (error) {
          console.error("Помилка створення продукту:", error);
        }
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
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background: #fff;
    padding: 20px;
    max-height: 90vh;
    overflow-y: auto;
    width: 600px;
    border-radius: 8px;
  }
  .form-group {
    margin-bottom: 15px;
  }
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  .dynamic-field {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }
  .size-group {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 10px;
  }
  .fittings-group {
    border-top: 1px dashed #ccc;
    padding-top: 10px;
    margin-top: 10px;
  }
  .buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  </style>
  