// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './index';
import i18n from './i18n';
import store from './store/index';
import axios from 'axios';

// імпортуємо плагін і його стилі
import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const app = createApp(App);

// робимо axios глобально доступним
app.config.globalProperties.$axios = axios;

// реєструємо плагін нотифікацій
app.use(Toast, {
  // приклад опцій — положення, тривалість тощо
  position: POSITION.TOP_RIGHT,
  timeout: 5000,
  closeOnClick: true,
});

app.use(router)
   .use(i18n)
   .use(store)
   .mount('#app');
