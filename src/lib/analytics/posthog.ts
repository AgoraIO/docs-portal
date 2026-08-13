type PostHogClient = typeof import('posthog-js').default;

const POSTHOG_HOST = 'https://us.i.posthog.com';
const DOCS_JOURNEY_STORAGE_KEY = 'docs-portal:journey:v1';
const LOCATION_DETAIL_PROPERTY_NAME = /(^|_)(hash|search)$/i;
const URL_PROPERTY_NAME = /(href|referrer|url)$/i;

let posthogClientPromise: Promise<PostHogClient | null> | null = null;

export type DocsFeedbackValue = 'yes' | 'no';

type DocsJourneyRecord = {
  pageType: string;
  pathname: string;
  product: string;
  tab: string;
};

export function initializePostHog() {
  void getPostHogClient();
}

export function captureDocsPageFeedback({
  locale,
  value,
}: {
  locale: string;
  value: DocsFeedbackValue;
}) {
  if (typeof window === 'undefined') {
    return;
  }

  const { hash, pathname, search } = window.location;

  void getPostHogClient().then((posthog) => {
    if (!posthog) {
      return;
    }

    posthog.capture('docs_page_feedback', {
      hash,
      locale,
      pathname,
      search,
      value,
    });
  });
}

export function captureDocsPageViewed({ pathname }: { pathname: string }) {
  if (typeof window === 'undefined') {
    return;
  }

  const context = getDocsPageContext(pathname);

  if (context.docs_locale !== 'en') {
    removeJourneyRecord();
    return;
  }

  captureDocsEvent('docs_page_viewed', {
    ...context,
    page_type: context.docs_page_type,
    pathname: context.docs_pathname,
    product: context.docs_product,
    tab: context.docs_tab,
  });
  captureDocsJourneyStep(context);
}

function captureDocsJourneyStep(
  context: ReturnType<typeof getDocsPageContext>,
) {
  const currentRecord = createJourneyRecord(context);
  const previousRecord = readJourneyRecord();

  if (previousRecord?.pathname === currentRecord.pathname) {
    writeJourneyRecord(currentRecord);
    return;
  }

  captureDocsEvent('docs_journey_step', {
    ...context,
    journey_entry: !previousRecord,
    journey_from_page_type: previousRecord?.pageType,
    journey_from_pathname: previousRecord?.pathname,
    journey_from_product: previousRecord?.product,
    journey_from_tab: previousRecord?.tab,
    journey_to_page_type: currentRecord.pageType,
    journey_to_pathname: currentRecord.pathname,
    journey_to_product: currentRecord.product,
    journey_to_tab: currentRecord.tab,
  });

  writeJourneyRecord(currentRecord);
}

function captureDocsEvent(event: string, properties: Record<string, unknown>) {
  void getPostHogClient().then((posthog) => {
    if (!posthog) {
      return;
    }

    posthog.capture(event, removeUndefinedProperties(properties));
  });
}

function getDocsPageContext(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const locale = parts[0] ?? 'unknown';
  const tab = parts[1] ?? 'unknown';

  return {
    docs_locale: locale,
    docs_page_type: inferDocsPageType(pathname),
    docs_pathname: pathname,
    docs_product: inferDocsProduct(parts, tab),
    docs_tab: tab,
  };
}

function createJourneyRecord(
  context: ReturnType<typeof getDocsPageContext>,
): DocsJourneyRecord {
  return {
    pageType: context.docs_page_type,
    pathname: context.docs_pathname,
    product: context.docs_product,
    tab: context.docs_tab,
  };
}

function readJourneyRecord(): DocsJourneyRecord | null {
  const value = getSessionStorage()?.getItem(DOCS_JOURNEY_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const record = JSON.parse(value) as Partial<DocsJourneyRecord>;

    if (
      typeof record.pageType !== 'string' ||
      typeof record.pathname !== 'string' ||
      typeof record.product !== 'string' ||
      typeof record.tab !== 'string'
    ) {
      removeJourneyRecord();
      return null;
    }

    return {
      pageType: record.pageType,
      pathname: record.pathname,
      product: record.product,
      tab: record.tab,
    };
  } catch {
    removeJourneyRecord();
    return null;
  }
}

function writeJourneyRecord(record: DocsJourneyRecord) {
  try {
    getSessionStorage()?.setItem(
      DOCS_JOURNEY_STORAGE_KEY,
      JSON.stringify(record),
    );
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

function removeJourneyRecord() {
  try {
    getSessionStorage()?.removeItem(DOCS_JOURNEY_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function inferDocsProduct(parts: string[], tab: string) {
  if (tab === 'realtime-media') {
    const product = parts[2];
    return !product || product === 'overview' ? tab : product;
  }

  if (tab === 'api-reference') {
    return parts[2] === 'api-ref' && parts[3] ? parts[3] : tab;
  }

  return tab;
}

function inferDocsPageType(pathname: string) {
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

function removeUndefinedProperties(properties: Record<string, unknown>) {
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
  if (typeof value === 'string' && LOCATION_DETAIL_PROPERTY_NAME.test(key)) {
    return '';
  }

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

  const key = import.meta.env.VITE_POSTHOG_KEY;

  if (!key) {
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
