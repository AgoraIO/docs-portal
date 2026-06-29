import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const DEFAULT_MAX_SAMPLES = 30;
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
    docsFiles: 0,
    externalLinks: 0,
    hashLinks: 0,
    legacyRootDocLinks: [],
    missingRootLinks: [],
    missingRelativeMarkdownLinks: [],
    relativeAssetLinks: 0,
    relativeMarkdownLinks: [],
    resolvedRelativeMarkdownLinks: [],
    rootLinks: [],
    skippedRootLinks: [],
    totalLinks: 0,
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
    [...markdown.matchAll(/<PlatformStructured\s+platform=["']([^"']+)["']/g)].flatMap(
      (match) => platformRouteAliases(match[1]),
    ),
  );

  return [...platforms]
    .filter(Boolean)
    .map((platform) => `${routePath}/${platform}`);
}

function platformRouteAliases(platform) {
  if (platform === 'javascript' || platform === 'web' || platform === 'react-js') {
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
  const markdownLinkPattern = /(!?)\[[^\]\n]*\]\(([^)\n]+)\)/g;
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

function classifyLink(
  sourcePath,
  link,
  { existingContentPaths, existingRoutePaths, stats },
) {
  const href = link.href.trim();

  if (link.isImage) {
    stats.assetLinks += 1;

    if (href.startsWith('/')) {
      return;
    }
  }

  if (href.startsWith('#')) {
    stats.hashLinks += 1;
    return;
  }

  if (href.startsWith('//')) {
    stats.externalLinks += 1;
    return;
  }

  if (href.startsWith('/doc/')) {
    stats.legacyRootDocLinks.push({ sourcePath, href, source: link.source });
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
      return;
    }

    stats.missingRootLinks.push(entry);
    return;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    stats.externalLinks += 1;
    return;
  }

  const parsed = splitHref(href);

  if (!/\.mdx?$/i.test(parsed.path)) {
    stats.relativeAssetLinks += 1;
    return;
  }

  const entry = resolveRelativeMarkdownLink(
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

    return;
  }

  stats.missingRelativeMarkdownLinks.push(entry);
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

function resolveRelativeMarkdownLink(
  sourcePath,
  href,
  parsed,
  existingContentPaths,
  existingRoutePaths,
) {
  const targetPath = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), parsed.path),
  );
  const normalizedHref = normalizeLegacyRootDocsHref(
    toCleanRoute(targetPath, parsed),
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

  if (existingContentPaths.has(targetPath)) {
    return {
      ...entry,
      resolved: true,
      resolvedTargetPath: targetPath,
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

function printReport(stats, maxSamples) {
  console.log('# Docs Link Audit');
  console.log('');
  console.log(`docsFiles: ${stats.docsFiles}`);
  console.log(`totalLinks: ${stats.totalLinks}`);
  console.log(`relativeMarkdownLinks: ${stats.relativeMarkdownLinks.length}`);
  console.log(
    `resolvedRelativeMarkdownLinks: ${stats.resolvedRelativeMarkdownLinks.length}`,
  );
  console.log(
    `missingRelativeMarkdownLinks: ${stats.missingRelativeMarkdownLinks.length}`,
  );
  console.log(`legacyRootDocLinks: ${stats.legacyRootDocLinks.length}`);
  console.log(`rootLinks: ${stats.rootLinks.length}`);
  console.log(`skippedRootLinks: ${stats.skippedRootLinks.length}`);
  console.log(`missingRootLinks: ${stats.missingRootLinks.length}`);
  console.log(`externalLinks: ${stats.externalLinks}`);
  console.log(`hashLinks: ${stats.hashLinks}`);
  console.log(`assetLinks: ${stats.assetLinks}`);
  console.log(`relativeAssetLinks: ${stats.relativeAssetLinks}`);

  printSection(
    'Sample valid relative Markdown links',
    stats.relativeMarkdownLinks,
    maxSamples,
  );
  printSection(
    'Sample route-resolved relative Markdown links',
    stats.resolvedRelativeMarkdownLinks,
    maxSamples,
  );
  printSection(
    'Sample missing relative Markdown links',
    stats.missingRelativeMarkdownLinks,
    maxSamples,
  );
  printSection(
    'Sample legacy /doc/* links',
    stats.legacyRootDocLinks,
    maxSamples,
  );
  printSection('Sample valid root links', stats.rootLinks, maxSamples);
  printSection(
    'Sample skipped hosted root links',
    stats.skippedRootLinks,
    maxSamples,
  );
  printSection('Sample missing root links', stats.missingRootLinks, maxSamples);
}

function printSection(title, entries, maxSamples) {
  console.log('');
  console.log(`## ${title}`);

  if (entries.length === 0) {
    console.log('none');
    return;
  }

  for (const entry of entries.slice(0, maxSamples)) {
    if ('targetPath' in entry) {
      const resolvedTarget =
        entry.resolvedTargetPath &&
        entry.resolvedTargetPath !== entry.targetPath
          ? `, resolved: ${entry.resolvedTargetPath}`
          : '';
      console.log(
        `- ${entry.sourcePath}: ${entry.href} => ${entry.normalizedHref} (${entry.targetPath}${resolvedTarget})`,
      );
      continue;
    }

    if ('resolvedTargetPath' in entry) {
      const resolvedTarget = entry.resolvedTargetPath
        ? ` (${entry.resolvedTargetPath})`
        : '';
      console.log(
        `- ${entry.sourcePath}: ${entry.href} => ${entry.normalizedHref}${resolvedTarget}`,
      );
      continue;
    }

    console.log(`- ${entry.sourcePath}: ${entry.href}`);
  }

  if (entries.length > maxSamples) {
    console.log(`- ... ${entries.length - maxSamples} more`);
  }
}

function parseArgs(args) {
  return {
    failOnMissing: args.includes('--fail-on-missing'),
    maxSamples: Number.parseInt(
      args.find((arg) => arg.startsWith('--max-samples='))?.split('=')[1] ??
        `${DEFAULT_MAX_SAMPLES}`,
      10,
    ),
    overviewCards: args.includes('--overview-cards'),
  };
}

function main() {
  const repoRoot = process.cwd();
  const docsRoot = path.join(repoRoot, 'content', 'docs');
  const options = parseArgs(process.argv.slice(2));
  const stats = auditDocsLinks({
    docsRoot,
    ...(options.overviewCards
      ? { sourcePaths: OVERVIEW_CARD_SOURCE_PATHS }
      : {}),
  });

  printReport(stats, options.maxSamples);

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
  main();
}
