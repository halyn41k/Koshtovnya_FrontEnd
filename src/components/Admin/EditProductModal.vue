<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <h2>Редагувати товар</h2>
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

        <!-- Селектори -->
        <div class="form-group">
          <label>Категорія</label>
          <select v-model="form.category" required>
            <option v-for="item in formData.categories" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Бісер виробник</label>
          <select v-model="form.bead_producer" required>
            <option v-for="item in formData.bead_producers" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Країна виробництва</label>
          <select v-model="form.country_of_manufacture" required>
            <option v-for="item in formData.countries_of_manufacture" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Тип бісеру</label>
          <select v-model="form.type_of_bead" required>
            <option v-for="item in formData.type_of_bead" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>

        <!-- Вага -->
        <div class="form-group">
          <label>Вага</label>
          <input type="number" v-model="form.weight" required />
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
              <div class="color-circle" :style="{ backgroundColor: colorMap[color] || '#fff' }">
                <svg v-if="form.colors.includes(color)" class="check-icon" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" fill="none" stroke="#fff" stroke-width="2"/>
                </svg>
              </div>
              <span>{{ color }}</span>
            </div>
          </div>
        </div>

        <!-- Розміри -->
        <div class="form-group">
          <label>Розміри та кількість</label>
          <div v-for="(s, i) in form.sizes" :key="i" class="dynamic-field">
            <input type="text" v-model="s.size" placeholder="Розмір" required />
            <input type="number" v-model="s.quantity" placeholder="Кількість" min="1" required />
            <button type="button" @click="removeSize(i)">Видалити</button>
          </div>
          <button type="button" @click="addSize">Додати розмір</button>
        </div>

        <!-- Фурнітура -->
        <div class="form-group">
          <label>Фурнітура</label>
          <div v-for="(f, i) in form.fittings" :key="i" class="dynamic-field">
            <select v-model="f.fitting" required>
              <option v-for="item in formData.fittings" :key="item" :value="item">{{ item }}</option>
            </select>
            <select v-model="f.material" required>
              <option v-for="item in formData.materials" :key="item" :value="item">{{ item }}</option>
            </select>
            <input type="number" v-model="f.quantity" placeholder="Кількість" min="1" required />
            <button type="button" @click="removeFitting(i)">Видалити</button>
          </div>
          <button type="button" @click="addFitting">Додати фурнітуру</button>
        </div>

        <!-- Зображення -->
        <div class="form-group">
          <label>Зображення (залиште пустим, щоб не змінювати)</label>
          <input type="file" @change="handleFileChange" accept="image/*" />
        </div>

        <!-- Дії -->
        <div class="modal-actions">
          <button type="button" class="cancel" @click="close">Скасувати</button>
          <button type="submit" class="submit">Зберегти</button>
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
        'Чорний':'#000','Червоний':'#F00','Білий':'#FFF',
        'Зелений':'#008000','Синій':'#0000FF','Жовтий':'#FFFF00',
        'Помаранчевий':'#FFA500','Фіолетовий':'#800080',
        'Коричневий':'#8B4513','Сірий':'#808080',
        'Рожевий':'#FFC0CB','Блакитний':'#87CEEB',
        'Бежевий':'#F5F5DC','Золотий':'#FFD700','Сріблястий':'#C0C0C0'
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
      this.form.bead_producer = p.bead_producer_name;
      this.form.country_of_manufacture = p.country_of_manufacture;
      this.form.type_of_bead = p.type_of_bead;
      this.form.weight = p.weight;
      this.form.colors = p.colors || [];
      this.form.sizes = (p.variants || []).map(v => ({ size: v.size, quantity: v.quantity }));
      this.form.fittings = JSON.parse(JSON.stringify(p.type_of_fitting || []));
    },
    fetchFormData() {
      axios.get("http://26.235.139.202:8080/api/admin/products/form-data", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
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
    toggleColor(color) {
      const i = this.form.colors.indexOf(color);
      if (i === -1) this.form.colors.push(color);
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
      // append simple fields
      ["name","price","category","bead_producer","country_of_manufacture","type_of_bead","weight"]
        .forEach(f => fd.append(f, this.form[f]));
      // arrays
      this.form.colors.forEach(c => fd.append("colors[]", c));
      this.form.sizes.forEach((s,i) => {
        fd.append(`sizes[${i}][size]`, s.size);
        fd.append(`sizes[${i}][quantity]`, s.quantity);
      });
      this.form.fittings.forEach((f,i) => {
        fd.append(`fittings[${i}][fitting]`, f.fitting);
        fd.append(`fittings[${i}][material]`, f.material);
        fd.append(`fittings[${i}][quantity]`, f.quantity);
      });

      axios.patch(
        `http://26.235.139.202:8080/api/admin/products/${this.product.id}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          }
        }
      )
      .then(res => {
        this.$emit("product-updated", res.data.data);
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
.modal-overlay {
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.5);
  display:flex; align-items:center; justify-content:center;
}
.modal-container {
  background:#fff; padding:20px; border-radius:6px;
  width:600px; max-height:90vh; overflow-y:auto;
}
h2 { text-align:center; margin-bottom:16px; }
.form-group, .dynamic-field { margin-bottom:12px; }
.form-group label { display:block; margin-bottom:4px; font-weight:600; }
.form-group input, .form-group select, .form-group input[type="file"] {
  width:100%; padding:6px 8px; border:1px solid #ccc; border-radius:4px;
}
.dynamic-field { display:flex; gap:8px; }
.dynamic-field input, .dynamic-field select { flex:1; }
.modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }
.modal-actions .cancel { background:#ccc; color:#000; padding:8px 16px; border:none; border-radius:4px; cursor:pointer; }
.modal-actions .submit { background:#28a745; color:#fff; padding:8px 16px; border:none; border-radius:4px; cursor:pointer; }

.colors-container { display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; }
.color-option { display:flex; align-items:center; cursor:pointer; }
.color-circle {
  width:24px; height:24px; border:2px solid #ccc; border-radius:50%;
  margin-right:6px; display:flex; align-items:center; justify-content:center;
  transition:transform .2s, border-color .2s;
}
.color-option:hover .color-circle { transform:scale(1.1); }
.color-option.selected .color-circle {
  transform:scale(1.2); border-color:#333; animation:pulse .5s ease-out;
}
@keyframes pulse {
  0% { box-shadow:0 0 0 0 rgba(0,0,0,0.3); }
  70% { box-shadow:0 0 0 12px rgba(0,0,0,0); }
  100% { box-shadow:0 0 0 0 rgba(0,0,0,0); }
}
.check-icon { width:14px; height:14px; }
</style>
