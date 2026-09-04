import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('getAlgoliaSearchConfig', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('disables ranking v2 when the feature flag is missing', async () => {
    vi.stubEnv('VITE_DOCS_REGION', 'global');
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.stubEnv('VITE_SEARCH_RANKING_V2', '');

    const { getAlgoliaSearchConfig } = await import('./algolia-config');

    expect(getAlgoliaSearchConfig()).toMatchObject({ rankingV2: false });
  });

  it('disables ranking v2 when the feature flag is false', async () => {
    vi.stubEnv('VITE_DOCS_REGION', 'global');
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.stubEnv('VITE_SEARCH_RANKING_V2', 'false');

    const { getAlgoliaSearchConfig } = await import('./algolia-config');

    expect(getAlgoliaSearchConfig()).toMatchObject({ rankingV2: false });
  });

  it('enables ranking v2 when the feature flag is true', async () => {
    vi.stubEnv('VITE_DOCS_REGION', 'global');
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.stubEnv('VITE_SEARCH_RANKING_V2', 'true');

    const { getAlgoliaSearchConfig } = await import('./algolia-config');

    expect(getAlgoliaSearchConfig()).toMatchObject({ rankingV2: true });
  });

  it('keeps CN on Orama even when Algolia and ranking v2 are configured', async () => {
    vi.stubEnv('VITE_DOCS_REGION', 'cn');
    vi.stubEnv('VITE_ALGOLIA_APP_ID', 'test-app');
    vi.stubEnv('VITE_ALGOLIA_SEARCH_API_KEY', 'test-search-key');
    vi.stubEnv('VITE_SEARCH_RANKING_V2', 'true');

    const { getAlgoliaSearchConfig } = await import('./algolia-config');

    expect(getAlgoliaSearchConfig('cn')).toBeNull();
  });
});
