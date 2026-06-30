import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { setTimeout as wait } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

const DEFAULT_MAX_SAMPLES = 30;
const DEFAULT_EXTERNAL_CONCURRENCY = 8;
const DEFAULT_EXTERNAL_RETRIES = 2;
const DEFAULT_EXTERNAL_RETRY_DELAY_MS = 250;
const DEFAULT_EXTERNAL_TIMEOUT_MS = 5000;
const OVERVIEW_CARD_SOURCE_PATHS = [
  'en/introduction/index.mdx',
  'en/ai/index.mdx',
  'en/realtime-media/overview.mdx',
  'en/solutions/index.mdx',
  'en/api-reference/index.mdx',
];

/**
 * @typedef {object} AuditDocsLinksOptions
 * @property {string} [docsRoot]
 * @property {string[]} [sourcePaths]
 */

/**
 * @param {AuditDocsLinksOptions} [options]
 */
export function auditDocsLinks({
  docsRoot = path.join(process.cwd(), 'content', 'docs'),
  sourcePaths,
} = {}) {
  const stats = createStats();
  const docsFiles = listMarkdownFiles(docsRoot);
  const existingContentPaths = new Set(
    docsFiles.map((file) => toContentPath(docsRoot, file)),
  );
  const existingRoutePaths = getExistingRoutePaths({
    docsRoot,
    existingContentPaths,
  });
  const docsPageIndex = createDocsPageIndex({
    docsFiles,
    docsRoot,
    existingRoutePaths,
  });
  const sourcePathFilter = sourcePaths ? new Set(sourcePaths) : null;

  for (const filePath of docsFiles) {
    const sourcePath = toContentPath(docsRoot, filePath);

    if (sourcePathFilter && !sourcePathFilter.has(sourcePath)) {
      continue;
    }

    const markdown = fs.readFileSync(filePath, 'utf8');
    const links = extractLinks(markdown);

    stats.docsFiles += 1;
    stats.totalLinks += links.length;

    for (const link of links) {
      classifyLink(sourcePath, link, {
        docsPageIndex,
        existingContentPaths,
        existingRoutePaths,
        stats,
      });
    }
  }

  return stats;
}

function createStats() {
  return {
    assetLinks: 0,
    checkedExternalLinks: [],
    docsFiles: 0,
    externalLinkCandidates: [],
    externalLinks: 0,
    hashLinks: 0,
    invalidExternalLinks: [],
    invalidLinks: [],
    invalidInternalLinks: [],
    legacyRootDocLinks: [],
    missingHashLinks: [],
    missingRootLinks: [],
    missingRelativeMarkdownLinks: [],
    relativeAssetLinks: 0,
    relativeMarkdownLinks: [],
    resolvedRelativeMarkdownLinks: [],
    rootLinks: [],
    skippedExternalLinks: [],
    skippedRootLinks: [],
    totalLinks: 0,
    validHashLinks: [],
  };
}

function getExistingRoutePaths({ docsRoot, existingContentPaths }) {
  const routePaths = new Map();

  for (const contentPath of existingContentPaths) {
    const routePath = getRoutePath(contentPath);

    if (routePath) {
      routePaths.set(routePath, {
        resolution: 'route',
        resolvedTargetPath: contentPath,
      });

      for (const platformRoutePath of getPlatformRoutePaths({
        contentPath,
        docsRoot,
        routePath,
      })) {
        routePaths.set(platformRoutePath, {
          resolution: 'platform-route',
          resolvedTargetPath: contentPath,
        });
      }
    }
  }

  for (const routePath of getOpenApiRoutePathsForAudit()) {
    routePaths.set(routePath, {
      resolution: 'openapi-route',
      resolvedTargetPath: `openapi:${routePath}`,
    });
  }

  for (const [routePath, entry] of getDirectoryFallbackRoutePaths({
    docsRoot,
    existingContentPaths,
  })) {
    if (!routePaths.has(routePath)) {
      routePaths.set(routePath, entry);
    }
  }

  for (const [routePath, targetPath] of Object.entries(KNOWN_REDIRECT_ROUTES)) {
    routePaths.set(routePath, {
      resolution: 'redirect',
      resolvedTargetPath: targetPath,
    });
  }

  return routePaths;
}

function createDocsPageIndex({ docsFiles, docsRoot, existingRoutePaths }) {
  const contentPages = new Map();
  const routePages = new Map();

  for (const filePath of docsFiles) {
    const contentPath = toContentPath(docsRoot, filePath);
    const markdown = fs.readFileSync(filePath, 'utf8');

    contentPages.set(contentPath, {
      anchors: extractAnchors(markdown),
      contentPath,
      filePath,
    });
  }

  for (const [routePath, entry] of existingRoutePaths) {
    const page = contentPages.get(entry.resolvedTargetPath);

    if (page) {
      routePages.set(routePath, page);
    }
  }

  return { contentPages, routePages };
}

function getDirectoryFallbackRoutePaths({ docsRoot, existingContentPaths }) {
  const routePaths = new Map();
  const metaPaths = listMetaFiles(docsRoot);

  for (const metaPath of metaPaths) {
    const directoryContentPath = path.posix.dirname(
      toContentPath(docsRoot, metaPath),
    );
    const routePath = `/${directoryContentPath}`;

    if (existingContentPaths.has(`${directoryContentPath}/index.mdx`)) {
      continue;
    }

    if (existingContentPaths.has(`${directoryContentPath}/index.md`)) {
      continue;
    }

    const firstChildPage = getFirstMetaChildPage({
      directoryContentPath,
      existingContentPaths,
      metaPath,
    });

    if (!firstChildPage) {
      continue;
    }

    routePaths.set(routePath, {
      resolution: 'directory-fallback',
      resolvedTargetPath: firstChildPage,
    });
  }

  return routePaths;
}

function getPlatformRoutePaths({ contentPath, docsRoot, routePath }) {
  const absolutePath = path.join(docsRoot, contentPath);
  const markdown = fs.readFileSync(absolutePath, 'utf8');
  const platforms = new Set(
    [
      ...markdown.matchAll(/<PlatformStructured\s+platform=["']([^"']+)["']/g),
    ].flatMap((match) => platformRouteAliases(match[1])),
  );

  return [...platforms]
    .filter(Boolean)
    .map((platform) => `${routePath}/${platform}`);
}

function platformRouteAliases(platform) {
  if (
    platform === 'javascript' ||
    platform === 'web' ||
    platform === 'react-js'
  ) {
    return ['web', 'javascript', 'react-js'];
  }

  return [platform];
}

function listMetaFiles(root) {
  const results = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      results.push(...listMetaFiles(fullPath));
      continue;
    }

    if (entry.name === 'meta.json') {
      results.push(fullPath);
    }
  }

  return results.sort();
}

function getFirstMetaChildPage({
  directoryContentPath,
  existingContentPaths,
  metaPath,
}) {
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

  if (!Array.isArray(meta.pages)) {
    return '';
  }

  for (const rawPage of meta.pages) {
    if (typeof rawPage !== 'string' || rawPage.startsWith('---')) {
      continue;
    }

    const page = rawPage.replace(/^!/, '');
    const candidates = [
      `${directoryContentPath}/${page}.mdx`,
      `${directoryContentPath}/${page}.md`,
      `${directoryContentPath}/${page}/index.mdx`,
      `${directoryContentPath}/${page}/index.md`,
    ];
    const targetPath = candidates.find((candidate) =>
      existingContentPaths.has(candidate),
    );

    if (targetPath) {
      return targetPath;
    }
  }

  return '';
}

function listMarkdownFiles(root) {
  const results = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      results.push(...listMarkdownFiles(fullPath));
      continue;
    }

    if (/\.(md|mdx)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results.sort();
}

function extractLinks(markdown) {
  const links = [];
  const markdownLinkPattern = /(!?)\[[^\]\n]*\]\((<[^>\n]+>|[^)\n]+)\)/g;
  const referenceLinkPattern = /^\s{0,3}\[[^\]\n]+\]:\s*(\S+)/gm;
  const htmlHrefPattern = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

  for (const match of markdown.matchAll(markdownLinkPattern)) {
    const href = cleanMarkdownHref(match[2]);

    if (!href) {
      continue;
    }

    links.push({ href, isImage: match[1] === '!', source: 'markdown' });
  }

  for (const match of markdown.matchAll(referenceLinkPattern)) {
    const href = cleanMarkdownHref(match[1]);

    if (href) {
      links.push({ href, isImage: false, source: 'reference' });
    }
  }

  for (const match of markdown.matchAll(htmlHrefPattern)) {
    const href = match[1] ?? match[2] ?? '';

    if (href) {
      links.push({ href, isImage: false, source: 'html' });
    }
  }

  return links;
}

function extractAnchors(markdown) {
  const anchors = new Set();
  const slugCounts = new Map();
  const scannableMarkdown = maskMarkdownCode(markdown);
  const explicitIdPattern =
    /<[\w:-]+\s+[^>]*(?:\bid|\bname)\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>/gi;
  const headingPattern = /^(#{1,6})\s+(.+?)\s*#*\s*$/gm;

  for (const match of scannableMarkdown.matchAll(explicitIdPattern)) {
    const anchor = (match[1] ?? match[2] ?? '').trim();

    if (anchor) {
      anchors.add(anchor);
    }
  }

  for (const match of scannableMarkdown.matchAll(headingPattern)) {
    const rawHeading = match[2] ?? '';
    const customAnchor = rawHeading.match(/\s+\{#([^}\s]+)\}\s*$/)?.[1];

    if (customAnchor) {
      anchors.add(customAnchor);
    }

    const headingText = cleanHeadingText(
      customAnchor ? rawHeading.replace(/\s+\{#[^}]+\}\s*$/, '') : rawHeading,
    );

    if (!headingText) {
      continue;
    }

    anchors.add(slugifyHeading(headingText, slugCounts));
  }

  return anchors;
}

function maskMarkdownCode(markdown) {
  return markdown.replace(
    /(^|\n)(`{3,}|~{3,})[\s\S]*?\n\2[^\n]*(?=\n|$)/g,
    (match) => '\n'.repeat(match.split('\n').length - 1),
  );
}

function cleanHeadingText(rawHeading) {
  return rawHeading
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function slugifyHeading(headingText, slugCounts) {
  const baseSlug =
    headingText
      .toLowerCase()
      .trim()
      .replace(/[^\p{Letter}\p{Number}\p{Mark}\s_-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section';
  const previousCount = slugCounts.get(baseSlug) ?? 0;

  slugCounts.set(baseSlug, previousCount + 1);

  return previousCount === 0 ? baseSlug : `${baseSlug}-${previousCount}`;
}

function classifyLink(
  sourcePath,
  link,
  { docsPageIndex, existingContentPaths, existingRoutePaths, stats },
) {
  const href = link.href.trim();
  const parsedHref = splitHref(href);

  if (parsedHref.hash) {
    stats.hashLinks += 1;
  }

  if (link.isImage) {
    stats.assetLinks += 1;

    if (href.startsWith('/')) {
      return;
    }
  }

  if (href.startsWith('#')) {
    validateHashLink({
      docsPageIndex,
      entry: {
        href,
        normalizedHref: href,
        resolved: true,
        resolvedTargetPath: sourcePath,
        source: link.source,
        sourcePath,
      },
      hash: parsedHref.hash,
      link,
      stats,
    });
    return;
  }

  if (href.startsWith('//')) {
    addExternalLinkCandidate(sourcePath, link, stats);
    return;
  }

  if (href.startsWith('/doc/')) {
    const entry = { sourcePath, href, source: link.source };

    stats.legacyRootDocLinks.push(entry);
    addInvalidLink(stats, {
      ...entry,
      reason: 'legacy-doc-root-path',
      target: href,
      type: 'internal',
    });
    return;
  }

  if (href.startsWith('/')) {
    const entry = resolveRootLink(sourcePath, href, existingRoutePaths);

    entry.source = link.source;

    if (entry.skipped) {
      stats.skippedRootLinks.push(entry);
      return;
    }

    if (entry.resolved) {
      stats.rootLinks.push(entry);
      validateHashLink({
        docsPageIndex,
        entry,
        hash: parsedHref.hash,
        link,
        stats,
      });
      return;
    }

    stats.missingRootLinks.push(entry);
    addInvalidLink(stats, {
      ...entry,
      reason: 'missing-internal-path',
      target: entry.normalizedHref,
      type: 'internal',
    });
    return;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    addExternalLinkCandidate(sourcePath, link, stats);
    return;
  }

  const parsed = splitHref(href);

  if (!isRelativeDocsHref(parsed)) {
    stats.relativeAssetLinks += 1;
    return;
  }

  const entry = resolveRelativeDocsLink(
    sourcePath,
    href,
    parsed,
    existingContentPaths,
    existingRoutePaths,
  );

  entry.source = link.source;

  if (entry.resolved) {
    stats.relativeMarkdownLinks.push(entry);

    if (entry.resolution !== 'exact') {
      stats.resolvedRelativeMarkdownLinks.push(entry);
    }

    validateHashLink({
      docsPageIndex,
      entry,
      hash: parsed.hash,
      link,
      stats,
    });
    return;
  }

  stats.missingRelativeMarkdownLinks.push(entry);
  addInvalidLink(stats, {
    ...entry,
    reason: 'missing-internal-path',
    target: entry.normalizedHref,
    type: 'internal',
  });
}

function resolveRootLink(sourcePath, href, existingRoutePaths) {
  const normalizedHref = normalizeLegacyRootDocsHref(href);
  const parsed = splitHref(normalizedHref);
  const routePath = parsed.path.replace(/\/+$/, '') || '/';
  const entry = {
    sourcePath,
    href,
    normalizedHref,
    source: '',
    resolved: false,
    resolvedTargetPath: '',
    resolution: 'missing',
    skipped: false,
  };

  if (isIntentionallyHostedReference(routePath)) {
    return {
      ...entry,
      resolved: true,
      resolvedTargetPath: `hosted:${routePath}`,
      resolution: 'hosted-reference',
      skipped: true,
    };
  }

  const routeEntry = existingRoutePaths.get(routePath);

  if (routeEntry) {
    return {
      ...entry,
      resolved: true,
      resolvedTargetPath: routeEntry.resolvedTargetPath,
      resolution: routeEntry.resolution,
    };
  }

  return entry;
}

function isRelativeDocsHref(parsed) {
  if (!parsed.path) {
    return Boolean(parsed.hash);
  }

  if (/\.mdx?$/i.test(parsed.path)) {
    return true;
  }

  return isExtensionlessRelativeDocPath(parsed.path);
}

function isExtensionlessRelativeDocPath(path) {
  if (!path || path.endsWith('/')) {
    return false;
  }

  const leaf = path.split('/').filter(Boolean).at(-1);

  return Boolean(leaf && !leaf.includes('.'));
}

function normalizeRelativeContentPath(sourcePath, targetHrefPath) {
  return path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), targetHrefPath),
  );
}

function getRelativeTargetPathCandidates(targetPath) {
  if (/\.mdx?$/i.test(targetPath)) {
    return [targetPath];
  }

  return [
    `${targetPath}.mdx`,
    `${targetPath}.md`,
    `${targetPath}/index.mdx`,
    `${targetPath}/index.md`,
  ];
}

function getFallbackRelativeTargetPath(targetPath) {
  return /\.mdx?$/i.test(targetPath) ? targetPath : `${targetPath}.md`;
}

function resolveRelativeDocsLink(
  sourcePath,
  href,
  parsed,
  existingContentPaths,
  existingRoutePaths,
) {
  const targetPath = normalizeRelativeContentPath(sourcePath, parsed.path);
  const targetCandidates = getRelativeTargetPathCandidates(targetPath);
  const existingTargetPath = targetCandidates.find((candidate) =>
    existingContentPaths.has(candidate),
  );
  const normalizedHref = normalizeLegacyRootDocsHref(
    toCleanRoute(
      existingTargetPath ?? getFallbackRelativeTargetPath(targetPath),
      parsed,
    ),
  );

  const entry = {
    sourcePath,
    href,
    targetPath,
    normalizedHref,
    source: '',
    resolved: false,
    resolvedTargetPath: '',
    resolution: 'missing',
  };

  if (existingTargetPath) {
    return {
      ...entry,
      resolved: true,
      resolvedTargetPath: existingTargetPath,
      resolution: 'exact',
    };
  }

  const routePath = splitHref(normalizedHref).path;
  const routeEntry = existingRoutePaths.get(routePath);

  if (routeEntry) {
    return {
      ...entry,
      resolved: true,
      resolvedTargetPath: routeEntry.resolvedTargetPath,
      resolution: routeEntry.resolution,
    };
  }

  return entry;
}

function validateHashLink({ docsPageIndex, entry, hash, link, stats }) {
  if (!hash) {
    return;
  }

  const targetPage = getResolvedTargetPage(entry, docsPageIndex);
  const hashAnchor = decodeHashAnchor(hash);
  const hashEntry = {
    href: entry.href,
    normalizedHref: entry.normalizedHref,
    resolvedTargetPath: entry.resolvedTargetPath,
    source: link.source,
    sourcePath: entry.sourcePath,
    target: `${entry.normalizedHref}`,
  };

  if (!hashAnchor) {
    stats.missingHashLinks.push({
      ...hashEntry,
      reason: 'empty-hash-anchor',
    });
    addInvalidLink(stats, {
      ...hashEntry,
      reason: 'empty-hash-anchor',
      type: 'internal',
    });
    return;
  }

  if (!targetPage) {
    return;
  }

  if (targetPage.anchors.has(hashAnchor)) {
    stats.validHashLinks.push({
      ...hashEntry,
      anchor: hashAnchor,
      resolvedTargetPath: targetPage.contentPath,
    });
    return;
  }

  const missingHashEntry = {
    ...hashEntry,
    anchor: hashAnchor,
    reason: 'missing-hash-anchor',
    resolvedTargetPath: targetPage.contentPath,
  };

  stats.missingHashLinks.push(missingHashEntry);
  addInvalidLink(stats, {
    ...missingHashEntry,
    type: 'internal',
  });
}

function getResolvedTargetPage(entry, docsPageIndex) {
  if (!entry.resolvedTargetPath) {
    return null;
  }

  const contentPage = docsPageIndex.contentPages.get(entry.resolvedTargetPath);

  if (contentPage) {
    return contentPage;
  }

  if (entry.resolvedTargetPath.startsWith('/')) {
    return (
      docsPageIndex.routePages.get(splitHref(entry.resolvedTargetPath).path) ??
      null
    );
  }

  return null;
}

function decodeHashAnchor(hash) {
  const rawAnchor = hash.startsWith('#') ? hash.slice(1) : hash;

  if (!rawAnchor) {
    return '';
  }

  try {
    return decodeURIComponent(rawAnchor);
  } catch {
    return rawAnchor;
  }
}

function addInvalidLink(stats, entry) {
  stats.invalidLinks.push(entry);

  if (entry.type === 'internal') {
    stats.invalidInternalLinks.push(entry);
  }
}

function addExternalLinkCandidate(sourcePath, link, stats) {
  const target = normalizeExternalTarget(link.href);

  stats.externalLinks += 1;

  if (!target) {
    return;
  }

  stats.externalLinkCandidates.push({
    href: link.href,
    source: link.source,
    sourcePath,
    target,
  });
}

function normalizeExternalTarget(href) {
  if (href.startsWith('//')) {
    return `https:${href}`;
  }

  if (/^https?:\/\//i.test(href)) {
    return href;
  }

  return '';
}

/**
 * @typedef {object} ExternalLinkCheckOptions
 * @property {string[]} [allowlist]
 * @property {number} [concurrency]
 * @property {typeof fetch} [fetchImpl]
 * @property {number} [retries]
 * @property {number} [retryDelayMs]
 * @property {number} [timeoutMs]
 */

/**
 * @param {ReturnType<typeof createStats>} stats
 * @param {ExternalLinkCheckOptions} [options]
 */
export async function checkExternalLinks(
  stats,
  {
    allowlist = [],
    concurrency = DEFAULT_EXTERNAL_CONCURRENCY,
    fetchImpl = globalThis.fetch,
    retries = DEFAULT_EXTERNAL_RETRIES,
    retryDelayMs = DEFAULT_EXTERNAL_RETRY_DELAY_MS,
    timeoutMs = DEFAULT_EXTERNAL_TIMEOUT_MS,
  } = {},
) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('External link checking requires a fetch implementation.');
  }

  const groupedCandidates = [
    ...groupExternalLinkCandidates(stats.externalLinkCandidates),
  ];
  const allowlistPatterns = normalizeAllowlistPatterns(allowlist);
  const workerCount = Math.max(
    1,
    Math.min(concurrency, groupedCandidates.length),
  );
  let nextIndex = 0;

  async function checkNextExternalTarget() {
    while (nextIndex < groupedCandidates.length) {
      const [target, candidates] = groupedCandidates[nextIndex];

      nextIndex += 1;
      await checkExternalCandidateGroup({
        allowlistPatterns,
        candidates,
        fetchImpl,
        retries,
        retryDelayMs,
        stats,
        target,
        timeoutMs,
      });
    }
  }

  await Promise.all(
    Array.from({ length: workerCount }, () => checkNextExternalTarget()),
  );

  return stats;
}

async function checkExternalCandidateGroup({
  allowlistPatterns,
  candidates,
  fetchImpl,
  retries,
  retryDelayMs,
  stats,
  target,
  timeoutMs,
}) {
  const allowlistPattern = getAllowlistMatch(target, allowlistPatterns);

  if (allowlistPattern) {
    for (const candidate of candidates) {
      stats.skippedExternalLinks.push({
        ...candidate,
        reason: 'external-allowlisted',
        allowlistPattern,
      });
    }
    return;
  }

  const result = await checkExternalTarget(target, {
    fetchImpl,
    retries,
    retryDelayMs,
    timeoutMs,
  });

  for (const candidate of candidates) {
    const entry = {
      ...candidate,
      attempts: result.attempts,
      reason: result.reason,
      status: result.status,
    };

    if (result.ok) {
      stats.checkedExternalLinks.push(entry);
      continue;
    }

    if (result.skipped) {
      stats.skippedExternalLinks.push(entry);
      continue;
    }

    stats.invalidExternalLinks.push(entry);
    addInvalidLink(stats, {
      ...entry,
      type: 'external',
    });
  }
}

function groupExternalLinkCandidates(candidates) {
  const groups = new Map();

  for (const candidate of candidates) {
    const entries = groups.get(candidate.target) ?? [];

    entries.push(candidate);
    groups.set(candidate.target, entries);
  }

  return groups;
}

async function checkExternalTarget(
  target,
  { fetchImpl, retries, retryDelayMs, timeoutMs },
) {
  const attempts = Math.max(1, retries + 1);
  let lastResult = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    lastResult = await fetchExternalTarget(target, {
      fetchImpl,
      timeoutMs,
    });

    if (lastResult.ok || lastResult.skipped) {
      return { ...lastResult, attempts: attempt };
    }

    if (attempt < attempts && retryDelayMs > 0) {
      await wait(retryDelayMs);
    }
  }

  return {
    ...(lastResult ?? {
      ok: false,
      reason: 'external-check-failed',
      skipped: false,
      status: 0,
    }),
    attempts,
  };
}

async function fetchExternalTarget(target, { fetchImpl, timeoutMs }) {
  const headResult = await requestExternalTarget(target, {
    fetchImpl,
    method: 'HEAD',
    timeoutMs,
  });

  if (headResult.status !== 405 && headResult.status !== 501) {
    return headResult;
  }

  return requestExternalTarget(target, {
    fetchImpl,
    method: 'GET',
    timeoutMs,
  });
}

async function requestExternalTarget(target, { fetchImpl, method, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(target, {
      method,
      redirect: 'follow',
      signal: controller.signal,
    });
    const status = response.status ?? 0;

    return classifyExternalStatus(status);
  } catch (error) {
    return {
      ok: false,
      reason:
        error?.name === 'AbortError'
          ? 'external-request-timeout'
          : 'external-request-error',
      skipped: false,
      status: 0,
    };
  } finally {
    clearTimeout(timeout);
  }
}

function classifyExternalStatus(status) {
  if (status >= 200 && status < 400) {
    return {
      ok: true,
      reason: `external-http-${status}`,
      skipped: false,
      status,
    };
  }

  if (status === 401 || status === 403 || status === 429) {
    return {
      ok: false,
      reason: `external-http-${status}-not-actionable`,
      skipped: true,
      status,
    };
  }

  return {
    ok: false,
    reason: `external-http-${status || 'unknown'}`,
    skipped: false,
    status,
  };
}

function normalizeAllowlistPatterns(allowlist) {
  return allowlist.map((pattern) => pattern.trim()).filter(Boolean);
}

function getAllowlistMatch(target, allowlistPatterns) {
  if (allowlistPatterns.length === 0) {
    return '';
  }

  let parsedTarget;

  try {
    parsedTarget = new URL(target);
  } catch {
    return '';
  }

  const host = parsedTarget.hostname.toLowerCase();

  for (const pattern of allowlistPatterns) {
    const normalizedPattern = pattern.toLowerCase();

    if (normalizedPattern.includes('://')) {
      if (target.toLowerCase().startsWith(normalizedPattern)) {
        return pattern;
      }
      continue;
    }

    if (normalizedPattern.startsWith('*.')) {
      const suffix = normalizedPattern.slice(2);

      if (host === suffix || host.endsWith(`.${suffix}`)) {
        return pattern;
      }
      continue;
    }

    if (host === normalizedPattern) {
      return pattern;
    }
  }

  return '';
}

function cleanMarkdownHref(rawHref) {
  const trimmed = rawHref.trim();

  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    return trimmed.slice(1, -1);
  }

  return trimmed.split(/\s+/)[0] ?? '';
}

function splitHref(href) {
  const hashIndex = href.indexOf('#');
  const beforeHash = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : href.slice(hashIndex);
  const searchIndex = beforeHash.indexOf('?');

  if (searchIndex === -1) {
    return { path: beforeHash, search: '', hash };
  }

  return {
    path: beforeHash.slice(0, searchIndex),
    search: beforeHash.slice(searchIndex),
    hash,
  };
}

function toCleanRoute(contentPath, parsed) {
  const segments = contentPath.split('/').filter(Boolean);
  const [locale, tab, ...rest] = segments;
  const fileName = rest.at(-1);

  if (!locale || !tab || !fileName) {
    return '';
  }

  const slugSegments =
    fileName === 'index.md' || fileName === 'index.mdx'
      ? rest.slice(0, -1)
      : [...rest.slice(0, -1), fileName.replace(/\.mdx?$/i, '')];
  const slugPath = [tab, ...slugSegments].filter(Boolean).join('/');

  return `/${locale}/${slugPath}${parsed.search}${parsed.hash}`;
}

function getRoutePath(contentPath) {
  return splitHref(toCleanRoute(contentPath, { hash: '', search: '' })).path;
}

export function getOpenApiRoutePathsForAudit() {
  return getOpenApiRouteLanesForAudit().flatMap((lane) =>
    lane.locales.flatMap((locale) =>
      lane.routeLeaves.map(
        (routeLeaf) => `/${locale}/${lane.routePrefix}/${routeLeaf}`,
      ),
    ),
  );
}

const SUPPORTED_LOCALES = ['en', 'zh-CN'];

function getOpenApiRouteLanesForAudit() {
  const lanesPath = path.join(process.cwd(), 'src/lib/openapi/lanes.ts');
  const source = fs.readFileSync(lanesPath, 'utf8');

  return extractTopLevelObjects(source).map((block) => {
    const routePrefix = block.match(/routePrefix:\s*'([^']+)'/)?.[1];
    const locales =
      block
        .match(/locales:\s*\[([^\]]+)\]/)?.[1]
        ?.match(/'([^']+)'/g)
        ?.map((value) => value.slice(1, -1)) ?? SUPPORTED_LOCALES;
    const operationsBlock = extractObjectProperty(block, 'operations');
    const routeLeaves = [
      ...operationsBlock.matchAll(/routeLeaf:\s*'([^']+)'/g),
    ].map((match) => match[1]);

    if (!routePrefix || routeLeaves.length === 0) {
      throw new Error(
        'Failed to parse OpenAPI route lane from src/lib/openapi/lanes.ts',
      );
    }

    return { locales, routePrefix, routeLeaves };
  });
}

function extractTopLevelObjects(raw) {
  const start = raw.indexOf('export const OPENAPI_LANES = [');
  if (start < 0) return [];
  const arrayStart = raw.indexOf('[', start);
  const arrayEnd = raw.indexOf('] as const', arrayStart);
  const body = raw.slice(arrayStart + 1, arrayEnd);
  const objects = [];
  let depth = 0;
  let objectStart = -1;
  let inString = false;
  let stringQuote = '';
  let escaped = false;

  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === stringQuote) {
        inString = false;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === '{') {
      if (depth === 0) objectStart = index;
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0 && objectStart >= 0) {
        objects.push(body.slice(objectStart, index + 1));
        objectStart = -1;
      }
    }
  }

  return objects;
}

function extractObjectProperty(raw, propertyName) {
  const propIndex = raw.indexOf(`${propertyName}:`);
  if (propIndex < 0) return '';
  const start = raw.indexOf('{', propIndex);
  if (start < 0) return '';
  let depth = 0;
  let inString = false;
  let stringQuote = '';
  let escaped = false;

  for (let index = start; index < raw.length; index += 1) {
    const char = raw[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === stringQuote) {
        inString = false;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return raw.slice(start, index + 1);
    }
  }

  return '';
}

function isIntentionallyHostedReference(routePath) {
  return HOSTED_REFERENCE_ROUTE_PREFIXES.some(
    (prefix) => routePath === prefix || routePath.startsWith(`${prefix}/`),
  );
}

const HOSTED_REFERENCE_ROUTE_PREFIXES = [
  '/en/api-reference/rtc/android',
  '/en/api-reference/whiteboard',
];

const KNOWN_REDIRECT_ROUTES = {
  '/en/api-reference/conversational-ai/rest-api':
    '/en/api-reference/api-ref/conversational-ai',
  '/en/api-reference/conversational-ai/rest-api/authentication':
    '/en/api-reference/api-ref/conversational-ai/authentication',
  '/en/api-reference/conversational-ai/rest-api/status-codes':
    '/en/api-reference/api-ref/conversational-ai/status-codes',
  '/en/api-reference/voice-ai-recipes': '/en/api-reference/recipes',
  '/en/api-reference/recipes/python-quickstart':
    'virtual:/en/api-reference/recipes#python-quickstart',
  '/en/api-reference/recipes/golang-quickstart':
    'virtual:/en/api-reference/recipes#golang-quickstart',
  '/en/realtime-media/rtc': 'virtual:/en/realtime-media/rtc',
  '/en/api-reference/api-ref/video': '/en/api-reference/api-ref/rtc',
  '/en/api-reference/api-ref/voice': '/en/api-reference/api-ref/rtc',
  '/en/extensions-marketplace/develop/implement/provisioning':
    '/en/api-reference/api-ref/extensions-marketplace/provisioning',
};

function normalizeLegacyRootDocsHref(href) {
  const indexHref = normalizeIndexDocsHref(href);

  if (indexHref !== href) {
    return indexHref;
  }

  const parsed = splitHref(href);
  const segments = parsed.path.split('/').filter(Boolean);
  const [locale, group, leaf] = segments;

  if ((locale === 'en' || locale === 'zh-CN') && group && leaf) {
    const mappedPath = getLegacyLocalePath(locale, group, leaf, segments);

    if (mappedPath) {
      return `${mappedPath}${parsed.search}${parsed.hash}`;
    }
  }

  const mappedAbsolutePath = LEGACY_ABSOLUTE_PATHS[parsed.path];

  if (mappedAbsolutePath) {
    return `${mappedAbsolutePath}${parsed.search}${parsed.hash}`;
  }

  return href;
}

function getLegacyLocalePath(locale, group, leaf, segments) {
  if (group === 'api-reference' && leaf === 'conversational-ai') {
    return getLegacyConversationalAiRestApiPath(locale, segments);
  }

  if (group === 'operations') {
    const routeLeaf = LEGACY_OPERATION_ROUTE_LEAVES[leaf];

    if (routeLeaf) {
      return `/${locale}/api-reference/api-ref/conversational-ai/${routeLeaf}`;
    }
  }

  if (group === 'user-guides') {
    return LEGACY_USER_GUIDE_PATHS[leaf]?.(locale);
  }

  if (group === 'get-started') {
    return LEGACY_GET_STARTED_PATHS[leaf]?.(locale);
  }

  if (group === 'ai' && leaf === 'openai-realtime') {
    return `/${locale}/ai/reference/openai-realtime-integration`;
  }

  return null;
}

function getLegacyConversationalAiRestApiPath(locale, segments) {
  if (segments[3] !== 'rest-api') {
    return null;
  }

  if (!segments[4]) {
    return `/${locale}/api-reference/api-ref/conversational-ai`;
  }

  if (segments[4] === 'agent' && segments[5]) {
    return `/${locale}/api-reference/api-ref/conversational-ai/${segments[5]}`;
  }

  return `/${locale}/api-reference/api-ref/conversational-ai/${segments[4]}`;
}

const LEGACY_OPERATION_ROUTE_LEAVES = {
  'agent-interrupt': 'interrupt',
  'agent-speak': 'speak',
  'agent-think': 'think',
  'agent-update': 'update',
  'get-agent-list': 'list',
  'get-history': 'history',
  'get-turns': 'turns',
  'query-agent-status': 'query',
  'start-agent': 'join',
  'stop-agent': 'leave',
};

const LEGACY_USER_GUIDE_PATHS = {
  'custom-data': (locale) => `/${locale}/ai/custom-data`,
  'realtime-sub': (locale) => `/${locale}/ai/realtime-sub`,
  'short-term-memory': (locale) => `/${locale}/ai/short-term-memory`,
};

const LEGACY_GET_STARTED_PATHS = {
  'enable-service': (locale) =>
    locale === 'zh-CN'
      ? '/zh-CN/ai/enable-service'
      : '/en/ai/reference/enable-conversational-ai',
};

const LEGACY_ABSOLUTE_PATHS = {
  '/doc/convoai/restful/webhook/ncs-events': '/zh-CN/api-reference/ncs-events',
  '/en/sdks': '/en/api-reference/sdks',
  '/api-reference': '/en/api-reference',
  '/conversational-ai/develop/managed-mode':
    '/en/ai/build/custom-model-integration/presets',
  '/extensions-marketplace/get-started/quickstart-implement':
    '/en/api-reference/api-ref/extensions-marketplace/provisioning',
  '/help/account-and-billing/billing_account':
    '/en/realtime-media/video/account-settlement',
  '/help/integration-issues/token_cohost':
    '/en/realtime-media/video/build/authenticate-users/deploy-token-server',
  '/help/integration-issues/token_related_issues':
    '/en/realtime-media/video/build/authenticate-users/deploy-token-server',
  '/en/api-reference/media-push': '/en/api-reference/api-ref/media-push',
  '/en/api-reference/rtc': '/en/api-reference/api-ref/rtc',
  '/en/realtime-media/sdks': '/en/api-reference/sdks',
  '/en/realtime-media/voice/build': '/en/realtime-media/voice/quickstart',
  '/en/realtime-media/voice/build/core-concepts':
    '/en/realtime-media/voice/core-concepts',
  '/en/realtime-media/voice/build/control-audio-and-devices/custom-audio':
    '/en/realtime-media/voice/build/customize-audio-processing/custom-audio',
  '/en/realtime-media/voice/build/secure-and-protect-channels/use-tokens':
    '/en/realtime-media/voice/build/set-up-token-authentication/use-tokens',
  '/en/realtime-media/voice/product-overview': '/en/realtime-media/voice',
  '/en/realtime-media/video/build/add-advanced-video-features/app-size-optimization':
    '/en/realtime-media/video/build/optimize-and-operate/app-size-optimization',
  '/en/realtime-media/video/build/core-concepts':
    '/en/realtime-media/video/core-concepts',
  '/en/realtime-media/video/build/manage-agora-account':
    '/en/realtime-media/video/manage-agora-account',
  '/en/realtime-media/video/build/optimize-and-operate/screen-sharing':
    '/en/realtime-media/video/build/capture-and-render-video/screen-sharing',
  '/en/realtime-media/video/build/secure-and-protect-channels/authentication-workflow':
    '/en/realtime-media/video/build/authenticate-users/authentication-workflow',
  '/en/3.x/video-calling/introduction/release-notes':
    '/en/realtime-media/video/reference/release-notes',
  '/media-push/product-overview': '/en/api-reference/api-ref/rtc',
  '/sdks': '/en/api-reference/sdks',
  '/video-calling/get-started/get-started-sdk':
    '/en/realtime-media/video/quickstart',
  '/video-calling/token-authentication/authentication-workflow':
    '/en/realtime-media/video/build/authenticate-users/authentication-workflow',
  '/video-calling/token-authentication/deploy-token-server':
    '/en/realtime-media/video/build/authenticate-users/deploy-token-server',
};

function normalizeIndexDocsHref(href) {
  const parsed = splitHref(href);

  if (!parsed.path.endsWith('/index')) {
    return href;
  }

  const path = parsed.path.slice(0, -'/index'.length) || '/';

  return `${path}${parsed.search}${parsed.hash}`;
}

function toContentPath(docsRoot, filePath) {
  return path.relative(docsRoot, filePath).split(path.sep).join(path.posix.sep);
}

export function formatReport(stats, maxSamples) {
  const lines = [
    '# Docs Link Audit',
    '',
    `docsFiles: ${stats.docsFiles}`,
    `totalLinks: ${stats.totalLinks}`,
    `relativeMarkdownLinks: ${stats.relativeMarkdownLinks.length}`,
    `resolvedRelativeMarkdownLinks: ${stats.resolvedRelativeMarkdownLinks.length}`,
    `missingRelativeMarkdownLinks: ${stats.missingRelativeMarkdownLinks.length}`,
    `legacyRootDocLinks: ${stats.legacyRootDocLinks.length}`,
    `rootLinks: ${stats.rootLinks.length}`,
    `skippedRootLinks: ${stats.skippedRootLinks.length}`,
    `missingRootLinks: ${stats.missingRootLinks.length}`,
    `hashLinks: ${stats.hashLinks}`,
    `validHashLinks: ${stats.validHashLinks.length}`,
    `missingHashLinks: ${stats.missingHashLinks.length}`,
    `invalidInternalLinks: ${stats.invalidInternalLinks.length}`,
    `externalLinks: ${stats.externalLinks}`,
    `checkedExternalLinks: ${stats.checkedExternalLinks.length}`,
    `skippedExternalLinks: ${stats.skippedExternalLinks.length}`,
    `invalidExternalLinks: ${stats.invalidExternalLinks.length}`,
    `assetLinks: ${stats.assetLinks}`,
    `relativeAssetLinks: ${stats.relativeAssetLinks}`,
  ];

  appendInvalidSection(
    lines,
    'Invalid internal links',
    stats.invalidInternalLinks,
    maxSamples,
  );
  appendInvalidSection(
    lines,
    'Invalid external links',
    stats.invalidExternalLinks,
    maxSamples,
  );
  appendSection(
    lines,
    'Sample valid relative Markdown links',
    stats.relativeMarkdownLinks,
    maxSamples,
  );
  appendSection(
    lines,
    'Sample route-resolved relative Markdown links',
    stats.resolvedRelativeMarkdownLinks,
    maxSamples,
  );
  appendSection(
    lines,
    'Sample missing relative Markdown links',
    stats.missingRelativeMarkdownLinks,
    maxSamples,
  );
  appendSection(
    lines,
    'Sample missing hash links',
    stats.missingHashLinks,
    maxSamples,
  );
  appendSection(
    lines,
    'Sample legacy /doc/* links',
    stats.legacyRootDocLinks,
    maxSamples,
  );
  appendSection(lines, 'Sample valid root links', stats.rootLinks, maxSamples);
  appendSection(
    lines,
    'Sample skipped hosted root links',
    stats.skippedRootLinks,
    maxSamples,
  );
  appendSection(
    lines,
    'Sample skipped external links',
    stats.skippedExternalLinks,
    maxSamples,
  );
  appendSection(
    lines,
    'Sample missing root links',
    stats.missingRootLinks,
    maxSamples,
  );

  return lines.join('\n');
}

function printReport(stats, maxSamples) {
  console.log(formatReport(stats, maxSamples));
}

function appendInvalidSection(lines, title, entries, maxSamples) {
  lines.push('', `## ${title}`);

  if (entries.length === 0) {
    lines.push('none');
    return;
  }

  for (const entry of entries.slice(0, maxSamples)) {
    lines.push(
      `- source: ${entry.sourcePath} | target: ${entry.target} | reason: ${entry.reason} | href: ${entry.href}`,
    );
  }

  if (entries.length > maxSamples) {
    lines.push(`- ... ${entries.length - maxSamples} more`);
  }
}

function appendSection(lines, title, entries, maxSamples) {
  lines.push('', `## ${title}`);

  if (entries.length === 0) {
    lines.push('none');
    return;
  }

  for (const entry of entries.slice(0, maxSamples)) {
    lines.push(formatAuditEntry(entry));
  }

  if (entries.length > maxSamples) {
    lines.push(`- ... ${entries.length - maxSamples} more`);
  }
}

function formatAuditEntry(entry) {
  if ('targetPath' in entry) {
    const resolvedTarget =
      entry.resolvedTargetPath && entry.resolvedTargetPath !== entry.targetPath
        ? `, resolved: ${entry.resolvedTargetPath}`
        : '';

    return `- ${entry.sourcePath}: ${entry.href} => ${entry.normalizedHref} (${entry.targetPath}${resolvedTarget})`;
  }

  if ('resolvedTargetPath' in entry) {
    const resolvedTarget = entry.resolvedTargetPath
      ? ` (${entry.resolvedTargetPath})`
      : '';

    return `- ${entry.sourcePath}: ${entry.href} => ${entry.normalizedHref}${resolvedTarget}`;
  }

  if ('target' in entry && 'reason' in entry) {
    return `- ${entry.sourcePath}: ${entry.href} => ${entry.target} (${entry.reason})`;
  }

  return `- ${entry.sourcePath}: ${entry.href}`;
}

function parseArgs(args) {
  return {
    checkExternal: args.includes('--check-external'),
    externalAllowlist: parseListArg(args, '--external-allowlist='),
    externalAllowlistFile:
      args
        .find((arg) => arg.startsWith('--external-allowlist-file='))
        ?.split('=')[1] ?? '',
    externalConcurrency: parseNumberArg(
      args,
      '--external-concurrency=',
      DEFAULT_EXTERNAL_CONCURRENCY,
    ),
    externalRetries: parseNumberArg(
      args,
      '--external-retries=',
      DEFAULT_EXTERNAL_RETRIES,
    ),
    externalRetryDelayMs: parseNumberArg(
      args,
      '--external-retry-delay=',
      DEFAULT_EXTERNAL_RETRY_DELAY_MS,
    ),
    externalTimeoutMs: parseNumberArg(
      args,
      '--external-timeout=',
      DEFAULT_EXTERNAL_TIMEOUT_MS,
    ),
    failOnInvalid: args.includes('--fail-on-invalid'),
    failOnMissing: args.includes('--fail-on-missing'),
    maxSamples: parseNumberArg(args, '--max-samples=', DEFAULT_MAX_SAMPLES),
    overviewCards: args.includes('--overview-cards'),
  };
}

function parseNumberArg(args, prefix, fallback) {
  const parsed = Number.parseInt(
    args.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) ??
      `${fallback}`,
    10,
  );

  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseListArg(args, prefix) {
  return args
    .filter((arg) => arg.startsWith(prefix))
    .flatMap((arg) => arg.slice(prefix.length).split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}

function readAllowlistFile(filePath) {
  if (!filePath) {
    return [];
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

async function main() {
  const repoRoot = process.cwd();
  const docsRoot = path.join(repoRoot, 'content', 'docs');
  const options = parseArgs(process.argv.slice(2));
  const stats = auditDocsLinks({
    docsRoot,
    ...(options.overviewCards
      ? { sourcePaths: OVERVIEW_CARD_SOURCE_PATHS }
      : {}),
  });

  if (options.checkExternal) {
    await checkExternalLinks(stats, {
      allowlist: [
        ...options.externalAllowlist,
        ...readAllowlistFile(options.externalAllowlistFile),
      ],
      concurrency: options.externalConcurrency,
      retries: options.externalRetries,
      retryDelayMs: options.externalRetryDelayMs,
      timeoutMs: options.externalTimeoutMs,
    });
  }

  printReport(stats, options.maxSamples);

  if (
    options.failOnInvalid &&
    (stats.invalidInternalLinks.length > 0 ||
      stats.invalidExternalLinks.length > 0)
  ) {
    process.exitCode = 1;
    return;
  }

  if (
    options.failOnMissing &&
    (stats.missingRelativeMarkdownLinks.length > 0 ||
      (options.overviewCards && stats.missingRootLinks.length > 0))
  ) {
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
