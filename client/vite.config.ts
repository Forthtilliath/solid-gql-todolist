import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  // To fix React is not defined with Provider
  optimizeDeps: {
    exclude: ['@tanstack/solid-query']
 }
});
