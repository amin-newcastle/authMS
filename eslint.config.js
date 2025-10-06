const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');

module.exports = [
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        expect: 'readonly',
      },
    },
  },
  prettier,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
    ignores: ['node_modules', 'dist', 'build'],
  },
];
