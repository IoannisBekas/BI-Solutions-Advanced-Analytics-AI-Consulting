import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { getDeployBasePath, joinBasePath } from '../../script/deployBase';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const powerBiBase = joinBasePath(getDeployBasePath(), 'power-bi-solutions/workspace');
  const backendTarget =
    (env.VITE_POWERBI_SOLUTIONS_BACKEND_TARGET || process.env.VITE_POWERBI_SOLUTIONS_BACKEND_TARGET || 'http://127.0.0.1:5001').trim();

  return {
    base: powerBiBase,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/auth': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/power-bi-solutions/api': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
