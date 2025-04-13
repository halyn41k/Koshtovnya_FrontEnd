<template>
  <main class="settings-content">
    <header class="settings-header">
      <h1 class="settings-title">Налаштування</h1>
    </header>

    <section class="contact-info-section">
      <h2 class="section-title">Загальна інформація:</h2>
      <div class="contact-info-container">
        <h3 class="contact-info-title">Контактна інформація</h3>
        <form class="contact-form" @submit.prevent="saveSettings">
          <div class="form-group">
            <label for="address" class="form-label">Адреса</label>
            <!-- Передбачено мапінг на footer_address_info -->
            <input type="text" id="address" class="form-input" v-model="settings.address" />
          </div>
          <div class="form-group">
            <label for="phone" class="form-label">Телефон</label>
            <!-- Передбачено мапінг на footer_phone_number -->
            <input type="tel" id="phone" class="form-input" v-model="settings.phone" />
          </div>
          <div class="form-group">
            <label for="email" class="form-label">Електронна пошта</label>
            <!-- Передбачено мапінг на footer_email_info -->
            <input type="email" id="email" class="form-input" v-model="settings.email" />
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
        // Інші поля (instagram, facebook, tiktok) можна додати за потреби,
        // але для оновлення необхідні лише адреса, телефон, email і логотип.
      },
      logoPreview: null,
      // Вказуємо endpoint для оновлення налаштувань
      apiUrl: "https://koshtovnya.api-dev.bmax-edu.website/api/admin/site-settings",
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
        // Потрібні поля
        formData.append("footer_address_info", this.settings.address);
        formData.append("footer_phone_number", this.settings.phone);
        formData.append("footer_email_info", this.settings.email);
        // Логотип додається лише якщо це файл (нове завантаження)
        if (this.settings.logo instanceof File) {
          formData.append("site_logo", this.settings.logo);
        }
        // Імітуємо PATCH методом POST
        formData.append("_method", "PATCH");

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
  mounted() {
    document.title = "Налаштування";
  }
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


.settings-title {
  top: -150px;
  font-size: 34px;
  font-weight: 700;
  margin: 0;
}

.section-title {
  color: #000;
  font-size: 25px;
  line-height: 1;
  flex-grow: 1;
  margin: auto 0;
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
  .submit-button {
    max-width: 100%;
    padding: 14px 20px;
  }
}

.image-preview {
  margin-top: 10px;
}
.logo-preview {
  max-width: 150px;
  max-height: 150px;
  object-fit: contain;
}
</style>
