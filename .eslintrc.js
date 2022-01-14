module.exports = {
  env: {
    browser: true,
    node: true
  },
  parser:'vue-eslint-parser' ,
  plugins:['@typescript-eslint'],
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions:{
    parser:'@typescript-eslint/parser',
    sourceType:'module',
    ecmaVersion:12
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