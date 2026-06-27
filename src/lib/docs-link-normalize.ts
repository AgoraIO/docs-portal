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
  const indexHref = normalizeIndexDocsHref(href);

  if (indexHref !== href) {
    return indexHref;
  }

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

function normalizeIndexDocsHref(href: string) {
  const parsed = splitHref(href);

  if (!parsed.path.endsWith('/index')) {
    return href;
  }

  const path = parsed.path.slice(0, -'/index'.length) || '/';

  return `${path}${parsed.search}${parsed.hash}`;
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
