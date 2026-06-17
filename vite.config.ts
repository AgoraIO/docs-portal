import path from 'node:path';
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
const shouldStubPrerenderBodies =
  !isTest && process.env.DOCS_FORCE_PRERENDER_BODIES !== 'true';
const docsPrerenderPaths = isTest
  ? []
  : createDocsPrerenderPaths({
      openApiPaths: getOpenApiPrerenderPaths(),
      pages: getContentDocsPrerenderPaths().map((url) => ({ url })),
    });

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
            pages: docsPrerenderPaths.map((path) => ({
              path,
            })),
            prerender: {
              crawlLinks: false,
              enabled: true,
              filter: shouldPrerenderPage,
            },
          }),
          react(),
          // please see https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro for guides on hosting
          nitro({
            preset: 'vercel',
          }),
        ]),
  ],
  resolve: {
    alias: [
      ...(shouldStubPrerenderBodies
        ? [
            {
              find: './DocsAiContentBody',
              replacement: path.resolve(
                './src/components/docs-shell/DocsPrerenderBodyStub.tsx',
              ),
            },
            {
              find: './DocsApiReferenceContentBody',
              replacement: path.resolve(
                './src/components/docs-shell/DocsPrerenderBodyStub.tsx',
              ),
            },
            {
              find: './DocsContentBody',
              replacement: path.resolve(
                './src/components/docs-shell/DocsPrerenderBodyStub.tsx',
              ),
            },
            {
              find: './DocsRtcAndroidApiReferenceContentBody',
              replacement: path.resolve(
                './src/components/docs-shell/DocsPrerenderBodyStub.tsx',
              ),
            },
            {
              find: '../openapi/FumadocsOpenApiContent',
              replacement: path.resolve(
                './src/components/openapi/FumadocsOpenApiContent.stub.tsx',
              ),
            },
            {
              find: './FumadocsOpenApiContent',
              replacement: path.resolve(
                './src/components/openapi/FumadocsOpenApiContent.stub.tsx',
              ),
            },
          ]
        : []),
	      {
	        find: /^shiki$/,
	        replacement: path.resolve('./src/lib/shiki-lite.ts'),
	      },
    ],
    dedupe: ['react', 'react-dom'],
    tsconfigPaths: true,
  },
});
