module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current', // Для Jest / Node середовища
        },
      },
    ],
  ],
};
