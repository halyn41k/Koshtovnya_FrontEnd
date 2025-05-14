module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true, // ✅ ДОДАЙ ЦЕ
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'plugin:jest/recommended', // ✅ ДОДАЙ ЦЕ
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    requireConfigFile: false,
  },
  plugins: ['vue', 'import', 'jest'], // ✅ ДОДАЙ "jest"
  rules: {
      'jest/no-conditional-expect': 'off',

    'no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
  },
};
