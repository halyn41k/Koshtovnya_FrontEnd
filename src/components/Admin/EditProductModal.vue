<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <h2 class="modal-title">Редагувати товар</h2>
      <form @submit.prevent="submitForm">
        <!-- Назва та ціна -->
        <div class="form-group">
          <label for="name">Назва</label>
          <input id="name" type="text" v-model="form.name" required />
        </div>
        <div class="form-group">
          <label for="price">Ціна</label>
          <input id="price" type="number" v-model="form.price" required />
        </div>

        <!-- Селектори -->
        <div class="form-group">
          <label for="category">Категорія</label>
          <select id="category" v-model="form.category" required>
            <option value="">Оберіть категорію</option>
            <option
              v-for="item in formData.categories"
              :key="item"
              :value="item"
            >{{ item }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="bead_producer">Бісер виробник</label>
          <select id="bead_producer" v-model="form.bead_producer" required>
            <option value="">Оберіть виробника</option>
            <option
              v-for="item in formData.bead_producers"
              :key="item"
              :value="item"
            >{{ item }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="country_of_manufacture">Країна виробництва</label>
          <select
            id="country_of_manufacture"
            v-model="form.country_of_manufacture"
            required
          >
            <option value="">Оберіть країну</option>
            <option
              v-for="item in formData.countries_of_manufacture"
              :key="item"
              :value="item"
            >{{ item }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="type_of_bead">Тип бісеру</label>
          <select id="type_of_bead" v-model="form.type_of_bead" required>
            <option value="">Оберіть тип</option>
            <option
              v-for="item in formData.type_of_bead"
              :key="item"
              :value="item"
            >{{ item }}</option>
          </select>
        </div>

        <!-- Вага -->
        <div class="form-group">
          <label for="weight">Вага</label>
          <input id="weight" type="number" v-model="form.weight" required />
        </div>

        <!-- Кольори -->
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
              <div
                class="color-circle"
                :style="{ backgroundColor: colorMap[color] || '#fff' }"
              >
                <svg
                  v-if="form.colors.includes(color)"
                  class="check-icon"
                  viewBox="0 0 24 24"
                >
                  <polyline
                    points="20 6 9 17 4 12"
                    fill="none"
                    stroke="#fff"
                    stroke-width="2"
                  />
                </svg>
              </div>
              <span class="color-label">{{ color }}</span>
            </div>
          </div>
        </div>

        <!-- Розміри -->
        <div class="form-group">
          <label>Розміри</label>
          <div
            v-for="(s, i) in form.sizes"
            :key="i"
            class="dynamic-field"
          >
            <input
              type="text"
              v-model="s.size"
              placeholder="Розмір"
              required
            />
            <input
              type="number"
              v-model="s.quantity"
              placeholder="Кількість"
              min="1"
              required
            />
            <button
              type="button"
              class="btn btn-remove"
              @click="removeSize(i)"
            >
              Видалити
            </button>
          </div>
          <button
            type="button"
            class="btn btn-add"
            @click="addSize"
          >Додати розмір</button>
        </div>

        <!-- Фурнітура -->
        <div class="form-group">
          <label>Фурнітура</label>
          <div
            v-for="(f, i) in form.fittings"
            :key="i"
            class="dynamic-field"
          >
            <select v-model="f.fitting" required>
              <option value="">Оберіть фурнітуру</option>
              <option
                v-for="item in formData.fittings"
                :key="item"
                :value="item"
              >{{ item }}</option>
            </select>
            <select v-model="f.material" required>
              <option value="">Оберіть матеріал</option>
              <option
                v-for="item in formData.materials"
                :key="item"
                :value="item"
              >{{ item }}</option>
            </select>
            <input
              type="number"
              v-model="f.quantity"
              placeholder="Кількість"
              min="1"
              required
            />
            <button
              type="button"
              class="btn btn-remove"
              @click="removeFitting(i)"
            >
              Видалити
            </button>
          </div>
          <button
            type="button"
            class="btn btn-add"
            @click="addFitting"
          >Додати фурнітуру</button>
        </div>

        <!-- Зображення -->
        <div class="form-group">
          <label>Зображення (залиште пустим, щоб не змінювати)</label>
          <label class="file-input-label">
            Вибрати файл
            <input
              type="file"
              @change="handleFileChange"
              accept="image/*"
              class="file-input"
            />
          </label>
        </div>

        <!-- Дії -->
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="close">
            Скасувати
          </button>
          <button type="submit" class="btn btn-primary">Зберегти</button>
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
    product: { type: Object, required: true }
  },
  data() {
    return {
      colorMap: {
        Чорний: "#000000",
        Червоний: "#FF0000",
        Білий: "#FFFFFF",
        Зелений: "#008000",
        Синій: "#0000FF",
        Жовтий: "#FFFF00",
        Помаранчевий: "#FFA500",
        Фіолетовий: "#800080",
        Коричневий: "#8B4513",
        Сірий: "#808080",
        Рожевий: "#FFC0CB",
        Блакитний: "#87CEEB",
        Бежевий: "#F5F5DC",
        Золотий: "#FFD700",
        Сріблястий: "#C0C0C0"
      },
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
      }
    };
  },
  created() {
    this.initForm();
    this.fetchFormData();
  },
  methods: {
    initForm() {
      const p = this.product;
      this.form.name = p.name;
      this.form.price = p.price;
      this.form.category = p.category;
      this.form.bead_producer = p.bead_producer_name || p.bead_producer;
      this.form.country_of_manufacture = p.country_of_manufacture;
      this.form.type_of_bead = p.type_of_bead;
      this.form.weight = p.weight;
      this.form.colors = p.colors ? [...p.colors] : [];
      this.form.sizes = (p.variants || []).map(v => ({
        size: v.size,
        quantity: v.quantity
      }));
      this.form.fittings = p.type_of_fitting
        ? JSON.parse(JSON.stringify(p.type_of_fitting))
        : [];
    },
    fetchFormData() {
      axios
        .get(
          "http://26.235.139.202:8080/api/admin/products/form-data",
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        )
        .then(r => {
          const d = r.data.data;
          this.formData = {
            categories: d.categories || [],
            bead_producers: d.bead_producers || [],
            countries_of_manufacture: d.countries_of_manufacture || [],
            type_of_bead: d.type_of_bead || [],
            colors: d.colors || [],
            fittings: d.fittings || [],
            materials: d.materials || []
          };
        })
        .catch(console.error);
    },
    handleFileChange(e) {
      this.form.image = e.target.files[0];
    },
    toggleColor(c) {
      const i = this.form.colors.indexOf(c);
      if (i === -1) this.form.colors.push(c);
      else this.form.colors.splice(i, 1);
    },
    addSize() {
      this.form.sizes.push({ size: "", quantity: 1 });
    },
    removeSize(i) {
      this.form.sizes.splice(i, 1);
    },
    addFitting() {
      this.form.fittings.push({ fitting: "", material: "", quantity: 1 });
    },
    removeFitting(i) {
      this.form.fittings.splice(i, 1);
    },
    submitForm() {
      const fd = new FormData();
      if (this.form.image) fd.append("image", this.form.image);
      fd.append("_method", "PATCH");
      fd.append("name", this.form.name);
      fd.append("price", this.form.price);
      fd.append("category", this.form.category);
      fd.append("bead_producer", this.form.bead_producer);
      fd.append("country_of_manufacture", this.form.country_of_manufacture);
      fd.append("type_of_bead", this.form.type_of_bead);
      fd.append("weight", this.form.weight);
      this.form.colors.forEach(c => fd.append("colors[]", c));
      this.form.sizes.forEach((s, i) => {
        fd.append(`sizes[${i}][size]`, s.size);
        fd.append(`sizes[${i}][quantity]`, s.quantity);
      });
      this.form.fittings.forEach((f, i) => {
        fd.append(`fittings[${i}][fitting]`, f.fitting);
        fd.append(`fittings[${i}][material]`, f.material);
        fd.append(`fittings[${i}][quantity]`, f.quantity);
      });
      axios
        .post(
          `http://26.235.139.202:8080/api/admin/products/${this.product.id}`,
          fd,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data"
            }
          }
        )
        .then(r => {
          this.$emit("product-updated", r.data.product);
          this.close();
        })
        .catch(console.error);
    },
    close() {
      this.$emit("close");
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap');

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.modal-container {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  font-family: Montserrat, sans-serif;
}
.modal-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
}

/* Дві колонки: лейбл + інпут */
.form-group {
  display: grid;
  grid-template-columns: 150px 1fr;
  align-items: center;
  margin-bottom: 16px;
}
.form-group label {
  margin: 0;
  font-weight: 600;
}
.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

/* Великі блоки — в другій колонці */
.form-group .colors-container,
.form-group .dynamic-field,
.form-group .btn-add,
.form-group .file-input-label {
  grid-column: 2 / 3;
}

/* Кольори */
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, border-color 0.2s;
}
.color-option:hover .color-circle {
  transform: scale(1.1);
}
.color-option.selected .color-circle {
  border-color: #6b1f1f;
  transform: scale(1.2);
}
.check-icon {
  width: 16px;
  height: 16px;
}
.color-label {
  font-size: 14px;
}

/* Динамічні поля */
.dynamic-field {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.dynamic-field input,
.dynamic-field select {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Файл‑інпут */
.file-input-label {
  display: inline-block;
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px dashed #aaa;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}
.file-input-label:hover {
  background: #e0e0e0;
}
.file-input {
  display: none;
}

/* Кнопки */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-add {
  background: #28a745;
  color: #fff;
}
.btn-add:hover {
  background: #218838;
}
.btn-remove {
  background: #dc3545;
  color: #fff;
}
.btn-remove:hover {
  background: #c82333;
}
.btn-primary {
  background: #6b1f1f;
  color: #fff;
}
.btn-primary:hover {
  background: #5a1a1a;
}
.btn-secondary {
  background: #ccc;
  color: #000;
}
.btn-secondary:hover {
  background: #b3b3b3;
}
</style>
