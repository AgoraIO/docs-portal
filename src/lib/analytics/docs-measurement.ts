import { measurementContentContext } from './content-context';
import { analyticsPath, redactSearchQuery } from './measurement-privacy';

export type Properties = Record<
  string,
  string | number | boolean | null | string[]
>;
export type MeasurementEvent = { name: string; properties: Properties };
export type Journey = {
  id: string;
  started: number;
  active: number;
  sampled: boolean;
};
export type SearchSnapshot = {
  journey: Journey;
  searchId: string;
  started: number;
  properties: Properties;
};
export type ResultsSnapshot = {
  search: SearchSnapshot;
  viewId: string;
  started: number;
  properties: Properties;
};
export type ContentContext = {
  path: string;
  platform?: string;
  version?: string;
  contentType: string;
};
export type Selection = {
  id: string;
  path: string;
  rank: number;
  kind: string;
  method: string;
  sectionRank?: number;
};
export type Attribution = {
  journey: Journey;
  searchId: string;
  resultsViewId: string;
  target: string;
  expires: number;
};
export type FeedbackQuestion = 'resolution' | 'ease' | 'reasons';
export const resolutionAnswers = [
  'resolved',
  'partial',
  'not_resolved',
  'not_verified',
] as const;
export const failureReasons = [
  'not_found',
  'irrelevant',
  'wrong_context',
  'outdated',
  'incorrect',
  'unclear',
  'steps_failed',
  'slow',
  'other',
] as const;
const idleMs = 30 * 60 * 1000;

type Options = {
  emit: (event: MeasurementEvent) => void;
  now: () => number;
  id: () => string;
  environment: string;
  appRelease: string;
  entryPath: string | (() => string);
  entrySource?: string;
  testRunId?: string;
  restore?: Journey;
  save?: (journey: Journey | null) => void;
  random?: () => number;
  invitationStatus?: () => {
    eligible: boolean;
    limited: boolean;
    status: string;
  };
  restoreAnswers?: Record<string, { value: string; revision: number }>;
  saveAnswers?: (
    answers: Record<string, { value: string; revision: number }>,
  ) => void;
};

/** Business facts are immutable before the deferred SDK sees them. No raw query is stored. */
export function createDocsMeasurement(options: Options) {
  let journey = options.restore;
  let view: { key: string; properties: Properties } | undefined;
  let pending: Attribution | undefined;
  let lastSearch: SearchSnapshot | undefined;
  const presented = new Set<string>();
  const failed = new Set<string>();
  const prompts = new Set<string>();
  const answers = new Map<string, { value: string; revision: number }>(
    Object.entries(options.restoreAnswers ?? {}),
  );
  let revision = 0;
  const listeners = new Set<() => void>();
  function changed() {
    revision++;
    for (const listener of listeners) listener();
  }
  const common = {
    schema_version: '1',
    event_source: 'browser',
    site_id: 'docs_portal',
    deployment_region: 'cn',
    locale: 'zh-CN',
    environment: options.environment,
    app_release: options.appRelease || 'unknown',
    traffic_type: options.testRunId ? 'internal_test' : 'visitor',
    ...(options.testRunId ? { test_run_id: options.testRunId } : {}),
    journey_rule_version: 'idle30m-window24h-v1',
  };
  function send(
    name: string,
    context: Journey,
    properties: Properties,
    eventId = options.id(),
  ) {
    const event: MeasurementEvent = {
      name,
      properties: {
        ...common,
        event_id: eventId,
        occurred_at: new Date(options.now()).toISOString(),
        journey_id: context.id,
        journey_started_at: new Date(context.started).toISOString(),
        ...properties,
      },
    };
    // Collection is never on the critical search/navigation path.
    try {
      options.emit(event);
    } catch {
      /* A blocked collector cannot break the docs. */
    }
  }
  function current() {
    const now = options.now();
    if (!journey || now < journey.active || now - journey.active >= idleMs) {
      journey = {
        id: options.id(),
        started: now,
        active: now,
        sampled: (options.random ?? Math.random)() < 0.1,
      };
      view = undefined;
      lastSearch = undefined;
      pending = undefined;
      const invitation = options.invitationStatus?.();
      send('docs_journey_started', journey, {
        entry_path: analyticsPath(
          typeof options.entryPath === 'function'
            ? options.entryPath()
            : options.entryPath,
        ),
        entry_source: options.entrySource ?? 'unknown',
        sample_rate: 0.1,
        sample_selected: journey.sampled,
        sample_eligible: invitation?.eligible ?? true,
        frequency_limited: invitation?.limited ?? false,
        frequency_status: invitation?.status ?? 'unknown',
        sampling_version: 'v1',
      });
    }
    journey = { ...journey, active: now };
    options.save?.(journey);
    return journey;
  }
  function searchProperties(snapshot: SearchSnapshot) {
    return { ...snapshot.properties, search_id: snapshot.searchId };
  }
  function searchIsCurrent(snapshot: SearchSnapshot) {
    return (
      journey?.id === snapshot.journey.id &&
      options.now() >= journey.active &&
      options.now() - journey.active < idleMs
    );
  }
  return {
    current,
    searchIsCurrent,
    peek: () => journey,
    touch() {
      if (journey && options.now() - journey.active < idleMs) {
        journey = { ...journey, active: options.now() };
        options.save?.(journey);
      }
    },
    revision: () => revision,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    answer(question: FeedbackQuestion): string | string[] | undefined {
      if (!journey || options.now() - journey.active >= idleMs)
        return undefined;
      try {
        return (
          JSON.parse(
            answers.get(`${journey.id}:${question}`)?.value ?? 'null',
          ) ?? undefined
        );
      } catch {
        return undefined;
      }
    },
    reset() {
      journey = undefined;
      view = undefined;
      pending = undefined;
      lastSearch = undefined;
      options.save?.(null);
      changed();
    },
    startSearch(input: {
      surface: string;
      query: string;
      filters?: Record<string, string | undefined>;
      started?: number;
    }) {
      const context = current();
      const query = redactSearchQuery(input.query);
      const snapshot: SearchSnapshot = {
        journey: context,
        searchId: options.id(),
        started: input.started ?? options.now(),
        properties: {
          surface: input.surface,
          query_redacted: query,
          query_length: input.query.trim().length,
          redaction_applied: query === '[redacted]',
          parent_search_id: lastSearch?.searchId ?? null,
          search_strategy_version: 'cn-v1',
          index_revision: null,
          ...Object.fromEntries(
            Object.entries(input.filters ?? {}).map(([key, value]) => [
              key === 'type' ? 'search_type' : `filter_${key}`,
              value ?? null,
            ]),
          ),
        },
      };
      lastSearch = snapshot;
      send('docs_search_submitted', context, searchProperties(snapshot));
      return snapshot;
    },
    prepareResults(
      search: SearchSnapshot,
      input: {
        count: number;
        unit: string;
        page?: number;
        totalHits?: number;
        requestId?: string;
        started?: number;
      },
    ) {
      return {
        search,
        started: input.started ?? search.started,
        viewId: options.id(),
        properties: {
          result_count: input.count,
          result_unit: input.unit,
          page: input.page ?? 1,
          total_hits: input.totalHits ?? null,
          request_id: input.requestId ?? null,
          request_purpose: 'results',
        },
      } satisfies ResultsSnapshot;
    },
    presentResults(snapshot: ResultsSnapshot) {
      if (!searchIsCurrent(snapshot.search)) return;
      if (presented.has(snapshot.viewId)) return;
      presented.add(snapshot.viewId);
      const duration = options.now() - snapshot.started;
      send(
        'docs_search_results_presented',
        snapshot.search.journey,
        {
          ...searchProperties(snapshot.search),
          ...snapshot.properties,
          results_view_id: snapshot.viewId,
          first_results_visible_ms:
            snapshot.properties.page === 1 && duration >= 0 && duration < idleMs
              ? duration
              : null,
          page_results_visible_ms:
            snapshot.properties.page !== 1 && duration >= 0 && duration < idleMs
              ? duration
              : null,
        },
        snapshot.viewId,
      );
    },
    fail(search: SearchSnapshot, requestId?: string) {
      if (!searchIsCurrent(search)) return;
      const key = requestId ?? search.searchId;
      if (failed.has(key)) return;
      failed.add(key);
      send('docs_search_failed', search.journey, {
        ...searchProperties(search),
        request_id: requestId ?? null,
        error_stage: 'request',
        error_code: 'search_unavailable',
      });
    },
    selectResult(
      snapshot: ResultsSnapshot,
      result: Selection,
    ): Attribution | undefined {
      if (!searchIsCurrent(snapshot.search)) return undefined;
      const attribution = {
        journey: snapshot.search.journey,
        searchId: snapshot.search.searchId,
        resultsViewId: snapshot.viewId,
        target: analyticsPath(result.path),
        expires: options.now() + 5 * 60 * 1000,
      };
      const refreshBody =
        !result.method.endsWith('_new_tab') &&
        view?.properties.canonical_path === attribution.target;
      if (!result.method.endsWith('_new_tab')) pending = attribution;
      if (refreshBody) view = undefined;
      send('docs_search_result_selected', snapshot.search.journey, {
        ...searchProperties(snapshot.search),
        results_view_id: snapshot.viewId,
        result_id: analyticsPath(result.id),
        target_path: attribution.target,
        result_rank: result.rank,
        result_kind: result.kind,
        section_rank: result.sectionRank ?? null,
        selection_method: result.method,
      });
      if (refreshBody) changed();
      return attribution;
    },
    restoreAttribution(attribution: Attribution) {
      if (
        attribution.expires < options.now() ||
        attribution.journey.active > options.now()
      )
        return;
      journey = attribution.journey;
      pending = attribution;
      options.save?.(journey);
    },
    viewContent(input: ContentContext) {
      const context = current();
      const path = analyticsPath(input.path);
      const key = JSON.stringify([
        context.id,
        path,
        input.platform ?? null,
        input.version ?? null,
      ]);
      if (view?.key === key) return view.properties;
      const attributed =
        pending &&
        pending.expires >= options.now() &&
        pending.target === path &&
        pending.journey.id === context.id
          ? pending
          : undefined;
      const properties: Properties = {
        canonical_path: path,
        doc_id: path,
        content_type: input.contentType,
        product: measurementContentContext(path).product,
        platform:
          input.platform ?? measurementContentContext(path).platform ?? null,
        version: input.version ?? null,
        content_release: options.appRelease || 'unknown',
        doc_view_id: options.id(),
        search_id: attributed?.searchId ?? null,
        results_view_id: attributed?.resultsViewId ?? null,
        attribution_status: attributed ? 'search_result' : 'unknown',
      };
      view = { key, properties };
      pending = undefined;
      send('docs_content_viewed', context, properties);
      return properties;
    },
    leaveContent() {
      view = undefined;
    },
    contentContext(path: string) {
      return view?.properties.canonical_path === analyticsPath(path)
        ? view.properties
        : {};
    },
    prompt(
      question: FeedbackQuestion | 'page_helpfulness',
      surface: string,
      source: string,
      extras: Properties = {},
    ) {
      const context = current();
      const scope = question === 'page_helpfulness' ? 'page' : 'journey';
      const key = `${context.id}:${scope === 'page' ? (view?.properties.doc_view_id ?? 'unknown') : ''}:${question}`;
      if (prompts.has(key)) return;
      prompts.add(key);
      send('docs_feedback_prompted', context, {
        ...extras,
        prompt_id: key,
        question_id: question,
        feedback_scope: scope,
        surface,
        feedback_source: source,
        prompt_version: 'v1',
        sample_rate: 0.1,
      });
    },
    feedback(
      question: FeedbackQuestion,
      value: string | string[],
      surface: string,
      source: string,
    ) {
      const valid =
        question === 'resolution'
          ? typeof value === 'string' &&
            resolutionAnswers.some((answer) => answer === value)
          : question === 'ease'
            ? typeof value === 'string' && /^[1-5]$/.test(value)
            : Array.isArray(value) &&
              value.every((item) =>
                failureReasons.some((reason) => reason === item),
              );
      if (!valid) return false;
      const context = current();
      const normalized = Array.isArray(value)
        ? [...new Set(value)].sort()
        : value;
      const key = `${context.id}:${question}`;
      const encoded = JSON.stringify(normalized);
      const previous = answers.get(key);
      if (previous?.value === encoded) return false;
      const revision = (previous?.revision ?? 0) + 1;
      answers.set(key, { value: encoded, revision });
      options.saveAnswers?.(Object.fromEntries([...answers].slice(-50)));
      changed();
      send('docs_feedback_submitted', context, {
        ...(surface === 'content' ? (view?.properties ?? {}) : {}),
        question_id: question,
        prompt_id: `${context.id}::${question}`,
        feedback_scope: 'journey',
        feedback_source: source,
        response: normalized,
        response_revision: revision,
        surface,
        evidence_source: 'self_report',
      });
      return true;
    },
    pageFeedback(value: 'yes' | 'no', path: string) {
      const context = current();
      const properties =
        view?.properties.canonical_path === analyticsPath(path)
          ? view.properties
          : {
              canonical_path: analyticsPath(path),
              attribution_status: 'unknown',
            };
      send('docs_page_feedback', context, {
        ...properties,
        value,
        question_id: 'page_helpfulness',
        feedback_scope: 'page',
        evidence_source: 'self_report',
      });
    },
  };
}
export type DocsMeasurement = ReturnType<typeof createDocsMeasurement>;
