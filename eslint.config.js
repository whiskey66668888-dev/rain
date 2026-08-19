// Node < 17 没有 structuredClone，ESLint config-array 会用到，在此做兼容
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = function structuredClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const prettierConfig = require('eslint-config-prettier');

// 排除 react/display-name，避免 Node < 17 下 structuredClone 未定义报错
const reactRecommendedRules = react.configs.recommended.rules || {};
const { 'react/display-name': _displayName, ...reactRulesWithoutDisplayName } =
  reactRecommendedRules;

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.d.ts',
      '.vscode/**',
      '.husky/**',
      '*.config.{ts,js}',
      'vite.config.ts',
      'prettier.config.js',
      'eslint.config.js',
      'scripts/**',
      'vitePlugins/*',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        __SITE_ID__: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@typescript-eslint': typescript,
      import: importPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.eslint.json',
        },
      },
    },
    rules: {
      ...reactRulesWithoutDisplayName,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      // React Hooks 规则
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // TypeScript 规则
      ...typescript.configs.recommended.rules,
      ...typescript.configs['recommended-requiring-type-checking'].rules,
      // 禁止使用 any
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      // 允许使用 require() 风格的导入
      '@typescript-eslint/no-require-imports': 'off',
      // 不强制要求显式类型注解，允许使用类型推断
      '@typescript-eslint/explicit-function-return-type': 'off',
      // 禁止未使用的变量（允许 Redux reducer 中的 state 和 action 参数，以及以下划线开头的参数）
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^(_|state|action|dispatch)',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // 要求使用 const
      'prefer-const': 'error',
      // 禁止 var
      'no-var': 'error',
      // 禁用导入顺序检查，允许自由导入
      'import/order': 'off',
    },
  },
  // 禁用与 Prettier 冲突的规则（必须在最后）
  prettierConfig,
];
