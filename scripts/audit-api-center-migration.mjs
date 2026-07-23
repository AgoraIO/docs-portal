#!/usr/bin/env bun

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditApiCenterMigration } from './lib/api-center/migration-audit.mjs';

function parseArgs(argv) {
  const options = {
    mode: 'write',
    ownershipPath: 'docs/migration/api-center-generated-files.json',
    jsonPath: 'docs/migration/api-center-output-audit.json',
    markdownPath: 'docs/migration/api-center-output-audit.md',
  };
  for (let index = 0; index < argv.length; index += 1) {
    switch (argv[index]) {
      case '--check':
        options.mode = 'check';
        break;
      case '--json':
        options.jsonPath = argv[++index];
        break;
      case '--ownership':
        options.ownershipPath = argv[++index];
        break;
      case '--markdown':
        options.markdownPath = argv[++index];
        break;
      case '--help':
      case '-h':
        console.log(
          'Usage: bun scripts/audit-api-center-migration.mjs [--check] [--ownership <file>] [--json <file>] [--markdown <file>]',
        );
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

export async function runApiCenterMigrationAudit({ repoRoot = process.cwd(), ...options } = {}) {
  const result = await auditApiCenterMigration({
    repoRoot,
    ownershipPath: options.ownershipPath,
  });
  const json = `${JSON.stringify(result.report, null, 2)}\n`;
  const outputs = [
    [options.jsonPath, json],
    [options.markdownPath, result.markdown],
  ];
  if (options.mode === 'check') {
    for (const [targetPath, expected] of outputs) {
      const actual = await fs.readFile(path.resolve(repoRoot, targetPath), 'utf8');
      if (actual !== expected) throw new Error(`Generated audit is stale: ${targetPath}`);
    }
  } else {
    for (const [targetPath, contents] of outputs) {
      const absolute = path.resolve(repoRoot, targetPath);
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, contents, 'utf8');
    }
  }
  if (result.report.counts.errors > 0) {
    throw new Error(`API Center output audit found ${result.report.counts.errors} errors.`);
  }
  return result.report;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    const report = await runApiCenterMigrationAudit(parseArgs(process.argv.slice(2)));
    console.log(
      `API Center output audit: ${report.counts.mdxFiles} MDX, ${report.counts.assetFiles} assets, ${report.counts.errors} errors.`,
    );
  } catch (error) {
    console.error(`audit-api-center-migration: ${error.message}`);
    process.exitCode = 1;
  }
}
