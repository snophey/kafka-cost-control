/// <reference types="vitest/config" />
// the above reference is needed for tsconfig "types" to work correctly
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: './server/app.ts',
        }
      : undefined,
  },
  // We disable reactRouter() plugin when using vitest to avoid some gnarly dependency issues:
  // See: https://github.com/vitest-dev/vitest/issues/7794#issuecomment-2777307476
  plugins: [!process.env.VITEST && reactRouter(), tsconfigPaths()],
  test: {
    projects: [
      {
        plugins: [tsconfigPaths()],
        test: {
          name: 'unit-tests',
          include: ['**/*.test.ts'],
          // since we use a shared DB container in tests, we want to run tests sequentially to avoid interference
          fileParallelism: false,
        },
      },
      {
        plugins: [tsconfigPaths()],
        test: {
          name: 'component-tests',
          include: ['**/*.test.tsx'],
          retry: 2,
          browser: {
            provider: playwright(),
            enabled: true,
            // at least one instance is required
            instances: [{ browser: 'firefox' }],
          },
        },
      },
    ],
  },
}));
