import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve, extname, basename } from 'path';
import { readdirSync } from 'fs';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5175,
    strictPort: true,
  },
  preview: {
    port: 4175,
    strictPort: true,
  },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'static/assets',
    lib: {
      entry: Object.fromEntries([
        ...readdirSync(resolve(__dirname, 'src/entries')).map((x) => [
          'entry-' + basename(x, extname(x)),
          'src/entries/' + x,
        ]),
        ...readdirSync(resolve(__dirname, 'src/workers')).map((x) => [
          'workers/' + basename(x, extname(x)),
          'src/workers/' + x,
        ]),
      ]),
      formats: ['es'],
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          css: ['./src/app-css.ts'],
        },
        assetFileNames: 'static/assets/[name]-[hash].[ext]',
        chunkFileNames: 'static/chunks/[name]-[hash].js',
      },
    },
  },
  worker: {
    format: 'es',
  },
});
