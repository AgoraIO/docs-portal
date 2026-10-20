-- v1, owner: docs portal maintainers. Times: UTC; cohort calendar: Asia/Shanghai.
-- Parameterize the environment/traffic predicates together for staging inspection.
-- Production defaults exclude local/staging/internal tests. No production baseline yet.
WITH captured AS (
  SELECT event, timestamp AS received_at,
    properties.event_id AS event_id, properties.journey_id AS journey_id,
    toDateTime64(properties.occurred_at, 3) AS occurred_at,
    toDateTime64(properties.journey_started_at, 3) AS journey_started_at,
    properties.search_id AS search_id, properties.results_view_id AS results_view_id,
    properties.doc_view_id AS doc_view_id, properties.canonical_path AS canonical_path,
    if(event = 'docs_content_viewed', 'content', properties.surface) AS surface, properties.query_redacted AS query_redacted,
    properties.platform AS platform, properties.version AS version, properties.product AS product,
    properties.feedback_scope AS feedback_scope, properties.question_id AS question_id,
    properties.feedback_source AS feedback_source, toIntOrZero(toString(properties.response_revision)) AS response_revision,
    toString(if(event = 'docs_page_feedback', properties.value, properties.response)) AS response,
    toIntOrZero(toString(properties.result_count)) AS result_count, toIntOrZero(toString(properties.result_rank)) AS result_rank,
    properties.result_unit AS result_unit, toIntOrZero(toString(properties.page)) AS page,
    toFloatOrNull(toString(properties.first_results_visible_ms)) AS first_results_visible_ms,
    properties.attribution_status AS attribution_status,
    properties.app_release AS app_release,
    properties.sample_selected = true AS sample_selected, properties.sample_eligible = true AS sample_eligible,
    properties.frequency_limited = true AS frequency_limited,
    ((coalesce({variables.cn_docs_product}, '') = '' OR coalesce(properties.product, properties.filter_product) = {variables.cn_docs_product})
      AND (coalesce({variables.cn_docs_platform}, '') = '' OR coalesce(properties.platform, properties.filter_platform) = {variables.cn_docs_platform})
      AND (coalesce({variables.cn_docs_version}, '') = '' OR coalesce(properties.version, properties.filter_version) = {variables.cn_docs_version})
      AND (coalesce({variables.cn_docs_release}, '') = '' OR properties.app_release = {variables.cn_docs_release})
      AND (coalesce({variables.cn_docs_surface}, '') = '' OR if(event = 'docs_content_viewed', 'content', properties.surface) = {variables.cn_docs_surface})) AS matches_context,
    row_number() OVER (PARTITION BY properties.event_id ORDER BY timestamp, uuid) AS event_copy
  FROM events
  WHERE timestamp >= toStartOfDay({variables.cn_docs_from}, 'Asia/Shanghai') AND timestamp < now()
    AND event IN ('docs_journey_started', 'docs_search_submitted', 'docs_search_results_presented',
      'docs_search_failed', 'docs_search_result_selected', 'docs_content_viewed',
      'docs_feedback_prompted', 'docs_feedback_submitted', 'docs_page_feedback')
    AND properties.site_id = 'docs_portal' AND properties.schema_version = '1'
    AND properties.deployment_region = 'cn' AND properties.locale = 'zh-CN'
    AND properties.environment = {variables.cn_docs_environment} AND properties.traffic_type = {variables.cn_docs_traffic}
    AND (({variables.cn_docs_environment} = 'production' AND properties.$host = 'docs-portal.sh3.agoralab.co')
      OR ({variables.cn_docs_environment} = 'staging' AND properties.$host = 'docs-portal-staging.sh3.agoralab.co')
      OR ({variables.cn_docs_environment} = 'local' AND (properties.$host IN ('localhost', '127.0.0.1')
        OR properties.$host LIKE 'localhost:%' OR properties.$host LIKE '127.0.0.1:%')))
    AND properties.event_id IS NOT NULL AND properties.journey_id IS NOT NULL
), docs_event_facts AS (
  SELECT * FROM captured WHERE event_copy = 1
    AND occurred_at >= journey_started_at AND journey_started_at <= now()
), valid_feedback AS (
  SELECT *, lagInFrame(toString(response), 1, '') OVER (
    PARTITION BY journey_id, feedback_scope, question_id,
      if(feedback_scope = 'page', coalesce(doc_view_id, canonical_path), '')
    ORDER BY occurred_at, response_revision, event_id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
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
    argMax(tuple(response, canonical_path, doc_view_id, feedback_source), tuple(occurred_at, response_revision, event_id)) AS latest_fact,
    latest_fact.1 AS latest_response, latest_fact.2 AS canonical_path,
    latest_fact.3 AS reported_doc_view_id, latest_fact.4 AS feedback_source,
    max(occurred_at) AS answered_at
  FROM valid_feedback WHERE toString(response) != previous_response
  GROUP BY journey_id, feedback_scope, question_id, scope_id
), docs_journey_facts AS (
  SELECT journey_id, min(journey_started_at) AS started_at, max(matches_context) AS matches_context,
    min(journey_started_at) + INTERVAL 24 HOUR <= now() AS mature,
    countIf(event = 'docs_search_submitted') AS search_count,
    countIf(event = 'docs_content_viewed') AS content_view_count,
    countIf(event = 'docs_content_viewed' AND attribution_status = 'search_result') AS search_arrivals,
    countIf(event = 'docs_journey_started' AND sample_selected) > 0 AS sample_selected,
    countIf(event = 'docs_journey_started' AND sample_eligible) > 0 AS sample_eligible,
    countIf(event = 'docs_journey_started' AND frequency_limited) > 0 AS frequency_limited,
    countIf(event = 'docs_feedback_submitted' AND question_id = 'resolution' AND occurred_at > journey_started_at + INTERVAL 24 HOUR) AS late_resolution_answers,
    countIf(event = 'docs_feedback_prompted' AND question_id = 'resolution') > 0 AS resolution_prompted,
    countIf(event = 'docs_feedback_submitted' AND question_id = 'resolution'
      AND occurred_at <= journey_started_at + INTERVAL 24 HOUR) > 0 AS resolution_answered,
    argMin(app_release, tuple(occurred_at, event_id)) AS app_release
  FROM docs_event_facts GROUP BY journey_id
), docs_search_facts AS (
  SELECT search_id, any(journey_id) AS journey_id, argMinIf(surface, tuple(occurred_at, event_id), event = 'docs_search_submitted') AS surface, max(matches_context) AS matches_context, min(journey_started_at) AS started_at,
    any(query_redacted) AS query_redacted,
    countIf(event = 'docs_search_submitted') > 0 AS submitted,
    countIf(event = 'docs_search_results_presented') > 0 AS presented,
    countIf(event = 'docs_search_results_presented' AND page = 1) > 0 AS first_presented,
    countIf(event = 'docs_search_failed') > 0 AS failed,
    countIf(event = 'docs_search_result_selected') > 0 AS selected,
    countIf(event = 'docs_content_viewed' AND attribution_status = 'search_result') > 0 AS arrived,
    argMinIf(result_count, tuple(occurred_at, event_id), event = 'docs_search_results_presented' AND page = 1) AS first_result_count,
    argMinIf(first_results_visible_ms, tuple(occurred_at, event_id), event = 'docs_search_results_presented' AND page = 1 AND first_results_visible_ms IS NOT NULL) AS first_visible_ms,
    anyIf(result_unit, event = 'docs_search_results_presented') AS result_unit,
    minIf(result_rank, event = 'docs_search_result_selected') AS best_selected_rank
  FROM docs_event_facts WHERE search_id IS NOT NULL GROUP BY search_id
), docs_content_view_facts AS (
  SELECT doc_view_id, any(journey_id) AS journey_id, any(canonical_path) AS canonical_path, max(matches_context) AS matches_context, min(journey_started_at) AS started_at,
    any(product) AS product, any(platform) AS platform, any(version) AS version,
    countIf(event = 'docs_content_viewed') > 0 AS viewed,
    anyIf(attribution_status, event = 'docs_content_viewed') AS attribution_status
  FROM docs_event_facts WHERE doc_view_id IS NOT NULL GROUP BY doc_view_id
)
-- Replace this SELECT with one of the report SELECTs. Keep this shared CTE contract.
SELECT * FROM docs_journey_facts WHERE matches_context
  AND started_at >= toStartOfDay({variables.cn_docs_from}, 'Asia/Shanghai')
  AND started_at < toStartOfDay({variables.cn_docs_to}, 'Asia/Shanghai') LIMIT 100
