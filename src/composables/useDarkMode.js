// src/composables/useDarkMode.js
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const apply = (val) => {
  document.documentElement.classList.toggle('dark', val)
  localStorage.setItem('theme', val ? 'dark' : 'light')
}

const initTheme = () => {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') {
    isDark.value = stored === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  apply(isDark.value)
}

// Initialize immediately so the correct theme is set before Vue mounts
initTheme()

export function useDarkMode() {
  onMounted(() => {
    initTheme()
  })

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    apply(isDark.value)
  }

  const applyTheme = () => apply(isDark.value)

  return { isDark, toggleDarkMode, applyTheme }
}
