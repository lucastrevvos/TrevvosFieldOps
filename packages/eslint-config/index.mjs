import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export const nodeConfig = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
);

export const reactConfig = tseslint.config(...nodeConfig, {
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.es2023,
    },
  },
});

export default [
  eslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
  },
];
