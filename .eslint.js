module.exports = {
  root: true,
  env: {
    es6: true,
  },
  extends: ['@react-native', 'prettier'],
  plugins: ['react', 'react-native', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': [
      'error',
      {
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100,
        tabWidth: 2,
        arrowParens: 'avoid',
        jsxSingleQuote: false,
        jsxBracketSameLine: true,
      },
    ],
  },
};

