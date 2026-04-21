import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue(), dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VeloGridVue',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', '@velosci-grid/core'],
      output: {
        globals: {
          vue: 'Vue',
          '@velosci-grid/core': 'VeloGrid'
        }
      }
    }
  }
});
