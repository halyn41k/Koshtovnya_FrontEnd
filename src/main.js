import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './locales'
import { initTheme } from '@/composables/useDarkMode'

import Skeleton from 'vue-loading-skeleton'
import 'vue-loading-skeleton/dist/vue-loading-skeleton.css'

initTheme() // 🌓 <== обов'язково ДО mount

import './assets/tailwind.css'     // Tailwind core
import './assets/theme.css'        // 🎯 CSS змінні та кастомні стилі
import 'vue-multiselect/dist/vue-multiselect.min.css'
import 'vue-toastification/dist/index.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

import axios from 'axios'
import Toast, { POSITION } from 'vue-toastification'
import { defineRule, configure } from 'vee-validate'
import * as AllRules from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'

const app = createApp(App)
app.config.globalProperties.$axios = axios

Object.entries(AllRules).forEach(([name, rule]) => {
  if (typeof rule === 'function') defineRule(name, rule)
})

configure({
  generateMessage: localize('uk'),
  validateOnInput: true,
})

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
  .mount('#app')
