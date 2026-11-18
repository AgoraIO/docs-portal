#!/usr/bin/env bun

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHtmlGenerators } from './lib/api-center/generator-runner.mjs';

function parseArgs(argv) {
  const options = {
    manifestPath: 'docs/migration/api-center-html-manifest.json',
    oldRoot: process.env.API_CENTER_OLD_ROOT ?? null,
    generators: [],
    urls: [],
    scope: null,
    limit: 0,
    mode: 'write',
    reconcile: false,
  };
  for (let index = 0; index < argv.length; index++) {
    switch (argv[index]) {
      case '--manifest':
        options.manifestPath = argv[++index];
        break;
      case '--old-root':
        options.oldRoot = argv[++index];
        break;
      case '--generator':
        options.generators.push(argv[++index]);
        break;
      case '--scope':
        options.scope = argv[++index];
        break;
      case '--url':
        options.urls.push(argv[++index]);
        break;
      case '--limit':
        options.limit = Number(argv[++index]);
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
        console.log(`
API Center HTML migration orchestrator

Usage:
  bun scripts/migrate-api-center.mjs --old-root <dir> [options]

Options:
  --generator <name>  oxygen, typedoc, doxygen, or appledoc; repeatable
  --scope <key>       Limit to family/product/platform
  --url <url>         Limit to one legacy page; repeatable
  --limit <count>     Limit matched pages for a pilot
  --dry-run           Convert and report without writing
  --check             Verify owned outputs and reports
  --reconcile         Delete unchanged stale files in the complete selected run
`);
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  if (options.generators.length === 0) {
    options.generators = ['oxygen', 'typedoc', 'doxygen', 'appledoc'];
  }
  return options;
}

export async function runApiCenterMigration(options) {
  return runHtmlGenerators(options);
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    const result = await runApiCenterMigration(
      parseArgs(process.argv.slice(2)),
    );
    const parameterLists = Object.values(
      result.structuredParameterCounts,
    ).reduce((sum, counts) => sum + counts.lists, 0);
    const parameterFields = Object.values(
      result.structuredParameterCounts,
    ).reduce((sum, counts) => sum + counts.fields, 0);
    const signatures = Object.values(result.structuredApiMemberCounts).reduce(
      (sum, counts) => sum + counts.signatures,
      0,
    );
    const returns = Object.values(result.structuredApiMemberCounts).reduce(
      (sum, counts) => sum + counts.returns,
      0,
    );
    console.log(
      `API Center HTML: selected ${result.selectedCount}/${result.matchedCount}; generated ${result.report.counts.generatedFiles}, signatures ${signatures}, returns ${returns}, parameter lists ${parameterLists}, parameter fields ${parameterFields}, existing ${result.report.counts.preservedExistingFiles}, pending ${result.report.counts.pendingPages}, warnings ${result.report.counts.warnings}, errors ${result.report.counts.errors}.`,
    );
  } catch (error) {
    console.error(`migrate-api-center: ${error.message}`);
    process.exitCode = 1;
  }
}
