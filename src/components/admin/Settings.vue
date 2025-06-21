<template>
  <main class="w-full p-4 space-y-6 relative dark:bg-[#0F172A]">
    <h1 class="text-2xl font-semibold text-gray-800 dark:text-slate-100">
      {{ $t('admin.settings.title') }}
    </h1>

    <form
      @submit.prevent="saveSettings"
      class="space-y-4 bg-white dark:bg-[#1E293B] p-4 rounded shadow"
    >
      <div>
        <label class="text-sm font-medium text-gray-700 dark:text-slate-300">
          {{ $t('admin.settings.address') }}
        </label>
        <input
          v-model="settings.address"
          :placeholder="$t('admin.settings.address')"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 dark:text-slate-300">
          {{ $t('admin.settings.phone') }}
        </label>
        <input
          v-model="settings.phone"
          :placeholder="$t('admin.settings.phone')"
          type="tel"
          class="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 dark:text-slate-300">
          {{ $t('admin.settings.email') }}
        </label>
        <input
          v-model="settings.email"
          :placeholder="$t('admin.settings.email')"
          type="email"
          class="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div>
        <label class="text-sm font-medium text-gray-700 dark:text-slate-300">
          {{ $t('admin.settings.logo') }}
        </label>
        <!-- Custom upload button -->
        <button
          type="button"
          @click="$refs.logoInput.click()"
          class="mt-2 flex items-center gap-2 px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded text-sm transition"
        >
          <img src="@/assets/icons/upload.svg" alt="Upload" class="w-5 h-5 invert" />
          {{ $t('admin.settings.chooseFile') }}
        </button>
        <input
          ref="logoInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="processFile($event.target.files[0])"
        />
        <div v-if="logoPreview" class="mt-2 w-24 h-24">
          <img
            :src="logoPreview"
            alt="Logo Preview"
            class="w-full h-full object-contain rounded"
          />
        </div>
      </div>

      <button
        type="submit"
        class="w-full py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white font-medium rounded text-sm transition"
      >
        {{ $t('admin.settings.save') }}
      </button>
    </form>

    <!-- Categories Section -->
    <section class="bg-white dark:bg-[#1E293B] p-4 rounded shadow space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-slate-100">
          {{ $t('admin.settings.categories') }}
        </h2>
        <button
          @click="showAddModal = true"
          class="px-4 py-2 bg-[#6B1F1F] text-white rounded text-sm hover:bg-[#A01212] transition"
        >
          {{ $t('admin.settings.addCategory') }}
        </button>
      </div>

      <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm">
        <table class="min-w-full text-sm text-gray-800 dark:text-slate-200">
          <thead class="bg-[#f7e4e4] dark:bg-[#334155] text-left font-semibold text-[#3a3a3a] dark:text-slate-200">
            <tr>
              <th class="px-4 py-3">ID</th>
              <th class="px-4 py-3">{{ $t('admin.settings.categoryNameUk') }}</th>
              <th class="px-4 py-3">{{ $t('admin.settings.categoryNameEn') }}</th>
              <th class="px-4 py-3">{{ $t('admin.settings.image') }}</th>
              <th class="px-4 py-3 text-right">{{ $t('admin.settings.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-slate-600 bg-white dark:bg-slate-800">
            <tr v-for="cat in categories" :key="cat.id" class="hover:bg-gray-50 dark:hover:bg-slate-700">
              <td class="px-4 py-3">{{ cat.id }}</td>
              <td class="px-4 py-3">
                <input
                  v-model="cat.name.uk"
                  @change="updateCategory(cat)"
                  class="w-full border border-gray-300 dark:border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-pink-200 dark:bg-slate-700 dark:text-white"
                />
              </td>
              <td class="px-4 py-3">
                <input
                  v-model="cat.name.en"
                  @change="updateCategory(cat)"
                  class="w-full border border-gray-300 dark:border-slate-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-pink-200 dark:bg-slate-700 dark:text-white"
                />
              </td>
              <td class="px-4 py-3">
                <img :src="cat.image_url" alt="" class="w-12 h-12 object-contain border rounded" />
              </td>
              <td class="px-4 py-3 text-right space-x-2">
                <button
                  @click="deleteCategory(cat.id)"
                  class="p-1 rounded hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-300 transition"
                  title="Видалити"
                >
                  <img src="@/assets/icons/delete.svg" alt="Delete" class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Add Category Modal -->
    <transition name="fade">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white dark:bg-[#1E293B] p-6 rounded-lg shadow-xl w-full max-w-md space-y-4 relative">
          <button @click="showAddModal = false" class="absolute top-2 right-3 text-xl dark:text-slate-200">&times;</button>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-slate-100">
            {{ $t('admin.settings.createCategory') }}
          </h3>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">
              {{ $t('admin.settings.categoryNameUk') }}
            </label>
            <input
              v-model="newCategory.name.uk"
              :placeholder="$t('admin.settings.categoryNameUk')"
              class="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-200 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">
              {{ $t('admin.settings.categoryNameEn') }}
            </label>
            <input
              v-model="newCategory.name.en"
              :placeholder="$t('admin.settings.categoryNameEn')"
              class="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-200 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">
              {{ $t('admin.settings.categoryImage') }}
            </label>
            <!-- Custom upload button for category -->
            <button
              type="button"
              @click="$refs.catInput.click()"
              class="flex items-center gap-2 mt-2 px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded text-sm transition"
            >
              <img src="@/assets/icons/upload.svg" alt="Upload" class="w-5 h-5 invert" />
              {{ $t('admin.settings.chooseFile') }}
            </button>
            <input
              ref="catInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="e => newCategory.image = e.target.files[0]"
            />
          </div>

          <button
            @click="createCategory"
            class="w-full py-2 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] text-sm transition"
          >
            {{ $t('admin.settings.create') }}
          </button>
        </div>
      </div>
    </transition>
  </main>
</template>

<script>
import { useToast } from 'vue-toastification';
import api from '@/services/api';

export default {
  name: 'SettingsView',
  data() {
    return {
      settings: { address: '', phone: '', email: '', logo: null },
      logoPreview: null,
      newCategory: { name: { uk: '', en: '' }, image: null },
      showAddModal: false,
      categories: []
    };
  },
  methods: {
    processFile(file) {
      if (file && file.type.startsWith('image/')) {
        this.settings.logo = file;
        this.logoPreview = URL.createObjectURL(file);
      }
    },
    async fetchSettings() {
      const toast = useToast();
      try {
        const response = await api.getAdminSiteSettings();
        const data = response.data.data || response.data;
        const map = data.reduce((acc, { setting_key, setting_value }) => {
          acc[setting_key] = setting_value;
          return acc;
        }, {});
        this.settings.address = map.footer_address_info || '';
        this.settings.phone = map.footer_phone_number || '';
        this.settings.email = map.footer_email_info || '';
        this.logoPreview = map.site_logo || null;
      } catch (e) {
        useToast().error('Не вдалося завантажити налаштування');
      }
    },
    async saveSettings() {
      const toast = useToast();
      try {
        const fd = new FormData();
        fd.append('footer_address_info', this.settings.address);
        fd.append('footer_phone_number', this.settings.phone);
        fd.append('footer_email_info', this.settings.email);
        if (this.settings.logo instanceof File) fd.append('site_logo', this.settings.logo);
        await api.postAdminSiteSettings(fd);
        toast.success('Налаштування збережено');
      } catch {
        useToast().error('Не вдалося зберегти налаштування');
      }
    },
    async fetchCategories() {
      const toast = useToast();
      try {
        const response = await api.getCategories(new FormData());
        const data = response.data.data || response.data;
        this.categories = data.map(c => ({
          id: c.id,
          image_url: c.image_url,
          name: { uk: c.name_uk, en: c.name_en }
        }));
      } catch {
        useToast().error('Не вдалося завантажити категорії');
      }
    },
    async createCategory() {
      const toast = useToast();
      if (!this.newCategory.name.uk || !this.newCategory.name.en || !this.newCategory.image) {
        toast.warning('Заповніть всі поля');
        return;
      }
      try {
        const fd = new FormData();
        fd.append('name_uk', this.newCategory.name.uk);
        fd.append('name_en', this.newCategory.name.en);
        fd.append('image', this.newCategory.image);
        await api.createCategory(fd);
        toast.success('Категорію додано');
        this.showAddModal = false;
        this.newCategory = { name: { uk: '', en: '' }, image: null };
        await this.fetchCategories();
      } catch {
        useToast().error('Не вдалося створити категорію');
      }
    },
    async updateCategory(category) {
      const toast = useToast();
      try {
        const fd = new FormData();
        fd.append('name_uk', category.name.uk);
        fd.append('name_en', category.name.en);
        fd.append('_method', 'PATCH');
        await api.updateCategory(category.id, fd);
        toast.info('Категорію оновлено');
      } catch {
        useToast().error('Не вдалося оновити категорію');
      }
    },
    async deleteCategory(id) {
      const toast = useToast();
      if (!confirm('Ви впевнені?')) return;
      try {
        await api.deleteCategory(id);
        toast.warning('Категорію видалено');
        await this.fetchCategories();
      } catch {
        useToast().error('Не вдалося видалити категорію');
      }
    }
  },
  async created() {
    await this.fetchSettings();
    await this.fetchCategories();
  },
  mounted() {
    document.title = 'Налаштування';
  }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
