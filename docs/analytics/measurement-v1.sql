-- v1, owner: docs portal maintainers. Times: UTC; cohort calendar: Asia/Shanghai.
-- Parameterize the environment/traffic predicates together for staging inspection.
-- Production defaults exclude local/staging/internal tests. No production baseline yet.
WITH captured AS (
  SELECT event, timestamp AS received_at,
    properties.event_id AS event_id, properties.journey_id AS journey_id,
    toDateTime(properties.occurred_at) AS occurred_at,
    toDateTime(properties.journey_started_at) AS journey_started_at,
    properties.search_id AS search_id, properties.results_view_id AS results_view_id,
    properties.doc_view_id AS doc_view_id, properties.canonical_path AS canonical_path,
    properties.surface AS surface, properties.query_redacted AS query_redacted,
    properties.platform AS platform, properties.version AS version, properties.product AS product,
    properties.feedback_scope AS feedback_scope, properties.question_id AS question_id,
    properties.feedback_source AS feedback_source,
    if(event = 'docs_page_feedback', properties.value, properties.response) AS response,
    properties.result_count AS result_count, properties.result_rank AS result_rank,
    properties.result_unit AS result_unit, properties.page AS page,
    properties.first_results_visible_ms AS first_results_visible_ms,
    properties.attribution_status AS attribution_status,
    properties.app_release AS app_release,
    row_number() OVER (PARTITION BY properties.event_id ORDER BY timestamp, uuid) AS event_copy
  FROM events
  WHERE timestamp >= now() - INTERVAL 31 DAY AND timestamp < now()
    AND event IN ('docs_journey_started', 'docs_search_submitted', 'docs_search_results_presented',
      'docs_search_failed', 'docs_search_result_selected', 'docs_content_viewed',
      'docs_feedback_prompted', 'docs_feedback_submitted', 'docs_page_feedback')
    AND properties.site_id = 'docs_portal' AND properties.schema_version = '1'
    AND properties.deployment_region = 'cn' AND properties.locale = 'zh-CN'
    AND properties.environment = 'production' AND properties.traffic_type = 'visitor'
    AND properties.event_id IS NOT NULL AND properties.journey_id IS NOT NULL
), docs_event_facts AS (
  SELECT * FROM captured WHERE event_copy = 1
    AND occurred_at >= journey_started_at AND journey_started_at <= now()
), valid_feedback AS (
  SELECT *, lagInFrame(toString(response), 1, '') OVER (
    PARTITION BY journey_id, feedback_scope, question_id,
      if(feedback_scope = 'page', coalesce(doc_view_id, canonical_path), '')
    ORDER BY occurred_at, event_id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS previous_response
  FROM docs_event_facts
  WHERE event IN ('docs_feedback_submitted', 'docs_page_feedback')
    AND occurred_at <= journey_started_at + INTERVAL 24 HOUR
    AND ((feedback_scope = 'journey' AND question_id = 'resolution'
      AND response IN ('resolved', 'partial', 'not_resolved', 'not_verified'))
      OR (feedback_scope = 'journey' AND question_id = 'ease' AND response IN ('1','2','3','4','5'))
      OR (feedback_scope = 'page' AND question_id = 'page_helpfulness' AND response IN ('yes','no'))
      OR (feedback_scope = 'journey' AND question_id = 'reasons'))
), docs_feedback_facts AS (
  SELECT journey_id, feedback_scope, question_id,
    if(feedback_scope = 'page', coalesce(doc_view_id, canonical_path), '') AS scope_id,
    argMax(response, tuple(occurred_at, event_id)) AS latest_response,
    argMax(canonical_path, tuple(occurred_at, event_id)) AS canonical_path,
    argMax(feedback_source, tuple(occurred_at, event_id)) AS feedback_source,
    max(occurred_at) AS answered_at
  FROM valid_feedback WHERE toString(response) != previous_response
  GROUP BY journey_id, feedback_scope, question_id, scope_id
), docs_journey_facts AS (
  SELECT journey_id, min(journey_started_at) AS started_at,
    min(journey_started_at) + INTERVAL 24 HOUR <= now() AS mature,
    countIf(event = 'docs_search_submitted') AS search_count,
    countIf(event = 'docs_content_viewed') AS content_view_count,
    countIf(event = 'docs_feedback_prompted' AND question_id = 'resolution') > 0 AS resolution_prompted,
    countIf(event = 'docs_feedback_submitted' AND question_id = 'resolution'
      AND occurred_at <= journey_started_at + INTERVAL 24 HOUR) > 0 AS resolution_answered,
    argMin(app_release, tuple(occurred_at, event_id)) AS app_release
  FROM docs_event_facts GROUP BY journey_id
), docs_search_facts AS (
  SELECT search_id, any(journey_id) AS journey_id, any(surface) AS surface,
    any(query_redacted) AS query_redacted,
    countIf(event = 'docs_search_submitted') > 0 AS submitted,
    countIf(event = 'docs_search_results_presented') > 0 AS presented,
    countIf(event = 'docs_search_failed') > 0 AS failed,
    countIf(event = 'docs_search_result_selected') > 0 AS selected,
    countIf(event = 'docs_content_viewed' AND attribution_status = 'search_result') > 0 AS arrived,
    argMinIf(result_count, tuple(occurred_at, event_id), event = 'docs_search_results_presented' AND page = 1) AS first_result_count,
    argMinIf(first_results_visible_ms, tuple(occurred_at, event_id), event = 'docs_search_results_presented' AND page = 1 AND first_results_visible_ms IS NOT NULL) AS first_visible_ms,
    anyIf(result_unit, event = 'docs_search_results_presented') AS result_unit,
    minIf(result_rank, event = 'docs_search_result_selected') AS best_selected_rank
  FROM docs_event_facts WHERE search_id IS NOT NULL GROUP BY search_id
), docs_content_view_facts AS (
  SELECT doc_view_id, any(journey_id) AS journey_id, any(canonical_path) AS canonical_path,
    any(product) AS product, any(platform) AS platform, any(version) AS version,
    countIf(event = 'docs_content_viewed') > 0 AS viewed,
    anyIf(attribution_status, event = 'docs_content_viewed') AS attribution_status
  FROM docs_event_facts WHERE doc_view_id IS NOT NULL GROUP BY doc_view_id
)
-- Replace this SELECT with one of the report SELECTs. Keep this shared CTE contract.
SELECT * FROM docs_journey_facts LIMIT 100
