import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // налаштування для компіляції vue шаблонів
        }
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    // Додаткові feature flags
    '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': 'true',
    '__VUE_PROD_DEVTOOLS__': 'false',
    '__VUE_OPTIONS_API__': 'true',
    // Додаткові налаштування для runtime
    '__INTLIFY_PROD_DEVTOOLS__': 'false'
  },
  // Додаткові налаштування для розв'язання проблем
  build: {
    rollupOptions: {
      // Налаштування для збірки
    }
  },
  // Якщо використовується TypeScript
  optimizeDeps: {
    include: ['vue']
  }
})
