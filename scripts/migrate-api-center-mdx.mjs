#!/usr/bin/env bun

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runManualMdxMigration } from './lib/api-center/manual-mdx-runner.mjs';

function parseArgs(argv) {
  const options = {
    oldRoot: process.env.API_CENTER_OLD_ROOT ?? null,
    mode: 'write',
    reconcile: false,
    scope: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    switch (argv[index]) {
      case '--old-root':
        options.oldRoot = argv[++index];
        break;
      case '--scope':
        options.scope = argv[++index];
        break;
      case '--dry-run':
        options.mode = 'dry-run';
        break;
      case '--check':
        options.mode = 'check';
        break;
      case '--reconcile':
        options.reconcile = true;
        break;
      case '--help':
      case '-h':
        console.log('Usage: bun scripts/migrate-api-center-mdx.mjs --old-root <dir> [--scope <key>] [--dry-run|--check] [--reconcile]');
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
    const result = await runManualMdxMigration(parseArgs(process.argv.slice(2)));
    console.log(
      `API Center legacy MDX: ${result.selectedPages} pages into ${result.selectedTargets} targets; generated ${result.report.counts.generatedFiles}, preserved ${result.report.counts.preservedExistingFiles}, warnings ${result.report.counts.warnings}, errors ${result.report.counts.errors}.`,
    );
    if (result.report.counts.errors > 0) process.exitCode = 1;
  } catch (error) {
    console.error(`migrate-api-center-mdx: ${error.message}`);
    process.exitCode = 1;
  }
}

