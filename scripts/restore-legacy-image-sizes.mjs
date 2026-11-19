#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isRetiredCnDocsPath } from '../src/lib/retired-cn-docs.mjs';
import {
  readImageAttribute,
  readLegacyImageSizing,
  renderMigratedImage,
} from './lib/legacy-image-sizing.mjs';
import { inferContextFromSourcePath } from './migrate-legacy-docs.mjs';
import { parseCsv } from './migration-control-table.mjs';

function currentPlatform(content, index) {
  let platform;
  for (const match of outsideCode(content)
    .slice(0, index)
    .matchAll(
      /<(PlatformStructured|PlatformInline)\b[^>]*\bplatform="([^"]+)"[^>]*>|<\/(?:PlatformStructured|PlatformInline)>/g,
    ))
    platform = match[2];
  return platform;
}

function normalizePlatform(platform) {
  return (
    {
      javascript: 'web',
      rn: 'react-native',
      wechat: 'mini-program',
      'unreal-cpp': 'unreal',
      'unreal-blueprint': 'blueprint',
    }[platform] ?? platform
  );
}

function outsideCode(content) {
  let fence;
  return content
    .split('\n')
    .map((line) => {
      const marker = line.match(/^\s*(`{3,}|~{3,})/);
      if (marker) {
        if (!fence) fence = marker[1];
        else if (
          fence[0] === marker[1][0] &&
          marker[1].length >= fence.length &&
          line.slice(marker[0].length).trim() === ''
        )
          fence = undefined;
        return ' '.repeat(line.length);
      }
      return fence ? ' '.repeat(line.length) : line;
    })
    .join('\n')
    .replace(/(`+)[^\n]*?\1/g, (match) => ' '.repeat(match.length))
    .replace(/<!--[\s\S]*?-->|\{\/\*[\s\S]*?\*\/\}/g, (match) =>
      match.replace(/[^\n]/g, ' '),
    );
}

export function extractLegacyImageSizes(
  content,
  { includeUnsized = false } = {},
) {
  return [...outsideCode(content).matchAll(/<(?:Image|img)\b([^>]*?)\/?>/g)]
    .map((match) => ({
      ...readLegacyImageSizing(match[1]),
      line: content.slice(0, match.index).split('\n').length,
    }))
    .filter(
      (image) => image.src && (includeUnsized || image.width || image.height),
    );
}

export function restoreImageSizes(content, hints, canonicalize = (src) => src) {
  const bySource = new Map();
  for (const hint of hints) {
    const key = canonicalize(hint.src);
    const options = bySource.get(key) ?? new Map();
    options.set(
      JSON.stringify([hint.width, hint.height, hint.inline, hint.platform]),
      hint,
    );
    bySource.set(key, options);
  }
  const changes = [];
  const conflicts = [];
  const replacements = [];
  const matches = outsideCode(content).matchAll(
    /!\[([^\]\n]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|<(DocsImage|InlineImage)\b([^>]*?)\/>/g,
  );
  for (const match of matches) {
    const attrs = match[4];
    const src =
      attrs === undefined ? match[2] : readImageAttribute(attrs, 'src');
    if (!src) continue;
    const recorded = bySource.get(canonicalize(src));
    if (!recorded) continue;
    // Preserve explicit target-side sizing and editorial overrides.
    if (
      attrs &&
      /\b(?:displayWidth|displayHeight|width|height)\s*=/.test(attrs)
    )
      continue;
    let candidates = [...recorded.values()];
    const platform = currentPlatform(content, match.index);
    if (platform && candidates.some((hint) => hint.platform === platform))
      candidates = candidates.filter((hint) => hint.platform === platform);
    const options = new Map(
      candidates.map((hint) => [
        JSON.stringify([hint.width, hint.height, hint.inline]),
        hint,
      ]),
    );
    if (options.size > 1) {
      conflicts.push({
        src,
        reason: 'Different source dimensions for the same image in this page',
        sizes: [...options.values()],
      });
      continue;
    }
    const hint = [...options.values()][0];
    if (!hint.width && !hint.height) continue;
    if (hint.width === '100%' && !hint.height) continue;
    const currentAlt =
      attrs === undefined ? match[1] : (readImageAttribute(attrs, 'alt') ?? '');
    const context =
      content
        .slice(0, match.index)
        .trim()
        .split('\n')
        .reverse()
        .find((line) => line.trim() && !/^\s*</.test(line)) ?? '文档截图';
    const alt =
      currentAlt ||
      hint.alt ||
      context
        .replace(/^\s*(?:\d+[.)]|[-*#])\s*/, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*`]/g, '')
        .trim()
        .slice(0, 80);
    const replacement = renderMigratedImage({ ...hint, src, alt });
    replacements.push({
      start: match.index,
      end: match.index + match[0].length,
      replacement,
    });
    changes.push({
      src,
      width: hint.width,
      height: hint.height,
      inline: hint.inline,
      alt,
      platform: platform ?? null,
      legacySource: hint.legacySource,
    });
  }
  let output = content;
  for (const item of replacements.reverse())
    output =
      output.slice(0, item.start) + item.replacement + output.slice(item.end);
  return { content: output, changes, conflicts };
}

export async function auditLegacyImageSizes({
  repoRoot,
  oldRoot,
  write = false,
}) {
  const rows = parseCsv(
    await fs.readFile(
      path.join(repoRoot, 'docs/migration/path-map.csv'),
      'utf8',
    ),
  );
  const header = rows.shift();
  const pairs = rows.map((row) => ({
    sourcePath: row[header.indexOf('source_path')],
    targetPath: row[header.indexOf('target_path')],
  }));
  const assets = new Map();
  for (const name of [
    'api-center-manual-migration-report.json',
    'api-center-manual-generated-files.json',
  ]) {
    const report = JSON.parse(
      await fs.readFile(path.join(repoRoot, 'docs/migration', name), 'utf8'),
    );
    for (const item of report.results ?? report.files ?? []) {
      if (item.type === 'manual-mdx') pairs.push(item);
      if (item.type === 'asset' && item.sourcePath?.startsWith('static/')) {
        const identity = `asset:${item.targetPath}`;
        assets.set(`/${item.targetPath.replace(/^public\//, '')}`, identity);
        assets.set(`/${item.sourcePath.slice(7)}`, identity);
      }
    }
  }
  const canonicalize = (src) => {
    let key = src;
    try {
      const url = new URL(src, 'https://doc.shengwang.cn');
      if (
        url.hostname === 'doc.shengwang.cn' ||
        url.pathname.startsWith('/docs-portal/')
      )
        key = url.pathname.replace(/^\/docs-portal/, '');
    } catch {
      /* Keep opaque legacy asset identifiers unchanged. */
    }
    return assets.get(key) ?? key;
  };
  const sourceCache = new Map();
  async function sourceImages(sourcePath, ancestors = new Set()) {
    if (ancestors.has(sourcePath)) return [];
    if (sourceCache.has(sourcePath)) return sourceCache.get(sourcePath);
    let text;
    try {
      text = await fs.readFile(path.join(oldRoot, sourcePath), 'utf8');
    } catch {
      return [];
    }
    const hints = extractLegacyImageSizes(text, { includeUnsized: true }).map(
      (hint) => ({
        ...hint,
        legacySource: { file: sourcePath, line: hint.line },
      }),
    );
    const next = new Set([...ancestors, sourcePath]);
    for (const match of text.matchAll(
      /^import\s+[^\n]*?from\s+['"]([^'"]+\.mdx?)['"]/gm,
    )) {
      const dependency = match[1].startsWith('@shared/')
        ? `docs/shared/${match[1].slice(8)}`
        : match[1].startsWith('.')
          ? path.posix.join(path.posix.dirname(sourcePath), match[1])
          : null;
      if (dependency) hints.push(...(await sourceImages(dependency, next)));
    }
    sourceCache.set(sourcePath, hints);
    return hints;
  }
  const byTarget = new Map();
  for (const pair of pairs) {
    if (
      !pair.sourcePath ||
      !pair.targetPath?.startsWith('content/docs/zh-CN/') ||
      pair.targetPath.includes('..')
    )
      continue;
    for (const target of new Set([
      pair.targetPath,
      pair.targetPath.replace('/solutions/', '/realtime-media/'),
      pair.targetPath.replace('/realtime-media/recording/', '/realtime-media/'),
    ])) {
      const sources = byTarget.get(target) ?? new Set();
      sources.add(pair.sourcePath);
      byTarget.set(target, sources);
    }
  }
  for (const file of await fs.readdir(
    path.join(repoRoot, 'content/docs/zh-CN'),
    { recursive: true },
  )) {
    if (/\.mdx?$/.test(file)) {
      const targetPath = `content/docs/zh-CN/${file}`;
      if (!byTarget.has(targetPath)) byTarget.set(targetPath, new Set());
    }
  }
  const files = [];
  let checkedPages = 0;
  for (const [targetPath, sources] of byTarget) {
    if (isRetiredCnDocsPath(targetPath.replace(/^content\/docs\//, '')))
      continue;
    let content;
    try {
      content = await fs.readFile(path.join(repoRoot, targetPath), 'utf8');
    } catch {
      continue;
    }
    checkedPages++;
    const hints = (
      await Promise.all(
        [...sources].map(async (source) =>
          (
            await sourceImages(source)
          ).map((hint) => ({
            ...hint,
            platform: normalizePlatform(
              inferContextFromSourcePath(source).platform,
            ),
          })),
        ),
      )
    ).flat();
    const result = restoreImageSizes(content, hints, canonicalize);
    if (!result.changes.length && !result.conflicts.length) continue;
    files.push({
      targetPath,
      sources: [...sources],
      changes: result.changes,
      conflicts: result.conflicts,
    });
    if (write && result.content !== content)
      await fs.writeFile(path.join(repoRoot, targetPath), result.content);
  }
  return {
    checkedPages,
    changedPages: files.filter((file) => file.changes.length).length,
    changedImages: files.reduce(
      (count, file) => count + file.changes.length,
      0,
    ),
    conflicts: files.reduce((count, file) => count + file.conflicts.length, 0),
    files,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const oldRoot = process.argv[process.argv.indexOf('--old-root') + 1];
  if (!process.argv.includes('--old-root') || !oldRoot)
    throw Error('Pass --old-root <legacy repository>');
  const report = await auditLegacyImageSizes({
    repoRoot: process.cwd(),
    oldRoot,
    write: process.argv.includes('--write'),
  });
  const reportPath = path.resolve('.agent/artifacts/legacy-image-sizes.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report, files: undefined, reportPath }));
}
