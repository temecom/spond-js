// vite.config.configuration.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills(),
  ],
  build: {
    target: 'es2017',
    minify: false,
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/configuration.ts'),
      name: 'configuration',
      fileName: () => 'configuration.js',
      formats: ['iife'],
    },
    rollupOptions: {
      external: [],
    }
  },
});