import { redirect } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { preserveRedirectSearch } from './docs-redirect-url';

describe('preserveRedirectSearch', () => {
  it.each([
    [
      '/next',
      { hash: '其他错误码-1' },
      true,
      '/next#%E5%85%B6%E4%BB%96%E9%94%99%E8%AF%AF%E7%A0%81-1',
    ],
    [
      '/next',
      { hash: 'appintoolbar', searchStr: '?from=legacy' },
      true,
      '/next?from=legacy#appintoolbar',
    ],
    ['/next', { hash: '#details' }, true, '/next#details'],
    ['/next', { hash: '%E5%85%B6%E4%BB%96' }, true, '/next#%E5%85%B6%E4%BB%96'],
    [
      '/next',
      { hash: 'details', searchStr: '?from=legacy' },
      false,
      '/next#details',
    ],
    [
      '/next?platform=web',
      { hash: 'details', searchStr: '?platform=android' },
      true,
      '/next?platform=web#details',
    ],
    [
      '/next#target',
      { hash: 'source', searchStr: '?from=legacy' },
      true,
      '/next?from=legacy#target',
    ],
    [
      '/next?platform=web#target',
      { hash: 'source', searchStr: '?from=legacy' },
      false,
      '/next?platform=web#target',
    ],
    [
      '/next#',
      { hash: 'source', searchStr: '?from=legacy' },
      true,
      '/next?from=legacy#',
    ],
    [
      '/next?',
      { hash: 'details', searchStr: '?from=legacy' },
      true,
      '/next?#details',
    ],
    [
      '/next#target?part',
      { searchStr: '?from=legacy' },
      true,
      '/next?from=legacy#target?part',
    ],
    ['/next', {}, true, '/next'],
    ['/next', { hash: '' }, true, '/next'],
    [
      'https://docs.example.com/next',
      { hash: '标题' },
      true,
      'https://docs.example.com/next#%E6%A0%87%E9%A2%98',
    ],
    [
      '//docs.example.com/next',
      { hash: 'details' },
      true,
      '//docs.example.com/next#details',
    ],
  ] as const)(
    'combines %s and %j (preserve search: %s)',
    (href, location, preserveSearch, expected) => {
      const result = preserveRedirectSearch(href, location, preserveSearch);
      expect(result).toBe(expected);
      expect(redirect({ href: result }).headers.get('Location')).toBe(expected);
    },
  );
});
