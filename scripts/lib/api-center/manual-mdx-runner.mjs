import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import {
  loadComponentMap,
  loadPathMap,
  migrateLegacyPage,
} from '../../migrate-legacy-docs.mjs';
import {
  buildLocalFragmentIndex,
  collectLocalFragmentReferences,
  insertFragmentAliases,
  rewriteLocalFragmentLinks,
  targetPathToRoute,
} from './local-fragment-index.mjs';
import {
  ApiCenterMigrationRun,
  assetTargetPath,
  buildLegacyRouteMap,
  createWarning,
  isLegacyDocsHref,
  isLegacyFaqHref,
  loadFaqMappingRows,
  renderGeneratedMdx,
  rewriteLegacyHref,
} from './migration-framework.mjs';
import { parseCsv } from './source-resolver.mjs';

const PLATFORM_ALIASES = new Map([
  ['rn', 'react-native'],
  ['unreal-cpp', 'unreal'],
  ['unreal-blueprint', 'blueprint'],
]);
const SHARED_DOCUMENT_TITLES = new Map([
  [
    'content/docs/zh-CN/api-reference/rtc-server-sdk/error-code.mdx',
    'RTC 服务端 SDK 通用错误码',
  ],
]);

function normalizePlatform(value) {
  return PLATFORM_ALIASES.get(value) ?? value;
}

function splitFrontmatter(source) {
  const match = String(source).match(
    /^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/,
  );
  if (!match) return { data: {}, body: String(source) };
  return {
    data: yaml.load(match[1]) ?? {},
    body: String(source).slice(match[0].length).trim(),
  };
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeLegacyUrl(value) {
  if (!value) return null;
  const url = new URL(value, 'https://doc.shengwang.cn');
  url.hash = '';
  url.pathname = url.pathname.replace(/\.html$/i, '');
  return url.href;
}

function sourceScopeKey(value) {
  if (!value) return null;
  const segments = new URL(value, 'https://doc.shengwang.cn').pathname
    .split('/')
    .filter(Boolean);
  return segments.slice(0, 3).join('/');
}

function buildSourceLabels(manifest) {
  const byUrl = new Map();
  const byScope = new Map();
  for (const entry of manifest.entries ?? []) {
    const value = {
      platformLabel: entry.label,
      productLabel: entry.product,
    };
    for (const sourceUrl of [
      entry.legacyUrl,
      ...(entry.pageGraph?.pages ?? []).map((page) => page.url),
    ]) {
      const key = normalizeLegacyUrl(sourceUrl);
      if (!key) continue;
      const current = byUrl.get(key);
      if (
        current &&
        (current.productLabel !== value.productLabel ||
          current.platformLabel !== value.platformLabel)
      ) {
        byUrl.set(key, {
          platformLabel:
            current.platformLabel === value.platformLabel
              ? value.platformLabel
              : null,
          productLabel:
            current.productLabel === value.productLabel
              ? value.productLabel
              : null,
        });
      } else if (!current) {
        byUrl.set(key, value);
      }
    }
    const scopeKey = sourceScopeKey(entry.legacyUrl);
    const currentScope = byScope.get(scopeKey);
    if (!currentScope) byScope.set(scopeKey, value);
    else if (currentScope.productLabel !== value.productLabel) {
      byScope.set(scopeKey, {
        platformLabel:
          currentScope.platformLabel === value.platformLabel
            ? value.platformLabel
            : null,
        productLabel: null,
      });
    }
  }
  return { byScope, byUrl };
}

function groupByTarget(pages) {
  const grouped = new Map();
  for (const page of pages) {
    const targetPath = page.sourceResolution.targetPath;
    const values = grouped.get(targetPath) ?? [];
    values.push(page);
    grouped.set(targetPath, values);
  }
  return [...grouped.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  );
}

function classifyConverterIssues(conversions) {
  const rawIssues = unique(
    conversions.flatMap((conversion) => conversion.issues),
  );
  const warnings = [];
  const missingSourceText = rawIssues.filter((value) =>
    value.startsWith('missing-source-text:'),
  );
  for (const value of missingSourceText) {
    warnings.push(
      createWarning(
        'missing-source-text',
        value.slice('missing-source-text:'.length),
        {
          signal: value,
        },
      ),
    );
  }
  const normalized = rawIssues.filter(
    (value) =>
      /^(?:normalized-|escaped-|needs-(?:image-width|landing-page)-review)/.test(
        value,
      ) ||
      value === 'normalized-tab-item-fallback' ||
      value === 'dropped-hidden-index-span',
  );
  if (normalized.length > 0) {
    warnings.push(
      createWarning(
        'manual-mdx-normalized',
        `Normalized ${normalized.length} legacy MDX syntax signal(s).`,
        { signals: normalized },
      ),
    );
  }
  const ignoredReferenceReview = rawIssues.filter((value) =>
    /^(?:断链|图片):\d+$/.test(value),
  );
  const remaining = rawIssues.filter(
    (value) =>
      !normalized.includes(value) &&
      !ignoredReferenceReview.includes(value) &&
      !missingSourceText.includes(value),
  );
  const residue = remaining.filter(
    (value) =>
      value.startsWith('legacy-residue:') ||
      value.startsWith('unknown-legacy-component:') ||
      value.startsWith('unresolved-import:') ||
      value.startsWith('circular-shared-import:'),
  );
  for (const value of residue) {
    warnings.push(
      createWarning('manual-mdx-residue', value, { signal: value }),
    );
  }
  for (const value of remaining.filter((item) => !residue.includes(item))) {
    warnings.push(createWarning('manual-mdx-review', value, { signal: value }));
  }
  return warnings;
}

export function rewriteBodyLinks(body, { routeMap, sourceUrl }) {
  const warnings = [];
  const rewritten = body.replace(
    /(?<!!)\[((?:[^[\]\n]|\[[^\]\n]*])*)]\(([^)\s]+)(?:\s+"[^"]*")?\s*\)/g,
    (raw, label, href) => {
      const relative =
        !href.startsWith('#') &&
        !href.startsWith('/') &&
        !/^[a-z][a-z\d+.-]*:/i.test(href);
      const legacy =
        href.startsWith('/zh-CN/') ||
        isLegacyDocsHref(href, sourceUrl) ||
        isLegacyFaqHref(href, sourceUrl) ||
        relative;
      if (!legacy) return raw;
      const result = rewriteLegacyHref(href, { sourceUrl, routeMap });
      if (result.warning) warnings.push(result.warning);
      if (result.href) return `[${label}](${result.href})`;
      warnings.push(
        createWarning(
          'source-only-link-removed',
          `Rendered unresolved legacy MDX link ${href} as local text.`,
          { href },
        ),
      );
      return label;
    },
  );
  return { body: rewritten, warnings };
}

async function localizeAssets(body, { oldRoot, run, sourcePath, sourceUrl }) {
  const warnings = [];
  let output = '';
  let cursor = 0;
  const matches = [
    ...body.matchAll(/!\[([^\]\n]*)]\(([^)\s]+)(?:\s+"[^"]*")?\)/g),
  ];
  for (const match of matches) {
    output += body.slice(cursor, match.index);
    cursor = match.index + match[0].length;
    const source = match[2];
    const legacyAsset =
      source.startsWith('/img/') ||
      /^https?:\/\/doc\.shengwang\.cn\/img\//.test(source);
    if (!legacyAsset) {
      output += match[0];
      continue;
    }
    const pathname = /^https?:\/\//.test(source)
      ? new URL(source).pathname
      : source.split(/[?#]/, 1)[0];
    const absolute = path.resolve(
      oldRoot,
      'static',
      pathname.replace(/^\//, ''),
    );
    try {
      const contents = await fs.readFile(absolute);
      const targetPath = assetTargetPath(absolute, contents);
      run.planFile({
        targetPath,
        contents,
        sourcePath: path.relative(oldRoot, absolute).split(path.sep).join('/'),
        sourceUrl,
        type: 'asset',
      });
      output += `![${match[1]}](/${targetPath.replace(/^public\//, '')})`;
    } catch {
      warnings.push(
        createWarning(
          'asset-missing',
          `Legacy MDX asset ${source} referenced by ${sourcePath} was not found.`,
          { asset: source },
        ),
      );
      output += match[0];
    }
  }
  output += body.slice(cursor);
  return { body: output, warnings };
}

function augmentPathMap(pathMap, manifest) {
  for (const page of manifest.pageEvidence ?? []) {
    const resolution = page.sourceResolution;
    if (resolution?.type !== 'manual-mdx' || !resolution.sourcePath) continue;
    const prior = pathMap.get(resolution.sourcePath) ?? {
      sourcePath: resolution.sourcePath,
      targetPaths: [],
      decisionRefs: [],
      isRedirectContent: true,
    };
    pathMap.set(resolution.sourcePath, {
      ...prior,
      targetPath: resolution.targetPath,
      targetPaths: unique([
        ...(prior.targetPaths ?? []),
        resolution.targetPath,
      ]),
    });
  }
}

async function usablePathMapRows(repoRoot, pathMapPath) {
  try {
    return parseCsv(
      await fs.readFile(path.resolve(repoRoot, pathMapPath), 'utf8'),
    );
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export async function runManualMdxMigration({
  repoRoot = process.cwd(),
  oldRoot = process.env.API_CENTER_OLD_ROOT,
  manifestPath = 'docs/migration/api-center-html-manifest.json',
  pathMapPath = 'docs/migration/path-map.csv',
  componentMapPath = 'docs/migration/component-map.yaml',
  mode = 'write',
  reconcile = false,
  scope = null,
} = {}) {
  if (!oldRoot) throw new Error('Pass --old-root or set API_CENTER_OLD_ROOT.');
  const manifest = JSON.parse(
    await fs.readFile(path.resolve(repoRoot, manifestPath), 'utf8'),
  );
  const sourceLabels = buildSourceLabels(manifest);
  const pathMap = await loadPathMap(path.resolve(repoRoot, pathMapPath));
  augmentPathMap(pathMap, manifest);
  const componentMap = await loadComponentMap(
    path.resolve(repoRoot, componentMapPath),
  );
  const routeMap = buildLegacyRouteMap(
    manifest,
    await usablePathMapRows(repoRoot, pathMapPath),
    await loadFaqMappingRows(repoRoot),
  );
  const run = await ApiCenterMigrationRun.create({
    repoRoot,
    manifest,
    mode,
    reconcile,
    ownershipPath: 'docs/migration/api-center-manual-generated-files.json',
    reportJsonPath: 'docs/migration/api-center-manual-migration-report.json',
    reportMarkdownPath: 'docs/migration/api-center-manual-migration-report.md',
  });
  const pages = (manifest.pageEvidence ?? []).filter(
    (page) =>
      !page.aliasOf &&
      page.sourceResolution?.type === 'manual-mdx' &&
      (!scope || page.sourceResolution.route?.scopeKey === scope),
  );
  const pending = [];
  for (const page of pages) {
    if (
      page.sourceResolution.targetExists &&
      !run.ownsTarget(page.sourceResolution.targetPath)
    ) {
      run.preserveExisting({ page });
    } else {
      pending.push(page);
    }
  }

  const drafts = [];
  for (const [targetPath, targetPages] of groupByTarget(pending)) {
    const canonicalBySource = new Map();
    for (const page of targetPages) {
      if (!canonicalBySource.has(page.sourceResolution.sourcePath)) {
        canonicalBySource.set(page.sourceResolution.sourcePath, page);
      }
    }
    const canonicalPages = [...canonicalBySource.values()];
    const conversions = [];
    for (const page of canonicalPages) {
      const resolution = page.sourceResolution;
      const pageSourceLabels =
        sourceLabels.byUrl.get(normalizeLegacyUrl(page.requestedUrl)) ??
        sourceLabels.byScope.get(resolution.route?.scopeKey) ??
        {};
      const converted = await migrateLegacyPage({
        componentMap,
        pathMap,
        platform: normalizePlatform(resolution.route?.platform),
        platformLabel: pageSourceLabels.platformLabel,
        productLabel: pageSourceLabels.productLabel,
        sourcePath: resolution.sourcePath,
        sourceRoot: oldRoot,
        targetPath,
      });
      const parsed = splitFrontmatter(converted.content);
      conversions.push({ page, converted, ...parsed });
    }
    const sourceUrls = unique(targetPages.map((page) => page.requestedUrl));
    const sourcePaths = unique(
      targetPages.map((page) => page.sourceResolution.sourcePath),
    );
    const platforms = unique(
      targetPages.map((page) =>
        normalizePlatform(page.sourceResolution.route?.platform),
      ),
    );
    let body =
      conversions.length === 1
        ? conversions[0].body
        : conversions
            .map(
              (conversion) =>
                `<PlatformStructured platform=${JSON.stringify(
                  normalizePlatform(
                    conversion.page.sourceResolution.route?.platform,
                  ),
                )}>\n\n${conversion.body}\n\n</PlatformStructured>`,
            )
            .join('\n\n');
    const warnings = classifyConverterIssues(
      conversions.map((item) => item.converted),
    );
    if (conversions.length > 1) {
      warnings.push(
        createWarning(
          'manual-platform-merge',
          `Merged ${conversions.length} platform-specific MDX sources for ${targetPath}.`,
        ),
      );
    }
    const rewritten = rewriteBodyLinks(body, {
      routeMap,
      sourceUrl: sourceUrls[0],
    });
    body = rewritten.body;
    warnings.push(...rewritten.warnings);
    const localized = await localizeAssets(body, {
      oldRoot,
      run,
      sourcePath: sourcePaths[0],
      sourceUrl: sourceUrls[0],
    });
    body = localized.body;
    warnings.push(...localized.warnings);
    const first = conversions[0];
    const title = SHARED_DOCUMENT_TITLES.get(targetPath) ?? first.data.title;
    if (!title) {
      throw new Error(
        `Missing source-derived title for ${sourcePaths.join(', ')}; request source copy instead of synthesizing a target filename title.`,
      );
    }
    const description = first.data.description;
    const extraFrontmatter = Object.fromEntries(
      Object.entries(first.data).filter(
        ([key]) => !['title', 'description', '_migration'].includes(key),
      ),
    );
    drafts.push({
      targetPath,
      title,
      description,
      body,
      extraFrontmatter,
      sourcePath: sourcePaths[0],
      sourceUrl: sourceUrls[0],
      sourcePaths,
      sourceUrls,
      platforms,
      warnings,
    });
  }

  const draftsByRoute = new Map(
    drafts.map((draft) => [targetPathToRoute(draft.targetPath), draft]),
  );
  const requestedByRoute = new Map();
  for (const draft of drafts) {
    const sourceRoute = targetPathToRoute(draft.targetPath);
    for (const reference of collectLocalFragmentReferences(
      draft.body,
      sourceRoute,
    )) {
      if (!draftsByRoute.has(reference.route)) continue;
      const fragments = requestedByRoute.get(reference.route) ?? new Set();
      fragments.add(reference.fragment);
      requestedByRoute.set(reference.route, fragments);
    }
  }
  for (const [route, fragments] of requestedByRoute) {
    const draft = draftsByRoute.get(route);
    const aliases = insertFragmentAliases(draft.body, fragments);
    draft.body = aliases.body;
    if (aliases.inserted.length > 0) {
      draft.warnings.push(
        createWarning(
          'manual-fragment-alias',
          `Added ${aliases.inserted.length} stable legacy fragment alias(es).`,
          { aliases: aliases.inserted },
        ),
      );
    }
  }

  const fragmentIndex = await buildLocalFragmentIndex({
    repoRoot,
    virtualPages: drafts,
  });
  for (const draft of drafts) {
    const normalized = await rewriteLocalFragmentLinks(draft.body, {
      fragmentIndex,
      sourceRoute: targetPathToRoute(draft.targetPath),
    });
    draft.body = normalized.body;
    const resolved = normalized.warnings.filter(
      (warning) => !warning.unresolved,
    );
    const unresolved = normalized.warnings.filter(
      (warning) => warning.unresolved,
    );
    if (resolved.length > 0) {
      draft.warnings.push(
        createWarning(
          'manual-fragment-normalized',
          `Normalized ${resolved.length} legacy fragment link(s) to stable local anchors.`,
          { mappings: resolved },
        ),
      );
    }
    if (unresolved.length > 0) {
      draft.warnings.push(
        createWarning(
          'unresolved-fragment',
          `Removed ${unresolved.length} fragment(s) that could not be mapped uniquely while preserving their local page links.`,
          { mappings: unresolved },
        ),
      );
    }
    const contents = renderGeneratedMdx({
      title: draft.title,
      description: draft.description,
      body: draft.body,
      extraFrontmatter: draft.extraFrontmatter,
      migration: {
        type: 'manual-mdx',
        sourceUrl: draft.sourceUrl,
        sourcePath: draft.sourcePath,
        sourceUrls: draft.sourceUrls,
        sourcePaths: draft.sourcePaths,
        platforms: draft.platforms,
        generator: 'legacy-mdx',
        warnings: draft.warnings,
      },
    });
    run.planFile({
      targetPath: draft.targetPath,
      contents,
      sourcePath: draft.sourcePath,
      sourceUrl: draft.sourceUrl,
      type: 'manual-mdx',
      warnings: draft.warnings,
    });
  }
  const report = await run.finish();
  return {
    report,
    selectedPages: pending.length,
    selectedTargets: groupByTarget(pending).length,
  };
}
