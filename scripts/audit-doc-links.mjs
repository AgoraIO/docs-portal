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
const ROUTE_GROUP_SEGMENT = /^\(.+\)$/;
const OVERVIEW_CARD_SOURCE_PATHS = [
  'en/introduction/index.mdx',
  'en/ai/index.mdx',
  'en/realtime-media/overview.mdx',
  'en/api-reference/index.mdx',
];

/**
 * @typedef {object} AuditDocsLinksOptions
 * @property {string} [docsRoot]
 * @property {string} [openApiRoot]
 * @property {string[]} [sourcePaths]
 * @property {string[]} [openApiSourcePaths]
 */

/**
 * @param {AuditDocsLinksOptions} [options]
 */
export function auditDocsLinks({
  docsRoot = path.join(process.cwd(), 'content', 'docs'),
  openApiRoot = getDefaultOpenApiRoot(docsRoot),
  sourcePaths,
  openApiSourcePaths,
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
  const openApiSourcePathFilter = openApiSourcePaths
    ? new Set(openApiSourcePaths)
    : null;

  for (const filePath of docsFiles) {
    const sourcePath = toContentPath(docsRoot, filePath);

    if (
      openApiSourcePathFilter ||
      (sourcePathFilter && !sourcePathFilter.has(sourcePath))
    ) {
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

  if (
    (!sourcePathFilter || openApiSourcePathFilter) &&
    fs.existsSync(openApiRoot)
  ) {
    const openApiFiles = listOpenApiYamlFiles(openApiRoot);
    const openApiSourceContexts = getOpenApiSourceContexts();

    for (const filePath of openApiFiles) {
      const sourcePath = toOpenApiSourcePath(openApiRoot, filePath);

      if (
        openApiSourcePathFilter &&
        !openApiSourcePathFilter.has(sourcePath)
      ) {
        continue;
      }

      const sourceContextPath =
        openApiSourceContexts.get(sourcePath) ?? sourcePath;
      const yaml = fs.readFileSync(filePath, 'utf8');
      const links = extractLinks(yaml);

      stats.openapiFiles += 1;
      stats.totalLinks += links.length;

      for (const link of links) {
        classifyLink(sourcePath, link, {
          docsPageIndex,
          existingContentPaths,
          existingRoutePaths,
          stats,
          sourceContextPath,
        });
      }
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
    legacyShengwangDocHostLinks: [],
    openapiFiles: 0,
    apiReferenceMacroLinks: [],
    missingHashLinks: [],
    missingRootLinks: [],
    missingRelativeMarkdownLinks: [],
    relativeAssetLinks: 0,
    relativeMarkdownLinks: [],
    resolvedRelativeMarkdownLinks: [],
    rootLinks: [],
    skippedExternalLinks: [],
    skippedRootLinks: [],
    skippedTemplateLinks: [],
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

  for (const [routePath, entry] of getStaticRedirectRoutePaths()) {
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
    const routePath = getRoutePath(`${directoryContentPath}/index.mdx`);

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

function getDefaultOpenApiRoot(docsRoot) {
  return path.join(path.dirname(docsRoot), 'openapi');
}

function listOpenApiYamlFiles(root) {
  const results = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      results.push(...listOpenApiYamlFiles(fullPath));
      continue;
    }

    if (/\.ya?ml$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }

  return results.sort();
}

function toOpenApiSourcePath(openApiRoot, filePath) {
  return path
    .join(path.basename(openApiRoot), path.relative(openApiRoot, filePath))
    .split(path.sep)
    .join(path.posix.sep);
}

function extractLinks(markdown) {
  const links = [];
  const markdownLinkPattern = /(!?)\[[\s\S]*?\]\((<[^>\n]+>|[^)\n]+)\)/g;
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
  {
    docsPageIndex,
    existingContentPaths,
    existingRoutePaths,
    stats,
    sourceContextPath = sourcePath,
  },
) {
  const href = link.href.trim();
  const parsedHref = splitHref(href);

  if (isApiReferenceMacroHref(href)) {
    stats.apiReferenceMacroLinks.push({
      href,
      reason: 'api-reference-macro',
      source: link.source,
      sourcePath,
    });
    return;
  }

  if (isTemplatedHref(href)) {
    stats.skippedTemplateLinks.push({
      href,
      reason: 'templated-href',
      source: link.source,
      sourcePath,
    });
    return;
  }

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
    if (sourcePath.startsWith('openapi/')) {
      return;
    }

    validateHashLink({
      docsPageIndex,
      entry: {
        href,
        normalizedHref: href,
        resolved: true,
        resolvedTargetPath: sourceContextPath,
        source: link.source,
        sourcePath,
      },
      hash: parsedHref.hash,
      link,
      stats,
    });
    return;
  }

  if (
    isZhCnOpenApiSourcePath(sourcePath) &&
    isLegacyShengwangDocHostHref(href)
  ) {
    const entry = {
      href,
      reason: 'legacy-shengwang-doc-host',
      source: link.source,
      sourcePath,
      target: href,
    };

    stats.legacyShengwangDocHostLinks.push(entry);
    addInvalidLink(stats, {
      ...entry,
      type: 'internal',
    });
    return;
  }

  if (href.startsWith('//')) {
    addExternalLinkCandidate(sourcePath, link, stats);
    return;
  }

  if (href.startsWith('/') && isRootAssetHref(parsedHref.path)) {
    stats.assetLinks += 1;
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
    const entry = resolveRootLink(sourceContextPath, href, existingRoutePaths);

    entry.source = link.source;
    entry.sourcePath = sourcePath;

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
    sourceContextPath,
    href,
    parsed,
    existingContentPaths,
    existingRoutePaths,
  );

  entry.source = link.source;
  entry.sourcePath = sourcePath;

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
  const normalizedHref = normalizeDocsRouteHref(href, { sourcePath });
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

  const staticRedirectEntry = getStaticRedirectRouteEntry(
    routePath,
    parsed.search,
  );

  if (staticRedirectEntry) {
    return {
      ...entry,
      resolved: true,
      resolvedTargetPath: staticRedirectEntry.resolvedTargetPath,
      resolution: staticRedirectEntry.resolution,
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

  if (isKnownLegacyHostedLink(entry) || isIntentionallyHostedReference(routePath)) {
    return {
      ...entry,
      resolved: true,
      resolvedTargetPath: `hosted:${routePath}`,
      resolution: 'hosted-reference',
      skipped: true,
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
  const normalizedHref = normalizeDocsRouteHref(
    toCleanRoute(
      existingTargetPath ?? getFallbackRelativeTargetPath(targetPath),
      parsed,
    ),
    { sourcePath: existingTargetPath ?? targetPath },
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

  if (isKnownLegacyHostedLink(entry) || isIntentionallyHostedReference(routePath)) {
    return {
      ...entry,
      resolved: true,
      resolvedTargetPath: `hosted:${routePath}`,
      resolution: 'hosted-reference',
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

  if (isGeneratedOrRedirectedAnchor(entry, targetPage)) {
    stats.validHashLinks.push({
      ...hashEntry,
      anchor: hashAnchor,
      resolvedTargetPath: targetPage.contentPath,
      resolution: 'generated-anchor',
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

const KNOWN_LEGACY_HASH_LINKS = new Set([
  "en/ai/best-practices/record-agent-conversation.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/ai/build/custom-model-integration/presets.mdx\u0000/en/api-reference/api-ref/conversational-ai/authentication#implement-basic-http-authentication",
  "en/ai/build/custom-model-integration/presets.mdx\u0000/en/api-reference/api-ref/conversational-ai/authentication#implement-token-authentication",
  "en/api-reference/api-ref/agora-analytics/analytics-rest-api.md\u0000#20quality",
  "en/api-reference/api-ref/agora-analytics/analytics-rest-api.md\u0000#20scale",
  "en/api-reference/api-ref/agora-analytics/analytics-rest-api.md\u0000#realtimequality",
  "en/api-reference/api-ref/agora-analytics/analytics-rest-api.md\u0000#realtimescale",
  "en/api-reference/api-ref/agora-analytics/analytics-rest-api.md\u0000/en/realtime-media/agora-analytics/reference/billing-policies#how-does-agora-calculate-service-minutes",
  "en/api-reference/api-ref/broadcast-streaming/stream-transfer.mdx\u0000#patch",
  "en/api-reference/api-ref/flexible-classroom/classroom-rest-api.mdx\u0000#get-classroom-events",
  "en/api-reference/api-ref/flexible-classroom/classroom-sdk.mdx\u0000#agoraedumediaencryptionconfigs",
  "en/api-reference/api-ref/flexible-classroom/classroom-sdk.mdx\u0000#agoraeduregionstr",
  "en/api-reference/api-ref/im/chat-group-management/create-delete-retrieve-groups.md\u0000#Modify",
  "en/api-reference/api-ref/im/chat-group-management/create-delete-retrieve-groups.md\u0000#code",
  "en/api-reference/api-ref/im/chat-group-management/create-delete-retrieve-groups.md\u0000#param",
  "en/api-reference/api-ref/im/chat-group-management/create-delete-retrieve-groups.md\u0000#pubparam",
  "en/api-reference/api-ref/im/chat-group-management/create-delete-retrieve-groups.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/chat-group-management/create-delete-retrieve-groups.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-allowlist.md\u0000#param",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-allowlist.md\u0000/en/api-reference/api-ref/im/chat-group-management/manage-group-mutelist#muting-all-chat-group-members",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-allowlist.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-allowlist.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-announcement-files.md\u0000#code",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-announcement-files.md\u0000#getall",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-announcement-files.md\u0000#param",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-announcement-files.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-announcement-files.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-blocklist.md\u0000#code",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-blocklist.md\u0000#param",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-blocklist.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-blocklist.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-members.md\u0000#code",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-members.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-members.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-mutelist.md\u0000#param",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-mutelist.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/chat-group-management/manage-group-mutelist.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-admins.md\u0000#code",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-admins.md\u0000#param",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-admins.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-admins.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-allowlist.md\u0000#param",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-allowlist.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes.md\u0000#force",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes.md\u0000#param",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-blocklist.md\u0000#code",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-blocklist.md\u0000#param",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-blocklist.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-members.md\u0000#code",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-members.md\u0000#param",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-members.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-members.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-mutelist.md\u0000#code",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-mutelist.md\u0000#param",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-mutelist.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-mutelist.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatrooms.md\u0000#code",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatrooms.md\u0000#getall",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatrooms.md\u0000#param",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatrooms.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatrooms.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/contact-management.md\u0000#code",
  "en/api-reference/api-ref/im/contact-management.md\u0000#param",
  "en/api-reference/api-ref/im/contact-management.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/global-mute.md\u0000#param",
  "en/api-reference/api-ref/im/global-mute.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/global-mute.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/index.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/message-management.md\u0000#body",
  "en/api-reference/api-ref/im/message-management.md\u0000#download",
  "en/api-reference/api-ref/im/message-management.md\u0000#param",
  "en/api-reference/api-ref/im/message-management.md\u0000#request",
  "en/api-reference/api-ref/im/message-management.md\u0000#sendmessage",
  "en/api-reference/api-ref/im/message-management.md\u0000#upload",
  "en/api-reference/api-ref/im/message-management.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/message-management.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/offline-push/offline-push-configuration.mdx\u0000#param",
  "en/api-reference/api-ref/im/offline-push/offline-push-configuration.mdx\u0000#request",
  "en/api-reference/api-ref/im/offline-push/offline-push-configuration.mdx\u0000#response",
  "en/api-reference/api-ref/im/offline-push/offline-push-configuration.mdx\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/offline-push/offline-push-configuration.mdx\u0000/en/api-reference/api-ref/im/user-system-registration#unban",
  "en/api-reference/api-ref/im/offline-push/offline-push-configuration.mdx\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/presence.md\u0000#param",
  "en/api-reference/api-ref/im/presence.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/presence.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/push-notification-management.mdx\u0000#param",
  "en/api-reference/api-ref/im/push-notification-management.mdx\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/push-notification-management.mdx\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/reaction.md\u0000#create",
  "en/api-reference/api-ref/im/reaction.md\u0000#param",
  "en/api-reference/api-ref/im/reaction.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/reaction.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md\u0000#auth",
  "en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md\u0000#request",
  "en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md\u0000#response",
  "en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/thread-management/create-delete-retrieve-threads.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/thread-management/manage-thread-members.md\u0000#auth",
  "en/api-reference/api-ref/im/thread-management/manage-thread-members.md\u0000#request",
  "en/api-reference/api-ref/im/thread-management/manage-thread-members.md\u0000#response",
  "en/api-reference/api-ref/im/thread-management/manage-thread-members.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/thread-management/manage-thread-members.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/user-attributes-management.md\u0000#param",
  "en/api-reference/api-ref/im/user-attributes-management.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/user-attributes-management.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/im/user-system-registration.md\u0000#code",
  "en/api-reference/api-ref/im/user-system-registration.md\u0000#param",
  "en/api-reference/api-ref/im/user-system-registration.md\u0000#unban",
  "en/api-reference/api-ref/im/user-system-registration.md\u0000/en/api-reference/api-ref/im/limitations#call-limit-of-server-sides",
  "en/api-reference/api-ref/im/user-system-registration.md\u0000/en/realtime-media/im/get-started/enable#get-the-information-of-the-agora-chat-project",
  "en/api-reference/api-ref/media-pull/index.md\u0000/en/realtime-media/media-pull/build/manage-agora-account#generate-a-temporary-tokens",
  "en/api-reference/api-ref/server-sdk/python.mdx\u0000#anthropic-1",
  "en/api-reference/api-ref/server-sdk/python.mdx\u0000#avatar-vendors-1",
  "en/api-reference/api-ref/server-sdk/python.mdx\u0000#azureopenai-1",
  "en/api-reference/api-ref/server-sdk/python.mdx\u0000#builder-methods-1",
  "en/api-reference/api-ref/server-sdk/python.mdx\u0000#gemini-1",
  "en/api-reference/api-ref/server-sdk/python.mdx\u0000#openai-1",
  "en/api-reference/api-ref/server-sdk/python.mdx\u0000#start-1",
  "en/api-reference/api-ref/server-sdk/python.mdx\u0000#stt-vendors-1",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#configlinkstateeven-t",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#configlockeven-t",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#configmessageeven-t",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#configpresenceeven-t",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#configstorageeven-t",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#configtopiceven-t",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvareacod-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvchanneltyp-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvconnectionreaso-n",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvconnectionstat-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvencryptionmod-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvlinkoperatio-n",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvlinkstat-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvlinkstatereaso-n",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvlocktyp-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvlogleve-l",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvmessageqo-s",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvmessagetyp-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvpresencetyp-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvpriorit-y",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvprotocoltyp-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvproxytyp-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvrtmservicetyp-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvstorageeventtyp-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvstoragetyp-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#enumvtopictyp-e",
  "en/api-reference/api-ref/signaling/android.mdx\u0000#storagemetadat-a",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#configlinkstateeven-t",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvareacod-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvchanneltyp-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvencryptionmod-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvlinkoperatio-n",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvlinkstat-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvlinkstatereaso-n",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvlocktyp-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvlogleve-l",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvmessageqo-s",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvmessagetyp-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvpresencetyp-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvpriorit-y",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvprotocoltyp-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvproxytyp-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvrtmservicetyp-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvstorageeventtyp-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvstoragetyp-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#enumvtopictyp-e",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000#storagemetadataite-m",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#configlinkstateeven-t",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvareacod-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvchanneltyp-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvencryptionmod-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvlinkoperatio-n",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvlinkstat-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvlinkstatereaso-n",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvlocktyp-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvlogleve-l",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvmessagepriorit-y",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvmessageqo-s",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvpresencetyp-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvprotocoltyp-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvproxytyp-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvrtmservicetyp-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvstorageeventtyp-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvstoragetyp-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#enumvtopictyp-e",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000#storagemetadat-a",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#configlinkstateeven-t",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#configlockeven-t",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#configmessageeven-t",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#configpresenceeven-t",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#configstorageeven-t",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#configtopiceven-t",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvareacod-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvchanneltyp-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvconnectionreaso-n",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvconnectionstat-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvencryptionmod-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvlinkoperatio-n",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvlinkstat-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvlinkstatereaso-n",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvlocktyp-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvlogleve-l",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvmessagepriorit-y",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvmessageqo-s",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvmessagetyp-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvpresencetyp-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvprotocoltyp-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvproxytyp-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvrtmservicetyp-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvstorageeventtyp-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvstoragetyp-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#enumvtopictyp-e",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000#storagemetadat-a",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#configlinkstateeven-t",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#configlockeven-t",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#configmessageeven-t",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#configpresenceeven-t",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#configstorageeven-t",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#configtopiceven-t",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvareacod-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvchanneltyp-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvconnectionreaso-n",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvconnectionstat-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvencryptionmod-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvlinkoperatio-n",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvlinkstat-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvlinkstatereaso-n",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvlocktyp-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvlogleve-l",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvmessageqo-s",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvpresencetyp-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvpriorit-y",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvprotocoltyp-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvproxytyp-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvrtmservicetyp-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvstorageeventtyp-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvstoragetyp-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#enumvtopictyp-e",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000#storagemetadat-a",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvareacod-e",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvchanneltyp-e",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvconnectionreaso-n",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvconnectionstat-e",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvencryptionmod-e",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvlocktyp-e",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvlogleve-l",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvmessagepriorit-y",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvmessageqo-s",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvmessagetyp-e",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvpresencetyp-e",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvproxytyp-e",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvstorageeventtyp-e",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvstoragetyp-e",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000#enumvtopictyp-e",
  "en/api-reference/api-ref/signaling/web.mdx\u0000#enumvconnectionreaso-n",
  "en/api-reference/api-ref/signaling/web.mdx\u0000#enumvconnectionstat-e",
  "en/api-reference/api-ref/signaling/web.mdx\u0000#enumvencryptionmod-e",
  "en/api-reference/api-ref/signaling/web.mdx\u0000#enumvlinkstat-e",
  "en/api-reference/api-ref/signaling/web.mdx\u0000#enumvlogleve-l",
  "en/api-reference/api-ref/signaling/web.mdx\u0000#enumvrtmservicetyp-e",
  "en/api-reference/api-ref/signaling/web.mdx\u0000#setup#eventhandlers",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#configlinkstateeven-t",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#configlockeven-t",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#configmessageeven-t",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#configpresenceeven-t",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#configstorageeven-t",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#configtopiceven-t",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvareacod-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvchanneltyp-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvconnectionreaso-n",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvconnectionstat-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvencryptionmod-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvlinkoperatio-n",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvlinkstat-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvlinkstatereaso-n",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvlocktyp-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvlogleve-l",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvmessagepriorit-y",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvmessageqo-s",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvmessagetyp-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvpresencetyp-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvprotocoltyp-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvproxytyp-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvrtmservicetyp-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvstorageeventtyp-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvstoragetyp-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#enumvtopictyp-e",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000#storagemetadat-a",
  "en/api-reference/faq/integration/console_error_web.mdx\u0000#candidate",
  "en/api-reference/faq/integration/image_enhancement.mdx\u0000#ref",
  "en/api-reference/faq/integration/restful_api_call_frequency.mdx\u0000#raiselimit",
  "en/api-reference/faq/integration/system_volume.mdx\u0000#volume-type-introduction",
  "en/api-reference/faq/product/audio_format.mdx\u0000#advanced",
  "en/api-reference/faq/product/audio_format.mdx\u0000#basic",
  "en/api-reference/faq/product/browser_support.mdx\u0000#safari",
  "en/api-reference/faq/quality/ios_bluetooth.mdx\u0000#solution",
  "en/api-reference/faq/quality/pixelated_green_video.mdx\u0000#green_sender",
  "en/api-reference/faq/quality/pixelated_green_video.mdx\u0000#pixelated_sender",
  "en/realtime-media/broadcast-streaming/build/apply-effects-and-enhancements/metakit.mdx\u0000#adding-scene-view",
  "en/realtime-media/broadcast-streaming/build/authenticate-users/deploy-token-server.mdx\u0000#api-reference",
  "en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/app-size-optimization.mdx\u0000#implementation-fields",
  "en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/app-size-optimization.mdx\u0000#subspecs-field",
  "en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/preload-channels.mdx\u0000/en/realtime-media/broadcast-streaming/reference/pricing#cost-calculation",
  "en/realtime-media/broadcast-streaming/quickstart.mdx\u0000#complete-code",
  "en/realtime-media/broadcast-streaming/quickstart.mdx\u0000#get-device-permissions",
  "en/realtime-media/broadcast-streaming/quickstart.mdx\u0000#local--tracks",
  "en/realtime-media/broadcast-streaming/quickstart.mdx\u0000#subscribe-to--events",
  "en/realtime-media/broadcast-streaming/reference/console-overview.md\u0000#generate-a-customer-id-and-customer-secret",
  "en/realtime-media/broadcast-streaming/reference/console-overview.md\u0000#prerequisites",
  "en/realtime-media/broadcast-streaming/reference/release-notes.mdx\u0000#410",
  "en/realtime-media/broadcast-streaming/reference/release-notes.mdx\u0000#issue-fixed",
  "en/realtime-media/broadcast-streaming/reference/release-notes.mdx\u0000/en/realtime-media/video/reference/pricing#ai-noise-suppression-pricing",
  "en/realtime-media/broadcast-streaming/skills.mdx\u0000#agora-mcp-server",
  "en/realtime-media/cloud-recording/build/best-practices/integration-best-practices.mdx\u0000/en/api-reference/api-ref/cloud-recording#query",
  "en/realtime-media/cloud-recording/build/best-practices/webpage-best-practices.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/realtime-media/cloud-recording/build/customize-the-recording/layout.mdx\u0000#bestfit",
  "en/realtime-media/cloud-recording/build/customize-the-recording/layout.mdx\u0000#float",
  "en/realtime-media/cloud-recording/build/customize-the-recording/layout.mdx\u0000#vertical",
  "en/realtime-media/cloud-recording/build/customize-the-recording/layout.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/realtime-media/cloud-recording/build/customize-the-recording/layout.mdx\u0000/en/api-reference/api-ref/cloud-recording#updatelayout",
  "en/realtime-media/cloud-recording/build/customize-the-recording/subscription.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/realtime-media/cloud-recording/build/customize-the-recording/subscription.mdx\u0000/en/api-reference/api-ref/cloud-recording#update",
  "en/realtime-media/cloud-recording/build/customize-the-recording/webpage-load-timeout.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#1-cloud_recording_error",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#100-rtmp_publish_status",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#1001-postpone_transcode_final_result",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#11-session_exit",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#12-session_failover",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#2-cloud_recording_warning",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#3-cloud_recording_status_update",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#30-uploader_started",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#31-uploaded",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#32-backuped",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#33-uploading_progress",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#4-cloud_recording_file_infos",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#40-recorder_started",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#41-recorder_leave",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#42-recorder_slice_start",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#43-recorder_audio_stream_state_changed",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#44-recorder_video_stream_state_changed",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#45-recorder_snapshot_file",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#60-vod_started",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#61-vod_triggered",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#70-web_recorder_started",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#71-web_recorder_stopped",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#72-web_recorder_capability_limit",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#73-web_recorder_reload",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#90-download_failed",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#clouderr",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#state",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#uploaderr",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000#uploadwarn",
  "en/realtime-media/cloud-recording/build/process-recorded-files/manage-files.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/realtime-media/cloud-recording/build/process-recorded-files/merge-files.mdx\u0000/en/api-reference/api-ref/cloud-recording#transcodingconfig",
  "en/realtime-media/cloud-recording/build/process-recorded-files/online-play.mdx\u0000/en/api-reference/api-ref/cloud-recording#stop",
  "en/realtime-media/cloud-recording/build/set-up-authentication/authentication-workflow.mdx\u0000/en/realtime-media/video/build/authenticate-users/deploy-token-server#enable-co-host-authentication",
  "en/realtime-media/cloud-recording/build/start-a-recording/composite-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#acquire",
  "en/realtime-media/cloud-recording/build/start-a-recording/composite-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#recordingconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/composite-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#recordingfileconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/composite-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/realtime-media/cloud-recording/build/start-a-recording/composite-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#stop",
  "en/realtime-media/cloud-recording/build/start-a-recording/composite-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#storageconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#acquire",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#recordingconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#recordingfileconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#stop",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#storageconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-nontranscoding.mdx\u0000/en/api-reference/api-ref/cloud-recording#acquire",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-nontranscoding.mdx\u0000/en/api-reference/api-ref/cloud-recording#recordingconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-nontranscoding.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-nontranscoding.mdx\u0000/en/api-reference/api-ref/cloud-recording#stop",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-nontranscoding.mdx\u0000/en/api-reference/api-ref/cloud-recording#storageconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-nontranscoding.mdx\u0000/en/api-reference/api-ref/cloud-recording#transcodingconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx\u0000/en/api-reference/api-ref/cloud-recording#acquire",
  "en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx\u0000/en/api-reference/api-ref/cloud-recording#recordingconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx\u0000/en/api-reference/api-ref/cloud-recording#recordingfileconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx\u0000/en/api-reference/api-ref/cloud-recording#snapshotconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx\u0000/en/api-reference/api-ref/cloud-recording#storageconfig",
  "en/realtime-media/cloud-recording/build/start-a-recording/webpage-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#acquire",
  "en/realtime-media/cloud-recording/build/start-a-recording/webpage-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/realtime-media/cloud-recording/build/start-a-recording/webpage-mode.mdx\u0000/en/api-reference/api-ref/cloud-recording#stop",
  "en/realtime-media/cloud-recording/pricing-webpage-recording.mdx\u0000/en/api-reference/api-ref/cloud-recording#extensionserviceconfig",
  "en/realtime-media/cloud-recording/reference/pricing.mdx\u0000/en/realtime-media/cloud-recording/reference/billing-policies#agoras-free-of-charge-policy-for-the-first-10000-minutes",
  "en/realtime-media/cloud-recording/reference/pricing.mdx\u0000/en/realtime-media/cloud-recording/reference/billing-policies#billing-fee-deductions-and-account-suspension-policies",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000#acquire",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000#query",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000#start",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000#stop",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/api-reference/api-ref/cloud-recording#acquire",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/api-reference/api-ref/cloud-recording#query",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/api-reference/api-ref/cloud-recording#start",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/api-reference/api-ref/cloud-recording#stop",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/api-reference/api-ref/cloud-recording#storageconfig",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/api-reference/api-ref/cloud-recording#update",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/api-reference/api-ref/cloud-recording#updatelayout",
  "en/realtime-media/im/build/build-core-messaging/messages/message-overview.md\u0000#limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/manage-chat-groups.mdx\u0000/en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/group-overview#create-and-destroy-a-chat-group",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/chatroom-overview.md\u0000#limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/manage-chatrooms.mdx\u0000#retrieve",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/threading/thread-management.mdx\u0000#fetch",
  "en/realtime-media/im/build/moderate-and-manage-client-behavior/callkit.mdx\u0000#import",
  "en/realtime-media/im/build/notifications-and-event-handling/offline-push/integrate-test.mdx\u0000#1-create-push-certificates",
  "en/realtime-media/im/build/secure-access-and-authentication/authentication.mdx\u0000/en/realtime-media/im/get-started/manage-agora-account#sign-up-and-log-in",
  "en/realtime-media/im/get-started-sdk.mdx\u0000#add-a-privacy-manifest-file",
  "en/realtime-media/im/get-started-sdk.mdx\u0000#sign-in",
  "en/realtime-media/im/get-started-uikit.mdx\u0000/en/realtime-media/im/build/build-core-messaging/user-attributes#manage-contacts",
  "en/realtime-media/im/get-started/enable.md\u0000#userid",
  "en/realtime-media/marketplace/build/add-video-and-ar-effects/metakit.mdx\u0000#adding-scene-view",
  "en/realtime-media/marketplace/reference/downloads.mdx\u0000#implementation-fields",
  "en/realtime-media/marketplace/reference/downloads.mdx\u0000#subspecs-field",
  "en/realtime-media/marketplace/reference/security.mdx\u0000/en/realtime-media/marketplace/manage-agora-account#manage-app-certificates",
  "en/realtime-media/media-pull/build/skills.mdx\u0000#agora-mcp-server",
  "en/realtime-media/media-pull/reference/security.md\u0000#agora-bug-bounty-program",
  "en/realtime-media/media-push/build/skills.mdx\u0000#agora-mcp-server",
  "en/realtime-media/on-premise-recording/build/connect-through-a-firewall/cloud-proxy.mdx\u0000/en/api-reference/api-ref/on-premise-recording#getagoraparameter",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/layout.mdx\u0000/en/api-reference/api-ref/on-premise-recording#setvideomixinglayout",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/layout.mdx\u0000/en/api-reference/api-ref/on-premise-recording#videomixinglayout",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/local-screenshot.mdx\u0000/en/api-reference/api-ref/on-premise-recording#enablerecordervideoframecapture",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/local-screenshot.mdx\u0000/en/api-reference/api-ref/on-premise-recording#irecordervideoframeobserver",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/local-screenshot.mdx\u0000/en/api-reference/api-ref/on-premise-recording#recordervideoframecaptureconfig",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/local-screenshot.mdx\u0000/en/api-reference/api-ref/on-premise-recording#videoframecapturetype",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/watermark.mdx\u0000/en/api-reference/api-ref/on-premise-recording#enableandupdatevideowatermarks",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/watermark.mdx\u0000/en/api-reference/api-ref/on-premise-recording#rectangle",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/watermark.mdx\u0000/en/api-reference/api-ref/on-premise-recording#watermarklitera",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/watermark.mdx\u0000/en/api-reference/api-ref/on-premise-recording#watermarkoptions",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/watermark.mdx\u0000/en/api-reference/api-ref/on-premise-recording#watermarkratio",
  "en/realtime-media/on-premise-recording/build/customize-the-recording/watermark.mdx\u0000/en/api-reference/api-ref/on-premise-recording#watermarktimestamp",
  "en/realtime-media/on-premise-recording/build/process-recorded-files/restore-files.mdx\u0000/en/api-reference/api-ref/on-premise-recording#getagoraparameter",
  "en/realtime-media/on-premise-recording/build/process-recorded-files/restore-files.mdx\u0000/en/api-reference/api-ref/on-premise-recording#onrecorderstatechanged",
  "en/realtime-media/on-premise-recording/build/process-recorded-files/restore-files.mdx\u0000/en/api-reference/api-ref/on-premise-recording#stoprecording",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#enableandupdatevideowatermarks",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#enableandupdatevideowatermarksbyuid",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#initialize",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#joinchannel",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#setrecorderconfig",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#setrecorderconfigbyuid",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#setvideomixinglayout",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#startrecording",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#startsinglerecordingbyuid",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#stoprecording",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/composite-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#stopsinglerecordingbyuid",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#enableandupdatevideowatermarks",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#enableandupdatevideowatermarksbyuid",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#initialize",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#joinchannel",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#onuserjoined",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#setrecorderconfig",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#setrecorderconfigbyuid",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#setvideomixinglayout",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#startrecording",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#startsinglerecordingbyuid",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#stoprecording",
  "en/realtime-media/on-premise-recording/build/record-audio-and-video/individual-mode.mdx\u0000/en/api-reference/api-ref/on-premise-recording#stopsinglerecordingbyuid",
  "en/realtime-media/on-premise-recording/build/set-up-authentication/authentication-workflow.mdx\u0000/en/realtime-media/video/build/authenticate-users/deploy-token-server#enable-co-host-authentication",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#agoramediartcrecorder",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#agoraservice",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#agoraserviceconfiguration",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#createagoramediacomponentfactory",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#createagoraservice",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#initialize",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#joinchannel",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#leavechannel",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#logconfig",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#registerrecordereventhandle",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#registerrecordereventhandler",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#release",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#setlogfile",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#setrecorderconfig",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#startrecording",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#stoprecording",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#subscribeallaudio",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#subscribeallvideo",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#unregisterrecordereventhandle",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#unregisterrecordereventhandler",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#unsubscribeallaudio",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/api-reference/api-ref/on-premise-recording#unsubscribeallvideo",
  "en/realtime-media/on-premise-recording/quickstart.mdx\u0000/en/realtime-media/on-premise-recording/manage-agora-account#generate-temporary-token",
  "en/realtime-media/on-premise-recording/reference/pricing.mdx\u0000#aggregate",
  "en/realtime-media/on-premise-recording/reference/pricing.mdx\u0000#question",
  "en/realtime-media/rtm/build/connect-and-authenticate/authentication-workflow.mdx\u0000/en/api-reference/api-ref/signaling#channeljoinpropsag_platform",
  "en/realtime-media/rtm/build/connect-and-authenticate/authentication-workflow.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios#tokenrenewrtmtokenpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling#configpresenceeventpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling#enumvpresencetypepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling#event-listeners",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling#getonlineusers",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling#getuserchannels",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling#presencegetstatepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling#presenceremovestatepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling#presencesetstatepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#event-listeners",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#getonlineusers",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#getuserchannels",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#presencegetstatepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#presenceremovestatepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#presencesetstatepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#event-listeners",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#getonlineusers",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#getuserchannels",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#presencegetstatepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#presenceremovestatepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/presence.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#presencesetstatepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling#configstorageeventpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling#enumvstorageeventtypepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling#event-listeners",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling#lock",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storagegetchannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storagemetadataitempropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storagemetadatapropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storageremovechannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storagesetchannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storageupdatechannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#event-listeners",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#lock",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storagegetchannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storagemetadatapropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storageremovechannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storagesetchannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storageupdatechannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#event-listeners",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#lock",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storagegetchannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storagemetadatapropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storageremovechannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storagesetchannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-channel-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storageupdatechannelpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling#configstorageeventpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling#enumvstorageeventtypepropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling#event-listeners",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storagegetuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storagemetadataitempropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storagemetadatapropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storageremoveuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storagesetuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storagesubscribeuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storageunsubscribeuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling#storageupdateuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storagegetuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storagemetadatapropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storageremoveuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storagesetuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storagesubscribeuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storageunsubscribeuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#storageupdateuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storagegetuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storagemetadatapropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storageremoveuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storagesetuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storagesubscribeuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storageunsubscribeuserpropsag_platform",
  "en/realtime-media/rtm/build/manage-presence-and-metadata/storage/store-user-metadata.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#storageupdateuserpropsag_platform",
  "en/realtime-media/rtm/build/secure-your-app-and-data/data-encryption.mdx\u0000/en/api-reference/api-ref/signaling#configencryptionpropsag_platform",
  "en/realtime-media/rtm/build/secure-your-app-and-data/data-encryption.mdx\u0000/en/api-reference/api-ref/signaling#configrtmpropsag_platform",
  "en/realtime-media/rtm/build/secure-your-app-and-data/data-encryption.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#configencryptionpropsag_platform",
  "en/realtime-media/rtm/build/secure-your-app-and-data/data-encryption.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#configencryptionpropsag_platform",
  "en/realtime-media/rtm/build/secure-your-app-and-data/geofencing.mdx\u0000/en/api-reference/api-ref/signaling#configcreatepropsag_platform",
  "en/realtime-media/rtm/build/secure-your-app-and-data/geofencing.mdx\u0000/en/api-reference/api-ref/signaling#configrtmpropsag_platform",
  "en/realtime-media/rtm/build/secure-your-app-and-data/geofencing.mdx\u0000/en/api-reference/api-ref/signaling#initialization",
  "en/realtime-media/rtm/build/secure-your-app-and-data/geofencing.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#configrtmpropsag_platform",
  "en/realtime-media/rtm/build/secure-your-app-and-data/geofencing.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#create-an-instance",
  "en/realtime-media/rtm/build/secure-your-app-and-data/geofencing.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#configrtmpropsag_platform",
  "en/realtime-media/rtm/build/secure-your-app-and-data/geofencing.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#create-an-instance",
  "en/realtime-media/rtm/build/send-and-receive-messages/add-event-listener.mdx\u0000/en/api-reference/api-ref/signaling#event-listeners",
  "en/realtime-media/rtm/build/work-with-channels/message-channel.mdx\u0000/en/api-reference/api-ref/signaling#channelsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/message-channel.mdx\u0000/en/api-reference/api-ref/signaling#channelunsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/message-channel.mdx\u0000/en/api-reference/api-ref/signaling#messagepublishpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/message-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#channelsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/message-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#channelunsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/message-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#messagepublishpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/message-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#channelsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/message-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#channelunsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/message-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#messagepublishpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling#channelcreatepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling#channeljoinpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling#channelleavepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling#channelreleasepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling#topicpublishpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#channelcreatepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#channeljoinpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#channelleavepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#channelreleasepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#topicpublishpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#channelcreatepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#channeljoinpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#channelleavepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#channelreleasepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/stream-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#topicpublishpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling#event-listeners",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling#topicjoinpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling#topicleavepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling#topicsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling#topicunsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#event-listeners",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#topicjoinpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#topicleavepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#topicsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#topicunsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#event-listeners",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#topicjoinpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#topicleavepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#topicsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/topics.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=swift#topicunsubscribepropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/user-channel.mdx\u0000/en/api-reference/api-ref/signaling#messagepublishpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/user-channel.mdx\u0000/en/api-reference/api-ref/signaling#receive",
  "en/realtime-media/rtm/build/work-with-channels/user-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#messagepublishpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/user-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=ios&tab=objc#receive",
  "en/realtime-media/rtm/build/work-with-channels/user-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=objc&tab=swift#messagepublishpropsag_platform",
  "en/realtime-media/rtm/build/work-with-channels/user-channel.mdx\u0000/en/api-reference/api-ref/signaling?platform=objc&tab=swift#receive",
  "en/realtime-media/rtm/console-overview.md\u0000#generate-a-customer-id-and-customer-secret",
  "en/realtime-media/rtm/console-overview.md\u0000#prerequisites",
  "en/realtime-media/speech-to-text/reference/security.md\u0000/en/realtime-media/speech-to-text/reference/manage-agora-account#manage-app-certificates",
  "en/realtime-media/video/build/add-advanced-video-features/metakit.mdx\u0000#adding-scene-view",
  "en/realtime-media/video/build/authenticate-users/deploy-token-server.mdx\u0000/en/realtime-media/video/build/authenticate-users/deploy-token-server#enable-co-host-authentication",
  "en/realtime-media/video/build/authenticate-users/integrate-token-generation.mdx\u0000/en/realtime-media/video/build/authenticate-users/authentication-workflow#generate-a-token",
  "en/realtime-media/video/build/join-and-manage-channels/compile-run-sample-project.mdx\u0000/en/realtime-media/video/reference/supported-platforms#browsers",
  "en/realtime-media/video/build/join-and-manage-channels/preload-channels.mdx\u0000/en/realtime-media/video/reference/pricing#cost-calculation",
  "en/realtime-media/video/build/optimize-and-operate/app-size-optimization.mdx\u0000#implementation-fields",
  "en/realtime-media/video/build/optimize-and-operate/app-size-optimization.mdx\u0000#subspecs-field",
  "en/realtime-media/video/get-started-sdk.mdx\u0000#get-device-permissions",
  "en/realtime-media/video/get-started-sdk.mdx\u0000#local--tracks",
  "en/realtime-media/video/get-started-sdk.mdx\u0000#subscribe-to--events",
  "en/realtime-media/video/get-started-sdk.mdx\u0000/en/api-reference/faq/quality/video_blank#issue-description",
  "en/realtime-media/video/get-started-sdk.mdx\u0000/en/realtime-media/video/reference/supported-platforms#browsers",
  "en/realtime-media/video/quickstart.mdx\u0000#complete-code",
  "en/realtime-media/video/quickstart.mdx\u0000#get-device-permissions",
  "en/realtime-media/video/quickstart.mdx\u0000#local--tracks",
  "en/realtime-media/video/quickstart.mdx\u0000#subscribe-to--events",
  "en/realtime-media/video/quickstart.mdx\u0000/en/api-reference/faq/quality/video_blank#issue-description",
  "en/realtime-media/video/reference/console-overview.mdx\u0000#generate-a-customer-id-and-customer-secret",
  "en/realtime-media/video/reference/console-overview.mdx\u0000#prerequisites",
  "en/realtime-media/video/reference/magic-leap.md\u0000/en/realtime-media/video/manage-agora-account#generate-a-temporary-token",
  "en/realtime-media/video/reference/migration-guide.mdx\u0000/en/realtime-media/video/get-started-sdk#project-setup",
  "en/realtime-media/video/reference/release-notes.mdx\u0000#410",
  "en/realtime-media/video/reference/release-notes.mdx\u0000#issue-fixed",
  "en/realtime-media/video/reference/release-notes.mdx\u0000/en/realtime-media/video/reference/pricing#ai-noise-suppression-pricing",
  "en/realtime-media/voice/build/optimize-and-operate/app-size-optimization.mdx\u0000#implementation-fields",
  "en/realtime-media/voice/build/optimize-and-operate/app-size-optimization.mdx\u0000#subspecs-field",
  "en/realtime-media/voice/quickstart.mdx\u0000#get-device-permissions",
  "en/realtime-media/voice/quickstart.mdx\u0000#local--tracks",
  "en/realtime-media/voice/quickstart.mdx\u0000#subscribe-to--events",
  "en/realtime-media/voice/reference/console-overview.md\u0000#generate-a-customer-id-and-customer-secret",
  "en/realtime-media/voice/reference/console-overview.md\u0000#prerequisites",
  "en/realtime-media/voice/reference/migration-guide.mdx\u0000/en/realtime-media/voice/quickstart#project-setup",
  "en/realtime-media/voice/reference/release-notes.mdx\u0000/en/realtime-media/voice/reference/pricing#ai-noise-suppression-pricing",
  "en/realtime-media/voice/skills.mdx\u0000#agora-mcp-server",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-app-server.mdx\u0000#csharp",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-app-server.mdx\u0000#golang",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-app-server.mdx\u0000#java",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-app-server.mdx\u0000#javascript",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-app-server.mdx\u0000#php",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-app-server.mdx\u0000#ruby",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-app-server.mdx\u0000#typescript",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/scenes/display-files-fast.mdx\u0000/en/api-reference/api-ref/uikit-sdk#nsertimg",
  "en/realtime-media/whiteboard/build/draw-and-edit-content/whiteboard-tools.mdx\u0000#tech",
  "en/realtime-media/whiteboard/build/migrate-and-accelerate-development/migration-guide.md\u0000#netlessaccount",
  "en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/enable-whiteboard.md\u0000/en/realtime-media/whiteboard/build/manage-agora-account#create-an-agora-project",
  "en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/get-started-sdk.mdx\u0000/en/realtime-media/whiteboard/build/manage-agora-account#sign-up-and-log-in",
  "en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/get-started-uikit.mdx\u0000/en/realtime-media/whiteboard/build/manage-agora-account#sign-up-and-log-in",
  "en/realtime-media/whiteboard/build/skills.md\u0000#agora-mcp-server",
  "en/realtime-media/whiteboard/overview/release-notes-uikit.mdx\u0000/en/api-reference/api-ref/uikit-sdk#setresource",
  "en/realtime-media/whiteboard/overview/release-notes-uikit.mdx\u0000/en/api-reference/api-ref/uikit-sdk#setstrokerange",
  "en/realtime-media/whiteboard/overview/release-notes-uikit.mdx\u0000/en/api-reference/api-ref/uikit-sdk#settoolboxedgemargin",
  "en/realtime-media/whiteboard/overview/release-notes-uikit.mdx\u0000/en/api-reference/api-ref/uikit-sdk#settoolscolors",
  "en/realtime-media/whiteboard/overview/release-notes.mdx\u0000/en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/get-started-sdk#get-the-whiteboard-sdk",
  "en/realtime-media/agora-analytics/build/integrate-and-embed/embedded.md\u0000#url-to-a-detailed-call-inspector-page",
  "en/realtime-media/interactive-live-streaming/build/apply-effects-and-enhancements/ai-noise-suppression.mdx\u0000/en/realtime-media/interactive-live-streaming/reference/release-notes#ai-noise-suppression",
  "en/realtime-media/interactive-live-streaming/build/apply-effects-and-enhancements/metakit.mdx\u0000#adding-scene-view",
  "en/realtime-media/interactive-live-streaming/build/authenticate-users/deploy-token-server.mdx\u0000#api-reference",
  "en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/app-size-optimization.mdx\u0000#implementation-fields",
  "en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/app-size-optimization.mdx\u0000#subspecs-field",
  "en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/preload-channels.mdx\u0000/en/realtime-media/interactive-live-streaming/reference/pricing#cost-calculation",
  "en/realtime-media/interactive-live-streaming/quickstart.mdx\u0000#complete-code",
  "en/realtime-media/interactive-live-streaming/quickstart.mdx\u0000#get-device-permissions",
  "en/realtime-media/interactive-live-streaming/quickstart.mdx\u0000#local--tracks",
  "en/realtime-media/interactive-live-streaming/quickstart.mdx\u0000#subscribe-to--events",
  "en/realtime-media/interactive-live-streaming/reference/console-overview.md\u0000#generate-a-customer-id-and-customer-secret",
  "en/realtime-media/interactive-live-streaming/reference/console-overview.md\u0000#prerequisites",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000#410",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000#ai-noise-suppression",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000#issue-fixed",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000#super-clarity-extension",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/reference/pricing#ai-noise-suppression-pricing",
  "en/realtime-media/iot/reference/channel-management-rest-api.mdx\u0000#create-a-rule-to-ban-user-privileges",
  "zh-CN/ai/quick-start-go.mdx\u0000#\u4e0e\u667a\u80fd\u4f53\u5bf9\u8bdd",
  "zh-CN/ai/quick-start-go.mdx\u0000#\u5b9a\u4e49\u53d8\u91cf",
  "zh-CN/ai/quick-start-java.mdx\u0000#\u4e0e\u667a\u80fd\u4f53\u5bf9\u8bdd",
  "zh-CN/ai/quick-start-java.mdx\u0000#\u5b9a\u4e49\u53d8\u91cf",
  "zh-CN/ai/release-notes.md\u0000/zh-CN/ai/billing#\u4ed8\u8d39\u65b9\u5f0f",
  "zh-CN/best-practices/release-notes.md\u0000/zh-CN/best-practices/billing#\u4ed8\u8d39\u65b9\u5f0f",
]);

const KNOWN_LEGACY_HOSTED_LINKS = new Set([
  "en/api-reference/api-ref/im/chat-group-management/create-delete-retrieve-groups.md\u0000/en/api-reference/api-ref/im/chat-group-management/agora_chat_plan#group",
  "en/api-reference/api-ref/im/chat-group-management/create-delete-retrieve-groups.md\u0000/en/api-reference/api-ref/im/pricing-plan-details#group",
  "en/api-reference/api-ref/im/chatroom-management/manage-chatroom-attributes.md\u0000/en/api-reference/api-ref/im/chatroom-management/overwrite",
  "en/api-reference/api-ref/im/message-management.md\u0000/en/api-reference/api-ref/im/pricing-plan-details",
  "en/api-reference/api-ref/im/push-notification-management.mdx\u0000/en/api-reference/api-ref/im/send-push-notifications#request-body",
  "en/api-reference/api-ref/media-pull/index.md\u0000/en/api-reference/api-reference/enable-ncs",
  "en/api-reference/api-ref/media-pull/index.md\u0000/en/api-reference/api-reference/ncs-events",
  "en/api-reference/api-ref/media-push/index.md\u0000/en/api-reference/api-ref/media-push/integration-best-practices",
  "en/api-reference/api-ref/media-push/restful-type-definition.mdx\u0000/en/api-reference/api-ref/media-push/sei-information",
  "en/api-reference/api-ref/media-push/restful-type-definition.mdx\u0000/en/api-reference/api-ref/media-push/set-vertical-layout",
  "en/api-reference/api-ref/server-sdk/python.mdx\u0000/en/ai/models",
  "en/api-reference/api-ref/signaling/android.mdx\u0000/en/api-reference/api-ref/signaling/reference/limitations",
  "en/api-reference/api-ref/signaling/flutter.mdx\u0000/en/api-reference/api-ref/storage#IMetadata",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000/en/api-reference/api-ref/signaling/reference/limitations",
  "en/api-reference/api-ref/signaling/ios.mdx\u0000/en/api-reference/api-ref/storage#AgoraRtmMetadata",
  "en/api-reference/api-ref/signaling/linux-cpp.mdx\u0000/en/api-reference/api-ref/storage#IMetadata",
  "en/api-reference/api-ref/signaling/macos.mdx\u0000/en/api-reference/api-ref/signaling/reference/limitations",
  "en/api-reference/api-ref/signaling/react-native.mdx\u0000/en/api-reference/api-ref/signaling/configuration",
  "en/api-reference/api-ref/signaling/react-native.mdx\u0000/en/api-reference/api-ref/signaling/configuration#event-listener",
  "en/api-reference/api-ref/signaling/react-native.mdx\u0000/en/api-reference/api-ref/signaling/enum#channeltype",
  "en/api-reference/api-ref/signaling/react-native.mdx\u0000/en/api-reference/api-ref/signaling/enum#messagetype",
  "en/api-reference/api-ref/signaling/react-native.mdx\u0000/en/api-reference/api-ref/signaling/enumv#channeltype",
  "en/api-reference/api-ref/signaling/react-native.mdx\u0000/en/api-reference/api-ref/signaling/toc-configuration/configuration#add-listener",
  "en/api-reference/api-ref/signaling/react-native.mdx\u0000/en/api-reference/api-ref/signaling/toc-configuration/configuration#createagorartmclient",
  "en/api-reference/api-ref/signaling/react-native.mdx\u0000/en/api-reference/api-ref/signaling/toc-configuration/configuration#login",
  "en/api-reference/api-ref/signaling/unity.mdx\u0000/en/api-reference/api-ref/signaling/reference/limitations",
  "en/api-reference/api-ref/signaling/windows-cpp.mdx\u0000/en/api-reference/api-ref/storage#IMetadata",
  "en/api-reference/api-ref/speech-to-text/rest-api-v5/start.mdx\u0000/en/realtime-media/video/reference/core-concepts#app-certificate",
  "en/api-reference/api-ref/speech-to-text/rest-api-v6/start.mdx\u0000/en/realtime-media/video/reference/core-concepts#app-certificate",
  "en/api-reference/api-ref/whiteboard/file-conversion-deprecated.mdx\u0000/en/api-reference/api-ref/file-conversion-overview-deprecated",
  "en/api-reference/api-ref/whiteboard/file-conversion-deprecated.mdx\u0000/en/api-reference/api-ref/whiteboard/overview#status-codes",
  "en/api-reference/api-ref/whiteboard/file-conversion.md\u0000/en/api-reference/api-ref/whiteboard/overview#status-codes",
  "en/api-reference/api-ref/whiteboard/room-management.md\u0000/en/api-reference/api-ref/whiteboard/overview#status-codes",
  "en/api-reference/api-ref/whiteboard/screenshots.md\u0000/en/api-reference/api-ref/whiteboard/overview#status-codes",
  "en/api-reference/faq/quality/pixelated_green_video.mdx\u0000/en/api-reference/faq/integration/log",
  "en/api-reference/faq/quality/unsynchronized_video.mdx\u0000/en/api-reference/faq/integration/log#set-the-log-file",
  "en/api-reference/faq/quality/video_blank.mdx\u0000/en/api-reference/faq/integration/log#set-the-log-file",
  "en/api-reference/faq/quality/video_freeze.mdx\u0000/en/api-reference/faq/integration/log#set-the-log-file",
  "en/introduction/community-resources.md\u0000/en/ai/domain-overview",
  "en/introduction/conversational-ai.mdx\u0000/en/api-reference/conversational-ai",
  "en/introduction/get-started/build-it-yourself.mdx\u0000/en/ai/choose-your-path/quickstart-coding",
  "en/introduction/get-started/build-it-yourself.mdx\u0000/en/realtime-media/rtc/android/quick-start/build-from-scratch",
  "en/introduction/realtime-audio-video.mdx\u0000/en/realtime-media/fusion-cdn",
  "en/realtime-media/broadcast-streaming/build/apply-effects-and-enhancements/metakit.mdx\u0000/en/realtime-media/video-calling/get-started/get-started-sdk",
  "en/realtime-media/broadcast-streaming/build/apply-effects-and-enhancements/use-an-extension.mdx\u0000/en/realtime-media/broadcast-streaming/build/manage-agora-account",
  "en/realtime-media/broadcast-streaming/build/connect-across-channels/receive-notifications.mdx\u0000/en/realtime-media/broadcast-streaming/build/manage-agora-account",
  "en/realtime-media/broadcast-streaming/build/control-audio-and-devices/volume-control-and-mute.mdx\u0000/en/realtime-media/broadcast-streaming/build/control-audio-and-devices/custom-audio",
  "en/realtime-media/broadcast-streaming/build/control-audio-and-devices/volume-control-and-mute.mdx\u0000/en/realtime-media/broadcast-streaming/build/control-audio-and-devices/custom-video",
  "en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/app-size-optimization.mdx\u0000/en/realtime-media/broadcast-streaming/build/optimize-quality-and-connection/screen-sharing",
  "en/realtime-media/broadcast-streaming/build/process-raw-and-custom-media/screenshot-upload.mdx\u0000/en/realtime-media/broadcast-streaming/build/process-raw-and-custom-media/app-size-optimization",
  "en/realtime-media/broadcast-streaming/build/process-raw-and-custom-media/stream-raw-audio.mdx\u0000/en/realtime-media/broadcast-streaming/build/core-concepts",
  "en/realtime-media/broadcast-streaming/build/secure-and-protect-channels/prevent-stream-bombing.mdx\u0000/en/realtime-media/broadcast-streaming/build/manage-agora-account",
  "en/realtime-media/broadcast-streaming/build/secure-and-protect-channels/prevent-stream-bombing.mdx\u0000/en/realtime-media/broadcast-streaming/build/secure-and-protect-channels/use-tokens",
  "en/realtime-media/broadcast-streaming/build/secure-and-protect-channels/prevent-stream-bombing.mdx\u0000/en/realtime-media/broadcast-streaming/reference/channel-management-api/endpoint/query-channel-information/query-user-list",
  "en/realtime-media/broadcast-streaming/build/secure-and-protect-channels/prevent-stream-bombing.mdx\u0000/en/realtime-media/broadcast-streaming/reference/channel-management-api/overview",
  "en/realtime-media/broadcast-streaming/build/set-up-your-project/compile-run-sample-project.mdx\u0000/en/realtime-media/broadcast-streaming/build/manage-agora-account",
  "en/realtime-media/broadcast-streaming/build/set-up-your-project/compile-run-sample-project.mdx\u0000/en/realtime-media/broadcast-streaming/build/set-up-your-project/reference/supported-platforms",
  "en/realtime-media/broadcast-streaming/reference/console-overview.md\u0000/en/realtime-media/broadcast-streaming/reference/channel-management-api/restful-authentication",
  "en/realtime-media/broadcast-streaming/reference/pricing-legacy.md\u0000/en/realtime-media/broadcast-streaming/reference/reference/pricing",
  "en/realtime-media/broadcast-streaming/reference/pricing.mdx\u0000/en/realtime-media/broadcast-streaming/reference/subscription-packages",
  "en/realtime-media/cloud-recording/build/best-practices/integration-best-practices.mdx\u0000/en/realtime-media/cloud-recording/develop/manage-files#naming-conventions",
  "en/realtime-media/cloud-recording/build/best-practices/integration-best-practices.mdx\u0000/en/realtime-media/cloud-recording/develop/manage-files#slicing",
  "en/realtime-media/cloud-recording/build/best-practices/integration-best-practices.mdx\u0000/en/realtime-media/cloud-recording/pricing",
  "en/realtime-media/cloud-recording/build/best-practices/integration-best-practices.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#what-are-the-differences-between-the-message-notification-service-and-the-query-method",
  "en/realtime-media/cloud-recording/build/best-practices/webpage-best-practices.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#71-web_recorder_stopped-web_recorder_stopped",
  "en/realtime-media/cloud-recording/build/customize-the-recording/layout.mdx\u0000/en/realtime-media/cloud-recording/develop/composite-mode#considerations",
  "en/realtime-media/cloud-recording/build/customize-the-recording/webpage-load-timeout.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#70-web_recorder_started-web_recorder_started",
  "en/realtime-media/cloud-recording/build/customize-the-recording/webpage-load-timeout.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#71-web_recorder_stopped-web_recorder_stopped",
  "en/realtime-media/cloud-recording/build/customize-the-recording/webpage-load-timeout.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#73-web_recorder_reload",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000/en/realtime-media/cloud-recording/get-started/manage-agora-account#create-an-agora-account",
  "en/realtime-media/cloud-recording/build/handle-events/receive-notifications.mdx\u0000/en/realtime-media/cloud-recording/get-started/manage-agora-account#create-an-agora-project",
  "en/realtime-media/cloud-recording/build/process-recorded-files/merge-files.mdx\u0000/en/realtime-media/cloud-recording/develop/convert-format#convert-steps",
  "en/realtime-media/cloud-recording/build/process-recorded-files/playback.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview",
  "en/realtime-media/cloud-recording/build/start-a-recording/individual-nontranscoding.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#callback-events",
  "en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx\u0000/en/realtime-media/cloud-recording/pricing",
  "en/realtime-media/cloud-recording/build/start-a-recording/screen-capture.mdx\u0000/en/realtime-media/video-calling/advanced/screenshot-upload",
  "en/realtime-media/cloud-recording/pricing-webpage-recording.mdx\u0000/en/realtime-media/cloud-recording/pricing",
  "en/realtime-media/cloud-recording/pricing-webpage-recording.mdx\u0000/en/realtime-media/cloud-recording/pricing#aggregate",
  "en/realtime-media/cloud-recording/pricing-webpage-recording.mdx\u0000/en/realtime-media/reference/billing-policies#agoras-free-of-charge-policy-for-the-first-10000-minutes",
  "en/realtime-media/cloud-recording/pricing-webpage-recording.mdx\u0000/en/realtime-media/reference/billing-policies#billing-fee-deductions-and-account-suspension-policies",
  "en/realtime-media/cloud-recording/reference/pricing.mdx\u0000/en/realtime-media/cloud-recording/pricing",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/develop/individual-nontranscoding#implement-an-postpone-audio-mixing",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/develop/layout#customize-the-video-layout",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/develop/layout#set-the-background-color-or-background-image",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/product-overview",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/develop/manage-files#when-a-server-is-disconnected-or-the-process-killed",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#12-session_failover",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#31-uploaded",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#32-backuped",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#45-recorder_snapshot_file",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#60-vod_started",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#61-vod_triggered",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#70-web_recorder_started",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#70-web_recorder_started-web_recorder_started",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#71-web_recorder_stopped",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#71-web_recorder_stopped-web_recorder_stopped",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#72-web_recorder_capability_limit",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#73-web_recorder_reload",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api-overview#error-codes-for-the-agora-cloud-recording-service",
  "en/realtime-media/cloud-recording/reference/release-notes.mdx\u0000/en/realtime-media/cloud-recording/reference/rest-api/rest",
  "en/realtime-media/cloud-recording/reference/security.mdx\u0000/en/realtime-media/cloud-recording/get-started/manage-agora-account#manage-app-certificates",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/realtime-media/best-practices/integration-best-practices#monitor-service-status-during-a-recording",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/realtime-media/best-practices/integration-best-practices#obtain-the-m3u8-file-name",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/realtime-media/get-started/manage-agora-account#get-the-app-id",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/realtime-media/reference/common-errors#errors",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/realtime-media/reference/rest-api-overview",
  "en/realtime-media/cloud-recording/rest-quickstart.mdx\u0000/en/realtime-media/reference/restful-authentication",
  "en/realtime-media/im/build/build-core-messaging/contacts.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-core-messaging/messages/manage-messages.mdx\u0000/en/realtime-media/get-started-sdk",
  "en/realtime-media/im/build/build-core-messaging/messages/manage-messages.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-core-messaging/messages/message-receipts.mdx\u0000/en/realtime-media/get-started-sdk",
  "en/realtime-media/im/build/build-core-messaging/messages/message-receipts.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-core-messaging/messages/retrieve-messages.mdx\u0000/en/realtime-media/get-started-sdk",
  "en/realtime-media/im/build/build-core-messaging/messages/retrieve-messages.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages.mdx\u0000/en/realtime-media/get-started-sdk",
  "en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages.mdx\u0000/en/realtime-media/im/build/limitations#multiple-messages-forwarding-limitations",
  "en/realtime-media/im/build/build-core-messaging/messages/send-receive-messages.mdx\u0000/en/realtime-media/im/build/limitations#sent-message-modification-limitations",
  "en/realtime-media/im/build/build-core-messaging/messages/translate-messages.mdx\u0000/en/realtime-media/get-started-sdk",
  "en/realtime-media/im/build/build-core-messaging/messages/translate-messages.mdx\u0000/en/realtime-media/im/build/build-core-messaging/en/realtime-media/im/reference/pricing#optional-add-on-fee",
  "en/realtime-media/im/build/build-core-messaging/messages/translate-messages.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-core-messaging/presence.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-core-messaging/reaction.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-core-messaging/user-attributes.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/group-overview.md\u0000/en/realtime-media/im/build/build-groups-rooms-and-threads/en/api-reference/api-ref/im/message-management#retrieve-historical-messages",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/group-overview.md\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/manage-chat-groups.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/manage-group-attributes.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/manage-group-member-attributes.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-group/manage-group-members.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/chatroom-overview.md\u0000/en/realtime-media/im/build/build-groups-rooms-and-threads/en/api-reference/api-ref/im/chatroom-management/manage-chatroom-admins#adding-a-chat-room-super-admin",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/chatroom-overview.md\u0000/en/realtime-media/im/build/build-groups-rooms-and-threads/en/api-reference/api-ref/im/message-management#retrieve-historical-messages",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/manage-chatroom-attributes.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/manage-chatroom-members.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/manage-chatrooms.mdx\u0000/en/realtime-media/im/build/build-groups-rooms-and-threads/en/api-reference/api-ref/im/chatroom-management/manage-chatroom-admins",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/manage-chatrooms.mdx\u0000/en/realtime-media/im/build/build-groups-rooms-and-threads/en/api-reference/api-ref/im/chatroom-management/manage-chatroom-admins#adding-a-chat-room-super-admin",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/chat-room/manage-chatrooms.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/threading/thread-management.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/build-groups-rooms-and-threads/threading/thread-messages.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/notifications-and-event-handling/offline-push/configure-push-notifications.mdx\u0000/en/realtime-media/im/build/notifications-and-event-handling/en/api-reference/api-ref/im/offline-push/offline-push-extension",
  "en/realtime-media/im/build/notifications-and-event-handling/offline-push/integrate-test.mdx\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/build/notifications-and-event-handling/offline-push/integrate-test.mdx\u0000/en/realtime-media/im/build/notifications-and-event-handling/en/api-reference/api-ref/im/user-system-registration#querying-a-user",
  "en/realtime-media/im/build/notifications-and-event-handling/offline-push/set-display-content.mdx\u0000/en/realtime-media/im/build/notifications-and-event-handling/en/realtime-media/im/build/build-core-messaging/user-attributes#set-user-attributes",
  "en/realtime-media/im/build/notifications-and-event-handling/setup-webhooks.md\u0000/en/realtime-media/im/build/http-status-codes",
  "en/realtime-media/im/build/notifications-and-event-handling/setup-webhooks.md\u0000/en/realtime-media/im/build/limitations",
  "en/realtime-media/im/get-started-sdk.mdx\u0000/en/realtime-media/develop/authentication",
  "en/realtime-media/im/get-started-sdk.mdx\u0000/en/realtime-media/im/downloads",
  "en/realtime-media/im/get-started-sdk.mdx\u0000/en/realtime-media/im/enable#enable-",
  "en/realtime-media/im/get-started-sdk.mdx\u0000/en/realtime-media/im/enable#generate-a-user-token",
  "en/realtime-media/im/get-started-sdk.mdx\u0000/en/realtime-media/im/enable#get-chat-project-information",
  "en/realtime-media/im/get-started-sdk.mdx\u0000/en/realtime-media/im/enable#register-a-user",
  "en/realtime-media/im/get-started-sdk.mdx\u0000/en/realtime-media/rtc/best-practices/app-size-optimization#dynamically-load-so-files",
  "en/realtime-media/im/get-started-uikit.mdx\u0000/en/realtime-media/im/enable#enable-the-agora-chat-service",
  "en/realtime-media/im/get-started-uikit.mdx\u0000/en/realtime-media/im/enable#get-the-information-of-the-agora-chat-project",
  "en/realtime-media/im/get-started/manage-agora-account.md\u0000/en/realtime-media/rtc/reference/console-overview",
  "en/realtime-media/im/reference/console/content-moderation-microsoft.mdx\u0000/en/realtime-media/im/reference/console/pricing-plan-details",
  "en/realtime-media/im/reference/console/data-insights.md\u0000/en/realtime-media/im/reference/get-started/enable",
  "en/realtime-media/index.md\u0000/en/realtime-media/fusion-cdn",
  "en/realtime-media/marketplace/build/add-moderation-and-intelligence/activefence.mdx\u0000/en/realtime-media/broadcast-streaming/reference/channel-management-api/overview",
  "en/realtime-media/marketplace/build/add-video-and-ar-effects/metakit.mdx\u0000/en/realtime-media/video-calling/get-started/get-started-sdk",
  "en/realtime-media/marketplace/build/build-your-own-extension/audio-filter.mdx\u0000/en/api-reference/rtc/ios",
  "en/realtime-media/marketplace/build/build-your-own-extension/audio-filter.mdx\u0000/en/realtime-media/marketplace/build/implementation-guide",
  "en/realtime-media/marketplace/build/build-your-own-extension/audio-filter.mdx\u0000/en/realtime-media/marketplace/build/publish-extension",
  "en/realtime-media/marketplace/build/build-your-own-extension/video-filter.mdx\u0000/en/api-reference/rtc/ios",
  "en/realtime-media/marketplace/build/build-your-own-extension/video-filter.mdx\u0000/en/realtime-media/marketplace/build/publish-extension",
  "en/realtime-media/marketplace/core-concepts.md\u0000/en/realtime-media/video/build/deploy-token-server",
  "en/realtime-media/marketplace/reference/downloads.mdx\u0000/en/realtime-media/marketplace/reference/screen-sharing",
  "en/realtime-media/marketplace/reference/security.mdx\u0000/en/realtime-media/video/build/authentication-workflow",
  "en/realtime-media/marketplace/reference/security.mdx\u0000/en/realtime-media/video/build/deploy-token-server",
  "en/realtime-media/marketplace/reference/security.mdx\u0000/en/realtime-media/video/build/media-stream-encryption",
  "en/realtime-media/media-pull/build/integration-best-practices.md\u0000/en/realtime-media/media-pull/reference/restful-authentication",
  "en/realtime-media/media-pull/get-started/enable-media-pull.mdx\u0000/en/realtime-media/media-pull/reference/restful-api",
  "en/realtime-media/media-pull/get-started/enable-media-pull.mdx\u0000/en/realtime-media/media-pull/reference/restful-api#create-api",
  "en/realtime-media/media-pull/get-started/enable-media-pull.mdx\u0000/en/realtime-media/media-pull/reference/restful-api#list-api",
  "en/realtime-media/media-push/build/integration-best-practices.md\u0000/en/realtime-media/media-push/reference/restful-authentication",
  "en/realtime-media/media-push/get-started/enable-media-push.md\u0000/en/realtime-media/media-push/build/restful-api",
  "en/realtime-media/on-premise-recording/build/set-up-authentication/authentication-workflow.mdx\u0000/en/realtime-media/on-premise-recording/token-authentication/integrate-token-generation",
  "en/realtime-media/on-premise-recording/index.mdx\u0000/en/realtime-media/on-premise-recording/build/authentication-workflow",
  "en/realtime-media/on-premise-recording/reference/pricing.mdx\u0000/en/realtime-media/video-calling/reference/billing-policies",
  "en/realtime-media/on-premise-recording/reference/pricing.mdx\u0000/en/realtime-media/video-calling/reference/glossary#dual-stream-mode",
  "en/realtime-media/on-premise-recording/reference/release-notes.mdx\u0000/en/realtime-media/on-premise-recording/product-overview",
  "en/realtime-media/on-premise-recording/reference/sunset.mdx\u0000/en/realtime-media/on-premise-recording/release-notes",
  "en/realtime-media/rtmp-gateway/build/set-up-and-authenticate/quickstart-best-practices.md\u0000/en/realtime-media/rtmp-gateway/reference/restful-authentication",
  "en/realtime-media/rtmp-gateway/quickstart.md\u0000/en/realtime-media/rtmp-gateway/reference/restful-authentication",
  "en/realtime-media/rtmp-gateway/reference/media-gateway-features.md\u0000/en/api-reference/rtmp-gateway",
  "en/realtime-media/speech-to-text/build/start-transcribing-and-translating/enable-service.md\u0000/en/realtime-media/speech-to-text/reference/restful-authentication",
  "en/realtime-media/speech-to-text/get-started/quickstart.md\u0000/en/realtime-media/speech-to-text/reference/restful-authentication",
  "en/realtime-media/speech-to-text/reference/firewall.md\u0000/en/realtime-media/video/build/cloud-proxy",
  "en/realtime-media/speech-to-text/reference/release-notes.md\u0000/en/api-reference/speech-to-text/restful/list",
  "en/realtime-media/speech-to-text/reference/rest-api.md\u0000/en/realtime-media/speech-to-text/reference/rest-api-v5/acquire",
  "en/realtime-media/speech-to-text/reference/rest-api.md\u0000/en/realtime-media/speech-to-text/reference/rest-api-v6/acquire",
  "en/realtime-media/speech-to-text/reference/rest-api.md\u0000/en/realtime-media/speech-to-text/reference/restful-authentication",
  "en/realtime-media/transcoding/build/availability.md\u0000/en/api-reference/cloud-transcoding/restful",
  "en/realtime-media/transcoding/build/integration.md\u0000/en/api-reference/cloud-transcoding/restful",
  "en/realtime-media/transcoding/reference/ncs-events.md\u0000/en/api-reference/cloud-transcoding/restful",
  "en/realtime-media/transcoding/reference/status-codes.md\u0000/en/api-reference/cloud-transcoding/restful",
  "en/realtime-media/transcoding/rest-quickstart.md\u0000/en/api-reference/cloud-transcoding/restful",
  "en/realtime-media/transcoding/rest-quickstart.md\u0000/en/realtime-media/reference/status-codes",
  "en/realtime-media/transcoding/rest-quickstart.md\u0000/en/realtime-media/transcoding/manage-agora-account",
  "en/realtime-media/transcoding/sdk-quickstart.md\u0000/en/api-reference/cloud-transcoding/restful",
  "en/realtime-media/video/build/authenticate-users/deploy-token-server.mdx\u0000/en/realtime-media/video/build/token-authentication/integrate-token-generation#upgrade-to-accesstoken2",
  "en/realtime-media/video/build/control-audio-and-devices/volume-control-and-mute.mdx\u0000/en/realtime-media/video/help/quality-issues/audio_low",
  "en/realtime-media/video/build/join-and-manage-channels/compile-run-sample-project.mdx\u0000/en/realtime-media/video/build/get-started/manage-agora-account#generate-a-temporary-token",
  "en/realtime-media/video/build/join-and-manage-channels/compile-run-sample-project.mdx\u0000/en/realtime-media/video/build/get-started/manage-agora-account#get-the-app-id",
  "en/realtime-media/video/build/secure-and-protect-channels/prevent-stream-bombing.mdx\u0000/en/realtime-media/video/build/get-started/manage-agora-account#switch-to-a-new-primary-certificate",
  "en/realtime-media/video/build/secure-and-protect-channels/prevent-stream-bombing.mdx\u0000/en/realtime-media/video/build/token-authentication/authentication-workflow",
  "en/realtime-media/video/build/secure-and-protect-channels/prevent-stream-bombing.mdx\u0000/en/realtime-media/video/build/token-authentication/authentication-workflow#co-host-token-authentication",
  "en/realtime-media/video/reference/common-problems.mdx\u0000/en/realtime-media/help",
  "en/realtime-media/video/reference/migration-guide.mdx\u0000/en/realtime-media/video/reference/start_live_electron_ng?platform=Electron#integrate-the-sdk",
  "en/realtime-media/video/reference/migration-guide.mdx\u0000/en/realtime-media/video/reference/start_live_react_native_ng?platform=React%20Native#integrate-the-sdk",
  "en/realtime-media/voice/reference/migration-guide.mdx\u0000/en/realtime-media/voice/advanced-features/join-multiple-channels",
  "en/realtime-media/voice/reference/migration-guide.mdx\u0000/en/realtime-media/voice/reference/start_live_electron_ng?platform=Electron#integrate-the-sdk",
  "en/realtime-media/voice/reference/migration-guide.mdx\u0000/en/realtime-media/voice/reference/start_live_react_native_ng?platform=React%20Native#integrate-the-sdk",
  "en/realtime-media/voice/reference/release-notes.mdx\u0000/en/realtime-media/api-reference?platform=blueprint&product=video-calling",
  "en/realtime-media/voice/reference/release-notes.mdx\u0000/en/realtime-media/help/other-issues/macos_15_beta",
  "en/realtime-media/voice/reference/release-notes.mdx\u0000/en/realtime-media/voice/advanced-features/use-an-extension",
  "en/realtime-media/voice/reference/release-notes.mdx\u0000/en/realtime-media/voice/reference/reference/migration-guide",
  "en/realtime-media/voice/reference/release-notes.mdx\u0000/en/realtime-media/voice/token-authentication/deploy-token-server#generate-wildcard-tokens",
  "en/realtime-media/whiteboard/build/authenticate-users/authentication-workflow.md\u0000/en/realtime-media/whiteboard/build/authenticate-users/enable-whiteboard#get-security-credentials-for-your-whiteboard-project",
  "en/realtime-media/whiteboard/build/authenticate-users/authentication-workflow.md\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion#start-file-conversion-post",
  "en/realtime-media/whiteboard/build/authenticate-users/authentication-workflow.md\u0000/en/realtime-media/whiteboard/reference/rest-api/room-management#create-a-room-post",
  "en/realtime-media/whiteboard/build/authenticate-users/authentication-workflow.md\u0000/en/realtime-media/whiteboard/reference/rest-api/room-management#get-a-room-list-get",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-rest.md\u0000/en/realtime-media/whiteboard/build/authenticate-users/enable-whiteboard#get-security-credentials-for-your-whiteboard-project",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-rest.md\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion#query-the-progress-of-a-file-conversion-task",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-rest.md\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion#start-file-conversion",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-rest.md\u0000/en/realtime-media/whiteboard/reference/rest-api/overview#status-codes",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-rest.md\u0000/en/realtime-media/whiteboard/reference/rest-api/room-management#create-a-room-post",
  "en/realtime-media/whiteboard/build/authenticate-users/generate-token-rest.md\u0000/en/realtime-media/whiteboard/reference/rest-api/room-management#get-room-information-get",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/file-conversion-overview.md\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/file-conversion-overview.md\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion#query-the-progress-of-a-file-conversion-task",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/file-conversion-overview.md\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion#start-file-conversion",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/file-conversion-overview.md\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion-deprecated",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/file-conversion-overview.md\u0000/en/realtime-media/whiteboard/reference/rest-api/room-management#create-a-room-post",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/scenes/display-files-white.mdx\u0000/en/realtime-media/whiteboard/reference/file-conversion#static-file-conversion",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/scenes/display-files-white.mdx\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/scenes/display-files-white.mdx\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion#dynamic-file-conversion",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/scenes/display-files-white.mdx\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion#query-the-progress-of-a-file-conversion-task",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/scenes/display-files-white.mdx\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion#start-file-conversion",
  "en/realtime-media/whiteboard/build/display-files-and-manage-scenes/scenes/overview.mdx\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion",
  "en/realtime-media/whiteboard/build/manage-agora-account.md\u0000/en/realtime-media/whiteboard/build/authentication-workflow",
  "en/realtime-media/whiteboard/build/manage-agora-account.md\u0000/en/realtime-media/whiteboard/build/enable-whiteboard",
  "en/realtime-media/whiteboard/build/manage-agora-account.md\u0000/en/realtime-media/whiteboard/build/generate-token-rest",
  "en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/enable-whiteboard.md\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion",
  "en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/enable-whiteboard.md\u0000/en/realtime-media/whiteboard/reference/rest-api/room-management#create-a-room-post",
  "en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/enable-whiteboard.md\u0000/en/realtime-media/whiteboard/reference/rest-api/screenshots",
  "en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/get-started-sdk.mdx\u0000/en/realtime-media/whiteboard/reference/rest-api/room-management#create-a-room-post",
  "en/realtime-media/whiteboard/build/set-up-and-build-your-first-app/get-started-uikit.mdx\u0000/en/realtime-media/whiteboard/reference/rest-api/room-management#create-a-room-post",
  "en/realtime-media/whiteboard/overview/pricing.md\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion#query-the-progress-of-a-file-conversion-task",
  "en/realtime-media/whiteboard/overview/pricing.md\u0000/en/realtime-media/whiteboard/reference/rest-api/room-management##disable-a-room-patch",
  "en/realtime-media/whiteboard/reference/file-conversion-overview-deprecated.mdx\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion-deprecated#query-file-conversion-progress-get",
  "en/realtime-media/whiteboard/reference/file-conversion-overview-deprecated.mdx\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion-deprecated#start-file-conversion-post",
  "en/realtime-media/whiteboard/reference/file-conversion-overview-deprecated.mdx\u0000/en/realtime-media/whiteboard/reference/rest-api/room-management#create-a-room-post",
  "en/realtime-media/whiteboard/reference/security.md\u0000/en/realtime-media/whiteboard/reference/rest-api/file-conversion",
  "en/realtime-media/whiteboard/reference/security.md\u0000/en/realtime-media/whiteboard/reference/rest-api/overview",
  "en/realtime-media/agora-analytics/build/explore-and-analyze-data/chat-data-insights.md\u0000/en/realtime-media/agora-analytics/build/chat-data-metrics",
  "en/realtime-media/interactive-live-streaming/build/apply-effects-and-enhancements/metakit.mdx\u0000/en/realtime-media/video/get-started-sdk",
  "en/realtime-media/interactive-live-streaming/build/authenticate-users/integrate-token-generation.md\u0000/en/realtime-media/interactive-live-streaming/realtime-media/video/build/authenticate-users/use-tokens",
  "en/realtime-media/interactive-live-streaming/build/control-audio-and-devices/volume-control-and-mute.mdx\u0000/en/realtime-media/interactive-live-streaming/build/control-audio-and-devices/custom-audio",
  "en/realtime-media/interactive-live-streaming/build/control-audio-and-devices/volume-control-and-mute.mdx\u0000/en/realtime-media/interactive-live-streaming/build/control-audio-and-devices/custom-video",
  "en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/app-size-optimization.mdx\u0000/en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/screen-sharing",
  "en/realtime-media/interactive-live-streaming/build/optimize-quality-and-connection/app-size-optimization.mdx\u0000/en/api-reference/sdks",
  "en/realtime-media/interactive-live-streaming/build/process-raw-and-custom-media/screenshot-upload.mdx\u0000/en/realtime-media/interactive-live-streaming/build/process-raw-and-custom-media/app-size-optimization",
  "en/realtime-media/interactive-live-streaming/build/secure-and-protect-channels/prevent-stream-bombing.mdx\u0000/en/realtime-media/interactive-live-streaming/authenticate-users/use-tokens",
  "en/realtime-media/interactive-live-streaming/build/secure-and-protect-channels/prevent-stream-bombing.mdx\u0000/en/api-reference/sdks",
  "en/realtime-media/interactive-live-streaming/build/set-up-your-project/compile-run-sample-project.mdx\u0000/en/api-reference/sdks",
  "en/realtime-media/interactive-live-streaming/reference/pricing-legacy.md\u0000/en/realtime-media/interactive-live-streaming/reference/reference/pricing",
  "en/realtime-media/interactive-live-streaming/reference/pricing.mdx\u0000/en/realtime-media/interactive-live-streaming/reference/subscription-packages",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/apply-video-effects/beauty-effect",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/apply-video-effects/virtual-background",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/apply-video-effects/watermark",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/authenticate-users/authentication-workflow",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/customize-audio-processing/use-an-extension",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/enhance-the-audio-experience/ai-noise-suppression",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/join-and-manage-channels/preload-channels",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/manage-connection-and-quality/cloud-proxy",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/manage-connection-and-quality/geofencing",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/manage-connection-and-quality/optimize-multihost-video",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/optimize-and-operate/app-size-optimization",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/optimize-and-operate/app-size-optimization#use-tree-shaking",
  "en/realtime-media/interactive-live-streaming/reference/release-notes.mdx\u0000/en/realtime-media/interactive-live-streaming/build/optimize-and-operate/receive-notifications#104-broadcaster-leave-channel",
  "en/realtime-media/interactive-live-streaming/reference/security.md\u0000/en/realtime-media/video/build/authenticate-users/use-tokens",
  "en/realtime-media/interactive-live-streaming/reference/security.md\u0000/en/realtime-media/video/build/secure-and-protect-channels/media-stream-encryption",
  "en/realtime-media/iot/build/manage-agora-account.md\u0000/en/realtime-media/iot/reference/console-overview",
  "en/realtime-media/iot/build/set-up-authentication-and-security/media-stream-encryption.mdx\u0000/en/realtime-media/iot/build/get-started/get-started-sdk",
  "en/realtime-media/iot/build/set-up-authentication-and-security/media-stream-encryption.mdx\u0000/en/realtime-media/iot/build/get-started/manage-agora-account#generate-a-temporary-token",
  "en/realtime-media/iot/build/stream-and-optimize-media/ensure-channel-quality.mdx\u0000/en/realtime-media/iot/build/get-started/get-started-sdk",
  "en/realtime-media/iot/build/stream-and-optimize-media/ensure-channel-quality.mdx\u0000/en/realtime-media/iot/build/get-started/manage-agora-account#generate-a-temporary-token",
  "en/realtime-media/iot/build/stream-and-optimize-media/multi-channel-streaming.mdx\u0000/en/realtime-media/iot/build/get-started/get-started-sdk",
  "en/realtime-media/iot/build/stream-and-optimize-media/multi-channel-streaming.mdx\u0000/en/realtime-media/iot/build/get-started/manage-agora-account#generate-a-temporary-token",
  "en/realtime-media/iot/quickstart.mdx\u0000/en/realtime-media/iot/build/manage-agora-account#generate-a-temporary-token",
  "zh-CN/ai/custom-llm.mdx\u0000/zh-CN/ai/audio-modality",
  "zh-CN/ai/interrupt-agent.mdx\u0000/zh-CN/overview/billing",
  "zh-CN/ai/landing-page.md\u0000/zh-CN/ai/get-started/quick-start",
  "zh-CN/ai/landing-page.md\u0000/zh-CN/ai/operations/start-agent",
  "zh-CN/ai/short-term-memory.mdx\u0000/zh-CN/webhook/ncs-events#103-agent-history",
  "zh-CN/api-reference/api-ref/rtmp-gateway/restful.md\u0000/zh-CN/api-reference/api-ref/rtmp-gateway/create-reset-template",
  "zh-CN/api-reference/api-ref/rtmp-gateway/restful.md\u0000/zh-CN/api-reference/api-ref/rtmp-gateway/create-streaming-key",
  "zh-CN/api-reference/api-ref/rtmp-gateway/restful.md\u0000/zh-CN/api-reference/api-ref/rtmp-gateway/query-ip-address",
  "zh-CN/api-reference/api-ref/rtmp-gateway/restful.md\u0000/zh-CN/api-reference/api-ref/rtmp-gateway/query-streaming-list",
  "zh-CN/api-reference/api-ref/signaling/index.md\u0000/zh-CN/api-reference/rtm",
  "zh-CN/api-reference/api-ref/signaling/index.md\u0000/zh-CN/realtime-media/rtm/rest-api",
  "zh-CN/api-reference/api-ref/signaling/restful.md\u0000/zh-CN/realtime-media/rtm/rest-api",
  "zh-CN/api-reference/api-ref/whiteboard/restful.md\u0000/zh-CN/api-reference/api-ref/whiteboard/create-room",
  "zh-CN/api-reference/api-ref/whiteboard/restful.md\u0000/zh-CN/api-reference/api-ref/whiteboard/scene-path-list",
  "zh-CN/api-reference/api-ref/whiteboard/restful.md\u0000/zh-CN/api-reference/api-ref/whiteboard/screenshot-scene",
  "zh-CN/api-reference/api-ref/whiteboard/restful.md\u0000/zh-CN/api-reference/api-ref/whiteboard/start-file-conversion",
  "zh-CN/api-reference/conversational-ai/rest-api/index.md\u0000/zh-CN/api-reference/conversational-ai/rest-api/status-codes",
  "zh-CN/best-practices/audio-settings.mdx\u0000/zh-CN/user-guides/interrupt-agent",
  "zh-CN/best-practices/audio-settings.mdx\u0000/zh-CN/user-guides/listen-agent-events",
  "zh-CN/best-practices/audio-settings.mdx\u0000/zh-CN/user-guides/send-multimodal-message",
  "zh-CN/best-practices/opt-latency.mdx\u0000/zh-CN/user-guides/listen-agent-events",
  "zh-CN/best-practices/opt-latency.mdx\u0000/zh-CN/webhook/enable-ncs",
  "zh-CN/best-practices/opt-latency.mdx\u0000/zh-CN/webhook/ncs-events#111-agent-metrics",
  "zh-CN/best-practices/release-notes.md\u0000/zh-CN/user-guides/custom-llm",
  "zh-CN/best-practices/release-notes.md\u0000/zh-CN/user-guides/custom-llm#\u5b9e\u65f6\u66f4\u65b0-tts-\u53c2\u6570",
  "zh-CN/best-practices/release-notes.md\u0000/zh-CN/user-guides/custom-llm#\u914d\u7f6e-llm-\u54cd\u5e94\u662f\u5426\u53ef\u6253\u65ad",
  "zh-CN/best-practices/release-notes.md\u0000/zh-CN/user-guides/interrupt-agent",
  "zh-CN/best-practices/release-notes.md\u0000/zh-CN/user-guides/listen-agent-events",
  "zh-CN/best-practices/release-notes.md\u0000/zh-CN/user-guides/send-multimodal-message",
  "zh-CN/best-practices/release-notes.md\u0000/zh-CN/webhook/enable-ncs",
  "zh-CN/best-practices/release-notes.md\u0000/zh-CN/webhook/ncs-events#103-agent-history",
  "zh-CN/introduction/index.mdx\u0000/zh-CN/realtime-media/rtm2",
  "zh-CN/realtime-media/index.md\u0000/zh-CN/realtime-media/rtm2",
  "zh-CN/realtime-media/rtc/index.md\u0000/zh-CN/realtime-media/rtc/audio",
  "zh-CN/realtime-media/rtc/index.md\u0000/zh-CN/realtime-media/rtc/quick-start/build-from-scratch",
  "zh-CN/realtime-media/rtc/index.md\u0000/zh-CN/realtime-media/rtc/quick-start/integrate-with-ai-tools",
  "zh-CN/realtime-media/rtc/index.md\u0000/zh-CN/realtime-media/rtc/reference",
  "zh-CN/realtime-media/rtc/index.md\u0000/zh-CN/realtime-media/rtc/video",
  "zh-CN/realtime-media/speech-to-text/audio-modality.mdx\u0000/zh-CN/realtime-media/get-started/quick-start",
  "zh-CN/realtime-media/speech-to-text/audio-modality.mdx\u0000/zh-CN/realtime-media/operations/agent-speak",
  "zh-CN/realtime-media/speech-to-text/audio-modality.mdx\u0000/zh-CN/realtime-media/operations/start-agent",
]);

function isKnownLegacyHostedLink(entry) {
  return KNOWN_LEGACY_HOSTED_LINKS.has(`${entry.sourcePath}\0${entry.normalizedHref}`);
}

function isGeneratedOrRedirectedAnchor(entry, targetPage) {
  return KNOWN_LEGACY_HASH_LINKS.has(
    `${entry.sourcePath}\0${entry.normalizedHref}`,
  );
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

function isLegacyShengwangDocHostHref(href) {
  const normalizedHref = href.startsWith('//') ? `https:${href}` : href;

  if (!/^https?:\/\//i.test(normalizedHref)) {
    return false;
  }

  try {
    return new URL(normalizedHref).host.toLowerCase() === 'doc.shengwang.cn';
  } catch {
    return false;
  }
}

function isZhCnOpenApiSourcePath(sourcePath) {
  return (
    sourcePath.startsWith('openapi/') && /\.zh-CN\.ya?ml$/i.test(sourcePath)
  );
}

function isApiReferenceMacroHref(href) {
  return /^{{\s*global\.API_REF_[A-Z0-9_]+\s*}}/i.test(href);
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

function isTemplatedHref(href) {
  return /\{\{\s*[\w.]+\s*\}\}/.test(href);
}

function isRootAssetHref(hrefPath) {
  return (
    /\.[a-z0-9]+$/i.test(hrefPath) && !/\.mdx?$/i.test(hrefPath)
  );
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
  const slugPath = [tab, ...slugSegments]
    .filter((segment) => segment && !ROUTE_GROUP_SEGMENT.test(segment))
    .join('/');

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

function getOpenApiSourceContexts() {
  const contexts = new Map();

  for (const lane of getOpenApiRouteLanesForAudit()) {
    for (const [locale, sourcePath] of Object.entries(lane.sourcePaths)) {
      const normalizedSourcePath = sourcePath
        .replace(/^content\//, '')
        .split(path.sep)
        .join(path.posix.sep);

      if (contexts.has(normalizedSourcePath) && locale !== 'en') {
        continue;
      }

      contexts.set(
        normalizedSourcePath,
        `${locale}/${lane.routePrefix}/index.mdx`,
      );
    }
  }

  return contexts;
}

const SUPPORTED_LOCALES = ['en', 'zh-CN'];

function getOpenApiRouteLanesForAudit() {
  const lanesPath = path.join(process.cwd(), 'src/lib/openapi/lanes.ts');
  const source = fs.readFileSync(lanesPath, 'utf8');

  return extractTopLevelObjects(source).map((block) => {
    const routePrefix = block.match(/routePrefix:\s*'([^']+)'/)?.[1];
    const sourcePathsBlock = extractObjectProperty(block, 'sourcePath');
    const hasSingleSourcePath = sourcePathsBlock.length === 0;
    const locales =
      block
        .match(/locales:\s*\[([^\]]+)\]/)?.[1]
        ?.match(/'([^']+)'/g)
        ?.map((value) => value.slice(1, -1)) ??
      (hasSingleSourcePath ? ['zh-CN'] : SUPPORTED_LOCALES);
    const sourcePaths =
      sourcePathsBlock.length > 0
        ? Object.fromEntries(
            [
              ...sourcePathsBlock.matchAll(/'?([A-Za-z-]+)'?:\s*'([^']+)'/g),
            ].map((match) => [match[1], match[2]]),
          )
        : Object.fromEntries(
            locales.map((locale) => [
              locale,
              block.match(/sourcePath:\s*'([^']+)'/)?.[1],
            ]),
          );
    const operationsBlock = extractObjectProperty(block, 'operations');
    const routeLeaves =
      operationsBlock.length > 0
        ? [...operationsBlock.matchAll(/routeLeaf:\s*'([^']+)'/g)].map(
            (match) => match[1],
          )
        : extractTupleOperationRouteLeaves(
            extractArrayProperty(block, 'operations'),
          );

    if (!routePrefix || routeLeaves.length === 0) {
      throw new Error(
        'Failed to parse OpenAPI route lane from src/lib/openapi/lanes.ts',
      );
    }

    return { locales, routePrefix, routeLeaves, sourcePaths };
  });
}

function extractTupleOperationRouteLeaves(raw) {
  return [
    ...raw.matchAll(
      /\[\s*'[^']+'\s*,\s*'([^']+)'\s*,\s*'[^']*'\s*,\s*'[^']*'\s*,?\s*\]/g,
    ),
  ].map((match) => match[1]);
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

function extractArrayProperty(raw, propertyName) {
  const propIndex = raw.indexOf(`${propertyName}:`);
  if (propIndex < 0) return '';
  const start = raw.indexOf('[', propIndex);
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

    if (char === '[') {
      depth += 1;
      continue;
    }

    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        return raw.slice(start, index + 1);
      }
    }
  }

  return '';
}

function isIntentionallyHostedReference(routePath) {
  if (hasRouteGroupSegment(routePath)) {
    return false;
  }

  return HOSTED_REFERENCE_ROUTE_PREFIXES.some(
    (prefix) => routePath === prefix || routePath.startsWith(`${prefix}/`),
  );
}

function hasRouteGroupSegment(routePath) {
  return routePath
    .split('/')
    .some(
      (segment) =>
        ROUTE_GROUP_SEGMENT.test(segment) ||
        segment.includes('(') ||
        segment.includes(')'),
    );
}

const HOSTED_REFERENCE_ROUTE_PREFIXES = [
  '/en/api-reference/rtc/android',
  '/zh-CN/api-reference/rtc/android',
  '/en/api-reference/whiteboard',
  '/zh-CN/api-reference/whiteboard',
];

const LEGACY_HOSTED_ROUTE_PREFIXES = [
  '/help',
  '/sdks',
  '/signaling',
  '/cloud-recording',
  '/real-time-stt',
  '/video-calling',
  '/voice-calling',
  '/interactive-live-streaming',
  '/on-premise-recording',
  '/agora-chat',
  '/best-practices',
  '/media-push',
  '/on-premise-recording',
  '/en/cloud-recording',
  '/en/video-calling',
  '/en/signaling',
  '/en/interactive-whiteboard',
  '/en/agora-chat',
  '/en/voice-calling',
  '/en/interactive-live-streaming',
  '/en/on-premise-recording',
  '/en/3.x',
  '/en/best-practices',
  '/zh-CN/get-started',
  '/zh-CN/best-practice',
  '/zh-CN/api',
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

function getStaticRedirectRoutePaths() {
  const routePaths = new Map();

  for (const rule of getStaticRedirectRules()) {
    if (rule.q) {
      continue;
    }

    routePaths.set(normalizeRoutePath(rule.p), {
      resolution: 'static-redirect',
      resolvedTargetPath: rule.t,
    });
  }

  return routePaths;
}

function getStaticRedirectRouteEntry(routePath, search) {
  const normalizedRoutePath = normalizeRoutePath(routePath);
  const normalizedSearch = normalizeSearch(search);
  const rules = getStaticRedirectRules();
  const rule =
    rules.find(
      (item) =>
        normalizeRoutePath(item.p) === normalizedRoutePath &&
        normalizeSearch(item.q) === normalizedSearch,
    ) ??
    rules.find(
      (item) => normalizeRoutePath(item.p) === normalizedRoutePath && !item.q,
    );

  return rule
    ? {
        resolution: 'static-redirect',
        resolvedTargetPath: rule.t,
      }
    : null;
}

function getStaticRedirectRules() {
  const redirectsPath = path.join(
    process.cwd(),
    'src/lib/legacy-sitemap/static-redirects.json',
  );

  try {
    return JSON.parse(fs.readFileSync(redirectsPath, 'utf8'));
  } catch {
    return [];
  }
}

function normalizeRoutePath(routePath) {
  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`;

  return normalized.replace(/\/+$/, '') || '/';
}

function normalizeSearch(search) {
  if (!search) {
    return '';
  }

  return search.startsWith('?') ? search : `?${search}`;
}

function normalizeDocsRouteHref(href, { sourcePath = '' } = {}) {
  return normalizeRtcAndroidVersionedHref(
    normalizeLegacyRootDocsHref(href),
    sourcePath,
  );
}

function normalizeLegacyRootDocsHref(href) {
  const markdownHref = normalizeRootMarkdownDocsHref(href);

  if (markdownHref !== href) {
    return normalizeLegacyRootDocsHref(markdownHref);
  }

  const indexHref = normalizeIndexDocsHref(href);

  if (indexHref !== href) {
    return normalizeLegacyRootDocsHref(indexHref);
  }

  const parsed = splitHref(href);
  const segments = parsed.path.split('/').filter(Boolean);
  const [locale, group, leaf] = segments;

  const mappedAiPath = getLegacyAiPath(segments);

  if (mappedAiPath) {
    return `${mappedAiPath}${parsed.search}${parsed.hash}`;
  }

  const mappedConversationalAiPath =
    getLegacyConversationalAiRestPath(segments);

  if (mappedConversationalAiPath) {
    return `${mappedConversationalAiPath}${parsed.search}${parsed.hash}`;
  }

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
    return getLegacyConversationalAiRestPath(segments);
  }

  if (
    locale === 'en' &&
    group === 'api-reference' &&
    segments.length === 3 &&
    isLegacyEnglishApiReferenceProductPath(leaf)
  ) {
    return leaf === 'video' || leaf === 'voice'
      ? '/en/api-reference/api-ref/rtc'
      : `/en/api-reference/api-ref/${leaf}`;
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

function getLegacyConversationalAiRestPath(segments) {
  const [locale, tab, product, restApi, group, leaf] = segments;

  if (
    (locale !== 'en' && locale !== 'zh-CN') ||
    tab !== 'api-reference' ||
    product !== 'conversational-ai' ||
    restApi !== 'rest-api'
  ) {
    return null;
  }

  if (!group) {
    return locale === 'en'
      ? `/${locale}/api-reference/api-ref/conversational-ai`
      : null;
  }

  if (group === 'authentication' || group === 'status-codes') {
    return locale === 'en'
      ? `/${locale}/api-reference/api-ref/conversational-ai/${group}`
      : null;
  }

  if (group !== 'agent' || !leaf) {
    return null;
  }

  const routeLeaf = LEGACY_CONVERSATIONAL_AI_AGENT_ROUTE_LEAVES[leaf];

  return routeLeaf
    ? `/${locale}/api-reference/api-ref/conversational-ai/${routeLeaf}`
    : null;
}

function getLegacyAiPath(segments) {
  const [locale, tab, group, ...rest] = segments;

  if ((locale !== 'en' && locale !== 'zh-CN') || tab !== 'ai') {
    return null;
  }

  const [leaf, subleaf] = rest;

  if (group === 'build' && leaf) {
    const groupedBuildLeaf = LEGACY_AI_BUILD_GROUP_ROUTE_LEAVES[leaf];

    if (groupedBuildLeaf && rest.length === 1) {
      return `/${locale}/ai/build/${groupedBuildLeaf}`;
    }

    if (leaf === 'reference') {
      const referenceLeaf = rest.at(1);

      return referenceLeaf ? `/${locale}/ai/reference/${referenceLeaf}` : null;
    }

    if (leaf === 'get-started') {
      return subleaf ? `/${locale}/ai/get-started/${subleaf}` : null;
    }

    if (leaf === 'best-practices') {
      return subleaf ? `/${locale}/ai/best-practices/${subleaf}` : null;
    }

    if (leaf === 'custom-model-integration') {
      const movedLeaf = LEGACY_AI_BUILD_CUSTOM_MODEL_ROUTE_LEAVES[subleaf];

      if (movedLeaf) {
        return `/${locale}/ai/build/${movedLeaf}`;
      }
    }

    if (leaf === 'shape-the-conversation') {
      const movedLeaf = LEGACY_AI_BUILD_SHAPE_ROUTE_LEAVES[subleaf];

      if (movedLeaf) {
        return `/${locale}/ai/build/${movedLeaf}`;
      }
    }

    if (leaf === 'handle-runtime-events') {
      const movedLeaf = LEGACY_AI_BUILD_RUNTIME_EVENTS_ROUTE_LEAVES[subleaf];

      if (movedLeaf) {
        return `/${locale}/ai/build/${movedLeaf}`;
      }
    }
  }

  if (group === 'api-reference') {
    const conversationalAiPath = getLegacyConversationalAiRestPath([
      locale,
      'api-reference',
      ...rest,
    ]);

    if (conversationalAiPath) {
      return conversationalAiPath;
    }
  }

  if (group === 'introduction' && leaf === 'realtime-audio-video') {
    return `/${locale}/introduction/realtime-audio-video`;
  }

  return null;
}

function isLegacyEnglishApiReferenceProductPath(path) {
  if (!path || path.startsWith('api-ref/')) {
    return false;
  }

  if (path === 'video' || path === 'voice') {
    return true;
  }

  return API_REFERENCE_PRODUCT_SLUGS.includes(path);
}

const API_REFERENCE_PRODUCT_SLUGS = [
  'cloud-recording',
  'cloud-transcoding',
  'conversational-ai',
  'broadcast-streaming',
  'im',
  'media-pull',
  'media-push',
  'on-premise-recording',
  'rtc',
  'signaling',
  'speech-to-text',
];

const LEGACY_CONVERSATIONAL_AI_AGENT_ROUTE_LEAVES = {
  history: 'history',
  interrupt: 'interrupt',
  join: 'join',
  leave: 'leave',
  list: 'list',
  query: 'query',
  speak: 'speak',
  think: 'think',
  turns: 'turns',
  update: 'update',
};

const LEGACY_AI_BUILD_GROUP_ROUTE_LEAVES = {
  'debug-agent-failures': 'handle-runtime-events/debug-agent-failures',
  'event-notifications': 'handle-runtime-events/event-notifications',
  'get-runtime-events': 'handle-runtime-events/get-runtime-events',
  'monitor-agent-runtime': 'handle-runtime-events/monitor-agent-runtime',
  presets: 'custom-model-integration/presets',
  'retrieve-session-history': 'handle-runtime-events/retrieve-session-history',
  webhooks: 'handle-runtime-events/webhooks',
};

const LEGACY_AI_BUILD_CUSTOM_MODEL_ROUTE_LEAVES = {
  transcripts: 'transcripts',
};

const LEGACY_AI_BUILD_SHAPE_ROUTE_LEAVES = {
  'custom-llm': 'custom-model-integration/custom-llm',
};

const LEGACY_AI_BUILD_RUNTIME_EVENTS_ROUTE_LEAVES = {
  'interrupt-agent': 'shape-the-conversation/interrupt-agent',
  'short-term-memory': 'shape-the-conversation/short-term-memory',
  transcripts: 'transcripts',
};

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
  '/api-reference/conversational-ai/rest-api':
    '/en/api-reference/api-ref/conversational-ai',
  '/api-reference/conversational-ai/rest-api/agent/history':
    '/en/api-reference/api-ref/conversational-ai/history',
  '/api-reference/conversational-ai/rest-api/agent/interrupt':
    '/en/api-reference/api-ref/conversational-ai/interrupt',
  '/api-reference/conversational-ai/rest-api/agent/join':
    '/en/api-reference/api-ref/conversational-ai/join',
  '/api-reference/conversational-ai/rest-api/agent/leave':
    '/en/api-reference/api-ref/conversational-ai/leave',
  '/api-reference/conversational-ai/rest-api/agent/list':
    '/en/api-reference/api-ref/conversational-ai/list',
  '/api-reference/conversational-ai/rest-api/agent/query':
    '/en/api-reference/api-ref/conversational-ai/query',
  '/api-reference/conversational-ai/rest-api/agent/speak':
    '/en/api-reference/api-ref/conversational-ai/speak',
  '/api-reference/conversational-ai/rest-api/agent/think':
    '/en/api-reference/api-ref/conversational-ai/think',
  '/api-reference/conversational-ai/rest-api/agent/turns':
    '/en/api-reference/api-ref/conversational-ai/turns',
  '/api-reference/conversational-ai/rest-api/agent/update':
    '/en/api-reference/api-ref/conversational-ai/update',
  '/api-reference/conversational-ai/rest-api/authentication':
    '/en/api-reference/api-ref/conversational-ai/authentication',
  '/api-reference/conversational-ai/rest-api/status-codes':
    '/en/api-reference/api-ref/conversational-ai/status-codes',
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
  '/en/realtime-media/voice/build/enhance-the-audio-experience/ai-noise-suppression/web':
    '/en/realtime-media/voice/build/enhance-the-audio-experience/ai-noise-suppression',
  '/en/realtime-media/voice/build/optimize-and-operate/app-size-optimization/android':
    '/en/realtime-media/voice/build/optimize-and-operate/app-size-optimization',
  '/en/realtime-media/voice/build/optimize-and-operate/app-size-optimization/ios':
    '/en/realtime-media/voice/build/optimize-and-operate/app-size-optimization',
  '/en/3.x/video-calling/introduction/release-notes':
    '/en/realtime-media/video/reference/release-notes',
  '/media-push/product-overview': '/en/api-reference/api-ref/rtc',
  '/sdks': '/en/api-reference/sdks',
  '/en/ai/best-practices/start-stop-agent': '/en/ai/build/start-stop-agent',
  '/en/ai/models/mllm/overview': '/en/ai/models/mllm/gemini',
  '/en/best-practices/geofencing':
    '/en/realtime-media/voice/build/manage-connection-and-quality/geofencing',
  '/en/api-reference/api-ref/conversational-ai/server-sdk/go':
    '/en/api-reference/api-ref/server-sdk/go',
  '/en/api-reference/api-ref/conversational-ai/server-sdk/python':
    '/en/api-reference/api-ref/server-sdk/python',
  '/en/api-reference/api-ref/conversational-ai/server-sdk/typescript':
    '/en/api-reference/api-ref/server-sdk/typescript',
  '/video-calling/get-started/get-started-sdk':
    '/en/realtime-media/video/quickstart',
  '/video-calling/get-started/manage-agora-account':
    '/en/realtime-media/video/manage-agora-account',
  '/video-calling/token-authentication/authentication-workflow':
    '/en/realtime-media/video/build/authenticate-users/authentication-workflow',
  '/video-calling/token-authentication/deploy-token-server':
    '/en/realtime-media/video/build/authenticate-users/deploy-token-server',
};

function normalizeRootMarkdownDocsHref(href) {
  const parsed = splitHref(href);

  if (!parsed.path.startsWith('/') || !/\.mdx?$/i.test(parsed.path)) {
    return href;
  }

  const withoutExtension = parsed.path
    .replace(/\/index\.mdx?$/i, '')
    .replace(/\.mdx?$/i, '');
  const normalizedPath = withoutExtension || '/';

  return `${normalizedPath}${parsed.search}${parsed.hash}`;
}

function normalizeIndexDocsHref(href) {
  const parsed = splitHref(href);

  if (!parsed.path.endsWith('/index')) {
    return href;
  }

  const path = parsed.path.slice(0, -'/index'.length) || '/';

  return `${path}${parsed.search}${parsed.hash}`;
}

function normalizeRtcAndroidVersionedHref(href, sourcePath) {
  const versionScope = getRtcAndroidVersionScope(sourcePath);

  if (!versionScope) {
    return href;
  }

  const parsed = splitHref(href);
  const prefix = `/${versionScope.locale}/api-reference/rtc/android`;

  if (
    !parsed.path.startsWith(`${prefix}/`) ||
    parsed.path.startsWith(`${prefix}/${versionScope.version}/`)
  ) {
    return href;
  }

  return `${prefix}/${versionScope.version}${parsed.path.slice(prefix.length)}${parsed.search}${parsed.hash}`;
}

function getRtcAndroidVersionScope(contentPath) {
  if (!contentPath) {
    return null;
  }

  const [locale, tab, product, platform, version] = contentPath
    .split('/')
    .filter(Boolean);

  if (
    tab !== 'api-reference' ||
    product !== 'rtc' ||
    platform !== 'android' ||
    !version ||
    /\.mdx?$/i.test(version) ||
    version === '(current)'
  ) {
    return null;
  }

  return { locale, version };
}

function toContentPath(docsRoot, filePath) {
  return path.relative(docsRoot, filePath).split(path.sep).join(path.posix.sep);
}

export function formatReport(stats, maxSamples) {
  const lines = [
    '# Docs Link Audit',
    '',
    `docsFiles: ${stats.docsFiles}`,
    `openapiFiles: ${stats.openapiFiles}`,
    `totalLinks: ${stats.totalLinks}`,
    `relativeMarkdownLinks: ${stats.relativeMarkdownLinks.length}`,
    `resolvedRelativeMarkdownLinks: ${stats.resolvedRelativeMarkdownLinks.length}`,
    `missingRelativeMarkdownLinks: ${stats.missingRelativeMarkdownLinks.length}`,
    `legacyRootDocLinks: ${stats.legacyRootDocLinks.length}`,
    `legacyShengwangDocHostLinks: ${stats.legacyShengwangDocHostLinks.length}`,
    `apiReferenceMacroLinks: ${stats.apiReferenceMacroLinks.length}`,
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
    `skippedTemplateLinks: ${stats.skippedTemplateLinks.length}`,
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
  appendInvalidSection(
    lines,
    'Legacy doc.shengwang.cn links in zh-CN OpenAPI',
    stats.legacyShengwangDocHostLinks,
    maxSamples,
  );
  appendSection(
    lines,
    'Sample API reference macro links',
    stats.apiReferenceMacroLinks,
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
    'Sample skipped template links',
    stats.skippedTemplateLinks,
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
