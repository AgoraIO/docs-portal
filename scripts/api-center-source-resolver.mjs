#!/usr/bin/env bun

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OPENAPI_LANES } from '../src/lib/openapi/lanes.ts';
import { renderManifestMarkdown } from './lib/api-center/inventory.mjs';
import {
  parseCsv,
  resolveManifestSources,
} from './lib/api-center/source-resolver.mjs';

function parseArgs(argv) {
  const options = {
    manifest: 'docs/migration/api-center-html-manifest.json',
    markdown: 'docs/migration/api-center-html-manifest.md',
    pathMap: 'docs/migration/path-map.csv',
    oldRoot: process.env.API_CENTER_OLD_ROOT ?? null,
    newRoot: '.',
    check: false,
  };
  for (let index = 0; index < argv.length; index++) {
    switch (argv[index]) {
      case '--manifest':
        options.manifest = argv[++index];
        break;
      case '--markdown':
        options.markdown = argv[++index];
        break;
      case '--path-map':
        options.pathMap = argv[++index];
        break;
      case '--old-root':
        options.oldRoot = argv[++index];
        break;
      case '--new-root':
        options.newRoot = argv[++index];
        break;
      case '--check':
        options.check = true;
        break;
      case '--help':
      case '-h':
        console.log(`
API Center page-level source resolver

Usage:
  bun scripts/api-center-source-resolver.mjs [options]

Options:
  --manifest <file>  Input/output JSON manifest
  --markdown <file>  Generated Markdown manifest
  --path-map <file>  Existing migration path map CSV
  --old-root <dir>   Durable checkout (or API_CENTER_OLD_ROOT)
  --new-root <dir>   docs-portal root
  --check            Fail if generated manifest outputs would change
`);
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  if (!options.oldRoot) {
    throw new Error(
      'Pass --old-root or set API_CENTER_OLD_ROOT to the durable shengwang-doc-source checkout.',
    );
  }
  return options;
}

async function writeOrCheck(filePath, contents, check) {
  const absolutePath = path.resolve(filePath);
  if (check) {
    const actual = await fs.readFile(absolutePath, 'utf8');
    if (actual !== contents) {
      throw new Error(`Generated file is stale: ${absolutePath}`);
    }
    return;
  }
  await fs.writeFile(absolutePath, contents, 'utf8');
}

export async function runSourceResolver(options) {
  const manifest = JSON.parse(await fs.readFile(options.manifest, 'utf8'));
  const pathMapRows = parseCsv(await fs.readFile(options.pathMap, 'utf8'));
  await resolveManifestSources(manifest, {
    oldRoot: path.resolve(options.oldRoot),
    newRoot: path.resolve(options.newRoot),
    pathMapRows,
    lanes: OPENAPI_LANES,
  });
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  const markdown = renderManifestMarkdown(manifest);
  await writeOrCheck(options.manifest, json, options.check);
  await writeOrCheck(options.markdown, markdown, options.check);
  const summary = manifest.sourceResolutionSummary;
  console.log(
    `Source resolution: ${summary.classifiedPageCount}/${summary.logicalPageCount} classified, ${summary.excludedPageCount} excluded broken links, ${summary.unresolvedPageCount} unresolved, ${summary.ambiguousPageCount} ambiguous.`,
  );
  if (summary.unresolvedPageCount > 0 || summary.ambiguousPageCount > 0) {
    process.exitCode = 1;
  }
  return manifest;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  try {
    await runSourceResolver(parseArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(`api-center-source-resolver: ${error.message}`);
    process.exitCode = 1;
  }
}
