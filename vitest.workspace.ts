import { defineWorkspace } from 'vitest/config'
import { resolve } from 'path'

const coreAlias = {
  '@sci-grid/core': resolve(__dirname, 'packages/core/src/index.ts')
}

export default defineWorkspace([
  {
    test: {
      name: 'core',
      root: './packages/core',
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      include: ['src/**/*.test.ts', 'src/__tests__/**/*.spec.ts'],
      alias: coreAlias,
    },
  },
  {
    test: {
      name: 'react',
      root: './packages/react',
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      alias: coreAlias,
    },
  },
  {
    test: {
      name: 'vue',
      root: './packages/vue',
      environment: 'jsdom',
      setupFiles: ['./src/test-setup.ts'],
      include: ['src/**/*.test.ts'],
      alias: coreAlias,
    },
  },
  {
    test: {
      name: 'solid',
      root: './packages/solid',
      environment: 'jsdom',
      setupFiles: [], // Solid might need special setup, but empty for now
      include: ['src/**/*.test.{ts,tsx}'],
      alias: coreAlias,
    },
  },
  {
    test: {
      name: 'angular',
      root: './packages/angular',
      environment: 'jsdom',
      setupFiles: [],
      include: ['src/**/*.test.ts'],
      alias: coreAlias,
    },
  },
])
