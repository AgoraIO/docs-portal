#!/usr/bin/env bun

import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  buildManifest,
  mergeManifestProgress,
  normalizeSourceApiCenter,
  parseLiveApiCenterBaseline,
  parseLiveApiCenterHtml,
  renderManifestMarkdown,
} from './lib/api-center/inventory.mjs';

const execFileAsync = promisify(execFile);
const DEFAULT_LIVE_URL = 'https://doc.shengwang.cn/api-center';
const DEFAULT_JSON_OUTPUT =
  'docs/migration/api-center-html-manifest.json';
const DEFAULT_MARKDOWN_OUTPUT =
  'docs/migration/api-center-html-manifest.md';

function parseArgs(argv) {
  const options = {
    sourceRoot: null,
    liveUrl: DEFAULT_LIVE_URL,
    liveHtml: null,
    liveBaseline: null,
    outJson: DEFAULT_JSON_OUTPUT,
    outMarkdown: DEFAULT_MARKDOWN_OUTPUT,
    check: false,
    failOnDrift: true,
  };

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    switch (argument) {
      case '--source-root':
        options.sourceRoot = argv[++index];
        break;
      case '--live-url':
        options.liveUrl = argv[++index];
        break;
      case '--live-html':
        options.liveHtml = argv[++index];
        break;
      case '--live-baseline':
        options.liveBaseline = argv[++index];
        break;
      case '--out-json':
        options.outJson = argv[++index];
        break;
      case '--out-markdown':
        options.outMarkdown = argv[++index];
        break;
      case '--check':
        options.check = true;
        break;
      case '--allow-drift':
        options.failOnDrift = false;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      default:
        throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!options.sourceRoot) {
    throw new Error('--source-root is required.');
  }
  return options;
}

function printHelp() {
  console.log(`
API Center inventory generator

Usage:
  bun scripts/api-center-inventory.mjs --source-root <shengwang-doc-source> [options]

Options:
  --live-url <url>         Live API Center URL (default: ${DEFAULT_LIVE_URL})
  --live-html <file>       Read a captured live HTML fixture instead of fetching
  --live-baseline <file>   Read a rendered browser baseline JSON snapshot
  --out-json <file>        JSON manifest output
  --out-markdown <file>    Markdown manifest output
  --check                  Fail when generated output differs; write nothing
  --allow-drift            Record live/source drift without failing
  --help, -h               Show help
`);
}

async function readLive(options) {
  if (options.liveBaseline) {
    const baseline = JSON.parse(
      await fs.readFile(path.resolve(options.liveBaseline), 'utf8'),
    );
    return parseLiveApiCenterBaseline(baseline);
  }

  if (options.liveHtml) {
    return parseLiveApiCenterHtml(
      await fs.readFile(path.resolve(options.liveHtml), 'utf8'),
      options.liveUrl,
    );
  }

  const response = await fetch(options.liveUrl, {
    headers: {
      'user-agent':
        'Agora-docs-portal-api-center-inventory/1.0 (+https://github.com/AgoraIO/docs-portal)',
    },
    redirect: 'follow',
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${options.liveUrl}: ${response.status} ${response.statusText}`,
    );
  }
  const live = parseLiveApiCenterHtml(await response.text(), response.url);
  if (live.productCount === 0) {
    throw new Error(
      'The live API Center response is an unrendered client shell. Capture it in a browser and pass --live-baseline or --live-html.',
    );
  }
  return live;
}

async function gitHead(sourceRoot) {
  const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
    cwd: sourceRoot,
  });
  return stdout.trim();
}

async function writeOrCheck(filePath, contents, check) {
  const absolutePath = path.resolve(filePath);
  if (check) {
    let actual;
    try {
      actual = await fs.readFile(absolutePath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Missing generated file: ${absolutePath}`);
      }
      throw error;
    }
    if (actual !== contents) {
      throw new Error(`Generated file is stale: ${absolutePath}`);
    }
    return;
  }

  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, contents, 'utf8');
}

async function readPreviousManifest(filePath) {
  try {
    return JSON.parse(await fs.readFile(path.resolve(filePath), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function runInventory(options) {
  const sourceRoot = path.resolve(options.sourceRoot);
  const dataPath = path.join(sourceRoot, 'data', 'apiCenter.ts');
  const sourceModule = await import(
    `${pathToFileURL(dataPath).href}?inventory=${Date.now()}`
  );
  const source = normalizeSourceApiCenter(
    sourceModule.apiData,
    sourceModule.platforms,
  );
  const live = await readLive(options);
  const sourceCommit = await gitHead(sourceRoot);
  const initialManifest = buildManifest({
    live,
    source,
    sourceCommit,
    sourcePath: 'data/apiCenter.ts',
  });
  const manifest = mergeManifestProgress(
    initialManifest,
    await readPreviousManifest(options.outJson),
  );
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  const markdown = renderManifestMarkdown(manifest);

  await writeOrCheck(options.outJson, json, options.check);
  await writeOrCheck(options.outMarkdown, markdown, options.check);

  console.log(`Products: ${manifest.counts.products}`);
  console.log(`API entries: ${manifest.counts.entries}`);
  console.log(`Live/source parity: ${manifest.parity.status}`);
  console.log(
    options.check
      ? 'Generated inventory is current.'
      : `Wrote ${path.resolve(options.outJson)} and ${path.resolve(options.outMarkdown)}.`,
  );

  if (options.failOnDrift && manifest.parity.status !== 'matched') {
    throw new Error(
      `Live/source drift detected (${manifest.parity.warnings.length} warnings).`,
    );
  }

  return manifest;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  try {
    await runInventory(parseArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(`api-center-inventory: ${error.message}`);
    process.exitCode = 1;
  }
}
