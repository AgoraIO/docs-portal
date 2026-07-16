#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ApiCenterMigrationRun,
  createWarning,
} from './lib/api-center/migration-framework.mjs';

function parseArgs(argv) {
  const options = {
    manifest: 'docs/migration/api-center-html-manifest.json',
    mode: 'write',
  };
  for (let index = 0; index < argv.length; index++) {
    switch (argv[index]) {
      case '--manifest':
        options.manifest = argv[++index];
        break;
      case '--check':
        options.mode = 'check';
        break;
      case '--dry-run':
        options.mode = 'dry-run';
        break;
      case '--help':
      case '-h':
        console.log(`
Generate the current API Center migration status report

Usage:
  node scripts/generate-api-center-report.mjs [--manifest <file>] [--check|--dry-run]
`);
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

export async function generateApiCenterReport({
  repoRoot = process.cwd(),
  manifestPath = 'docs/migration/api-center-html-manifest.json',
  mode = 'write',
}) {
  const manifest = JSON.parse(
    await fs.readFile(path.resolve(repoRoot, manifestPath), 'utf8'),
  );
  const run = await ApiCenterMigrationRun.create({
    repoRoot,
    manifest,
    mode,
    reconcile: false,
    reportJsonPath: 'docs/migration/api-center-status-report.json',
    reportMarkdownPath: 'docs/migration/api-center-status-report.md',
  });
  for (const page of manifest.pageEvidence.filter((page) => !page.aliasOf)) {
    const resolution = page.sourceResolution;
    if (resolution.status === 'excluded') {
      run.recordPageResult({
        page,
        status: 'excluded',
        warnings: [
          createWarning(
            'broken-live-body-link',
            page.warnings?.[0]?.message ?? resolution.reason,
          ),
        ],
      });
    } else if (resolution.targetExists) {
      run.preserveExisting({ page });
    } else {
      run.recordPageResult({ page, status: 'pending' });
    }
  }
  return run.finish();
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const report = await generateApiCenterReport({
      manifestPath: options.manifest,
      mode: options.mode,
    });
    console.log(
      `API Center report: ${report.counts.preservedExistingFiles} existing, ${report.counts.pendingPages} pending, ${report.counts.excludedPages} excluded, ${report.counts.warnings} warnings, ${report.counts.errors} errors.`,
    );
  } catch (error) {
    console.error(`generate-api-center-report: ${error.message}`);
    process.exitCode = 1;
  }
}
