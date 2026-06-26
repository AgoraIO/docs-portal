import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const DEFAULT_MAX_SAMPLES = 30;

export function auditDocsLinks({
  docsRoot = path.join(process.cwd(), 'content', 'docs'),
} = {}) {
  const stats = createStats();
  const docsFiles = listMarkdownFiles(docsRoot);
  const existingContentPaths = new Set(
    docsFiles.map((file) => toContentPath(docsRoot, file)),
  );
  const existingRoutePaths = getExistingRoutePaths(existingContentPaths);

  for (const filePath of docsFiles) {
    const sourcePath = toContentPath(docsRoot, filePath);
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
    missingRelativeMarkdownLinks: [],
    relativeAssetLinks: 0,
    relativeMarkdownLinks: [],
    resolvedRelativeMarkdownLinks: [],
    rootLinks: 0,
    totalLinks: 0,
  };
}

function getExistingRoutePaths(existingContentPaths) {
  const routePaths = new Map();

  for (const contentPath of existingContentPaths) {
    const routePath = getRoutePath(contentPath);

    if (routePath) {
      routePaths.set(routePath, {
        resolution: 'route',
        resolvedTargetPath: contentPath,
      });
    }
  }

  for (const routePath of getOpenApiRoutePathsForAudit()) {
    routePaths.set(routePath, {
      resolution: 'openapi-route',
      resolvedTargetPath: `openapi:${routePath}`,
    });
  }

  return routePaths;
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
    stats.rootLinks += 1;
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
    const locales = block.match(/locales:\s*\[([^\]]+)\]/)?.[1]
      ?.match(/'([^']+)'/g)
      ?.map((value) => value.slice(1, -1)) ?? SUPPORTED_LOCALES;
    const operationsBlock = extractObjectProperty(block, 'operations');
    const routeLeaves = [...operationsBlock.matchAll(/routeLeaf:\s*'([^']+)'/g)]
      .map((match) => match[1]);

    if (!routePrefix || routeLeaves.length === 0) {
      throw new Error('Failed to parse OpenAPI route lane from src/lib/openapi/lanes.ts');
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

    if (char === '\'' || char === '"' || char === '`') {
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

    if (char === '\'' || char === '"' || char === '`') {
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

function normalizeLegacyRootDocsHref(href) {
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
};

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
  console.log(`rootLinks: ${stats.rootLinks}`);
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
  };
}

function main() {
  const repoRoot = process.cwd();
  const docsRoot = path.join(repoRoot, 'content', 'docs');
  const options = parseArgs(process.argv.slice(2));
  const stats = auditDocsLinks({ docsRoot });

  printReport(stats, options.maxSamples);

  if (options.failOnMissing && stats.missingRelativeMarkdownLinks.length > 0) {
    process.exitCode = 1;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
