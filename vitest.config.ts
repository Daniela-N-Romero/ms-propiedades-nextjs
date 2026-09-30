import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'node', // Entorno Node.js: ideal para Server Actions y Prisma
    globals: true,
    // Excluimos las carpetas de Playwright para que Vitest no intente correrlas
    exclude: ['**/node_modules/**', '**/test/**', '**/tests/e2e/**'],
  },
});