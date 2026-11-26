#!/usr/bin/env bun

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runOpenApiNormalizer } from './lib/api-center/openapi-normalizer.mjs';

function parseArgs(argv) {
  const options = { mode: 'write' };
  for (let index = 0; index < argv.length; index += 1) {
    switch (argv[index]) {
      case '--manifest':
        options.manifestPath = argv[++index];
        break;
      case '--check':
        options.mode = 'check';
        break;
      case '--dry-run':
        options.mode = 'dry-run';
        break;
      case '--help':
      case '-h':
        console.log(
          'Usage: bun scripts/normalize-api-center-openapi.mjs [--check|--dry-run] [--manifest <file>]',
        );
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    const report = await runOpenApiNormalizer(parseArgs(process.argv.slice(2)));
    console.log(
      `API Center OpenAPI normalization: ${report.counts.normalizedOperations} operations in ${report.counts.normalizedFiles} files; ${report.counts.rewrittenLinks} links in ${report.counts.normalizedLinkFiles} files (${report.counts.routeRewrites} routes, ${report.counts.fragmentRewrites} fragments); warnings ${report.counts.warnings}, errors ${report.counts.errors}.`,
    );
  } catch (error) {
    console.error(`normalize-api-center-openapi: ${error.message}`);
    process.exitCode = 1;
  }
}
