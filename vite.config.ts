// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

// Determine the target platform from environment variable
const platform = process.env.PLATFORM || 'gas'; // 'gas' or 'node'

export default defineConfig({
  plugins: [
  ],
  build: {
    // Target 'es2019' or lower to ensure compatibility with Apps Script (V8)
    // Specifically, async generators (async function*) are not fully supported.
    target: platform === 'gas' ? 'es2017' : 'esnext', 
    // Output directory for the production build
    outDir: 'dist',
    // Do not empty outDir, as it may contain vendor.js from other build steps
    emptyOutDir: false,
    
    // Build as a library to create a single file with packaged dependencies
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SpondJS', // The global variable name for the IIFE build
      fileName: (format) => platform === 'gas' ? `spond.js` : `spond.${format}.js`,
      formats: platform === 'gas' ? ['iife'] : ['cjs', 'es'], // IIFE format allows direct execution in GAS global scope
    },
    
    rollupOptions: {
      // Treat these packages as external to the app bundle
      external: platform === 'gas' ? [] : ['axios', 'tough-cookie', 'dotenv', 'fs', 'path'],
      output: {
        // Map external packages to the VendorLib global object
        globals: {
        }
      }
    },
    
    // Minification can make debugging harder in GAS, but "packaged dependencies" implies bundling.
    // We can disable minification for readability if desired, but default is fine.
    minify: false, 
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      ...(platform === 'gas' ? {
          // Stub out node-specific modules for GAS build
          './node-client': resolve(__dirname, 'src/node-client-stub.ts'),
          // Ensure axios/tough-cookie are not bundled if somehow referenced
          'axios': resolve(__dirname, 'src/node-client-stub.ts'), 
          'tough-cookie': resolve(__dirname, 'src/node-client-stub.ts')
      } : {})
    },
  },
});
