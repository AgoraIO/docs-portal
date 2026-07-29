import { describe, expect, it } from 'vitest';
import { getDocsSidebarMode } from './reference-center-navigation';

describe('reference center navigation', () => {
  it.each([
    ['/zh-CN/api-reference/api', 'api'],
    ['/zh-CN/reference/sdks', 'reference'],
    ['/zh-CN/reference/recipes/python-quickstart', 'reference'],
    ['/zh-CN/reference/faq/integration/system_volume', 'reference'],
  ] as const)('resolves %s to the %s context', (activePath, context) => {
    expect(getDocsSidebarMode(activePath, 'zh-CN')).toBe(context);
  });

  it('does not apply the zh-CN reference center navigation to English', () => {
    expect(getDocsSidebarMode('/en/api-reference/api', 'en')).toBeNull();
  });
});
