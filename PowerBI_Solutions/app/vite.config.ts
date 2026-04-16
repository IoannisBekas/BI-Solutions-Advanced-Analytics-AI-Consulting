import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { getDeployBasePath, joinBasePath } from "../../script/deployBase"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const powerBiBase = joinBasePath(getDeployBasePath(), 'power-bi-solutions');

  return {
    base: powerBiBase,
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/power-bi-solutions/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/power-bi-solutions\/api\/anthropic/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const rawKey =
                env.POWERBI_SOLUTIONS_ANTHROPIC_API_KEY ||
                env.ANTHROPIC_API_KEY ||
                process.env.POWERBI_SOLUTIONS_ANTHROPIC_API_KEY ||
                process.env.ANTHROPIC_API_KEY;
              const apiKey = rawKey?.trim();

              if (apiKey) {
                proxyReq.setHeader('x-api-key', apiKey);
              }
              proxyReq.setHeader('anthropic-version', '2023-06-01');
            });
          }
        }
      }
    }
  }
});
