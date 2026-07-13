import { describe, expect, it } from 'vitest';
import {
  getDocsSearchProvider,
  shouldSyncAlgoliaSearch,
} from './search-provider';

describe('getDocsSearchProvider', () => {
  it('forces cn to Orama and lets global use Algolia when configured', () => {
    expect(getDocsSearchProvider('cn', true)).toBe('orama');
    expect(getDocsSearchProvider('cn', false)).toBe('orama');
    expect(getDocsSearchProvider('global', true)).toBe('algolia');
    expect(getDocsSearchProvider('global', false)).toBe('orama');
  });

  it('allows Algolia synchronization only for global deployments', () => {
    expect(shouldSyncAlgoliaSearch('global')).toBe(true);
    expect(shouldSyncAlgoliaSearch('cn')).toBe(false);
  });
});
