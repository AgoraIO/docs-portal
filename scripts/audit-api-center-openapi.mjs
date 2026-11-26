#!/usr/bin/env bun

import fs from 'node:fs/promises';
import path from 'node:path';
import { OPENAPI_LANES } from '../src/lib/openapi/lanes.ts';
import {
  auditApiCenterOpenApi,
  writeOpenApiAudit,
} from './lib/api-center/openapi-audit.mjs';

const options = {
  manifestPath: 'docs/migration/api-center-html-manifest.json',
  oldRoot: process.env.API_CENTER_OLD_ROOT ?? null,
  scope: null,
  mode: 'write',
  jsonPath: 'docs/migration/api-center-openapi-audit.json',
  markdownPath: 'docs/migration/api-center-openapi-audit.md',
};

for (let index = 0; index < process.argv.slice(2).length; index++) {
  const args = process.argv.slice(2);
  switch (args[index]) {
    case '--manifest':
      options.manifestPath = args[++index];
      break;
    case '--old-root':
      options.oldRoot = args[++index];
      break;
    case '--scope':
      options.scope = args[++index];
      break;
    case '--check':
      options.mode = 'check';
      break;
    case '--dry-run':
      options.mode = 'dry-run';
      break;
    default:
      throw new Error(`Unknown argument: ${args[index]}`);
  }
}

if (!options.oldRoot) {
  throw new Error('Pass --old-root or set API_CENTER_OLD_ROOT.');
}

const repoRoot = process.cwd();
const manifest = JSON.parse(
  await fs.readFile(path.resolve(repoRoot, options.manifestPath), 'utf8'),
);
const sourceTextRegistry = await fs.readFile(
  path.resolve(repoRoot, 'src/lib/openapi/source-text.server.ts'),
  'utf8',
);
const report = await auditApiCenterOpenApi({
  repoRoot,
  oldRoot: options.oldRoot,
  manifest,
  lanes: OPENAPI_LANES,
  sourceTextRegistry,
  scope: options.scope,
});
await writeOpenApiAudit({
  repoRoot,
  report,
  mode: options.mode,
  jsonPath: options.jsonPath,
  markdownPath: options.markdownPath,
});
console.log(
  `API Center OpenAPI: ${report.counts.lanes} lanes, ${report.counts.reachableOperations} reachable operations, ${report.counts.errors} errors, ${report.counts.warnings} warnings.`,
);
if (report.counts.errors > 0) process.exitCode = 1;
