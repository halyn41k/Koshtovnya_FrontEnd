// src/main.js
import { createApp } from 'vue'
import App from './App.vue'

// Vue-плагіни
import router from './router'
import store from './store'
import i18n from './i18n'

// Tailwind CSS
import './assets/tailwind.css'
import 'vue-multiselect/dist/vue-multiselect.min.css'

// Axios глобально
import axios from 'axios'

// Toastification
import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// VeeValidate
import { defineRule, configure } from 'vee-validate'
import * as AllRules from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'

// — ось вони, як і раніше:
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'


const app = createApp(App)

// 1) Глобальний axios
app.config.globalProperties.$axios = axios

// 2) VeeValidate: реєструємо тільки функціональні правила й використовуємо вбудовану локалізацію
Object.entries(AllRules).forEach(([name, rule]) => {
  if (typeof rule === 'function') {
    defineRule(name, rule)
  }
})
configure({
  generateMessage: localize('uk'),  // локалізація українською
  validateOnInput: true,            // валідація під час введення
})

// 3) Toast
app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 5000,
  closeOnClick: true,
})

// 4) Інші плагіни
app
  .use(router)
  .use(store)
  .use(i18n)
  .mount('#app')
