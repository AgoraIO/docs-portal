type PostHogClient = typeof import('posthog-js').default;

const POSTHOG_HOST = 'https://us.i.posthog.com';

let posthogClientPromise: Promise<PostHogClient | null> | null = null;

export type DocsFeedbackValue = 'yes' | 'no';

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
        capture_pageview: 'history_change',
        defaults: '2026-05-30',
        disable_session_recording: true,
        persistence: 'localStorage+cookie',
      });

      return posthog;
    });
  }

  return posthogClientPromise;
}
