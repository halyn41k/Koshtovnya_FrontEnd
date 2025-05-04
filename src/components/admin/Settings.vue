<template>
  <main class="max-w-lg p-4 space-y-6">
    <!-- Заголовок -->
    <h1 class="text-2xl font-semibold text-gray-800">Налаштування</h1>

    <!-- Контактна інформація -->
    <form @submit.prevent="saveSettings" class="space-y-4">
      <!-- Адреса -->
      <div class="space-y-1">
        <label for="address" class="block text-sm font-medium text-gray-700">Адреса</label>
        <input
          id="address"
          type="text"
          v-model="settings.address"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
        />
      </div>

      <!-- Телефон -->
      <div class="space-y-1">
        <label for="phone" class="block text-sm font-medium text-gray-700">Телефон</label>
        <input
          id="phone"
          type="tel"
          v-model="settings.phone"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
        />
      </div>

      <!-- Email -->
      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          v-model="settings.email"
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-200 text-sm"
        />
      </div>

      <!-- Логотип: Drag & Drop та клік -->
      <div class="space-y-1">
        <label class="block text-sm font-medium text-gray-700">Логотип</label>
        <div
          class="mt-2 w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <img
            v-if="logoPreview"
            :src="logoPreview"
            alt="Логотип"
            class="w-full h-full object-contain"
          />
          <svg
            v-else
            class="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
          </svg>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileUpload"
        />
      </div>

      <!-- Кнопка зберегти -->
      <button
        type="submit"
        class="w-full py-2 text-white font-medium rounded bg-custom hover:bg-custom-hover transition text-sm"
      >
        Зберегти
      </button>
    </form>
  </main>
</template>

<script>
import axios from "axios";
export default {
  name: "SettingsView",
  data() {
    return {
      settings: { address: "", phone: "", email: "", logo: null },
      logoPreview: null,
      apiUrl: "https://koshtovnya.api-dev.bmax-edu.website/api/admin/site-settings",
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
        const res = await axios.get(this.apiUrl, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        const map = res.data.data.reduce((a, s) => ({ ...a, [s.setting_key]: s.setting_value }), {});
        this.settings = {
          address: map.footer_address_info || "",
          phone: map.footer_phone_number || "",
          email: map.footer_email_info || "",
          logo: null
        };
        if (map.site_logo) this.logoPreview = map.site_logo;
      } catch (e) { console.error(e); }
    },
    async saveSettings() {
      try {
        const fd = new FormData();
        fd.append("footer_address_info", this.settings.address);
        fd.append("footer_phone_number", this.settings.phone);
        fd.append("footer_email_info", this.settings.email);
        if (this.settings.logo instanceof File) fd.append("site_logo", this.settings.logo);
        fd.append("_method", "PATCH");
        await axios.post(this.apiUrl, fd, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        alert("Збережено");
      } catch (e) { console.error(e); }
    }
  },
  created() { this.fetchSettings(); },
  mounted() { document.title = "Налаштування"; }
};
</script>

<style scoped>
.bg-custom { background-color: #6B1F1F; }
.bg-custom-hover { background-color: #A01212; }
</style>