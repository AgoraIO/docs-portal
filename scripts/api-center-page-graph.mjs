#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderManifestMarkdown } from './lib/api-center/inventory.mjs';
import {
  crawlManifestEntries,
  curlFetch,
} from './lib/api-center/page-graph.mjs';

function parseArgs(argv) {
  const options = {
    manifest: 'docs/migration/api-center-html-manifest.json',
    markdown: 'docs/migration/api-center-html-manifest.md',
    concurrency: 4,
    transport: 'curl',
    check: false,
  };
  for (let index = 0; index < argv.length; index++) {
    switch (argv[index]) {
      case '--manifest':
        options.manifest = argv[++index];
        break;
      case '--markdown':
        options.markdown = argv[++index];
        break;
      case '--concurrency':
        options.concurrency = Number(argv[++index]);
        break;
      case '--transport':
        options.transport = argv[++index];
        break;
      case '--check':
        options.check = true;
        break;
      case '--help':
      case '-h':
        console.log(`
API Center live page-graph crawler

Usage:
  node scripts/api-center-page-graph.mjs [options]

Options:
  --manifest <file>       Input/output JSON manifest
  --markdown <file>       Generated Markdown manifest
  --concurrency <number>  Live request concurrency (default: 4)
  --transport <name>      HTTP transport: curl or fetch (default: curl)
  --check                 Crawl and fail if outputs would change
`);
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  if (!Number.isInteger(options.concurrency) || options.concurrency < 1) {
    throw new Error('--concurrency must be a positive integer.');
  }
  if (!['curl', 'fetch'].includes(options.transport)) {
    throw new Error('--transport must be curl or fetch.');
  }
  return options;
}

async function writeOrCheck(filePath, contents, check) {
  const absolutePath = path.resolve(filePath);
  if (check) {
    const actual = await fs.readFile(absolutePath, 'utf8');
    if (actual !== contents) {
      throw new Error(`Generated file is stale: ${absolutePath}`);
    }
    return;
  }
  await fs.writeFile(absolutePath, contents, 'utf8');
}

export async function runPageGraph(options) {
  const manifestPath = path.resolve(options.manifest);
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  let completed = 0;
  await crawlManifestEntries(manifest, {
    concurrency: options.concurrency,
    fetchImpl: options.transport === 'curl' ? curlFetch : fetch,
    onProgress({ total, graph }) {
      completed += 1;
      if (completed % 10 === 0 || completed === total) {
        console.log(
          `Crawled ${completed}/${total} entries; latest status: ${graph.status}.`,
        );
      }
    },
  });
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  const markdown = renderManifestMarkdown(manifest);
  await writeOrCheck(options.manifest, json, options.check);
  await writeOrCheck(options.markdown, markdown, options.check);
  console.log(
    `Page graph: ${manifest.counts.resolvedPageGraphs} resolved, ${manifest.counts.warningPageGraphs} warning, ${manifest.counts.failedPageGraphs} failed; ${manifest.pageGraphSummary.uniquePageCount} unique pages.`,
  );
  return manifest;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    await runPageGraph(parseArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(`api-center-page-graph: ${error.message}`);
    process.exitCode = 1;
  }
}
