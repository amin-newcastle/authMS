import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import nodePlugin from 'eslint-plugin-n';
import prettierPlugin from 'eslint-plugin-prettier';
import securityPlugin from 'eslint-plugin-security';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  globalIgnores([
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    'docs/',
    '*.log',
    'npm-debug.log*',
    '.DS_Store',
  ]),

  {
    // Tell import-plugin to ignore these “virtual” modules
    settings: {
      'import/core-modules': [
        'eslint/config',
        '@typescript-eslint/parser',
        '@typescript-eslint/eslint-plugin',
      ],
    },
    // your core JS/TS config
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
      import: importPlugin,
      node: nodePlugin,
      security: securityPlugin,
      jest: jestPlugin,
    },

    rules: {
      // ✅ General Best Practices
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'no-shadow': 'error',
      'consistent-return': 'error',
      'prefer-const': 'warn',

      // ✅ TypeScript Rules
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',

      // ✅ Import Rules
      'import/no-extraneous-dependencies': 'error',
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // ✅ Node.js Best Practices
      'node/no-unsupported-features/es-syntax': 'off',
      'node/no-missing-import': 'off',

      // ✅ Security Best Practices
      'security/detect-object-injection': 'warn',

      // ✅ Jest Testing Rules
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',

      // ✅ Prettier for Formatting
      'prettier/prettier': [
        'error',
        { singleQuote: true, semi: true, trailingComma: 'all' },
      ],
    },
  },
];
