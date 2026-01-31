import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SciGridAngular',
      fileName: 'index',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['@angular/core', '@angular/common', '@sci-grid/core', 'rxjs', 'zone.js'],
      output: {
        globals: {
          '@angular/core': 'ng.core',
          '@angular/common': 'ng.common',
          '@sci-grid/core': 'SciGrid'
        }
      }
    }
  },
  esbuild: {
    // Angular needs experimentalDecorators and does not support useDefineForClassFields
    // esbuild does not support emitDecoratorMetadata which is required for some Angular DI,
    // but for simple components it might be fine, or we rely on tsc for types.
    // However, for the runtime build, we need decorators to be preserved or transformed.
    // Since we are outputting a library, we should probably output code that uses standard JS decorators or downlevel them.
    // Vite uses esbuild.
  }
});
