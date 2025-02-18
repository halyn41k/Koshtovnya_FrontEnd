<template> 
  <footer class="footer">
    <div class="footer-content">
      <div class="logo-section">
        <router-link to="/" class="logo-wrapper">
          <img :src="siteSettings.site_logo" alt="Коштовня Лого" class="logo-image" />
          <h1 class="logo-title">{{ $t('logo') }}</h1>
        </router-link>
        <p class="description">{{ $t('description') }}</p>
      </div>
      <div class="footer-links">
        <div class="nav-section">
          <h2 class="nav-title">{{ $t('links') }}</h2>
          <ul class="footer-list">
            <li>
              <router-link to="/aboutus" class="footer-link">
                <img src="@/assets/arrow.png" class="icon-left" alt="arrow" />
                {{ $t('aboutUs') }}
              </router-link>
            </li>
            <li>
              <router-link to="/aboutdelivery" class="footer-link">
                <img src="@/assets/arrow.png" class="icon-left" alt="arrow" />
                {{ $t('aboutDelivery') }}
              </router-link>
            </li>
            <li>
              <router-link to="/account" class="footer-link">
                <img src="@/assets/arrow.png" class="icon-left" alt="arrow" />
                {{ $t('userAccount') }}
              </router-link>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <h2 class="nav-title">{{ $t('contactUs') }}</h2>
          <address class="contact-info">
            <div class="contact-item">
              <img src="@/assets/mark.png" class="icon-left" alt="address" />
              <p class="address">{{ siteSettings.footer_address_info }}</p>
            </div>
            <div class="divider"></div>
            <div class="contact-item">
              <img src="@/assets/telephone.png" class="icon-left" alt="phone" />
              <p class="phone">{{ siteSettings.footer_phone_number }}</p>
            </div>
            <div class="divider"></div>
            <div class="contact-item">
              <img src="@/assets/list.png" class="icon-left" alt="email" />
              <p class="email">{{ siteSettings.footer_email_info }}</p>
            </div>
          </address>
        </div>

        <div class="nav-section">
          <h2 class="nav-title">{{ $t('followUs') }}</h2>
          <div class="social-links">
            <a href="https://www.instagram.com" target="_blank" class="social-link">
              <img src="@/assets/instagram.png" alt="Instagram" class="social-icon" />
            </a>
            <a href="https://www.facebook.com" target="_blank" class="social-link">
              <img src="@/assets/facebook.png" alt="Facebook" class="social-icon" />
            </a>
            <a href="https://www.tiktok.com" target="_blank" class="social-link">
              <img src="@/assets/tiktok.png" alt="TikTok" class="social-icon" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      siteSettings: {
        site_logo: '',
        footer_email_info: '',
        footer_address_info: '',
        footer_phone_number: ''
      }
    };
  },
  mounted() {
    this.fetchSiteSettings();
  },
  methods: {
    async fetchSiteSettings() {
      try {
        const response = await axios.get('http://26.235.139.202:8080/api/site-settings');
        const settings = response.data.data;
        settings.forEach(setting => {
          this.siteSettings[setting.setting_key] = setting.setting_value;
        });
      } catch (error) {
        console.error('Помилка завантаження налаштувань сайту:', error);
      }
    }
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap');

@font-face {
  font-family: 'KyivType Titling';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
}

.footer {
  display: flex;
  justify-content: space-between;
  padding: 50px;
  background-color: #F4E7E5;
  font-family: 'Merriweather', serif;
  z-index: 1000;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 50px;
  transform: translateX(-50px);
}

.logo-section {
  width: 30%;
  transform: translateX(50px);
}

.logo-section {
  width: 30%;
  transform: translateX(50px);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
  text-decoration: none;
}

.logo-image {
  margin-top: 0px;
  margin-left: 0px;
  width: 80px;
  height: 70px;
}

.logo-title {
  margin-top: 10px;
  margin-left: -20px;
  font-family: 'KyivType Titling', sans-serif;
  font-weight: 900;
  font-size: 30px;
  color: black;
  transition: transform 0.3s ease;
  text-decoration: none;
  margin-left: 5px;
}

.logo-wrapper:hover .logo-title {
  transform: scale(1.05);
}

.description {
  font-size: 16px;
  color: black;
  margin-top: 10px;
  font-family: 'Montserrat', serif;
  text-align: left;
  line-height: 1.6;

}

.footer-links {
  display: flex;
  justify-content: space-between;
  width: 60%;
  margin-top: 20px;
  position: relative;
}

.nav-section {
  flex: 1;
  min-width: 200px; /* Забезпечує нормальне вирівнювання */
}

.nav-title {
  color: black;
  font-size: 18px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  text-align: center;
  margin-bottom: 10px;
}

.footer-list {
  list-style-type: none;
  padding: 0;
}

.footer-link {
  font-size: 16px;
  text-decoration: none;
  color: black;
  margin-bottom: 10px;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  align-items: center;
  position: relative;
  transition: color 0.3s ease;
}

.footer-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  height: 2px;
  width: 0;
  background-color: #333;
  transition: width 0.3s ease;
}

.footer-link:hover::after {
  width: 100%;
}

.footer-link:hover {
  color: #333;
}

.icon-left {
  margin-right: 10px;
}

.contact-info {
  font-size: 16px;
  font-family: 'Montserrat', serif;
  font-style: normal;
  margin-left: auto; /* Вирівнює контактну інформацію праворуч */
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.divider {
  width: 100%;
  height: 1px;
  background-color: #888888;
  margin: 5px 0;
}

.social-links {
  margin-left: 65px;
  display: flex;
  gap: 15px;
}

.social-icon {
  width: 30px;
  height: auto;
  transition: transform 0.3s ease;
}

.social-link:hover .social-icon {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
  }

  .footer-links {
    flex-direction: column;
    gap: 30px;
  }
}
</style>
