<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white">
    <h1 class="text-2xl font-bold mb-4">Dark Mode Test</h1>
    <button
      @click="toggle"
      class="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 dark:text-white"
    >
      Toggle Theme
    </button>
  </div>
</template>

<script>
export default {
  methods: {
    toggle() {
      const html = document.documentElement
      html.classList.toggle('dark')
    }
  }
}
</script>
