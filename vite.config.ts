import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows the client-side code to access process.env.API_KEY
    // which is injected by Vercel during the build/runtime.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});