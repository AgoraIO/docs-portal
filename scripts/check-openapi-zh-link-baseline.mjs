import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import {
  auditDocsLinks,
  getZhCnOpenApiSourcePaths,
} from './audit-doc-links.mjs';

const DEFAULT_BASELINE_PATH =
  'docs/agents/reports/2026-07-17-openapi-zh-link-baseline.json';

export function createOpenApiZhLinkBaseline(stats) {
  const entriesByKey = new Map();

  for (const entry of stats.invalidInternalLinks) {
    const baselineEntry = {
      sourcePath: entry.sourcePath,
      href: entry.href,
      target: entry.target,
      reason: entry.reason,
    };
    const key = getBaselineEntryKey(baselineEntry);
    const existing = entriesByKey.get(key);

    if (existing) {
      existing.count += 1;
      continue;
    }

    entriesByKey.set(key, {
      ...baselineEntry,
      count: 1,
    });
  }

  return [...entriesByKey.values()].sort(compareBaselineEntries);
}

export function compareOpenApiZhLinkBaseline(currentEntries, baselineEntries) {
  const baselineByKey = new Map(
    baselineEntries.map((entry) => [getBaselineEntryKey(entry), entry]),
  );
  const currentByKey = new Map(
    currentEntries.map((entry) => [getBaselineEntryKey(entry), entry]),
  );
  const newOrIncreased = [];
  const resolvedOrReduced = [];

  for (const current of currentEntries) {
    const baseline = baselineByKey.get(getBaselineEntryKey(current));

    if (!baseline || current.count > baseline.count) {
      newOrIncreased.push({
        ...current,
        baselineCount: baseline?.count ?? 0,
      });
    }
  }

  for (const baseline of baselineEntries) {
    const current = currentByKey.get(getBaselineEntryKey(baseline));

    if (!current || current.count < baseline.count) {
      resolvedOrReduced.push({
        ...baseline,
        currentCount: current?.count ?? 0,
      });
    }
  }

  return {
    newOrIncreased: newOrIncreased.sort(compareBaselineEntries),
    resolvedOrReduced: resolvedOrReduced.sort(compareBaselineEntries),
  };
}

export function getBaselineEntryKey(entry) {
  return [
    entry.sourcePath,
    entry.href,
    entry.target ?? '',
    entry.reason ?? '',
  ].join('\u0000');
}

function compareBaselineEntries(a, b) {
  return (
    a.sourcePath.localeCompare(b.sourcePath) ||
    (a.reason ?? '').localeCompare(b.reason ?? '') ||
    a.href.localeCompare(b.href) ||
    (a.target ?? '').localeCompare(b.target ?? '')
  );
}

function readBaseline(repoRoot, baselinePath) {
  const absolutePath = path.resolve(repoRoot, baselinePath);

  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function writeBaseline(repoRoot, baselinePath, baseline) {
  const absolutePath = path.resolve(repoRoot, baselinePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(
    absolutePath,
    `${JSON.stringify(
      {
        description:
          'Baseline for unresolved invalid links in content/openapi/**/*.zh-CN.yaml. CI fails when current invalid links add new rows or exceed these counts.',
        generatedBy: 'pnpm run docs:links:openapi-zh:baseline:update',
        entries: baseline,
      },
      null,
      2,
    )}\n`,
  );
}

function getCurrentBaseline(repoRoot) {
  const docsRoot = path.join(repoRoot, 'content', 'docs');
  const openApiRoot = path.join(repoRoot, 'content', 'openapi');
  const stats = auditDocsLinks({
    docsRoot,
    openApiRoot,
    openApiSourcePaths: getZhCnOpenApiSourcePaths(openApiRoot),
  });

  return {
    entries: createOpenApiZhLinkBaseline(stats),
    stats,
  };
}

function parseArgs(args) {
  return {
    baselinePath:
      args
        .find((arg) => arg.startsWith('--baseline='))
        ?.slice('--baseline='.length) ?? DEFAULT_BASELINE_PATH,
    update: args.includes('--update'),
  };
}

function formatEntry(entry) {
  return [
    `${entry.sourcePath}: ${entry.href}`,
    `target=${entry.target}`,
    `reason=${entry.reason}`,
    `baseline=${entry.baselineCount}`,
    `current=${entry.count}`,
  ].join(' | ');
}

function main() {
  const repoRoot = process.cwd();
  const options = parseArgs(process.argv.slice(2));
  const current = getCurrentBaseline(repoRoot);

  if (options.update) {
    writeBaseline(repoRoot, options.baselinePath, current.entries);
    console.log(
      `Wrote ${current.entries.length} zh-CN OpenAPI invalid-link baseline entries to ${options.baselinePath}.`,
    );
    return;
  }

  const baseline = readBaseline(repoRoot, options.baselinePath);
  const comparison = compareOpenApiZhLinkBaseline(
    current.entries,
    baseline.entries,
  );

  console.log('# OpenAPI zh-CN Link Baseline Check');
  console.log('');
  console.log(`openapiFiles: ${current.stats.openapiFiles}`);
  console.log(`invalidInternalLinks: ${current.stats.invalidInternalLinks.length}`);
  console.log(
    `legacyShengwangDocHostLinks: ${current.stats.legacyShengwangDocHostLinks.length}`,
  );
  console.log(`baselineEntries: ${baseline.entries.length}`);
  console.log(`newOrIncreasedEntries: ${comparison.newOrIncreased.length}`);
  console.log(`resolvedOrReducedEntries: ${comparison.resolvedOrReduced.length}`);

  if (comparison.newOrIncreased.length > 0) {
    console.log('');
    console.log('## New or increased invalid links');

    for (const entry of comparison.newOrIncreased) {
      console.log(`- ${formatEntry(entry)}`);
    }

    process.exitCode = 1;
    return;
  }

  if (comparison.resolvedOrReduced.length > 0) {
    console.log('');
    console.log('## Resolved or reduced baseline entries');

    for (const entry of comparison.resolvedOrReduced) {
      console.log(
        `- ${entry.sourcePath}: ${entry.href} | target=${entry.target} | reason=${entry.reason} | baseline=${entry.count} | current=${entry.currentCount}`,
      );
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
