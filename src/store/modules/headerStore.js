// src/stores/headerStore.js
import { reactive, watch } from 'vue';

export const headerState = reactive({
  language: localStorage.getItem('language') || 'uk',    // рядок!
  currency: (localStorage.getItem('currency') || 'uah').toUpperCase(),
  isDarkMode: false,
});

// при зміні — зберігаємо рядки
watch(() => headerState.language, lang => {
  localStorage.setItem('language', lang)
}, { immediate: true });

watch(() => headerState.currency, cur => {
  localStorage.setItem('currency', cur.toLowerCase())
}, { immediate: true });

watch(() => headerState.isDarkMode, dm => {
  document.documentElement.classList.toggle('dark', dm)
}, { immediate: true });

export function useHeaderStore() {
  return headerState;
}
