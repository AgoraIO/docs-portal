import type { DocsPageType } from './docs-page-type';

export type { DocsPageType } from './docs-page-type';
export { DOCS_PAGE_TYPES } from './docs-page-type';

type PostHogClient = typeof import('posthog-js').default;

const POSTHOG_HOST = 'https://us.i.posthog.com';
const SAFE_PROPERTY_VALUE = /^[a-z0-9][a-z0-9._:-]{0,63}$/i;
const URL_PROPERTY_NAME = /(href|referrer|url)$/i;

let posthogClientPromise: Promise<PostHogClient | null> | null = null;
let registeredPageContext: RegisteredDocsPageContext | null = null;

export type DocsFeedbackValue = 'yes' | 'no';

type RegisteredDocsPageContext = {
  contentKind?: string;
  locale: string;
  pageType?: DocsPageType;
  pathname?: string;
  platform?: string;
  product?: string;
  tab?: string;
};

type StructuredEventProperties = Record<
  string,
  boolean | number | string | null | undefined
>;

export function initializePostHog() {
  void getPostHogClient();
}

export function registerDocsPageContext(context: RegisteredDocsPageContext) {
  registeredPageContext = context;
}

export function captureDocsPageFeedback({
  locale,
  value,
}: {
  locale: string;
  value: DocsFeedbackValue;
}) {
  captureStructuredDocsEvent('docs_page_feedback', locale, {
    value,
  });
}

export function captureDocsSearchOpened({
  locale,
  mode,
  trigger,
}: {
  locale: string;
  mode: 'desktop' | 'mobile';
  trigger: 'button' | 'keyboard';
}) {
  captureStructuredDocsEvent('docs_search_opened', locale, {
    search_mode: mode,
    search_trigger: trigger,
  });
}

export function captureDocsSearchCompleted({
  locale,
  platformFilter,
  productScope,
  provider,
  queryLength,
  resultCount,
}: {
  locale: string;
  platformFilter?: string | null;
  productScope?: string | null;
  provider: 'algolia' | 'local';
  queryLength: number;
  resultCount: number;
}) {
  captureStructuredDocsEvent('docs_search_completed', locale, {
    platform_filter: toSafePropertyValue(platformFilter),
    product_scope: toSafePropertyValue(productScope),
    query_length: queryLength,
    result_count: resultCount,
    search_provider: provider,
  });
}

export function captureDocsSearchResultClicked({
  href,
  locale,
  queryLength,
  rank,
}: {
  href: string;
  locale: string;
  queryLength: number;
  rank: number;
}) {
  captureStructuredDocsEvent('docs_search_result_clicked', locale, {
    ...getSafeLinkTarget(href),
    query_length: queryLength,
    result_rank: rank,
  });
}

export function captureDocsCodeCopied({
  language,
  locale,
  source,
}: {
  language?: string;
  locale: string;
  source: 'code-block' | 'command-block';
}) {
  captureStructuredDocsEvent('docs_code_copied', locale, {
    code_language: toSafePropertyValue(language),
    code_source: source,
  });
}

export function captureDocsCodeTabChanged({
  locale,
  nextLanguage,
}: {
  locale: string;
  nextLanguage: string;
}) {
  captureStructuredDocsEvent('docs_code_tab_changed', locale, {
    next_language: toSafePropertyValue(nextLanguage),
  });
}

export function captureDocsTocClicked({
  anchor,
  depth,
  locale,
  variant,
}: {
  anchor: string;
  depth: number;
  locale: string;
  variant: 'mobile' | 'rail';
}) {
  captureStructuredDocsEvent('docs_toc_clicked', locale, {
    target_anchor: sanitizeAnchor(anchor),
    target_depth: depth,
    toc_variant: variant,
  });
}

export function captureDocsPlatformChanged({
  locale,
  platform,
  source,
}: {
  locale: string;
  platform: string;
  source: 'header' | 'inline';
}) {
  captureStructuredDocsEvent('docs_platform_changed', locale, {
    next_platform: toSafePropertyValue(platform),
    platform_source: source,
  });
}

export function captureDocsLinkClicked({
  href,
  locale,
  source,
}: {
  href: string;
  locale: string;
  source: 'article' | 'breadcrumb' | 'feedback' | 'navigation';
}) {
  captureStructuredDocsEvent('docs_link_clicked', locale, {
    ...getSafeLinkTarget(href),
    link_source: source,
  });
}

export function captureDocsFeedbackOpened({ locale }: { locale: string }) {
  captureStructuredDocsEvent('docs_feedback_opened', locale, {});
}

export function captureDocsFeedbackIssueClicked({
  kind,
  locale,
}: {
  kind: 'issue' | 'suggestion' | 'usability';
  locale: string;
}) {
  captureStructuredDocsEvent('docs_feedback_issue_clicked', locale, {
    feedback_kind: kind,
  });
}

function captureStructuredDocsEvent(
  event: string,
  locale: string,
  properties: StructuredEventProperties,
) {
  if (typeof window === 'undefined') {
    return;
  }

  const context = getDocsPageContext(locale);

  if (locale !== 'en' || context.docs_locale !== 'en') {
    return;
  }

  void getPostHogClient().then((posthog) => {
    if (!posthog) {
      return;
    }

    posthog.capture(event, {
      ...context,
      ...removeUndefinedProperties(properties),
    });
  });
}

function getDocsPageContext(locale: string) {
  const pathname = registeredPageContext?.pathname ?? window.location.pathname;
  const parts = pathname.split('/').filter(Boolean);
  const docsLocale = registeredPageContext?.locale ?? parts[0] ?? locale;
  const tab = registeredPageContext?.tab ?? parts[1] ?? 'unknown';
  const product =
    registeredPageContext?.product ?? inferDocsProduct(parts, tab);
  const platform =
    registeredPageContext?.platform ?? getSafePlatformFromLocation();

  return {
    docs_content_kind: toSafePropertyValue(
      registeredPageContext?.contentKind,
      'unknown',
    ),
    docs_environment: import.meta.env.PROD ? 'production' : 'development',
    docs_locale: toSafePropertyValue(docsLocale, 'unknown'),
    docs_page_type:
      registeredPageContext?.pageType ?? inferDocsPageType(pathname),
    docs_pathname: pathname,
    docs_platform: platform,
    docs_product: product,
    docs_tab: toSafePropertyValue(tab, 'unknown'),
  };
}

function inferDocsProduct(parts: string[], tab: string) {
  if (tab === 'realtime-media' || tab === 'solutions') {
    return toSafePropertyValue(parts[2], tab);
  }

  if (tab === 'api-reference') {
    return toSafePropertyValue(parts[3] ?? parts[2], tab);
  }

  return toSafePropertyValue(tab, 'unknown');
}

function inferDocsPageType(pathname: string): DocsPageType {
  const normalized = pathname.toLowerCase();
  const parts = normalized.split('/').filter(Boolean);
  const leaf = parts.at(-1) ?? '';

  if (/(release|changelog|download|sunset|deprecat)/.test(normalized)) {
    return 'release-download';
  }

  if (/(faq|troubleshoot|error|issue|failure|debug)/.test(normalized)) {
    return 'faq-troubleshooting';
  }

  if (
    normalized.includes('/api-reference/') ||
    /(^|\/)(sdk-reference|api-reference)(\/|$)/.test(normalized)
  ) {
    return 'sdk-api-reference';
  }

  if (
    /(quick[-_]?start|get-started|setup|enable|integrat|implement|build|migrat|call-api|run-)/.test(
      normalized,
    )
  ) {
    return 'task-guide';
  }

  if (parts.length <= 2 || leaf === 'index') {
    return 'navigation-landing';
  }

  return 'concept-explanation';
}

function getSafePlatformFromLocation() {
  const platform = new URLSearchParams(window.location.search).get('platform');
  return toSafePropertyValue(platform, 'unknown');
}

function getSafeLinkTarget(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    const isSameOrigin = url.origin === window.location.origin;

    return {
      link_kind: getLinkKind(url, isSameOrigin),
      target_host: url.host,
      target_pathname: url.pathname,
    };
  } catch {
    return {
      link_kind: 'invalid',
      target_host: 'unknown',
      target_pathname: 'unknown',
    };
  }
}

function getLinkKind(url: URL, isSameOrigin: boolean) {
  if (isSameOrigin) {
    return 'docs';
  }

  if (
    url.host === 'console.agora.io' ||
    url.host.endsWith('.console.agora.io')
  ) {
    return 'console';
  }

  if (url.host === 'github.com' || url.host.endsWith('.github.com')) {
    return 'github';
  }

  if (/\.(zip|tgz|gz|dmg|exe|apk|aar|jar)$/i.test(url.pathname)) {
    return 'download';
  }

  return 'external';
}

function sanitizeAnchor(anchor: string) {
  const value = anchor.replace(/^#/, '');
  return SAFE_PROPERTY_VALUE.test(value) ? value : 'unknown';
}

function toSafePropertyValue(
  value: string | null | undefined,
  fallback: string | null = null,
) {
  const normalized = value?.trim();
  return normalized && SAFE_PROPERTY_VALUE.test(normalized)
    ? normalized
    : fallback;
}

function removeUndefinedProperties(properties: StructuredEventProperties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}

function sanitizeAnalyticsProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [
      key,
      sanitizeAnalyticsValue(key, value),
    ]),
  );
}

function sanitizeAnalyticsValue(key: string, value: unknown): unknown {
  if (typeof value === 'string' && URL_PROPERTY_NAME.test(key)) {
    return stripUrlQueryAndHash(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      item && typeof item === 'object'
        ? sanitizeAnalyticsProperties(item as Record<string, unknown>)
        : item,
    );
  }

  if (value && typeof value === 'object') {
    return sanitizeAnalyticsProperties(value as Record<string, unknown>);
  }

  return value;
}

function stripUrlQueryAndHash(value: string) {
  const queryIndex = value.indexOf('?');
  const hashIndex = value.indexOf('#');
  const boundary = [queryIndex, hashIndex]
    .filter((index) => index >= 0)
    .reduce((minimum, index) => Math.min(minimum, index), value.length);

  return value.slice(0, boundary);
}

function getPostHogClient() {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (!import.meta.env.PROD && import.meta.env.MODE !== 'test') {
    return Promise.resolve(null);
  }

  const key = import.meta.env.VITE_POSTHOG_KEY;

  if (!key) {
    return Promise.resolve(null);
  }

  if (import.meta.env.MODE === 'test' && key !== 'test-key') {
    return Promise.resolve(null);
  }

  if (!posthogClientPromise) {
    posthogClientPromise = import('posthog-js').then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || POSTHOG_HOST,
        autocapture: true,
        before_send: (event) =>
          event?.properties
            ? {
                ...event,
                properties: sanitizeAnalyticsProperties(event.properties),
              }
            : event,
        capture_pageview: 'history_change',
        defaults: '2026-05-30',
        disable_capture_url_hashes: true,
        disable_session_recording: true,
        mask_all_element_attributes: true,
        mask_all_text: true,
        person_profiles: 'never',
        persistence: 'localStorage+cookie',
        save_campaign_params: false,
      });

      return posthog;
    });
  }

  return posthogClientPromise;
}
