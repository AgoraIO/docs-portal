import type { BeforeSendFn } from 'posthog-js';
import type { AccountFlow, DocsAccount } from '@/lib/auth/contracts';

type PostHogClient = typeof import('posthog-js').default;

const POSTHOG_HOST = 'https://us.i.posthog.com';
const accountFlowEvents = [
  'docs_resource_action_started',
  'docs_account_guidance_shown',
  'docs_account_guidance_dismissed',
  'docs_account_login_clicked',
] as const;
const accountFlowProperties = new Set([
  'flow_id',
  'locale',
  'resource_type',
  'resource_id',
  'source_path',
  'platform',
  'version',
  'console_target',
  'target_kind',
  'account_uid',
  'company_id',
  '$groups',
  'distinct_id',
  '$lib',
  '$lib_version',
  '$process_person_profile',
  '$is_identified',
  // Public project routing key required by the browser SDK, never an SSO token.
  'token',
  '$anon_distinct_id',
]);
const filterAccountFlowEvent: BeforeSendFn = (event) => {
  if (
    !event ||
    (event.event !== '$identify' &&
      !accountFlowEvents.some((name) => name === event.event))
  )
    return event;
  // The SDK merges URL/referrer and persisted properties after capture(). Apply
  // the account-flow allowlist at the final outbound boundary, including $set.
  return {
    uuid: event.uuid,
    event: event.event,
    timestamp: event.timestamp,
    properties: Object.fromEntries(
      Object.entries(event.properties).filter(([key]) =>
        accountFlowProperties.has(key),
      ),
    ),
  };
};

let posthogClientPromise: Promise<PostHogClient | null> | null = null;

export type DocsFeedbackValue = 'yes' | 'no';

export function initializePostHog() {
  void getPostHogClient();
}

export function captureAccountFlow(
  event: (typeof accountFlowEvents)[number],
  flow: AccountFlow,
  account: DocsAccount | null,
) {
  void getPostHogClient().then((posthog) => {
    if (!posthog) return;
    applyDocsAccount(posthog, account);
    posthog.capture(event, {
      flow_id: flow.flowId,
      locale: 'zh-CN',
      resource_type: flow.resourceType,
      resource_id: flow.resourceId,
      source_path: flow.sourcePath,
      platform: flow.platform,
      version: flow.version,
      console_target: flow.target,
      target_kind: flow.target === 'home' ? 'fallback' : 'service',
      $groups: account?.companyId ? { cid: account.companyId } : {},
      ...(account
        ? {
            account_uid: account.accountUid,
            company_id: account.companyId,
          }
        : {}),
    });
  });
}

export async function getDocsAnonymousId() {
  const posthog = await getPostHogClient();
  // Never ask the callback to merge a previous identified account into another.
  return posthog && !posthog.get_property('$user_id')
    ? posthog.get_distinct_id()
    : undefined;
}

export async function synchronizeDocsAccount(account: DocsAccount | null) {
  const posthog = await getPostHogClient();
  if (!posthog) return;
  applyDocsAccount(posthog, account);
}

function applyDocsAccount(posthog: PostHogClient, account: DocsAccount | null) {
  const previous = posthog.get_property('$user_id');
  if (previous && previous !== account?.accountUid) posthog.reset();
  if (account && previous !== account.accountUid)
    posthog.identify(account.accountUid);
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
    posthogClientPromise = import('posthog-js')
      .then(({ default: posthog }) => {
        posthog.init(key, {
          api_host: import.meta.env.VITE_POSTHOG_HOST || POSTHOG_HOST,
          autocapture: true,
          before_send: filterAccountFlowEvent,
          capture_pageview: 'history_change',
          defaults: '2026-05-30',
          disable_session_recording: true,
          persistence: 'localStorage+cookie',
        });

        return posthog;
      })
      .catch(() => null);
  }

  return posthogClientPromise;
}
