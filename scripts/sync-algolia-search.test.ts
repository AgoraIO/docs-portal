import { afterEach, expect, it, vi } from 'vitest';

const { setSettings, waitForTask, updateDocuments } = vi.hoisted(() => ({
  setSettings: vi.fn(),
  waitForTask: vi.fn(),
  updateDocuments: vi.fn(),
}));
vi.mock('algoliasearch', () => ({
  algoliasearch: () => ({ setSettings, waitForTask }),
}));
vi.mock('fumadocs-core/search/algolia', () => ({ updateDocuments }));
vi.mock('../src/lib/search/algolia-records.server.ts', () => ({
  getAlgoliaDocsRecords: async () => [{ title: 'Documentation' }],
}));
vi.mock('../src/lib/site-region.ts', () => ({ DOCS_REGION: 'global' }));

afterEach(() => vi.unstubAllEnvs());

it('waits for searchable locale settings before copying them to the replacement index', async () => {
  vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
  vi.stubEnv('ALGOLIA_ADMIN_API_KEY', 'test-key');
  vi.stubEnv('ALGOLIA_INDEX_NAME', 'test-index');
  vi.stubEnv('ALGOLIA_SYNC_DISABLED', 'false');
  setSettings.mockResolvedValue({ taskID: 14 });
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  waitForTask.mockReturnValue(promise);
  const sync = import('./sync-algolia-search.mjs');
  await vi.waitFor(() =>
    expect(waitForTask).toHaveBeenCalledWith({
      indexName: 'test-index',
      taskID: 14,
    }),
  );
  expect(updateDocuments).not.toHaveBeenCalled();
  resolve();
  await sync;
  expect(
    setSettings.mock.calls[0][0].indexSettings.attributesForFaceting,
  ).toContain('filterOnly(locale)');
  expect(updateDocuments).toHaveBeenCalledWith(
    expect.anything(),
    'test-index',
    [{ title: 'Documentation' }],
  );
});
