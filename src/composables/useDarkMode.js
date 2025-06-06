import { ref } from 'vue'

export const isDark = ref(localStorage.getItem('theme') === 'dark')

export const toggleTheme = () => {
  isDark.value = !isDark.value
  const html = document.documentElement
  const theme = isDark.value ? 'dark' : 'light'

  html.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', theme)
}

export function initTheme() {
  const saved = localStorage.getItem('theme')
  const html = document.documentElement

  if (saved === 'dark') {
    html.classList.add('dark')
    isDark.value = true
  } else {
    html.classList.remove('dark')
    isDark.value = false
  }
}
