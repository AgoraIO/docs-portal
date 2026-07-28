import { describe, expect, it } from 'vitest';
import {
  getReferenceCenterContext,
  REFERENCE_CENTER_ENTRIES,
} from './reference-center-navigation';

describe('reference center navigation', () => {
  it('keeps the four primary links while routing resources through Reference', () => {
    expect(REFERENCE_CENTER_ENTRIES).toEqual([
      expect.objectContaining({
        href: '/zh-CN/api-reference/api',
        id: 'api',
      }),
      expect.objectContaining({ href: '/zh-CN/reference/sdks', id: 'sdks' }),
      expect.objectContaining({
        href: '/zh-CN/reference/recipes',
        id: 'recipes',
      }),
      expect.objectContaining({ href: '/zh-CN/reference/faq', id: 'faq' }),
    ]);
  });

  it.each([
    ['/zh-CN/api-reference/api', 'api'],
    ['/zh-CN/reference/sdks', 'sdks'],
    ['/zh-CN/reference/recipes/python-quickstart', 'recipes'],
    ['/zh-CN/reference/faq/integration/system_volume', 'faq'],
  ] as const)('resolves %s to the %s context', (activePath, context) => {
    expect(getReferenceCenterContext(activePath, 'zh-CN')).toBe(context);
  });

  it('does not apply the zh-CN reference center navigation to English', () => {
    expect(getReferenceCenterContext('/en/api-reference/api', 'en')).toBeNull();
  });
});
