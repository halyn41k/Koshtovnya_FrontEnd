// src/composables/useSettings.js
import { ref } from 'vue'

export function useSettings() {
  const LANGUAGE_KEY = 'language'
  const CURRENCY_KEY = 'currency'

  // реактивні стани, ініціалізуються з localStorage
  const language = ref(localStorage.getItem(LANGUAGE_KEY) || 'uk')
  const currency = ref((localStorage.getItem(CURRENCY_KEY) || 'uah').toUpperCase())

  // зміна мови та запис + reload
  function setLanguage(lang) {
    language.value = lang
    localStorage.setItem(LANGUAGE_KEY, lang)
    // оновлюємо vue-i18n
    // якщо у вас i18n налаштовано як глобальний плагін
     this.$i18n.locale = lang;
    window.location.reload()
  }

  // зміна валюти та запис + reload
  function setCurrency(curr) {
    currency.value = curr.toLowerCase()
    localStorage.setItem(CURRENCY_KEY, curr.toLowerCase())
    window.location.reload()
  }

  return {
    language,
    currency,
    setLanguage,
    setCurrency,
  }
}
