import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import {
  createDocsMeasurement,
  type DocsMeasurement,
  type MeasurementEvent,
  type ResultsSnapshot,
  type Selection,
} from '@/lib/analytics/docs-measurement';
import { normalizeMeilisearchHit } from '@/lib/search/meilisearch-client';
import { DocsSearchDialog } from './DocsSearchDialog';

let measurement: DocsMeasurement;
let events: MeasurementEvent[];
vi.mock('@/lib/analytics/measurement', () => ({
  getDocsMeasurement: () => measurement,
  measurementEnabled: () => false,
  invitationAllowed: () => false,
  markInvitationVisible: vi.fn(),
  selectDocsResult: (
    snapshot: ResultsSnapshot | undefined,
    result: Selection,
  ) => {
    if (snapshot) measurement.selectResult(snapshot, result);
    return result.path;
  },
}));
vi.mock('@/lib/analytics/visibility', () => ({
  observeVisible: (_element: HTMLElement, visible: () => void) => {
    visible();
    return () => {};
  },
}));

const empty = { groups: [], totalHits: 0, totalPages: 0, page: 1, facets: {} };
function response(title: string) {
  return {
    ...empty,
    totalHits: 1,
    totalPages: 1,
    groups: [
      {
        pageUrl: '/realtime-media/rtc/token',
        title,
        platform: ['web'],
        docType: 'docs',
        sections: [
          normalizeMeilisearchHit({
            id: title,
            url: '/realtime-media/rtc/token',
            pageTitle: title,
            sectionTitle: title,
            content: 'Token guide',
            headingPath: [],
            locale: 'zh-CN',
            docType: 'docs',
            audience: [],
            status: 'published',
            hidden: false,
          }),
        ],
      },
    ],
  };
}
beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  events = [];
  let id = 0;
  measurement = createDocsMeasurement({
    emit: (event) => events.push(event),
    now: Date.now,
    id: () => `id-${++id}`,
    environment: 'local',
    appRelease: 'test',
    entryPath: '/introduction',
  });
});
afterEach(() => vi.restoreAllMocks());

async function open() {
  const root = createRootRoute({
    component: () => (
      <AppProviders>
        <DocsSearchDialog locale="zh-CN" loadPages={async () => []} />
      </AppProviders>
    ),
  });
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(<RouterProvider router={router} />);
  fireEvent.click(await screen.findByRole('button', { name: '搜索文档' }));
  return screen.getByPlaceholderText('搜索文档、API、指南...');
}
const presented = () =>
  events.filter((event) => event.name === 'docs_search_results_presented');

it('records the displayed result and its selection under the submitted search', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const query = new URL(
      String(input),
      'https://docs.example',
    ).searchParams.get('q');
    return Response.json(query ? response('Token 配置') : empty);
  });
  fireEvent.input(await open(), { target: { value: 'Token' } });
  await screen.findAllByText('Token 配置');
  await waitFor(() => expect(presented()).toHaveLength(1));
  fireEvent.click(screen.getAllByText('Token 配置')[0]);
  const submitted = events.find(
    (event) => event.name === 'docs_search_submitted',
  );
  const selected = events.find(
    (event) => event.name === 'docs_search_result_selected',
  );
  expect(presented()[0].properties).toMatchObject({
    search_id: submitted?.properties.search_id,
    query_redacted: 'Token',
    result_count: 1,
  });
  expect(selected?.properties).toMatchObject({
    search_id: submitted?.properties.search_id,
    results_view_id: presented()[0].properties.results_view_id,
    result_rank: 1,
  });
});

it('records a successful empty response with query and filter context', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    Response.json(empty),
  );
  fireEvent.input(await open(), { target: { value: 'missingMethod' } });
  await waitFor(() => expect(presented()).toHaveLength(1));
  expect(presented()[0].properties).toMatchObject({
    surface: 'search_dialog',
    query_redacted: 'missingMethod',
    result_count: 0,
    total_hits: 0,
    filter_product: null,
    filter_platform: null,
  });
  expect(events.some((event) => event.name === 'docs_search_failed')).toBe(
    false,
  );
});

it('discards a superseded response without recording an empty or stale presentation', async () => {
  let finishOld: (value: Response) => void = () => {};
  const old = new Promise<Response>((resolve) => {
    finishOld = resolve;
  });
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const query = new URL(
      String(input),
      'https://docs.example',
    ).searchParams.get('q');
    if (query === 'old') return old;
    return Response.json(query ? response('New result') : empty);
  });
  const input = await open();
  fireEvent.input(input, { target: { value: 'old' } });
  await waitFor(() =>
    expect(
      events.some((event) => event.properties.query_redacted === 'old'),
    ).toBe(true),
  );
  fireEvent.input(input, { target: { value: 'new' } });
  await screen.findAllByText('New result');
  finishOld(Response.json(empty));
  await waitFor(() => expect(presented()).toHaveLength(1));
  expect(presented()[0].properties.query_redacted).toBe('new');
});

it('does not attribute a full-search action for a new draft to the preceding search', async () => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    Response.json(empty),
  );
  const input = await open();
  fireEvent.input(input, { target: { value: 'Token' } });
  await waitFor(() => expect(presented()).toHaveLength(1));
  fireEvent.input(input, { target: { value: 'new draft' } });
  fireEvent.click(screen.getByRole('button', { name: '查看全部搜索结果' }));
  expect(
    events.filter((event) => event.name === 'docs_search_recovery_selected'),
  ).toHaveLength(0);
});
