import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import mdx from 'fumadocs-mdx/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vitest/config';
import { getConversationalAiPrerenderPaths } from './src/lib/openapi/conversational-ai';
import { shouldPrerenderPage } from './src/lib/prerender-filter';

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
            pages: getConversationalAiPrerenderPaths().map((path) => ({
              path,
            })),
            prerender: {
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
    tsconfigPaths: true,
  },
});
