import { describe, expect, it } from 'vitest';
import {
  createDocsMeasurement,
  type MeasurementEvent,
} from './docs-measurement';

describe('Chinese docs measurement', () => {
  it('attributes an old visible result to its own search while a new query is pending', () => {
    const events: MeasurementEvent[] = [];
    let sequence = 0;
    const measurement = createDocsMeasurement({
      emit: (event) => events.push(event),
      now: () => Date.parse('2026-10-19T08:00:00Z'),
      id: () => `id-${++sequence}`,
      environment: 'staging',
      appRelease: 'release-a',
      entryPath: '/zh-CN/introduction',
    });
    const first = measurement.startSearch({
      surface: 'search_dialog',
      query: 'Token',
    });
    const visible = measurement.prepareResults(first, {
      count: 1,
      unit: 'section',
    });
    measurement.presentResults(visible);
    measurement.startSearch({ surface: 'search_dialog', query: 'manualSOS' });
    measurement.selectResult(visible, {
      id: 'token-guide',
      path: '/zh-CN/introduction/token',
      rank: 1,
      kind: 'section',
      method: 'keyboard',
    });
    const selection = events.find(
      (event) => event.name === 'docs_search_result_selected',
    );
    expect(selection?.properties).toMatchObject({
      search_id: first.searchId,
      results_view_id: visible.viewId,
      query_redacted: 'Token',
      result_rank: 1,
    });
  });
});

function fixture() {
  const events: MeasurementEvent[] = [];
  let time = Date.parse('2026-10-19T08:00:00Z');
  let sequence = 0;
  const measurement = createDocsMeasurement({
    emit: (event) => events.push(event),
    now: () => time,
    id: () => `id-${++sequence}`,
    environment: 'staging',
    appRelease: 'test',
    entryPath: '/zh-CN/introduction',
  });
  return {
    measurement,
    events,
    advance: (ms: number) => {
      time += ms;
    },
  };
}

it('records a visible snapshot once, keeps empty results separate from errors, and never retains raw secrets', () => {
  const { measurement, events } = fixture();
  const search = measurement.startSearch({
    surface: 'search_page',
    query: 'token=private person@example.test',
  });
  const results = measurement.prepareResults(search, {
    count: 0,
    unit: 'document',
  });
  measurement.presentResults(results);
  measurement.presentResults(results);
  measurement.fail(search, 'request-a');
  measurement.fail(search, 'request-a');
  expect(
    events.filter((event) => event.name === 'docs_search_results_presented'),
  ).toHaveLength(1);
  expect(
    events.filter((event) => event.name === 'docs_search_failed'),
  ).toHaveLength(1);
  expect(JSON.stringify(events)).not.toContain('person@example');
  expect(JSON.stringify(search)).not.toContain('private');
});

it('keeps feedback questions independent and increments revisions only for a changed valid answer', () => {
  const { measurement, events, advance } = fixture();
  measurement.viewContent({ path: '/zh-CN/introduction/', contentType: 'mdx' });
  measurement.feedback('resolution', 'resolved', 'content', 'manual');
  advance(1000);
  measurement.feedback('resolution', 'resolved', 'content', 'manual');
  measurement.feedback('ease', '5', 'content', 'manual');
  measurement.feedback('resolution', 'not_resolved', 'content', 'manual');
  measurement.feedback('resolution', 'resolved', 'content', 'manual');
  measurement.feedback('ease', '6', 'content', 'manual');
  const responses = events.filter(
    (event) => event.name === 'docs_feedback_submitted',
  );
  expect(
    responses.map((event) => [
      event.properties.question_id,
      event.properties.response,
      event.properties.response_revision,
    ]),
  ).toEqual([
    ['resolution', 'resolved', 1],
    ['ease', '5', 1],
    ['resolution', 'not_resolved', 2],
    ['resolution', 'resolved', 3],
  ]);
});

it('creates independent process boundaries after idle and explicit reset, but deduplicates canonical body contexts', () => {
  const { measurement, events, advance } = fixture();
  const a = measurement.viewContent({
    path: '/zh-CN/introduction/',
    platform: 'ios',
    contentType: 'mdx',
  });
  const b = measurement.viewContent({
    path: '/zh-CN/introduction?docs_from=opaque#heading',
    platform: 'ios',
    contentType: 'mdx',
  });
  expect(a.doc_view_id).toBe(b.doc_view_id);
  const c = measurement.viewContent({
    path: '/zh-CN/introduction',
    platform: 'android',
    contentType: 'mdx',
  });
  expect(c.doc_view_id).not.toBe(b.doc_view_id);
  advance(30 * 60 * 1000);
  measurement.viewContent({ path: '/zh-CN/introduction', contentType: 'mdx' });
  measurement.reset();
  measurement.viewContent({ path: '/zh-CN/introduction', contentType: 'mdx' });
  expect(
    events.filter((event) => event.name === 'docs_journey_started'),
  ).toHaveLength(3);
});

it('attributes only a selected target and does not attribute another tab from a recent query', () => {
  const { measurement } = fixture();
  const search = measurement.startSearch({
    surface: 'search_page',
    query: 'Token',
  });
  const results = measurement.prepareResults(search, {
    count: 2,
    unit: 'document',
  });
  measurement.selectResult(results, {
    id: '/zh-CN/token',
    path: '/zh-CN/token',
    rank: 1,
    kind: 'document',
    method: 'mouse_new_tab',
  });
  expect(
    measurement.viewContent({ path: '/zh-CN/token', contentType: 'mdx' })
      .attribution_status,
  ).toBe('unknown');
  const other = fixture().measurement;
  expect(
    other.viewContent({ path: '/zh-CN/token', contentType: 'mdx' }).search_id,
  ).toBe(null);
  measurement.selectResult(results, {
    id: '/zh-CN/token',
    path: '/zh-CN/token',
    rank: 1,
    kind: 'document',
    method: 'keyboard',
  });
  measurement.leaveContent();
  expect(
    measurement.viewContent({ path: '/zh-CN/token', contentType: 'mdx' })
      .search_id,
  ).toBe(search.searchId);
});
