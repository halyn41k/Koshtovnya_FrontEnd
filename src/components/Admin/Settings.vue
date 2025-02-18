<template> 
  <main class="settings-content">
    <header class="settings-header">
      <img loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/c3e46d0a629546c7a48302a5db3297d5/323c4a41975024a41335e068c0653ecd7e32a04e8e9a79655a5b6ee065ec92f4?apiKey=c3e46d0a629546c7a48302a5db3297d5"
        alt="Settings logo" class="settings-logo" />
      <h1 class="settings-title">Налаштування</h1>
    </header>

    <section class="contact-info-section">
      <h2 class="section-title">Загальна інформація:</h2>
      <div class="contact-info-container">
        <h3 class="contact-info-title">Контактна Інформація</h3>
        <form class="contact-form" @submit.prevent="saveSettings">
          <div class="form-group">
            <label for="address" class="form-label">Адреса</label>
            <input type="text" id="address" class="form-input" v-model="settings.address" />
          </div>
          <div class="form-group">
            <label for="phone" class="form-label">Телефон</label>
            <input type="tel" id="phone" class="form-input" v-model="settings.phone" />
          </div>
          <div class="form-group">
            <label for="email" class="form-label">Електронна пошта</label>
            <input type="email" id="email" class="form-input" v-model="settings.email" />
          </div>
          <div class="form-group">
            <label for="instagram" class="form-label">Instagram</label>
            <input type="url" id="instagram" class="form-input" v-model="settings.instagram" />
          </div>
          <div class="form-group">
            <label for="facebook" class="form-label">Facebook</label>
            <input type="url" id="facebook" class="form-input" v-model="settings.facebook" />
          </div>
          <div class="form-group">
            <label for="tiktok" class="form-label">TikTok</label>
            <input type="url" id="tiktok" class="form-input" v-model="settings.tiktok" />
          </div>
          <div class="form-group">
            <label for="logo" class="form-label">Завантажити логотип</label>
            <input type="file" id="logo" class="form-input" @change="handleFileUpload" accept="image/*" />
            <div v-if="logoPreview" class="image-preview">
              <img :src="logoPreview" alt="Прев'ю логотипу" class="logo-preview" />
            </div>
          </div>
          <button type="submit" class="submit-button">Зберегти зміни</button>
        </form>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  name: "SettingsView",
  data() {
    return {
      settings: {
        address: "",
        phone: "",
        email: "",
        logo: "",
        instagram: "",
        facebook: "",
        tiktok: "",
      },
      logoPreview: null,
      apiUrl: "http://26.235.139.202:8080/api/site-settings",
    };
  },
  methods: {
    async fetchSettings() {
      try {
        const response = await fetch(this.apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { data } = await response.json();

        const mappedSettings = data.reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {});

        this.settings = {
          address: mappedSettings.footer_address_info || "",
          phone: mappedSettings.footer_phone_number || "",
          email: mappedSettings.footer_email_info || "",
          logo: mappedSettings.site_logo || "",
          instagram: mappedSettings.footer_instagram || "",
          facebook: mappedSettings.footer_facebook || "",
          tiktok: mappedSettings.footer_tiktok || "",
        };
      } catch (error) {
        console.error("Помилка завантаження налаштувань:", error);
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.settings.logo = file;
        this.logoPreview = URL.createObjectURL(file);
      }
    },

    async saveSettings() {
      try {
        const formData = new FormData();
        formData.append("footer_address_info", this.settings.address);
        formData.append("footer_phone_number", this.settings.phone);
        formData.append("footer_email_info", this.settings.email);
        formData.append("footer_instagram", this.settings.instagram);
        formData.append("footer_facebook", this.settings.facebook);
        formData.append("footer_tiktok", this.settings.tiktok);

        if (this.settings.logo instanceof File) {
          formData.append("site_logo", this.settings.logo);
        }

        const response = await fetch(this.apiUrl, {
          method: "POST", 
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert("Налаштування успішно збережені!");
      } catch (error) {
        console.error("Помилка збереження налаштувань:", error);
      }
    },
  },
  created() {
    this.fetchSettings();
  },
};
</script>

<style scoped>
.settings-content {
  display: flex;
  max-width: 845px;
  flex-direction: column;
  align-items: flex-start;
  font-family: Montserrat, sans-serif;
  transform: scale(0.7);
  transform-origin: top left;
  width: 1200px;
  margin-left: 20px;
}

.settings-header {
  display: flex;
  gap: 18px;
  font-size: 40px;
  color: #000;
  font-weight: 700;
  white-space: nowrap;
}

@media (max-width: 991px) {
  .settings-header {
    white-space: initial;
  }
}

.settings-logo {
  aspect-ratio: 1.07;
  object-fit: contain;
  object-position: center;
  width: 73px;
}

.settings-title {
  flex-grow: 1;
  margin: auto 0;
}

.logo-section {
  display: flex;
  margin-top: 41px;
  gap: 40px;
  font-weight: 700;
  flex-wrap: wrap;
}

@media (max-width: 991px) {
  .logo-section {
    margin-top: 40px;
  }
}

.section-title {
  color: #000;
  font-size: 25px;
  line-height: 1;
  flex-grow: 1;
  margin: auto 0;
}

.upload-button,
.submit-button {
  font-family: Montserrat, sans-serif;
  font-weight: 500;
  border-radius: 8px;
  background-color: #6b1f1f;
  color: #fff;
  font-size: 20px;
  line-height: 1.3;
  padding: 16px 28px;
  border: none;
  cursor: pointer;
}

@media (max-width: 991px) {

  .upload-button,
  .submit-button {
    padding-left: 20px;
  }
}

.contact-info-section {
  margin-top: 78px;
  width: 100%;
}

@media (max-width: 991px) {
  .contact-info-section {
    max-width: 100%;
    margin-top: 40px;
  }
}

.contact-info-container {
  border-radius: 5px;
  background-color: #fff7f6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 57px;
  padding: 37px 21px 21px;
  border: 1px solid #ddd;
}

@media (max-width: 991px) {
  .contact-info-container {
    max-width: 100%;
    margin-top: 40px;
  }
}

.contact-info-title {
  color: #040404;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 33px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  font-size: 20px;
  color: #333;
  font-weight: 500;
}

.form-group {
  margin-bottom: 19px;
}

.form-label {
  display: block;
  margin-bottom: 9px;
}

.form-input {
  border-radius: 5px;
  background-color: #eee3e3;
  width: 770px;
  color: #757575;
  padding: 16px 13px;
  font: 400 17px Inter, sans-serif;
  border: 1px solid #eee3e3;
}

@media (max-width: 991px) {
  .form-input {
    padding-right: 20px;
  }
}

.submit-button {
  align-self: flex-start;
  margin-top: 15px;
}

@media (max-width: 991px) {
  .submit-button {
    max-width: 100%;
    padding: 14px 20px;
  }
}
</style>