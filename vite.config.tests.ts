// vite.config.tests.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import * as fs from 'fs';

export default defineConfig({
  plugins: [
    {
      name: 'append-footer',
      closeBundle() {
        const filePath = resolve(__dirname, 'dist/tests.js');
        if (fs.existsSync(filePath)) {
          fs.appendFileSync(filePath, '\nfunction test() { return runTestInternal(); }');
        }
      }
    }
  ],
  build: {
    target: 'es2017',
    minify: false,
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'tests/test_gas.ts'),
      name: 'TestLib',
      fileName: () => 'tests.js',
      formats: ['iife'],
    },
    rollupOptions: {
      external: (id) => {
        if (id === resolve(__dirname, 'src/index.ts')) return true;
        if (id.includes('src/configuration')) return true;
        return id.includes('src/') && !id.includes('tests/');
      },
      output: {
        globals: (id) => {
            if (id.includes('src/index.ts')) return 'SpondJS';
            if (id.includes('src/configuration')) return 'configuration';
            // Fallback for other src files if imported directly (should avoid this in practice)
            if (id.includes('src/')) return 'SpondJS'; 
            return id;
        },
      },
    }
  },
});
