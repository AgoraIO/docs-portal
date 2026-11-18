#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderManifestMarkdown } from './lib/api-center/inventory.mjs';
import {
  crawlBodyLinkClosure,
  curlFetch,
  finalizeBodyClosure,
} from './lib/api-center/page-graph.mjs';

function parseArgs(argv) {
  const options = {
    manifest: 'docs/migration/api-center-html-manifest.json',
    markdown: 'docs/migration/api-center-html-manifest.md',
    concurrency: 6,
    transport: 'curl',
    check: false,
    fromEvidence: false,
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
      case '--from-evidence':
        options.fromEvidence = true;
        break;
      case '--help':
      case '-h':
        console.log(`
API Center body-link closure crawler

Usage:
  node scripts/api-center-page-closure.mjs [options]

Options:
  --manifest <file>       Input/output JSON manifest
  --markdown <file>       Generated Markdown manifest
  --concurrency <number>  Live request concurrency (default: 6)
  --transport <name>      HTTP transport: curl or fetch (default: curl)
  --check                 Crawl and fail if outputs would change
  --from-evidence         Recompute statuses and warnings without network calls
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
    if (actual !== contents) throw new Error(`Generated file is stale: ${absolutePath}`);
    return;
  }
  await fs.writeFile(absolutePath, contents, 'utf8');
}

export async function runPageClosure(options) {
  const manifest = JSON.parse(
    await fs.readFile(path.resolve(options.manifest), 'utf8'),
  );
  let lastReported = 0;
  if (options.fromEvidence) {
    finalizeBodyClosure(manifest);
  } else {
    await crawlBodyLinkClosure(manifest, {
      concurrency: options.concurrency,
      fetchImpl: options.transport === 'curl' ? curlFetch : fetch,
      onProgress({ processed, queued }) {
        if (processed - lastReported >= 100) {
          lastReported = processed;
          console.log(`Crawled ${processed}/${queued} discovered pages.`);
        }
      },
    });
  }
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  const markdown = renderManifestMarkdown(manifest);
  await writeOrCheck(options.manifest, json, options.check);
  await writeOrCheck(options.markdown, markdown, options.check);
  console.log(
    `Closure: ${manifest.pageGraphSummary.closureLogicalPageCount} logical pages (${manifest.pageGraphSummary.closurePageCount} URLs); ${manifest.pageGraphSummary.closureFailedCount} failed; ${manifest.pageGraphSummary.fragmentWarningCount} fragment warnings.`,
  );
  return manifest;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    await runPageClosure(parseArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(`api-center-page-closure: ${error.message}`);
    process.exitCode = 1;
  }
}
