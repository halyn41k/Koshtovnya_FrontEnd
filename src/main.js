import { createApp } from 'vue';
import App from './App.vue';
import router from './index.js';
import i18n from './i18n';  // Імпортуємо i18n
import store from './store/index.js';
import axios from 'axios';  // Імпортуємо axios

const app = createApp(App);

app.config.globalProperties.$axios = axios; // Реєструємо axios як $axios

app.use(router)  // Використовуємо роутер
   .use(i18n)   // Використовуємо i18n
   .use(store)
   .mount('#app');  // Монтуємо застосунок
