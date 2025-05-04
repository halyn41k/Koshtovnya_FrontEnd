<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
              required
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            />
          </div>
          <div class="flex flex-col">
            <label for="price" class="mb-1 text-sm font-medium text-gray-700">Ціна</label>
            <input
              id="price"
              type="number"
              v-model="form.price"
              required
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            />
          </div>
        </div>

        <!-- Селекти -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label for="category" class="mb-1 text-sm font-medium text-gray-700">Категорія</label>
            <select
              id="category"
              v-model="form.category"
              required
              class="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            >
              <option value="">Оберіть категорію</option>
              <option
                v-for="item in formData.categories"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </div>
          <div class="flex flex-col">
            <label for="bead_producer" class="mb-1 text-sm font-medium text-gray-700">Бісер виробник</label>
            <select
              id="bead_producer"
              v-model="form.bead_producer"
              required
              class="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            >
              <option value="">Оберіть виробника</option>
              <option
                v-for="item in formData.bead_producers"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </div>
          <div class="flex flex-col">
            <label for="country_of_manufacture" class="mb-1 text-sm font-medium text-gray-700">
              Країна виробництва
            </label>
            <select
              id="country_of_manufacture"
              v-model="form.country_of_manufacture"
              required
              class="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            >
              <option value="">Оберіть країну</option>
              <option
                v-for="item in formData.countries_of_manufacture"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </div>
          <div class="flex flex-col">
            <label for="type_of_bead" class="mb-1 text-sm font-medium text-gray-700">Тип бісеру</label>
            <select
              id="type_of_bead"
              v-model="form.type_of_bead"
              required
              class="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            >
              <option value="">Оберіть тип</option>
              <option
                v-for="item in formData.type_of_bead"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </div>
        </div>

        <!-- Вага та Кольори -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label for="weight" class="mb-1 text-sm font-medium text-gray-700">Вага</label>
            <input
              id="weight"
              type="number"
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

        <!-- Розміри -->
        <div class="flex flex-col space-y-3">
          <label class="text-sm font-medium text-gray-700">Розміри</label>
          <div
            v-for="(sizeItem, index) in form.sizes"
            :key="index"
            class="flex items-center gap-2"
          >
            <input
              v-model="sizeItem.size"
              type="text"
              placeholder="Розмір"
              required
              class="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            />
            <input
              v-model.number="sizeItem.quantity"
              type="number"
              min="1"
              placeholder="Кількість"
              required
              class="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            />
            <button
              type="button"
              @click="removeSize(index)"
              class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-500"
            >
              Видалити
            </button>
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
        <div class="flex flex-col space-y-3">
          <label class="text-sm font-medium text-gray-700">Фурнітура</label>
          <div
            v-for="(fitItem, index) in form.fittings"
            :key="index"
            class="flex items-center gap-2"
          >
            <select
              v-model="fitItem.fitting"
              required
              class="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            >
              <option value="">Оберіть фурнітуру</option>
              <option
                v-for="item in formData.fittings"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
            <select
              v-model="fitItem.material"
              required
              class="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            >
              <option value="">Оберіть матеріал</option>
              <option
                v-for="item in formData.materials"
                :key="item"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
            <input
              v-model.number="fitItem.quantity"
              type="number"
              min="1"
              placeholder="Кількість"
              required
              class="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50"
            />
            <button
              type="button"
              @click="removeFitting(index)"
              class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-500"
            >
              Видалити
            </button>
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

export default {
  name: "AddProductModal",
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
      this.form.image = e.target.files[0];
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
