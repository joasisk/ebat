module.exports = {
  root: true,

  env: {
    node: true
  },

  parserOptions: {
    parser: 'babel-eslint'
  },

  rules: {
    'no-console': 'warn',
    'no-debugger': 'off',
    quotes: [2, 'single', { avoidEscape: true }],
    'vue/comma-dangle': 'error'
  },

  extends: ['plugin:vue/recommended', 'eslint:recommended', '@vue/prettier']
};
