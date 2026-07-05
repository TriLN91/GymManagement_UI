import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.tsx',
        'src/main.tsx',
        'src/mocks/**',
        'src/**/*.d.ts',
      ],
      thresholds: {
        // Foundation phase: tight thresholds would block progress while
        // features land. We enforce a realistic floor and raise it as
        // coverage grows.
        lines: 25,
        functions: 20,
        statements: 25,
        branches: 20,
      },
    },
    exclude: ['node_modules', 'dist', 'e2e/**', 'playwright-report/**', 'test-results/**'],
  },
});