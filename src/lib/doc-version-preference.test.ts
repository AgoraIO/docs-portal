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
    setDocVersionPreference('convoai-api', 'v2');
    expect(
      JSON.parse(localStorage.getItem(DOC_VERSION_STORAGE_KEY) ?? '{}'),
    ).toEqual({ convoai: 'v2' });
    expect(
      getStoredDocVersionSelections(
        '/en/api-reference/api-ref/conversational-ai/documentation-versions',
      )['convoai-api'],
    ).toBe('v2');
    expect(
      getStoredDocVersionSelections(
        '/en/api-reference/api-ref/conversational-ai/authentication',
      )['convoai-api'],
    ).toBe('v1');
  });

  it('ignores corrupt or unpublished choices', () => {
    expect(parseDocVersionPreferences('{broken')).toEqual({});
    expect(parseDocVersionPreferences('null')).toEqual({});
    localStorage.setItem(DOC_VERSION_STORAGE_KEY, '{"convoai":"removed"}');
    expect(getStoredDocVersionSelections('')['convoai-api']).toBe('v1');
    setDocVersionPreference('convoai-api', 'unpublished');
    expect(localStorage.getItem(DOC_VERSION_STORAGE_KEY)).toBe(
      '{"convoai":"removed"}',
    );
  });

  it('shares a rollout key between ordinary guides and API docs without rewriting it on a shared-link arrival', () => {
    setDocVersionPreference('convoai-api', 'v1');
    expect(
      getStoredDocVersionSelections('/en/ai/documentation-versions')[
        'convoai-guides'
      ],
    ).toBe('v1');
    expect(
      getStoredDocVersionSelections('/en/ai/platform/build/managed-mode')[
        'convoai-guides'
      ],
    ).toBe('v2');
    expect(
      JSON.parse(localStorage.getItem(DOC_VERSION_STORAGE_KEY) ?? '{}'),
    ).toEqual({ convoai: 'v1' });
    setDocVersionPreference('convoai-guides', 'v2');
    expect(
      getStoredDocVersionSelections(
        '/en/api-reference/api-ref/conversational-ai/documentation-versions',
      )['convoai-api'],
    ).toBe('v2');
  });
});
