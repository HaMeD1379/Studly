// ----------------------------------------------------------------------------
// Group: Group 3 — COMP 4350: Software Engineering 2
// Project: Studly
// Author: Hamed Esmaeilzadeh (team member)
// Generated / scaffolded with assistance from ChatGPT (GPT-5 Thinking mini)
// Date: 2025-10-07
// Modified: 2025-10-26
// ----------------------------------------------------------------------------
import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sharedLanguageOptions = {
  parser: tseslint.parser,
  parserOptions: {
    project: ['./tsconfig.json', './cypress/tsconfig.json'],
    tsconfigRootDir: import.meta.dirname,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    ...globals.browser,
    ...globals.node,
    ...globals.vitest,
    ...globals.mocha,
    ...globals.jasmine,
    ...globals.cypress,
  },
};

const typeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map((config) => {
  if (!config.languageOptions) {
    return config;
  }

  return {
    ...config,
    languageOptions: {
      ...sharedLanguageOptions,
      ...config.languageOptions,
      parserOptions: {
        ...sharedLanguageOptions.parserOptions,
        ...config.languageOptions.parserOptions,
      },
      globals: {
        ...sharedLanguageOptions.globals,
        ...config.languageOptions.globals,
      },
    },
  };
});

export default tseslint.config(
  {
    ignores: [
      'dist',
      'build',
      'coverage',
      'cypress/videos',
      'cypress/screenshots',
      'eslint.config.js',
      'vite.config.ts',
    ],
  },
  ...typeCheckedConfigs,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: sharedLanguageOptions,
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {
          project: ['./tsconfig.json', './cypress/tsconfig.json'],
        },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/no-unresolved': 'off',
      'import/order': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'react/no-unescaped-entities': 'off',
    },
  }
);
