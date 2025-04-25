// Першим рядком!
const path = require('path');

module.exports = {
  root: true,
  // Ігноруємо dist/
  ignorePatterns: ['dist/'],

  env: {
    node: true,
    browser: true,
    jest: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  plugins: ['import'],
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', path.resolve(__dirname, 'src')]],
        extensions: ['.js', '.vue', '.json'],
      },
      node: {
        extensions: ['.js', '.vue', '.json'],
        moduleDirectory: ['node_modules'],
      },
    },
  },
  rules: {
    'no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
    'import/no-unresolved': ['error', {
      caseSensitive: true,
      caseSensitiveStrict: true,
    }],
    'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'always',
      json: 'never',
    }],
  },
  overrides: [
    {
      files: ['vite.config.js'],
      rules: {
        'import/no-unresolved': 'off',
      },
    },
  ]
};
