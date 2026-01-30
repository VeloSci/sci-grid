/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    vue(),
    dts({
      include: ['src'],
      insertTypesEntry: true,
    }),
  ] as any,
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/sci-grid.ts'),
        react: resolve(__dirname, 'src/adapters/react.tsx'),
        vue: resolve(__dirname, 'src/adapters/vue.ts'),
        solid: resolve(__dirname, 'src/adapters/solid.tsx'),
        angular: resolve(__dirname, 'src/adapters/angular.ts'),
      },
      name: 'SciGrid',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'vue', 'solid-js', '@angular/core', '@angular/common'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          vue: 'Vue',
          'solid-js': 'SolidJS',
          '@angular/core': 'ng.core',
          '@angular/common': 'ng.common',
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
