import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * Vitest configuration for sanctuary-app.
 *
 * We run in jsdom (browser-like) environment because the components use
 * window, localStorage, and DOM APIs. The shared/ library tests come along
 * for the ride via the include glob — one config covers it all.
 *
 * Coverage is opt-in via `npm run test:coverage` — we use v8 (native)
 * provider for fast, accurate coverage without source-map gymnastics.
 */
export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [],
        include: [
            'src/**/*.test.{ts,tsx}',
            // Pull in the shared library tests so coverage is reported together
            '../shared/**/*.test.ts',
        ],
        exclude: ['dist/**', 'node_modules/**', 'src-tauri/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: '../coverage/sanctuary-app',
            include: ['src/**/*.{ts,tsx}', '../shared/**/*.ts'],
            exclude: [
                'src/**/*.test.{ts,tsx}',
                '../shared/**/*.test.ts',
                'src/main.tsx',
                'src/vite-env.d.ts',
            ],
        },
    },
});
