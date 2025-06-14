<template>
  <div
    class="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50"
    @click.self="close"
  >
    <div
      class="bg-white dark:bg-[#1f2a42] rounded-lg w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh] shadow-lg"
    >
      <h2 class="text-2xl font-semibold text-center mb-6">
        {{ $t('admin.editProduct.title') }}
      </h2>
      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Назва та Ціна -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label
              for="name_uk"
              class="mb-1 text-sm font-medium text-gray-700"
            >
              Назва (UK)
            </label>
            <input
              id="name_uk"
              type="text"
              v-model="form.name_uk"
              required
              placeholder="Наприклад: Срібний браслет"
              class="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50 text-black dark:text-black"
            />
          </div>
          <div class="flex flex-col">
            <label
              for="name_en"
              class="mb-1 text-sm font-medium text-gray-700"
            >
              Назва (EN)
            </label>
            <input
              id="name_en"
              type="text"
              v-model="form.name_en"
              required
              placeholder="e.g. Silver bracelet"
              class="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50 text-black dark:text-black"
            />
          </div>
          <div class="flex flex-col">
            <label for="price" class="mb-1 text-sm font-medium text-gray-700">
              Ціна
            </label>
            <input
              id="price"
              type="number"
              v-model="form.price"
              required
              placeholder="грн"
              class="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50 text-black dark:text-black"
            />
          </div>
        </div>

        <!-- Категорії та інші селектори -->
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
            <label class="mb-1 text-sm font-medium text-gray-700"
              >Бісер виробник</label
            >
            <Multiselect
              v-model="form.bead_producer"
              :options="formData.bead_producers"
              placeholder="Оберіть виробника"
              class="custom-multiselect"
            />
          </div>
          <div class="flex flex-col">
            <label class="mb-1 text-sm font-medium text-gray-700"
              >Країна виробництва</label
            >
            <Multiselect
              v-model="form.country_of_manufacture"
              :options="formData.countries_of_manufacture"
              placeholder="Оберіть країну"
              class="custom-multiselect"
            />
          </div>
          <div class="flex flex-col">
            <label class="mb-1 text-sm font-medium text-gray-700"
              >Тип бісеру</label
            >
            <Multiselect
              v-model="form.type_of_bead"
              :options="formData.type_of_bead"
              placeholder="Оберіть тип"
              class="custom-multiselect"
            />
          </div>
        </div>

        <!-- Вага та кольори -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col">
            <label for="weight" class="mb-1 text-sm font-medium text-gray-700"
              >Вага (г)</label
            >
            <input
              id="weight"
              type="number"
              v-model="form.weight"
              placeholder="Введіть вагу (г)"
              class="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50 text-black dark:text-black"
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
                  :class="
                    form.colors.includes(color)
                      ? 'border-[#6B1F1F]'
                      : 'border-gray-300'
                  "
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
            <div class="flex flex-col flex-1">
              <label class="text-sm text-gray-600 mb-1">Розмір (см)</label>
              <input
                v-model.number="sizeItem.size"
                type="number"
                min="1"
                placeholder="см"
                required
                class="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50 text-black dark:text-black"
              />
            </div>
            <div class="flex flex-col w-28">
              <label class="text-sm text-gray-600 mb-1">К-ть</label>
              <input
                v-model.number="sizeItem.quantity"
                type="number"
                min="1"
                placeholder="шт"
                required
                class="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50 text-black dark:text-black"
              />
            </div>
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
            <Multiselect
              v-model="fitItem.fitting"
              :options="formData.fittings"
              placeholder="Оберіть фурнітуру"
              class="flex-1 custom-multiselect"
            />
            <Multiselect
              v-model="fitItem.material"
              :options="formData.materials"
              placeholder="Оберіть матеріал"
              class="flex-1 custom-multiselect"
            />
            <input
              v-model.number="fitItem.quantity"
              type="number"
              min="1"
              placeholder="Кількість"
              required
              class="border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-[#6B1F1F]/50 text-black dark:text-black"
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
          <div v-if="imagePreview" class="mt-2 relative">
            <img
              :src="imagePreview"
              alt="Превʼю"
              class="max-h-40 rounded-md border"
            />
            <button
              type="button"
              @click="removeImage"
              class="absolute top-0 right-0 bg-red-600 text-white px-2 py-1 rounded-bl-md hover:bg-red-500"
            >
              ×
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
            {{ $t('admin.addProduct.cancel') }}
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-[#6B1F1F] text-white rounded-md hover:bg-[#A01212]"
          >
            {{ $t('admin.editProduct.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { createToastInterface } from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import Multiselect from 'vue-multiselect';
import api from '@/services/api';

export default {
  name: 'EditProductModal',
  props: {
    product: { type: Object, required: true },
  },
  components: { Multiselect },
  data() {
    return {
      colorMap: {
        // українські
        Чорний: '#000000', Червоний: '#FF0000', Білий: '#FFFFFF',
        Зелений: '#008000', Синій: '#0000FF', Жовтий: '#FFFF00',
        Помаранчевий: '#FFA500', Фіолетовий: '#800080', Коричневий: '#8B4513',
        Сірий: '#808080', Рожевий: '#FFC0CB', Блакитний: '#87CEEB',
        Бежевий: '#F5F5DC', Золотий: '#FFD700', Сріблястий: '#C0C0C0',
        // англійські
        Black: '#000000', Red: '#FF0000', White: '#FFFFFF',
        Green: '#008000', Blue: '#0000FF', Yellow: '#FFFF00',
        Orange: '#FFA500', Purple: '#800080', Brown: '#8B4513',
        Gray: '#808080', Pink: '#FFC0CB', Lightblue: '#87CEEB',
        Beige: '#F5F5DC', Gold: '#FFD700', Silver: '#C0C0C0',
      },
      form: {
        name_uk: '', name_en: '', price: '', category: '', bead_producer: '',
        country_of_manufacture: '', type_of_bead: '', weight: '',
        colors: [], sizes: [], fittings: [], image: null,
      },
      formData: {
        categories: [], bead_producers: [], countries_of_manufacture: [],
        type_of_bead: [], colors: [], fittings: [], materials: []
      },
      imagePreview: null,
    };
  },
  async mounted() {
    try {
      // отримуємо дані для форми
      const data = await api.getProductFormData();
      this.formData.categories = data.categories;
      this.formData.bead_producers = data.bead_producers;
      this.formData.countries_of_manufacture = data.countries_of_manufacture;
      this.formData.type_of_bead = data.type_of_bead;
      this.formData.colors = data.colors.filter(c => this.colorMap[c]);
      this.formData.fittings = data.fittings;
      this.formData.materials = data.materials;

      // завантажуємо деталі продукту
      const details = await api.getAdminProduct(this.product.id);
      this.initForm(details.data || details);
    } catch (e) {
      console.error('Не вдалося завантажити дані:', e);
    }
  },
  methods: {
      initForm(product) {
        console.log('API product.colors:', product.colors);
    const norm = v => (v||'').toString();
    this.form.name_uk = product.name_uk || product.name || '';
    this.form.name_en = product.name_en || product.name || '';
    this.form.price = product.price;
    this.form.category = product.category;

    // <-- виправлене автозаповнення виробника бісеру
    this.form.bead_producer = product.bead_producer_name || product.bead_producer || '';

    this.form.country_of_manufacture = product.country_of_manufacture;
    this.form.type_of_bead = product.type_of_bead;
    this.form.weight = product.weight;

    // <-- автозаповнення кольорів (припускаємо, що product.colors — масив рядків)
    this.form.colors = Array.isArray(product.colors) ? [...product.colors] : [];

    this.form.sizes = (product.variants||[]).map(v=>({size:v.size,quantity:v.quantity}));
    this.form.fittings = product.type_of_fitting||[];
    this.imagePreview = product.image_url || null;
  },

    handleFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.form.image = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },
    removeImage() { this.form.image = null; this.imagePreview = null; },
    addSize() { this.form.sizes.push({size:'',quantity:1}); },
    removeSize(i) { this.form.sizes.splice(i,1); },
    addFitting() { this.form.fittings.push({fitting:'',material:'',quantity:1}); },
    removeFitting(i) { this.form.fittings.splice(i,1); },
    toggleColor(c) {
      const idx = this.form.colors.indexOf(c);
      if (idx===-1) this.form.colors.push(c);
      else this.form.colors.splice(idx,1);
    },
    async submitForm() {
      const toast = createToastInterface();
      try {
        const fd = new FormData();
        fd.append('_method','PATCH');
        fd.append('name_uk',this.form.name_uk);
        fd.append('name_en',this.form.name_en);
        fd.append('price',this.form.price);
        fd.append('category',this.form.category);
        fd.append('bead_producer',this.form.bead_producer);
        fd.append('country_of_manufacture',this.form.country_of_manufacture);
        fd.append('type_of_bead',this.form.type_of_bead);
        fd.append('weight',this.form.weight);
        this.form.colors.forEach(c=>fd.append('colors[]',c));
        this.form.sizes.forEach((s,i)=>{fd.append(`sizes[${i}][size]`,s.size);fd.append(`sizes[${i}][quantity]`,s.quantity)});
        this.form.fittings.forEach((f,i)=>{fd.append(`fittings[${i}][fitting]`,f.fitting);fd.append(`fittings[${i}][material]`,f.material);fd.append(`fittings[${i}][quantity]`,f.quantity)});
        if(this.form.image) fd.append('image',this.form.image);

        const updated = await api.updateProduct(this.product.id,fd);
        this.$emit('product-updated', updated);
        toast.success('Товар оновлено');
        this.close();
      } catch(err) {
        // помилки оброблює інтерсептор
      }
    },
    close() { this.$emit('close'); }
  }
};
</script>

<style>
/* стилі без змін */
.custom-multiselect .multiselect__option--highlight::after { display: none !important; }
.multiselect__option--highlight { background: #F3F4F6 !important; color: #6B1F1F !important; }
.multiselect__option--selected { font-weight:600!important; }
.multiselect__option--selected::after { content:'Обрано' !important; color:#9CA3AF; font-size:0.75rem; font-weight:500; float:right; margin-right:1rem; }
</style>
