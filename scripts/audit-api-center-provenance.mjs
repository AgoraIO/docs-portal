#!/usr/bin/env bun

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditApiCenterProvenance } from './lib/api-center/provenance-audit.mjs';

function parseArgs(argv) {
  const options = {
    mode: 'write',
    manifestPath: 'docs/migration/api-center-html-manifest.json',
    jsonPath: 'docs/migration/api-center-provenance-audit.json',
    markdownPath: 'docs/migration/api-center-provenance-audit.md',
  };
  for (let index = 0; index < argv.length; index += 1) {
    switch (argv[index]) {
      case '--check':
        options.mode = 'check';
        break;
      case '--old-root':
        options.oldRoot = argv[++index];
        break;
      case '--manifest':
        options.manifestPath = argv[++index];
        break;
      case '--json':
        options.jsonPath = argv[++index];
        break;
      case '--markdown':
        options.markdownPath = argv[++index];
        break;
      case '--help':
      case '-h':
        console.log(
          'Usage: bun scripts/audit-api-center-provenance.mjs --old-root <legacy-repo> [--check] [--manifest <file>] [--json <file>] [--markdown <file>]',
        );
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  if (!options.oldRoot) throw new Error('--old-root is required.');
  return options;
}

export async function runApiCenterProvenanceAudit({
  repoRoot = process.cwd(),
  ...options
} = {}) {
  const result = await auditApiCenterProvenance({
    repoRoot,
    oldRoot: options.oldRoot,
    manifestPath: options.manifestPath,
  });
  const outputs = [
    [options.jsonPath, `${JSON.stringify(result.report, null, 2)}\n`],
    [options.markdownPath, result.markdown],
  ];
  for (const [targetPath, expected] of outputs) {
    const absolute = path.resolve(repoRoot, targetPath);
    if (options.mode === 'check') {
      const actual = await fs.readFile(absolute, 'utf8');
      if (actual !== expected)
        throw new Error(`Generated audit is stale: ${targetPath}`);
    } else {
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, expected, 'utf8');
    }
  }
  if (result.report.counts.errors > 0) {
    throw new Error(
      `API Center provenance audit found ${result.report.counts.errors} errors.`,
    );
  }
  return result.report;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    const report = await runApiCenterProvenanceAudit(
      parseArgs(process.argv.slice(2)),
    );
    console.log(
      `API Center provenance audit: ${report.liveEvidence.matchedEntries}/${report.liveEvidence.entries} live entries, ${report.counts.sourceTextRequests} text requests, ${report.counts.errors} errors.`,
    );
  } catch (error) {
    console.error(`audit-api-center-provenance: ${error.message}`);
    process.exitCode = 1;
  }
}
