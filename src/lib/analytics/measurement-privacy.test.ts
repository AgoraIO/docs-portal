import { expect, it } from 'vitest';
import {
  filterCnMeasurementEvent,
  redactSearchQuery,
} from './measurement-privacy';

it('preserves diagnostic facts at the final transport boundary while dropping arbitrary errors', () => {
  const event = filterCnMeasurementEvent({
    uuid: 'diagnostic-event',
    event: 'docs_search_results_presented',
    properties: {
      query_redacted: 'a@example.test',
      result_outcome: 'no_visible_results',
      server_group_count: 3,
      http_status: 503,
      recovery_action: 'clear_filters',
      index_revision: 'index-a',
      error_message: 'private error body',
    },
  });
  expect(event?.properties).toEqual({
    query_redacted: '[redacted]',
    result_outcome: 'no_visible_results',
    server_group_count: 3,
    http_status: 503,
    recovery_action: 'clear_filters',
    index_revision: 'index-a',
  });
});

it.each([
  '+8613812345678',
  '138 1234 5678',
  '+1 (415) 555-1212',
  '021-12345678',
  'a@example.test',
  'token=private-value',
  'https://private.example/path',
])('redacts suspected sensitive query: %s', (query) => {
  expect(redactSearchQuery(query)).toBe('[redacted]');
});
it.each(['Token', 'manualSOS', '云端录制', 'joinChannel'])(
  'retains useful public technical terms: %s',
  (query) => {
    expect(redactSearchQuery(query)).toBe(query);
  },
);
