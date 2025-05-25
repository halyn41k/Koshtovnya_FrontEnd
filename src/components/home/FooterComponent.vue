<template>
  <footer class="bg-[#F4E7E5] text-gray-800 py-12 px-[50px]">
    <div class="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-start space-y-8 md:space-y-0 md:space-x-8">
      <!-- Logo Section -->
      <div class="flex-1 md:flex-[0.3] flex flex-col items-start space-y-4">
        <router-link to="/" class="flex items-center space-x-4">
          <img
            :src="siteSettings.site_logo"
            alt="Коштовня Лого"
            class="w-20 h-auto"
          />
          <h1 class="font-heading text-h3 text-semantic-primary font-black">
            {{ $t('home.siteName') }}</h1>
          
        </router-link>
        <p class="text-base leading-relaxed font-['Montserrat']">
          {{ $t('home.description') }}
        </p>
      </div>

      <!-- Links & Contact Sections -->
      <div class="flex-1 md:flex-[0.6] flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-12">
        <!-- Navigation Links -->
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-center mb-4 font-['Montserrat'] flex items-center justify-center
              before:content-[''] before:inline-block before:w-8 before:h-[2px] before:bg-[#090909] before:mr-2
              after:content-[''] after:inline-block after:w-8 after:h-[2px] after:bg-[#090909] after:ml-2">
            {{ $t('home.links') }}
          </h2>
          <ul class="space-y-2">
            <li>
              <router-link
                to="/aboutus"
                class="relative flex items-center space-x-2 text-base hover:text-black-700 transition-colors
                       before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:h-[2px] before:bg-[#090909] before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-300"
              >
                <img src="@/assets/icons/arrow_right.svg" alt="arrow" class="w-4 h-4" />
                <span class="font-['Montserrat']">{{ $t('home.aboutUs') }}</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/aboutdelivery"
                class="relative flex items-center space-x-2 text-base hover:text-gray-700 transition-colors
                       before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:h-[2px] before:bg-[#090909] before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-300"
              >
                <img src="@/assets/icons/arrow_right.svg" alt="arrow" class="w-4 h-4" />
                <span class="font-['Montserrat']">Про Оплату | Доставку</span>
              </router-link>
            </li>
            <li>
              <router-link
                to="/account"
                class="relative flex items-center space-x-2 text-base hover:text-gray-700 transition-colors
                       before:content-[''] before:absolute before:left-0 before:right-0 before:bottom-0 before:h-[2px] before:bg-[#090909] before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-300"
              >
                <img src="@/assets/icons/arrow_right.svg" alt="arrow" class="w-4 h-4" />
                <span class="font-['Montserrat']">{{ $t('home.userAccount') }}</span>
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-center mb-4 font-['Montserrat'] flex items-center justify-center
              before:content-[''] before:inline-block before:w-8 before:h-[2px] before:bg-[#090909] before:mr-2
              after:content-[''] after:inline-block after:w-8 after:h-[2px] after:bg-[#090909] after:ml-2">
            {{ $t('home.contactUs') }}
          </h2>
          <address class="not-italic space-y-4 font-['Montserrat']">
            <div class="flex items-start space-x-2">
              <img src="@/assets/icons/location.svg" alt="address" class="w-5 h-5 mt-1" />
              <p>{{ siteSettings.footer_address_info }}</p>
            </div>
            <div class="border-t border-gray-300"></div>
            <div class="flex items-center space-x-2">
              <img src="@/assets/icons/phone.svg" alt="phone" class="w-5 h-5" />
              <p>{{ siteSettings.footer_phone_number }}</p>
            </div>
            <div class="border-t border-gray-300"></div>
            <div class="flex items-center space-x-2">
              <img src="@/assets/icons/mail.svg" alt="email" class="w-5 h-5" />
              <p>{{ siteSettings.footer_email_info }}</p>
            </div>
          </address>
        </div>

        <!-- Social Links -->
        <div class="flex-1">
          <h2 class="text-lg font-semibold text-center mb-4 font-['Montserrat'] flex items-center justify-center
              before:content-[''] before:inline-block before:w-8 before:h-[2px] before:bg-[#090909] before:mr-2
              after:content-[''] after:inline-block after:w-8 after:h-[2px] after:bg-[#090909] after:ml-2">
            {{ $t('home.followUs') }}
          </h2>
          <div class="flex justify-center space-x-4">
            <a href="https://www.instagram.com" target="_blank" class="transform hover:scale-110 transition-transform">
              <img src="@/assets/instagram.png" alt="Instagram" class="w-6 h-6" />
            </a>
            <a href="https://www.facebook.com" target="_blank" class="transform hover:scale-110 transition-transform">
              <img src="@/assets/facebook.png" alt="Facebook" class="w-6 h-6" />
            </a>
            <a href="https://www.tiktok.com" target="_blank" class="transform hover:scale-110 transition-transform">
              <img src="@/assets/tiktok.png" alt="TikTok" class="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'AppFooter',
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
  async mounted() {
    await this.fetchSiteSettings();
  },
  methods: {
    async fetchSiteSettings() {
      try {
        const response = await api.getSiteSettings();
        const settingsArray = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        settingsArray.forEach(({ setting_key, setting_value }) => {
          if (Object.prototype.hasOwnProperty.call(this.siteSettings, setting_key)) {
            this.siteSettings[setting_key] = setting_value;
          }
        });
      } catch (error) {
        console.error('Помилка завантаження налаштувань сайту:', error);
      }
    }
  }
};
</script>

<style>
@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900; font-style: normal; font-display: swap;
}
.font-base { font-family: 'Montserrat', sans-serif; }
.font-heading { font-family: 'KyivType Titling Black2', sans-serif; }
.text-body3 { font-size: 14px; line-height: 18px; font-weight: 500; }
.text-h3    { font-size: 18px; line-height: 32px; }

</style>