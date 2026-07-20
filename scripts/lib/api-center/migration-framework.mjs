import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import { resolveExistingApiCenterTarget } from './existing-targets.mjs';

export const API_CENTER_WARNING_DEFINITIONS = {
  'asset-missing': {
    severity: 'error',
    explanation: 'A local asset referenced by the legacy body was not found.',
  },
  'broken-live-body-link': {
    severity: 'warning',
    explanation:
      'The live source body contains a link that currently returns HTTP 400/404.',
  },
  'existing-target-preserved': {
    severity: 'info',
    explanation:
      'An existing local MDX or OpenAPI target was preserved and queued for parity audit.',
  },
  'empty-source-body': {
    severity: 'info',
    explanation:
      'The legacy generator exposes a named page whose source body is intentionally empty.',
  },
  'empty-source-code': {
    severity: 'info',
    explanation:
      'The legacy source contains an empty code block; the migration preserves its anchor and omits the empty fence without inventing a signature.',
  },
  'generated-target-collision': {
    severity: 'error',
    explanation:
      'Two distinct generated pages attempted to write different content to one target.',
  },
  'generated-fragment-alias': {
    severity: 'info',
    explanation:
      'A stable alias was added so a legacy generated-page fragment remains reachable.',
  },
  'generated-fragment-normalized': {
    severity: 'info',
    explanation:
      'A generated-page fragment was rewritten to the unique stable anchor exposed by its local target.',
  },
  'lossy-table': {
    severity: 'warning',
    explanation:
      'A complex legacy table could not be represented as a simple GFM table without review.',
  },
  'manual-mdx-normalized': {
    severity: 'info',
    explanation:
      'Legacy MDX syntax was normalized to the repository Markdown/MDX authoring standard.',
  },
  'manual-platform-merge': {
    severity: 'info',
    explanation:
      'Multiple platform-specific legacy MDX sources were merged with PlatformStructured blocks.',
  },
  'manual-mdx-review': {
    severity: 'warning',
    explanation:
      'The legacy MDX converter found a construct that requires migration review.',
  },
  'manual-mdx-residue': {
    severity: 'error',
    explanation:
      'Unsupported legacy JSX or source syntax remains after MDX conversion.',
  },
  'manual-fragment-alias': {
    severity: 'info',
    explanation:
      'Stable aliases were added for legacy fragments that identify migrated headings.',
  },
  'manual-fragment-normalized': {
    severity: 'info',
    explanation:
      'A legacy fragment was rewritten to the unique stable anchor exposed by its local target.',
  },
  'missing-source-text': {
    severity: 'warning',
    explanation:
      'The authoritative source omits user-visible text needed by the target format; the migration leaves it empty and requires supplied copy instead of synthesizing text.',
  },
  'missing-live-fragment': {
    severity: 'warning',
    explanation:
      'The live source links to a fragment that is absent from the live target body.',
  },
  'owned-file-modified': {
    severity: 'warning',
    explanation:
      'A previously generated file was modified outside the generator and was not deleted.',
  },
  'unowned-target-preserved': {
    severity: 'warning',
    explanation:
      'A target already exists but is not owned by this generator, so it was not overwritten.',
  },
  'unresolved-fragment': {
    severity: 'warning',
    explanation:
      'A legacy fragment could not be mapped to a stable target fragment.',
  },
  'unresolved-link': {
    severity: 'warning',
    explanation: 'A legacy internal link has no resolved local target route.',
  },
  'source-only-link-removed': {
    severity: 'info',
    explanation:
      'A link present only in generated source had no local visible target and was rendered as text instead of linking back to the old site.',
  },
  'unsupported-html-structure': {
    severity: 'error',
    explanation:
      'The generator encountered a source structure it cannot convert without losing content.',
  },
};

export const API_CENTER_OUTPUT_ROOTS = [
  'content/docs/zh-CN/api-reference',
  'public/img/api-center-generated',
];

export const API_CENTER_OWNERSHIP_PATH =
  'docs/migration/api-center-generated-files.json';
export const API_CENTER_REPORT_JSON_PATH =
  'docs/migration/api-center-migration-report.json';
export const API_CENTER_REPORT_MD_PATH =
  'docs/migration/api-center-migration-report.md';
export const FAQ_MIGRATION_MAPPING_PATH =
  'docs/migration/generated/zh-cn-faq-migration/mapping.json';

const CODE_LANGUAGE_ALIASES = new Map([
  ['c#', 'csharp'],
  ['console', 'text'],
  ['js', 'javascript'],
  ['objective-c', 'objc'],
  ['objectivec', 'objc'],
  ['shell', 'bash'],
  ['sh', 'bash'],
  ['txt', 'text'],
  ['typescript', 'ts'],
]);

const LEGACY_DOC_HOSTS = new Set([
  'doc.shengwang.cn',
  'docportal.shengwang.cn',
  'docs.agora.io',
]);

const LEGACY_PLATFORM_SEGMENTS = new Set([
  'android',
  'cpp',
  'electron',
  'flutter',
  'harmonyos',
  'ios',
  'javascript',
  'macos',
  'react',
  'rn',
  'restful',
  'unity',
  'unreal',
  'unreal-blueprint',
  'unreal-cpp',
  'web',
  'windows',
]);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function posix(value) {
  return value.split(path.sep).join('/');
}

function stableJson(value) {
  if (Array.isArray(value)) return value.map(stableJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableJson(value[key])]),
    );
  }
  return value;
}

function json(value) {
  return `${JSON.stringify(stableJson(value), null, 2)}\n`;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonIfPresent(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  );
}

export function assertApiCenterOutputPath(repoRoot, targetPath) {
  const relative = posix(
    path.isAbsolute(targetPath)
      ? path.relative(repoRoot, targetPath)
      : path.normalize(targetPath),
  ).replace(/^\.\//, '');
  const absolute = path.resolve(repoRoot, relative);
  if (!isWithin(path.resolve(repoRoot), absolute)) {
    throw new Error(
      `Unsafe API Center output path outside repository: ${targetPath}`,
    );
  }
  const allowed = API_CENTER_OUTPUT_ROOTS.some(
    (root) => relative === root || relative.startsWith(`${root}/`),
  );
  if (!allowed) {
    throw new Error(
      `Unsafe API Center output path outside allowlist: ${targetPath}`,
    );
  }
  if (
    relative.startsWith('content/docs/') &&
    !relative.endsWith('.mdx') &&
    !relative.endsWith('/meta.json')
  ) {
    throw new Error(`Docs output must be .mdx or meta.json: ${targetPath}`);
  }
  return { absolute, relative };
}

export function escapeMdxText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/(?<![:\\]):(?=[\p{Letter}\p{Number}\p{Mark}_-])/gu, '\\:');
}

export function normalizeCodeLanguage(value) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  return CODE_LANGUAGE_ALIASES.get(normalized) ?? (normalized || 'text');
}

export function renderCodeFence(code, language = 'text', metadata = {}) {
  const source = String(code ?? '').replace(/\n+$/, '');
  const longestFence = Math.max(
    3,
    ...[...source.matchAll(/`+/g)].map((match) => match[0].length + 1),
  );
  const fence = '`'.repeat(longestFence);
  const suffix = [
    metadata.title ? `title=${JSON.stringify(metadata.title)}` : null,
    metadata.lineNumbers ? 'lineNumbers' : null,
    metadata.tab ? `tab=${JSON.stringify(metadata.tab)}` : null,
    metadata.tabGroup ? `tabGroup=${JSON.stringify(metadata.tabGroup)}` : null,
  ]
    .filter(Boolean)
    .join(' ');
  return `${fence}${normalizeCodeLanguage(language)}${suffix ? ` ${suffix}` : ''}\n${source}\n${fence}`;
}

export function normalizeCalloutType(value) {
  const type = String(value ?? '').toLowerCase();
  if (['danger', 'error'].includes(type)) return 'error';
  if (type === 'caution') return 'caution';
  if (['warn', 'warning'].includes(type)) return 'warning';
  if (['important', 'info'].includes(type)) return 'info';
  if (['tip', 'success'].includes(type)) return 'tip';
  return 'note';
}

export function renderCallout({ type, title, body, indent = '' }) {
  const calloutType = normalizeCalloutType(type);
  const header = `${indent}:::${calloutType}${title ? `[${escapeMdxText(title)}]` : ''}`;
  const content = String(body ?? '')
    .trim()
    .split('\n')
    .map((line) => `${indent}${line}`)
    .join('\n');
  return `${header}\n${content}\n${indent}:::`;
}

function escapeTableCell(value) {
  const source = String(value);
  if (/^<Slot name="[^"]+" \/>$/.test(source.trim())) {
    return source.trim();
  }
  const protectedValues = [];
  const protect = (protectedValue) => {
    const marker = `API_CENTER_TABLE_PROTECTED_${protectedValues.length}`;
    protectedValues.push(protectedValue);
    return marker;
  };
  const protectedSource = source
    .replace(/<a id=("[^"]*"|'[^']*')><\/a>/g, (anchor) => protect(anchor))
    .replace(/\\:(?=[\p{Letter}\p{Number}\p{Mark}_-])/gu, (escapedColon) =>
      protect(escapedColon),
    )
    .replace(
      /(\]\()(<[^>\n]+>|[^)\n]+)(\))/g,
      (_, opening, destination, closing) =>
        `${opening}${destination.replace(
          /(?<![:\\]):(?=[\p{Letter}\p{Number}\p{Mark}_-])/gu,
          (colon) => protect(colon),
        )}${closing}`,
    );
  let escaped = escapeMdxText(protectedSource)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n+/g, ' ');
  for (const [index, protectedValue] of protectedValues.entries()) {
    escaped = escaped.replace(
      `API_CENTER_TABLE_PROTECTED_${index}`,
      protectedValue,
    );
  }
  return escaped;
}

export function renderSimpleTable(headers, rows) {
  if (!headers?.length) return '';
  const width = headers.length;
  const lines = [
    `| ${headers.map(escapeTableCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ];
  for (const row of rows ?? []) {
    lines.push(
      `| ${Array.from({ length: width }, (_, index) =>
        escapeTableCell(row[index] ?? ''),
      ).join(' | ')} |`,
    );
  }
  return lines.join('\n');
}

export function stableAnchorId(value) {
  return String(value ?? '')
    .trim()
    .replace(/^#/, '')
    .replace(/\s+/g, '-');
}

function markdownSafeFragment(value) {
  return String(value).replace(/\(/g, '%28').replace(/\)/g, '%29');
}

export function renderStableAnchor(value) {
  const id = stableAnchorId(value);
  return id ? `<a id=${JSON.stringify(id)}></a>` : '';
}

export function rewriteLegacyHref(
  href,
  { sourceUrl, routeMap, fragmentMap = new Map() },
) {
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return { href, warning: null };
  }
  let url;
  try {
    url = new URL(href, sourceUrl);
  } catch {
    return {
      href,
      warning: createWarning('unresolved-link', `Invalid href: ${href}.`),
    };
  }
  const legacyFaq = isLegacyFaqUrl(url);
  const faqTarget = legacyFaq ? resolveLegacyFaqHref(url, routeMap) : null;
  if (legacyFaq) {
    const fragment = url.hash
      ? `#${stableAnchorId(decodeURIComponent(url.hash.slice(1)))}`
      : '';
    return {
      href: `${faqTarget ?? '/zh-CN/api-reference/faq'}${fragment}`,
      warning: faqTarget
        ? null
        : createWarning(
            'unresolved-link',
            `No exact local FAQ route for ${url.pathname}; linked the local FAQ index.`,
            { href: `${url.pathname}${url.search}${url.hash}` },
          ),
    };
  }
  const legacyExternalTarget = legacyExternalRoute(url);
  if (legacyExternalTarget) {
    return { href: legacyExternalTarget, warning: null };
  }
  if (!LEGACY_DOC_HOSTS.has(url.hostname)) {
    return { href: url.href, warning: null };
  }
  const normalizedUrl = normalizeLegacyDocUrl(url, sourceUrl);
  const key = `https://doc.shengwang.cn${normalizedUrl.pathname}${normalizedUrl.search}`;
  const existingTarget =
    normalizedUrl.hostname === 'doc.shengwang.cn'
      ? resolveExistingApiCenterTarget(normalizedUrl)?.targetRoute
      : null;
  if (url.pathname.startsWith('/zh-CN/') && !existingTarget) {
    return {
      href: `${url.pathname}${url.search}${url.hash}`,
      warning: null,
    };
  }
  const target =
    existingTarget ??
    legacyRouteCandidates(normalizedUrl).reduce(
      (resolved, candidate) => resolved ?? routeMap.get(candidate),
      null,
    );
  if (!target) {
    return {
      href: null,
      warning: createWarning(
        'unresolved-link',
        `No local target route for ${normalizedUrl.pathname}.`,
        {
          href: `${normalizedUrl.pathname}${normalizedUrl.search}${normalizedUrl.hash}`,
        },
      ),
    };
  }
  let fragment = '';
  if (url.hash && target.startsWith('/zh-CN/api-reference/')) {
    const raw = decodeURIComponent(url.hash.slice(1));
    const mapped = fragmentMap.get(`${key}#${raw}`) ?? stableAnchorId(raw);
    if (!mapped) {
      return {
        href: target,
        warning: createWarning(
          'unresolved-fragment',
          `No target fragment for ${url.pathname}${url.hash}.`,
        ),
      };
    }
    fragment = `#${markdownSafeFragment(mapped)}`;
  }
  return { href: `${target}${fragment}`, warning: null };
}

export function isLegacyDocsHref(href, sourceUrl = 'https://doc.shengwang.cn') {
  const value = String(href ?? '');
  if (value.startsWith('/')) {
    return /^\/(?:api-ref|basics|doc)(?:\/|$)/i.test(value);
  }
  if (!/^(?:https?:)?\/\//i.test(value)) return false;
  try {
    return LEGACY_DOC_HOSTS.has(new URL(value, sourceUrl).hostname);
  } catch {
    return false;
  }
}

function legacyExternalRoute(url) {
  if (
    url.hostname === 'docs.agora.io' &&
    /^\/cn\/Agora%20Platform\/ticket$/i.test(url.pathname)
  ) {
    return 'https://ticket.shengwang.cn/';
  }
  return null;
}

function normalizeLegacyDocUrl(url, sourceUrl) {
  const normalized = new URL(url);
  normalized.hostname =
    normalized.hostname === 'docportal.shengwang.cn'
      ? 'doc.shengwang.cn'
      : normalized.hostname;
  const sourcePlatform = legacySourcePlatform(sourceUrl);
  normalized.pathname = normalized.pathname.replace(
    /^(\/(?:api-ref|doc)\/[^/]+)\/{2,}/i,
    (_match, prefix) =>
      sourcePlatform ? `${prefix}/${sourcePlatform}/` : `${prefix}/`,
  );
  normalized.pathname = normalized.pathname.replace(/\/{2,}/g, '/');
  return normalized;
}

function legacySourcePlatform(sourceUrl) {
  try {
    const segments = new URL(sourceUrl, 'https://doc.shengwang.cn').pathname
      .split('/')
      .filter(Boolean);
    if (
      ['api-ref', 'doc'].includes(segments[0]) &&
      LEGACY_PLATFORM_SEGMENTS.has(segments[2]?.toLowerCase())
    ) {
      return segments[2].toLowerCase();
    }
  } catch {
    // Invalid source URLs are handled by the caller's unresolved-link path.
  }
  return null;
}

function legacyRouteCandidates(url) {
  const candidates = new Set([
    `https://doc.shengwang.cn${url.pathname}${url.search}`,
    `${url.pathname}${url.search}`,
    url.pathname,
  ]);
  const segments = url.pathname.split('/').filter(Boolean);
  if (
    segments[0] === 'doc' &&
    LEGACY_PLATFORM_SEGMENTS.has(segments[2]?.toLowerCase())
  ) {
    const platformlessPath = `/${[segments[0], segments[1], ...segments.slice(3)].join('/')}`;
    candidates.add(`https://doc.shengwang.cn${platformlessPath}${url.search}`);
    candidates.add(`${platformlessPath}${url.search}`);
    candidates.add(platformlessPath);
  }
  return [...candidates];
}

export function isLegacyFaqHref(href, sourceUrl = 'https://doc.shengwang.cn') {
  try {
    return isLegacyFaqUrl(new URL(href, sourceUrl));
  } catch {
    return false;
  }
}

function isLegacyFaqUrl(url) {
  return (
    ['doc.shengwang.cn', 'docs.agora.io'].includes(url.hostname) &&
    /(?:^|\/)faq(?:\/|$)/.test(url.pathname)
  );
}

function resolveLegacyFaqHref(url, routeMap) {
  if (
    !['doc.shengwang.cn', 'docs.agora.io'].includes(url.hostname) ||
    !/(?:^|\/)faq(?:\/|$)/.test(url.pathname)
  ) {
    return null;
  }
  const segments = url.pathname.split('/').filter(Boolean);
  const faqIndex = segments.lastIndexOf('faq');
  const slug = segments.at(-1);
  if (faqIndex < 0 || !slug) return null;
  if (slug === 'list' || faqIndex === segments.length - 1) {
    return '/zh-CN/api-reference/faq';
  }
  return routeMap.get(`faq:${decodeURIComponent(slug)}`) ?? null;
}

export function createWarning(code, message, details = {}) {
  const definition = API_CENTER_WARNING_DEFINITIONS[code];
  if (!definition) throw new Error(`Unknown API Center warning code: ${code}`);
  return {
    code,
    severity: definition.severity,
    message,
    ...details,
  };
}

function normalizedWarnings(warnings) {
  return (warnings ?? []).map((warning) =>
    typeof warning === 'string'
      ? createWarning(
          warning,
          API_CENTER_WARNING_DEFINITIONS[warning].explanation,
        )
      : warning,
  );
}

export function renderMigrationFrontmatter({
  title,
  description,
  migration,
  extra = {},
}) {
  const warnings = normalizedWarnings(migration.warnings);
  const frontmatter = {
    title,
    ...(description ? { description } : {}),
    ...extra,
    _migration: {
      type: migration.type,
      status:
        migration.status ??
        (warnings.some((warning) => warning.severity === 'error')
          ? 'failed'
          : warnings.some((warning) => warning.severity === 'warning')
            ? 'warning'
            : 'migrated'),
      sourceUrl: migration.sourceUrl,
      sourcePath: migration.sourcePath,
      generator: migration.generator,
      ...(migration.sourceUrls?.length > 1
        ? { sourceUrls: migration.sourceUrls }
        : {}),
      ...(migration.sourcePaths?.length > 1
        ? { sourcePaths: migration.sourcePaths }
        : {}),
      ...(migration.platforms?.length > 1
        ? { platforms: migration.platforms }
        : {}),
      warnings: warnings.map((warning) => ({
        code: warning.code,
        severity: warning.severity,
        message: warning.message,
      })),
    },
  };
  return `---\n${yaml
    .dump(frontmatter, {
      lineWidth: 100,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false,
    })
    .trimEnd()}\n---\n`;
}

/**
 * @param {object} options
 * @param {string} options.title
 * @param {string} [options.description]
 * @param {string} options.body
 * @param {Record<string, unknown>} options.migration
 * @param {Record<string, unknown>} [options.extraFrontmatter]
 */
export function renderGeneratedMdx({
  title,
  description,
  body,
  migration,
  extraFrontmatter,
}) {
  const frontmatter = renderMigrationFrontmatter({
    title,
    description,
    migration,
    extra: extraFrontmatter,
  });
  const renderedBody = String(body ?? '').trim();
  return renderedBody ? `${frontmatter}\n${renderedBody}\n` : frontmatter;
}

export function renderMetaJson({
  title,
  pages,
  currentVersion = false,
  sidebarHidden,
}) {
  return json({
    title,
    ...(currentVersion ? { navScope: { defaultVersion: 'current' } } : {}),
    ...(sidebarHidden === undefined ? {} : { sidebarHidden }),
    pages,
  });
}

export function navigationSeparators(navigation, routeLeafByUrl) {
  const pages = [];
  for (const item of navigation ?? []) {
    if (item.kind === 'category') {
      if (item.label) pages.push(`---${item.label}---`);
      pages.push(...navigationSeparators(item.items, routeLeafByUrl));
      continue;
    }
    if (item.kind !== 'link' || item.excludedReason) continue;
    const url = item.link?.url;
    const leaf = url ? routeLeafByUrl.get(url) : null;
    if (leaf && !pages.includes(leaf)) pages.push(leaf);
  }
  return pages;
}

export function assetTargetPath(sourcePath, contents) {
  const extension = path.extname(sourcePath).toLowerCase();
  const basename = path
    .basename(sourcePath, extension)
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  const digest = sha256(contents).slice(0, 12);
  return `public/img/api-center-generated/${digest}-${basename || 'asset'}${extension}`;
}

function registerLegacyRoute(routeMap, legacyHref, targetRoute) {
  if (!legacyHref || !targetRoute) return;
  const url = new URL(legacyHref, 'https://doc.shengwang.cn');
  if (url.origin !== 'https://doc.shengwang.cn') return;
  url.hash = '';
  routeMap.set(url.href, targetRoute);
  routeMap.set(`${url.pathname}${url.search}`, targetRoute);
  routeMap.set(url.pathname, targetRoute);
  const alternate = new URL(url);
  if (alternate.pathname.endsWith('.html')) {
    alternate.pathname = alternate.pathname.slice(0, -'.html'.length);
  } else {
    alternate.pathname = `${alternate.pathname}.html`;
  }
  routeMap.set(alternate.href, targetRoute);
  routeMap.set(`${alternate.pathname}${alternate.search}`, targetRoute);
  routeMap.set(alternate.pathname, targetRoute);
}

export function buildLegacyRouteMap(
  manifest,
  pathMapRows = [],
  faqMappingRows = [],
) {
  const routeMap = new Map();
  for (const row of pathMapRows) {
    registerLegacyRoute(routeMap, row.old_url, row.new_url);
  }
  const targetByRequestedUrl = new Map();
  for (const page of manifest.pageEvidence ?? []) {
    const targetRoute = page.sourceResolution?.targetRoute;
    if (targetRoute) targetByRequestedUrl.set(page.requestedUrl, targetRoute);
  }
  for (const page of manifest.pageEvidence ?? []) {
    const targetRoute = page.aliasOf
      ? targetByRequestedUrl.get(page.aliasOf)
      : page.sourceResolution?.targetRoute;
    if (!targetRoute) continue;
    registerLegacyRoute(routeMap, page.requestedUrl, targetRoute);
  }
  for (const row of faqMappingRows) {
    const targetPath = row.targetPath;
    if (!targetPath?.startsWith('content/docs/zh-CN/') || !row.sourceSlug) {
      continue;
    }
    const targetRoute = `/${targetPath
      .replace(/^content\/docs\//, '')
      .replace(/\.mdx$/i, '')}`;
    const targetStem = path.posix.basename(targetPath, '.mdx');
    for (const alias of faqAliases(row.sourceSlug, targetStem)) {
      if (!routeMap.has(`faq:${alias}`)) {
        routeMap.set(`faq:${alias}`, targetRoute);
      }
    }
  }
  const faqAliasesByRoute = {
    streaming: routeMap.get('faq:streaming-difference'),
    string: routeMap.get('faq:string-uid'),
  };
  for (const [alias, targetRoute] of Object.entries(faqAliasesByRoute)) {
    if (targetRoute) routeMap.set(`faq:${alias}`, targetRoute);
  }
  return routeMap;
}

function faqAliases(sourceSlug, targetStem) {
  return new Set([
    sourceSlug,
    sourceSlug.replaceAll('-', '_'),
    sourceSlug.replaceAll('_', '-'),
    targetStem,
    targetStem.replaceAll('-', '_'),
    targetStem.replaceAll('_', '-'),
  ]);
}

export async function loadFaqMappingRows(
  repoRoot,
  mappingPath = FAQ_MIGRATION_MAPPING_PATH,
) {
  try {
    const mapping = JSON.parse(
      await fs.readFile(path.resolve(repoRoot, mappingPath), 'utf8'),
    );
    return mapping.rows ?? [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function reportToMarkdown(report) {
  const lines = [
    '# API Center Migration Run Report',
    '',
    '> Generated by the API Center migration scripts. Do not edit by hand.',
    '',
    `- Input hash: \`${report.inputHash}\``,
    `- Planned files: ${report.counts.plannedFiles}`,
    `- Generated files: ${report.counts.generatedFiles}`,
    `- Preserved existing files: ${report.counts.preservedExistingFiles}`,
    `- Pending pages: ${report.counts.pendingPages}`,
    `- Excluded pages: ${report.counts.excludedPages}`,
    `- Removed stale owned files: ${report.counts.removedOwnedFiles}`,
    `- Warnings: ${report.counts.warnings}`,
    `- Errors: ${report.counts.errors}`,
    '',
    '## Migration types',
    '',
  ];
  const typeEntries = Object.entries(report.migrationTypes);
  lines.push(
    ...(typeEntries.length > 0
      ? typeEntries.map(([type, count]) => `- \`${type}\`: ${count}`)
      : ['- None.']),
    '',
    '## Warning explanations',
    '',
  );
  const warningEntries = Object.entries(report.warningSummary);
  lines.push(
    ...(warningEntries.length > 0
      ? warningEntries.map(
          ([code, summary]) =>
            `- \`${code}\` (${summary.count}, ${summary.severity}): ${summary.explanation}`,
        )
      : ['- None.']),
    '',
    '## Page/file results',
    '',
    '| Status | Type | Target | Source | Warnings |',
    '| --- | --- | --- | --- | --- |',
  );
  for (const result of report.results) {
    lines.push(
      `| ${result.status} | ${result.type ?? ''} | \`${result.targetPath ?? ''}\` | \`${result.sourcePath ?? ''}\` | ${(result.warnings ?? []).map((warning) => warning.code).join(', ')} |`,
    );
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function buildReport({ manifest, inputHash, results, removedOwnedFiles }) {
  const warnings = results.flatMap((result) => result.warnings ?? []);
  const warningSummary = {};
  for (const warning of warnings) {
    const definition = API_CENTER_WARNING_DEFINITIONS[warning.code];
    const current = warningSummary[warning.code] ?? {
      count: 0,
      severity: definition.severity,
      explanation: definition.explanation,
    };
    current.count += 1;
    warningSummary[warning.code] = current;
  }
  const migrationTypes = {};
  for (const result of results) {
    if (!result.type) continue;
    migrationTypes[result.type] = (migrationTypes[result.type] ?? 0) + 1;
  }
  const orderedResults = [...results].sort((left, right) =>
    String(left.targetPath ?? left.sourceUrl).localeCompare(
      String(right.targetPath ?? right.sourceUrl),
    ),
  );
  return stableJson({
    schemaVersion: 1,
    sourceCommit: manifest.source?.commit ?? null,
    capturedAt: manifest.live?.capturedAt ?? manifest.generatedAt ?? null,
    inputHash,
    counts: {
      plannedFiles: results.filter((result) => result.status === 'generated')
        .length,
      generatedFiles: results.filter((result) => result.status === 'generated')
        .length,
      preservedExistingFiles: results.filter(
        (result) => result.status === 'preserved-existing',
      ).length,
      removedOwnedFiles,
      pendingPages: results.filter((result) => result.status === 'pending')
        .length,
      excludedPages: results.filter((result) => result.status === 'excluded')
        .length,
      warnings: warnings.filter((warning) => warning.severity === 'warning')
        .length,
      errors: warnings.filter((warning) => warning.severity === 'error').length,
    },
    migrationTypes,
    warningSummary,
    results: orderedResults,
  });
}

export class ApiCenterMigrationRun {
  static async create({
    repoRoot = process.cwd(),
    manifest,
    mode = 'write',
    ownershipPath = API_CENTER_OWNERSHIP_PATH,
    reportJsonPath = API_CENTER_REPORT_JSON_PATH,
    reportMarkdownPath = API_CENTER_REPORT_MD_PATH,
    reconcile = true,
  }) {
    if (!['check', 'dry-run', 'write'].includes(mode)) {
      throw new Error(`Unsupported migration mode: ${mode}`);
    }
    const previous = await readJsonIfPresent(
      path.resolve(repoRoot, ownershipPath),
      { schemaVersion: 1, files: [] },
    );
    return new ApiCenterMigrationRun({
      repoRoot: path.resolve(repoRoot),
      manifest,
      mode,
      ownershipPath,
      reportJsonPath,
      reportMarkdownPath,
      previous,
      reconcile,
    });
  }

  constructor(options) {
    Object.assign(this, options);
    this.planned = new Map();
    this.auditResults = [];
    this.inputHash = sha256(JSON.stringify(this.manifest));
    this.previousOwned = new Map(
      (this.previous.files ?? []).map((file) => [file.targetPath, file]),
    );
  }

  ownsTarget(targetPath) {
    return this.previousOwned.has(targetPath);
  }

  planFile({
    targetPath,
    contents,
    sourcePath,
    sourceUrl,
    type,
    warnings = [],
    adoptExisting = false,
  }) {
    const safe = assertApiCenterOutputPath(this.repoRoot, targetPath);
    const buffer = Buffer.isBuffer(contents) ? contents : Buffer.from(contents);
    const record = {
      targetPath: safe.relative,
      absolutePath: safe.absolute,
      contents: buffer,
      contentHash: sha256(buffer),
      sourcePath,
      sourceUrl,
      type,
      warnings: normalizedWarnings(warnings),
      adoptExisting,
    };
    const previousPlan = this.planned.get(safe.relative);
    if (previousPlan && previousPlan.contentHash !== record.contentHash) {
      throw new Error(
        `generated-target-collision: ${safe.relative} has multiple distinct outputs.`,
      );
    }
    this.planned.set(safe.relative, previousPlan ?? record);
    return record;
  }

  planMdx({
    page,
    title,
    description,
    body,
    warnings = [],
    extraFrontmatter,
    adoptExisting = false,
  }) {
    const resolution = page.sourceResolution;
    if (!resolution?.targetPath?.endsWith('.mdx')) {
      throw new Error(`MDX page has no .mdx target: ${page.requestedUrl}`);
    }
    const allWarnings = [...warnings, ...(page.warnings ?? [])].filter(
      (warning) => API_CENTER_WARNING_DEFINITIONS[warning.code],
    );
    const contents = renderGeneratedMdx({
      title,
      description,
      body,
      extraFrontmatter,
      migration: {
        type: resolution.type,
        sourceUrl: page.requestedUrl,
        sourcePath: resolution.sourcePath,
        generator: resolution.generator,
        warnings: allWarnings,
      },
    });
    return this.planFile({
      targetPath: resolution.targetPath,
      contents,
      sourcePath: resolution.sourcePath,
      sourceUrl: page.requestedUrl,
      type: resolution.type,
      warnings: allWarnings,
      adoptExisting,
    });
  }

  preserveExisting({ page, warningCode = 'existing-target-preserved' }) {
    const resolution = page.sourceResolution;
    this.auditResults.push({
      status: 'preserved-existing',
      type: resolution.type,
      targetPath: resolution.targetPath,
      sourcePath: resolution.sourcePath,
      sourceUrl: page.requestedUrl,
      warnings: [
        createWarning(
          warningCode,
          `Preserved existing target ${resolution.targetPath}.`,
        ),
      ],
    });
  }

  recordPageResult({ page, status, warnings = [] }) {
    const resolution = page.sourceResolution;
    this.auditResults.push({
      status,
      type: resolution.type,
      targetPath: resolution.targetPath,
      sourcePath: resolution.sourcePath,
      sourceUrl: page.requestedUrl,
      warnings: normalizedWarnings(warnings),
    });
  }

  async finish() {
    const results = [...this.auditResults];
    const nextOwned = [];
    const stale = new Map(this.previousOwned);

    for (const record of [...this.planned.values()].sort((left, right) =>
      left.targetPath.localeCompare(right.targetPath),
    )) {
      stale.delete(record.targetPath);
      const prior = this.previousOwned.get(record.targetPath);
      const targetExists = await exists(record.absolutePath);
      if (targetExists && !prior && !record.adoptExisting) {
        results.push({
          status: 'preserved-existing',
          type: record.type,
          targetPath: record.targetPath,
          sourcePath: record.sourcePath,
          sourceUrl: record.sourceUrl,
          warnings: [
            ...record.warnings,
            createWarning(
              'unowned-target-preserved',
              `Did not overwrite unowned target ${record.targetPath}.`,
            ),
          ],
        });
        continue;
      }
      if (this.mode === 'check') {
        if (!targetExists) {
          throw new Error(`Generated file is missing: ${record.targetPath}`);
        }
        const actualHash = sha256(await fs.readFile(record.absolutePath));
        if (actualHash !== record.contentHash) {
          throw new Error(`Generated file is stale: ${record.targetPath}`);
        }
      } else if (this.mode === 'write') {
        await fs.mkdir(path.dirname(record.absolutePath), { recursive: true });
        await fs.writeFile(record.absolutePath, record.contents);
      }
      results.push({
        status: 'generated',
        type: record.type,
        targetPath: record.targetPath,
        sourcePath: record.sourcePath,
        sourceUrl: record.sourceUrl,
        warnings: record.warnings,
      });
      nextOwned.push({
        targetPath: record.targetPath,
        contentHash: record.contentHash,
        sourcePath: record.sourcePath,
        sourceUrl: record.sourceUrl,
        type: record.type,
      });
    }

    let removedOwnedFiles = 0;
    if (!this.reconcile) {
      nextOwned.push(...stale.values());
      stale.clear();
    }
    for (const [targetPath, prior] of stale) {
      const safe = assertApiCenterOutputPath(this.repoRoot, targetPath);
      if (!(await exists(safe.absolute))) continue;
      const currentHash = sha256(await fs.readFile(safe.absolute));
      if (currentHash !== prior.contentHash) {
        results.push({
          status: 'preserved-existing',
          type: prior.type,
          targetPath,
          sourcePath: prior.sourcePath,
          sourceUrl: prior.sourceUrl,
          warnings: [
            createWarning(
              'owned-file-modified',
              `Did not delete modified formerly-owned file ${targetPath}.`,
            ),
          ],
        });
        nextOwned.push(prior);
        continue;
      }
      if (this.mode === 'check') {
        throw new Error(`Stale owned generated file remains: ${targetPath}`);
      }
      if (this.mode === 'write') await fs.rm(safe.absolute);
      removedOwnedFiles += 1;
    }

    const report = buildReport({
      manifest: this.manifest,
      inputHash: this.inputHash,
      results,
      removedOwnedFiles,
    });
    const ownership = stableJson({
      schemaVersion: 1,
      inputHash: this.inputHash,
      files: nextOwned.sort((left, right) =>
        left.targetPath.localeCompare(right.targetPath),
      ),
    });
    const ownershipContents = json(ownership);
    const reportContents = json(report);
    const reportMarkdown = reportToMarkdown(report);

    if (this.mode === 'check') {
      for (const [relative, expected] of [
        [this.ownershipPath, ownershipContents],
        [this.reportJsonPath, reportContents],
        [this.reportMarkdownPath, reportMarkdown],
      ]) {
        const actual = await fs.readFile(
          path.resolve(this.repoRoot, relative),
          'utf8',
        );
        if (actual !== expected)
          throw new Error(`Generated file is stale: ${relative}`);
      }
    } else if (this.mode === 'write') {
      for (const [relative, contents] of [
        [this.ownershipPath, ownershipContents],
        [this.reportJsonPath, reportContents],
        [this.reportMarkdownPath, reportMarkdown],
      ]) {
        const absolute = path.resolve(this.repoRoot, relative);
        await fs.mkdir(path.dirname(absolute), { recursive: true });
        await fs.writeFile(absolute, contents, 'utf8');
      }
    }
    return report;
  }
}
