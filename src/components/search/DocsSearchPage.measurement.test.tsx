import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  createDocsMeasurement,
  type DocsMeasurement,
  type MeasurementEvent,
} from '@/lib/analytics/docs-measurement';
import { searchCnDocsPage } from '@/lib/search/cn-search-page';
import { parseSearchPageState } from '@/lib/search/search-page-state';
import { DocsSearchPage } from './DocsSearchPage';

let measurement: DocsMeasurement;
let events: MeasurementEvent[];
vi.mock('@/lib/analytics/measurement', () => ({
  getDocsMeasurement: () => measurement,
  measurementEnabled: () => true,
  invitationAllowed: () => false,
  markInvitationVisible: vi.fn(),
}));
vi.mock('@/lib/analytics/visibility', () => ({
  observeVisible: (_element: HTMLElement, visible: () => void) => {
    visible();
    return () => {};
  },
}));
vi.mock('@/lib/search/cn-search-page', async (original) => ({
  ...(await original<typeof import('@/lib/search/cn-search-page')>()),
  searchCnDocsPage: vi.fn(),
  loadCnSearchCatalog: vi.fn().mockResolvedValue({}),
}));
beforeEach(() => {
  events = [];
  vi.mocked(searchCnDocsPage).mockReset();
  let sequence = 0;
  measurement = createDocsMeasurement({
    emit: (event) => events.push(event),
    now: () => Date.now(),
    id: () => `id-${++sequence}`,
    environment: 'local',
    appRelease: 'test',
    entryPath: '/zh-CN/search',
  });
});
it('records the rendered error, then records an empty successful retry under one logical search', async () => {
  vi.mocked(searchCnDocsPage)
    .mockRejectedValueOnce(new Error('unavailable'))
    .mockResolvedValue({
      groups: [],
      facets: {},
      page: 1,
      totalHits: 0,
      totalPages: 0,
    });
  render(
    <DocsSearchPage
      state={parseSearchPageState({ q: 'Token' })}
      onChange={vi.fn()}
    />,
  );
  await screen.findByRole('button', { name: '重新搜索' });
  await waitFor(() =>
    expect(
      events.filter((event) => event.name === 'docs_search_failed'),
    ).toHaveLength(1),
  );
  fireEvent.click(screen.getByRole('button', { name: '重新搜索' }));
  await waitFor(() =>
    expect(
      events.filter((event) => event.name === 'docs_search_results_presented'),
    ).toHaveLength(1),
  );
  expect(
    events.filter((event) => event.name === 'docs_search_submitted'),
  ).toHaveLength(1);
  expect(
    events.find((event) => event.name === 'docs_search_results_presented')
      ?.properties.result_count,
  ).toBe(0);
});
it('starts a fresh search for the same-query retry after a process/account reset', async () => {
  vi.mocked(searchCnDocsPage).mockRejectedValue(new Error('unavailable'));
  render(
    <DocsSearchPage
      state={parseSearchPageState({ q: 'Token' })}
      onChange={vi.fn()}
    />,
  );
  await screen.findByRole('button', { name: '重新搜索' });
  // The button commits before the visibility effect records the failure.
  // Reset only after the first journey has emitted its failure event.
  await waitFor(() =>
    expect(
      events.filter((event) => event.name === 'docs_search_failed'),
    ).toHaveLength(1),
  );
  measurement.reset();
  fireEvent.click(screen.getByRole('button', { name: '重新搜索' }));
  await waitFor(() =>
    expect(
      events.filter((event) => event.name === 'docs_search_failed'),
    ).toHaveLength(2),
  );
  const searches = events.filter(
    (event) => event.name === 'docs_search_submitted',
  );
  expect(searches).toHaveLength(2);
  expect(searches[0].properties.journey_id).not.toBe(
    searches[1].properties.journey_id,
  );
});

it('associates an intermediate restore failure with the real failed request', async () => {
  vi.mocked(searchCnDocsPage).mockRejectedValueOnce(
    new Error('first page unavailable'),
  );
  render(
    <DocsSearchPage
      state={parseSearchPageState({ q: 'Token', loaded: 3 })}
      onChange={vi.fn()}
    />,
  );
  await waitFor(() =>
    expect(events.some((event) => event.name === 'docs_search_failed')).toBe(
      true,
    ),
  );
  expect(
    events.find((event) => event.name === 'docs_search_failed')?.properties
      .request_id,
  ).toBe(vi.mocked(searchCnDocsPage).mock.calls[0][2]?.['X-Docs-Request-Id']);
  expect(
    vi.mocked(searchCnDocsPage).mock.calls[0][2]?.['X-Docs-Request-Purpose'],
  ).toBe('results');
});

it('does not invent a network request identifier for a fully cached range', async () => {
  vi.mocked(searchCnDocsPage).mockImplementation(async (state) => ({
    groups: [],
    facets: {},
    page: state.page,
    totalHits: 2,
    totalPages: 2,
  }));
  const view = render(
    <DocsSearchPage
      state={parseSearchPageState({ q: 'Token', loaded: 2 })}
      onChange={vi.fn()}
    />,
  );
  await waitFor(() =>
    expect(
      events.some((event) => event.name === 'docs_search_results_presented'),
    ).toBe(true),
  );
  const calls = vi.mocked(searchCnDocsPage).mock.calls.length;
  view.rerender(
    <DocsSearchPage
      state={parseSearchPageState({ q: 'Token' })}
      onChange={vi.fn()}
    />,
  );
  await waitFor(() =>
    expect(
      events.filter((event) => event.name === 'docs_search_results_presented'),
    ).toHaveLength(2),
  );
  expect(vi.mocked(searchCnDocsPage).mock.calls).toHaveLength(calls);
  expect(
    events
      .filter((event) => event.name === 'docs_search_results_presented')
      .at(-1)?.properties.request_id,
  ).toBeNull();
});

afterEach(() => vi.restoreAllMocks());
it('measures cached pagination from restoration, excluding time spent reading', async () => {
  let clock = 1000;
  vi.spyOn(Date, 'now').mockImplementation(() => clock);
  vi.mocked(searchCnDocsPage).mockImplementation(async (state) => ({
    groups: [],
    facets: {},
    page: state.page,
    totalHits: 3,
    totalPages: 3,
  }));
  const view = render(
    <DocsSearchPage
      state={parseSearchPageState({ q: 'Token', loaded: 3 })}
      onChange={vi.fn()}
    />,
  );
  await waitFor(() =>
    expect(
      events.filter((event) => event.name === 'docs_search_results_presented'),
    ).toHaveLength(1),
  );
  clock = 11000;
  view.rerender(
    <DocsSearchPage
      state={parseSearchPageState({ q: 'Token', loaded: 2 })}
      onChange={vi.fn()}
    />,
  );
  await waitFor(() =>
    expect(
      events.filter((event) => event.name === 'docs_search_results_presented'),
    ).toHaveLength(2),
  );
  expect(
    events
      .filter((event) => event.name === 'docs_search_results_presented')
      .at(-1)?.properties.page_results_visible_ms,
  ).toBe(0);
});
