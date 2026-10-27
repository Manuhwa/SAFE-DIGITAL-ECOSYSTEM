import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use 127.0.0.1 (not "localhost") so the proxy always reaches the Express backend,
// and strictPort so a second Vite instance can never take over the backend's port 3001.
const BACKEND = 'http://127.0.0.1:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/uploads': { target: BACKEND, changeOrigin: true },
    },
  },
});
