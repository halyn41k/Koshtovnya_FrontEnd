<template>
  <main class="max-w-4xl mx-auto p-4 space-y-8">
    <h1 class="text-2xl font-semibold text-gray-800">Налаштування</h1>

    <form @submit.prevent="saveSettings" class="space-y-4 bg-white p-4 rounded shadow">
      <div>
        <label class="text-sm font-medium text-gray-700">Адреса</label>
        <input v-model="settings.address" type="text" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm" />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700">Телефон</label>
        <input v-model="settings.phone" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm" />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700">Email</label>
        <input v-model="settings.email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm" />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700">Логотип</label>
        <div class="mt-2 w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <img v-if="logoPreview" :src="logoPreview" alt="Logo" class="w-full h-full object-contain" />
          <svg v-else class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"/>
          </svg>
        </div>
        <input ref="fileInput" type="file" class="hidden" @change="handleFileUpload" />
      </div>

      <button type="submit" class="w-full py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white font-medium rounded text-sm transition">
        Зберегти
      </button>
    </form>

    <section class="bg-white p-4 rounded shadow space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Категорії</h2>
        <button @click="showAddModal = true" class="px-4 py-2 bg-[#6B1F1F] text-white rounded text-sm hover:bg-[#A01212] transition">
          Додати категорію
        </button>
      </div>

      <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table class="min-w-full text-sm text-gray-800">
          <thead class="bg-[#f7e4e4] text-left font-semibold text-[#3a3a3a]">
            <tr>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">Назва</th>
              <th class="px-4 py-3">Зображення</th>
              <th class="px-4 py-3 text-right">Керування</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="cat in categories" :key="cat.id" class="hover:bg-gray-50">
              <td class="px-4 py-3">{{ cat.id }}</td>
              <td class="px-4 py-3">
                <input v-model="cat.name" class="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-pink-200" @change="updateCategory(cat)" />
              </td>
              <td class="px-4 py-3">
                <img :src="cat.image_url" alt="Зображення категорії" class="w-12 h-12 object-contain border rounded" />
              </td>
              <td class="px-4 py-3 text-right space-x-2">
                <button @click="deleteCategory(cat.id)" class="p-1 rounded hover:bg-red-100 text-red-600 transition" title="Видалити">
                  <img src="@/assets/icons/delete.svg" alt="Delete" class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <transition name="fade">
      <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md space-y-4 relative">
          <button @click="showAddModal = false" class="absolute top-2 right-3 text-xl">&times;</button>
          <h3 class="text-lg font-semibold text-gray-800">Додати нову категорію</h3>
          <input v-model="newCategory.name" placeholder="Назва" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          <input type="file" @change="e => newCategory.image = e.target.files[0]" />
          <button @click="createCategory" class="w-full py-2 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] text-sm transition">
            Створити
          </button>
        </div>
      </div>
    </transition>
  </main>
</template>

<script>
import axios from "axios";
import api from '@/services/api';
import { useToast } from 'vue-toastification';
const toast = useToast();

export default {
  name: "SettingsView",
  data() {
    return {
      settings: { address: "", phone: "", email: "", logo: null },
      logoPreview: null,
      newCategory: { name: "", image: null },
      showAddModal: false,
      categories: [],
      apiUrl: "https://koshtovnya.api-dev.bmax-edu.website/api/admin/site-settings",
      categoriesUrl: "https://koshtovnya.api-dev.bmax-edu.website/api/admin/categories",
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleDrop(e) {
      const file = e.dataTransfer.files[0];
      this.processFile(file);
    },
    handleFileUpload(e) {
      const file = e.target.files[0];
      this.processFile(file);
    },
    processFile(file) {
      if (file && file.type.startsWith('image/')) {
        this.settings.logo = file;
        this.logoPreview = URL.createObjectURL(file);
      }
    },
    async fetchSettings() {
      try {
        const res = await axios.get(this.apiUrl, this.authHeader());
        const map = res.data.data.reduce((a, s) => ({ ...a, [s.setting_key]: s.setting_value }), {});
        this.settings = {
          address: map.footer_address_info || "",
          phone: map.footer_phone_number || "",
          email: map.footer_email_info || "",
          logo: null
        };
        if (map.site_logo) this.logoPreview = map.site_logo;
      } catch (e) {
        console.error(e);
      }
    },
    async saveSettings() {
      try {
        const fd = new FormData();
        fd.append("footer_address_info", this.settings.address);
        fd.append("footer_phone_number", this.settings.phone);
        fd.append("footer_email_info", this.settings.email);
        if (this.settings.logo instanceof File) {
          fd.append("site_logo", this.settings.logo);
        }
        fd.append("_method", "PATCH");
        await axios.post(this.apiUrl, fd, this.authHeader());
        toast.success("Налаштування збережено");
      } catch (e) {
        console.error(e);
        toast.error("Помилка при збереженні налаштувань");
      }
    },
    async fetchCategories() {
      try {
        const res = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/categories");
        this.categories = res.data.data;
      } catch (e) {
        console.error("Помилка при завантаженні категорій:", e);
        toast.error("Не вдалося завантажити категорії");
      }
    },
    async createCategory() {
      if (!this.newCategory.name || !this.newCategory.image) {
        toast.warning("Заповніть назву та оберіть зображення");
        return;
      }
      try {
        const fd = new FormData();
        fd.append("name", this.newCategory.name);
        fd.append("image", this.newCategory.image);
        await axios.post(this.categoriesUrl, fd, this.authHeader());
        toast.success("Категорію додано");
        this.newCategory = { name: "", image: null };
        this.showAddModal = false;
        this.fetchCategories();
      } catch (e) {
        console.error(e);
        toast.error("Не вдалося створити категорію");
      }
    },
    async updateCategory(category) {
      try {
        const fd = new FormData();
        fd.append("name", category.name);
        fd.append("_method", "PATCH");
        await axios.post(`${this.categoriesUrl}/${category.id}`, fd, this.authHeader());
        toast.info("Категорію оновлено");
      } catch (e) {
        console.error(e);
        toast.error("Не вдалося оновити категорію");
      }
    },
    async deleteCategory(id) {
      if (!confirm("Ви впевнені, що хочете видалити категорію?")) return;
      try {
        await axios.delete(`${this.categoriesUrl}/${id}`, this.authHeader());
        toast.warning("Категорію видалено");
        this.fetchCategories();
      } catch (e) {
        console.error(e);
        toast.error("Не вдалося видалити категорію");
      }
    },
    authHeader() {
      return {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };
    }
  },
  created() {
    this.fetchSettings();
    this.fetchCategories();
  },
  mounted() {
    document.title = "Налаштування";
  },
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
