import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: 'node',
        exclude: ['dist/**', 'node_modules/**', '.idea/**', '.git/**', '.cache/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: '../coverage/sanctuary-bridge',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.test.ts', 'src/types.ts'],
            thresholds: {
                statements: 90,
                branches: 90,
                functions: 90,
                lines: 90
            }
        }
    },
});
