-- SQL-only fixture; never insert these rows into captured events.
-- Expected: repeat resolved at .100; reverse not_resolved at .200 with NULL page/view.
WITH docs_event_facts AS (
SELECT 'reverse' AS journey_id, 'journey' AS feedback_scope, 'resolution' AS question_id, 'view-old' AS doc_view_id, '/zh-CN/old' AS canonical_path, toDateTime64('2026-10-19T01:00:00.100',3) AS occurred_at, toDateTime64('2026-10-19T00:00:00.000',3) AS journey_started_at, 1 AS response_revision, 'zz-old' AS event_id, 'resolved' AS response, 'manual_content' AS feedback_source, 'docs_feedback_submitted' AS event
UNION ALL
SELECT 'reverse' AS journey_id, 'journey' AS feedback_scope, 'resolution' AS question_id, NULL AS doc_view_id, NULL AS canonical_path, toDateTime64('2026-10-19T01:00:00.200',3) AS occurred_at, toDateTime64('2026-10-19T00:00:00.000',3) AS journey_started_at, 2 AS response_revision, 'aa-new' AS event_id, 'not_resolved' AS response, 'manual_search_page' AS feedback_source, 'docs_feedback_submitted' AS event
UNION ALL
SELECT 'reverse' AS journey_id, 'journey' AS feedback_scope, 'resolution' AS question_id, NULL AS doc_view_id, NULL AS canonical_path, toDateTime64('2026-10-19T01:00:00.300',3) AS occurred_at, toDateTime64('2026-10-19T00:00:00.000',3) AS journey_started_at, 2 AS response_revision, 'cc-repeat' AS event_id, 'not_resolved' AS response, 'manual_search_page' AS feedback_source, 'docs_feedback_submitted' AS event
UNION ALL
SELECT 'repeat' AS journey_id, 'journey' AS feedback_scope, 'resolution' AS question_id, 'view-doc' AS doc_view_id, '/zh-CN/doc' AS canonical_path, toDateTime64('2026-10-19T01:00:00.100',3) AS occurred_at, toDateTime64('2026-10-19T00:00:00.000',3) AS journey_started_at, 1 AS response_revision, 'zz-first' AS event_id, 'resolved' AS response, 'manual_content' AS feedback_source, 'docs_feedback_submitted' AS event
UNION ALL
SELECT 'repeat' AS journey_id, 'journey' AS feedback_scope, 'resolution' AS question_id, 'view-doc' AS doc_view_id, '/zh-CN/doc' AS canonical_path, toDateTime64('2026-10-19T01:00:00.500',3) AS occurred_at, toDateTime64('2026-10-19T00:00:00.000',3) AS journey_started_at, 1 AS response_revision, 'aa-repeat' AS event_id, 'resolved' AS response, 'manual_content' AS feedback_source, 'docs_feedback_submitted' AS event
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
) SELECT journey_id,latest_response,canonical_path,reported_doc_view_id,feedback_source,answered_at FROM docs_feedback_facts ORDER BY journey_id

