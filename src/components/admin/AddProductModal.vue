<template>

    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"

    @click.self="close"
  >
    <div
      class="bg-white rounded-lg w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh] shadow-lg"
    >
      <h2 class="text-2xl font-semibold text-center mb-6">Додати товар</h2>

      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Назва та Ціна -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label for="name" class="mb-1 text-sm font-medium text-gray-700">Назва</label>
            <input
              id="name"
              type="text"
              v-model="form.name"
              required placeholder="Наприклад: Срібний браслет"
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            />
          </div>
          <div class="flex flex-col">
            <label for="price" class="mb-1 text-sm font-medium text-gray-700">Ціна</label>
            <input
              id="price"
              type="number"
              v-model="form.price"
              required placeholder="грн"
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            />
          </div>
        </div>

       <div class="grid grid-cols-2 gap-4">
  <div class="flex flex-col">
    <label class="mb-1 text-sm font-medium text-gray-700">Категорія</label>
    <Multiselect
      v-model="form.category"
      :options="formData.categories"
      placeholder="Оберіть категорію"
      class="custom-multiselect"
    />
  </div>

  <div class="flex flex-col">
    <label class="mb-1 text-sm font-medium text-gray-700">Бісер виробник</label>
    <Multiselect
      v-model="form.bead_producer"
      :options="formData.bead_producers"
      placeholder="Оберіть виробника"
      class="custom-multiselect"
    />
  </div>

  <div class="flex flex-col">
    <label class="mb-1 text-sm font-medium text-gray-700">Країна виробництва</label>
    <Multiselect
      v-model="form.country_of_manufacture"
      :options="formData.countries_of_manufacture"
      placeholder="Оберіть країну"
      class="custom-multiselect"
    />
  </div>

  <div class="flex flex-col">
    <label class="mb-1 text-sm font-medium text-gray-700">Тип бісеру</label>
    <Multiselect
      v-model="form.type_of_bead"
      :options="formData.type_of_bead"
      placeholder="Оберіть тип"
      class="custom-multiselect"
    />
  </div>
</div>

        <!-- Вага та Кольори -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label for="weight" class="mb-1 text-sm font-medium text-gray-700">Вага</label>
            <input
              id="weight"
              type="number"
              placeholder="Введіть вагу (г)"
              v-model="form.weight"
              required
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            />
          </div>
          <div class="flex flex-col">
            <label class="mb-2 text-sm font-medium text-gray-700">Кольори</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in formData.colors"
                :key="color"
                type="button"
                @click="toggleColor(color)"
                :class="[
                  'flex items-center px-2 py-1 border rounded-md space-x-2',
                  form.colors.includes(color)
                    ? 'border-[#6B1F1F] bg-[#6B1F1F]/10'
                    : 'border-gray-300'
                ]"
              >
                <span
                  class="w-5 h-5 rounded-full border"
                  :class="form.colors.includes(color) ? 'border-[#6B1F1F]' : 'border-gray-300'"
                  :style="{ backgroundColor: colorMap[color] }"
                ></span>
                <span class="text-sm text-gray-700">{{ color }}</span>
              </button>
            </div>
          </div>
        </div>

       <div class="flex flex-col space-y-3">
  <label class="text-sm font-medium text-gray-700">Розміри</label>

  <div v-for="(sizeItem, index) in form.sizes" :key="index" class="grid grid-cols-12 gap-2 items-end">
    <!-- Поле розміру -->
    <div class="col-span-6">
      <label class="text-sm font-medium text-gray-700">Розмір (см)</label>
      <input
  v-model.number="sizeItem.size"
  type="number"
  step="0.01"
  min="0"
  placeholder="23.00"
  required
  class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
/>

    </div>

    <!-- Поле кількості -->
    <div class="col-span-3">
      <label class="text-sm font-medium text-gray-700">К-ть</label>
      <input
        v-model.number="sizeItem.quantity"
        type="number"
        min="0"
        placeholder="0"
        required
        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
      />
    </div>

    <!-- Кнопка видалення -->
    <div class="col-span-3">
      <button
        type="button"
        @click="removeSize(index)"
        class="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
      >
        Видалити
      </button>
    </div>
  </div>

  <button
    type="button"
    @click="addSize"
    class="w-max px-4 py-2 bg-[#6B1F1F] text-white rounded-md hover:bg-[#A01212]"
  >
    Додати розмір
  </button>
</div>

        <!-- Фурнітура -->
<!-- Фурнітура -->
<div class="flex flex-col space-y-3">
  <label class="text-sm font-medium text-gray-700">Фурнітура</label>

  <div
    v-for="(fitItem, index) in form.fittings"
    :key="index"
    class="grid grid-cols-12 gap-2 items-end"
  >
    <!-- Фурнітура -->
    <div class="col-span-4">
      <label class="text-sm font-medium text-gray-700">Фурнітура</label>
      <Multiselect
        v-model="fitItem.fitting"
        :options="formData.fittings"
        placeholder="Оберіть фурнітуру"
        class="custom-multiselect"
      />
    </div>

    <!-- Матеріал -->
    <div class="col-span-4">
      <label class="text-sm font-medium text-gray-700">Матеріал</label>
      <Multiselect
        v-model="fitItem.material"
        :options="formData.materials"
        placeholder="Оберіть матеріал"
        class="custom-multiselect"
      />
    </div>

    <!-- Кількість -->
    <div class="col-span-2">
      <label class="text-sm font-medium text-gray-700">К-ть</label>
      <input
        v-model.number="fitItem.quantity"
        type="number"
        min="1"
        placeholder="К-ть"
        required
        class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
      />
    </div>

    <!-- Кнопка Видалити -->
    <div class="col-span-2">
      <button
        type="button"
        @click="removeFitting(index)"
        class="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-500"
      >
        Видалити
      </button>
    </div>
  </div>

  <button
    type="button"
    @click="addFitting"
    class="w-max px-4 py-2 bg-[#6B1F1F] text-white rounded-md hover:bg-[#A01212]"
  >
    Додати фурнітуру
  </button>
</div>

<!-- Зображення -->
<div class="flex flex-col">
  <label class="mb-1 text-sm font-medium text-gray-700">Зображення</label>

  <!-- Кнопка вибору файлу -->
  <label
    class="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer text-sm text-gray-600 hover:border-[#A01212]"
  >
    Вибрати файл
    <input
      type="file"
      @change="handleFileChange"
      accept="image/jpeg,image/png,image/jpg"
      class="sr-only"
    />
  </label>

  <!-- Превʼю + видалення -->
  <div v-if="form.image" class="mt-4 flex items-center space-x-4">
    <img
  :src="imagePreview"

      alt="Превʼю"
      class="w-24 h-24 object-cover rounded-md border"
    />
    <button
      type="button"
        @click="() => { form.image = null; imagePreview = null }"

      class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-500"
    >
      Видалити
    </button>
  </div>
</div>


        <!-- Дії -->
        <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Скасувати
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-[#6B1F1F] text-white rounded-md hover:bg-[#A01212]"
          >
            Додати
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

import Multiselect from 'vue-multiselect'


export default {
  components: {
  Multiselect
},
  name: "AddProductModal",
  data() {
    return {
      imagePreview: null,

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
        Сріблястий: "#C0C0C0",
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
        image: null,
      },
      formData: {
        categories: [],
        bead_producers: [],
        countries_of_manufacture: [],
        type_of_bead: [],
        colors: [],
        fittings: [],
        materials: [],
      },
    };
  },
  mounted() {
    axios
      .get(
        "https://koshtovnya.api-dev.bmax-edu.website/api/admin/products/form-data",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((res) => {
        const d = res.data.data;
        this.formData.categories = d.categories || [];
        this.formData.bead_producers = d.bead_producers || [];
        this.formData.countries_of_manufacture =
          d.countries_of_manufacture || [];
        this.formData.type_of_bead = d.type_of_bead || [];
        this.formData.colors = d.colors || [];
        this.formData.fittings = d.fittings || [];
        this.formData.materials = d.materials || [];
      })
      .catch(console.error);
  },
  methods: {
    handleFileChange(e) {
  const file = e.target.files[0];
  if (file) {
    this.form.image = file;
    this.imagePreview = URL.createObjectURL(file);
  }
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
    toggleColor(c) {
      const idx = this.form.colors.indexOf(c);
      if (idx === -1) this.form.colors.push(c);
      else this.form.colors.splice(idx, 1);
    },
    submitForm() {
      const fd = new FormData();
      if (this.form.image) fd.append("image", this.form.image);
      Object.entries(this.form).forEach(([k, v]) => {
        if (["sizes", "fittings", "colors", "image"].includes(k)) return;
        fd.append(k, v);
      });
      this.form.colors.forEach((c) => fd.append("colors[]", c));
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
          "https://koshtovnya.api-dev.bmax-edu.website/api/admin/products",
          fd,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((r) => {
          const d = r.data.data || r.data.product;
          this.$emit(
            "product-added",
            Array.isArray(d) ? Object.assign({}, ...d) : d
          );
          this.close();
        })
        .catch(console.error);
    },
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style>
.custom-multiselect .multiselect__option--highlight::after {
  display: none !important;
}

.multiselect__option--highlight {
  background: #F3F4F6 !important; /* Ніжно-рожевий */
  color: #6B1F1F !important; /* Головний колір тексту */
}
.multiselect__option--selected {
  font-weight: 600 !important; /* semibold */
}

.multiselect__option--selected::after {
  content: 'Обрано' !important;
  color: #9CA3AF; /* світло-сірий */
  font-size: 0.75rem; /* text-sm */
  font-weight: 500;
  float: right;
  margin-right: 1rem;
}

</style>