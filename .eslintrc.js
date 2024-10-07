// https://eslint.org/docs/latest/use/getting-started
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    './node_modules/eslint-config-airbnb/.eslintrc'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'default-param-last': 0,
    'func-names': 0,
    'max-classes-per-file': 0,
    'max-len': 0,
    'no-case-declarations': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 1 : 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 0,
    'no-else-return': 0,
    'no-prototype-builtins': 0,
    'no-shadow': 0,
    'react/jsx-filename-extension': 0,
    'react/prop-types': 0,
    'space-before-function-paren': 0,
    'class-methods-use-this': 0,
    'quote-props': ['error', 'as-needed', { 'unnecessary': false }],
    'no-restricted-syntax': 0,
    'no-unused-vars': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/jsx-props-no-spreading': 0,
    'no-param-reassign': 0,
    'no-plusplus': 0,
    'import/prefer-default-export': 0,
    'import/no-named-as-default-member': 0,
    'no-lonely-if': 0,
    'react/destructuring-assignment': 0,
    'no-await-in-loop': 'off',
  }
};
