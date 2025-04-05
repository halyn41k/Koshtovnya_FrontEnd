<template>
    <div class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <h2 class="modal-title">Редагувати товар</h2>
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
          <!-- Селектори з поточними значеннями -->
          <div class="form-group">
            <label>Категорія</label>
            <select v-model="form.category" required>
              <option v-for="item in formData.categories" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Бісер виробник</label>
            <select v-model="form.bead_producer" required>
              <option v-for="item in formData.bead_producers" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Країна виробництва</label>
            <select v-model="form.country_of_manufacture" required>
              <option v-for="item in formData.countries_of_manufacture" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Тип бісеру</label>
            <select v-model="form.type_of_bead" required>
              <option v-for="item in formData.type_of_bead" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>
          <!-- Вага -->
          <div class="form-group">
            <label>Вага</label>
            <input type="number" v-model="form.weight" required />
          </div>
          <!-- Кольори -->
          <div class="form-group">
            <label>Кольори (через кому)</label>
            <input type="text" v-model="colorsInput" placeholder="Наприклад: Жовтий, Блакитний" required />
          </div>
          <!-- Розміри (variants) -->
          <div class="form-group">
            <label>Розміри та кількість</label>
            <div v-for="(variant, index) in form.sizes" :key="index" class="dynamic-field">
              <input type="text" v-model="variant.size" placeholder="Розмір" required />
              <input type="number" v-model="variant.quantity" placeholder="Кількість" min="0" required />
              <button type="button" @click="removeSize(index)">Видалити</button>
            </div>
            <button type="button" @click="addSize">Додати розмір</button>
          </div>
          <!-- Фурнітура (type_of_fitting) -->
          <div class="form-group">
            <label>Фурнітура</label>
            <div v-for="(fit, index) in form.fittings" :key="index" class="dynamic-field">
              <select v-model="fit.fitting" required>
                <option v-for="item in formData.fittings" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>
              <select v-model="fit.material" required>
                <option v-for="item in formData.materials" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>
              <input type="number" v-model="fit.quantity" placeholder="Кількість" min="1" required />
              <button type="button" @click="removeFitting(index)">Видалити</button>
            </div>
            <button type="button" @click="addFitting">Додати фурнітуру</button>
          </div>
          <!-- Зображення -->
          <div class="form-group">
            <label>Зображення (залиште пустим, щоб не змінювати)</label>
            <input type="file" @change="handleFileChange" accept="image/jpeg,image/png,image/jpg" />
          </div>
          <!-- Дії -->
          <div class="modal-actions">
            <button type="button" class="modal-button cancel" @click="close">Скасувати</button>
            <button type="submit" class="modal-button submit">Зберегти</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  export default {
    name: "EditProductModal",
    props: {
      product: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        form: {
          name: "",
          price: "",
          category: "",
          bead_producer: "",
          country_of_manufacture: "",
          type_of_bead: "",
          weight: "",
          colors: [],
          sizes: [],
          fittings: [],
          image: null
        },
        formData: {
          categories: [],
          bead_producers: [],
          countries_of_manufacture: [],
          type_of_bead: [],
          colors: [],
          fittings: [],
          materials: []
        },
        colorsInput: ""
      };
    },
    created() {
      // Ініціалізуємо форму з даних товару
      this.initializeForm();
      // Завантажуємо дані для селекторів
      this.fetchFormData();
    },
    methods: {
      initializeForm() {
        this.form.name = this.product.name;
        this.form.price = this.product.price;
        this.form.category = this.product.category;
        this.form.bead_producer = this.product.bead_producer_name;
        this.form.country_of_manufacture = this.product.country_of_manufacture;
        this.form.type_of_bead = this.product.type_of_bead;
        this.form.weight = this.product.weight;
        this.form.colors = this.product.colors || [];
        this.colorsInput = this.form.colors.join(", ");
        // Для розмірів беремо product.variants і зберігаємо лише size та quantity
        this.form.sizes = this.product.variants
          ? this.product.variants.map(v => ({ size: v.size, quantity: v.quantity }))
          : [];
        // Для фурнітури беремо product.type_of_fitting
        this.form.fittings = this.product.type_of_fitting
          ? JSON.parse(JSON.stringify(this.product.type_of_fitting))
          : [];
      },
      fetchFormData() {
        axios
          .get("http://26.235.139.202:8080/api/admin/products/form-data", {
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
      handleFileChange(e) {
        const file = e.target.files[0];
        this.form.image = file;
      },
      addSize() {
        this.form.sizes.push({ size: "", quantity: 1 });
      },
      removeSize(index) {
        this.form.sizes.splice(index, 1);
      },
      addFitting() {
        this.form.fittings.push({ fitting: "", material: "", quantity: 1 });
      },
      removeFitting(index) {
        this.form.fittings.splice(index, 1);
      },
      submitForm() {
        // Перетворюємо рядок кольорів у масив
        this.form.colors = this.colorsInput.split(",").map(c => c.trim());
        
        const fd = new FormData();
        if (this.form.image) {
          fd.append("image", this.form.image);
        }
        // Додаємо _method, якщо бекенд потребує POST із _method: PATCH
        fd.append("_method", "PATCH");
        fd.append("name", this.form.name);
        fd.append("price", this.form.price);
        fd.append("category", this.form.category);
        fd.append("bead_producer", this.form.bead_producer);
        fd.append("country_of_manufacture", this.form.country_of_manufacture);
        fd.append("type_of_bead", this.form.type_of_bead);
        fd.append("weight", this.form.weight);
        fd.append("colors", JSON.stringify(this.form.colors));
        fd.append("sizes", JSON.stringify(this.form.sizes));
        fd.append("fittings", JSON.stringify(this.form.fittings));
        
        axios
          .post(`http://26.235.139.202:8080/api/products/${this.product.id}`, fd, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data"
            }
          })
          .then(response => {
            this.$emit("product-updated", response.data.data);
          })
          .catch(error => {
            console.error("Error updating product", error);
          });
      },
      close() {
        this.$emit("close");
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
  </style>
  