import type { BeforeSendFn } from 'posthog-js';
import type { AccountFlow, DocsAccount } from '@/lib/auth/contracts';
import {
  negativeFeedbackReasons,
  positiveFeedbackReasons,
} from '@/lib/docs-feedback';
import type { MeasurementEvent } from './docs-measurement';
import { measurementPath } from './measurement-path';
import { filterCnMeasurementEvent } from './measurement-privacy';

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

const filterOutboundEvent: BeforeSendFn = (event) => {
  const filtered = filterAccountFlowEvent(event);
  return import.meta.env.VITE_DOCS_REGION === 'cn'
    ? filterCnMeasurementEvent(filtered)
    : filtered;
};

let currentDocsAccount: DocsAccount | null = null;
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
  if (
    currentDocsAccount &&
    currentDocsAccount.accountUid !== account?.accountUid &&
    typeof window !== 'undefined'
  )
    window.dispatchEvent(new Event('docs-account-changed'));
  currentDocsAccount = account;
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

/** True means the SDK accepted this immutable event, not server receipt confirmation. */
export async function captureDocsFeedbackSubmission(input: {
  id: string;
  submittedAt: string;
  helpfulness: DocsFeedbackValue;
  reasons: readonly string[];
  hasComment: boolean;
  pagePath: string;
}): Promise<boolean> {
  if (
    typeof window === 'undefined' ||
    import.meta.env.VITE_DOCS_REGION !== 'cn' ||
    import.meta.env.VITE_DOCS_MEASUREMENT_ENABLED !== 'true'
  )
    return false;
  const labels =
    input.helpfulness === 'yes'
      ? positiveFeedbackReasons
      : negativeFeedbackReasons;
  if (
    !input.reasons.length ||
    input.reasons.some((reason) => !Object.hasOwn(labels, reason))
  )
    return false;
  const response = [...new Set(input.reasons)].sort();
  const properties: Record<string, unknown> = {
    event_id: input.id,
    feedback_id: input.id,
    occurred_at: input.submittedAt,
    schema_version: '1',
    event_source: 'browser',
    site_id: 'docs_portal',
    deployment_region: 'cn',
    locale: 'zh-CN',
    environment: import.meta.env.VITE_DOCS_ENVIRONMENT || 'local',
    app_release: import.meta.env.VITE_DOCS_APP_RELEASE || 'unknown',
    canonical_path: measurementPath(input.pagePath),
    value: input.helpfulness,
    response,
    has_comment: input.hasComment,
    feedback_destination: input.hasComment ? 'github' : 'analytics',
    feedback_scope: 'page',
    feedback_source: 'manual',
    surface: 'content',
    question_id: 'reasons',
    prompt_version: 'inline-reasons-v1',
    evidence_source: 'self_report',
    traffic_type: 'visitor',
  };
  try {
    if (import.meta.env.VITE_DOCS_ENVIRONMENT !== 'production') {
      const testId = sessionStorage.getItem('docs-measurement-test');
      if (testId && /^[a-zA-Z0-9_-]{1,80}$/.test(testId)) {
        properties.test_run_id = testId;
        properties.traffic_type = 'internal_test';
      }
    }
  } catch {
    /* Storage can be unavailable. */
  }
  const account = currentDocsAccount;
  try {
    const posthog = await getPostHogClient();
    if (!posthog) return false;
    applyDocsAccount(posthog, account);
    return Boolean(
      posthog.capture(
        'docs_feedback_form_submitted',
        {
          ...properties,
          ...(account
            ? {
                account_uid: account.accountUid,
                company_id: account.companyId,
                $groups: { cid: account.companyId },
              }
            : {}),
        },
        {
          uuid: input.id,
          timestamp: new Date(input.submittedAt),
          send_instantly: true,
        },
      ),
    );
  } catch {
    return false;
  }
}

export function captureMeasurementEvent(event: MeasurementEvent) {
  if (
    import.meta.env.VITE_DOCS_REGION !== 'cn' ||
    import.meta.env.VITE_DOCS_MEASUREMENT_ENABLED !== 'true'
  )
    return;
  const account = currentDocsAccount;
  void getPostHogClient()
    .then((posthog) => {
      if (!posthog) return;
      applyDocsAccount(posthog, account);
      posthog.capture(
        event.name,
        {
          ...event.properties,
          ...(account
            ? { account_uid: account.accountUid, company_id: account.companyId }
            : {}),
          $groups: account?.companyId ? { cid: account.companyId } : {},
        },
        { timestamp: new Date(String(event.properties.occurred_at)) },
      );
    })
    .catch(() => {});
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
          before_send: filterOutboundEvent,
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
