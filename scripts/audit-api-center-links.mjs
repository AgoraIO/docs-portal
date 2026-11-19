#!/usr/bin/env bun

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditApiCenterLinks } from './lib/api-center/link-audit.mjs';

function parseArgs(argv) {
  const options = {
    mode: 'write',
    jsonPath: 'docs/migration/api-center-link-audit.json',
    markdownPath: 'docs/migration/api-center-link-audit.md',
  };
  for (let index = 0; index < argv.length; index += 1) {
    switch (argv[index]) {
      case '--check':
        options.mode = 'check';
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
          'Usage: bun scripts/audit-api-center-links.mjs [--check] [--json <file>] [--markdown <file>]',
        );
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

export async function runApiCenterLinkAudit({
  repoRoot = process.cwd(),
  ...options
} = {}) {
  const result = await auditApiCenterLinks({ repoRoot });
  const files = [
    [options.jsonPath, `${JSON.stringify(result.report, null, 2)}\n`],
    [options.markdownPath, result.markdown],
  ];
  for (const [targetPath, contents] of files) {
    const absolute = path.resolve(repoRoot, targetPath);
    if (options.mode === 'check') {
      const current = await fs.readFile(absolute, 'utf8');
      if (current !== contents) throw new Error(`Generated audit is stale: ${targetPath}`);
    } else {
      await fs.mkdir(path.dirname(absolute), { recursive: true });
      await fs.writeFile(absolute, contents, 'utf8');
    }
  }
  if (result.report.counts.errors > 0) {
    throw new Error(`API Center link audit found ${result.report.counts.errors} errors.`);
  }
  return result.report;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    const report = await runApiCenterLinkAudit(parseArgs(process.argv.slice(2)));
    console.log(
      `API Center links: ${report.counts.ownedMdxPages} MDX, ${report.counts.links} links, ${report.counts.invalidLinks} invalid.`,
    );
  } catch (error) {
    console.error(`audit-api-center-links: ${error.message}`);
    process.exitCode = 1;
  }
}
