import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

/**
 * Vitest configuration for sanctuary-app.
 *
 * We run in happy-dom environment because it's lighter and more ESM-friendly 
 * than jsdom for React component tests.
 */
export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: 'happy-dom',
        globals: true,
        setupFiles: [],
        include: [
            'src/**/*.test.{ts,tsx}',
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
