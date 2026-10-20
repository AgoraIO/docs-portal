import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DOC_VERSION_STORAGE_KEY,
  getStoredDocVersionSelections,
  parseDocVersionPreferences,
  setDocVersionPreference,
} from './doc-version-preference';

describe('documentation release preference', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('restores the saved version at the entry but preserves explicit old links', () => {
    setDocVersionPreference('test-api', 'v2');
    expect(
      JSON.parse(localStorage.getItem(DOC_VERSION_STORAGE_KEY) ?? '{}'),
    ).toEqual({ 'test-api': 'v2' });
    expect(
      getStoredDocVersionSelections('/en/api-reference/versioning-demo')[
        'test-api'
      ],
    ).toBe('v2');
    expect(
      getStoredDocVersionSelections('/en/api-reference/versioning-demo/v1')[
        'test-api'
      ],
    ).toBe('v1');
  });

  it('ignores corrupt or unpublished choices', () => {
    expect(parseDocVersionPreferences('{broken')).toEqual({});
    expect(parseDocVersionPreferences('null')).toEqual({});
    localStorage.setItem(DOC_VERSION_STORAGE_KEY, '{"test-api":"removed"}');
    expect(getStoredDocVersionSelections('')['test-api']).toBe('v1');
    setDocVersionPreference('test-api', 'unpublished');
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"test-api":"removed"}',
    );
  });
});
