module.exports = {

  env: {
    node: true
  },

  parser: "@typescript-eslint/parser",

  extends: ['plugin:@typescript-eslint/recommended'],

  plugins: ['@typescript-eslint'],

  rules: {
    semi: [2, 'always'],
    'no-eval': 0,
    'arrow-parens': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    eqeqeq: 0,
    'no-multi-spaces': 0,
    indent: 0,
    'comma-dangle': [2, 'only-multiline'],
    'no-trailing-spaces': 0,
    "@typescript-eslint/no-var-requires": 1,
    "@typescript-eslint/no-use-before-define": 1,
    "@typescript-eslint/no-empty-function": 1
  }
};
