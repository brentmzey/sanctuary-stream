module.exports = {
  root: true,
  ignorePatterns: ['pocketbase', 'node_modules', 'dist'],
  overrides: [
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
