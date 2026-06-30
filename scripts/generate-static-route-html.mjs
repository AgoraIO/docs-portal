import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

const repoRoot = process.cwd();
const tempRoot = path.join(
  repoRoot,
  'node_modules',
  '.tmp',
  'static-route-html',
);
const bundledEntry = path.join(tempRoot, 'entry.mjs');
const outputDir = path.join(tempRoot, 'bundle');

await fs.rm(tempRoot, {
  force: true,
  recursive: true,
});
await fs.mkdir(tempRoot, {
  recursive: true,
});

await fs.writeFile(
  bundledEntry,
  `
import { generateStaticRouteHtml } from '../../../scripts/generate-static-route-html.worker.mjs';

await generateStaticRouteHtml();
`,
);

await build({
  build: {
    emptyOutDir: true,
    lib: {
      entry: bundledEntry,
      fileName: () => 'generate.mjs',
      formats: ['es'],
    },
    outDir: outputDir,
    rollupOptions: {
      external: [/^node:/],
    },
    ssr: true,
    target: 'node22',
  },
  configFile: false,
  logLevel: 'warn',
  publicDir: false,
  resolve: {
    alias: {
      '@': path.join(repoRoot, 'src'),
    },
    tsconfigPaths: true,
  },
  root: repoRoot,
});

await import(pathToFileURL(path.join(outputDir, 'entry.js')).href);
