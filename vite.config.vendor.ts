// vite.config.vendor.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
  ],
  build: {
    target: 'es2017',
    // Do not minify for better readability in GAS
    minify: false,
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/vendor.ts'),
      name: 'VendorLib',
      fileName: () => 'dependencies.js',
      formats: ['iife'],
    },
    rollupOptions: {
        // Ensure no external dependencies unless explicitly stated
        external: [], 
    }
  },
});
