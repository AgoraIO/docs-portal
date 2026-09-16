#!/usr/bin/env node
/**
 * Extract fenced code blocks from Signaling docs, filtered by the enclosing
 * `<PlatformStructured platform="...">` range and by fence language.
 *
 * The platform filter is the important part: a single `.mdx` file holds every
 * platform's samples as sibling blocks, so a naive "all swift fences" sweep
 * would pull in code that is not on the page the reader sees.
 *
 * Usage:
 *   node scripts/signaling-code-check/extract-blocks.mjs \
 *     --platform ios \
 *     --langs swift,objc \
 *     --out blocks.json \
 *     content/docs/en/realtime-media/rtm/quickstart.mdx
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PLATFORM_OPEN = /^\s*<PlatformStructured\s+platform="([^"]+)"/;
const PLATFORM_CLOSE = /^\s*<\/PlatformStructured>/;
const FENCE = /^(\s*)(`{3,}|~{3,})\s*([A-Za-z0-9_+-]*)/;

function parseArgs(argv) {
  const opts = { platform: null, langs: null, out: null, files: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--platform') opts.platform = argv[++i];
    else if (arg === '--langs')
      opts.langs = argv[++i].split(',').map((l) => l.trim());
    else if (arg === '--out') opts.out = argv[++i];
    else if (arg.startsWith('--')) throw new Error(`Unknown flag: ${arg}`);
    else opts.files.push(arg);
  }
  if (!opts.platform) throw new Error('--platform is required');
  if (!opts.files.length)
    throw new Error('at least one source file is required');
  return opts;
}

/**
 * Walk a file line by line, tracking the platform range stack and the fence
 * state. Returns every fenced block that sits inside a matching platform range.
 */
function extractFromFile(path, platform, langs) {
  // These .mdx files are CRLF. Strip the \r for matching; nothing here writes
  // the file back, so the line endings do not need to be preserved.
  const lines = readFileSync(path, 'utf8')
    .split('\n')
    .map((line) => line.replace(/\r$/, ''));

  const blocks = [];
  const platformStack = [];
  let fence = null;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const fenceMatch = FENCE.exec(line);

    if (fence) {
      // Inside a fence: only a matching closing marker ends it. Everything
      // else, including `<PlatformStructured>` inside a sample, is content.
      const closes =
        fenceMatch &&
        fenceMatch[2][0] === fence.marker[0] &&
        fenceMatch[2].length >= fence.marker.length &&
        fenceMatch[3] === '';
      if (closes) {
        blocks.push({
          file: relative(process.cwd(), path).split('\\').join('/'),
          platform: fence.platform,
          lang: fence.lang,
          startLine: fence.startLine,
          endLine: i + 1,
          code: fence.body.join('\n'),
        });
        fence = null;
      } else {
        // Drop the fence's own indentation so nested (list-indented) blocks
        // are not handed to the compiler with a phantom leading indent.
        fence.body.push(
          line.startsWith(fence.indent)
            ? line.slice(fence.indent.length)
            : line,
        );
      }
      continue;
    }

    if (fenceMatch && fenceMatch[3]) {
      const current = platformStack[platformStack.length - 1];
      if (current === platform && (!langs || langs.includes(fenceMatch[3]))) {
        fence = {
          indent: fenceMatch[1],
          marker: fenceMatch[2],
          lang: fenceMatch[3],
          platform: current,
          startLine: i + 1,
          body: [],
        };
      } else if (fenceMatch[3]) {
        // A fence we do not want still has to be consumed so its contents are
        // not scanned for platform tags.
        fence = {
          indent: fenceMatch[1],
          marker: fenceMatch[2],
          lang: fenceMatch[3],
          platform: current,
          startLine: i + 1,
          body: [],
          skip: true,
        };
      }
      if (fence?.skip) {
        // Consume to the closing marker without recording anything.
        for (i += 1; i < lines.length; i += 1) {
          const m = FENCE.exec(lines[i].replace(/\r$/, ''));
          if (
            m &&
            m[2][0] === fence.marker[0] &&
            m[2].length >= fence.marker.length &&
            !m[3]
          )
            break;
        }
        fence = null;
      }
      continue;
    }

    const open = PLATFORM_OPEN.exec(line);
    if (open) {
      platformStack.push(open[1]);
      continue;
    }
    if (PLATFORM_CLOSE.test(line)) {
      platformStack.pop();
    }
  }

  if (fence) {
    throw new Error(
      `${path}: unterminated code fence opened at line ${fence.startLine}`,
    );
  }

  return blocks;
}

export function extractBlocks(files, platform, langs) {
  const blocks = [];
  for (const file of files) {
    blocks.push(...extractFromFile(resolve(file), platform, langs));
  }
  blocks.forEach((block, index) => {
    block.id = `${block.lang}-${String(index + 1).padStart(3, '0')}`;
  });
  return blocks;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const blocks = extractBlocks(opts.files, opts.platform, opts.langs);

  const payload = { platform: opts.platform, langs: opts.langs, blocks };
  const json = `${JSON.stringify(payload, null, 2)}\n`;

  if (opts.out) {
    writeFileSync(opts.out, json);
    const byLang = blocks.reduce((acc, b) => {
      acc[b.lang] = (acc[b.lang] ?? 0) + 1;
      return acc;
    }, {});
    const summary = Object.entries(byLang)
      .map(([lang, count]) => `${count} ${lang}`)
      .join(', ');
    console.log(
      `Extracted ${blocks.length} blocks (${summary}) for platform "${opts.platform}" -> ${opts.out}`,
    );
  } else {
    process.stdout.write(json);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
