import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [solidPlugin(), dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'VeloGridSolid',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['solid-js', '@velosci-grid/core', 'solid-js/web', 'solid-js/store'],
      output: {
        globals: {
          'solid-js': 'Solid',
          '@velosci-grid/core': 'VeloGrid'
        }
      }
    }
  }
});
