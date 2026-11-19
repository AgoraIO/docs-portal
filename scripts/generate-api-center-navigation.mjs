#!/usr/bin/env bun

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runApiCenterNavigation } from './lib/api-center/navigation-runner.mjs';

function parseArgs(argv) {
  const options = { mode: 'write', reconcile: true };
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
      case '--no-reconcile':
        options.reconcile = false;
        break;
      case '--help':
      case '-h':
        console.log(
          'Usage: bun scripts/generate-api-center-navigation.mjs [--check|--dry-run] [--manifest <file>]',
        );
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    const result = await runApiCenterNavigation(parseArgs(process.argv.slice(2)));
    console.log(
      `API Center navigation: ${result.entries} entries, ${result.metaFiles} meta files, generated ${result.report.counts.generatedFiles}, warnings ${result.report.counts.warnings}, errors ${result.report.counts.errors}.`,
    );
    if (result.report.counts.errors > 0) process.exitCode = 1;
  } catch (error) {
    console.error(`generate-api-center-navigation: ${error.message}`);
    process.exitCode = 1;
  }
}
