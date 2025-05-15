module.exports = {
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(jpg|jpeg|png|gif|svg|ttf|woff|woff2)$': 'jest-transform-stub',
  },
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@vue)/)'],
  moduleNameMapper: {
    // Алiаси
    '^@/(.*)$': '<rootDir>/src/$1',

    // Заглушки для стилів
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',

    // Заглушка для ресурсів (якщо не використовуєш jest-transform-stub)
    '\\.(jpg|jpeg|png|gif|webp|svg|ttf|woff|woff2|eot)$': '<rootDir>/test/units/__mocks__/fileMock.js',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
};
