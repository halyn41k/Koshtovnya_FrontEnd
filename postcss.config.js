module.exports = {
    plugins: {
      // спочатку обробляємо @import
      'postcss-import': {},
  
      // потім сам Tailwind CSS
      '@tailwindcss/postcss': {},
  
      // автопрефіксер
      autoprefixer: {},
    },
  }
  