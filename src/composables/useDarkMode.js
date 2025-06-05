// src/composables/useDarkMode.js
import { ref } from 'vue'

const stored = localStorage.getItem('theme')
const initial = stored ? stored === 'dark' : document.documentElement.classList.contains('dark')
const isDark = ref(initial)

export function useDarkMode() {
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
    isDark.value = document.documentElement.classList.contains('dark')
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  // apply initial state
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  return { isDark, toggleDarkMode }
}
