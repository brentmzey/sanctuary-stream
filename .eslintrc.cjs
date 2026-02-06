module.exports = {
  root: true,
  ignorePatterns: ['pocketbase', 'node_modules', 'dist'],
  overrides: [
    {
      files: ['shared/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
      ],
    },
    {
      files: ['sanctuary-app/**/*.{ts,tsx}'],
      extends: ['./sanctuary-app/.eslintrc.cjs'],
    },
    {
      files: ['sanctuary-bridge/**/*.ts'],
      extends: ['./sanctuary-bridge/.eslintrc.cjs'],
    },
  ],
};
