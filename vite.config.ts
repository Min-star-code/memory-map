/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the built site works from a GitHub Pages subpath.
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // e2e/ holds Playwright tests; they run with `npm run test:e2e`, not Vitest.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
