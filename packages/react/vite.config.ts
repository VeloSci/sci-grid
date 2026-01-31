import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'SciGridReact',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@sci-grid/core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@sci-grid/core': 'SciGrid'
        }
      }
    }
  }
});
