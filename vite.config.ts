import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import mdx from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vitest/config';

const isTest = process.env.VITEST === 'true';

export default defineConfig({
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    pool: 'forks',
  },
  plugins: [
    mdx(await import('./source.config')),
    tailwindcss(),
    ...(isTest
      ? [react()]
      : [
          tanstackStart({
            prerender: {
              autoStaticPathsDiscovery: false,
              crawlLinks: false,
              failOnError: false,
            },
            spa: {
              enabled: true,
              prerender: {
                enabled: false,
              },
            },

            pages: [
              {
                path: '/en/api/search',
              },
              {
                path: '/zh-CN/api/search',
              },
              {
                path: 'llms-full.txt',
              },
              {
                path: 'llms.txt',
              },
            ],
          }),
          react(),
          // please see https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro for guides on hosting
          nitro(),
        ]),
  ],
  resolve: {
    tsconfigPaths: true,
  },
});
