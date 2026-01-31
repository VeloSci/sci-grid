import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    test: {
      name: 'core',
      root: './packages/core',
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      include: ['src/**/*.test.ts', 'src/__tests__/**/*.spec.ts'],
    },
  },
  {
    test: {
      name: 'react',
      root: './packages/react',
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  },
  {
    test: {
      name: 'vue',
      root: './packages/vue',
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      include: ['src/**/*.test.ts'],
    },
  },
])
