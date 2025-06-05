// src/composables/useDarkMode.js
import { ref } from 'vue'

const stored = localStorage.getItem('theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const isDark = ref(stored ? stored === 'dark' : prefersDark)

const apply = (val) => {
  document.documentElement.classList.toggle('dark', val)
}

// apply on load
apply(isDark.value)

export function useDarkMode() {
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    apply(isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  const applyTheme = () => apply(isDark.value)

  return { isDark, toggleDarkMode, applyTheme }
}
