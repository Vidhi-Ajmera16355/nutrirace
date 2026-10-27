import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Type-aware ESLint flat config for Node.js (NestJS / worker / library) packages.
 * No rule is disabled to hide problems; the only relaxation is for test files,
 * where jest matchers legitimately reference unbound methods.
 */
export function createNodeConfig({ tsconfigRootDir }) {
  return tseslint.config(
    { ignores: ['dist/**', 'coverage/**', 'node_modules/**', '*.config.*'] },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
      languageOptions: {
        globals: globals.node,
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
    {
      files: ['**/*.spec.ts', '**/*.e2e-spec.ts', '**/*.int-spec.ts', 'test/**/*.ts'],
      rules: {
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  );
}
