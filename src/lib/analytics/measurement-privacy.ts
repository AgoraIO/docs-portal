import type { BeforeSendFn } from 'posthog-js';
import { MAX_FEEDBACK_COMMENT_LENGTH } from '@/lib/docs-feedback';

// The SDK adds URL, referrer and persisted values after capture(). Keep this
// allowlist at the final transport boundary, including for automatic events.
const allowedProperties = new Set([
  'token',
  'distinct_id',
  '$anon_distinct_id',
  '$device_id',
  '$session_id',
  '$window_id',
  '$lib',
  '$lib_version',
  '$process_person_profile',
  '$is_identified',
  '$host',
  '$pathname',
  '$current_url',
  '$referrer',
  '$browser',
  '$browser_version',
  '$os',
  '$os_version',
  '$device_type',
  '$screen_height',
  '$screen_width',
  '$viewport_height',
  '$viewport_width',
  'event_id',
  'schema_version',
  'event_source',
  'occurred_at',
  'site_id',
  'deployment_region',
  'locale',
  'environment',
  'app_release',
  'traffic_type',
  'test_run_id',
  'journey_id',
  'journey_started_at',
  'journey_rule_version',
  'entry_source',
  'entry_path',
  'search_id',
  'parent_search_id',
  'request_id',
  'results_view_id',
  'doc_view_id',
  'doc_id',
  'canonical_path',
  'content_type',
  'product',
  'platform',
  'version',
  'content_release',
  'surface',
  'attribution_status',
  'query_redacted',
  'query_length',
  'redaction_applied',
  'search_type',
  'filter_product',
  'filter_platform',
  'filter_version',
  'filter_tab',
  'trigger',
  'page',
  'attempt',
  'request_purpose',
  'provider',
  'index_revision',
  'search_strategy_version',
  'result_count',
  'result_unit',
  'total_hits',
  'result_id',
  'result_kind',
  'result_rank',
  'section_rank',
  'target_path',
  'selection_method',
  'first_results_visible_ms',
  'page_results_visible_ms',
  'state',
  'error_stage',
  'error_code',
  'prompt_id',
  'question_id',
  'feedback_scope',
  'feedback_source',
  'feedback_id',
  'has_comment',
  'feedback_destination',
  'response_revision',
  'response',
  'failure_reasons',
  'prompt_version',
  'sample_rate',
  'sample_selected',
  'sample_eligible',
  'frequency_limited',
  'frequency_status',
  'sampling_version',
  'value',
  'evidence_source',
  'flow_id',
  'resource_type',
  'resource_id',
  'source_path',
  'console_target',
  'target_kind',
  'account_uid',
  'company_id',
  '$groups',
]);
const pathProperties = new Set([
  '$pathname',
  'canonical_path',
  'entry_path',
  'target_path',
  'source_path',
]);
const sensitiveQuery =
  /(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+\d[\d ()-]{6,}\d|\b(?:86)?1[3-9]\d[ -]?\d{4}[ -]?\d{4}\b|\b\d{3,4}[- ]\d{7,8}\b)|https?:\/\/|\b(?:ph[cx]_|gh[pousr]_|sk[-_])[\w-]+|\beyJ[\w-]+\.[\w-]+|(?:token|secret|password|api[-_ ]?key|authorization|appcertificate)\s*[:=]|[A-Za-z0-9_+/=-]{32,})/i;

export function redactSearchQuery(value: string) {
  const query = value.trim().replace(/\s+/g, ' ');
  return sensitiveQuery.test(query) ? '[redacted]' : query.slice(0, 120);
}

export function analyticsPath(value: string): string {
  try {
    const path =
      new URL(value, 'https://docs.invalid').pathname
        .replace(/\/{2,}/g, '/')
        .replace(/\/+$/, '') || '/';
    return Array.from(decodeURIComponent(path)).some(
      (character) => character.charCodeAt(0) < 32 || character === '@',
    )
      ? '/[redacted]'
      : path.slice(0, 512);
  } catch {
    return '/[invalid]';
  }
}

function safeUrl(value: unknown, originOnly = false) {
  if (typeof value !== 'string') return undefined;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    return originOnly
      ? url.origin
      : `${url.origin}${analyticsPath(url.pathname)}`;
  } catch {
    return undefined;
  }
}

export const filterCnMeasurementEvent: BeforeSendFn = (event) => {
  if (!event) return event;
  const properties: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(event.properties)) {
    // Only explicitly submitted page feedback may carry free-form comments.
    // Preserve line breaks and the full UI limit instead of the generic 512 cap.
    if (key === 'comment') {
      if (
        event.event === 'docs_feedback_form_submitted' &&
        typeof value === 'string'
      )
        properties[key] = value.trim().slice(0, MAX_FEEDBACK_COMMENT_LENGTH);
      continue;
    }
    if (!allowedProperties.has(key)) continue;
    if (key === '$current_url' || key === '$referrer') {
      const safe = safeUrl(value, key === '$referrer');
      if (safe) properties[key] = safe;
    } else if (key === 'query_redacted' && typeof value === 'string') {
      properties[key] = redactSearchQuery(value);
    } else if (pathProperties.has(key) && typeof value === 'string') {
      properties[key] = analyticsPath(value);
    } else if (key === '$groups' && value && typeof value === 'object') {
      const cid = 'cid' in value ? value.cid : undefined;
      if (typeof cid === 'string') properties[key] = { cid: cid.slice(0, 128) };
    } else if (typeof value === 'string') {
      properties[key] = Array.from(value)
        .filter((character) => character.charCodeAt(0) >= 32)
        .join('')
        .slice(0, 512);
    } else if (typeof value === 'boolean' || value === null) {
      properties[key] = value;
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      properties[key] = value;
    } else if (Array.isArray(value)) {
      properties[key] = value
        .filter((item): item is string => typeof item === 'string')
        .slice(0, 12)
        .map((item) => item.slice(0, 80));
    }
  }
  return {
    uuid: event.uuid,
    event: event.event,
    timestamp: event.timestamp,
    properties,
  };
};
