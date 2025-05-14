<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
  try {
    const url = new URL(window.location.href)
    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.token && data.user) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/') // або /dashboard /profile
    } else {
      alert('Не вдалося авторизуватись через Google.')
      router.push('/login')
    }
  } catch (err) {
    console.error('Помилка при авторизації через Google:', err)
    router.push('/login')
  }
})
</script>

<template>
  <div class="flex items-center justify-center h-screen text-gray-600 text-xl">
    ⏳ Авторизуємо через Google...
  </div>
</template>
