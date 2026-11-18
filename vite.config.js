import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { databaseApiPlugin } from './server/apiRoutes.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), databaseApiPlugin(env)],
    server: {
      port: 3000,
      host: true,
      open: true
    }
  };
});
