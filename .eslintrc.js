module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended'
  ],
  parserOptions:{
    ecmaVersion:8
  },
  rules: {
    'prefer-const':2,
    'no-console':0,
    indent: [
      'error',
      2
    ],
    quotes: [
      'error',
      'single',
      'avoid-escape'
    ],
    semi: [
      'error',
      'never'
    ]
  }
}