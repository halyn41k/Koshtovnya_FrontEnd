// vue.config.js
const path = require('path')

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.vue', '.json'],
    },
    devtool: 'source-map',      // ← Додаємо source‑maps
  },
  chainWebpack: config => {
    config.plugins.delete('case-sensitive-paths')
  }
}
