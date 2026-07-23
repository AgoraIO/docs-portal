#!/usr/bin/env bun

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeExistingApiCenterLinks } from './lib/api-center/existing-link-normalizer.mjs';

function parseArgs(argv) {
  const options = { mode: 'write' };
  for (const argument of argv) {
    if (argument === '--check') options.mode = 'check';
    else if (argument === '--help' || argument === '-h') {
      console.log(
        'Usage: bun scripts/normalize-api-center-existing-links.mjs [--check]',
      );
      process.exit(0);
    } else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    const result = await normalizeExistingApiCenterLinks(
      parseArgs(process.argv.slice(2)),
    );
    console.log(
      `API Center existing links: ${result.report.counts.visibleExistingMdxTargets} visible targets, ${result.changedFiles.length} changed files, ${result.report.counts.remainingLegacyBodyLinks} old-site body links remain.`,
    );
  } catch (error) {
    console.error(`normalize-api-center-existing-links: ${error.message}`);
    process.exitCode = 1;
  }
}
