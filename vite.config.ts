import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import mdx from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vitest/config';
import { getOpenApiPrerenderPaths } from './src/lib/openapi/lanes';
import { getContentDocsPrerenderPaths } from './src/lib/prerender-content-routes';
import { shouldPrerenderPage } from './src/lib/prerender-filter';
import {
  createDocsPrerenderPaths,
  selectStaticDocsPrerenderPaths,
} from './src/lib/prerender-pages';
import { readPublishedDocsRoutes } from './src/lib/published-docs-routes.server';

const isTest = process.env.VITEST === 'true';
const isStaticDeployment =
  process.env.TSS_STATIC_PRERENDER === 'true' ||
  process.env.TSS_SPA_STATIC_EXPERIMENT === 'true';
const selectedPrerenderPaths = process.env.TSS_PRERENDER_PATHS?.split(',')
  .map((path) => path.trim())
  .filter(Boolean);
const docsPrerenderPaths = isTest
  ? []
  : isStaticDeployment
    ? readPublishedDocsRoutes().map((route) => route.url)
    : createDocsPrerenderPaths({
        openApiPaths: getOpenApiPrerenderPaths(),
        pages: getContentDocsPrerenderPaths().map((url) => ({ url })),
      });
const prerenderPages = (
  isStaticDeployment
    ? selectStaticDocsPrerenderPaths(docsPrerenderPaths, selectedPrerenderPaths)
    : docsPrerenderPaths
).map((path) => ({ path }));

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
  preview: {
    host: '127.0.0.1',
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
            pages: prerenderPages,
            prerender: {
              crawlLinks: false,
              enabled: true,
              filter: shouldPrerenderPage,
            },
            ...(isStaticDeployment
              ? {
                  spa: {
                    enabled: true,
                    prerender: {
                      crawlLinks: false,
                      outputPath: '/index.html',
                    },
                  },
                }
              : {}),
          }),
          react(),
          // please see https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro for guides on hosting
          ...(isStaticDeployment
            ? []
            : [
                nitro({
                  preset: 'vercel',
                }),
              ]),
        ]),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
    tsconfigPaths: true,
  },
});
