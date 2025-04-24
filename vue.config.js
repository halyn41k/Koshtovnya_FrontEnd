// vue.config.js
const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        // дозволяє писати import X from '@/components/...'
        '@': path.resolve(__dirname, 'src'),
      },
      // автоматично «підхоплювати» .js, .vue, .json
      extensions: ['.js', '.vue', '.json'],
    },
  },
};
