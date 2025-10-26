// ----------------------------------------------------------------------------
// Group: Group 3 — COMP 4350: Software Engineering 2
// Project: Studly
// Author: Hamed Esmaeilzadeh (team member)
// Generated / scaffolded with assistance from ChatGPT (GPT-5 Thinking mini)
// Date: 2025-10-07
// Modified: 2025-10-27
// ----------------------------------------------------------------------------
import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

const sharedLanguageOptions = {
  parser: tseslint.parser,
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: import.meta.dirname,
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  globals: {
    ...globals.browser,
    ...globals.vitest,
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
    ignores: ['dist', 'build', 'coverage', 'cypress/videos', 'cypress/screenshots'],
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
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'object', 'type'],
        },
      ],
    },
  }
);
