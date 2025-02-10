import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    strictPort: false, // Allow fallback to another port if 5173 is in use
    host: '127.0.0.1', // Listen only on localhost
    cors: true, // Enable CORS
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
    watch: {
      usePolling: true, // Enable polling for file changes
    },
    open: true, // Automatically open browser
  },
});