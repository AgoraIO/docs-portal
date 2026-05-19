import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import mdx from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vitest/config';
import { getStaticDocsPaths } from './src/lib/docs-static-paths';

const isTest = process.env.VITEST === 'true';
const staticDocsPages = isTest
  ? []
  : getStaticDocsPaths().map((path) => ({
      path,
      prerender: {
        enabled: true,
      },
    }));

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
              ...staticDocsPages,
              {
                path: '/api/search',
                prerender: {
                  enabled: false,
                },
              },
              {
                path: 'llms-full.txt',
                prerender: {
                  enabled: true,
                },
              },
              {
                path: 'llms.txt',
                prerender: {
                  enabled: true,
                },
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
