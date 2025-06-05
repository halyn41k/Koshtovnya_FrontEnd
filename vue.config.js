// vue.config.js
const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.js', '.vue', '.json'],
    },
  },
  chainWebpack: config => {
    // Вимикає перевірку регістру шляху
    config.plugins.delete('case-sensitive-paths');
  }
};
