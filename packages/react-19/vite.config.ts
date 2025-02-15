import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { readdirSync } from 'fs';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5175,
    strictPort: true,
  },
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: readdirSync(resolve(__dirname, 'src/entries')).map((x) => 'src/entries/' + x),
      formats: ['es'],
      fileName(_format, entryName) {
        return 'entry-' + entryName + '.js';
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          css: ['./src/app-css.ts'],
        },
      },
    },
  },
});
