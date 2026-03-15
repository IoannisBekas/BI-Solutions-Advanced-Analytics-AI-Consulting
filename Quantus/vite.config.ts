import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const quantusBase = '/quantus/workspace/';
  const quantusApiTarget = env.VITE_QUANTUS_API_TARGET || 'http://localhost:3001';

  return {
    base: quantusBase,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: 'auto',
        srcDir: 'src',
        filename: 'service-worker.ts',
        strategies: 'injectManifest',
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        },
        devOptions: {
          enabled: false,
          type: 'module',
        },
        manifest: {
          name: 'Quantus Research Solutions',
          short_name: 'Quantus',
          description: 'Institutional-grade quantitative research — AI-powered signals.',
          theme_color: '#0A0D14',
          background_color: '#0A0D14',
          display: 'standalone',
          start_url: quantusBase,
          scope: quantusBase,
          icons: [
            { src: `${quantusBase}icons/icon-192x192.png`, sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
            { src: `${quantusBase}icons/icon-512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/quantus/api': {
          target: quantusApiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
