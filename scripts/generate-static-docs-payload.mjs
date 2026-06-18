import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import mdx from 'fumadocs-mdx/vite';
import { build } from 'vite';

const repoRoot = process.cwd();
const tempRoot = path.join(
  repoRoot,
  'node_modules',
  '.tmp',
  'docs-static-payload',
);
const bundledEntry = path.join(tempRoot, 'entry.mjs');
const bundledConfigEntry = path.join(tempRoot, 'source-config-entry.mjs');
const bundledConfigDir = path.join(tempRoot, 'config');
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
import { generateStaticDocsPayload } from '../../../scripts/generate-static-docs-payload.worker.mjs';

await generateStaticDocsPayload();
`,
);
await fs.writeFile(
  bundledConfigEntry,
  `
export * from '../../../source.config.ts';
`,
);

await build({
  build: {
    emptyOutDir: true,
    lib: {
      entry: bundledConfigEntry,
      fileName: () => 'source.config.mjs',
      formats: ['es'],
    },
    outDir: bundledConfigDir,
    rollupOptions: {
      external: [/^node:/],
    },
    ssr: true,
    target: 'node22',
  },
  configFile: false,
  define: {
    'process.env.FUMADOCS_STATIC_PAYLOAD_DYNAMIC': JSON.stringify('true'),
  },
  resolve: {
    alias: {
      '@': path.join(repoRoot, 'src'),
    },
    tsconfigPaths: true,
  },
  root: repoRoot,
});

const sourceConfig = await import(
  pathToFileURL(await findSingleBundleFile(bundledConfigDir)).href
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
  define: {
    'process.env.FUMADOCS_STATIC_PAYLOAD_DYNAMIC': JSON.stringify('true'),
    'import.meta.env.VITE_TSS_SPA_STATIC_EXPERIMENT': JSON.stringify('true'),
    'process.env.VITE_TSS_SPA_STATIC_EXPERIMENT': JSON.stringify('true'),
  },
  plugins: [mdx(sourceConfig, { updateViteConfig: false })],
  logLevel: 'warn',
  resolve: {
    alias: {
      '@': path.join(repoRoot, 'src'),
      'collections/browser': path.join(repoRoot, '.source', 'browser.ts'),
      'collections/server': path.join(repoRoot, '.source', 'dynamic.ts'),
    },
    dedupe: ['react', 'react-dom'],
    tsconfigPaths: true,
  },
  root: repoRoot,
});

await import(pathToFileURL(path.join(outputDir, 'entry.js')).href);

async function findSingleBundleFile(dir) {
  const entries = await fs.readdir(dir);
  const files = entries.filter((entry) => /\.(mjs|js)$/.test(entry));

  if (files.length !== 1) {
    throw new Error(
      `Expected exactly one JS bundle in ${dir}, found: ${files.join(', ')}`,
    );
  }

  return path.join(dir, files[0]);
}
