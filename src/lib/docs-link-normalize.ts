import { buildDocPath, getSourceSlugsFromContentPath } from './docs-routing';

export type NormalizedDocsHrefKind =
  | 'external'
  | 'hash'
  | 'internal-doc'
  | 'relative-asset'
  | 'root'
  | 'unknown';

export type NormalizedDocsHref = {
  href: string;
  kind: NormalizedDocsHrefKind;
};

export function normalizeDocsHref(
  href: string,
  context: { contentPath?: string } = {},
): NormalizedDocsHref {
  if (!href) {
    return { href, kind: 'unknown' };
  }

  if (href.startsWith('#')) {
    return { href, kind: 'hash' };
  }

  if (href.startsWith('/')) {
    if (href.startsWith('//')) {
      return { href, kind: 'external' };
    }

    return {
      href: normalizeRootDocsHref(href, context),
      kind: 'root',
    };
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
    return { href, kind: 'external' };
  }

  const parsed = splitHref(href);

  if (!/\.mdx?$/i.test(parsed.path)) {
    return { href, kind: 'relative-asset' };
  }

  if (!context.contentPath) {
    return { href, kind: 'unknown' };
  }

  const targetContentPath = resolveRelativePath(
    dirname(context.contentPath),
    parsed.path,
  );
  const [locale] = targetContentPath.split('/').filter(Boolean);
  const sourceSlugs = getSourceSlugsFromContentPath(targetContentPath);
  const [tab, ...slugSegments] = sourceSlugs;

  if (!locale || !tab) {
    return { href, kind: 'unknown' };
  }

  const docPath = `${buildDocPath(locale, tab, slugSegments)}${parsed.search}${parsed.hash}`;

  return {
    href: normalizeLegacyRootDocsHref(docPath),
    kind: 'internal-doc',
  };
}

function normalizeRootDocsHref(
  href: string,
  context: { contentPath?: string } = {},
) {
  const legacyHref = normalizeLegacyRootDocsHref(href);

  if (legacyHref !== href) {
    return legacyHref;
  }

  const rtcAndroidVersionScope = getRtcAndroidVersionScope(context.contentPath);

  if (!rtcAndroidVersionScope) {
    return href;
  }

  const parsed = splitHref(href);
  const prefix = `/${rtcAndroidVersionScope.locale}/api-reference/rtc/android`;

  if (
    !parsed.path.startsWith(`${prefix}/`) ||
    parsed.path.startsWith(`${prefix}/${rtcAndroidVersionScope.version}/`)
  ) {
    return href;
  }

  return `${prefix}/${rtcAndroidVersionScope.version}${parsed.path.slice(prefix.length)}${parsed.search}${parsed.hash}`;
}

function normalizeLegacyRootDocsHref(href: string) {
  const parsed = splitHref(href);
  const segments = parsed.path.split('/').filter(Boolean);
  const [locale, group, leaf] = segments;

  const mappedConversationalAiPath =
    getLegacyConversationalAiRestPath(segments);
  if (mappedConversationalAiPath) {
    return `${mappedConversationalAiPath}${parsed.search}${parsed.hash}`;
  }

  if ((locale === 'en' || locale === 'zh-CN') && group && leaf) {
    const mappedPath = getLegacyLocalePath(locale, group, leaf);

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

function getLegacyConversationalAiRestPath(segments: string[]) {
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

function getLegacyLocalePath(locale: string, group: string, leaf: string) {
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

const LEGACY_OPERATION_ROUTE_LEAVES: Record<string, string> = {
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

const LEGACY_CONVERSATIONAL_AI_AGENT_ROUTE_LEAVES: Record<string, string> = {
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

const LEGACY_USER_GUIDE_PATHS: Record<string, (locale: string) => string> = {
  'custom-data': (locale) => `/${locale}/ai/custom-data`,
  'realtime-sub': (locale) => `/${locale}/ai/realtime-sub`,
  'short-term-memory': (locale) => `/${locale}/ai/short-term-memory`,
};

const LEGACY_GET_STARTED_PATHS: Record<string, (locale: string) => string> = {
  'enable-service': (locale) =>
    locale === 'zh-CN'
      ? '/zh-CN/ai/enable-service'
      : '/en/ai/reference/enable-conversational-ai',
};

const LEGACY_ABSOLUTE_PATHS: Record<string, string> = {
  '/doc/convoai/restful/webhook/ncs-events': '/zh-CN/api-reference/ncs-events',
  '/en/sdks': '/en/api-reference/sdks',
  '/sdks': '/en/api-reference/sdks',
};

function getRtcAndroidVersionScope(contentPath?: string) {
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

function splitHref(href: string) {
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

function dirname(path: string) {
  const segments = path.split('/').filter(Boolean);
  segments.pop();
  return segments.join('/');
}

function resolveRelativePath(baseDir: string, relativePath: string) {
  const segments = [...baseDir.split('/'), ...relativePath.split('/')];
  const normalized: string[] = [];

  for (const segment of segments) {
    if (!segment || segment === '.') {
      continue;
    }

    if (segment === '..') {
      normalized.pop();
      continue;
    }

    normalized.push(segment);
  }

  return normalized.join('/');
}
