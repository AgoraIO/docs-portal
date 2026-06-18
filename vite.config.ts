import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import mdx from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vitest/config';
import { getOpenApiPrerenderPaths } from './src/lib/openapi/lanes';
import { getContentDocsPrerenderPaths } from './src/lib/prerender-content-routes';
import { shouldPrerenderPage } from './src/lib/prerender-filter';
import { createDocsPrerenderPaths } from './src/lib/prerender-pages';

const isTest = process.env.VITEST === 'true';
const isSpaStaticExperiment = process.env.TSS_SPA_STATIC_EXPERIMENT === 'true';
const docsPrerenderPaths = isTest
  ? []
  : createDocsPrerenderPaths({
      openApiPaths: getOpenApiPrerenderPaths(),
      pages: getContentDocsPrerenderPaths().map((url) => ({ url })),
    });
const prerenderPages = docsPrerenderPaths.map((path) => ({
  path,
}));

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
            pages: isSpaStaticExperiment ? [] : prerenderPages,
            ...(isSpaStaticExperiment
              ? {}
              : {
                  prerender: {
                    crawlLinks: false,
                    enabled: true,
                    filter: shouldPrerenderPage,
                  },
                }),
            ...(isSpaStaticExperiment
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
          ...(isSpaStaticExperiment
            ? []
            : [
                nitro({
                  preset: 'vercel',
                }),
              ]),
        ]),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
    tsconfigPaths: true,
  },
});
