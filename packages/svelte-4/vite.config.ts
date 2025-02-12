import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [svelte()],
  resolve: {
    alias: {
      $lib: resolve(__dirname, './src/lib'),
    },
  },
  build: {
    lib: {
      entry: readdirSync(resolve(__dirname, 'src/lib/entries')).map((x) => 'src/lib/entries/' + x),
      formats: ['es'],
      fileName(format, entryName) {
        return 'entry-' + entryName + '.js';
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          css: ['./src/lib/app-css.ts'],
        },
        inlineDynamicImports: false,
      },
    },
  },
});
