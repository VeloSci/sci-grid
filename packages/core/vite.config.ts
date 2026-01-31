import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SciGridCore',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [],
    }
  },
  plugins: [dts()]
});
