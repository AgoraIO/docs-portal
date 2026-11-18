#!/usr/bin/env bun

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeExistingHtmlStructure } from './lib/api-center/existing-html-structure-normalizer.mjs';

function parseArgs(argv) {
  const options = { mode: 'write', oldRoot: process.env.API_CENTER_OLD_ROOT };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--check') options.mode = 'check';
    else if (argument === '--old-root') options.oldRoot = argv[++index];
    else if (argument === '--help' || argument === '-h') {
      console.log(
        'Usage: bun scripts/normalize-api-center-existing-html-structure.mjs --old-root <dir> [--check]',
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
    const result = await normalizeExistingHtmlStructure(
      parseArgs(process.argv.slice(2)),
    );
    console.log(
      `API Center existing HTML structure: ${result.report.counts.sourceFiles} source files, ${result.report.counts.normalizedDetailHeadings} detail headings, ${result.changedFiles.length} changed files, ${result.report.counts.errors} errors.`,
    );
  } catch (error) {
    console.error(
      `normalize-api-center-existing-html-structure: ${error.message}`,
    );
    process.exitCode = 1;
  }
}
