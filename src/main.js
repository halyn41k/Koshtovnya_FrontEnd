// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './locales'
import { initTheme } from '@/composables/useDarkMode'

// ✅ Tailwind CSS та кастомна тема
import './assets/tailwind.css'
import './assets/theme.css'

// ✅ Бібліотеки стилів
import 'vue-multiselect/dist/vue-multiselect.min.css'
import 'vue-toastification/dist/index.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'vue-loading-skeleton/dist/vue-loading-skeleton.css'

// ✅ Skeleton loader
import Skeleton from 'vue-loading-skeleton'

// ✅ Toast
import Toast, { POSITION } from 'vue-toastification'

// ✅ Axios
import axios from 'axios'

// ✅ Валідація
import { defineRule, configure } from 'vee-validate'
import * as AllRules from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'

// Темна тема ініціалізація ДО mount
initTheme()

// Створення застосунку
const app = createApp(App)

// Глобальний доступ до axios
app.config.globalProperties.$axios = axios

// Ініціалізація правил валідації
Object.entries(AllRules).forEach(([name, rule]) => {
  if (typeof rule === 'function') defineRule(name, rule)
})

// Налаштування vee-validate
configure({
  generateMessage: localize('uk'),
  validateOnInput: true,
})

// Підключення плагінів
app
  .use(Skeleton)
  .use(router)
  .use(store)
  .use(i18n)
  .use(Toast, {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
    closeOnClick: true,
  })

// Монтання додатку
app.mount('#app')
